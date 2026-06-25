# React + Vite Admin Stack — Design System & Package Guide

> Este documento define el stack, sistema de diseño, componentes y convenciones para un admin panel construido con React + Vite. Estilo visual inspirado en ClubSportManager: navy profundo, azul eléctrico, tipografía Inter, minimalista y funcional.

---

## 1. Stack Core

```
react ^18.3
react-dom ^18.3
vite ^5.4
@vitejs/plugin-react ^4.3
typescript ^5.6
```

---

## 2. Dependencias de Producción

```
# Routing
react-router-dom ^6.27          # createBrowserRouter + RouterProvider (API moderna, no <BrowserRouter> legacy)

# Server state
@tanstack/react-query ^5.59     # fetch, cache, mutations — reemplaza useEffect para datos
axios ^1.7                      # HTTP client con interceptores JWT

# Client state
zustand ^4.5                    # solo para UI state (auth, modales, sidebar abierto)

# Formularios
react-hook-form ^7.53
zod ^3.23
@hookform/resolvers ^3.9

# UI primitivos accesibles
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-tooltip
@radix-ui/react-tabs
@radix-ui/react-select
@radix-ui/react-checkbox
@radix-ui/react-switch
@radix-ui/react-popover

# Estilos
tailwindcss ^3.4
@tailwindcss/forms ^0.5
class-variance-authority ^0.7   # variantes type-safe con cva()
clsx ^2.1
tailwind-merge ^2.5

# Iconos
lucide-react ^0.447             # tree-shakeable, stroke fino, +1400 iconos

# Tablas
@tanstack/react-table ^8.20     # headless: sort, filter, pagination, row selection

# Gráficas
recharts ^2.13

# Toasts
sonner ^1.7

# Fechas
date-fns ^3.6
```

---

## 3. Dependencias de Desarrollo

```
eslint
eslint-plugin-react-hooks
prettier
@tanstack/react-query-devtools
```

---

## 4. Design Tokens — CSS Variables

Definir en `src/styles/globals.css`:

```css
:root {
  /* Colores */
  --color-bg:             #F8FAFC;   /* fondo general */
  --color-surface:        #FFFFFF;   /* cards, modales, forms */
  --color-sidebar:        #0B1437;   /* sidebar y navbar oscuro */
  --color-primary:        #2563EB;   /* CTA, links activos, badges */
  --color-primary-hover:  #1D4ED8;
  --color-primary-light:  #EFF6FF;   /* fondos tintados */
  --color-text:           #0F172A;   /* headings */
  --color-text-secondary: #475569;   /* cuerpo, placeholders */
  --color-border:         #E2E8F0;
  --color-success:        #16A34A;
  --color-warning:        #D97706;
  --color-danger:         #DC2626;

  /* Espaciado (escala 4px) */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;

  /* Bordes */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Sombras */
  --shadow-card:     0 1px 3px rgba(0,0,0,.08);
  --shadow-dropdown: 0 8px 24px rgba(0,0,0,.12);
}
```

---

## 5. Tipografía

Fuente principal: **Inter** (Google Fonts o self-hosted con `fontsource`).
Fuente código: **JetBrains Mono**.

| Rol         | Tamaño   | Peso | Uso                          |
|-------------|----------|------|------------------------------|
| display     | 36px     | 700  | H1, títulos de página        |
| heading     | 24px     | 600  | H2, secciones                |
| subheading  | 18px     | 600  | H3, labels de card           |
| body        | 15px     | 400  | Texto corrido                |
| small       | 13px     | 400  | Metadata, timestamps         |
| label       | 12px     | 500  | Labels de form (uppercase)   |
| code        | 14px     | 400  | Snippets (JetBrains Mono)    |

---

## 6. Iconos — Lucide React

Paquete elegido: `lucide-react`

**Por qué:** tree-shakeable, stroke fino y neutro, ideal para dashboards, API simple.

```tsx
import { LayoutDashboard, Users, Settings } from 'lucide-react'

<LayoutDashboard size={20} strokeWidth={1.5} className="text-primary" />
```

### Iconos esenciales para admin

| Icono                    | Uso                          |
|--------------------------|------------------------------|
| `LayoutDashboard`        | Dashboard en sidebar         |
| `Users` / `UserCircle`   | Gestión de usuarios          |
| `Settings`               | Configuración                |
| `Bell`                   | Notificaciones               |
| `Search`                 | Búsqueda global              |
| `ChevronDown/Right`      | Accordions, breadcrumbs      |
| `LogOut`                 | Cerrar sesión                |
| `Plus` / `Pencil` / `Trash2` | CRUD actions             |
| `Check` / `X` / `AlertCircle` | Estados de validación   |
| `Menu`                   | Toggle sidebar móvil         |
| `BarChart2`              | Métricas                     |
| `Shield` / `Lock`        | Roles y permisos             |

