-- ====================================================================
-- U.S. Barber (Catonsville, MD) - Complete Supabase Setup
-- Project: jgcidyssiktwcdstrkxw
-- Copy and paste this script directly into Supabase Dashboard -> SQL Editor -> Run
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 35.00,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    category TEXT NOT NULL DEFAULT 'Haircuts',
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BARBERS TABLE
CREATE TABLE IF NOT EXISTS public.barbers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    specialties TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BUSINESS HOURS TABLE
CREATE TABLE IF NOT EXISTS public.business_hours (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
    day_name TEXT NOT NULL,
    open_time TIME NOT NULL DEFAULT '08:00:00',
    close_time TIME NOT NULL DEFAULT '18:00:00',
    is_closed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BLOCKED DATES TABLE
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    blocked_date DATE NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. APPOINTMENTS TABLE (The primary booking table requested)
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    confirmation_code TEXT NOT NULL UNIQUE,
    customer_id TEXT,
    service_id TEXT NOT NULL,
    barber_id TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appts_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appts_code ON public.appointments(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_appts_email ON public.appointments(customer_email);
CREATE INDEX IF NOT EXISTS idx_appts_phone ON public.appointments(customer_phone);

-- 7. GALLERY IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id TEXT PRIMARY KEY DEFAULT 'current_settings',
    shop_name TEXT NOT NULL DEFAULT 'U.S. Barber',
    tagline TEXT NOT NULL DEFAULT 'Premier Artisanal Grooming & Precision Cuts in Catonsville',
    address TEXT NOT NULL DEFAULT '730 Frederick Rd, Suite 103, Catonsville, MD 21228',
    phone TEXT NOT NULL DEFAULT '+1 (410) 788-5156',
    email TEXT NOT NULL DEFAULT 'contact@usbarbercatonsville.com',
    google_maps_url TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=730+Frederick+Rd+Suite+103+Catonsville+MD+21228',
    min_notice_minutes INTEGER NOT NULL DEFAULT 60,
    max_advance_days INTEGER NOT NULL DEFAULT 30,
    cancellation_window_hours INTEGER NOT NULL DEFAULT 2,
    slot_interval_minutes INTEGER NOT NULL DEFAULT 30,
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplicates
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view services" ON public.services;
    DROP POLICY IF EXISTS "Public can view barbers" ON public.barbers;
    DROP POLICY IF EXISTS "Public can view business_hours" ON public.business_hours;
    DROP POLICY IF EXISTS "Public can view blocked_dates" ON public.blocked_dates;
    DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery_images;
    DROP POLICY IF EXISTS "Public can view settings" ON public.shop_settings;
    DROP POLICY IF EXISTS "Public can insert appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Public can read appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Public can update own appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Allow public read of active services, barbers, hours, gallery, settings
CREATE POLICY "Public can view services" ON public.services FOR ALL USING (true);
CREATE POLICY "Public can view barbers" ON public.barbers FOR ALL USING (true);
CREATE POLICY "Public can view business_hours" ON public.business_hours FOR ALL USING (true);
CREATE POLICY "Public can view blocked_dates" ON public.blocked_dates FOR ALL USING (true);
CREATE POLICY "Public can view gallery" ON public.gallery_images FOR ALL USING (true);
CREATE POLICY "Public can view settings" ON public.shop_settings FOR ALL USING (true);

-- Allow public to book appointments (INSERT) and view appointments
CREATE POLICY "Public can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Public can update own appointments" ON public.appointments FOR UPDATE USING (true);

-- Allow public to send contact messages
CREATE POLICY "Public can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read contact messages" ON public.contact_messages FOR SELECT USING (true);

-- 11. ATOMIC BOOKING FUNCTION (Double booking prevention)
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_service_id TEXT,
    p_barber_id TEXT,
    p_appointment_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_notes TEXT DEFAULT NULL,
    p_customer_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lock_key BIGINT;
    v_conflict_count INTEGER;
    v_new_id TEXT;
    v_code TEXT;
BEGIN
    v_lock_key := ('x' || substr(md5(p_barber_id || p_appointment_date::TEXT), 1, 15))::BIT(64)::BIGINT;
    PERFORM pg_advisory_xact_lock(v_lock_key);

    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.appointments
    WHERE barber_id = p_barber_id
      AND appointment_date = p_appointment_date
      AND status NOT IN ('cancelled', 'no_show')
      AND (
        (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      );

    IF v_conflict_count > 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Sorry, this time was just booked. Please choose another time.'
        );
    END IF;

    v_code := 'USB-' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
    v_new_id := gen_random_uuid()::TEXT;

    INSERT INTO public.appointments (
        id,
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
        v_new_id,
        v_code,
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
    );

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', v_new_id,
        'confirmation_code', v_code
    );
END;
$$;

-- 12. SEED INITIAL SERVICES & BARBERS
INSERT INTO public.services (id, name, slug, description, price, duration_minutes, category, image_url, active, display_order)
VALUES
    ('srv-1', 'Classic Haircut [Placeholder]', 'classic-haircut', 'Precision clipper and shear haircut tailored to your preferred style, neck shave, and hot towel finish.', 35.00, 30, 'Haircuts', '/images/classic-haircut.jpg', true, 1),
    ('srv-2', 'Beard Trim & Sculpt [Placeholder]', 'beard-trim-sculpt', 'Detailed beard shaping, line cleanup, trimming to length, and conditioning balm application.', 25.00, 25, 'Beard & Grooming', '/images/beard-trim.jpg', true, 2),
    ('srv-3', 'Hot Towel Straight Razor Shave [Placeholder]', 'hot-towel-shave', 'Traditional straight razor shave with essential oil pre-shave, steaming hot towels, rich warm lather, and cooling splash.', 35.00, 35, 'Beard & Grooming', '/images/hot-towel-shave.jpg', true, 3),
    ('srv-4', 'The Executive Package [Placeholder]', 'the-executive-package', 'Full signature haircut, complete hot towel straight razor neck shave, beard sculpt, and scalp treatment.', 60.00, 55, 'Packages', '/images/executive-service.jpg', true, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.barbers (id, name, bio, image_url, specialties, active, display_order)
VALUES
    ('brb-1', 'Master Barber [Placeholder]', 'Veteran master barber specializing in heritage scissors cuts, precise fades, and traditional straight razor shaves.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', ARRAY['Skin Fades', 'Classic Tapers', 'Hot Towel Shave'], true, 1),
    ('brb-2', 'Artisan Stylist [Placeholder]', 'Dedicated to modern executive hairstyles, beard craftsmanship, and hair restoration.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', ARRAY['Beard Sculpting', 'Scissor Work', 'Executive Styling'], true, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.business_hours (day_of_week, day_name, open_time, close_time, is_closed)
VALUES
    (1, 'Monday', '08:00:00', '18:00:00', false),
    (2, 'Tuesday', '08:00:00', '18:00:00', false),
    (3, 'Wednesday', '08:00:00', '18:00:00', false),
    (4, 'Thursday', '08:00:00', '18:00:00', false),
    (5, 'Friday', '08:00:00', '18:00:00', false),
    (6, 'Saturday', '08:00:00', '17:00:00', false),
    (0, 'Sunday', '09:00:00', '16:00:00', false)
ON CONFLICT (day_of_week) DO UPDATE
SET open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;

INSERT INTO public.shop_settings (id, shop_name, phone, address, email)
VALUES ('current_settings', 'U.S. Barber', '+1 (410) 788-5156', '730 Frederick Rd, Suite 103, Catonsville, MD 21228', 'contact@usbarbercatonsville.com')
ON CONFLICT (id) DO NOTHING;
