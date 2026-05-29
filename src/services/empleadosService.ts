import { supabase } from '../utils/supabase';
import { Usuario } from '../types';

export const empleadosService = {
  async getByTienda(tiendaId: string): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tienda_id', tiendaId)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Usuario[];
  },

  async create(email: string, nombre: string, password: string, tiendaId: string): Promise<Usuario> {
    // Crear usuario en auth con contraseña temporal
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');

    // Crear perfil de empleado
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email,
        nombre,
        rol: 'empleado',
        tienda_id: tiendaId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  async update(id: string, updates: Partial<Usuario>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;
  },
};
