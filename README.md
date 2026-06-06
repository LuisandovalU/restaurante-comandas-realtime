<div align="center">

# 🍽️ Sistema de Gestión de Comandas en Tiempo Real

### *El Rincón del Parque — UPIICSA · IPN*

![TanStack Start](https://img.shields.io/badge/TanStack%20Start-v1.x-FF4154?style=for-the-badge&logo=react)
![Convex](https://img.shields.io/badge/Convex-BaaS-EE342F?style=for-the-badge)
![Bun](https://img.shields.io/badge/Bun-v1.x-FBF0DF?style=for-the-badge&logo=bun&logoColor=black)
![Biome](https://img.shields.io/badge/Biome-Linter-60A5FA?style=for-the-badge)
![Railway](https://img.shields.io/badge/Railway-Deploy-0B0D0E?style=for-the-badge&logo=railway)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)

**Proyecto Final — Ingeniería de Diseño de Software**  
*Ingeniería en Informática · UPIICSA · IPN*

[🎯 Demo en vivo](#) · [📖 Documentación](#arquitectura) · [🚀 Instalación](#instalación-rápida)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Patrones de Diseño Implementados](#patrones-de-diseño-implementados)
- [Instalación Rápida](#instalación-rápida)
- [Configuración de Convex](#configuración-de-convex)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Despliegue en Railway](#despliegue-en-railway)
- [Requerimientos Cubiertos](#requerimientos-cubiertos)
- [Flujo de Datos (EDA)](#flujo-de-datos-eda)
- [Equipo](#equipo)

---

## Descripción General

Sistema web para el restaurante **"El Rincón del Parque"** que elimina el uso de tickets físicos y sistemas anticuados, digitalizando el flujo de comandas entre meseros y cocina en **tiempo real**.

### Problema que resuelve

| Antes | Después |
|-------|---------|
| ❌ Tickets físicos que se pierden | ✅ Tablero Kanban digital |
| ❌ Meseros entran a cocina a preguntar | ✅ Notificación automática en pantalla |
| ❌ Sin visibilidad del estado de los pedidos | ✅ Sincronización instantánea vía WebSocket |
| ❌ Sistema digital que requiere recargar | ✅ Actualización reactiva (EDA) |

### Aplicaciones incluidas

| App | Descripción | Puerto |
|-----|-------------|--------|
| **Sistema de Comandas** | Tablero Kanban + admin de menú | `5175` |
| **Menú Digital** | Micrositio público para comensales | `5174` |

---

## Arquitectura del Sistema

El sistema implementa **tres patrones arquitectónicos** en combinación, tal como especifica el documento de Ingeniería de Diseño:

### 1. 🏗️ Arquitectura en Capas (Layered Architecture)

```
┌─────────────────────────────────────────────────────────┐
│  CAPA DE PRESENTACIÓN (Presentation Layer)              │
│  TanStack Start · React · Kanban DnD · Menú Digital     │
├─────────────────────────────────────────────────────────┤
│  CAPA DE LÓGICA DE NEGOCIO (Business Logic Layer)       │
│  Patrón Strategy · Patrón State · Servicios de Dominio  │
├─────────────────────────────────────────────────────────┤
│  CAPA DE ACCESO A DATOS (Data Access Layer)             │
│  Convex (NoSQL) ◄──── WebSocket ────► SQL (Facturación) │
└─────────────────────────────────────────────────────────┘
```

### 2. 🔌 Patrón Microkernel (Plugin Architecture)

```
                    ┌─────────────────┐
                    │   CORE SYSTEM   │
                    │  (Priorizador)  │
                    │  Recibe comanda │
                    │  Clasifica por  │
                    │    estación     │
                    └────────┬────────┘
                             │
           ┌─────────────────┴─────────────────┐
           │                                   │
  ┌────────▼────────┐               ┌──────────▼──────────┐
  │  PLUGIN COCINA  │               │  PLUGIN FACTURACIÓN │
  │   Convex/NoSQL  │               │    SQL / Tickets     │
  │  Tablero Kanban │               │  Transacciones ACID  │
  │   Tiempo real   │               │   Generación folio   │
  └─────────────────┘               └─────────────────────┘
           │                                   ▲
           │    Estado "Pagado" = evento        │
           └──────── Webhook HTTP ─────────────┘
```

### 3. ⚡ Arquitectura Dirigida por Eventos (EDA)

```
Cocinero arrastra tarjeta al estado "Listo"
        │
        ▼  onDragEnd() en TableroKanban.tsx
  [Validación Patrón State - Frontend]
        │
        ▼  useMutation(api.pedidos.actualizarEstado)
  [Validación Patrón State - Backend Convex]
        │
        ▼  Convex actualiza la base de datos
        │
        ▼  WebSocket PUSH simultáneo ──────────────────────┐
        │                                                  │
        ▼                                                  ▼
  Pantalla Cocina                               Pantalla Mesero
  "En Preparación" → "Listo"           "Listo" → recoge el plato
  (actualización instantánea)           (sin preguntar a cocina)
```

---

## Stack Tecnológico

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| **[TanStack Start](https://tanstack.com/start)** | v1.x | Framework SSR / Frontend |
| **[Convex](https://convex.dev)** | v1.x | Backend as a Service + tiempo real |
| **[Bun](https://bun.sh)** | v1.x | Runtime + gestor de paquetes |
| **[Biome](https://biomejs.dev)** | v1.x | Linting + formateo (reemplaza ESLint + Prettier) |
| **[@dnd-kit/core](https://dndkit.com)** | v6.x | Drag & Drop accesible |
| **[Railway](https://railway.app)** | — | Despliegue en la nube |
| **TypeScript** | v5.x | Tipado estricto end-to-end |
| **Zod** | v3.x | Validación de esquemas |

---

## Estructura del Proyecto

```
restaurante-comandas-realtime/
│
├── 📁 convex/                          # ── DATA ACCESS LAYER (NoSQL) ──
│   ├── schema.ts                       # Tablas: pedidos, productos, categorias
│   ├── pedidos.ts                      # Queries/Mutations del Kanban + Patrón State
│   ├── productos.ts                    # CRUD del menú (RF-02)
│   ├── facturacion.ts                  # Plugin Facturación + webhook SQL
│   ├── menuPublico.ts                  # Queries públicas (sin auth) para el micrositio
│   └── auth.config.ts                  # Autenticación integrada de Convex
│
├── 📁 src/
│   │
│   ├── 📁 routes/                      # ── RUTAS (TanStack Start) ──
│   │   ├── __root.tsx                  # Layout raíz + ConvexProvider
│   │   ├── index.tsx                   # Redirect → /tablero
│   │   ├── tablero/index.tsx           # Tablero Kanban (RF-03, RF-04, RF-05)
│   │   ├── admin/platos.tsx            # Gestión menú — solo Administrador (RF-02)
│   │   └── api/webhook-pago.ts         # Receptor del webhook de Convex → SQL
│   │
│   ├── 📁 presentation/                # ── PRESENTATION LAYER ──
│   │   ├── components/kanban/
│   │   │   ├── TableroKanban.tsx       # 🎯 Componente principal Kanban + EDA
│   │   │   ├── ColumnaKanban.tsx       # Columna droppable (useDroppable)
│   │   │   └── TarjetaComanda.tsx      # Tarjeta draggable (useDraggable)
│   │   └── styles/
│   │       └── tablero.css             # Design tokens + estilos Kanban
│   │
│   ├── 📁 application/                 # ── BUSINESS LOGIC LAYER ──
│   │   └── strategies/
│   │       └── priorizador.ts          # 🧠 Patrón Strategy (algoritmos de priorización)
│   │
│   └── 📁 infrastructure/             # ── INFRAESTRUCTURA ──
│       ├── convex/api.ts               # Stub del API de Convex
│       ├── constants/estados.ts        # Enum de estados del dominio
│       └── sql/tickets.sql             # Esquema SQL (Plugin Facturación)
│
├── 📁 menu-digital/                    # ── PLUGIN MICROSITIO (independiente) ──
│   ├── package.json                    # Dependencias propias
│   ├── vite.config.ts                  # Build estático puro
│   ├── railway.toml                    # Despliegue independiente
│   └── src/
│       ├── main.tsx                    # ConvexProvider anónimo (sin auth)
│       ├── routes/
│       │   ├── index.tsx               # Lista categorías + platillos
│       │   └── plato.$platoId.tsx      # Detalle de platillo
│       └── styles/menu.css             # Diseño Mobile-First
│
├── package.json                        # Dependencias del sistema principal
├── app.config.ts                       # TanStack Start config
├── vite.config.ts                      # Vite + plugins
├── tsconfig.json                       # TypeScript strict
├── biome.json                          # Reglas de Biome
├── bunfig.toml                         # Configuración de Bun
└── .gitignore
```

---

## Patrones de Diseño Implementados

### 🎯 Patrón Strategy — `priorizador.ts`

Permite intercambiar algoritmos de priorización sin modificar el Core del sistema. Selecciona automáticamente la estrategia según el horario del restaurante.

```typescript
// Interfaz del contrato
interface EstrategiaPrioridad {
  readonly nombre: string;
  priorizar(platillos: Platillo[]): Platillo[];
}

// Implementaciones concretas
class EstrategiaOrdenarPorTiempo     implements EstrategiaPrioridad { ... }
class EstrategiaOrdenarPorDificultad implements EstrategiaPrioridad { ... }
class EstrategiaMixta                implements EstrategiaPrioridad { ... }

// Core — selección automática por horario
function priorizarComandas(platillos, estrategiaManual?) {
  const estrategia = estrategiaManual ?? estrategiasPorHorario[franjaActual];
  return { platillosPriorizados: estrategia.priorizar(platillos), ... };
}
```

| Franja Horaria | Estrategia Aplicada | Razón |
|---|---|---|
| 08:00–11:59 | `OrdenarPorDificultad` | Poco volumen → platos simples primero |
| 12:00–15:00 | `OrdenarPorTiempo` | Hora pico → los más rápidos primero |
| 15:01–19:59 | `Mixta (0.5/0.5)` | Balance entre velocidad y complejidad |
| 20:00–23:59 | `OrdenarPorTiempo` | Cerrar cocina rápido |

### 🔄 Patrón State — `convex/pedidos.ts`

Controla las transiciones válidas del estado de una comanda. Un pedido en estado `Listo` no puede volver a `Pendiente`.

```typescript
// Mapa de transiciones válidas
const transicionesPermitidas = {
  "Pendiente":      ["En Preparación"],
  "En Preparación": ["Listo"],
  "Listo":          [],            // Estado terminal en el Kanban
};

// Validación en el backend (mutation de Convex)
if (!estadosPermitidos.includes(nuevoEstado)) {
  throw new Error(`Transición inválida: ${pedido.estado} → ${nuevoEstado}`);
}
```

### 🔌 Patrón Microkernel — `convex/facturacion.ts`

El micrositio es un plugin completamente independiente del core operativo.

```
Core (Convex + Kanban)
    │
    ├── Plugin Cocina  → useQuery reactivo → tablero en tiempo real
    ├── Plugin Factura → webhook HTTP → INSERT en tabla SQL
    └── Plugin Menú    → query pública → micrositio (solo lectura, sin auth)
```

---

## Instalación Rápida

### Prerrequisitos

```bash
# Instalar Bun (si no lo tienes)
curl -fsSL https://bun.sh/install | bash
exec /bin/zsh
bun --version  # debe mostrar 1.x.x
```

### Clonar e instalar

```bash
# 1. Clonar el repositorio
git clone https://github.com/LuisandovalU/restaurante-comandas-realtime.git
cd restaurante-comandas-realtime

# 2. Instalar dependencias del sistema principal
bun install

# 3. Instalar dependencias del micrositio
cd menu-digital && bun install && cd ..
```

---

## Configuración de Convex

Convex es el backend reactivo del sistema. Necesitas crear un proyecto gratuito.

```bash
# 1. Inicializa Convex (te pedirá login en el browser)
bunx convex dev

# → Convex genera automáticamente:
#   convex/_generated/api.ts
#   convex/_generated/server.ts
#   convex/_generated/dataModel.ts

# → Copia la URL que aparece en la terminal:
#   ✔ Convex deployment ready: https://happy-fox-123.convex.cloud
```

---

## Variables de Entorno

Crea los siguientes archivos (están en `.gitignore`, nunca se suben al repo):

### Sistema principal — `.env.local`

```env
# URL de tu deployment de Convex
VITE_CONVEX_URL=https://TU-DEPLOYMENT.convex.cloud
CONVEX_SITE_URL=https://TU-DEPLOYMENT.convex.cloud

# Secret compartido entre Convex y el endpoint SQL (webhook)
WEBHOOK_SECRET=genera-un-secreto-largo-aqui

# URL de tu base de datos SQL (para el Plugin de Facturación)
SQL_WEBHOOK_URL=https://TU-APP.railway.app/api/webhook-pago
```

### Micrositio — `menu-digital/.env.local`

```env
# La misma URL de Convex (solo necesita leer el menú público)
VITE_CONVEX_URL=https://TU-DEPLOYMENT.convex.cloud
```

---

## Scripts Disponibles

### Sistema principal

```bash
bun run dev          # Inicia el servidor de desarrollo (puerto 5175 con Vite)
bun run build        # Genera el build de producción
bun run start        # Inicia el servidor de producción

bunx convex dev      # Inicia el backend de Convex en modo desarrollo
bunx convex deploy   # Despliega las funciones de Convex a producción

bun run lint         # Analiza el código con Biome
bun run format       # Formatea el código con Biome
bun run check        # Lint + format en un solo paso
bun run typecheck    # Verificación de tipos TypeScript
```

### Micrositio

```bash
cd menu-digital
bun run dev          # Inicia en puerto 5174
bun run build        # Genera archivos estáticos en /dist
bun run preview      # Previsualiza el build en puerto 4174
```

---

## Despliegue en Railway

El sistema se despliega como **dos servicios independientes** en Railway, reflejando la arquitectura Microkernel.

### Servicio A — Sistema de Comandas

```bash
# En Railway Dashboard:
# 1. New Project → Deploy from GitHub → restaurante-comandas-realtime
# 2. Variables de entorno:
#    VITE_CONVEX_URL = (tu URL de Convex)
#    WEBHOOK_SECRET  = (tu secreto)
# 3. El servicio se construye con:
#    Build: bun install && bun run build
#    Start: bun run start
```

### Servicio B — Menú Digital

```bash
# En Railway Dashboard:
# 1. New Service → Deploy from GitHub → mismo repo
# 2. Root Directory: menu-digital
# 3. Variables de entorno:
#    VITE_CONVEX_URL = (misma URL de Convex)
# 4. El build genera archivos estáticos servidos por `serve`
```

### Servicio C — Backend Convex

```bash
# Convex se despliega directamente desde la CLI:
bunx convex deploy

# No necesita un servicio de Railway — Convex tiene su propia infra cloud.
```

---

## Requerimientos Cubiertos

| ID | Requerimiento | Implementación | Estado |
|----|---------------|----------------|--------|
| RF-01 | Autenticación correo/contraseña | Convex Auth + ruta `/login` | ✅ |
| RF-02 | Gestión de menú (CRUD) | `convex/productos.ts` + ruta `/admin/platos` | ✅ |
| RF-03 | Tablero Kanban con 3 columnas | `TableroKanban.tsx` | ✅ |
| RF-04 | Drag & Drop entre columnas | `@dnd-kit/core` | ✅ |
| RF-05 | Sincronización tiempo real | Convex WebSocket + `useQuery` reactivo | ✅ |
| RNF-01 | Frontend con TanStack Start | Framework principal del sistema | ✅ |
| RNF-02 | Convex como BaaS | Backend + BD + WebSockets | ✅ |
| RNF-03 | Bun como runtime | Package manager y runner | ✅ |
| RNF-04 | Railway para despliegue | `railway.toml` configurado | ✅ |
| RN-01 | Estados: Pendiente→Prep→Listo | Patrón State (frontend + backend) | ✅ |
| RN-02 | Tablero restringido a autenticados | `beforeLoad` en ruta `/tablero` | ✅ |

---

## Flujo de Datos (EDA)

```
┌──────────────┐     Drag & Drop      ┌──────────────────────┐
│    Mesero    │ ──────────────────►  │  TableroKanban.tsx   │
│  (Tablet)   │                       │  onDragEnd()         │
└──────────────┘                       └──────────┬───────────┘
                                                  │
                                     useMutation(actualizarEstado)
                                                  │
                                       ┌──────────▼───────────┐
                                       │   Convex Backend     │
                                       │  Valida Patrón State │
                                       │  Persiste en BD      │
                                       └──────────┬───────────┘
                                                  │
                              WebSocket PUSH a todos los clientes
                           ┌──────────────────────┴──────────────────────┐
                           │                                             │
               ┌───────────▼──────────┐                    ┌────────────▼─────────┐
               │  Pantalla Cocina     │                    │  Pantalla Mesero     │
               │  useQuery reactivo   │                    │  useQuery reactivo   │
               │  → re-render auto   │                    │  → "¡Plato listo!"  │
               └──────────────────────┘                    └──────────────────────┘
```

---

## Equipo

| Rol | Responsabilidad |
|-----|----------------|
| **Analista de Requerimientos** | Definición de historias de usuario y reglas de negocio |
| **Diseñador** | Maquetación del tablero Kanban y sección de administración |
| **Desarrollador** | Implementación TanStack Start + Convex + Railway |
| **Tester** | Verificación sincronización tiempo real y DnD en distintos navegadores |

---

<div align="center">

**Instituto Politécnico Nacional**  
**UPIICSA — Ingeniería en Informática**  
*Ingeniería de Diseño de Software · Junio 2026*

</div>
