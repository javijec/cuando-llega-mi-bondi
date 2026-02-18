# Estrategia de Caché - MiBondi

Este documento describe la estrategia de caché multicapa implementada en MiBondi para optimizar el rendimiento y reducir llamadas a la API.

## 📊 Arquitectura de Caché

Tenemos **4 capas de caché** que trabajan juntas:

```
┌─────────────────────────────────────────────────────────────┐
│  NAVEGADOR (Browser Cache)                                  │
│  - Cache-Control headers                                    │
│  - Duración: según tipo de dato                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  CDN (Vercel Edge Cache)                                    │
│  - CDN-Cache-Control headers                                │
│  - Cache distribuido globalmente                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  NEXT.JS CACHE ('use cache')                                │
│  - Cache del servidor Next.js                               │
│  - Revalidación con tags                                    │
│  - Perfiles: static (24h), realtime (1min)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  TANSTACK QUERY (Client Cache)                              │
│  - staleTime, gcTime configurados                         │
│  - React Query DevTools disponible                        │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Configuración de Caché

### 1. Next.js Config (`next.config.ts`)

```typescript
cacheComponents: true,  // Habilita 'use cache'
cacheLife: {
  static: {
    stale: 86400,      // 24 horas
    revalidate: 86400,
    expire: 604800,    // 7 días
  },
  realtime: {
    stale: 60,         // 1 minuto
    revalidate: 60,
    expire: 3600,      // 1 hora
  },
},
```

### 2. API Routes Cache (`lib/cache/bus-cache.ts`)

Los datos se cachean según su naturaleza:

| Endpoint                  | Tipo     | TTL  | Perfil   |
| ------------------------- | -------- | ---- | -------- |
| `/api/bus/lineas`         | Estático | 24h  | static   |
| `/api/bus/calles`         | Estático | 24h  | static   |
| `/api/bus/intersecciones` | Estático | 24h  | static   |
| `/api/bus/paradas`        | Estático | 24h  | static   |
| `/api/bus/recorrido`      | Estático | 24h  | static   |
| `/api/bus/arribos`        | Dinámico | 1min | realtime |

### 3. TanStack Query Config (`lib/hooks/useBusQuery.ts`)

```typescript
// Datos estáticos
staleTime: 24 * 60 * 60 * 1000,  // 24 horas
gcTime: 7 * 24 * 60 * 60 * 1000,  // 7 días

// Datos dinámicos (arribos)
staleTime: 30 * 1000,             // 30 segundos
gcTime: 2 * 60 * 1000,            // 2 minutos
refetchInterval: 60 * 1000,       // Polling cada 1 minuto
```

## 🏷️ Cache Tags

Cada endpoint tiene un tag para invalidación selectiva:

- `bus-lineas`
- `bus-calles`
- `bus-intersecciones`
- `bus-paradas`
- `bus-recorrido`
- `bus-arribos`

## 🔄 Revalidación de Caché

### Automática

- Los datos estáticos se revalidan cada 24 horas
- Los arribos se actualizan cada minuto (polling)

### Manual (On-Demand)

Usa el endpoint `/api/revalidate`:

```bash
# Revalidar un solo tag
curl -X POST https://tu-app.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"tag": "bus-lineas"}'

# Revalidar múltiples tags
curl -X POST https://tu-app.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"tags": ["bus-lineas", "bus-calles"]}'

# Revalidar todos los tags
curl -X POST https://tu-app.vercel.app/api/revalidate \
  -d '{"all": true}'
```

### Protección con API Key (Opcional)

Configura `REVALIDATE_API_KEY` en tus variables de entorno:

```bash
curl -X POST https://tu-app.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-api-key: tu-api-key-secreta" \
  -d '{"all": true}'
```

## 📈 Monitoring

### Headers de Debug

Cada respuesta incluye headers de debug:

```
X-Cache-TTL: 86400
X-Action: lineas
```

### Console Logs

En desarrollo, verás logs detallados:

```
🌐 [MUNI API CALL] RecuperarLineaPorCuandoLlega - 2024-01-15T10:30:00.000Z
✅ [MUNI SUCCESS] RecuperarLineaPorCuandoLlega
✅ [REVALIDATE] Tag: bus-lineas
```

## 🚀 Mejores Prácticas

### 1. Cuándo Revalidar

- **Después de deploys**: Revalida todo con `{"all": true}`
- **Cambios en datos estáticos**: Revalida tags específicos
- **Debugging**: Usa `{"tag": "bus-arribos"}` para forzar refresh

### 2. Performance

- Los datos estáticos solo se fetchean una vez por usuario (hasta que expire)
- El polling de arribos se pausa cuando la pestaña no está visible
- Los favoritos usan IntersectionObserver para solo fetchear cards visibles

### 3. Freshness vs Performance

Balance entre datos frescos y caché:

- **Líneas/Calles/Paradas**: 24h (casi nunca cambian)
- **Recorridos**: 24h (estáticos)
- **Arribos**: 1min (datos en tiempo real)

## 🔧 Troubleshooting

### Datos desactualizados

```bash
# Forzar revalidación manual
curl -X POST /api/revalidate -d '{"tag": "bus-lineas"}'
```

### Limpiar caché de TanStack Query

```typescript
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ["lineas"] });
```

### Verificar headers de caché

```bash
curl -I https://tu-app.vercel.app/api/bus/lineas
# Mira por: Cache-Control, CDN-Cache-Control, X-Cache-TTL
```

## 📚 Recursos

- [Next.js Cache Components](https://nextjs.org/docs/app/getting-started/cache-components)
- [TanStack Query Caching](https://tanstack.com/query/latest/docs/framework/react/guides/caching)
- [Vercel Edge Cache](https://vercel.com/docs/concepts/edge-network/caching)
