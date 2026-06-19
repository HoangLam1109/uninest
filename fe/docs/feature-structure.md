# Feature Structure Guide (UniNest FE)

Tài liệu này mô tả chuẩn tổ chức code trong `fe/src` khi xây dựng feature mới cho UniNest.

Stack chuẩn của project:

- **Zustand**: quản lý client-side state.
- **Zod**: định nghĩa schema validation.
- **React Hook Form**: quản lý form state và submit.
- **TanStack Query**: quản lý server state, cache, loading/error, mutation.
- **Axios**: HTTP client dùng trong feature API layer.

Đọc thêm [api-fetching.md](./api-fetching.md) cho quy ước gọi API.

---

## Tổng Quan

```txt
src/
├── app/                 # App shell: providers, router, guards
├── assets/              # Static imports: images, icons
├── components/
│   ├── ui/              # UI primitives: Button, Input, Card, Modal
│   └── common/          # Shared app components: Loading, Sidebar, etc.
├── config/              # env, paths, app constants
├── constants/           # app-wide constants: roles, static enums
├── features/            # Business domains: auth, room, landlord
├── hooks/               # Cross-feature hooks
├── layouts/             # Shared page shells
├── lib/                 # axios, query-client, zod, utils
├── pages/               # Thin route entry components
├── stores/              # Global Zustand stores
├── styles/              # global CSS, Tailwind entry
└── types/               # Shared TypeScript DTOs/types
```

Quy tắc nhanh:

| Câu hỏi | Đặt ở đâu |
| --- | --- |
| Chỉ dùng trong một nghiệp vụ? | `features/<feature>/` |
| UI primitive dùng toàn app? | `components/ui/` |
| Layout/chrome dùng nhiều page? | `layouts/` hoặc `components/common/` |
| Route entry mỏng? | `pages/` hoặc `features/<feature>/pages/` |
| API của một domain? | `features/<feature>/api/` |
| Server state/cache? | `features/<feature>/hooks/` với TanStack Query |
| Client UI state của một feature? | `features/<feature>/stores/` với Zustand |
| Client state toàn app? | `src/stores/` với Zustand |
| Form validation? | `features/<feature>/schemas/` với Zod |

---

## Chuẩn Cấu Trúc Một Feature

Feature đầy đủ nên có cấu trúc:

```txt
features/<feature-name>/
├── api/
│   └── <feature>.api.ts          # Axios calls only
├── components/
│   ├── <entity>-form.tsx         # Feature UI, form, table, card
│   └── ...
├── hooks/
│   ├── use-<entity>.ts           # useQuery / useMutation
│   └── <feature>.keys.ts         # optional query key factory
├── pages/
│   └── <page>-page.tsx           # Route-level screen
├── schemas/
│   └── <feature>.schema.ts       # Zod schemas
├── stores/
│   └── <feature>-ui.store.ts     # Zustand client/UI state
├── types/
│   └── <feature>.type.ts         # z.infer, DTOs, UI types
├── data.ts                       # static/mock data for UI only
└── index.ts                      # public exports
```

Không phải feature nào cũng cần đủ folder ngay từ đầu. Chỉ tạo folder khi có code thật.

---

## Luồng Chuẩn

### List/detail data

```txt
Component
  → feature hook: useRooms()
  → feature API: roomApi.getRooms()
  → axios client
  → backend
```

### Form mutation

```txt
Form component
  → React Hook Form
  → zodResolver(schema)
  → useMutation hook
  → feature API
  → invalidate TanStack Query cache
  → update Zustand UI state nếu cần
```

### Client UI state

```txt
Component
  → useFeatureUiStore()
  → Zustand store
```

Ví dụ: search/filter/sort/page/modal open/editing id nằm trong Zustand vì đây là client-side UI state, không phải dữ liệu backend.

---

## `api/`: HTTP Layer

Chỉ chứa function gọi `api` từ `@/lib/axios`.

Không được đặt React hook, JSX, Zustand logic hoặc toast trong folder này.

```ts
// features/room/api/room.api.ts
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { Room, RoomPayload } from '../types/room.type'

export const roomApi = {
  getRooms: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<Room[]>>('/rooms', { params }),

  createRoom: (payload: RoomPayload) =>
    api.post<ApiResponse<Room>>('/rooms', payload),
}
```

Component không import trực tiếp `@/lib/axios`.

---

## `hooks/`: TanStack Query

Feature hooks là nơi bọc API bằng `useQuery` và `useMutation`.

Hook được phép xử lý:

