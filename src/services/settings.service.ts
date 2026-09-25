import { ShopSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { localDb } from '../lib/supabase/mock-store';

export const settingsService = {
  async getSettings(): Promise<ShopSettings> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('shop_settings').select('*');
      if (!error && data && data.length > 0) {
        const gen = data.find((d) => d.key === 'general')?.value || {};
        const rules = data.find((d) => d.key === 'booking_rules')?.value || {};
        return {
          ...localDb.getSettings(),
          ...gen,
          ...rules,
        };
      }
    }
    return localDb.getSettings();
  },

  async updateSettings(settings: Partial<ShopSettings>): Promise<ShopSettings> {
    const current = await this.getSettings();
    const updated: ShopSettings = {
      ...current,
      ...settings,
    };

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('shop_settings').upsert([
        {
          key: 'general',
          value: {
            shop_name: updated.shop_name,
            tagline: updated.tagline,
            phone: updated.phone,
            address: updated.address,
            google_maps_url: updated.google_maps_url,
            timezone: updated.timezone,
            email: updated.email,
          },
        },
        {
          key: 'booking_rules',
          value: {
            min_notice_minutes: updated.min_notice_minutes,
            max_advance_days: updated.max_advance_days,
            cancellation_window_hours: updated.cancellation_window_hours,
            slot_interval_minutes: updated.slot_interval_minutes,
          },
        },
      ]);
    }

    localDb.saveSettings(updated);
    return updated;
  },
};
