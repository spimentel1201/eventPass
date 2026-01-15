# Guía de Integración Frontend - Seating Map

## Vista General

Este documento describe el flujo de integración para el editor visual de asientos y el mapa de compra de tickets.

## Tecnologías Recomendadas

| Librería | Uso |
|----------|-----|
| **React-Konva** | Canvas interactivo para dibujar secciones/asientos |
| **DaisyUI** | Componentes UI (modales, botones, formularios) |
| **react-zoom-pan-pinch** | Zoom y pan en el mapa |
| **SWR/React Query** | Caché y fetching de datos |

---

## Flujo del Organizador (Editor de Layout)

### 1. Crear Venue
```http
POST /api/v1/venues
Authorization: Bearer {token}

{
  "organizationId": "uuid",
  "name": "Estadio Nacional",
  "address": "Av. José Díaz s/n",
  "timezone": "America/Lima"
}
```

### 2. Abrir Editor Visual
```http
GET /api/v1/venues/{venueId}/layout
```

**Respuesta (primera vez):**
```json
{}
```

### 3. Dibujar en el Canvas

El organizador dibuja:
- **Secciones** (polígonos, rectángulos, círculos)
- **Filas y asientos** dentro de secciones

El frontend genera un JSON con toda la estructura:

```json
{
  "canvas": {
    "width": 1200,
    "height": 800,
    "backgroundColor": "#f5f5f5"
  },
  "elements": [
    {
      "id": "section-1",
      "type": "polygon",
      "points": [100, 100, 200, 100, 200, 200, 100, 200],
      "fill": "#3b82f6",
      "stroke": "#1d4ed8",
      "name": "Tribuna Norte"
    }
  ]
}
```

### 4. Guardar Layout
```http
PUT /api/v1/venues/{venueId}/layout
Authorization: Bearer {token}

{
  "layout": { ...todo el canvas JSON... }
}
```

### 5. Crear Secciones (en BD)
```http
POST /api/v1/sections
Authorization: Bearer {token}

{
  "venueId": "uuid",
  "name": "Tribuna Norte",
  "type": "SEATED",  // o GENERAL_ADMISSION, VIP, BOX
  "capacity": 500,
  "layoutConfig": {
    "polygon": [...],
    "color": "#3b82f6",
    "position": { "x": 100, "y": 100 }
  }
}
```

### 6. Crear Asientos (Bulk)
```http
POST /api/v1/sections/{sectionId}/seats
Authorization: Bearer {token}

[
  { "rowLabel": "A", "numberLabel": "1", "xPosition": 10, "yPosition": 10 },
  { "rowLabel": "A", "numberLabel": "2", "xPosition": 30, "yPosition": 10 },
  { "rowLabel": "A", "numberLabel": "3", "xPosition": 50, "yPosition": 10 },
  { "rowLabel": "B", "numberLabel": "1", "xPosition": 10, "yPosition": 30 },
  ...
]
```

**Tip:** Generar asientos automáticamente con un algoritmo de filas/columnas basado en el tamaño de la sección.

---

## Flujo del Comprador (Mapa de Asientos)

### 1. Cargar Mapa del Evento
```http
GET /api/v1/events/{eventId}/seating-map
```

**Respuesta:**
```json
{
  "eventId": "uuid",
  "venueId": "uuid",
  "venueName": "Estadio Nacional",
  "venueLayout": {
    "canvas": { "width": 1200, "height": 800 },
    "elements": [...]
  },
  "sections": [
    {
      "id": "uuid",
      "name": "Tribuna Norte",
      "type": "SEATED",
      "capacity": 500,
      "availableCount": 423,
      "soldCount": 77,
      "layoutConfig": {...},
      "seats": [
        {
          "id": "uuid",
          "rowLabel": "A",
          "numberLabel": "1",
          "xPosition": 10,
          "yPosition": 10,
          "status": "AVAILABLE"
        },
        {
          "id": "uuid",
          "rowLabel": "A",
          "numberLabel": "2",
          "xPosition": 30,
          "yPosition": 10,
          "status": "SOLD"
        }
      ]
    },
    {
      "id": "uuid",
      "name": "Campo General",
      "type": "GENERAL_ADMISSION",
      "capacity": 2000,
      "availableCount": 1500,
      "soldCount": 500,
      "seats": null  // No hay asientos individuales
    }
  ],
  "summary": {
    "totalCapacity": 5000,
    "totalAvailable": 4200,
    "totalSold": 800,
    "totalReserved": 0
  }
}
```

