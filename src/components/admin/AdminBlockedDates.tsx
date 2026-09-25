import React, { useState, useEffect } from 'react';
import { BlockedDateItem } from '../../types';
import { blockedDatesService } from '../../services/blocked-dates.service';
import { useToast } from '../common/Toast';
import { formatDateEditorial, getNewYorkTodayString } from '../../lib/booking/time-utils';
import { CalendarOff, Plus, Trash2, Calendar } from 'lucide-react';

export const AdminBlockedDates: React.FC = () => {
  const { showToast } = useToast();
  const [blockedDates, setBlockedDates] = useState<BlockedDateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New blocked date form
  const [newDate, setNewDate] = useState(getNewYorkTodayString());
  const [newReason, setNewReason] = useState('Holiday Closure');
  const [submitting, setSubmitting] = useState(false);

  const loadBlockedDates = async () => {
    setLoading(true);
    try {
      const list = await blockedDatesService.getAll();
      setBlockedDates(list);
    } catch (err) {
      console.error('Error loading blocked dates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlockedDates();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      showToast('Please select a date to block.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await blockedDatesService.add(newDate, newReason);
      showToast(`${formatDateEditorial(newDate)} has been blocked.`, 'success');
      setNewReason('Holiday Closure');
      loadBlockedDates();
    } catch (err: any) {
      showToast(err.message || 'Error blocking date.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (dateStr: string) => {
    if (!window.confirm(`Unblock ${dateStr}? Customers will be able to book on this date.`)) return;

    try {
      await blockedDatesService.remove(dateStr);
      showToast(`${dateStr} unblocked.`, 'info');
      loadBlockedDates();
    } catch (err: any) {
      showToast(err.message || 'Failed to unblock date.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#2E3035] pb-6">
        <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
          Schedule Closures
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA] mt-1">
          Blocked Dates & Holidays
        </h1>
        <p className="text-xs text-[#B8B5AE] mt-1">
          Dates added here will be immediately closed on the public booking calendar with your custom closure message.
        </p>
      </div>

      {/* Add Blocked Date Form Card */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-6 sm:p-8 space-y-4">
        <h2 className="font-serif text-xl text-[#F5F2EA] flex items-center gap-2">
          <CalendarOff className="w-5 h-5 text-[#C5A059]" />
          Block a Shop Date
        </h2>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-end">
          <div>
            <label className="block text-[#F5F2EA] font-semibold mb-1">Select Date *</label>
            <input
              type="date"
              required
              min={getNewYorkTodayString()}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
            />
          </div>

          <div>
            <label className="block text-[#F5F2EA] font-semibold mb-1">Reason / Note for Clients *</label>
            <input
              type="text"
              required
              placeholder="e.g. Thanksgiving Holiday, Shop Renovation..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] active:bg-[#A4833E] disabled:opacity-50 text-[#121314] font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Blocking Date...' : 'BLOCK THIS DATE'}
            </button>
          </div>
        </form>
      </div>

      {/* Blocked Dates List */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden">
        <div className="p-4 bg-[#141517] border-b border-[#2E3035] flex items-center justify-between">
          <span className="font-serif text-lg text-[#F5F2EA]">Active Blocked Dates</span>
          <span className="text-xs text-[#C5A059] font-medium">{blockedDates.length} Dates Blocked</span>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs text-[#B8B5AE]">Loading blocked dates...</div>
        ) : blockedDates.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#B8B5AE] space-y-2">
            <Calendar className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
            <p className="text-sm font-medium text-[#F5F2EA]">No dates currently blocked.</p>
            <p>Shop operates under standard weekly hours.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2E3035]">
            {blockedDates.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#202124] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#F5F2EA]">
                      {formatDateEditorial(item.blocked_date)}
                    </span>
                    <span className="font-mono text-xs text-[#C5A059]">({item.blocked_date})</span>
                  </div>
                  <p className="text-xs text-[#B8B5AE] italic">{item.reason}</p>
                </div>

                <div>
                  <button
                    onClick={() => handleRemove(item.blocked_date)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Unblock Date
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
