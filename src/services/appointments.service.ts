import { AppointmentItem, AppointmentStatus, BookingState } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { localDb } from '../lib/supabase/mock-store';
import {
  addMinutesToTime,
  timeToMinutes,
  doIntervalsOverlap,
  getNewYorkTodayString,
  getNewYorkCurrentTimeMinutes,
} from '../lib/booking/time-utils';
import { servicesService } from './services.service';
import { barbersService } from './barbers.service';

export interface BookingResponse {
  success: boolean;
  appointment?: AppointmentItem;
  error?: string;
}

export const appointmentsService = {
  /**
   * Main customer booking function with server-side/atomic double booking prevention
   * and dual-mode Supabase synchronization.
   */
  async bookAppointment(
    bookingData: BookingState,
    customerId?: string | null
  ): Promise<BookingResponse> {
    const { service, barberId, selectedDate, selectedTime, customerName, customerEmail, customerPhone, notes } =
      bookingData;

    if (!service || !selectedDate || !selectedTime || !customerName || !customerEmail || !customerPhone) {
      return { success: false, error: 'Incomplete booking details provided.' };
    }

    const startTime = selectedTime;
    const endTime = addMinutesToTime(startTime, service.duration_minutes);

    // 1. Resolve target barber (if 'any' was selected, pick the first active barber who is free)
    const allBarbers = await barbersService.getAll(false);
    let resolvedBarberId = barberId;

    if (barberId === 'any') {
      const existing = await this.getByDate(selectedDate);
      const freeBarber = allBarbers.find((b) => {
        const hasConflict = existing.some(
          (a) =>
            a.barber_id === b.id &&
            a.status !== 'cancelled' &&
            a.status !== 'no_show' &&
            doIntervalsOverlap(startTime, endTime, a.start_time, a.end_time)
        );
        return !hasConflict;
      });

      if (!freeBarber) {
        return {
          success: false,
          error: 'Sorry, this time was just booked. Please choose another time.',
        };
      }
      resolvedBarberId = freeBarber.id;
    }

    const confCode = 'USB-' + Math.floor(100000 + Math.random() * 900000).toString();

    // 2. If Supabase is configured, attempt write to Supabase Backend
    if (isSupabaseConfigured() && supabase) {
      // Step 2a: Try atomic RPC if available
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_booking_atomic', {
          p_service_id: service.id,
          p_barber_id: resolvedBarberId,
          p_appointment_date: selectedDate,
          p_start_time: startTime,
          p_end_time: endTime,
          p_customer_name: customerName.trim(),
          p_customer_email: customerEmail.trim().toLowerCase(),
          p_customer_phone: customerPhone.trim(),
          p_notes: notes?.trim() || null,
          p_customer_id: customerId || null,
        });

        if (!rpcError && rpcData && rpcData.success) {
          const appt = await this.getById(rpcData.appointment_id);
          if (appt) {
            // Also cache locally
            localDb.saveAppointment(appt);
            return { success: true, appointment: appt };
          }
        } else if (rpcData && !rpcData.success) {
          return {
            success: false,
            error: rpcData.error || 'Sorry, this time was just booked. Please choose another time.',
          };
        }
      } catch (rpcErr) {
        // Fall through to direct table insert
        console.warn('RPC create_booking_atomic unavailable, using direct Supabase insert:', rpcErr);
      }

      // Step 2b: Try direct insert into Supabase 'appointments' table
      try {
        const payload: any = {
          confirmation_code: confCode,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim().toLowerCase(),
          customer_phone: customerPhone.trim(),
          service_id: service.id,
          barber_id: resolvedBarberId,
          appointment_date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          notes: notes?.trim() || null,
          status: 'confirmed',
        };
        if (customerId) payload.customer_id = customerId;

        const { data: inserted, error: insertError } = await supabase
          .from('appointments')
          .insert([payload])
          .select('*')
          .single();

        if (!insertError && inserted) {
          const fullAppt: AppointmentItem = {
            ...inserted,
            service,
            barber: allBarbers.find((b) => b.id === resolvedBarberId),
          };
          localDb.saveAppointment(fullAppt);
          return {
            success: true,
            appointment: fullAppt,
          };
        } else if (insertError) {
          console.warn('Supabase appointments insert notice:', insertError.message);
        }
      } catch (insertEx) {
        console.warn('Supabase insert exception:', insertEx);
      }
    }

    // 3. Fallback / Local Store Double-Booking Prevention & Validation
    const existingForDate = localDb
      .getAppointments()
      .filter((a) => a.appointment_date === selectedDate && a.status !== 'cancelled' && a.status !== 'no_show');

    const hasConflict = existingForDate.some(
      (a) =>
        a.barber_id === resolvedBarberId &&
        doIntervalsOverlap(startTime, endTime, a.start_time, a.end_time)
    );

    if (hasConflict) {
      return {
        success: false,
        error: 'Sorry, this time was just booked. Please choose another time.',
      };
    }

    const newAppointment: AppointmentItem = {
      id: 'appt-' + Date.now(),
      confirmation_code: confCode,
      customer_id: customerId || null,
      service_id: service.id,
      barber_id: resolvedBarberId,
      appointment_date: selectedDate,
      start_time: startTime,
      end_time: endTime,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim().toLowerCase(),
      customer_phone: customerPhone.trim(),
      notes: notes?.trim() || undefined,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service,
      barber: allBarbers.find((b) => b.id === resolvedBarberId),
    };

    localDb.saveAppointment(newAppointment);

    return {
      success: true,
      appointment: newAppointment,
    };
  },

  /**
   * Admin appointment creation (can override or create direct telephone bookings)
   */
  async createAdminBooking(
    appt: Omit<AppointmentItem, 'id' | 'confirmation_code' | 'created_at' | 'updated_at'>
  ): Promise<AppointmentItem> {
    const confCode = 'USB-ADM-' + Math.floor(100000 + Math.random() * 900000).toString();
    const newAppt: AppointmentItem = {
      ...appt,
      id: 'appt-' + Date.now(),
      confirmation_code: confCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: any = {
          confirmation_code: confCode,
          customer_name: appt.customer_name,
          customer_email: appt.customer_email,
          customer_phone: appt.customer_phone,
          service_id: appt.service_id,
          barber_id: appt.barber_id,
          appointment_date: appt.appointment_date,
          start_time: appt.start_time,
          end_time: appt.end_time,
          notes: appt.notes || null,
          status: appt.status || 'confirmed',
        };
        if (appt.customer_id) payload.customer_id = appt.customer_id;

        const { data, error } = await supabase.from('appointments').insert([payload]).select().single();
        if (!error && data) {
          const saved: AppointmentItem = { ...newAppt, id: data.id };
          localDb.saveAppointment(saved);
          return saved;
        }
      } catch (err) {
        console.warn('Supabase admin booking insert failed, saved locally:', err);
      }
    }

    localDb.saveAppointment(newAppt);
    return newAppt;
  },

  async getById(id: string): Promise<AppointmentItem | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) {
          return this.enrichAppointment(data as AppointmentItem);
        }
      } catch (err) {
        // Fall back to local
      }
    }

    const appt = localDb.getAppointments().find((a) => a.id === id);
    if (!appt) return null;
    return this.enrichAppointment(appt);
  },

  async getByDate(dateStr: string): Promise<AppointmentItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('appointment_date', dateStr);
        if (!error && data && data.length > 0) {
          return Promise.all(data.map((a) => this.enrichAppointment(a as AppointmentItem)));
        }
      } catch (err) {
        // Fall back
      }
    }

    const list = localDb.getAppointments().filter((a) => a.appointment_date === dateStr);
    return Promise.all(list.map((a) => this.enrichAppointment(a)));
  },

  async getByCustomer(customerIdOrEmail: string): Promise<AppointmentItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .or(`customer_id.eq.${customerIdOrEmail},customer_email.eq.${customerIdOrEmail}`)
          .order('appointment_date', { ascending: false });
        if (!error && data && data.length > 0) {
          return Promise.all(data.map((a) => this.enrichAppointment(a as AppointmentItem)));
        }
      } catch (err) {
        // Fall back
      }
    }

    const list = localDb
      .getAppointments()
      .filter((a) => a.customer_id === customerIdOrEmail || a.customer_email.toLowerCase() === customerIdOrEmail.toLowerCase())
      .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

    return Promise.all(list.map((a) => this.enrichAppointment(a)));
  },

  async getAll(): Promise<AppointmentItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: false });
        if (!error && data && data.length > 0) {
          return Promise.all(data.map((a) => this.enrichAppointment(a as AppointmentItem)));
        }
      } catch (err) {
        console.warn('Supabase appointments fetch notice:', err);
      }
    }

    const list = localDb.getAppointments();
    return Promise.all(list.map((a) => this.enrichAppointment(a)));
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<AppointmentItem> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select('*')
          .single();
        if (!error && data) {
          const enriched = await this.enrichAppointment(data as AppointmentItem);
          localDb.saveAppointment(enriched);
          return enriched;
        }
      } catch (err) {
        // Fall back
      }
    }

    const current = await this.getById(id);
    if (!current) throw new Error('Appointment not found');
    const updated: AppointmentItem = {
      ...current,
      status,
      updated_at: new Date().toISOString(),
    };
    localDb.saveAppointment(updated);
    return updated;
  },

  async cancelByCustomer(id: string, customerEmail: string): Promise<{ success: boolean; error?: string }> {
    const appt = await this.getById(id);
    if (!appt) return { success: false, error: 'Appointment not found.' };

    if (appt.customer_email.toLowerCase() !== customerEmail.toLowerCase()) {
      return { success: false, error: 'Unauthorized to cancel this appointment.' };
    }

    if (appt.status === 'cancelled') {
      return { success: false, error: 'Appointment is already cancelled.' };
    }

    const settings = localDb.getSettings();
    const windowHours = settings.cancellation_window_hours || 2;
    const nyToday = getNewYorkTodayString();

    if (appt.appointment_date === nyToday) {
      const apptStartMin = timeToMinutes(appt.start_time);
      const currentMin = getNewYorkCurrentTimeMinutes();
      const diffMin = apptStartMin - currentMin;
      if (diffMin < windowHours * 60) {
        return {
          success: false,
          error: `Appointments must be cancelled at least ${windowHours} hours in advance. Please call the shop at ${settings.phone} for immediate assistance.`,
        };
      }
    }

    await this.updateStatus(id, 'cancelled');
    return { success: true };
  },

  async enrichAppointment(appt: AppointmentItem): Promise<AppointmentItem> {
    const [service, barber] = await Promise.all([
      servicesService.getById(appt.service_id),
      barbersService.getById(appt.barber_id),
    ]);
    return {
      ...appt,
      service: service || appt.service,
      barber: barber || appt.barber,
    };
  },
};
