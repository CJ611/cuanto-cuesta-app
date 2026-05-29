-- ============================================
-- Schema para "¿Cuánto cuesta?" App
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- Tabla: tiendas
CREATE TABLE IF NOT EXISTS tiendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) UNIQUE NOT NULL,
  propietario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'empleado')),
  tienda_id UUID REFERENCES tiendas(id) ON DELETE CASCADE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2) NOT NULL,
  categoria VARCHAR(100) CHECK (categoria IN ('Alimentos', 'Bebidas', 'Limpieza', 'Cuidado Personal', 'Otros')),
  imagen_url VARCHAR(500),
  activo BOOLEAN DEFAULT true,
  tienda_id UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: facturas
CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tienda_id UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado TEXT DEFAULT 'COMPLETADA',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: factura_items
CREATE TABLE IF NOT EXISTS factura_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Habilitar Row Level Security (RLS)
-- ============================================

ALTER TABLE tiendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Políticas de seguridad RLS
-- ============================================

-- Políticas para tiendas
CREATE POLICY "Usuarios pueden ver su propia tienda" ON tiendas
  FOR SELECT USING (
    id IN (SELECT tienda_id FROM usuarios WHERE id = auth.uid())
  );

CREATE POLICY "Propietarios pueden actualizar su tienda" ON tiendas
  FOR UPDATE USING (propietario_id = auth.uid());

CREATE POLICY "Cualquier usuario autenticado puede crear tienda" ON tiendas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para usuarios
CREATE POLICY "Usuarios pueden ver miembros de su tienda" ON usuarios
  FOR SELECT USING (
    tienda_id IN (SELECT tienda_id FROM usuarios WHERE id = auth.uid())
  );

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins pueden crear empleados en su tienda" ON usuarios
  FOR INSERT WITH CHECK (
    tienda_id IN (SELECT tienda_id FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
    OR id = auth.uid()
  );

-- Políticas para productos
CREATE POLICY "Usuarios pueden ver productos de su tienda" ON productos
  FOR SELECT USING (
    tienda_id IN (SELECT tienda_id FROM usuarios WHERE id = auth.uid())
  );

CREATE POLICY "Admins pueden crear productos" ON productos
  FOR INSERT WITH CHECK (
    tienda_id IN (SELECT tienda_id FROM usuarios WHERE id = auth.uid())
  );

CREATE POLICY "Admins pueden actualizar productos de su tienda" ON productos
  FOR UPDATE USING (
    tienda_id IN (SELECT tienda_id FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "Admins pueden eliminar productos de su tienda" ON productos
  FOR DELETE USING (
    tienda_id IN (SELECT tienda_id FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- Políticas para facturas
CREATE POLICY "Usuarios pueden ver facturas de su tienda" ON facturas
  FOR SELECT USING (
    tienda_id IN (SELECT tienda_id FROM usuarios WHERE id = auth.uid())
  );

CREATE POLICY "Usuarios pueden crear facturas en su tienda" ON facturas
  FOR INSERT WITH CHECK (
    tienda_id IN (SELECT tienda_id FROM usuarios WHERE id = auth.uid())
  );

-- Políticas para factura_items
CREATE POLICY "Usuarios pueden ver items de facturas de su tienda" ON factura_items
  FOR SELECT USING (
    factura_id IN (
      SELECT id FROM facturas WHERE tienda_id IN (
        SELECT tienda_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuarios pueden crear items de facturas" ON factura_items
  FOR INSERT WITH CHECK (
    factura_id IN (
      SELECT id FROM facturas WHERE tienda_id IN (
        SELECT tienda_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

-- ============================================
-- Función para actualizar updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tiendas_updated_at BEFORE UPDATE ON tiendas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facturas_updated_at BEFORE UPDATE ON facturas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Storage bucket para imágenes de productos
-- ============================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Cualquier usuario autenticado puede subir imagenes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'productos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Imagenes de productos son publicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'productos');
