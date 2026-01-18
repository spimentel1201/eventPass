# NeonPass: Especificación Técnica y Guía de Implementación Frontend

**Versión:** 1.0 (MVP)
**Framework:** Next.js 14 (App Router)
**Estilo:** Tailwind CSS + DaisyUI ("Neon Dark Theme")
**Estado:** Definición para Implementación

---

## 1. Stack Tecnológico y Reglas Generales

### 1.1 Core Stack
* **Framework:** Next.js 14 (App Router).
* **Lenguaje:** TypeScript (Strict Mode obligatorio).
* **Estado Server:** TanStack Query v5 (React Query) para caching y sincronización.
* **Estado Client:** Zustand (para carrito de compras y estados de UI globales).
* **Gráficos:** `react-konva` (Canvas HTML5) para el mapa de asientos, Charts (Admin Dashboard): Recharts or Chart.js
* **Validación:** Zod + React Hook Form.
* **Http Client:** Axios (configurado con interceptores).
* **Animations:** Framer Motion.

### 1.2 Reglas de Directorios (App Router)
La estructura debe seguir estrictamente la convención de Next.js 14:

```text
src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                  # Auth routes
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (public)/                # Public routes
│   │   ├── events/
│   │   │   ├── page.tsx         # Event list
│   │   │   └── [eventId]/
│   │   │       ├── page.tsx     # Event details
│   │   │       └── seat-map/
│   │   │           └── page.tsx # Seat selection
│   │   ├── checkout/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/             # Organizer dashboard
│   │   ├── events/
│   │   │   └── [eventId]/edit/page.tsx
│   │   ├── venues/
│   │   │   └── [venueId]/editor/page.tsx  # Venue layout editor
│   │   ├── page.tsx             # Dashboard home
│   │   └── layout.tsx
│   ├── (admin)/                 # Super admin
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── orders/page.tsx
│   │   └── layout.tsx
│   └── layout.tsx               # Root layout
├── components/
│   ├── ui/                      # DaisyUI wrappers (Button, Card, Modal, Input)
│   ├── features/                # Feature-specific components
│   │   ├── seat-map/            # React-Konva (VenueMap, SeatRenderer)
│   │   ├── venue-editor/        # Layout drawing tools
│   │   ├── events/              # EventCard, EventList, EventFilters
│   │   ├── checkout/            # CartSummary, ReservationTimer
│   │   └── auth/                # LoginForm, RegisterForm
│   └── layout/                  # Header, Footer, Sidebar, DashboardLayout
├── lib/
│   ├── api.ts                   # Axios instance + JWT interceptor
│   ├── query-client.ts          # TanStack Query config
│   ├── constants.ts             # App-wide constants
│   └── utils.ts                 # Helper functions
├── hooks/
│   ├── useEvents.ts             # TanStack Query hooks
│   ├── useSeats.ts
│   ├── useReservation.ts
│   └── useAuth.ts
├── stores/
│   ├── cartStore.ts             # Zustand: seat selection + timer
│   ├── authStore.ts             # Zustand: JWT + user
│   └── uiStore.ts               # Zustand: modals, sidebar
├── schemas/
│   ├── authSchema.ts            # Zod validation schemas
│   ├── checkoutSchema.ts
│   ├── eventSchema.ts
│   └── venueSchema.ts
├── types/
│   ├── api.ts                   # API response types
│   ├── models.ts                # Domain models
│   └── index.ts
└── styles/
    └── globals.css              # Tailwind imports + custom styles
```

## 2. Sistema de Diseño e Integración UI
### 2.1 Configuración de DaisyUI (Tailwind)
El archivo tailwind.config.ts debe configurar el tema para reflejar el estilo "NeonPass".

Mapeo Semántico (Estricto):

