# Feature Structure Guide (UniNest FE)

This document explains **where code lives** and **how to organize a new feature** in `fe/src`.

Use it together with [api-fetching.md](./api-fetching.md) for HTTP and TanStack Query.

---

## Big picture

```
src/
├── app/                 # App shell: providers, router (not business UI)
├── assets/              # Static imports (images index, etc.)
├── components/
│   ├── ui/              # Design system primitives (Button, Input, …)
│   └── common/          # Shared app chrome (Navbar, Loading, …)
├── config/              # env, routes (paths), app constants
├── features/            # Business domains (auth, rooms, …) ← main work here
├── hooks/               # Cross-feature React hooks
├── layouts/             # Page shells shared across features
├── lib/                 # axios, query-client, utils, zod re-export
├── pages/               # Route entry components (thin composers)
├── stores/              # Global Zustand stores (auth, theme)
├── styles/              # globals.css, tailwind
└── types/               # Shared TypeScript types (api wrapper, auth DTOs)
```

**Rule of thumb**

| Question | Put it in |
|----------|-----------|
| Used by one business area only? | `features/<name>/` |
| Used everywhere (button, modal)? | `components/ui/` |
| Used on many pages but not generic UI? | `components/common/` or `layouts/` |
| Wired to a URL? | `pages/` + `app/router/` |
| HTTP for one domain? | `features/<name>/api/` |

---

## Anatomy of a feature

A **complete** feature looks like this:

```
features/<feature-name>/
├── api/
│   └── <feature>.api.ts       # Axios calls only
├── components/
│   ├── <thing>-form.tsx       # Forms, cards, lists (feature-specific UI)
│   └── ...
├── hooks/
│   ├── use-<thing>.ts         # useQuery / useMutation
│   └── <feature>.keys.ts      # optional: query key factory
├── pages/
│   ├── <page>-page.tsx        # Route-level screen (layout + composition)
│   └── ...
├── schemas/
│   └── <feature>.schema.ts    # Zod schemas (forms)
├── types/
│   └── <feature>.type.ts      # Form values, view models (z.infer, UI types)
└── index.ts                   # Public exports for other modules
```

Not every feature needs every folder on day one. Add folders when you have real code for them.

---

## Folder responsibilities

### `api/` — HTTP layer

- **Only** functions that call `api` from `@/lib/axios`.
- No React, no hooks, no JSX.
- Name file `*.api.ts` (e.g. `auth.api.ts`, `rooms.api.ts`).

```ts
// features/rooms/api/rooms.api.ts
export const roomsApi = {
  list: () => api.get<ApiResponse<Room[]>>('/rooms'),
}
```

See [api-fetching.md](./api-fetching.md).

---

### `hooks/` — Data & side effects

- Wrap `*Api` with **TanStack Query** (`useQuery`, `useMutation`).
- Handle navigation, toasts, cache invalidation, Zustand updates.
- Components import hooks — **not** `api/` directly.

```ts
// features/auth/hooks/use-login.ts
export function useLogin() {
  return useMutation({ mutationFn: …, onSuccess: … })
}
```

**Optional:** `*.keys.ts` for query key constants:

```ts
export const roomKeys = {
  all: ['rooms'] as const,
  detail: (id: string) => ['rooms', id] as const,
}
```

---

### `schemas/` — Validation

- **Zod** schemas for forms and API payloads.
- Used with React Hook Form via `@hookform/resolvers/zod`.

```ts
// features/auth/schemas/auth.schema.ts
export const loginSchema = z.object({ … })
```

---

### `types/` — TypeScript types

- `z.infer<typeof schema>` for form values.
- Feature-specific interfaces that are **not** shared app-wide.
- Shared DTOs used by many features can live in `src/types/` instead (e.g. `auth.ts`).

```ts
// features/auth/types/auth.type.ts
export type LoginFormValues = z.infer<typeof loginSchema>
```

---

### `components/` — Feature UI

- UI **only used inside this feature** (or mostly).
- Forms, tables, cards, section blocks tied to the domain.
- May use `components/ui/*` and `components/common/*`.
- **No** route definitions here.

| Example (auth) | Role |
|----------------|------|
| `login-form.tsx` | Form + RHF + `useLogin()` |
| `auth-field.tsx` | Label + error wrapper |
| `password-input.tsx` | Password field with show/hide |

If a component is reused by **2+ features**, move it to `components/common/` or `components/ui/`.

---

### `pages/` — Feature route screens

- One file per major route **when the screen belongs to the feature**.
- **Thin:** pick a `layout`, pass copy/links, render 1–2 components.
- Exported from `features/<name>/index.ts` and mounted in `app/router/index.tsx`.

```tsx
// features/auth/pages/login-page.tsx
export function LoginPage() {
  return (
    <AuthLayout title="…" footer={…}>
      <LoginForm />
    </AuthLayout>
  )
}
```

---

### `index.ts` — Public API of the feature

Export only what other parts of the app should import:

```ts
export { LoginPage, RegisterPage } from './pages/…'
export { loginSchema } from './schemas/…'
export type { LoginFormValues } from './types/…'
```

Avoid deep imports like `@/features/auth/components/login-form` from outside the feature — export from `index.ts` when needed.

---

## Layouts vs feature `pages/`

| Layer | Location | Purpose |
|-------|----------|---------|
| **Layout** | `src/layouts/` | Reusable shell: navbar, footer, auth split panel |
| **Page** | `src/pages/` or `features/*/pages/` | What the router renders |
| **Section / form** | `features/*/components/` | Actual content |

