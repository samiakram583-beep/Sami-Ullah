import { ContactMessageItem } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { localDb } from '../lib/supabase/mock-store';

export const contactService = {
  async submit(message: { name: string; email: string; phone?: string; message: string }): Promise<{ success: boolean; error?: string }> {
    const item: ContactMessageItem = {
      id: 'msg-' + Date.now(),
      name: message.name.trim(),
      email: message.email.trim(),
      phone: message.phone?.trim() || undefined,
      message: message.message.trim(),
      status: 'new',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('contact_messages').insert([item]);
      if (error) {
        console.error('Supabase contact message error:', error);
      }
    }

    localDb.addContactMessage(item);
    return { success: true };
  },

  async getAll(): Promise<ContactMessageItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as ContactMessageItem[];
    }
    return localDb.getContactMessages();
  },

  async updateStatus(id: string, status: ContactMessageItem['status']): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('contact_messages').update({ status }).eq('id', id);
    }
    localDb.updateContactMessageStatus(id, status);
  },
};
