# Design System & UI/UX Guidelines (DaisyUI Version)

## 1. Concepto Visual
**Tema:** "EventOS Dark". Una estética oscura profunda con acentos neón vibrantes.
**Librería de Componentes:** DaisyUI (sobre Tailwind CSS).

## 2. Semántica de Colores (DaisyUI Class Mapping)
La IA debe utilizar las clases semánticas de DaisyUI en lugar de colores hardcodeados de Tailwind.

| Concepto | Clase DaisyUI | Color Hex (Referencia) | Uso |
| :--- | :--- | :--- | :--- |
| **Fondo** | `base-100` | `#0f172a` (Slate 900) | Fondo de página |
| **Superficies** | `base-200` / `base-300` | `#1e293b` | Tarjetas, Modales, Sidebars |
| **Acción Principal** | `primary` | `#6366f1` (Indigo) | Botón "Comprar", "Login" |
| **Acción Secundaria** | `secondary` | `#d946ef` (Fuchsia) | Destacados, Badges VIP |
| **Acento** | `accent` | `#06b6d4` (Cyan) | Elementos interactivos menores |
| **Éxito/Libre** | `success` | `#22c55e` | Asientos disponibles |
| **Error/Ocupado** | `error` | `#ef4444` | Asientos ocupados |
| **Info/Seleccionado**| `info` | `#3b82f6` | Asiento seleccionado por mi |

## 3. Tipografía
- **Font:** 'Inter' o 'Roboto'.
- **Headings:** Usar clases `prose` de DaisyUI cuando sea posible o `font-bold text-base-content`.

## 4. Componentes Core (Reglas de Uso)

### Botones
- Usar: `<button className="btn btn-primary">`
- Ghost: `<button className="btn btn-ghost">` (Para menús)
- Loading: `<button className="btn btn-primary"><span className="loading loading-spinner"></span> Procesando</button>`

### Inputs & Forms
- Usar: `input input-bordered w-full`
- Focus: DaisyUI maneja el focus ring automáticamente con el color `primary`.

### Cards
- Estructura estándar:
  ```jsx
  <div className="card w-96 bg-base-200 shadow-xl">
    <div className="card-body">
      <h2 className="card-title">Evento!</h2>
      <p>Descripción...</p>
    </div>
  </div>

## 6. Excepciones Técnicas y Reglas de Renderizado (CRÍTICO)

### El componente "SeatMap" (React-Konva)
Este componente renderiza en un HTML5 Canvas, no en el DOM. Por tanto, **las clases CSS de DaisyUI/Tailwind NO tienen efecto aquí**.

**Reglas de Estilo para Konva:**
1.  **No usar `className`:** Los componentes `<Stage>`, `<Layer>`, `<Rect>`, `<Circle>`, `<Path>` ignoran el CSS.
2.  **Usar Props:** Debes pasar los estilos como propiedades numéricas o strings hexadecimales.
3.  **Mapeo de Colores:** Debes extraer los valores Hexadecimales del tema NeonPass y pasarlos manualmente.

**Ejemplo de Implementación:**

❌ **INCORRECTO (La IA no debe hacer esto):**
```tsx
// Esto no pintará nada
<Rect className="bg-primary w-10 h-10 rounded-md" />