**Layouts** (`src/layouts/`)

- `main-layout.tsx` — Navbar + `<main>` + footer (marketing pages).
- `auth-layout.tsx` — Split hero + form card (login/register).

**Pages** — two patterns in this repo:

1. **Feature owns the page** (auth)  
   `features/auth/pages/login-page.tsx` → router imports from `@/features/auth`.

2. **App page composes features** (home)  
   `pages/home.tsx` stitches `features/home/components/*` inside `MainLayout`.

Both are valid. Prefer **feature `pages/`** when the route is clearly one domain (auth, dashboard, rooms admin).

---

## Global folders (not inside a feature)

### `components/ui/`

Primitive, style-only building blocks: `button`, `input`, `card`, `select`, `modal`.

- No business logic, no API calls.
- Inspired by shadcn-style API.

### `components/common/`

Shared chrome used on multiple routes: `navbar`, `sidebar`, `loading`.

- Still presentational; data comes via props or small hooks from `src/hooks/`.

### `pages/` (app-level)

Route entry when you compose **multiple features** or keep routing centralized:

- `home.tsx` — landing (uses `features/home`).
- `not-found.tsx`, `dashboard.tsx`.

### `app/`

- `providers/` — QueryClient, Router.
- `router/index.tsx` — `<Routes>` list.
- `router/protected-route.tsx` — auth guard.

### `stores/`

Global client state (Zustand): `auth.store`, `theme.store`.

- Token / user session — not a substitute for React Query cache.

### `hooks/` (root)

Hooks used by **many** features: `use-debounce`, `use-modal`, `use-auth`.

- Feature-specific hooks stay in `features/<name>/hooks/`.

---

## Current features in the repo

### `features/auth/` (full example)

```
features/auth/
├── api/auth.api.ts
├── components/
│   ├── auth-field.tsx
│   ├── login-form.tsx
│   ├── password-input.tsx
│   └── register-form.tsx
├── hooks/
│   ├── use-login.ts
│   └── use-register.ts
├── pages/
│   ├── login-page.tsx
│   └── register-page.tsx
├── schemas/auth.schema.ts
├── types/auth.type.ts
└── index.ts
```

**Flow:** `login-page` → `AuthLayout` → `LoginForm` → `useLogin` → `authApi`.

### `features/home/` (sections only)

```
features/home/
├── components/     # HeroSection, FeaturedRoomsSection, …
└── data.ts         # Static/mock content
```

Route lives in `pages/home.tsx` (composer).  
Footer is used inside `MainLayout`; navbar uses `data.ts` nav links.

When home gets API-backed rooms, add:

```
features/home/
├── api/
├── hooks/
└── …
```

### `features/users/`, `features/products/`

Placeholders — extend using the same template when you implement them.

---

## Adding a new feature (checklist)

Example: **rooms**

1. Create folders:

   ```
   features/rooms/
   ├── api/rooms.api.ts
   ├── hooks/use-rooms.ts
   ├── components/room-card.tsx
   ├── pages/rooms-page.tsx
   ├── types/room.type.ts
   └── index.ts
   ```

2. Add route in `config/constants.ts` (`paths.rooms`) and `app/router/index.tsx`.

3. Add types to `src/types/` only if shared with other features.

4. Use `MainLayout` or a new layout in `layouts/` if needed.

5. Document query keys and API in [api-fetching.md](./api-fetching.md).

---

## Import rules

```ts
// ✅ Feature page imports its own components + shared layout
import { RoomList } from '../components/room-list'
import { MainLayout } from '@/layouts/main-layout'

// ✅ Hook imports feature API
import { roomsApi } from '../api/rooms.api'

// ✅ Component imports UI + feature hook
import { Button } from '@/components/ui/button'
import { useRooms } from '../hooks/use-rooms'

// ❌ Component imports axios directly
import { api } from '@/lib/axios'

// ❌ Another feature imports internal component path
import { LoginForm } from '@/features/auth/components/login-form'
// Prefer: import { LoginPage } from '@/features/auth'
```

---

## Naming conventions

| Item | Convention | Example |
|------|------------|---------|
| Feature folder | kebab-case, plural noun | `rooms`, `auth` |
| API file | `<domain>.api.ts` | `rooms.api.ts` |
| Hook file | `use-<action>.ts` | `use-rooms.ts` |
| Page file | `<name>-page.tsx` | `login-page.tsx` |
| Schema file | `<domain>.schema.ts` | `auth.schema.ts` |
| Component file | kebab-case | `room-card.tsx` |

---

## Decision tree

```
New code for UniNest
        │
        ├─ Is it a Button/Input/Modal primitive?
        │     └─ components/ui/
        │
        ├─ Is it Navbar/Footer/Loading for whole app?
        │     └─ components/common/ or layouts/
        │
        ├─ Is it only for one business area (auth, rooms, …)?
        │     ├─ HTTP?          → features/<x>/api/
        │     ├─ Fetch/cache?   → features/<x>/hooks/
        │     ├─ Form rules?    → features/<x>/schemas/
        │     ├─ UI block?      → features/<x>/components/
        │     └─ Full route?    → features/<x>/pages/ + router
        │
        ├─ Is it a route that composes many features?
        │     └─ pages/<name>.tsx
        │
        └─ Token/theme used everywhere?
              └─ stores/ + src/hooks/
```

---

## Related docs

- [api-fetching.md](./api-fetching.md) — Axios, TanStack Query, mutations
- `src/config/constants.ts` — route paths
- `src/app/router/index.tsx` — route table
