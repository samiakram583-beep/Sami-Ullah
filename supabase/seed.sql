-- ====================================================================
-- U.S. Barber - Catonsville, MD
-- Supabase Database Seed Data
-- ====================================================================

-- 1. Business Hours (Verifiable Official Schedule)
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
SET open_time = EXCLUDED.open_time,
    close_time = EXCLUDED.close_time,
    is_closed = EXCLUDED.is_closed;

-- 2. Placeholder Services (Clearly marked and editable in Admin Dashboard)
INSERT INTO public.services (name, slug, description, price, duration_minutes, category, image_url, active, display_order)
VALUES
    (
        'Classic Haircut [Placeholder]',
        'classic-haircut',
        'Precision clipper and shear haircut tailored to your preferred style, neck shave, and hot towel finish.',
        35.00,
        30,
        'Haircuts',
        '/images/barber_craft_cut_1790211484330.jpg',
        true,
        1
    ),
    (
        'Beard Trim & Sculpt [Placeholder]',
        'beard-trim-sculpt',
        'Detailed beard shaping, line cleanup, trimming to length, and conditioning balm application.',
        25.00,
        25,
        'Beard & Grooming',
        '/images/barber_hot_towel_shave_1790211495750.jpg',
        true,
        2
    ),
    (
        'Hot Towel Straight Razor Shave [Placeholder]',
        'hot-towel-shave',
        'Traditional straight razor shave with essential oil pre-shave, multiple hot steaming towels, rich lather, and cold towel close.',
        35.00,
        35,
        'Beard & Grooming',
        '/images/barber_hot_towel_shave_1790211495750.jpg',
        true,
        3
    ),
    (
        'The Executive Service [Placeholder]',
        'the-executive',
        'Signature full-grooming package including classic tailored haircut, hot towel straight razor neck shave, beard sculpt or clean shave, and styling.',
        65.00,
        55,
        'Packages',
        '/images/hero_us_barber_1790211473323.jpg',
        true,
        4
    ),
    (
        'Senior & Junior Cut [Placeholder]',
        'senior-junior-cut',
        'Precision haircut crafted for our valued seniors (65+) and young gentlemen under 12.',
        28.00,
        30,
        'Haircuts',
        '/images/shop_interior_details_1790211506738.jpg',
        true,
        5
    )
ON CONFLICT (slug) DO NOTHING;

-- 3. Staff / Barbers Placeholders (Editable through Admin Dashboard)
INSERT INTO public.barbers (name, bio, image_url, specialties, active, display_order)
VALUES
    (
        'Master Barber (Chair 1) [Add Profile]',
        'Experienced in classic American tapers, fades, and traditional straight razor shaves. Update this profile in the Admin Dashboard.',
        '/images/barber_craft_cut_1790211484330.jpg',
        ARRAY['Classic Cuts', 'Fades', 'Hot Towel Shave'],
        true,
        1
    ),
    (
        'Senior Barber (Chair 2) [Add Profile]',
        'Specializing in precision scissor work, beard sculpts, and modern grooming techniques. Update this profile in the Admin Dashboard.',
        '/images/barber_hot_towel_shave_1790211495750.jpg',
        ARRAY['Precision Scissor Cuts', 'Beard Sculpting', 'Styling'],
        true,
        2
    );

-- 4. Gallery Images
INSERT INTO public.gallery_images (title, image_url, alt_text, display_order, active)
VALUES
    ('Craftsmanship & Shears', '/images/barber_craft_cut_1790211484330.jpg', 'Close-up of master barber precision haircut in Catonsville', 1, true),
    ('Traditional Hot Towel Shave', '/images/barber_hot_towel_shave_1790211495750.jpg', 'Classic hot towel straight razor shave experience at U.S. Barber', 2, true),
    ('Shop Interior & Barber Chairs', '/images/hero_us_barber_1790211473323.jpg', 'Vintage leather barber chairs and mahogany woodwork at U.S. Barber', 3, true),
    ('Grooming Tonics & Artisanal Tools', '/images/shop_interior_details_1790211506738.jpg', 'Grooming pomades and barber accessories', 4, true);

-- 5. Shop Settings & Booking Rules
INSERT INTO public.shop_settings (key, value)
VALUES
    ('general', '{
        "shop_name": "U.S. Barber",
        "tagline": "CLASSIC CRAFT. MODERN GROOMING.",
        "phone": "+1 (410) 788-5156",
        "address": "730 Frederick Rd, Suite 103, Catonsville, MD 21228",
        "google_maps_url": "https://maps.google.com/?q=U.S.+Barber+730+Frederick+Rd+Suite+103+Catonsville+MD+21228",
        "timezone": "America/New_York",
        "email": "contact@usbarbercatonsville.com"
    }'::jsonb),
    ('booking_rules', '{
        "min_notice_minutes": 60,
        "max_advance_days": 30,
        "cancellation_window_hours": 2,
        "slot_interval_minutes": 30
    }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
