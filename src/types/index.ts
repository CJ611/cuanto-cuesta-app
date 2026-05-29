export interface Tienda {
  id: string;
  nombre: string;
  propietario_id: string;
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'empleado';
  tienda_id: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: 'Alimentos' | 'Bebidas' | 'Limpieza' | 'Cuidado Personal' | 'Otros';
  imagen_url: string | null;
  activo: boolean;
  tienda_id: string;
  created_at: string;
  updated_at: string;
}

export interface Factura {
  id: string;
  usuario_id: string;
  tienda_id: string;
  total: number;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface FacturaItem {
  id: string;
  factura_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  created_at: string;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}
