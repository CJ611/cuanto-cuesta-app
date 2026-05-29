import { supabase } from '../utils/supabase';
import { Factura, FacturaItem, CartItem } from '../types';

export const facturasService = {
  async getByTienda(tiendaId: string): Promise<Factura[]> {
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .eq('tienda_id', tiendaId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Factura[];
  },

  async getById(id: string): Promise<Factura & { items: FacturaItem[] }> {
    const { data: factura, error: facturaError } = await supabase
      .from('facturas')
      .select('*')
      .eq('id', id)
      .single();

    if (facturaError) throw facturaError;

    const { data: items, error: itemsError } = await supabase
      .from('factura_items')
      .select('*')
      .eq('factura_id', id);

    if (itemsError) throw itemsError;

    return { ...(factura as Factura), items: items as FacturaItem[] };
  },

  async create(
    usuarioId: string,
    tiendaId: string,
    cartItems: CartItem[]
  ): Promise<Factura> {
    const total = cartItems.reduce(
      (sum, item) => sum + item.producto.precio * item.cantidad,
      0
    );

    // Crear factura
    const { data: factura, error: facturaError } = await supabase
      .from('facturas')
      .insert({
        usuario_id: usuarioId,
        tienda_id: tiendaId,
        total,
        estado: 'COMPLETADA',
      })
      .select()
      .single();

    if (facturaError) throw facturaError;

    // Crear items
    const items = cartItems.map((item) => ({
      factura_id: factura.id,
      producto_id: item.producto.id,
      cantidad: item.cantidad,
      precio_unitario: item.producto.precio,
    }));

    const { error: itemsError } = await supabase
      .from('factura_items')
      .insert(items);

    if (itemsError) throw itemsError;

    return factura as Factura;
  },

  async getWeeklySales(tiendaId: string): Promise<{ date: string; total: number }[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('facturas')
      .select('created_at, total')
      .eq('tienda_id', tiendaId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Agrupar por día
    const salesByDay: { [key: string]: number } = {};
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      salesByDay[dayName] = 0;
    }

    (data || []).forEach((factura: any) => {
      const date = new Date(factura.created_at);
      const dayName = days[date.getDay()];
      salesByDay[dayName] = (salesByDay[dayName] || 0) + Number(factura.total);
    });

    return Object.entries(salesByDay).map(([date, total]) => ({ date, total }));
  },

  generatePDFHtml(factura: Factura, items: FacturaItem[], productos: any[]): string {
    const itemsHtml = items.map((item) => {
      const producto = productos.find((p: any) => p.id === item.producto_id);
      return `
        <tr>
          <td>${producto?.nombre || 'Producto'}</td>
          <td>${item.cantidad}</td>
          <td>$${Number(item.precio_unitario).toLocaleString()}</td>
          <td>$${(item.cantidad * Number(item.precio_unitario)).toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1B2838; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1B2838; color: white; }
            .total { font-size: 20px; font-weight: bold; margin-top: 20px; }
            .header { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <h1>¿Cuánto cuesta?</h1>
          <p><strong>Factura:</strong> #${factura.id.substring(0, 8).toUpperCase()}</p>
          <p><strong>Fecha:</strong> ${new Date(factura.created_at).toLocaleDateString()}</p>
          <p><strong>Estado:</strong> ${factura.estado}</p>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <p class="total">Total: $${Number(factura.total).toLocaleString()}</p>
        </body>
      </html>
    `;
  },
};