---

## 7. Componentes — Catálogo

### 7.1 Layout

| Componente       | Descripción                                                    |
|------------------|----------------------------------------------------------------|
| `<AppShell />`   | Root layout: sidebar + main + topbar                          |
| `<Sidebar />`    | Navegación, logo, grupos de menú, avatar de usuario           |
| `<SidebarItem />`| Item con icono, label, badge de contador, estado activo       |
| `<Topbar />`     | Breadcrumb, buscador global, notificaciones, user menu        |
| `<PageHeader />` | Título + descripción + slot para botones de acción            |
| `<PageContent />`| Wrapper con padding estándar del área de contenido            |

### 7.2 Datos y Tablas

| Componente              | Descripción                                           |
|-------------------------|-------------------------------------------------------|
| `<DataTable />`         | Tabla genérica sobre TanStack Table                   |
| `<DataTableToolbar />`  | Búsqueda, filtros, export sobre la tabla              |
| `<DataTablePagination />`| Paginación + selector de filas por página            |
| `<ColumnHeader />`      | Header con sort toggle                                |
| `<EmptyState />`        | Estado vacío con ilustración y CTA                    |
| `<LoadingSkeleton />`   | Placeholder animado mientras cargan datos             |

### 7.3 Formularios

| Componente       | Descripción                                            |
|------------------|--------------------------------------------------------|
| `<FormField />`  | Wrapper: label + input + error + hint                  |
| `<Input />`      | Variantes: default, error, disabled, with-icon         |
| `<Select />`     | Dropdown sobre Radix Select                            |
| `<Checkbox />`   | Accesible con label                                    |
| `<Switch />`     | Toggle on/off para configuraciones                     |
| `<DatePicker />` | Radix Popover + date-fns                               |
| `<FileUpload />` | Drag & drop + click                                    |
| `<SearchInput />`| Input con lupa y clear button                          |

### 7.4 Feedback

| Componente         | Descripción                                          |
|--------------------|------------------------------------------------------|
| `<Badge />`        | Estados: success / warning / danger / neutral        |
| `<Alert />`        | 4 variantes con icono                                |
| `<Spinner />`      | Loader circular sm/md/lg                             |
| `<ProgressBar />`  | Barra con label y porcentaje                         |
| `<Tooltip />`      | Sobre Radix, hover/focus                             |
| `<ConfirmDialog />`| Modal para acciones destructivas                     |

### 7.5 Contenedores y Navegación

| Componente     | Descripción                                            |
|----------------|--------------------------------------------------------|
| `<Card />`     | CardHeader + CardBody + CardFooter                     |
| `<StatsCard />`| Métrica: valor, label, delta, icono                   |
| `<Modal />`    | Dialog accesible sobre Radix Dialog                    |
| `<Drawer />`   | Panel lateral deslizante (filtros, detalles)           |
| `<Tabs />`     | Sobre Radix Tabs                                       |
| `<Breadcrumb />`| Ruta de navegación con separadores                   |
| `<Dropdown />` | Menú flotante sobre Radix DropdownMenu                 |
| `<Avatar />`   | Foto con fallback a iniciales                          |

---

## 8. Estructura de Carpetas

```
src/
├── pages/
│   ├── users/
│   │   ├── UsersPage.tsx              # nombre explícito, nunca index.tsx
│   │   ├── components/                # componentes exclusivos de esta página
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserForm.tsx
│   │   │   └── UserFilters.tsx
│   │   ├── hooks/                     # hooks exclusivos de esta página
│   │   │   └── useUsers.ts
│   │   └── types/                     # tipos exclusivos de esta página
│   │       └── user.types.ts
│   │
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   │
│   └── settings/
│       ├── SettingsPage.tsx
│       ├── components/
│       ├── hooks/
│       └── types/
│
├── components/                        # componentes globales reutilizables
│   ├── ui/                            # Button, Input, Badge, Modal...
│   ├── layout/                        # AppShell, Sidebar, Topbar, PageHeader
│   └── common/                        # DataTable, EmptyState, ConfirmDialog
│
├── routes/
│   ├── router.tsx                     # root: junta todas las rutas, no define ninguna
│   ├── authRoutes.tsx                 # login, forgot password (fuera del AppShell)
│   ├── dashboardRoutes.tsx
│   ├── usersRoutes.tsx
│   └── settingsRoutes.tsx
│
├── services/                          # un archivo por entidad, separado de pages
│   ├── users.service.ts
│   ├── auth.service.ts
│   └── dashboard.service.ts
│
├── api/
│   ├── client.ts                      # instancia axios + interceptores JWT
│   └── endpoints.ts                   # todas las URLs centralizadas
│
├── hooks/                             # solo hooks verdaderamente globales
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   └── useLocalStorage.ts
│
├── store/
│   ├── authStore.ts
│   └── uiStore.ts
│
├── lib/
│   ├── formatDate.ts
│   └── formatCurrency.ts
│
├── types/
│   └── global.types.ts
│
└── styles/
    └── globals.css
```

