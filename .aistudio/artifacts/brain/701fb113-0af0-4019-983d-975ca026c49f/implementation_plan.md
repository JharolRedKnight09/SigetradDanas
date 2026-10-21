# Plan de Implementación: Alternancia de Modo Claro y Modo Oscuro (Azul Corporativo & Cyan Portuario)

Plan integral para optimizar el cambio de colores y temas en SIGETRAD (Transportes Dannas, S.A.), permitiendo alternar fluidamente entre Modo Claro y Modo Oscuro con armonía visual completa en toda la interfaz (barra superior, barra lateral, tarjetas, tablas y modales), bajo la paleta corporativa de Azul y Cyan Portuario.

## Decisiones Críticas y Preferencias del Usuario

> [!IMPORTANT]
> Decisiones confirmadas en la fase de interacción:
> - **Tipo de cambio de color**: Alternar entre el Modo Claro y Modo Oscuro existente en el sistema.
> - **Paleta cromática seleccionada**: Azul Corporativo (`#1D4ED8` / `#2563EB`) y Cyan Portuario (`#0284C7` / `#38BDF8`), garantizando sobriedad operativa, alto contraste y lectura ergonómica en muelle y oficina.

- **Ubicación del control**: Mantener y destacar el botón interactivo de Sol/Luna en la barra superior (Navbar), añadiendo además acceso directo en el menú móvil y en el menú de perfil de usuario.
- **Alcance del tema**: Asegurar que tanto el encabezado superior (Navbar), sub-barra de telemetría y sidebar respondan armónicamente al Modo Claro/Oscuro en lugar de mantener fondos oscuros fijos.

---

## 1. Visión General y Concepto Central

- **Propósito**: Facilitar al usuario la alternancia instantánea entre Modo Oscuro (ideal para turnos nocturnos y terminales portuarias con baja luz) y Modo Claro (óptimo para oficinas con alta iluminación natural o trabajo administrativo diurno).
- **Audiencia Objetivo**: Administradores de flota, supervisores de báscula en muelle, directores financieros y pilotos de Transportes Dannas.
- **Valor Agregado**: Coherencia estética de 360 grados; al cambiar de modo no quedan áreas híbridas o ilegibles. Todo se ajusta de inmediato y la preferencia se almacena en `localStorage` permanentemente.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujos Clave de Interacción
1. **Acceso directo desde Navbar**: En la parte superior derecha, un botón con icono y etiqueta dinámica ("Modo Claro" / "Modo Oscuro") permite cambiar de tema con un solo clic en menos de 100ms.
2. **Acceso en menú móvil**: En dispositivos móviles o tablets en muelle, el menú lateral desplegable incluye un conmutador rápido de tema.
3. **Persistencia automática**: Al refrescar la página o cerrar sesión, la preferencia seleccionada se preserva.

### Identidad Visual y Paleta (Azul Corporativo & Cyan Portuario)
- **Modo Claro (Light Mode)**:
  - Lienzo de fondo principal: `#F8FAFC` (Slate 50) y `#FFFFFF` nítido.
  - Tarjetas y contenedores: Fondo blanco puro con bordes de línea fina `#E2E8F0` y sombras suaves.
  - Barra superior y Sub-barra: Fondo blanco/slate translúcido con bordes nítidos y texto oscuro legible (`#0F172A`).
  - Acentos primarios: Azul Corporativo (`#2563EB` / `#1D4ED8`).
  - Acentos secundarios/portuarios: Cyan y Azul Cielo (`#0284C7` / `#0369A1`).
  - Textos: Títulos en `#0F172A`, cuerpo en `#334155`, metadatos en `#64748B`.
- **Modo Oscuro (Dark Mode)**:
  - Lienzo base: `#0B0F17` (Negro pizarra profundo).
  - Tarjetas y contenedores: `#131B26` y `#1A2433` con bordes sutiles `#1E293B`.
  - Acentos primarios: Cyan Portuario brillante (`#38BDF8`) y Azul vibrante (`#2563EB`).
  - Textos: Títulos en `#F8FAFC`, secundarios en `#94A3B8`.

### Jerarquía Tipográfica y Disciplina Visual
- Fuentes: **Plus Jakarta Sans** para títulos e interfaces limpias, y **JetBrains Mono** / `tabular-nums` para pesajes de báscula (toneladas), valores monetarios en Quetzales y placas.
- Regla 60-30-10: 60% lienzo neutro, 30% superficies estructurales con bordes de 1px, 10% acento en botones de acción y estado activo.

---

## 3. Decisiones Clave y Solución Técnica

- **Decisión 1: Sincronización integral del Navbar y Sub-barra**:
  - *Enfoque*: Reemplazar las clases de fondo oscuro estáticas (`bg-[#0B0F17]`) en el `Navbar` y `App.tsx` por estilos condicionales (`theme === 'light' ? ... : ...`), logrando que en Modo Claro todo el sistema se perciba diurno y ejecutivo.
- **Decisión 2: Botón de tema siempre visible y comprensible**:
  - *Enfoque*: Mejorar el botón en la barra superior con un distintivo visual claro, tooltip explícito y añadir el selector al menú desplegable de usuario para que sea intuitivo para cualquier operador.
- **Decisión 3: Soporte de contraste en tablas y formularios**:
  - *Enfoque*: Reforzar las reglas de `index.css` y las clases Tailwind en los módulos de operaciones, básculas y facturación para que los campos de texto, filtros y encabezados mantengan contraste WCAG AA en ambos modos.

---

## 4. Arquitectura y Mapeo de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    AppContext (theme state)                 │
│         theme: 'dark' | 'light' ◄──► localStorage           │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│            Navbar            │ │           Sidebar            │
│  - Botón Sol/Luna destacado  │ │  - Estilo claro/oscuro       │
│  - Header adaptativo         │ │  - Íconos y badges azules    │
│  - Opción en menú de perfil  │ │  - Acceso móvil rápido       │
└──────────────┬───────────────┘ └──────────────┬───────────────┘
               │                                │
               └───────────────┬────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Panel Central & Módulos                 │
│         - Dashboard Ejecutivo (Tarjetas & Gráficas)         │
│         - Operaciones & Básculas de Góndolas                │
│         - Facturación, Cobros & Combustible                 │
│         (Bordes nítidos, texto oscuro/claro, acentos Cyan)  │
└─────────────────────────────────────────────────────────────┘
```

### Plan de Cambios Específicos
1. **`src/components/Navbar.tsx`**:
   - Adaptar el contenedor `<header>` para que en Modo Claro use fondo blanco con borde slate limpio, y en Modo Oscuro conserve el fondo azul-marino oscuro.
   - Reforzar el botón de alternancia de tema con diseño visible y tooltip explicativo.
   - Incorporar la opción de alternar tema dentro del menú de usuario para mayor accesibilidad.
2. **`src/App.tsx`**:
   - Ajustar la sub-barra institucional y el fondo general para una transición limpia sin parpadeos.
3. **`src/index.css`**:
   - Optimizar variables CSS y clases auxiliares para la paleta de Azul y Cyan Portuario, eliminando cualquier inconsistencia de color de fondo o texto en modales y tablas.
4. **Verificación**:
   - Compilación con `compile_applet` y prueba de cambio dinámico en tiempo real.
