# AGENTS.md

Guidelines for AI agents working on this Next.js 16 + TypeScript project.

## Build/Lint/Format Commands

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint

# Format code
pnpm format
```

**Note:** No test runner is configured yet. This project does not have a test command.

## Package Manager

Use `pnpm` exclusively. Do not use npm, yarn, or bun.

## Project Structure

```
/app                      - Next.js App Router pages and API routes
/components               - React components
  /ui                     - Reusable UI components
  /*-suspense.tsx         - Suspense wrapper components
  /*-dynamic.tsx          - Dynamic import wrappers
/lib
  /cache                  - Cached server functions with 'use cache'
  /hooks                  - Custom React hooks (use* prefix)
  /stores                 - Zustand state stores
  /services               - API service functions
  /types                  - TypeScript type definitions
/docs                     - Documentation files
```

## Architecture Overview

This project uses a **hybrid architecture** optimized for performance:

- **Server Components** by default for static content
- **Client Components** only when interactivity is needed
- **Suspense Boundaries** for progressive loading
- **Dynamic Imports** for heavy components
- **Multi-layer caching** (CDN + Next.js + TanStack Query)

## Code Style Guidelines

### TypeScript

- Enable strict mode (already configured)
- Use `type` keyword when importing types: `import type { Foo } from '...'`
- Define explicit return types for exported functions
- Use path alias `@/*` for imports from project root
- **No `any` types** - always define proper interfaces

### Formatting (Prettier)

- Single quotes
- No semicolons
- 2-space indentation (no tabs)
- 100 character print width
- Trailing commas (ES5 style)
- Double quotes for JSX attributes

### Naming Conventions

- **Components:** PascalCase (e.g., `Navbar.tsx`, `BusCard`)
- **Files:** kebab-case (e.g., `use-consultar-bus.ts`)
- **Functions/Variables:** camelCase
- **Types/Interfaces:** PascalCase
- **Hooks:** camelCase with `use` prefix
- **Stores:** camelCase with `Store` suffix

### Imports Order

```typescript
// 1. React/Next.js imports
import { useState, Suspense } from "react";
import dynamic from "next/dynamic";

// 2. Third-party library imports
import { useQuery } from "@tanstack/react-query";

// 3. Absolute project imports
import { Navbar } from "@/components/navbar";
import { useBusStore } from "@/lib/stores/busStore";
import type { Favorito } from "@/lib/types/bus";

// 4. Relative imports
import { CustomSelect } from "./custom-select";
```

### Component Patterns

#### Server Component (Default)

```typescript
// page.tsx - Server Component
import { HomeClient } from "@/components/home-client";

export default function Home() {
  return (
    <main>
      <HomeClient />
    </main>
  );
}
```

#### Client Component

```typescript
"use client";

import { useState } from "react";

interface ButtonProps {
  onClick?: () => void;
}

export function Button({ onClick }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  return <button onClick={onClick}>{children}</button>;
}
```

#### Dynamic Import

```typescript
// components/heavy-component-dynamic.tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(
  () => import("./heavy-component").then(mod => ({ default: mod.HeavyComponent })),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export { HeavyComponent };
```

#### Suspense Wrapper

```typescript
// components/view-suspense.tsx
import { Suspense } from "react";
import { View } from "./view";
import { ViewSkeleton } from "./view-skeleton";

export function ViewWithSuspense() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <View />
    </Suspense>
  );
}
```

## Performance Optimizations

### 1. Zustand Selectors (Atomic Subscriptions)

**❌ DON'T:** Subscribe to entire store

```typescript
const store = useBusStore();
const { lineaSeleccionada } = store; // Re-renders on ANY store change
```

**✅ DO:** Use atomic selectors

```typescript
const lineaSeleccionada = useBusStore((state) => state.lineaSeleccionada);
const setLinea = useBusStore((state) => state.setLinea);
// Only re-renders when these specific values change
```

### 2. Dynamic Imports for Heavy Components

Components that should use dynamic imports:

- `arrivals-sheet.tsx` (uses react-modal-sheet)
- `bottom-sheet.tsx` (complex animation)
- Any component with heavy libraries (>50KB)

### 3. Suspense Boundaries

Wrap data-fetching components in Suspense:

- `consultar-view.tsx` → `consultar-view-suspense.tsx`
- `favoritos-view.tsx` → `favoritos-view-suspense.tsx`

### 4. GPU Acceleration for Animations

Add to animated components:

```typescript
className =
  "will-change-transform transform-gpu transition-transform duration-300";
```

## Caching Strategy

### Multi-Layer Caching

1. **Browser Cache** - Cache-Control headers
2. **CDN Cache** - Vercel Edge Cache
3. **Next.js Cache** - `'use cache'` directive
4. **TanStack Query** - Client-side cache

### Cache Configuration

#### Static Data (24h)

- Lineas, Calles, Intersecciones, Paradas, Recorrido
- Uses `cacheLife('static')`

#### Dynamic Data (1min)

- Arribos (real-time arrivals)
- Uses `cacheLife('realtime')`

### Cache Invalidation

Manual revalidation via API:

```bash
curl -X POST /api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"tag": "bus-lineas"}'
```

See full documentation: `docs/CACHING_STRATEGY.md`

## Error Handling

### API Routes

```typescript
try {
  const result = await fetchData();
  console.log("✅ [SUCCESS] Data fetched");
  return NextResponse.json({ resultado: result });
} catch (error) {
  console.error("❌ ERROR:", error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Unknown error" },
    { status: 500 },
  );
}
```

### Error Boundaries

- `app/error.tsx` - Route-level error boundary
- `app/global-error.tsx` - Global error handler
- Always provide retry functionality

## Styling (Tailwind CSS v4)

- Use `cn()` utility from `@/lib/utils` for conditional classes
- Use Tailwind's semantic color names
- Add `will-change-transform` for animated elements
- Use arbitrary values sparingly

## API Routes

- **Static data:** GET endpoints with CDN caching
- **Dynamic data:** POST endpoints
- **Cache invalidation:** `/api/revalidate` endpoint
- Use proper HTTP status codes
- Always validate inputs

## Important Notes

- Use Spanish for user-facing strings (app is in Spanish)
- Use English for code, comments, and variable names
- Never commit `.env.local` or other environment files
- Keep components focused and small (<200 lines)
- Prefer composition over inheritance
- Always use proper TypeScript types (no `any`)

## Framework Versions

- Next.js: 16.1.6
- React: 19.x
- TypeScript: 5.x
- Tailwind CSS: 4.x
- Node.js: 20+

## Resources

- Caching Strategy: `docs/CACHING_STRATEGY.md`
- Next.js Docs: https://nextjs.org/docs
- TanStack Query: https://tanstack.com/query
- Tailwind CSS: https://tailwindcss.com
