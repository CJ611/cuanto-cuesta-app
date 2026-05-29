import { supabase } from '../utils/supabase';
import { Usuario } from '../types';

export const usuariosService = {
  async getProfile(userId: string): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  async updateProfile(userId: string, updates: { nombre?: string }): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  },
};
