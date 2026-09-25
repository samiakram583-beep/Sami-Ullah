import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ServiceItem,
  BarberItem,
  BusinessHoursItem,
  BlockedDateItem,
  AppointmentItem,
  TimeSlot,
  ShopSettings,
  BookingState,
} from '../../types';
import { servicesService } from '../../services/services.service';
import { barbersService } from '../../services/barbers.service';
import { businessHoursService } from '../../services/business-hours.service';
import { blockedDatesService } from '../../services/blocked-dates.service';
import { appointmentsService } from '../../services/appointments.service';
import { settingsService } from '../../services/settings.service';
import { generateAvailableSlots } from '../../lib/booking/slot-generator';
import {
  formatDateEditorial,
  formatTime12Hour,
  getNewYorkTodayString,
  addMinutesToTime,
} from '../../lib/booking/time-utils';
import { getImageUrl, handleImageError } from '../../lib/images';
import { validateCustomerDetails, ValidationErrors } from '../../lib/booking/validation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import {
  Scissors,
  UserCheck,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Phone,
  MapPin,
  CalendarPlus,
  RefreshCw,
} from 'lucide-react';

interface BookingFlowProps {
  initialServiceId?: string;
  onBookingComplete?: (appt: AppointmentItem) => void;
  onNavigate: (path: string) => void;
}

