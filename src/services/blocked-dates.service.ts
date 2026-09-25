import { BlockedDateItem } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { localDb } from '../lib/supabase/mock-store';

export const blockedDatesService = {
  async getAll(): Promise<BlockedDateItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('blocked_date', { ascending: true });
      if (!error && data) {
        return data as BlockedDateItem[];
      }
    }
    return localDb.getBlockedDates().sort((a, b) => a.blocked_date.localeCompare(b.blocked_date));
  },

  async add(dateStr: string, reason: string, createdBy?: string): Promise<BlockedDateItem> {
    const item: BlockedDateItem = {
      id: 'blk-' + Date.now(),
      blocked_date: dateStr,
      reason: reason.trim() || 'Shop Closure',
      created_by: createdBy,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('blocked_dates').insert([item]).select().single();
      if (!error && data) return data as BlockedDateItem;
    }

    localDb.addBlockedDate(item);
    return item;
  },

  async remove(dateStr: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('blocked_dates').delete().eq('blocked_date', dateStr);
    }
    localDb.removeBlockedDate(dateStr);
  },
};
