import { ServiceItem } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { localDb } from '../lib/supabase/mock-store';
import { getImageUrl } from '../lib/images';

export const servicesService = {
  async getAll(includeInactive = false): Promise<ServiceItem[]> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('services').select('*').order('display_order', { ascending: true });
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Supabase query error in servicesService.getAll:', error);
        throw new Error(`Failed to load services: ${error.message || 'Database error'}`);
      }
      if (data && data.length > 0) {
        return data.map((item: any) => ({
          ...item,
          price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
          duration_minutes: Number(item.duration_minutes) || 30,
          display_order: Number(item.display_order) || 0,
          active: Boolean(item.active),
          image_url: item.image_url ? getImageUrl(item.image_url) : undefined,
        })) as ServiceItem[];
      }
    }
    // Fallback if not configured or empty
    const all = localDb.getServices();
    const sorted = [...all].sort((a, b) => a.display_order - b.display_order);
    const services = includeInactive ? sorted : sorted.filter((s) => s.active);
    return services.map((s) => ({
      ...s,
      image_url: s.image_url ? getImageUrl(s.image_url) : undefined,
    }));
  },

  async getById(id: string): Promise<ServiceItem | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          ...data,
          price: typeof data.price === 'number' ? data.price : Number(data.price) || 0,
          duration_minutes: Number(data.duration_minutes) || 30,
          display_order: Number(data.display_order) || 0,
          active: Boolean(data.active),
          image_url: data.image_url ? getImageUrl(data.image_url) : undefined,
        } as ServiceItem;
      }
    }
    const item = localDb.getServices().find((s) => s.id === id);
    if (!item) return null;
    return {
      ...item,
      image_url: item.image_url ? getImageUrl(item.image_url) : undefined,
    };
  },

  async create(service: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceItem> {
    const slug = service.slug || service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newService: ServiceItem = {
      ...service,
      id: 'srv-' + Date.now(),
      slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('services').insert([service]).select().single();
      if (!error && data) return data as ServiceItem;
    }

    localDb.saveService(newService);
    return newService;
  },

  async update(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as ServiceItem;
    }

    const current = await this.getById(id);
    if (!current) throw new Error('Service not found');
    const updated: ServiceItem = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localDb.saveService(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('services').delete().eq('id', id);
    }
    localDb.deleteService(id);
  },
};