- query key
- loading/error state từ TanStack Query
- invalidate/refetch cache
- toast
- navigate
- cập nhật Zustand global store khi cần

```ts
// features/room/hooks/use-rooms.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roomApi } from '../api/room.api'
import type { RoomPayload } from '../types/room.type'

export const roomKeys = {
  all: ['rooms'] as const,
  list: (params?: Record<string, unknown>) => [...roomKeys.all, 'list', params] as const,
  detail: (id: string) => [...roomKeys.all, 'detail', id] as const,
}

export function useGetRooms(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: async () => {
      const { data } = await roomApi.getRooms(params)
      return data.data
    },
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RoomPayload) => {
      const { data } = await roomApi.createRoom(payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}
```

Query key nên đặt cạnh hook, hoặc tách sang `<feature>.keys.ts` nếu feature lớn.

---

## `schemas/`: Zod Validation

Zod schema là nguồn sự thật cho form validation.

```ts
// features/auth/schemas/auth.schema.ts
import { z } from '@/lib/zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { error: 'Vui lòng nhập email' })
    .pipe(z.email({ error: 'Email không hợp lệ' })),
  password: z.string().min(1, { error: 'Vui lòng nhập mật khẩu' }),
})
```

Quy ước:

- Schema đặt trong `features/<feature>/schemas/`.
- Không viết validate thủ công trong component nếu Zod xử lý được.
- Nếu payload API khác form values, transform trong hook hoặc submit handler.

---

## `types/`: TypeScript Types

Form type nên infer từ Zod schema.

```ts
// features/auth/types/auth.type.ts
import type { z } from '@/lib/zod'
import type { loginSchema, registerSchema } from '../schemas/auth.schema'

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
```

Quy tắc:

- Type chỉ dùng trong feature: `features/<feature>/types/`.
- Type dùng nhiều feature: `src/types/`.
- API DTO shared như `ApiResponse<T>`, `AuthUser` nên nằm trong `src/types/`.

---

## `components/`: Feature UI

Component trong feature chỉ nên chứa UI và gọi hook/store cần thiết.

Được phép:

- dùng `useForm`
- dùng `useQuery`/`useMutation` thông qua feature hook
- dùng Zustand feature store
- dùng component từ `components/ui`

Không nên:

- gọi axios trực tiếp
- định nghĩa route
- chứa business constants lớn nếu có thể đưa sang `data.ts`
- lặp validation thay vì dùng schema

Ví dụ form chuẩn:

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginSchema } from '../schemas/auth.schema'
import type { LoginFormValues } from '../types/auth.type'
import { useLogin } from '../hooks/use-login'

export function LoginForm() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => login.mutate(values))} noValidate>
      <Input
        type="email"
        aria-invalid={!!errors.email}
        {...register('email')}
      />
      <Button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Đang xử lý...' : 'Đăng nhập'}
      </Button>
    </form>
  )
}
```

---

## `stores/`: Zustand Client State

Dùng Zustand cho state nằm ở client và không phải cache backend.

Nên dùng Zustand cho:

- auth token/user persisted
- theme
- sidebar/mobile menu state
- modal open/close
- selected id đang edit
- filter/search/sort/page của table
- wizard step, tab đang chọn

Không dùng Zustand cho:

- list data từ backend
- detail data từ backend
- loading/error của API
- dữ liệu cần refetch/invalidate

Những phần đó thuộc TanStack Query.

### Feature store

Feature-specific UI state đặt trong:

```txt
features/<feature>/stores/<feature>-ui.store.ts
```

Ví dụ:

```ts
// features/room/stores/room-ui.store.ts
import { create } from 'zustand'
import type { RoomStatus } from '../types/room.type'

export type RoomSortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc'

type RoomUiState = {
  search: string
  status: RoomStatus | ''
  sort: RoomSortOption
  page: number
  modalOpen: boolean
  editingRoomId: string | null
  setSearch: (search: string) => void
  setStatus: (status: RoomStatus | '') => void
  setSort: (sort: RoomSortOption) => void
  setPage: (page: number) => void
  openCreateModal: () => void
  openEditModal: (roomId: string) => void
  closeModal: () => void
}

