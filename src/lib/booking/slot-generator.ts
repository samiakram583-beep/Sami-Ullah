import {
  ServiceItem,
  BarberItem,
  BusinessHoursItem,
  BlockedDateItem,
  AppointmentItem,
  TimeSlot,
  ShopSettings,
} from '../../types';
import {
  getDayOfWeekFromDateString,
  getNewYorkTodayString,
  getNewYorkCurrentTimeMinutes,
  timeToMinutes,
  minutesToTime,
  addMinutesToTime,
  formatTime12Hour,
  doIntervalsOverlap,
} from './time-utils';

export interface SlotGeneratorInput {
  date: string; // YYYY-MM-DD
  service: ServiceItem;
  barberId: string | 'any';
  allBarbers: BarberItem[];
  businessHours: BusinessHoursItem[];
  blockedDates: BlockedDateItem[];
  existingAppointments: AppointmentItem[];
  settings: ShopSettings;
}

export interface SlotGenerationResult {
  slots: TimeSlot[];
  isShopClosed: boolean;
  closureReason?: string;
}

export function generateAvailableSlots(input: SlotGeneratorInput): SlotGenerationResult {
  const {
    date,
    service,
    barberId,
    allBarbers,
    businessHours,
    blockedDates,
    existingAppointments,
    settings,
  } = input;

  // 1. Check if date is blocked
  const blocked = blockedDates.find((b) => b.blocked_date === date);
  if (blocked) {
    return {
      slots: [],
      isShopClosed: true,
      closureReason: `Shop closed on this date (${blocked.reason})`,
    };
  }

  // 2. Check business hours for this day of week
  const dayOfWeek = getDayOfWeekFromDateString(date);
  const hoursForDay = businessHours.find((h) => h.day_of_week === dayOfWeek);

  if (!hoursForDay || hoursForDay.is_closed) {
    return {
      slots: [],
      isShopClosed: true,
      closureReason: 'The shop is closed on this day of the week.',
    };
  }

  const openMinutes = timeToMinutes(hoursForDay.open_time);
  const closeMinutes = timeToMinutes(hoursForDay.close_time);
  const duration = service.duration_minutes;
  const interval = settings.slot_interval_minutes || 30;

  // 3. Current time / minimum notice check for today
  const nyToday = getNewYorkTodayString();
  const isToday = date === nyToday;
  const currentNYMinutes = getNewYorkCurrentTimeMinutes();
  const minNoticeMinutes = settings.min_notice_minutes || 60;
  const earliestAllowedMinutes = isToday ? currentNYMinutes + minNoticeMinutes : 0;

  // Active barbers to consider
  const activeBarbers = allBarbers.filter((b) => b.active);
  if (activeBarbers.length === 0) {
    return {
      slots: [],
      isShopClosed: true,
      closureReason: 'No barbers are currently active.',
    };
  }

  const targetBarbers =
    barberId === 'any'
      ? activeBarbers
      : activeBarbers.filter((b) => b.id === barberId);

  if (targetBarbers.length === 0) {
    return {
      slots: [],
      isShopClosed: true,
      closureReason: 'Selected barber is currently unavailable.',
    };
  }

  // Filter existing active appointments for this date
  const dateAppointments = existingAppointments.filter(
    (a) => a.appointment_date === date && a.status !== 'cancelled' && a.status !== 'no_show'
  );

  const slots: TimeSlot[] = [];

  // Generate slots from open to close
  for (let m = openMinutes; m + duration <= closeMinutes; m += interval) {
    const slotStart = minutesToTime(m);
    const slotEnd = addMinutesToTime(slotStart, duration);

    // Is slot in the past or within minNotice window today?
    if (m < earliestAllowedMinutes) {
      continue;
    }

    // Determine availability across target barbers
    let availableBarberId: string | undefined = undefined;

    for (const b of targetBarbers) {
      // Check if this barber has any conflicting appointment overlapping [slotStart, slotEnd)
      const hasConflict = dateAppointments.some((appt) => {
        if (appt.barber_id !== b.id) return false;
        return doIntervalsOverlap(slotStart, slotEnd, appt.start_time, appt.end_time);
      });

      if (!hasConflict) {
        availableBarberId = b.id;
        break; // Found at least one available barber for this slot
      }
    }

    const isAvailable = Boolean(availableBarberId);

    slots.push({
      time: slotStart,
      formatted: formatTime12Hour(slotStart),
      available: isAvailable,
      barber_id: availableBarberId,
      reason: isAvailable ? undefined : 'Booked',
    });
  }

  return {
    slots,
    isShopClosed: false,
  };
}
