import React, { useState, useEffect } from 'react';
import { AppointmentItem } from '../../types';
import { appointmentsService } from '../../services/appointments.service';
import {
  getNewYorkTodayString,
  formatDateEditorial,
  formatTime12Hour,
} from '../../lib/booking/time-utils';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Scissors,
  ArrowRight,
} from 'lucide-react';

interface AdminDashboardHomeProps {
  onNavigateToTab: (tab: any) => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({ onNavigateToTab }) => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = getNewYorkTodayString();

  useEffect(() => {
    async function loadData() {
      try {
        const list = await appointmentsService.getAll();
        setAppointments(list);
      } catch (err) {
        console.error('Failed to load dashboard appointments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const todayAppts = appointments
    .filter((a) => a.appointment_date === todayStr)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const upcomingCount = appointments.filter(
    (a) => a.appointment_date > todayStr && a.status !== 'cancelled'
  ).length;

  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-10">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E3035] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
            Overview & Schedule
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA] mt-1">
            Shop Operations Dashboard
          </h1>
          <p className="text-xs text-[#B8B5AE] mt-1">
            {formatDateEditorial(todayStr)} · Catonsville, MD
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('appointments')}
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Manage Bookings
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today */}
        <div className="p-6 bg-[#1A1B1D] border border-[#2E3035] rounded space-y-2">
          <div className="flex items-center justify-between text-[#B8B5AE]">
            <span className="text-xs uppercase tracking-wider font-semibold">Today's Bookings</span>
            <Clock className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="font-serif text-3xl text-[#F5F2EA] tabular-nums">
            {todayAppts.length}
          </div>
          <p className="text-[11px] text-[#B8B5AE]">Active schedule for today</p>
        </div>

        {/* Card 2: Upcoming */}
        <div className="p-6 bg-[#1A1B1D] border border-[#2E3035] rounded space-y-2">
          <div className="flex items-center justify-between text-[#B8B5AE]">
            <span className="text-xs uppercase tracking-wider font-semibold">Future Upcoming</span>
            <CalendarCheck className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="font-serif text-3xl text-[#F5F2EA] tabular-nums">
            {upcomingCount}
          </div>
          <p className="text-[11px] text-[#B8B5AE]">Bookings scheduled ahead</p>
        </div>

        {/* Card 3: Completed */}
        <div className="p-6 bg-[#1A1B1D] border border-[#2E3035] rounded space-y-2">
          <div className="flex items-center justify-between text-[#B8B5AE]">
            <span className="text-xs uppercase tracking-wider font-semibold">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-serif text-3xl text-[#F5F2EA] tabular-nums">
            {completedCount}
          </div>
          <p className="text-[11px] text-[#B8B5AE]">Total services completed</p>
        </div>

        {/* Card 4: Cancelled */}
        <div className="p-6 bg-[#1A1B1D] border border-[#2E3035] rounded space-y-2">
          <div className="flex items-center justify-between text-[#B8B5AE]">
            <span className="text-xs uppercase tracking-wider font-semibold">Cancelled</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="font-serif text-3xl text-[#F5F2EA] tabular-nums">
            {cancelledCount}
          </div>
          <p className="text-[11px] text-[#B8B5AE]">Customer or shop cancellations</p>
        </div>
      </div>

      {/* Today's Schedule Timeline */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#2E3035] pb-4">
          <div>
            <h2 className="font-serif text-2xl text-[#F5F2EA]">Today's Appointment Timeline</h2>
            <p className="text-xs text-[#B8B5AE] mt-0.5">
              Live progression of chairs, appointments, and client arrivals.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="text-xs text-[#C5A059] font-medium hover:underline flex items-center gap-1"
          >
            Open Full Calendar <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#B8B5AE]">Loading today's appointments...</div>
        ) : todayAppts.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#B8B5AE] space-y-2">
            <Clock className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
            <p className="text-sm font-medium text-[#F5F2EA]">No appointments booked for today yet.</p>
            <p className="text-xs text-[#B8B5AE]">Telephone customers can be manually added via Appointments tab.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppts.map((appt) => (
              <div
                key={appt.id}
                className="p-4 bg-[#141517] border border-[#2E3035] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#C5A059]/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="px-3 py-2 bg-[#202124] rounded border border-[#2E3035] text-center min-w-24">
                    <span className="font-mono text-xs font-bold text-[#C5A059] block">
                      {formatTime12Hour(appt.start_time)}
                    </span>
                    <span className="text-[10px] text-[#B8B5AE] block">
                      to {formatTime12Hour(appt.end_time)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#F5F2EA]">
                        {appt.customer_name}
                      </span>
                      <span className="text-xs text-[#B8B5AE]">({appt.customer_phone})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#B8B5AE]">
                      <span className="flex items-center gap-1">
                        <Scissors className="w-3 h-3 text-[#C5A059]" />
                        {appt.service?.name}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#C5A059]" />
                        {appt.barber?.name}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[11px] text-[#C5A059]">
                        {appt.confirmation_code}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider border ${
                      appt.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : appt.status === 'completed'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : appt.status === 'cancelled'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
