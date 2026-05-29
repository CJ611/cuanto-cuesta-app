import { supabase } from '../utils/supabase';
import { Producto } from '../types';

export const productosService = {
  async getByTienda(tiendaId: string): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('tienda_id', tiendaId)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Producto[];
  },

  async getAll(tiendaId: string, categoria?: string): Promise<Producto[]> {
    let query = supabase
      .from('productos')
      .select('*')
      .eq('tienda_id', tiendaId)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (categoria && categoria !== 'Todos') {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Producto[];
  },

  async search(tiendaId: string, searchTerm: string): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('tienda_id', tiendaId)
      .eq('activo', true)
      .ilike('nombre', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Producto[];
  },

  async create(producto: Omit<Producto, 'id' | 'created_at' | 'updated_at' | 'activo'>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .insert({ ...producto, activo: true })
      .select()
      .single();

    if (error) throw error;
    return data as Producto;
  },

  async update(id: string, updates: Partial<Producto>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Producto;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;
  },

  async uploadImage(uri: string, fileName: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileExt = fileName.split('.').pop();
    const filePath = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('productos')
      .upload(filePath, blob, { contentType: `image/${fileExt}` });

    if (error) throw error;

    const { data } = supabase.storage
      .from('productos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};
