import { BarberItem } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { localDb } from '../lib/supabase/mock-store';
import { getImageUrl } from '../lib/images';

export const barbersService = {
  async getAll(includeInactive = false): Promise<BarberItem[]> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('barbers').select('*').order('display_order', { ascending: true });
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Supabase query error in barbersService.getAll:', error);
      }
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          ...item,
          specialties: Array.isArray(item.specialties) ? item.specialties : [],
          active: Boolean(item.active),
          display_order: Number(item.display_order) || 0,
          image_url: item.image_url ? getImageUrl(item.image_url) : undefined,
        })) as BarberItem[];
      }
    }
    const all = localDb.getBarbers();
    const sorted = [...all].sort((a, b) => a.display_order - b.display_order);
    const barbers = includeInactive ? sorted : sorted.filter((b) => b.active);
    return barbers.map((b) => ({
      ...b,
      image_url: b.image_url ? getImageUrl(b.image_url) : undefined,
    }));
  },

  async getById(id: string): Promise<BarberItem | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('barbers').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          ...data,
          image_url: data.image_url ? getImageUrl(data.image_url) : undefined,
        } as BarberItem;
      }
    }
    const item = localDb.getBarbers().find((b) => b.id === id);
    if (!item) return null;
    return {
      ...item,
      image_url: item.image_url ? getImageUrl(item.image_url) : undefined,
    };
  },

  async create(barber: Omit<BarberItem, 'id' | 'created_at' | 'updated_at'>): Promise<BarberItem> {
    const newBarber: BarberItem = {
      ...barber,
      id: 'barber-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('barbers').insert([barber]).select().single();
      if (!error && data) return data as BarberItem;
    }

    localDb.saveBarber(newBarber);
    return newBarber;
  },

  async update(id: string, updates: Partial<BarberItem>): Promise<BarberItem> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('barbers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as BarberItem;
    }

    const current = await this.getById(id);
    if (!current) throw new Error('Barber not found');
    const updated: BarberItem = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localDb.saveBarber(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('barbers').delete().eq('id', id);
    }
    localDb.deleteBarber(id);
  },
};