### 2. Renderizar Mapa Interactivo

```tsx
// Pseudocódigo React
function SeatingMap({ eventId }) {
  const { data } = useSWR(`/api/v1/events/${eventId}/seating-map`);
  const [selectedSeats, setSelectedSeats] = useState([]);

  return (
    <Stage width={data.venueLayout.canvas.width} height={data.venueLayout.canvas.height}>
      <Layer>
        {data.sections.map(section => (
          <Section 
            key={section.id} 
            section={section}
            onSeatClick={(seat) => {
              if (seat.status === 'AVAILABLE') {
                setSelectedSeats([...selectedSeats, seat]);
              }
            }}
          />
        ))}
      </Layer>
    </Stage>
  );
}
```

### 3. Colores por Estado

| Estado | Color | Interacción |
|--------|-------|-------------|
| `AVAILABLE` | Verde `#22c55e` | Clickeable |
| `SOLD` | Rojo `#ef4444` | Deshabilitado |
| `RESERVED` | Amarillo `#eab308` | Deshabilitado |
| `SELECTED` | Azul `#3b82f6` | Clickeable (deseleccionar) |

### 4. Proceder a Compra
```http
POST /api/v1/orders
Authorization: Bearer {token}

{
  "eventId": "uuid",
  "items": [
    { "ticketTierId": "uuid", "seatId": "uuid", "quantity": 1 },
    { "ticketTierId": "uuid", "seatId": "uuid", "quantity": 1 }
  ]
}
```

---

## Tipos de Secciones

| Tipo | Descripción | Seats |
|------|-------------|-------|
| `SEATED` | Asientos numerados (tribuna, palco) | Array de seats con posición |
| `GENERAL_ADMISSION` | Entrada general (campo, pista) | Solo cantidad disponible |
| `VIP` | Zona VIP con asientos | Array de seats |
| `BOX` | Palco privado | Array de seats |

---

## Endpoints Resumen

### Editor (Organizador)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| PUT | `/venues/{id}/layout` | Guardar layout del canvas |
| GET | `/venues/{id}/layout` | Cargar layout para editar |
| POST | `/sections` | Crear sección |
| GET | `/venues/{id}/sections` | Listar secciones |
| POST | `/sections/{id}/seats` | Crear asientos (bulk) |
| GET | `/sections/{id}/seats` | Listar asientos |

### Comprador
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/events/{id}/seating-map` | Mapa con disponibilidad |

---

## Consideraciones UX

1. **Zoom responsivo** - El mapa debe adaptarse a móvil con pinch-to-zoom
2. **Tooltips** - Mostrar info del asiento al hover
3. **Leyenda** - Indicar colores de estados
4. **Contador** - Mostrar asientos seleccionados y total
5. **Timer** - Reservar asientos por tiempo limitado para evitar conflictos
6. **Refresh** - Actualizar disponibilidad cada ~30 segundos

---

## Ejemplo de Estructura de Carpetas (Next.js)

```
src/
├── components/
│   ├── seating/
│   │   ├── SeatingMap.tsx        # Canvas principal
│   │   ├── Section.tsx           # Componente de sección
│   │   ├── Seat.tsx              # Componente de asiento
│   │   ├── SeatLegend.tsx        # Leyenda de colores
│   │   └── SeatCounter.tsx       # Contador de selección
│   └── editor/
│       ├── VenueEditor.tsx       # Editor de layout
│       ├── SectionDrawer.tsx     # Herramienta de dibujo
│       └── SeatGenerator.tsx     # Generador automático
├── hooks/
│   ├── useSeatingMap.ts          # Hook para cargar mapa
│   └── useSeatSelection.ts       # Estado de selección
└── services/
    └── seating.ts                # API calls
```