export const useRoomUiStore = create<RoomUiState>((set) => ({
  search: '',
  status: '',
  sort: 'newest',
  page: 1,
  modalOpen: false,
  editingRoomId: null,
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setSort: (sort) => set({ sort }),
  setPage: (page) => set({ page }),
  openCreateModal: () => set({ modalOpen: true, editingRoomId: null }),
  openEditModal: (roomId) => set({ modalOpen: true, editingRoomId: roomId }),
  closeModal: () => set({ modalOpen: false, editingRoomId: null }),
}))
```

### Global store

Global client state đặt trong:

```txt
src/stores/<domain>.store.ts
```

Ví dụ hiện có:

- `src/stores/auth.store.ts`
- `src/stores/theme.store.ts`

Chỉ dùng global store khi state thật sự dùng xuyên nhiều feature.

---

## `data.ts`: Static Data

Dùng `data.ts` cho dữ liệu tĩnh hoặc mock UI:

- nav items
- dashboard cards mock
- table demo khi chưa có API
- label/status mapping
- chart labels

Không đặt state thay đổi theo người dùng vào `data.ts`.

```ts
// features/landlord/data.ts
export const landlordNavItems = [
  { label: 'Tổng quan', href: '/chu-nha' },
  { label: 'Quản lý phòng', href: '/chu-nha/phong' },
] as const
```

Khi dữ liệu chuyển sang backend, tạo `api/`, `hooks/`, `types/` và bỏ mock nếu không còn dùng.

---

## `pages/`: Route-Level Screens

Page chỉ nên compose layout + feature components.

```tsx
// features/room/pages/room-management-page.tsx
import { RoomManagement } from '../components/room-management'

export function RoomManagementPage() {
  return <RoomManagement />
}
```

Route được mount ở `src/app/router/index.tsx`.

Nếu page thuộc một feature rõ ràng, ưu tiên đặt trong `features/<feature>/pages/`.

Nếu page compose nhiều feature, có thể đặt trong `src/pages/`.

---

## `index.ts`: Public API Của Feature

Export những gì module khác được phép dùng.

```ts
export { LoginPage } from './pages/login-page'
export { RegisterPage } from './pages/register-page'
export type { LoginFormValues } from './types/auth.type'
```

Module ngoài feature nên import qua public API khi hợp lý:

```ts
// Tốt
import { LoginPage } from '@/features/auth'

// Tránh nếu import từ ngoài feature
import { LoginForm } from '@/features/auth/components/login-form'
```

Trong nội bộ feature, dùng relative import.

---

## Layouts Và Pages

| Layer | Location | Trách nhiệm |
| --- | --- | --- |
| Layout | `src/layouts/` | Shell dùng lại: navbar, sidebar, footer |
| Page | `src/pages/` hoặc `features/*/pages/` | Route-level component |
| Section/form/table | `features/*/components/` | Nội dung nghiệp vụ |

Ví dụ:

- `src/layouts/main-layout.tsx`: marketing shell.
- `src/layouts/auth-layout.tsx`: auth split layout.
- `src/layouts/landlord-layout.tsx`: dashboard shell có sidebar.
- `features/auth/pages/login-page.tsx`: route login.
- `features/room/pages/room-management-page.tsx`: route quản lý phòng.

---

## Current Features

### `features/auth`

```txt
features/auth/
├── api/auth.api.ts
├── components/
│   ├── auth-field.tsx
│   ├── login-form.tsx
│   ├── password-input.tsx
│   └── register-form.tsx
├── hooks/
│   ├── use-auth-session.ts
│   ├── use-login.ts
│   ├── use-logout.ts
│   └── use-register.ts
├── lib/navigate-by-role.ts
├── pages/
│   ├── login-page.tsx
│   └── register-page.tsx
├── schemas/auth.schema.ts
├── types/auth.type.ts
└── index.ts
```

Flow:

```txt
LoginPage
  → AuthLayout
  → LoginForm
  → React Hook Form + loginSchema
  → useLogin
  → authApi.login
  → useAuthStore.setAuth
  → navigate by role
