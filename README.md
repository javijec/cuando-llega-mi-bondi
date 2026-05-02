# 🚌 MiBondi

<p align="center">
  <strong>Consulta en tiempo real cuándo llega tu colectivo en Mar del Plata</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16"></a>
  <a href="#"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS"></a>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel" alt="Vercel"></a>
  <a href="#"><img src="https://img.shields.io/badge/Mobile-First-FF6B6B?style=flat-square" alt="Mobile First"></a>
  <a href="#"><img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa" alt="PWA"></a>
</p>

---

## 📱 Demo

**MiBondi** es una aplicación web progresiva (PWA) que permite consultar los tiempos de arribo de colectivos en Mar del Plata, Argentina. Diseñada con enfoque mobile-first y optimizada para máxima performance.

### Características principales:

- 🕐 **Arribos en tiempo real** - Consulta cuándo llega tu colectivo en segundos
- ⭐ **Favoritos inteligentes** - Guarda tus paradas y consulta arribos automáticamente
- 🎨 **Diseño moderno** - Interfaz limpia con modo claro/oscuro
- ⚡ **Ultra rápida** - Caché multi-capa para respuestas instantáneas
- ♿ **Accesible** - Cumple con estándares WCAG AAA

---

## 🚀 Tech Stack

| Categoría | Tecnologías |
|-----------|-------------|
| **Framework** | [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) + [tw-animate-css](https://github.com/tw-in-js/tw-animate-css) |
| **Estado** | [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query](https://tanstack.com/query/latest) |
| **Mapas** | [MapLibre GL](https://maplibre.org/) |
| **Animaciones** | [Motion](https://motion.dev/) (Framer Motion) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) + [react-modal-sheet](https://github.com/Temzasse/react-modal-sheet) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Package Manager** | [pnpm](https://pnpm.io/) |

---

## 🏗️ Arquitectura

### Server/Client Components Híbrida

```
┌─────────────────────────────────────────────────────┐
│                  Next.js 16 App                     │
│  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │ Server Component│  │   Client Component      │   │
│  │  (Static)       │  │   (Interactive)         │   │
│  │                 │  │                         │   │
│  │  - Page layout  │  │   - Favoritos Store     │   │
│  │  - Data fetch   │  │   - Consultar form      │   │
│  │  - SEO          │  │   - Bottom sheet        │   │
│  └─────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Estrategia de Caché Multi-capa

| Capa | Tecnología | TTL | Uso |
|------|-----------|-----|-----|
| 1. Browser | Cache-Control Headers | - | Assets estáticos |
| 2. CDN | Vercel Edge Cache | 24h / 1min | Respuestas API |
| 3. Server | Next.js `use cache` | 24h / 1min | Funciones server |
| 4. Client | TanStack Query | Configurable | Estado local |

**Perfiles de caché:**
- **Static** (24h): Líneas, calles, intersecciones, paradas, recorrido
- **Realtime** (1min): Arribos de colectivos

---

## 📦 Instalación

### Requisitos previos

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/installation) 8+

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tuusuario/mibondi.git
cd mibondi

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Iniciar servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔐 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Luego completa estas variables:

```env
MUNI_API_URL=
MUNI_ORIGIN=
MUNI_REFERER=
```

- `MUNI_API_URL`: endpoint base de la API municipal que responde las acciones como `RecuperarLineaPorCuandoLlega`
- `MUNI_ORIGIN`: origin esperado por la API remota
- `MUNI_REFERER`: referer esperado por la API remota

Sin esas variables, las rutas como `/api/bus/lineas` devolverán `500`.

---

## 🎯 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo con hot reload

# Producción  
pnpm build            # Build optimizado para producción
pnpm start            # Inicia servidor de producción

# Calidad de código
pnpm lint             # Ejecuta ESLint con reglas de Next.js
pnpm format           # Formatea código con Prettier
```


---

## 🎨 Tema de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Amarillo | `#f9cd4a` | Primario, branding, acentos |
| Turquesa | `#289b95` | Secundario, éxito |
| Rosa | `#e54f90` | Destructivo, eliminar |
| Error | `#d64545` | Estados de error |
| Success | `#2e9b6f` | Estados de éxito |
| BG Light | `#fbfbf8` | Fondo tema claro |
| BG Dark | `#22436f` | Fondo tema oscuro |
| Texto | `#22436f` / `#fbfbf8` | Texto según tema |

---

## ⚡ Performance Optimizations

- **Zustand Selectors**: Subscripciones atómicas para evitar re-renders
- **Dynamic Imports**: Carga diferida de componentes pesados
- **Suspense Boundaries**: Loading states progresivos
- **Intersection Observer**: Solo fetchear datos de elementos visibles
- **Debounce**: En interacciones para evitar spam de requests
- **GPU Acceleration**: `will-change-transform` en animaciones

---

## ♿ Accesibilidad

- ✅ ARIA labels en todos los elementos interactivos
- ✅ Roles semánticos (`list`, `listitem`, `article`)
- ✅ Focus management con [react-aria](https://react-spectrum.adobe.com/react-aria/)
- ✅ Contraste WCAG AAA en ambos temas
- ✅ Navegación por teclado completa

---


<p align="center ">
  Hecho con ❤️ en Mar del Plata, Argentina
</p>

<p align="center">
  <a href="https://mibondi.vercel.app">🌐 mibondi.vercel.app</a>
</p>
