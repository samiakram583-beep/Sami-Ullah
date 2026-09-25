import { GalleryImageItem } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { localDb } from '../lib/supabase/mock-store';
import { getImageUrl } from '../lib/images';

export const galleryService = {
  async getAll(includeInactive = false): Promise<GalleryImageItem[]> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('gallery_images').select('*').order('display_order', { ascending: true });
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          image_url: getImageUrl(item.image_url),
        })) as GalleryImageItem[];
      }
    }

    const all = localDb.getGallery();
    const sorted = [...all].sort((a, b) => a.display_order - b.display_order);
    const gallery = includeInactive ? sorted : sorted.filter((g) => g.active);
    return gallery.map((g) => ({
      ...g,
      image_url: getImageUrl(g.image_url),
    }));
  },

  async add(item: Omit<GalleryImageItem, 'id' | 'created_at'>): Promise<GalleryImageItem> {
    const newItem: GalleryImageItem = {
      ...item,
      id: 'gal-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('gallery_images').insert([item]).select().single();
      if (!error && data) return data as GalleryImageItem;
    }

    localDb.saveGalleryImage(newItem);
    return newItem;
  },

  async update(id: string, updates: Partial<GalleryImageItem>): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('gallery_images').update(updates).eq('id', id);
    }
    const current = localDb.getGallery().find((g) => g.id === id);
    if (current) {
      localDb.saveGalleryImage({ ...current, ...updates });
    }
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('gallery_images').delete().eq('id', id);
    }
    localDb.deleteGalleryImage(id);
  },
};
