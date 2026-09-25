import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { AppointmentItem } from '../types';
import { appointmentsService } from '../services/appointments.service';
import {
  formatDateEditorial,
  formatTime12Hour,
  getNewYorkTodayString,
} from '../lib/booking/time-utils';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Phone,
  MapPin,
} from 'lucide-react';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserAppointments() {
      if (!user) return;
      setLoading(true);
      try {
        const list = await appointmentsService.getByCustomer(user.id || user.email);
        setAppointments(list);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserAppointments();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl text-[#F5F2EA]">Please Sign In</h2>
        <p className="text-xs text-[#B8B5AE]">
          You must be logged in to view your customer profile and booking history.
        </p>
        <button
          onClick={() => onNavigate('/auth/login')}
          className="px-6 py-3 bg-[#C5A059] text-[#121314] font-semibold text-xs uppercase tracking-wider"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const handleCancelAppointment = async (apptId: string) => {
    if (!window.confirm('Are you sure you wish to cancel this appointment?')) return;

    setCancellingId(apptId);
    try {
      const res = await appointmentsService.cancelByCustomer(apptId, user.email);
      if (res.success) {
        showToast('Appointment cancelled successfully.', 'success');
        // Refresh list
        const updated = await appointmentsService.getByCustomer(user.id || user.email);
        setAppointments(updated);
      } else {
        showToast(res.error || 'Unable to cancel appointment.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error processing cancellation.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const todayStr = getNewYorkTodayString();

  const upcomingAppts = appointments.filter(
    (a) => a.appointment_date >= todayStr && a.status !== 'cancelled'
  );
  const pastAppts = appointments.filter(
    (a) => a.appointment_date < todayStr && a.status !== 'cancelled'
  );
  const cancelledAppts = appointments.filter((a) => a.status === 'cancelled');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Account Profile Header */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#202124] border border-[#2E3035] flex items-center justify-center text-xl font-serif text-[#C5A059]">
            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#F5F2EA]">{user.full_name || 'Customer'}</h1>
            <p className="text-xs text-[#B8B5AE]">{user.email} {user.phone && `· ${user.phone}`}</p>
            <span className="inline-block mt-1 text-[11px] text-[#C5A059] uppercase tracking-wider font-semibold">
              Customer Account
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('/book')}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors"
          >
            BOOK APPOINTMENT
          </button>
          <button
            onClick={() => logout()}
            className="px-4 py-2.5 bg-[#202124] hover:bg-[#282a2e] text-[#B8B5AE] hover:text-red-400 border border-[#2E3035] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-24 text-center text-[#B8B5AE] text-sm">
          Loading your appointments...
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Upcoming Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E3035] pb-3">
              <h2 className="font-serif text-2xl text-[#F5F2EA]">Upcoming Appointments</h2>
              <span className="text-xs text-[#C5A059] font-medium">{upcomingAppts.length} active</span>
            </div>

            {upcomingAppts.length === 0 ? (
              <div className="p-8 bg-[#1A1B1D] border border-[#2E3035] rounded text-center space-y-3">
                <Calendar className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
                <p className="text-sm font-medium text-[#F5F2EA]">No upcoming appointments.</p>
                <p className="text-xs text-[#B8B5AE]">Need a fresh cut or beard sculpt? Book your chair today.</p>
                <button
                  onClick={() => onNavigate('/book')}
                  className="mt-2 px-6 py-2.5 bg-[#C5A059] text-[#121314] text-xs font-semibold uppercase tracking-wider"
                >
                  SCHEDULE NOW
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAppts.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-[#1A1B1D] border border-[#2E3035] rounded p-6 space-y-4 hover:border-[#C5A059]/40 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-mono text-[#C5A059] font-semibold">
                          {appt.confirmation_code}
                        </span>
                        <h3 className="font-serif text-lg text-[#F5F2EA] mt-0.5">
                          {appt.service?.name}
                        </h3>
                        <p className="text-xs text-[#B8B5AE]">
                          Barber: <strong className="text-[#F5F2EA]">{appt.barber?.name || 'Master Barber'}</strong>
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {appt.status}
                      </span>
                    </div>

                    <div className="p-3 bg-[#121314] rounded border border-[#2E3035] text-xs space-y-1">
                      <div className="flex items-center gap-2 text-[#F5F2EA]">
                        <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{formatDateEditorial(appt.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#C5A059] font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{formatTime12Hour(appt.start_time)} – {formatTime12Hour(appt.end_time)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#2E3035]">
                      <span className="text-xs font-semibold text-[#F5F2EA]">
                        ${appt.service?.price.toFixed(2)}
                      </span>
                      <button
                        disabled={cancellingId === appt.id}
                        onClick={() => handleCancelAppointment(appt.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-medium disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past Appointments Section */}
          <section className="space-y-4">
            <div className="border-b border-[#2E3035] pb-3">
              <h2 className="font-serif text-2xl text-[#F5F2EA]">Past Appointments</h2>
            </div>

            {pastAppts.length === 0 ? (
              <p className="text-xs text-[#B8B5AE] py-4">No completed past appointments recorded yet.</p>
            ) : (
              <div className="bg-[#1A1B1D] border border-[#2E3035] rounded overflow-x-auto">
                <table className="w-full text-left text-xs text-[#B8B5AE]">
                  <thead className="bg-[#141517] text-[#F5F2EA] uppercase tracking-wider font-semibold border-b border-[#2E3035]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Barber</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2E3035]">
                    {pastAppts.map((appt) => (
                      <tr key={appt.id} className="hover:bg-[#202124]">
                        <td className="py-3 px-4 text-[#F5F2EA]">
                          {appt.appointment_date} at {formatTime12Hour(appt.start_time)}
                        </td>
                        <td className="py-3 px-4">{appt.service?.name}</td>
                        <td className="py-3 px-4">{appt.barber?.name}</td>
                        <td className="py-3 px-4 font-mono">{appt.confirmation_code}</td>
                        <td className="py-3 px-4 uppercase">{appt.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Cancelled History */}
          {cancelledAppts.length > 0 && (
            <section className="space-y-4 opacity-75">
              <div className="border-b border-[#2E3035] pb-3">
                <h2 className="font-serif text-xl text-[#F5F2EA]">Cancelled Bookings</h2>
              </div>
              <div className="bg-[#1A1B1D] border border-[#2E3035] rounded divide-y divide-[#2E3035] text-xs text-[#B8B5AE]">
                {cancelledAppts.map((c) => (
                  <div key={c.id} className="p-4 flex justify-between items-center">
                    <div>
                      <span className="text-[#F5F2EA] font-medium">{c.service?.name}</span> · {c.appointment_date} at {formatTime12Hour(c.start_time)}
                    </div>
                    <span className="text-red-400 font-semibold uppercase">Cancelled</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
};
