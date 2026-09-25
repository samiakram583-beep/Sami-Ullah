-- ====================================================================
-- U.S. Barber - Catonsville, MD
-- Supabase PostgreSQL Schema & Security Policies
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. ENUM & STATUS DOMAINS
-- Table: profiles (Extended user profiles linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email & role
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    category TEXT NOT NULL DEFAULT 'Haircuts',
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_active_order ON public.services(active, display_order);

-- 4. BARBERS TABLE
CREATE TABLE IF NOT EXISTS public.barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    specialties TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_barbers_active_order ON public.barbers(active, display_order);

-- 5. BUSINESS HOURS TABLE
CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon, ..., 6=Sat
    day_name TEXT NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (close_time > open_time OR is_closed = true)
);

-- 6. BLOCKED DATES TABLE
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocked_date DATE NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON public.blocked_dates(blocked_date);

-- 7. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confirmation_code TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_appointments_date_barber ON public.appointments(appointment_date, barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_code ON public.appointments(confirmation_code);

-- 8. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_active_order ON public.gallery_images(active, display_order);

-- 9. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);

-- 10. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- STORED PROCEDURE: ATOMIC DOUBLE-BOOKING PREVENTION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_service_id UUID,
    p_barber_id UUID,
    p_appointment_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_notes TEXT DEFAULT NULL,
    p_customer_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_is_blocked BOOLEAN;
    v_day_of_week INTEGER;
    v_is_shop_closed BOOLEAN;
    v_open_time TIME;
    v_close_time TIME;
    v_conflict_count INTEGER;
    v_service_active BOOLEAN;
    v_barber_active BOOLEAN;
    v_conf_code TEXT;
    v_new_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Check service validity
    SELECT active INTO v_service_active FROM public.services WHERE id = p_service_id;
    IF v_service_active IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Selected service is currently unavailable.');
    END IF;

    -- 2. Check barber validity
    SELECT active INTO v_barber_active FROM public.barbers WHERE id = p_barber_id;
    IF v_barber_active IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Selected barber is currently unavailable.');
    END IF;

    -- 3. Check blocked dates
    SELECT EXISTS (
        SELECT 1 FROM public.blocked_dates WHERE blocked_date = p_appointment_date
    ) INTO v_is_blocked;
    IF v_is_blocked THEN
        RETURN jsonb_build_object('success', false, 'error', 'The shop is closed on the selected date.');
    END IF;

    -- 4. Check business hours
    v_day_of_week := EXTRACT(DOW FROM p_appointment_date);
    SELECT is_closed, open_time, close_time 
    INTO v_is_shop_closed, v_open_time, v_close_time
    FROM public.business_hours
    WHERE day_of_week = v_day_of_week;

    IF v_is_shop_closed IS TRUE OR p_start_time < v_open_time OR p_end_time > v_close_time THEN
        RETURN jsonb_build_object('success', false, 'error', 'The requested slot is outside shop operating hours.');
    END IF;

    -- 5. Exclusive Advisory Lock on (barber_id + date) to serialize booking requests
    -- Prevents race conditions during simultaneous checkout attempts
    PERFORM pg_advisory_xact_lock(
        hashtext(p_barber_id::text || ':' || p_appointment_date::text)
    );

    -- 6. Check for overlapping existing active bookings
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.appointments
    WHERE barber_id = p_barber_id
      AND appointment_date = p_appointment_date
      AND status NOT IN ('cancelled', 'no_show')
      AND (
          (start_time < p_end_time AND end_time > p_start_time)
      );

    IF v_conflict_count > 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sorry, this time was just booked. Please choose another time.');
    END IF;

    -- 7. Generate friendly confirmation code (e.g. USB-84729)
    v_conf_code := 'USB-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

    -- 8. Insert appointment record
    INSERT INTO public.appointments (
        confirmation_code,
        customer_id,
        service_id,
        barber_id,
        appointment_date,
        start_time,
        end_time,
        customer_name,
        customer_email,
        customer_phone,
        notes,
        status
    ) VALUES (
        v_conf_code,
        p_customer_id,
        p_service_id,
        p_barber_id,
        p_appointment_date,
        p_start_time,
        p_end_time,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_notes,
        'confirmed'
    ) RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', v_new_id,
        'confirmation_code', v_conf_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public read user profiles basic" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- 2. Services Policies
CREATE POLICY "Public read active services" ON public.services
    FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "Admin manage services" ON public.services
    FOR ALL USING (public.is_admin());

-- 3. Barbers Policies
CREATE POLICY "Public read active barbers" ON public.barbers
    FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "Admin manage barbers" ON public.barbers
    FOR ALL USING (public.is_admin());

-- 4. Business Hours Policies
CREATE POLICY "Public read business hours" ON public.business_hours
    FOR SELECT USING (true);

CREATE POLICY "Admin manage business hours" ON public.business_hours
    FOR ALL USING (public.is_admin());

-- 5. Blocked Dates Policies
CREATE POLICY "Public read blocked dates" ON public.blocked_dates
    FOR SELECT USING (true);

CREATE POLICY "Admin manage blocked dates" ON public.blocked_dates
    FOR ALL USING (public.is_admin());

-- 6. Appointments Policies
CREATE POLICY "Customers view own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());

CREATE POLICY "Customers insert appointments" ON public.appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can cancel own appointments" ON public.appointments
    FOR UPDATE USING (
        auth.uid() = customer_id AND status != 'cancelled'
    ) WITH CHECK (
        status = 'cancelled'
    );

CREATE POLICY "Admin manage all appointments" ON public.appointments
    FOR ALL USING (public.is_admin());

-- 7. Gallery Policies
CREATE POLICY "Public read active gallery" ON public.gallery_images
    FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "Admin manage gallery" ON public.gallery_images
    FOR ALL USING (public.is_admin());

-- 8. Contact Messages Policies
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage contact messages" ON public.contact_messages
    FOR ALL USING (public.is_admin());

-- 9. Shop Settings Policies
CREATE POLICY "Public read shop settings" ON public.shop_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin manage shop settings" ON public.shop_settings
    FOR ALL USING (public.is_admin());

-- ====================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
