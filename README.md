# Chicama Map

Mapa y directorio de puntos útiles en Puerto Chicama / Malabrigo.

## Stack
- Frontend: `Vite + React + TypeScript`
- Backend: `Bun + Elysia + Prisma + SQLite`
- Mapa: `Leaflet`

## Estructura
- `src/` → app web pública y panel admin
- `server/` → API, auth y datos

## Desarrollo local

### Frontend
```bash
bun install
bun run dev
```

### Backend
```bash
cd server
bun install
bun run seed
bun run dev
```

## Variables del backend
Configura en `server/.env` si hace falta:

```env
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=admin
JWT_SECRET=change-me
DATABASE_URL=file:./prisma/dev.db
CORS_ORIGIN=http://localhost:5173
```

## Estado actual
- sin integración MCP
- sin uploads de imágenes
- lista, mapa y guardados activos
- admin para crear/editar/eliminar puntos

## Build
```bash
npm run build
```

## Nota
Este repo está preparado para subirse limpio a GitHub, ignorando artefactos locales y archivos generados.
