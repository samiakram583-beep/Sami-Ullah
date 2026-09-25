import React, { useState, useEffect } from 'react';
import { BusinessHoursItem } from '../../types';
import { businessHoursService } from '../../services/business-hours.service';
import { useToast } from '../common/Toast';
import { Clock, Save, RefreshCw } from 'lucide-react';

export const AdminHours: React.FC = () => {
  const { showToast } = useToast();
  const [hours, setHours] = useState<BusinessHoursItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadHours = async () => {
    setLoading(true);
    try {
      const list = await businessHoursService.getAll();
      setHours(list);
    } catch (err) {
      console.error('Error loading business hours:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHours();
  }, []);

  const handleChange = (dayOfWeek: number, field: keyof BusinessHoursItem, value: any) => {
    setHours((prev) =>
      prev.map((h) => (h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h))
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await businessHoursService.saveAll(hours);
      showToast('Weekly business hours saved successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save hours.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E3035] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
            Store Schedule
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA] mt-1">
            Weekly Business Hours
          </h1>
          <p className="text-xs text-[#B8B5AE] mt-1">
            Configure opening and closing times for each day of the week. Time slots will automatically generate within these operating windows.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] active:bg-[#A4833E] disabled:opacity-50 text-[#121314] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'SAVING...' : 'SAVE ALL HOURS'}
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-[#B8B5AE]">Loading business hours...</div>
      ) : (
        <div className="bg-[#1A1B1D] border border-[#2E3035] rounded divide-y divide-[#2E3035]">
          {hours.map((h) => (
            <div
              key={h.day_of_week}
              className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                h.is_closed ? 'opacity-60 bg-[#121314]/30' : 'hover:bg-[#202124]'
              }`}
            >
              <div className="w-40">
                <span className="font-serif text-lg text-[#F5F2EA] block">{h.day_name}</span>
                <span className="text-[11px] text-[#B8B5AE]">
                  {h.is_closed ? 'Shop is Closed' : 'Open for Bookings'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <label className="block text-[#B8B5AE] mb-1 font-medium">Opening Time</label>
                  <input
                    type="time"
                    disabled={h.is_closed}
                    value={h.open_time}
                    onChange={(e) => handleChange(h.day_of_week, 'open_time', e.target.value)}
                    className="bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059] disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="block text-[#B8B5AE] mb-1 font-medium">Closing Time</label>
                  <input
                    type="time"
                    disabled={h.is_closed}
                    value={h.close_time}
                    onChange={(e) => handleChange(h.day_of_week, 'close_time', e.target.value)}
                    className="bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059] disabled:opacity-40"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id={`closed_${h.day_of_week}`}
                    checked={h.is_closed}
                    onChange={(e) => handleChange(h.day_of_week, 'is_closed', e.target.checked)}
                    className="rounded text-[#C5A059]"
                  />
                  <label
                    htmlFor={`closed_${h.day_of_week}`}
                    className="text-[#F5F2EA] font-medium cursor-pointer"
                  >
                    Mark Day as Closed
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
