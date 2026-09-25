import {
  UserProfile,
  ServiceItem,
  BarberItem,
  BusinessHoursItem,
  BlockedDateItem,
  AppointmentItem,
  GalleryImageItem,
  ContactMessageItem,
  ShopSettings,
} from '../../types';

// Default initial data matching Catonsville Maryland U.S. Barber facts
const DEFAULT_BUSINESS_HOURS: BusinessHoursItem[] = [
  { id: 'bh-1', day_of_week: 1, day_name: 'Monday', open_time: '08:00', close_time: '18:00', is_closed: false },
  { id: 'bh-2', day_of_week: 2, day_name: 'Tuesday', open_time: '08:00', close_time: '18:00', is_closed: false },
  { id: 'bh-3', day_of_week: 3, day_name: 'Wednesday', open_time: '08:00', close_time: '18:00', is_closed: false },
  { id: 'bh-4', day_of_week: 4, day_name: 'Thursday', open_time: '08:00', close_time: '18:00', is_closed: false },
  { id: 'bh-5', day_of_week: 5, day_name: 'Friday', open_time: '08:00', close_time: '18:00', is_closed: false },
  { id: 'bh-6', day_of_week: 6, day_name: 'Saturday', open_time: '08:00', close_time: '17:00', is_closed: false },
  { id: 'bh-0', day_of_week: 0, day_name: 'Sunday', open_time: '09:00', close_time: '16:00', is_closed: false },
];

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Classic Haircut [Placeholder]',
    slug: 'classic-haircut',
    description: 'Precision clipper and shear haircut tailored to your preferred style, neck shave, and hot towel finish.',
    price: 35.00,
    duration_minutes: 30,
    category: 'Haircuts',
    image_url: '/images/barber_craft_cut_1790211484330.jpg',
    active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-2',
    name: 'Beard Trim & Sculpt [Placeholder]',
    slug: 'beard-trim-sculpt',
    description: 'Detailed beard shaping, line cleanup, trimming to length, and conditioning balm application.',
    price: 25.00,
    duration_minutes: 25,
    category: 'Beard & Grooming',
    image_url: '/images/barber_hot_towel_shave_1790211495750.jpg',
    active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-3',
    name: 'Hot Towel Straight Razor Shave [Placeholder]',
    slug: 'hot-towel-shave',
    description: 'Traditional straight razor shave with essential oil pre-shave, steaming hot towels, rich warm lather, and cooling aftershave splash.',
    price: 35.00,
    duration_minutes: 35,
    category: 'Beard & Grooming',
    image_url: '/images/barber_hot_towel_shave_1790211495750.jpg',
    active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-4',
    name: 'The Executive Service [Placeholder]',
    slug: 'the-executive',
    description: 'Signature full-grooming package including classic tailored haircut, hot towel straight razor neck shave, beard sculpt, and premium styling finish.',
    price: 65.00,
    duration_minutes: 55,
    category: 'Packages',
    image_url: '/images/hero_us_barber_1790211473323.jpg',
    active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-5',
    name: 'Senior & Junior Cut [Placeholder]',
    slug: 'senior-junior-cut',
    description: 'Precision haircut crafted for our valued seniors (65+) and young gentlemen under 12.',
    price: 28.00,
    duration_minutes: 30,
    category: 'Haircuts',
    image_url: '/images/shop_interior_details_1790211506738.jpg',
    active: true,
    display_order: 5,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_BARBERS: BarberItem[] = [
  {
    id: 'barber-1',
    name: 'Master Barber (Chair 1) [Add Profile]',
    bio: 'Experienced in classic American tapers, fades, and traditional straight razor shaves. Update this profile in the Admin Dashboard.',
    image_url: '/images/barber_craft_cut_1790211484330.jpg',
    specialties: ['Classic Cuts', 'Fades', 'Hot Towel Shave'],
    active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'barber-2',
    name: 'Senior Barber (Chair 2) [Add Profile]',
    bio: 'Specializing in precision scissor work, beard sculpts, and modern grooming techniques. Update this profile in the Admin Dashboard.',
    image_url: '/images/barber_hot_towel_shave_1790211495750.jpg',
    specialties: ['Precision Scissor Cuts', 'Beard Sculpting', 'Styling'],
    active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_GALLERY: GalleryImageItem[] = [
  {
    id: 'gal-1',
    title: 'Artisan Haircut & Shears',
    image_url: '/images/barber_craft_cut_1790211484330.jpg',
    alt_text: 'Master barber haircut detail with steel shears in Catonsville',
    display_order: 1,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-2',
    title: 'Hot Towel Shave Ritual',
    image_url: '/images/barber_hot_towel_shave_1790211495750.jpg',
    alt_text: 'Traditional straight razor hot towel shave preparation',
    display_order: 2,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-3',
    title: 'Classic Shop Atmosphere',
    image_url: '/images/hero_us_barber_1790211473323.jpg',
    alt_text: 'Vintage Belmont leather barber chairs and mahogany mirrors',
    display_order: 3,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-4',
    title: 'Artisanal Grooming Tonics',
    image_url: '/images/shop_interior_details_1790211506738.jpg',
    alt_text: 'Traditional pomades and barber accessories',
    display_order: 4,
    active: true,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_SETTINGS: ShopSettings = {
  shop_name: 'U.S. Barber',
  tagline: 'CLASSIC CRAFT. MODERN GROOMING.',
  phone: '+1 (410) 788-5156',
  address: '730 Frederick Rd, Suite 103, Catonsville, MD 21228',
  google_maps_url: 'https://maps.google.com/?q=U.S.+Barber+730+Frederick+Rd+Suite+103+Catonsville+MD+21228',
  timezone: 'America/New_York',
  email: 'contact@usbarbercatonsville.com',
  min_notice_minutes: 60,
  max_advance_days: 30,
  cancellation_window_hours: 2,
  slot_interval_minutes: 30,
};

// Default test customer (admin slot is initially open and unassigned for the shop owner)
const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'cust-user-001',
    email: 'client@example.com',
    full_name: 'James Wilson',
    phone: '+1 (443) 555-0192',
    role: 'customer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

class LocalDatabaseStore {
  private keyPrefix = 'us_barber_';
  private inMemoryCache: Record<string, any> = {};

  private getItem<T>(key: string, defaultVal: T): T {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return this.inMemoryCache[key] !== undefined ? this.inMemoryCache[key] : defaultVal;
      }
      const data = localStorage.getItem(this.keyPrefix + key);
      if (data) {
        return JSON.parse(data);
      }
      return this.inMemoryCache[key] !== undefined ? this.inMemoryCache[key] : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setItem<T>(key: string, val: T): void {
    try {
      this.inMemoryCache[key] = val;
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      localStorage.setItem(this.keyPrefix + key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  // --- Profiles & Auth ---
  getProfiles(): UserProfile[] {
    const list = this.getItem<UserProfile[]>('profiles', DEFAULT_PROFILES);
    // Filter out old placeholder admin if present in cache
    return list.filter((p) => p.email !== 'admin@usbarber.com');
  }

  saveProfile(profile: UserProfile): void {
    const list = this.getProfiles();
    const idx = list.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      list[idx] = { ...profile, updated_at: new Date().toISOString() };
    } else {
      list.push(profile);
    }
    this.setItem('profiles', list);
  }

  getSingleAdmin(): (UserProfile & { password_plain?: string }) | null {
    return this.getItem<(UserProfile & { password_plain?: string }) | null>('single_admin_slot', null);
  }

  saveSingleAdmin(admin: UserProfile & { password_plain?: string }): void {
    this.setItem('single_admin_slot', admin);
    this.saveProfile(admin);
  }

  // --- Services ---
  getServices(): ServiceItem[] {
    return this.getItem<ServiceItem[]>('services', DEFAULT_SERVICES);
  }

  saveService(item: ServiceItem): void {
    const list = this.getServices();
    const idx = list.findIndex((s) => s.id === item.id);
    if (idx >= 0) {
      list[idx] = { ...item, updated_at: new Date().toISOString() };
    } else {
      list.push(item);
    }
    this.setItem('services', list);
  }

  deleteService(id: string): void {
    const list = this.getServices().filter((s) => s.id !== id);
    this.setItem('services', list);
  }

  // --- Barbers ---
  getBarbers(): BarberItem[] {
    return this.getItem<BarberItem[]>('barbers', DEFAULT_BARBERS);
  }

  saveBarber(barber: BarberItem): void {
    const list = this.getBarbers();
    const idx = list.findIndex((b) => b.id === barber.id);
    if (idx >= 0) {
      list[idx] = { ...barber, updated_at: new Date().toISOString() };
    } else {
      list.push(barber);
    }
    this.setItem('barbers', list);
  }

  deleteBarber(id: string): void {
    const list = this.getBarbers().filter((b) => b.id !== id);
    this.setItem('barbers', list);
  }

  // --- Business Hours ---
  getBusinessHours(): BusinessHoursItem[] {
    return this.getItem<BusinessHoursItem[]>('business_hours', DEFAULT_BUSINESS_HOURS);
  }

  saveBusinessHours(hours: BusinessHoursItem[]): void {
    this.setItem('business_hours', hours);
  }

  // --- Blocked Dates ---
  getBlockedDates(): BlockedDateItem[] {
    return this.getItem<BlockedDateItem[]>('blocked_dates', []);
  }

  addBlockedDate(item: BlockedDateItem): void {
    const list = this.getBlockedDates();
    if (!list.some((b) => b.blocked_date === item.blocked_date)) {
      list.push(item);
      this.setItem('blocked_dates', list);
    }
  }

  removeBlockedDate(dateStr: string): void {
    const list = this.getBlockedDates().filter((b) => b.blocked_date !== dateStr);
    this.setItem('blocked_dates', list);
  }

  // --- Appointments ---
  getAppointments(): AppointmentItem[] {
    return this.getItem<AppointmentItem[]>('appointments', []);
  }

  saveAppointment(appt: AppointmentItem): void {
    const list = this.getAppointments();
    const idx = list.findIndex((a) => a.id === appt.id);
    if (idx >= 0) {
      list[idx] = { ...appt, updated_at: new Date().toISOString() };
    } else {
      list.push(appt);
    }
    this.setItem('appointments', list);
  }

  // --- Gallery ---
  getGallery(): GalleryImageItem[] {
    return this.getItem<GalleryImageItem[]>('gallery', DEFAULT_GALLERY);
  }

  saveGalleryImage(img: GalleryImageItem): void {
    const list = this.getGallery();
    const idx = list.findIndex((g) => g.id === img.id);
    if (idx >= 0) {
      list[idx] = img;
    } else {
      list.push(img);
    }
    this.setItem('gallery', list);
  }

  deleteGalleryImage(id: string): void {
    const list = this.getGallery().filter((g) => g.id !== id);
    this.setItem('gallery', list);
  }

  // --- Contact Messages ---
  getContactMessages(): ContactMessageItem[] {
    return this.getItem<ContactMessageItem[]>('contact_messages', []);
  }

  addContactMessage(msg: ContactMessageItem): void {
    const list = this.getContactMessages();
    list.unshift(msg);
    this.setItem('contact_messages', list);
  }

  updateContactMessageStatus(id: string, status: ContactMessageItem['status']): void {
    const list = this.getContactMessages();
    const item = list.find((m) => m.id === id);
    if (item) {
      item.status = status;
      this.setItem('contact_messages', list);
    }
  }

  // --- Settings ---
  getSettings(): ShopSettings {
    return this.getItem<ShopSettings>('settings', DEFAULT_SETTINGS);
  }

  saveSettings(settings: ShopSettings): void {
    this.setItem('settings', settings);
  }

  // Reset database back to default seed
  resetToDefaults(): void {
    this.setItem('profiles', DEFAULT_PROFILES);
    this.setItem('services', DEFAULT_SERVICES);
    this.setItem('barbers', DEFAULT_BARBERS);
    this.setItem('business_hours', DEFAULT_BUSINESS_HOURS);
    this.setItem('blocked_dates', []);
    this.setItem('gallery', DEFAULT_GALLERY);
    this.setItem('appointments', []);
    this.setItem('settings', DEFAULT_SETTINGS);
    this.setItem('contact_messages', []);
  }
}

export const localDb = new LocalDatabaseStore();
