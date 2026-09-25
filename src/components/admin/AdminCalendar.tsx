import React, { useState, useEffect } from 'react';
import { AppointmentItem, BarberItem } from '../../types';
import { appointmentsService } from '../../services/appointments.service';
import { barbersService } from '../../services/barbers.service';
import {
  formatDateEditorial,
  formatTime12Hour,
  getNewYorkTodayString,
} from '../../lib/booking/time-utils';
import { useToast } from '../common/Toast';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
} from 'lucide-react';

export const AdminCalendar: React.FC = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected date anchor
  const [selectedDate, setSelectedDate] = useState<string>(getNewYorkTodayString());
  // Mode: 'day' | 'week' | 'month'
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  // Detail Modal
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appts, brbs] = await Promise.all([
        appointmentsService.getAll(),
        barbersService.getAll(true),
      ]);
      setAppointments(appts);
      setBarbers(brbs);
    } catch (err) {
      console.error('Error loading calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: any) => {
    try {
      await appointmentsService.updateStatus(id, newStatus);
      showToast(`Status updated to ${newStatus}`, 'success');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      if (selectedAppt && selectedAppt.id === id) {
        setSelectedAppt({ ...selectedAppt, status: newStatus });
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  // Date navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T12:00:00Z');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T12:00:00Z');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Day view appointments
  const dayAppointments = appointments
    .filter((a) => a.appointment_date === selectedDate)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E3035] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
            Visual Schedule
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA] mt-1">
            Shop Calendar
          </h1>
          <p className="text-xs text-[#B8B5AE] mt-1">
            View booking density across days and chairs.
          </p>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-1 flex">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold rounded transition-colors ${
                  viewMode === mode
                    ? 'bg-[#C5A059] text-[#121314]'
                    : 'text-[#B8B5AE] hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSelectedDate(getNewYorkTodayString())}
            className="px-3 py-1.5 bg-[#202124] border border-[#2E3035] text-xs font-semibold uppercase text-[#F5F2EA] hover:border-[#C5A059] rounded"
          >
            Today
          </button>
        </div>
      </div>

      {/* Date Navigator Bar */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-4 flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          className="p-2 text-[#B8B5AE] hover:text-[#C5A059] rounded hover:bg-[#202124]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="font-serif text-xl sm:text-2xl text-[#F5F2EA] block">
            {formatDateEditorial(selectedDate)}
          </span>
          <span className="text-xs font-mono text-[#C5A059]">{selectedDate}</span>
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 text-[#B8B5AE] hover:text-[#C5A059] rounded hover:bg-[#202124]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* DAY VIEW CONTENT */}
      {viewMode === 'day' && (
        <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-6">
          <div className="flex items-center justify-between border-b border-[#2E3035] pb-4 mb-6">
            <h3 className="font-serif text-xl text-[#F5F2EA]">
              Appointments for {formatDateEditorial(selectedDate)}
            </h3>
            <span className="text-xs text-[#C5A059] font-medium">
              {dayAppointments.length} Booked
            </span>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-[#B8B5AE]">Loading calendar...</div>
          ) : dayAppointments.length === 0 ? (
            <div className="py-20 text-center text-xs text-[#B8B5AE] space-y-2">
              <CalendarIcon className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
              <p className="text-sm font-medium text-[#F5F2EA]">No appointments on this date.</p>
              <p>All chairs are currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dayAppointments.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => setSelectedAppt(appt)}
                  className="p-4 bg-[#141517] border border-[#2E3035] hover:border-[#C5A059] rounded cursor-pointer transition-colors space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-[#C5A059] font-bold">
                      {formatTime12Hour(appt.start_time)} – {formatTime12Hour(appt.end_time)}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                        appt.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : appt.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : appt.status === 'cancelled'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-[#F5F2EA]">
                      {appt.customer_name}
                    </h4>
                    <span className="text-xs text-[#B8B5AE]">{appt.customer_phone}</span>
                  </div>

                  <div className="text-xs text-[#B8B5AE] pt-2 border-t border-[#2E3035] flex justify-between">
                    <span>{appt.service?.name}</span>
                    <span className="text-[#F5F2EA]">{appt.barber?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WEEK & MONTH OVERVIEW */}
      {(viewMode === 'week' || viewMode === 'month') && (
        <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2E3035] pb-4">
            <h3 className="font-serif text-xl text-[#F5F2EA]">
              {viewMode === 'week' ? '7-Day Rolling View' : 'Monthly Booking Schedule'}
            </h3>
            <span className="text-xs text-[#B8B5AE]">Click any day to jump into Day view</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {[...Array(7)].map((_, i) => {
              const d = new Date(selectedDate + 'T12:00:00Z');
              d.setDate(d.getDate() + i);
              const dateStr = d.toISOString().split('T')[0];
              const apptsOnDate = appointments.filter((a) => a.appointment_date === dateStr);
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setViewMode('day');
                  }}
                  className={`p-3 rounded border cursor-pointer hover:border-[#C5A059] transition-all min-h-36 flex flex-col justify-between ${
                    dateStr === selectedDate
                      ? 'bg-[#202124] border-[#C5A059]'
                      : 'bg-[#141517] border-[#2E3035]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-[#F5F2EA]">{dayName}</span>
                      <span className="text-[11px] text-[#B8B5AE]">{d.getDate()}</span>
                    </div>
                    <span className="text-[11px] text-[#C5A059] block font-mono">
                      {apptsOnDate.length} appts
                    </span>
                  </div>

                  <div className="space-y-1 mt-2">
                    {apptsOnDate.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        className="text-[10px] p-1 bg-[#1A1B1D] rounded truncate text-[#F5F2EA] border border-[#2E3035]"
                      >
                        {formatTime12Hour(a.start_time)} {a.customer_name}
                      </div>
                    ))}
                    {apptsOnDate.length > 3 && (
                      <span className="text-[10px] text-[#B8B5AE] block">
                        +{apptsOnDate.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 bg-[#121314]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-[#2E3035] pb-3">
              <div>
                <span className="font-mono text-xs text-[#C5A059] font-bold">
                  {selectedAppt.confirmation_code}
                </span>
                <h3 className="font-serif text-xl text-[#F5F2EA] mt-0.5">
                  {selectedAppt.customer_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppt(null)}
                className="text-[#B8B5AE] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="flex justify-between py-1 border-b border-[#2E3035]">
                <span className="text-[#B8B5AE]">Phone:</span>
                <span className="text-[#F5F2EA] font-medium">{selectedAppt.customer_phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2E3035]">
                <span className="text-[#B8B5AE]">Service:</span>
                <span className="text-[#F5F2EA] font-medium">{selectedAppt.service?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2E3035]">
                <span className="text-[#B8B5AE]">Barber:</span>
                <span className="text-[#F5F2EA] font-medium">{selectedAppt.barber?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2E3035]">
                <span className="text-[#B8B5AE]">Time:</span>
                <span className="text-[#C5A059] font-medium">
                  {formatTime12Hour(selectedAppt.start_time)} – {formatTime12Hour(selectedAppt.end_time)}
                </span>
              </div>
              {selectedAppt.notes && (
                <div className="py-1">
                  <span className="text-[#B8B5AE] block mb-1">Notes:</span>
                  <p className="p-2 bg-[#121314] rounded text-[#F5F2EA] italic">
                    {selectedAppt.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Status Buttons */}
            <div className="pt-2">
              <span className="text-[11px] text-[#B8B5AE] uppercase tracking-wider block mb-2 font-semibold">
                Update Status
              </span>
              <div className="flex flex-wrap gap-2">
                {['confirmed', 'completed', 'cancelled', 'no_show'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusUpdate(selectedAppt.id, st)}
                    className={`px-3 py-1 rounded uppercase font-semibold text-[10px] transition-colors ${
                      selectedAppt.status === st
                        ? 'bg-[#C5A059] text-[#121314]'
                        : 'bg-[#121314] text-[#B8B5AE] hover:text-white border border-[#2E3035]'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#2E3035] flex justify-end">
              <button
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 bg-[#202124] text-xs font-semibold text-[#F5F2EA] rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