```

### `features/room`

```txt
features/room/
├── api/room.api.ts
├── components/
│   ├── room-form-modal.tsx
│   └── room-management.tsx
├── hooks/use-rooms.ts
├── pages/room-management-page.tsx
├── schemas/room.schema.ts
├── stores/room-ui.store.ts
├── types/room.type.ts
└── index.ts
```

Chuẩn đang dùng:

- TanStack Query trong `hooks/use-rooms.ts`.
- Zod schema trong `schemas/room.schema.ts`.
- React Hook Form trong `components/room-form-modal.tsx`.
- Zustand UI state trong `stores/room-ui.store.ts`.

### `features/landlord`

```txt
features/landlord/
├── components/
│   ├── landlord-charts.tsx
│   ├── landlord-dashboard.tsx
│   ├── landlord-sidebar.tsx
│   └── ...
├── data.ts
└── index.ts
```

Hiện chủ yếu là dashboard UI + static data. Khi có API riêng cho chủ nhà, thêm:

```txt
features/landlord/
├── api/
├── hooks/
├── stores/
├── schemas/
└── types/
```

### `features/home`

```txt
features/home/
├── components/
└── data.ts
```

Home hiện là static/marketing sections. Route compose tại `src/pages/home.tsx`.

---

## Checklist Thêm Feature Mới

Ví dụ thêm feature `booking`.

1. Tạo cấu trúc:

```txt
features/booking/
├── api/booking.api.ts
├── components/booking-form.tsx
├── hooks/use-bookings.ts
├── pages/booking-page.tsx
├── schemas/booking.schema.ts
├── stores/booking-ui.store.ts
├── types/booking.type.ts
└── index.ts
```

2. Định nghĩa Zod schema trong `schemas/`.

3. Infer form values trong `types/`.

4. Tạo API functions trong `api/`.

5. Tạo TanStack Query hooks trong `hooks/`.

6. Tạo Zustand store nếu có UI state riêng.

7. Build form bằng React Hook Form + `zodResolver`.

8. Export page/component cần dùng qua `index.ts`.

9. Thêm path ở `src/config/constants.ts`.

10. Mount route ở `src/app/router/index.tsx`.

---

## Import Rules

```ts
// Tốt: component dùng UI primitive + feature hook
import { Button } from '@/components/ui/button'
import { useGetRooms } from '../hooks/use-rooms'

// Tốt: hook dùng feature API
import { roomApi } from '../api/room.api'

// Tốt: form dùng schema + type của feature
import { roomSchema } from '../schemas/room.schema'
import type { RoomFormValues } from '../types/room.type'

// Tốt: route dùng public export
import { RoomManagementPage } from '@/features/room'

// Tránh: component gọi axios trực tiếp
import { api } from '@/lib/axios'

// Tránh: feature này import sâu component nội bộ của feature khác
import { LoginForm } from '@/features/auth/components/login-form'
```

---

## Naming Conventions

| Item | Convention | Example |
| --- | --- | --- |
| Feature folder | kebab-case hoặc noun rõ nghĩa | `room`, `auth`, `landlord` |
| API file | `<domain>.api.ts` | `room.api.ts` |
| Hook file | `use-<domain>.ts` hoặc `use-<action>.ts` | `use-rooms.ts`, `use-login.ts` |
| Page file | `<name>-page.tsx` | `room-management-page.tsx` |
| Schema file | `<domain>.schema.ts` | `room.schema.ts` |
| Store file | `<domain>-ui.store.ts` | `room-ui.store.ts` |
| Type file | `<domain>.type.ts` | `room.type.ts` |
| Component file | kebab-case | `room-form-modal.tsx` |

---

## Decision Tree

```txt
New code
  ├─ UI primitive?
  │  └─ components/ui/
  ├─ Shared app chrome/layout?
  │  └─ components/common/ hoặc layouts/
  ├─ One business domain?
  │  ├─ HTTP calls?         → features/<x>/api/
  │  ├─ Server state?       → features/<x>/hooks/ (TanStack Query)
  │  ├─ Client UI state?    → features/<x>/stores/ (Zustand)
  │  ├─ Form validation?    → features/<x>/schemas/ (Zod)
  │  ├─ Form state?         → components/ dùng React Hook Form
  │  ├─ Domain UI?          → features/<x>/components/
  │  └─ Route screen?       → features/<x>/pages/
  ├─ Route composes many domains?
  │  └─ src/pages/
  └─ State used across whole app?
     └─ src/stores/
```

---

## Anti-Patterns

- Không gọi `api.get/post` trong component.
- Không dùng Zustand để cache list/detail từ backend.
- Không duplicate cùng dữ liệu giữa Zustand và TanStack Query.
- Không validate form bằng nhiều nơi khác nhau; dùng Zod schema.
- Không để form payload type viết tay nếu có thể `z.infer`.
- Không import sâu nội bộ feature khác nếu feature đã export qua `index.ts`.
- Không đưa dữ liệu động theo user vào `data.ts`.

---

## Related Docs

- [api-fetching.md](./api-fetching.md): Axios, TanStack Query, mutation, auth token flow.
- `src/config/constants.ts`: route paths.
- `src/app/router/index.tsx`: route table.
- `src/lib/query-client.ts`: QueryClient config.
- `src/lib/zod.ts`: Zod re-export.