primary: Indigo (#6366f1) -> Acciones principales.

secondary: Fuchsia (#d946ef) -> Acentos, bordes brillantes.

accent: Cyan (#06b6d4) -> Elementos interactivos menores.

base-100: Slate 900 (#0f172a) -> Fondo principal.

base-200: Slate 800 (#1e293b) -> Tarjetas (Cards), Sidebars.

### 2.2 Reglas de Renderizado para Componentes Estándar
Usar siempre clases de DaisyUI. No reinventar la rueda con utilidades de Tailwind puras.

Botones: <button className="btn btn-primary btn-sm">

Inputs: <input className="input input-bordered input-primary w-full" />

Cards: Estructura estándar card bg-base-200 shadow-xl.

Loaders: <span className="loading loading-spinner text-primary"></span>

## 3. Módulo de Gráficos: Mapa de Asientos (React-Konva)
CRÍTICO: Este módulo no renderiza elementos DOM. Renderiza en Canvas. Las clases CSS de Tailwind NO FUNCIONAN dentro de <Stage> o <Layer>.

### 3.1 Arquitectura del Componente SeatMap
Debido a que konva depende del objeto window, debe importarse dinámicamente en Next.js para evitar errores de SSR (Hydration Mismatch).
```
// src/components/seating/SeatMapWrapper.tsx
'use client';
import dynamic from 'next/dynamic';

const SeatMap = dynamic(() => import('./SeatMap'), {
  ssr: false,
  loading: () => <div className="skeleton w-full h-[600px]" />
});

export default SeatMap;
```

### 3.2 Estilizado de Elementos Konva (Hex Codes)

Critical React Konva Rules (Seat Map)

IMPORTANT: React Konva renders on HTML5 Canvas, NOT in the DOM. CSS classes DO NOT work.
Color Mapping for Konva
Since Konva doesn't use CSS classes, you must extract hex values:

```
// ✅ CORRECT - Color Constants for Konva
export const KONVA_COLORS = {
  // Seat states
  AVAILABLE: '#22c55e',    // success
  OCCUPIED: '#ef4444',     // error
  SELECTED: '#3b82f6',     // info
  MY_RESERVATION: '#06b6d4', // accent
  BLOCKED: '#94a3b8',      // gray
  
  // Sections
  SECTION_FILL: '#1e293b', // base-200
  SECTION_STROKE: '#6366f1', // primary
  SECTION_HOVER: '#4f46e5', // primary darker
  
  // Stage
  BACKGROUND: '#0f172a',   // base-100
} as const;

```
Correct Konva Implementation
```
// ✅ CORRECT - Konva Seat Component
import { Circle, Group, Text } from 'react-konva';

interface SeatProps {
  x: number;
  y: number;
  status: 'available' | 'occupied' | 'selected';
  label: string;
  onClick: () => void;
}

const Seat: React.FC<SeatProps> = ({ x, y, status, label, onClick }) => {
  const getColor = () => {
    switch (status) {
      case 'available': return KONVA_COLORS.AVAILABLE;
      case 'occupied': return KONVA_COLORS.OCCUPIED;
      case 'selected': return KONVA_COLORS.SELECTED;
      default: return KONVA_COLORS.BLOCKED;
    }
  };

  return (
    <Group x={x} y={y} onClick={onClick}>
      <Circle
        radius={12}
        fill={getColor()}
        stroke="#ffffff"
        strokeWidth={status === 'selected' ? 2 : 1}
        shadowBlur={status === 'selected' ? 10 : 0}
        shadowColor={getColor()}
      />
      <Text
        text={label}
        fontSize={10}
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
        offsetX={10}
        offsetY={5}
      />
    </Group>
  );
};

// ❌ INCORRECT - This will not work
const SeatWrong = () => (
  <Circle className="fill-success w-6 h-6" /> // CSS classes ignored!
);
```
Lazy Loading Pattern for Seat Map
CRITICAL: Do NOT render all 50,000 seats at once. Use hierarchical loading.
```
// ✅ CORRECT - Hierarchical Loading
'use client';

import { useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

interface Section {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
}

const VenueMap = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [loadedSeats, setLoadedSeats] = useState<Seat[]>([]);

  // Step 1: Only render section polygons initially
  const renderSections = () => (
    sections.map(section => (
      <Group key={section.id}>
        <Rect
          x={section.x}
          y={section.y}
          width={section.width}
          height={section.height}
          fill={KONVA_COLORS.SECTION_FILL}
          stroke={KONVA_COLORS.SECTION_STROKE}
          strokeWidth={2}
          onClick={() => handleSectionClick(section.id)}
          onMouseEnter={(e) => {
            e.target.fill(KONVA_COLORS.SECTION_HOVER);
          }}
          onMouseLeave={(e) => {
            e.target.fill(KONVA_COLORS.SECTION_FILL);
          }}
        />
        <Text
          text={`${section.name}\n${section.capacity} seats`}
          x={section.x}
          y={section.y + section.height / 2}
          width={section.width}
          align="center"
          fill="#ffffff"
          fontSize={16}
        />
      </Group>
    ))
  );

  // Step 2: Load seats ONLY when section is clicked
  const handleSectionClick = async (sectionId: string) => {
    setSelectedSection(sectionId);
    
    // Fetch seats for this section only
    const seats = await fetchSeatsBySection(sectionId);
    setLoadedSeats(seats);
  };

  // Step 3: Render seats only for selected section
  const renderSeats = () => (
    loadedSeats.map(seat => (
      <Seat
        key={seat.id}
        x={seat.x}
        y={seat.y}
        status={seat.status}
        label={seat.label}
        onClick={() => handleSeatClick(seat)}
      />
    ))
  );

  return (
    <Stage width={1200} height={800}>
      <Layer>
        {!selectedSection && renderSections()}
        {selectedSection && renderSeats()}
      </Layer>
    </Stage>
  );
};
```
Animation & Transition Rules
Use Framer Motion for UI Animations
```
// ✅ CORRECT - Card entrance animation
import { motion } from 'framer-motion';

const EventCard = ({ event }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.02 }}
    className="card bg-base-200 shadow-xl"
  >
    {/* Card content */}
  </motion.div>
);

// ✅ CORRECT - Staggered list animation
const EventList = ({ events }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      visible: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }}
  >
    {events.map(event => (
      <motion.div
        key={event.id}
        variants={{
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 }
        }}
      >
        <EventCard event={event} />
      </motion.div>
    ))}
  </motion.div>
);

// ✅ CORRECT - Modal animations
const CheckoutModal = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="modal-box bg-base-200 z-50"
        >
          {/* Modal content */}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
```
DaisyUI Built-in Transitions
```
// ✅ Use DaisyUI's transition utilities
<button className="btn btn-primary transition-all hover:scale-105">
  Buy Tickets
</button>

// ✅ Loading states
<div className="skeleton h-32 w-full"></div>

// ✅ Collapse/Accordion
<div className="collapse collapse-arrow bg-base-200">
  <input type="checkbox" />
  <div className="collapse-title text-xl font-medium">
    Event Details
  </div>
  <div className="collapse-content">
    <p>Description...</p>
  </div>
</div>
```

Critical Performance Optimizations
- Lazy Loading Seats (MANDATORY)
```
// ✅ CORRECT - Load seats progressively
const useSeatsBySection = (eventId: string, sectionId: string | null) => {
  return useQuery({
    queryKey: ['seats', eventId, sectionId],
    queryFn: async () => {
      if (!sectionId) return [];
      const { data } = await api.get(
        `/api/v1/events/${eventId}/sections/${sectionId}/seats`
      );
      return data;
    },
    enabled: !!sectionId, // Only fetch when section is selected
    staleTime: 30 * 1000, // 30 seconds
  });
};

// ❌ INCORRECT - Loading all seats at once
const useAllSeats = (eventId: string) => {
  return useQuery({
    queryKey: ['seats', eventId],
    queryFn: async () => {
      // This will crash with 50,000 seats
      const { data } = await api.get(`/api/v1/events/${eventId}/seats`);
      return data;
    },
  });
};
```
Virtual Scrolling for Lists
```
// ✅ Use TanStack Virtual for long lists
import { useVirtualizer } from '@tanstack/react-virtual';

const EventList = ({ events }: { events: Event[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of each item
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <EventCard event={events[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```
Image Optimization
```
// ✅ CORRECT - Use Next.js Image with Cloudinary transformations
import Image from 'next/image';

const EventCard = ({ event }) => (
  <div className="card bg-base-200">
    <figure>
      <Image
        src={event.media?.images?.banner?.transformations?.mobile || event.media?.images?.banner?.url}
        alt={event.title}
        width={800}
        height={400}
        className="object-cover"
        loading="lazy"
        placeholder="blur"
        blurDataURL={event.media?.images?.banner?.transformations?.preview}
      />
    </figure>
    {/* Card content */}
  </div>
);
```
Debounce Search
```
// ✅ Debounce search input
import { useDebouncedValue } from '@/hooks/useDebounce';

const EventSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 500);

  const { data: events } = useQuery({
    queryKey: ['events', 'search', debouncedSearch],
    queryFn: () => searchEvents(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  });

  return (
    <input
      type="text"
      className="input input-bordered w-full"
      placeholder="Search events..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
};
```
Real-time Updates (WebSocket Integration)
```
// ✅ lib/websocket.ts
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useEventWebSocket = (eventId: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/events/${eventId}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'SEAT_STATUS_UPDATE') {
        // Invalidate seat query to refetch
        queryClient.invalidateQueries({
          queryKey: ['seats', eventId, message.sectionId],
        });
      }
      
      if (message.type === 'RESERVATION_EXPIRED') {
        // Remove expired reservations from cart
        // ...
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [eventId, queryClient]);
};

// ✅ Usage in component
const SeatMap = ({ eventId }: { eventId: string }) => {
  useEventWebSocket(eventId); // Auto-updates when seats change

  return (
    // ... seat map rendering
  );
};
```

Reservation Timer Component
```
// ✅ components/features/checkout/ReservationTimer.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';

export const ReservationTimer = () => {
  const { reservationExpiry, clearCart } = useCartStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!reservationExpiry) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(reservationExpiry).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        clearCart();
        clearInterval(interval);
        alert('Your reservation has expired');
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservationExpiry, clearCart]);

  if (!reservationExpiry) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`alert ${timeLeft < 60 ? 'alert-error' : 'alert-warning'}`}>
      <svg className="h-6 w-6">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        Reservation expires in: {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};
```
Environment Variables

NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

### 3.3 Interacciones y Zoom
Utilizar la librería react-zoom-pan-pinch envolviendo el componente Stage de Konva para permitir navegación fluida en móviles y desktop.

## 4. Gestión de Imágenes (Integración Cloudinary)
Conectar con los endpoints generados en el Backend (/api/v1/events/{id}/images).

### 4.1 Componente: ImageUploader
Debe ser un componente reutilizable que acepte:

endpoint: URL de subida (ej: /banner, /thumbnail).

aspectRatio: Para guiar al usuario (ej: 16:9 para banners).

onUploadSuccess: Callback que devuelve el objeto ImageUploadResponse (URL, publicId, transformaciones).

Comportamiento:

Permitir Drag & Drop.

Validar tamaño (< 5MB) y tipo (JPG, PNG, WEBP) antes de subir.

Mostrar barra de progreso o estado loading.

Al completar, mostrar la preview usando la URL optimizada retornada por el backend.

### 4.2 Renderizado de Imágenes
Usar el componente <Image> de Next.js configurado para dominios externos o un tag <img> estándar aprovechando las transformaciones de Cloudinary.

Listados/Cards: Usar transformations.thumbnail o transformations.mobile.

Detalle Evento: Usar la URL original o transformations.webp.

## 5. Integración de Datos (Tipos y Fetching)
### 5.1 Definiciones TypeScript (src/types/event.ts)
Debe coincidir con la respuesta JSONB del backend.

```
export interface EventImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  transformations?: {
    thumbnail?: string;
    mobile?: string;
    webp?: string;
  };
}

export interface EventMetadata {
  media: {
    images: {
      banner?: EventImage;
      thumbnail?: EventImage;
      gallery?: EventImage[];
    };
  };
}

export interface Section {
  id: string;
  name: string;
  type: 'SEATED' | 'GENERAL_ADMISSION' | 'VIP';
  capacity: number;
  layoutConfig: {
    points?: number[]; // Para polígonos
    x?: number;
    y?: number;
    color?: string;
  };
  seats?: Seat[]; // Solo se carga en detalle
}

export interface Seat {
  id: string;
  rowLabel: string;
  numberLabel: string;
  x: number;
  y: number;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'LOCKED';
}
```

### 5.2 React Query Hooks
Crear hooks encapsulados en src/hooks/api/:

useEventLayout(eventId): Obtiene el JSON del canvas.

useEventImages(eventId): Obtiene las URLs de imágenes.

useUploadImage(): Mutation para subir imágenes (multipart/form-data).

useSeatAvailability(sectionId): Polling cada 30s para refrescar estado de asientos.

## 6 . Flujos de Usuario Críticos
### 6.1 Editor de Layout (Organizador)
Carga Inicial: GET /venues/{id}/layout. Si está vacío, inicializar canvas en blanco.

Herramientas: Barra lateral con botones DaisyUI ("Dibujar Sección", "Agregar Fila").

Lógica de Dibujo:

Clic en el mapa -> agrega puntos al polígono.

Doble clic -> cierra el polígono y abre Modal (DaisyUI) para poner nombre y aforo.

Guardado: Botón "Guardar Cambios" -> PUT /venues/{id}/layout.

### 6.2 Flujo de Compra (Usuario Final)
Vista General: Mostrar imagen del estadio (SVG o PNG de fondo) con polígonos de secciones superpuestos (clicables).

Selección de Zona: Al hacer clic en una sección -> Zoom in (animado) -> Cargar asientos (GET /sections/{id}/seats).

Selección de Asientos:

- Clic en asiento verde (AVAILABLE) -> Cambia a azul (SELECTED) y se suma al store de Zustand (Carrito).

- Máximo 6 asientos por compra.

Checkout: Botón flotante que muestra resumen y total. Al presionar -> POST /orders/lock (bloqueo en Redis).

## 7. Next Steps para Implementación
Al generar código, proceder en este orden:

Configuración Base: Setup de Next.js, Tailwind, DaisyUI, y Stores.

API Client: Configuración de Axios y React Query Provider.

Visual Editor (MVP): Implementar canvas con Konva para dibujar rectángulos simples y guardarlos.

Image Integration: Implementar el EventImageService en frontend y los componentes de UI.

Public Map: Implementar la vista de solo lectura con estados de colores.

### 8. Typography

Font Family: 'Inter' (primary) or 'Roboto' (fallback)
Headings: Use prose classes or font-bold text-base-content
Body: text-base-content (auto adapts to theme)

### 9. Tailwind Config with DaisyUI
```js
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        neonpass: {
          'primary': '#6366f1',        // Indigo
          'secondary': '#d946ef',      // Fuchsia
          'accent': '#06b6d4',         // Cyan
          'neutral': '#1e293b',        // Slate 800
          'base-100': '#0f172a',       // Slate 900
          'base-200': '#1e293b',       // Slate 800
          'base-300': '#334155',       // Slate 700
          'info': '#3b82f6',           // Blue
          'success': '#22c55e',        // Green
          'warning': '#f59e0b',        // Amber
          'error': '#ef4444',          // Red
        },
      },
    ],
    darkTheme: 'neonpass',
    base: true,
    styled: true,
    utils: true,
  },
};

export default config;
```

---

## 10. Testing Checklist

Before submitting code, verify:

- [ ] All buttons use `btn` class (no custom buttons)
- [ ] All inputs use `input input-bordered`
- [ ] Cards use `card bg-base-200 shadow-xl`
- [ ] Colors use semantic classes (primary, success, error, etc.)
- [ ] Konva components use hex colors from `KONVA_COLORS` constant
- [ ] Seat map uses hierarchical loading (sections first, then seats)
- [ ] Forms use React Hook Form + Zod validation
- [ ] API calls use TanStack Query
- [ ] Global state uses Zustand
- [ ] Animations use Framer Motion or DaisyUI transitions
- [ ] Images use Next.js Image component
- [ ] Long lists use virtualization
- [ ] WebSocket connected for real-time updates
- [ ] TypeScript strict mode enabled (no `any` types)

---

## 11. Common Mistakes to Avoid

### ❌ NEVER Do This:
```tsx
// ❌ Building buttons from scratch
<button className="px-4 py-2 bg-blue-600 rounded">Click</button>

// ❌ Using Tailwind colors directly
<div className="bg-indigo-600">...</div>

// ❌ CSS classes on Konva components
<Circle className="fill-green-500" />

// ❌ Loading all seats at once
const { data: allSeats } = useQuery(['all-seats'], fetchAllSeats);

// ❌ Using `any` type
const handleClick = (event: any) => { /* ... */ }

// ❌ Hardcoded API URLs
fetch('http://localhost:8080/api/events')

// ❌ Not handling loading states
const { data } = useQuery(['events'], fetchEvents);
return <div>{data.map(/* ... */)}</div>; // Will crash if data is undefined
```

### ✅ Always Do This:
```tsx
// ✅ Use DaisyUI components
<button className="btn btn-primary">Click</button>

// ✅ Use semantic color classes
<div className="bg-primary">...</div>

// ✅ Pass props to Konva
<Circle fill={KONVA_COLORS.SUCCESS} />

// ✅ Lazy load seats by section
const { data: seats } = useQuery(
  ['seats', sectionId],
  () => fetchSeatsBySection(sectionId),
  { enabled: !!sectionId }
);

// ✅ Proper TypeScript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => { /* ... */ }

// ✅ Environment variables
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`)

// ✅ Handle loading states
const { data, isLoading } = useQuery(['events'], fetchEvents);
if (isLoading) return <div className="skeleton h-32 w-full"></div>;
return <div>{data.map(/* ... */)}</div>;
```

---

## Summary for Google Antigravity

**When implementing NeonPass frontend:**

1. **ALWAYS** use DaisyUI component classes (`btn`, `card`, `input`, etc.)
2. **NEVER** build UI components from scratch with Tailwind utilities
3. **ALWAYS** use semantic color classes (`primary`, `success`, `error`)
4. **NEVER** use CSS classes on React Konva components
5. **ALWAYS** lazy load seats by section (hierarchical loading)
6. **NEVER** render all 50,000 seats at once
7. **ALWAYS** use TypeScript strict mode
8. **ALWAYS** handle loading/error states in queries
9. **ALWAYS** use Framer Motion for animations
10. **ALWAYS** validate forms with Zod + React Hook Form

**Remember:** The seat map is the performance bottleneck. Optimize it first!