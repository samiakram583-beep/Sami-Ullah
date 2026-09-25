import React, { useState, useEffect } from 'react';
import { AppointmentItem } from '../../types';
import { appointmentsService } from '../../services/appointments.service';
import { formatDateEditorial } from '../../lib/booking/time-utils';
import { Search, Users, Phone, Mail, Calendar } from 'lucide-react';

interface AggregatedCustomer {
  email: string;
  name: string;
  phone: string;
  totalBookings: number;
  lastDate: string;
  statuses: { [key: string]: number };
}

export const AdminCustomers: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const list = await appointmentsService.getAll();
        setAppointments(list);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Aggregate customers by email / phone
  const customerMap = new Map<string, AggregatedCustomer>();

  appointments.forEach((appt) => {
    const key = (appt.customer_email || appt.customer_phone || appt.customer_name).toLowerCase().trim();
    if (!key) return;

    if (!customerMap.has(key)) {
      customerMap.set(key, {
        email: appt.customer_email || '—',
        name: appt.customer_name,
        phone: appt.customer_phone,
        totalBookings: 0,
        lastDate: appt.appointment_date,
        statuses: {},
      });
    }

    const c = customerMap.get(key)!;
    c.totalBookings += 1;
    if (appt.appointment_date > c.lastDate) {
      c.lastDate = appt.appointment_date;
    }
    c.statuses[appt.status] = (c.statuses[appt.status] || 0) + 1;
  });

  const customerList = Array.from(customerMap.values()).sort(
    (a, b) => b.totalBookings - a.totalBookings
  );

  const filtered = customerList.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#2E3035] pb-6">
        <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
          Client Directory
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA] mt-1">
          Customer Management
        </h1>
        <p className="text-xs text-[#B8B5AE] mt-1">
          Directory of registered accounts and booking clients with visit frequency and contact history.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-xs pl-9 pr-3 py-2 rounded focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-xs text-[#B8B5AE]">Loading clients...</div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-xs text-[#B8B5AE] space-y-2">
            <Users className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
            <p className="text-sm font-medium text-[#F5F2EA]">No customer profiles match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#B8B5AE]">
              <thead className="bg-[#141517] text-[#F5F2EA] uppercase tracking-wider font-semibold border-b border-[#2E3035]">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Total Bookings</th>
                  <th className="py-3 px-4">Most Recent Appointment</th>
                  <th className="py-3 px-4">Status Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E3035]">
                {filtered.map((c, idx) => (
                  <tr key={idx} className="hover:bg-[#202124]">
                    <td className="py-3 px-4">
                      <strong className="text-[#F5F2EA] text-sm block">{c.name}</strong>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[#F5F2EA]">
                        <Phone className="w-3 h-3 text-[#C5A059]" />
                        <span>{c.phone}</span>
                      </div>
                      {c.email !== '—' && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#B8B5AE]">
                          <Mail className="w-3 h-3 text-[#B8B5AE]" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#C5A059]">
                      {c.totalBookings} visit{c.totalBookings > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 text-[#F5F2EA]">
                      {formatDateEditorial(c.lastDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {Object.entries(c.statuses).map(([status, count]) => (
                          <span
                            key={status}
                            className="bg-[#121314] px-1.5 py-0.5 rounded border border-[#2E3035]"
                          >
                            {status}: <strong className="text-[#F5F2EA]">{count}</strong>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