### Regla de oro

- Si algo solo lo usa **una página** → vive dentro de `pages/[modulo]/`
- Si **dos o más páginas** lo necesitan → sube a la carpeta global correspondiente
- Los **servicios** siempre en `services/` independientemente de quién los use
- Nunca nombrar un archivo `index.tsx` — usar el nombre descriptivo: `UsersPage.tsx`, `UserTable.tsx`

### `routes/router.tsx` — root, solo ensambla

```tsx
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { authRoutes } from './authRoutes'
import { dashboardRoutes } from './dashboardRoutes'
import { usersRoutes } from './usersRoutes'
import { settingsRoutes } from './settingsRoutes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,       // layout con sidebar + topbar
    children: [
      ...dashboardRoutes,
      ...usersRoutes,
      ...settingsRoutes,
    ],
  },
  ...authRoutes,                 // fuera del AppShell — sin sidebar
])
```

### `routes/usersRoutes.tsx` — rutas de un módulo

```tsx
import { UsersPage } from '@/pages/users/UsersPage'
import { UserDetailPage } from '@/pages/users/UserDetailPage'

export const usersRoutes = [
  { path: 'users',     element: <UsersPage /> },
  { path: 'users/:id', element: <UserDetailPage /> },
]
```

### `routes/authRoutes.tsx` — rutas públicas sin layout

```tsx
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

export const authRoutes = [
  { path: '/login',           element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
]
```

### Reglas de rutas

- `router.tsx` **solo importa y ensambla** — nunca define rutas directamente
- Cada módulo tiene su propio `xRoutes.tsx` en `routes/`
- Rutas con sidebar → dentro del `children` del `AppShell`
- Rutas públicas → fuera del `AppShell` al nivel root
- Guards de autenticación → en el `AppShell` o en un `<PrivateRoute />` wrapper
- Al agregar un módulo nuevo: `pages/nuevo/` + `routes/nuevoRoutes.tsx` + importar en `router.tsx`

### `api/endpoints.ts` — todas las URLs en un solo lugar

```ts
export const ENDPOINTS = {
  auth: {
    login:  '/auth/login',
    logout: '/auth/logout',
    me:     '/auth/me',
  },
  users: {
    list:   '/users',
    byId:   (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  dashboard: {
    stats: '/dashboard/stats',
  },
}
```

### `api/client.ts` — axios con interceptores

```ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) window.location.href = '/login'
    return Promise.reject(error)
  }
)
```

### `services/users.service.ts`

```ts
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { User, CreateUserDto } from '@/pages/users/types/user.types'

export const usersService = {
  getAll:  ()                          => apiClient.get<User[]>(ENDPOINTS.users.list),
  getById: (id: string)                => apiClient.get<User>(ENDPOINTS.users.byId(id)),
  create:  (data: CreateUserDto)       => apiClient.post<User>(ENDPOINTS.users.create, data),
  update:  (id: string, data: Partial<User>) => apiClient.put<User>(ENDPOINTS.users.update(id), data),
  delete:  (id: string)                => apiClient.delete(ENDPOINTS.users.delete(id)),
}
```

### `pages/users/hooks/useUsers.ts`

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services/users.service'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll().then(r => r.data),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}
```

---

## 9. Convenciones

- **Archivos de página:** `NombrePage.tsx` — nunca `index.tsx`
- **Componentes:** PascalCase, un archivo por componente
- **Hooks:** prefijo `use`, ej: `useUsers`, `useDebounce`
- **Servicios:** objeto con métodos por acción, ej: `usersService.getAll()`
- **Endpoints:** siempre en `api/endpoints.ts`, nunca strings sueltos en servicios
- **Variables CSS:** siempre tokens, nunca valores hardcodeados en componentes
- **Variantes de componentes:** usar `cva()` de `class-variance-authority`
- **Formularios:** siempre `react-hook-form` + `zod`, nunca estado local para forms
- **Datos del servidor:** siempre `useQuery` / `useMutation`, nunca `useEffect` + fetch manual
- **Estado UI global:** Zustand. Estado local simple: `useState`

---

## 11. Despliegue

| Plataforma    | Método                        | Notas                              |
|---------------|-------------------------------|------------------------------------|
| Vercel        | Conectar repo, auto-deploy    | Recomendado, cero config           |

> Para un admin que consume API externa, el deploy es un static site — no necesitas Node.js en producción.