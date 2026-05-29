# API Fetching Guide (UniNest FE)

This project uses a **3-layer** pattern for HTTP:

```
Component  →  Hook (TanStack Query)  →  Feature API (axios)  →  Backend
```

Do **not** call `axios` directly inside React components.  
Do **not** duplicate API logic in a global `services/` folder and `features/*/api/` at the same time — HTTP lives in **`features/<feature>/api/`** only.

---

## Stack

| Tool | Location | Role |
|------|----------|------|
| **Axios** | `src/lib/axios.ts` | Shared HTTP client, base URL, auth header |
| **TanStack Query** | `src/lib/query-client.ts` + `src/app/providers/query-provider.tsx` | Cache, loading/error state, mutations |
| **Zustand** | `src/stores/` | Client state (token, user) — not server cache |
| **Zod** | `src/features/*/schemas/` | Form validation before submit |

---

## Environment

Create `fe/.env` (optional):

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=UniNest
```

Read in code via `src/config/env.ts`:

```ts
import { env } from '@/config/env'
// env.apiBaseUrl
```

Restart `npm run dev` after changing `.env`.

---

## Layer 1 — Axios client

**File:** `src/lib/axios.ts`

- Sets `baseURL` from `VITE_API_BASE_URL`
- Attaches `Authorization: Bearer <token>` from `useAuthStore` on every request

```ts
import { api } from '@/lib/axios'

// Only used inside feature api/*.ts files — not in components
const response = await api.get('/rooms')
```

---

## Layer 2 — Feature API (HTTP functions)

**Folder:** `src/features/<feature>/api/`

Each feature owns its endpoints. Example (auth):

**File:** `src/features/auth/api/auth.api.ts`

```ts
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { AuthResponse, LoginPayload } from '@/types/auth'

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', payload),
}
```

### Response shape

Shared wrapper type in `src/types/api.ts`:

```ts
export type ApiResponse<T> = {
  data: T
  message?: string
}
```

Axios returns `{ data: ApiResponse<T> }`, so in hooks you usually use:

```ts
const { data } = await authApi.login(payload)
return data.data // inner payload
```

### Adding a new feature API

Example: list rooms.

1. **Types** — `src/types/room.ts` (or `src/features/rooms/types/room.type.ts`)

```ts
export type Room = {
  id: string
  title: string
  price: string
}
```

2. **API** — `src/features/rooms/api/rooms.api.ts`

```ts
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { Room } from '../types/room.type'

export const roomsApi = {
  list: () => api.get<ApiResponse<Room[]>>('/rooms'),
  getById: (id: string) => api.get<ApiResponse<Room>>(`/rooms/${id}`),
}
```

---

## Layer 3 — Hooks (TanStack Query)

**Folder:** `src/features/<feature>/hooks/`

Hooks connect UI to `*Api` and handle cache / side effects.

### GET — `useQuery`

**File:** `src/features/rooms/hooks/use-rooms.ts`

```ts
import { useQuery } from '@tanstack/react-query'
import { roomsApi } from '../api/rooms.api'

export const roomsKeys = {
  all: ['rooms'] as const,
  detail: (id: string) => ['rooms', id] as const,
}

export function useRooms() {
  return useQuery({
    queryKey: roomsKeys.all,
    queryFn: async () => {
      const { data } = await roomsApi.list()
      return data.data
    },
  })
}
```

**Usage in a component:**

```tsx
function RoomList() {
  const { data: rooms, isLoading, isError, error } = useRooms()

  if (isLoading) return <Loading />
  if (isError) return <p>{error.message}</p>

  return (
    <ul>
      {rooms?.map((room) => (
        <li key={room.id}>{room.title}</li>
      ))}
    </ul>
  )
}
```

### POST / PUT / DELETE — `useMutation`

Reference: `src/features/auth/hooks/use-login.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { roomsApi } from '../api/rooms.api'
import { roomsKeys } from './use-rooms'

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateRoomPayload) => {
      const { data } = await roomsApi.create(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.all })
    },
  })
}
```

**Usage in a component:**

```tsx
function CreateRoomForm() {
  const createRoom = useCreateRoom()

  const onSubmit = (values: FormValues) => {
    createRoom.mutate(values, {
      onError: () => {
        // show toast / inline error
      },
    })
  }

  return (
    <button
      type="submit"
      disabled={createRoom.isPending}
      onClick={handleSubmit(onSubmit)}
    >
      {createRoom.isPending ? 'Saving...' : 'Save'}
    </button>
  )
}
```

---

## Layer 4 — Components

Components should:

1. Use **React Hook Form + Zod** for forms (`src/features/*/schemas/`)
2. Call **hooks** only (`useLogin`, `useRooms`, …)
3. Never import `api` from `@/lib/axios` directly

```tsx
// ✅ Good
const login = useLogin()
login.mutate(formValues)

// ❌ Bad
await api.post('/auth/login', formValues)
```

---

## Query keys convention

Keep keys next to the hook that uses them:

```ts
export const authKeys = {
  me: ['auth', 'me'] as const,
}

export const roomsKeys = {
  all: ['rooms'] as const,
  detail: (id: string) => ['rooms', id] as const,
}
```

Invalidate after mutations when lists must refresh:

```ts
queryClient.invalidateQueries({ queryKey: roomsKeys.all })
```

---

## Auth token flow

1. User submits login form → `useLogin` → `authApi.login`
2. On success → `useAuthStore.getState().setAuth(user, token)`
3. Next requests → axios interceptor adds `Authorization` header automatically
4. Logout → `authApi.logout()` + `useAuthStore.getState().clearAuth()`

Protected routes: `src/app/router/protected-route.tsx`

---

## Error handling

### In hooks (recommended)

```ts
return useMutation({
  mutationFn: async (payload) => { /* ... */ },
  onError: (error) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message ?? 'Something went wrong'
      console.error(message)
    }
  },
})
```

### In components

```tsx
const { mutate, isError, error } = useLogin()

// isError + mutation error from TanStack Query
// Or use mutate(..., { onError: (e) => ... })
```

You can add a global axios **response** interceptor in `src/lib/axios.ts` later (e.g. redirect 401 → login).

---

## File checklist for a new endpoint

| Step | File |
|------|------|
| 1 | `src/types/<domain>.ts` or `features/<f>/types/*.type.ts` |
| 2 | `src/features/<f>/api/<f>.api.ts` |
| 3 | `src/features/<f>/hooks/use-*.ts` |
| 4 | `src/features/<f>/components/*.tsx` |
| 5 | Wire route in `src/app/router/index.tsx` if needed |

---

## Quick reference (current project)

```
src/
├── lib/
│   ├── axios.ts              # api instance
│   └── query-client.ts       # QueryClient singleton
├── types/
│   ├── api.ts                # ApiResponse<T>
│   └── auth.ts               # LoginPayload, AuthResponse, …
├── features/
│   └── auth/
│       ├── api/auth.api.ts   # HTTP
│       ├── hooks/
│       │   ├── use-login.ts  # useMutation
│       │   └── use-register.ts
│       └── components/
│           ├── login-form.tsx
│           └── register-form.tsx
└── app/providers/query-provider.tsx
```

---

## Related commands

```bash
cd fe
npm run dev      # start app
npm run build    # typecheck + production build
```

When the backend is ready, point `VITE_API_BASE_URL` to your API and implement matching routes in `features/*/api/*.api.ts`.
