export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  image_url?: string;
  active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface BarberItem {
  id: string;
  name: string;
  bio: string;
  image_url?: string;
  specialties: string[];
  active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessHoursItem {
  id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  day_name: string;
  open_time: string; // HH:MM:SS or HH:MM
  close_time: string;
  is_closed: boolean;
}

export interface BlockedDateItem {
  id: string;
  blocked_date: string; // YYYY-MM-DD
  reason: string;
  created_by?: string;
  created_at?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface AppointmentItem {
  id: string;
  confirmation_code: string;
  customer_id?: string | null;
  service_id: string;
  barber_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  // Joined fields for display:
  service?: ServiceItem;
  barber?: BarberItem;
}

export interface GalleryImageItem {
  id: string;
  title?: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  active: boolean;
  created_at?: string;
}

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export interface ShopSettings {
  shop_name: string;
  tagline: string;
  phone: string;
  address: string;
  google_maps_url: string;
  timezone: string;
  email: string;
  min_notice_minutes: number;
  max_advance_days: number;
  cancellation_window_hours: number;
  slot_interval_minutes: number;
}

export interface TimeSlot {
  time: string; // "09:00"
  formatted: string; // "9:00 AM"
  available: boolean;
  barber_id?: string;
  reason?: string;
}

export interface BookingState {
  service: ServiceItem | null;
  barberId: string | 'any'; // specific barber id or 'any'
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // "10:30"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}
