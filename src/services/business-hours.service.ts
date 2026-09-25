import { BusinessHoursItem } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { localDb } from '../lib/supabase/mock-store';

export const businessHoursService = {
  async getAll(): Promise<BusinessHoursItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .order('day_of_week', { ascending: true });
      if (!error && data) {
        return data as BusinessHoursItem[];
      }
    }
    return localDb.getBusinessHours();
  },

  async update(id: string, updates: Partial<BusinessHoursItem>): Promise<BusinessHoursItem[]> {
    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('business_hours')
        .update(updates)
        .eq('id', id);
    }
    const current = localDb.getBusinessHours();
    const updated = current.map((h) => (h.id === id ? { ...h, ...updates } : h));
    localDb.saveBusinessHours(updated);
    return updated;
  },

  async saveAll(hours: BusinessHoursItem[]): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('business_hours').upsert(hours);
    }
    localDb.saveBusinessHours(hours);
  },
};
