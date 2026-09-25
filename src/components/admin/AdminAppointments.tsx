import React, { useState, useEffect } from 'react';
import { AppointmentItem, AppointmentStatus, ServiceItem, BarberItem } from '../../types';
import { appointmentsService } from '../../services/appointments.service';
import { servicesService } from '../../services/services.service';
import { barbersService } from '../../services/barbers.service';
import { useToast } from '../common/Toast';
import {
  formatDateEditorial,
  formatTime12Hour,
  addMinutesToTime,
  getNewYorkTodayString,
} from '../../lib/booking/time-utils';
import {
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Eye,
  Trash2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export const AdminAppointments: React.FC = () => {
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [barberFilter, setBarberFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Selected Appointment for Detail Modal
  const [viewingAppt, setViewingAppt] = useState<AppointmentItem | null>(null);

  // Manual Override Booking Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_id: '',
    barber_id: '',
    appointment_date: getNewYorkTodayString(),
    start_time: '10:00',
    notes: 'Phone call booking',
    status: 'confirmed' as AppointmentStatus,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [appts, srv, brb] = await Promise.all([
        appointmentsService.getAll(),
        servicesService.getAll(true),
        barbersService.getAll(true),
      ]);
      setAppointments(appts);
      setServices(srv);
      setBarbers(brb);
      if (srv.length > 0 && !manualForm.service_id) {
        setManualForm((prev) => ({ ...prev, service_id: srv[0].id }));
      }
      if (brb.length > 0 && !manualForm.barber_id) {
        setManualForm((prev) => ({ ...prev, barber_id: brb[0].id }));
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      showToast('Error loading appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentsService.updateStatus(id, newStatus);
      showToast(`Appointment status updated to ${newStatus}.`, 'success');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      if (viewingAppt && viewingAppt.id === id) {
        setViewingAppt({ ...viewingAppt, status: newStatus });
      }
    } catch (err: any) {
      showToast(err.message || 'Status update failed.', 'error');
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find((s) => s.id === manualForm.service_id);
    if (!service) {
      showToast('Please select a valid service.', 'error');
      return;
    }
    const endTime = addMinutesToTime(manualForm.start_time, service.duration_minutes);

    try {
      await appointmentsService.createAdminBooking({
        ...manualForm,
        end_time: endTime,
        customer_id: null,
      });
      showToast('Manual telephone appointment recorded successfully.', 'success');
      setShowManualModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save appointment.', 'error');
    }
  };

  // Filter application
  const filteredAppointments = appointments.filter((a) => {
    // Search query matches customer name, email, phone, or confirmation code
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = a.customer_name?.toLowerCase().includes(q);
      const matchEmail = a.customer_email?.toLowerCase().includes(q);
      const matchPhone = a.customer_phone?.toLowerCase().includes(q);
      const matchCode = a.confirmation_code?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchCode) return false;
    }

    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (barberFilter !== 'all' && a.barber_id !== barberFilter) return false;
    if (serviceFilter !== 'all' && a.service_id !== serviceFilter) return false;
    if (dateFilter && a.appointment_date !== dateFilter) return false;

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header with Title & Manual Booking CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E3035] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
            Scheduling Operations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA] mt-1">
            Appointment Management
          </h1>
          <p className="text-xs text-[#B8B5AE] mt-1">
            Search, filter, update appointment statuses, or record walk-in/call-in bookings.
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          MANUAL / PHONE BOOKING
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, phone, email, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] pl-9 pr-3 py-2 rounded focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] p-2 rounded focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* Barber Filter */}
          <div>
            <select
              value={barberFilter}
              onChange={(e) => setBarberFilter(e.target.value)}
              className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] p-2 rounded focus:outline-none"
            >
              <option value="all">All Barbers</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] p-2 rounded focus:outline-none"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[11px] text-[#C5A059] hover:underline px-1"
              >
                Clear
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-[#B8B5AE] text-xs">Loading appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-24 text-center text-[#B8B5AE] text-xs space-y-2">
            <Calendar className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
            <p className="text-sm font-medium text-[#F5F2EA]">No appointments matching the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#B8B5AE]">
              <thead className="bg-[#141517] text-[#F5F2EA] uppercase tracking-wider font-semibold border-b border-[#2E3035]">
                <tr>
                  <th className="py-3 px-4">Code / Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Barber</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E3035]">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-[#202124] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-[#C5A059] font-bold block">{appt.confirmation_code}</span>
                      <span className="text-[11px] text-[#B8B5AE] block">{appt.appointment_date}</span>
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-[#F5F2EA] block">{appt.customer_name}</strong>
                      <span className="text-[11px] text-[#B8B5AE] block">{appt.customer_phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#F5F2EA]">{appt.service?.name || 'Haircut'}</span>
                      <span className="text-[11px] text-[#C5A059] block">${appt.service?.price?.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-[#F5F2EA]">
                      {appt.barber?.name || 'Master Barber'}
                    </td>
                    <td className="py-3 px-4 tabular-nums text-[#F5F2EA] font-medium">
                      {formatTime12Hour(appt.start_time)} – {formatTime12Hour(appt.end_time)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${
                          appt.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : appt.status === 'completed'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : appt.status === 'cancelled'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : appt.status === 'no_show'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingAppt(appt)}
                          title="View Details"
                          className="p-1 text-[#B8B5AE] hover:text-[#C5A059]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {appt.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(appt.id, 'completed')}
                            title="Mark Completed"
                            className="p-1 text-[#B8B5AE] hover:text-emerald-400"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {appt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(appt.id, 'cancelled')}
                            title="Cancel Appointment"
                            className="p-1 text-[#B8B5AE] hover:text-red-400"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {viewingAppt && (
        <div className="fixed inset-0 z-50 bg-[#121314]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-[#2E3035] pb-4">
              <div>
                <span className="font-mono text-sm text-[#C5A059] font-bold">
                  {viewingAppt.confirmation_code}
                </span>
                <h3 className="font-serif text-2xl text-[#F5F2EA] mt-0.5">
                  Appointment Details
                </h3>
              </div>
              <button
                onClick={() => setViewingAppt(null)}
                className="text-[#B8B5AE] hover:text-[#F5F2EA]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#121314] rounded border border-[#2E3035]">
                <div>
                  <span className="text-[#B8B5AE] block">Customer:</span>
                  <strong className="text-[#F5F2EA] block mt-0.5">{viewingAppt.customer_name}</strong>
                  <span className="text-[#B8B5AE]">{viewingAppt.customer_phone}</span>
                  <span className="text-[#B8B5AE] block">{viewingAppt.customer_email}</span>
                </div>
                <div>
                  <span className="text-[#B8B5AE] block">Service & Barber:</span>
                  <strong className="text-[#F5F2EA] block mt-0.5">{viewingAppt.service?.name}</strong>
                  <span className="text-[#C5A059] block">${viewingAppt.service?.price?.toFixed(2)}</span>
                  <span className="text-[#B8B5AE] block">{viewingAppt.barber?.name}</span>
                </div>
              </div>

              <div>
                <span className="text-[#B8B5AE] block">Scheduled Time:</span>
                <span className="text-sm font-semibold text-[#F5F2EA]">
                  {formatDateEditorial(viewingAppt.appointment_date)} at {formatTime12Hour(viewingAppt.start_time)} – {formatTime12Hour(viewingAppt.end_time)}
                </span>
              </div>

              {viewingAppt.notes && (
                <div>
                  <span className="text-[#B8B5AE] block mb-1">Customer Notes:</span>
                  <p className="p-3 bg-[#121314] rounded border border-[#2E3035] text-[#F5F2EA] italic">
                    {viewingAppt.notes}
                  </p>
                </div>
              )}

              {/* Status Update Buttons */}
              <div className="pt-2">
                <span className="text-[#B8B5AE] uppercase tracking-wider font-semibold block mb-2">
                  Change Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['confirmed', 'completed', 'cancelled', 'no_show'] as AppointmentStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(viewingAppt.id, st)}
                      className={`px-3 py-1.5 rounded uppercase font-semibold text-[11px] transition-colors ${
                        viewingAppt.status === st
                          ? 'bg-[#C5A059] text-[#121314]'
                          : 'bg-[#121314] text-[#B8B5AE] hover:text-[#F5F2EA] border border-[#2E3035]'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2E3035] flex justify-end">
              <button
                onClick={() => setViewingAppt(null)}
                className="px-5 py-2 bg-[#202124] text-[#F5F2EA] text-xs font-semibold uppercase tracking-wider rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual / Telephone Booking Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-[#121314]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#2E3035] pb-4">
              <h3 className="font-serif text-2xl text-[#F5F2EA]">Manual Appointment Entry</h3>
              <button onClick={() => setShowManualModal(false)} className="text-[#B8B5AE] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleManualCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#F5F2EA] font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={manualForm.customer_name}
                    onChange={(e) => setManualForm({ ...manualForm, customer_name: e.target.value })}
                    className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#F5F2EA] font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(410) 000-0000"
                    value={manualForm.customer_phone}
                    onChange={(e) => setManualForm({ ...manualForm, customer_phone: e.target.value })}
                    className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={manualForm.customer_email}
                  onChange={(e) => setManualForm({ ...manualForm, customer_email: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#F5F2EA] font-semibold mb-1">Service *</label>
                  <select
                    value={manualForm.service_id}
                    onChange={(e) => setManualForm({ ...manualForm, service_id: e.target.value })}
                    className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#F5F2EA] font-semibold mb-1">Barber *</label>
                  <select
                    value={manualForm.barber_id}
                    onChange={(e) => setManualForm({ ...manualForm, barber_id: e.target.value })}
                    className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#F5F2EA] font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.appointment_date}
                    onChange={(e) => setManualForm({ ...manualForm, appointment_date: e.target.value })}
                    className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#F5F2EA] font-semibold mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={manualForm.start_time}
                    onChange={(e) => setManualForm({ ...manualForm, start_time: e.target.value })}
                    className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2E3035]">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-[#202124] text-[#B8B5AE] hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C5A059] text-[#121314] font-semibold uppercase tracking-wider"
                >
                  SAVE APPOINTMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
