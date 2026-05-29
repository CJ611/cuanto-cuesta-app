# ¿Cuánto cuesta? 💰

Aplicación móvil multiplataforma para gestión de precios, catálogo de productos y facturación de tiendas.

## Stack Tecnológico

- **React Native** + **Expo SDK 52**
- **TypeScript**
- **Expo Router** (navegación file-based)
- **React Native Paper** (componentes UI)
- **Supabase** (PostgreSQL, Auth, Storage, Realtime)
- **Context API** + React Hooks

## Características

- 🔐 Autenticación con roles (Admin / Empleado)
- 📦 Catálogo de productos con búsqueda y filtros por categoría
- ➕ Crear, editar y eliminar productos (soft-delete)
- 📸 Subir imágenes de productos (cámara o galería)
- 🧾 Punto de venta y generación de facturas
- 📄 Exportar facturas a PDF
- 📊 Reportes de ventas (últimos 7 días)
- 👥 Gestión de empleados (solo admin)
- 👤 Perfil de usuario editable
- 🔒 Row Level Security (cada tienda solo ve sus datos)

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Cuenta en [Supabase](https://supabase.com) (plan gratuito funciona)

## Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/CJ611/cuanto-cuesta-app.git
cd cuanto-cuesta-app
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar Supabase:**

   - Crear un proyecto nuevo en [supabase.com](https://supabase.com)
   - Ir al **SQL Editor** y ejecutar el contenido de `supabase/schema.sql`
   - Copiar la URL del proyecto y la Anon Key desde **Settings > API**

4. **Configurar variables de entorno:**
```bash
cp .env.example .env
```
Editar `.env` con tus credenciales:
```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

5. **Ejecutar la app:**
```bash
npx expo start
```

## Estructura del Proyecto

```
cuanto-cuesta-app/
├── app/                    # Pantallas (Expo Router)
│   ├── auth/              # Login y Registro
│   ├── (tabs)/            # Bottom Tab Navigation
│   │   ├── index.tsx      # Catálogo
│   │   ├── productos.tsx  # Agregar Producto
│   │   ├── facturas.tsx   # POS e Historial
│   │   └── resumen.tsx    # Reportes
│   ├── profile/           # Ver y Editar Perfil
│   └── empleados/         # Crear y Listar Empleados
├── src/
│   ├── contexts/          # AuthContext
│   ├── hooks/             # useAuth
│   ├── services/          # Lógica de negocio
│   ├── types/             # Interfaces TypeScript
│   └── utils/             # Supabase client, theme
├── supabase/
│   └── schema.sql         # Schema de base de datos
└── assets/                # Iconos y splash
```

## Base de Datos

El schema incluye 5 tablas principales:

| Tabla | Descripción |
|-------|-------------|
| `tiendas` | Datos de cada tienda registrada |
| `usuarios` | Admins y empleados con rol diferenciado |
| `productos` | Catálogo con precios y categorías |
| `facturas` | Registro de ventas |
| `factura_items` | Items de cada factura con precio histórico |

### Seguridad
- **RLS (Row Level Security):** Cada usuario solo ve datos de su tienda
- **Soft-delete:** Los productos se marcan como inactivos, no se borran
- **Precio histórico:** `factura_items.precio_unitario` guarda el precio al momento de la venta

## Roles de Usuario

| Rol | Permisos |
|-----|----------|
| Admin | Todo: CRUD productos, crear empleados, ver reportes, facturar |
| Empleado | Ver catálogo, facturar, ver reportes, editar su perfil |

## Autores

- Cesar Jair Ortiz
- Miguel Ángel Camargo
- Oscar David Caicedo
- Jean Pier Garcia

## Licencia

MIT