const formatPrice = (val?: number | string | null): string => {
  if (val === undefined || val === null) return '0.00';
  const num = typeof val === 'number' ? val : Number(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

export const BookingFlow: React.FC<BookingFlowProps> = ({
  initialServiceId,
  onBookingComplete,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Wizard Step: 1 = Service, 2 = Barber, 3 = Date & Time, 4 = Details, 5 = Review, 6 = Confirmed
  const [step, setStep] = useState<number>(1);

  // Data dependencies
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHoursItem[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDateItem[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  // Booking Form State
  const [booking, setBooking] = useState<BookingState>({
    service: null,
    barberId: 'any',
    selectedDate: getNewYorkTodayString(),
    selectedTime: '',
    customerName: user?.full_name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    notes: '',
  });

  // Time Slot Calculation State
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isDateClosed, setIsDateClosed] = useState<boolean>(false);
  const [closureMessage, setClosureMessage] = useState<string>('');

  // Booking Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [confirmedAppointment, setConfirmedAppointment] = useState<AppointmentItem | null>(null);

  // Sync user details if user signs in
  useEffect(() => {
    if (user) {
      setBooking((prev) => ({
        ...prev,
        customerName: prev.customerName || user.full_name || '',
        customerEmail: prev.customerEmail || user.email || '',
        customerPhone: prev.customerPhone || user.phone || '',
      }));
    }
  }, [user]);

  // Load prerequisites from Supabase
  const loadBookingData = async () => {
    setLoadingInitial(true);
    setFetchError(null);
    try {
      const [srvList, brbList, hoursList, blockedList, setObj] = await Promise.all([
        servicesService.getAll(false),
        barbersService.getAll(false),
        businessHoursService.getAll(),
        blockedDatesService.getAll(),
        settingsService.getSettings(),
      ]);

      if (!srvList || srvList.length === 0) {
        setFetchError('No active barbering services are currently configured in the shop database.');
      } else {
        setServices(srvList);
      }
      setBarbers(brbList || []);
      setBusinessHours(hoursList || []);
      setBlockedDates(blockedList || []);
      setSettings(setObj);

      // Handle initial service selection if passed via props
      if (initialServiceId && srvList) {
        const found = srvList.find((s) => s.id === initialServiceId || s.slug === initialServiceId);
        if (found) {
          setBooking((prev) => ({ ...prev, service: found }));
          setStep(2); // Jump directly to barber selection
        }
      }
    } catch (err: any) {
      console.error('Failed to load booking resources from Supabase:', err);
      setFetchError(err.message || 'Unable to load services from Supabase. Please check your connection.');
      showToast('Unable to load booking resources. Please check your connection.', 'error');
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadBookingData();
  }, [initialServiceId]);

  // Recalculate available slots whenever date, service, or barber changes
  const refreshSlots = async () => {
    if (!booking.service || !booking.selectedDate || !settings) return;

    setSlotsLoading(true);
    try {
      // Fetch latest existing appointments for that date from the database
      const existingAppts = await appointmentsService.getByDate(booking.selectedDate);

      const result = generateAvailableSlots({
        date: booking.selectedDate,
        service: booking.service,
        barberId: booking.barberId,
        allBarbers: barbers,
        businessHours,
        blockedDates,
        existingAppointments: existingAppts,
        settings,
      });

      setIsDateClosed(result.isShopClosed);
      setClosureMessage(result.closureReason || '');
      setAvailableSlots(result.slots);

      // If selected time is now no longer available, clear it
      if (booking.selectedTime) {
        const stillValid = result.slots.some((s) => s.time === booking.selectedTime && s.available);
        if (!stillValid) {
          setBooking((prev) => ({ ...prev, selectedTime: '' }));
        }
      }
    } catch (err) {
      console.error('Error calculating slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (step === 3 && booking.service && booking.selectedDate) {
      refreshSlots();
    }
  }, [step, booking.selectedDate, booking.barberId, booking.service]);

  // Final confirmation submission with race-condition checking
  const handleFinalBooking = async () => {
    setSubmitting(true);
    try {
      const res = await appointmentsService.bookAppointment(booking, user?.id || null);

      if (!res.success || !res.appointment) {
        // Double-booking or concurrency error!
        showToast(res.error || 'Sorry, this time was just booked. Please choose another time.', 'error');
        // Return to step 3 so the customer can pick another slot
        setStep(3);
        await refreshSlots();
        return;
      }

      // Booking succeeded!
      setConfirmedAppointment(res.appointment);
      setStep(6);
      if (onBookingComplete) onBookingComplete(res.appointment);

      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5A059', '#F5F2EA', '#D4B06A'],
        });
      } catch {}

      showToast('Your appointment has been successfully confirmed!', 'success');
    } catch (err: any) {
      console.error('Booking failed:', err);
      showToast(err.message || 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate .ics calendar download
  const handleDownloadCalendar = () => {
    if (!confirmedAppointment) return;
    const { appointment_date, start_time, end_time, service, customer_name, confirmation_code } =
      confirmedAppointment;
    const cleanDate = appointment_date.replace(/-/g, '');
    const cleanStart = start_time.replace(/:/g, '') + '00';
    const cleanEnd = end_time.replace(/:/g, '') + '00';

    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//U.S. Barber//Appointment Booking//EN',
      'BEGIN:VEVENT',
      `UID:${confirmation_code}@usbarbercatonsville.com`,
      `DTSTAMP:${cleanDate}T${cleanStart}Z`,
      `DTSTART:${cleanDate}T${cleanStart}`,
      `DTEND:${cleanDate}T${cleanEnd}`,
      `SUMMARY:U.S. Barber - ${service?.name || 'Haircut & Grooming'}`,
      `DESCRIPTION:Appointment confirmation: ${confirmation_code}. Customer: ${customer_name}. Service: ${service?.name || ''}`,
      'LOCATION:730 Frederick Rd, Suite 103, Catonsville, MD 21228',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `US_Barber_Appointment_${confirmation_code}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadingInitial) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-[#B8B5AE]">Loading appointment availability...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Step Indicator Header (Steps 1 to 5) */}
      {step <= 5 && (
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-[#B8B5AE] mb-3">
            <span className={step >= 1 ? 'text-[#C5A059]' : ''}>1. Service</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2E3035]" />
            <span className={step >= 2 ? 'text-[#C5A059]' : ''}>2. Barber</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2E3035]" />
            <span className={step >= 3 ? 'text-[#C5A059]' : ''}>3. Date & Time</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2E3035]" />
            <span className={step >= 4 ? 'text-[#C5A059]' : ''}>4. Details</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2E3035]" />
            <span className={step >= 5 ? 'text-[#C5A059]' : ''}>5. Review</span>
          </div>
          <div className="w-full bg-[#1A1B1D] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C5A059] h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ERROR STATE */}
      {/* ==================================================================== */}
      {fetchError && (
        <div className="p-8 bg-[#1A1B1D] border border-red-500/30 rounded text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl text-[#F5F2EA]">Unable to Load Booking Services</h3>
            <p className="text-xs text-[#B8B5AE] leading-relaxed">{fetchError}</p>
          </div>
          <button
            onClick={loadBookingData}
            className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 1: SELECT SERVICE */}
      {/* ==================================================================== */}
      {step === 1 && !fetchError && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl text-[#F5F2EA] mb-2">Select a Service</h2>
            <p className="text-sm text-[#B8B5AE]">
              Choose from our master-crafted haircut, grooming, and traditional shave services.
            </p>
          </div>

          {services.length === 0 ? (
            <div className="p-8 text-center bg-[#1A1B1D] rounded border border-[#2E3035] text-[#B8B5AE] space-y-3">
              <Scissors className="w-6 h-6 mx-auto text-[#C5A059]" />
              <p className="text-sm font-medium text-[#F5F2EA]">No active services currently available.</p>
              <p className="text-xs text-[#B8B5AE]">Please refresh or check back shortly.</p>
              <button
                onClick={loadBookingData}
                className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Services
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => {
                const isSelected = booking.service?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setBooking((prev) => ({ ...prev, service }))}
                    className={`p-5 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#202124] border-[#C5A059] shadow-lg ring-1 ring-[#C5A059]'
                        : 'bg-[#1A1B1D] border-[#2E3035] hover:border-[#B8B5AE]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-serif text-lg text-[#F5F2EA] leading-tight">
                          {service.name}
                        </h3>
                        <span className="text-base font-semibold text-[#C5A059] tabular-nums whitespace-nowrap">
                          ${formatPrice(service.price)}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-xs text-[#B8B5AE] leading-relaxed mb-4">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#B8B5AE] pt-3 border-t border-[#2E3035]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                        {service.duration_minutes} minutes
                      </span>
                      <span className="text-[#C5A059] font-medium">
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-6">
            <button
              disabled={!booking.service}
              onClick={() => setStep(2)}
              className="px-8 py-3.5 bg-[#C5A059] hover:bg-[#D4B06A] disabled:opacity-40 disabled:pointer-events-none text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              Continue to Barber Selection
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 2: SELECT BARBER */}
      {/* ==================================================================== */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl text-[#F5F2EA] mb-2">Select a Barber</h2>
            <p className="text-sm text-[#B8B5AE]">
              Select a preferred master barber or choose any available barber for the widest schedule availability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Any Available Barber Option */}
            <div
              onClick={() => setBooking((prev) => ({ ...prev, barberId: 'any' }))}
              className={`p-6 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                booking.barberId === 'any'
                  ? 'bg-[#202124] border-[#C5A059] ring-1 ring-[#C5A059]'
                  : 'bg-[#1A1B1D] border-[#2E3035] hover:border-[#B8B5AE]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mb-3">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg text-[#F5F2EA]">Any Available Barber</h3>
                <p className="text-xs text-[#B8B5AE] leading-relaxed">
                  Maximum scheduling flexibility. You will be matched with the first available skilled craftsman.
                </p>
              </div>
              <div className="pt-4 text-xs font-semibold text-[#C5A059]">
                {booking.barberId === 'any' ? 'Selected' : 'Select'}
              </div>
            </div>

            {/* Individual Barbers */}
            {barbers.map((barber) => {
              const isSelected = booking.barberId === barber.id;
              return (
                <div
                  key={barber.id}
                  onClick={() => setBooking((prev) => ({ ...prev, barberId: barber.id }))}
                  className={`p-6 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#202124] border-[#C5A059] ring-1 ring-[#C5A059]'
                      : 'bg-[#1A1B1D] border-[#2E3035] hover:border-[#B8B5AE]/40'
                  }`}
                >
                  <div className="space-y-3">
                    {barber.image_url ? (
                      <img
                        src={getImageUrl(barber.image_url)}
                        alt={barber.name}
                        className="w-14 h-14 rounded-full object-cover border border-[#2E3035]"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#202124] flex items-center justify-center text-[#C5A059] font-serif text-xl border border-[#2E3035]">
                        {barber.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="font-serif text-lg text-[#F5F2EA]">{barber.name}</h3>
                    <p className="text-xs text-[#B8B5AE] leading-relaxed line-clamp-2">
                      {barber.bio || 'Master craftsman at U.S. Barber.'}
                    </p>
                    <div className="flex flex-wrap gap-1 text-[11px] text-[#C5A059]">
                      {barber.specialties?.slice(0, 2).map((s, idx) => (
                        <span key={idx} className="bg-[#121314] px-2 py-0.5 rounded border border-[#2E3035]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 text-xs font-semibold text-[#C5A059]">
                    {isSelected ? 'Selected' : 'Select'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#B8B5AE] hover:text-[#F5F2EA] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Services
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-8 py-3.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              Choose Date & Time
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 3: SELECT DATE & AVAILABLE TIME */}
      {/* ==================================================================== */}
      {step === 3 && (
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-3xl text-[#F5F2EA] mb-2">Select Date & Time</h2>
            <p className="text-sm text-[#B8B5AE]">
              Live availability calculated using shop operating hours, blocked dates, and appointment durations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Date Picker Section */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA]">
                Appointment Date
              </label>
              <input
                type="date"
                min={getNewYorkTodayString()}
                value={booking.selectedDate}
                onChange={(e) => setBooking((prev) => ({ ...prev, selectedDate: e.target.value }))}
                className="w-full bg-[#1A1B1D] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm p-3 rounded focus:outline-none transition-colors"
              />
              <p className="text-xs text-[#B8B5AE]">
                Selected: <span className="text-[#F5F2EA] font-medium">{formatDateEditorial(booking.selectedDate)}</span>
              </p>
              
              <div className="p-4 bg-[#1A1B1D] rounded border border-[#2E3035] text-xs text-[#B8B5AE] space-y-2">
                <div className="flex items-center gap-2 text-[#F5F2EA] font-semibold">
                  <Scissors className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{booking.service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="text-[#F5F2EA]">{booking.service?.duration_minutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="text-[#C5A059] font-medium">${formatPrice(booking.service?.price)}</span>
                </div>
              </div>
            </div>

            {/* Time Slot Picker Section */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA]">
                  Available Time Slots
                </label>
                <button
                  onClick={refreshSlots}
                  className="flex items-center gap-1 text-xs text-[#C5A059] hover:underline"
                >
                  <RefreshCw className={`w-3 h-3 ${slotsLoading ? 'animate-spin' : ''}`} />
                  Refresh Slots
                </button>
              </div>

              {slotsLoading ? (
                <div className="py-16 text-center bg-[#1A1B1D] rounded border border-[#2E3035]">
                  <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[#B8B5AE]">Checking live barber availability...</p>
                </div>
              ) : isDateClosed ? (
                <div className="p-8 text-center bg-[#1A1B1D] rounded border border-red-500/30 text-red-300 space-y-2">
                  <AlertCircle className="w-6 h-6 mx-auto text-red-400" />
                  <p className="text-sm font-semibold">{closureMessage || 'Shop is closed on this date.'}</p>
                  <p className="text-xs text-[#B8B5AE]">Please choose another date above to view openings.</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-8 text-center bg-[#1A1B1D] rounded border border-[#2E3035] text-[#B8B5AE] space-y-2">
                  <Clock className="w-6 h-6 mx-auto text-[#C5A059]" />
                  <p className="text-sm font-medium text-[#F5F2EA]">No open slots available for this date.</p>
                  <p className="text-xs">All chairs are booked or outside operating hours. Please pick another date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => {
                    const isSelected = booking.selectedTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setBooking((prev) => ({ ...prev, selectedTime: slot.time }))}
                        className={`py-3 px-2 text-xs font-semibold rounded border transition-all text-center ${
                          !slot.available
                            ? 'bg-[#121314]/40 border-[#202124] text-[#B8B5AE]/30 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-[#C5A059] border-[#C5A059] text-[#121314] shadow-md font-bold'
                            : 'bg-[#1A1B1D] border-[#2E3035] text-[#F5F2EA] hover:border-[#C5A059] hover:text-[#C5A059]'
                        }`}
                      >
                        {slot.formatted}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[#2E3035]">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#B8B5AE] hover:text-[#F5F2EA] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Barber Selection
            </button>
            <button
              disabled={!booking.selectedTime}
              onClick={() => setStep(4)}
              className="px-8 py-3.5 bg-[#C5A059] hover:bg-[#D4B06A] disabled:opacity-40 disabled:pointer-events-none text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              Continue to Customer Details
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 4: CUSTOMER INFORMATION */}
      {/* ==================================================================== */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl text-[#F5F2EA] mb-2">Customer Information</h2>
            <p className="text-sm text-[#B8B5AE]">
              Please provide your contact information for booking confirmation and appointment reminders.
            </p>
          </div>

          <div className="bg-[#1A1B1D] p-6 sm:p-8 rounded border border-[#2E3035] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. James Wilson"
                  value={booking.customerName}
                  onChange={(e) => {
                    setBooking((prev) => ({ ...prev, customerName: e.target.value }));
                    if (validationErrors.customerName) {
                      setValidationErrors((prev) => ({ ...prev, customerName: undefined }));
                    }
                  }}
                  className={`w-full bg-[#121314] border ${
                    validationErrors.customerName ? 'border-red-400' : 'border-[#2E3035]'
                  } focus:border-[#C5A059] text-[#F5F2EA] text-sm p-3 rounded focus:outline-none transition-colors`}
                />
                {validationErrors.customerName && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. james@example.com"
                  value={booking.customerEmail}
                  onChange={(e) => {
                    setBooking((prev) => ({ ...prev, customerEmail: e.target.value }));
                    if (validationErrors.customerEmail) {
                      setValidationErrors((prev) => ({ ...prev, customerEmail: undefined }));
                    }
                  }}
                  className={`w-full bg-[#121314] border ${
                    validationErrors.customerEmail ? 'border-red-400' : 'border-[#2E3035]'
                  } focus:border-[#C5A059] text-[#F5F2EA] text-sm p-3 rounded focus:outline-none transition-colors`}
                />
                {validationErrors.customerEmail && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.customerEmail}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-2">
                Mobile Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. (410) 555-0199"
                value={booking.customerPhone}
                onChange={(e) => {
                  setBooking((prev) => ({ ...prev, customerPhone: e.target.value }));
                  if (validationErrors.customerPhone) {
                    setValidationErrors((prev) => ({ ...prev, customerPhone: undefined }));
                  }
                }}
                className={`w-full bg-[#121314] border ${
                  validationErrors.customerPhone ? 'border-red-400' : 'border-[#2E3035]'
                } focus:border-[#C5A059] text-[#F5F2EA] text-sm p-3 rounded focus:outline-none transition-colors`}
              />
              {validationErrors.customerPhone && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.customerPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-2">
                Special Requests or Styling Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Skin fade with razor hard part, skin sensitivity notes..."
                value={booking.notes}
                onChange={(e) => setBooking((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm p-3 rounded focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#B8B5AE] hover:text-[#F5F2EA] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Date & Time
            </button>
            <button
              onClick={() => {
                const validation = validateCustomerDetails(
                  booking.customerName,
                  booking.customerEmail,
                  booking.customerPhone,
                  booking.notes
                );
                if (!validation.isValid) {
                  setValidationErrors(validation.errors);
                  return;
                }
                setValidationErrors({});
                setStep(5);
              }}
              className="px-8 py-3.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 5: REVIEW & ATOMIC CONFIRMATION */}
      {/* ==================================================================== */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl text-[#F5F2EA] mb-2">Review Appointment</h2>
            <p className="text-sm text-[#B8B5AE]">
              Please review your appointment summary before final reservation.
            </p>
          </div>

          <div className="bg-[#1A1B1D] rounded border border-[#2E3035] overflow-hidden">
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Service & Time Overview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2E3035] gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#C5A059] font-semibold">
                    Selected Service
                  </span>
                  <h3 className="font-serif text-2xl text-[#F5F2EA] mt-1">
                    {booking.service?.name}
                  </h3>
                  <p className="text-xs text-[#B8B5AE] mt-1">
                    {booking.service?.duration_minutes} Minutes · Professional Grooming
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs uppercase tracking-wider text-[#B8B5AE] block">
                    Price at Shop
                  </span>
                  <span className="font-serif text-3xl text-[#C5A059]">
                    ${formatPrice(booking.service?.price)}
                  </span>
                </div>
              </div>

              {/* Appointment Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#B8B5AE] block mb-1">
                    Barber
                  </span>
                  <span className="text-[#F5F2EA] font-medium">
                    {booking.barberId === 'any'
                      ? 'First Available Barber'
                      : barbers.find((b) => b.id === booking.barberId)?.name || 'Master Barber'}
                  </span>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-[#B8B5AE] block mb-1">
                    Date & Time
                  </span>
                  <span className="text-[#F5F2EA] font-medium">
                    {formatDateEditorial(booking.selectedDate)} at {formatTime12Hour(booking.selectedTime)}
                  </span>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-[#B8B5AE] block mb-1">
                    Customer Name
                  </span>
                  <span className="text-[#F5F2EA] font-medium">{booking.customerName}</span>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-[#B8B5AE] block mb-1">
                    Contact Information
                  </span>
                  <span className="text-[#F5F2EA] font-medium block">{booking.customerPhone}</span>
                  <span className="text-[#B8B5AE] text-xs block">{booking.customerEmail}</span>
                </div>
              </div>

              {/* Location Information */}
              <div className="p-4 bg-[#121314] rounded border border-[#2E3035] flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-[#F5F2EA] block">U.S. Barber Shop</span>
                  <span className="text-[#B8B5AE] block">730 Frederick Rd, Suite 103, Catonsville, MD 21228</span>
                  <span className="text-[#B8B5AE] block mt-0.5">Phone: +1 (410) 788-5156</span>
                </div>
              </div>

              {booking.notes && (
                <div className="text-xs text-[#B8B5AE]">
                  <span className="font-semibold text-[#F5F2EA] block mb-1">Notes:</span>
                  <p className="italic bg-[#121314] p-3 rounded border border-[#2E3035]">{booking.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-[#141517] px-6 py-4 border-t border-[#2E3035] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setStep(4)}
                disabled={submitting}
                className="flex items-center gap-1.5 text-xs font-medium text-[#B8B5AE] hover:text-[#F5F2EA] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Edit Details
              </button>

              <button
                disabled={submitting}
                onClick={handleFinalBooking}
                className="w-full sm:w-auto px-10 py-4 bg-[#C5A059] hover:bg-[#D4B06A] active:bg-[#A4833E] disabled:opacity-50 text-[#121314] font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#121314] border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Slot & Booking...</span>
                  </>
                ) : (
                  <span>CONFIRM & BOOK APPOINTMENT</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 6: BOOKING CONFIRMATION SCREEN */}
      {/* ==================================================================== */}
      {step === 6 && confirmedAppointment && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA]">
              You're Booked!
            </h2>
            <p className="text-sm text-[#B8B5AE] max-w-md mx-auto">
              Your appointment is reserved. We look forward to welcoming you to U.S. Barber.
            </p>
          </div>

          <div className="bg-[#1A1B1D] rounded border border-[#2E3035] overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#2E3035] gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#B8B5AE] block">
                  Confirmation Code
                </span>
                <span className="font-mono text-2xl font-bold text-[#C5A059]">
                  {confirmedAppointment.confirmation_code}
                </span>
              </div>
              <div className="text-xs text-[#B8B5AE] sm:text-right">
                <span className="block">Status</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  {confirmedAppointment.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#B8B5AE] block mb-1">
                  Service
                </span>
                <span className="text-[#F5F2EA] font-semibold">
                  {confirmedAppointment.service?.name}
                </span>
                <span className="text-xs text-[#B8B5AE] block">
                  ${formatPrice(confirmedAppointment.service?.price)} · {confirmedAppointment.service?.duration_minutes} min
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-[#B8B5AE] block mb-1">
                  Barber
                </span>
                <span className="text-[#F5F2EA] font-semibold">
                  {confirmedAppointment.barber?.name || 'Master Barber'}
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-[#B8B5AE] block mb-1">
                  Date & Time
                </span>
                <span className="text-[#F5F2EA] font-semibold">
                  {formatDateEditorial(confirmedAppointment.appointment_date)}
                </span>
                <span className="text-xs text-[#C5A059] block font-medium">
                  {formatTime12Hour(confirmedAppointment.start_time)} – {formatTime12Hour(confirmedAppointment.end_time)}
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-[#B8B5AE] block mb-1">
                  Customer
                </span>
                <span className="text-[#F5F2EA] font-semibold">
                  {confirmedAppointment.customer_name}
                </span>
                <span className="text-xs text-[#B8B5AE] block">
                  {confirmedAppointment.customer_phone}
                </span>
              </div>
            </div>

            {/* Shop Address */}
            <div className="p-4 bg-[#121314] rounded border border-[#2E3035] flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-[#F5F2EA] block">U.S. Barber</span>
                <span className="text-[#B8B5AE] block">730 Frederick Rd, Suite 103, Catonsville, MD 21228</span>
                <span className="text-[#B8B5AE] block">Phone: +1 (410) 788-5156</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={handleDownloadCalendar}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded bg-[#202124] hover:bg-[#282a2e] text-[#F5F2EA] text-xs font-semibold uppercase tracking-wider border border-[#2E3035] transition-colors"
              >
                <CalendarPlus className="w-4 h-4 text-[#C5A059]" />
                ADD TO CALENDAR
              </button>

              <a
                href="https://maps.google.com/?q=U.S.+Barber+730+Frederick+Rd+Suite+103+Catonsville+MD+21228"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded bg-[#202124] hover:bg-[#282a2e] text-[#F5F2EA] text-xs font-semibold uppercase tracking-wider border border-[#2E3035] transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#C5A059]" />
                GET DIRECTIONS
              </a>

              <a
                href="tel:+14107885156"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded bg-[#202124] hover:bg-[#282a2e] text-[#F5F2EA] text-xs font-semibold uppercase tracking-wider border border-[#2E3035] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#C5A059]" />
                CALL SHOP
              </a>

              <button
                onClick={() => {
                  setConfirmedAppointment(null);
                  setStep(1);
                  setBooking({
                    service: null,
                    barberId: 'any',
                    selectedDate: getNewYorkTodayString(),
                    selectedTime: '',
                    customerName: user?.full_name || '',
                    customerEmail: user?.email || '',
                    customerPhone: user?.phone || '',
                    notes: '',
                  });
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                BOOK ANOTHER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
