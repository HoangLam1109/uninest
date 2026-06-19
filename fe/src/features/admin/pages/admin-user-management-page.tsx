import { useMemo, useState, type FormEvent } from 'react'
import {
  Edit3,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import { USER_ROLES, type UserRole } from '@/constants/roles'
import { Loading } from '@/components/common/loading'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import {
  useCreateUser,
  useDeleteUser,
  useGetUsers,
  useUpdateUser,
} from '@/features/user/hooks/use-users'
import type { User, UserPayload } from '@/features/user/types/user.type'

type RoleFilter = 'ALL' | UserRole
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

type UserFormState = {
  email: string
  fullName: string
  phone: string
  password: string
  role: UserRole
  isActive: boolean
}

const roleOptions = Object.values(USER_ROLES)

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  STAFF: 'Nhan vien',
  LANDLORD: 'Chu nha',
  TENANT: 'Nguoi thue',
  GUEST: 'Khach',
}

const initialForm: UserFormState = {
  email: '',
  fullName: '',
  phone: '',
  password: '',
  role: USER_ROLES.GUEST,
  isActive: true,
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value))
}

function toFormState(user: User): UserFormState {
  return {
    email: user.email ?? '',
    fullName: user.fullName ?? '',
    phone: user.phone ?? '',
    password: '',
    role: user.role ?? USER_ROLES.GUEST,
    isActive: user.isActive ?? true,
  }
}

function buildPayload(form: UserFormState, editingUser: User | null) {
  const payload: Partial<UserPayload> = {
    email: form.email.trim(),
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    role: form.role,
    isActive: form.isActive,
  }

  if (form.password.trim()) {
    payload.password = form.password
  }

  if (!editingUser) {
    payload.password = form.password
  }

  return payload
}

export function AdminUserManagementPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('ALL')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserFormState>(initialForm)

  const usersQuery = useGetUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const users = usersQuery.data ?? []
  const activeCount = users.filter((user) => user.isActive !== false).length
  const inactiveCount = users.length - activeCount

  const filteredUsers = useMemo(() => {
    const keyword = normalize(search)

    return users.filter((user) => {
      const userRole = user.role ?? USER_ROLES.GUEST
      const userActive = user.isActive !== false
      const matchesSearch =
        !keyword ||
        [user.fullName, user.email, user.phone, userRole].some((value) =>
          normalize(value ?? '').includes(keyword),
        )
      const matchesRole = role === 'ALL' || userRole === role
      const matchesStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' ? userActive : !userActive)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [role, search, status, users])

  function openCreateModal() {
    setEditingUser(null)
    setForm(initialForm)
    setModalOpen(true)
  }

  function openEditModal(user: User) {
    setEditingUser(user)
    setForm(toFormState(user))
    setModalOpen(true)
  }

  function closeModal() {
    if (createUser.isPending || updateUser.isPending) return
    setModalOpen(false)
    setEditingUser(null)
    setForm(initialForm)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = buildPayload(form, editingUser)

    if (editingUser) {
      updateUser.mutate(
        { id: editingUser._id, payload },
        { onSuccess: closeModal },
      )
      return
    }

    createUser.mutate(payload as UserPayload, { onSuccess: closeModal })
  }

  function handleDelete(user: User) {
    const ok = window.confirm(`Xoa tai khoan ${user.fullName}?`)
    if (!ok) return
    deleteUser.mutate(user._id)
  }

  return (
    <div className="min-h-svh bg-slate-50 px-4 py-6 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:max-w-[1360px] xl:gap-7 2xl:max-w-[1536px] 2xl:gap-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between xl:gap-8">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl 2xl:text-4xl">
              Quan ly nguoi dung
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base 2xl:max-w-3xl">
              Tao, cap nhat, khoa hoac xoa tai khoan tren he thong UniNest.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => usersQuery.refetch()}
              disabled={usersQuery.isFetching}
            >
              <RefreshCcw
                className={cn('size-4', usersQuery.isFetching && 'animate-spin')}
              />
              Lam moi
            </Button>
            <Button type="button" onClick={openCreateModal}>
              <Plus className="size-4" />
              Tao tai khoan
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3 xl:gap-5 2xl:gap-6">
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Tong tai khoan</p>
            <p className="mt-2 text-2xl font-bold text-slate-950 2xl:text-3xl">
              {users.length}
            </p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Dang hoat dong</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-green-700 2xl:text-3xl">
              <UserCheck className="size-5" />
              {activeCount}
            </p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Da khoa</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-red-600 2xl:text-3xl">
              <UserX className="size-5" />
              {inactiveCount}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-primary/10 bg-white">
          <div className="grid gap-3 border-b border-primary/10 p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px] xl:grid-cols-[minmax(0,1fr)_220px_220px] xl:p-5 2xl:grid-cols-[minmax(0,1fr)_240px_240px] 2xl:p-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 border border-primary/10 py-2 pl-9 pr-3 text-sm shadow-none"
                placeholder="Tim theo ten, email, so dien thoai..."
              />
            </div>
            <select
              className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={role}
              onChange={(event) => setRole(event.target.value as RoleFilter)}
            >
              <option value="ALL">Tat ca vai tro</option>
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {roleLabels[option]}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              <option value="ALL">Tat ca trang thai</option>
              <option value="ACTIVE">Dang hoat dong</option>
              <option value="INACTIVE">Da khoa</option>
            </select>
          </div>

          {usersQuery.isLoading ? (
            <Loading label="Dang tai nguoi dung..." />
          ) : usersQuery.isError ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <p className="font-semibold text-slate-900">
                Khong the tai danh sach nguoi dung
              </p>
              <Button type="button" variant="outline" onClick={() => usersQuery.refetch()}>
                Thu lai
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] table-fixed text-left xl:min-w-0">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="w-[34%] px-4 py-3 font-semibold xl:px-5 2xl:w-[38%] 2xl:px-6">
                      Nguoi dung
                    </th>
                    <th className="w-[16%] px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Dien thoai
                    </th>
                    <th className="w-[14%] px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Vai tro
                    </th>
                    <th className="w-[14%] px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Ngay tao
                    </th>
                    <th className="w-[14%] px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Trang thai
                    </th>
                    <th className="w-[8%] px-4 py-3 text-right font-semibold xl:px-5 2xl:px-6">
                      Thao tac
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {filteredUsers.map((user) => {
                    const userRole = user.role ?? USER_ROLES.GUEST
                    const isActive = user.isActive !== false

                    return (
                      <tr key={user._id} className="align-middle">
                        <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={user.fullName}
                              src={user.avatarUrl}
                              className="bg-slate-200 text-slate-700"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {user.fullName}
                              </p>
                              <p className="truncate text-sm text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 xl:px-5 2xl:px-6 2xl:py-5">
                          {user.phone || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700 xl:px-5 2xl:px-6 2xl:py-5">
                          {roleLabels[userRole]}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 xl:px-5 2xl:px-6 2xl:py-5">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                          <span
                            className={cn(
                              'rounded-lg px-2.5 py-1 text-xs font-bold',
                              isActive
                                ? 'bg-green-500/10 text-green-700'
                                : 'bg-red-500/10 text-red-600',
                            )}
                          >
                            {isActive ? 'Hoat dong' : 'Da khoa'}
                          </span>
                        </td>
                        <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={`Sua ${user.fullName}`}
                              onClick={() => openEditModal(user)}
                            >
                              <Edit3 className="size-4 text-slate-600" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={`Xoa ${user.fullName}`}
                              onClick={() => handleDelete(user)}
                              disabled={deleteUser.isPending}
                            >
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredUsers.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-slate-500">
                  Khong co nguoi dung phu hop.
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingUser ? 'Cap nhat tai khoan' : 'Tao tai khoan'}
        className="max-w-xl"
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Ho ten
              <Input
                required
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                className="h-10 border border-primary/10 px-3 text-sm shadow-none"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              So dien thoai
              <Input
                required
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className="h-10 border border-primary/10 px-3 text-sm shadow-none"
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Email
            <Input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className="h-10 border border-primary/10 px-3 text-sm shadow-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Mat khau
            <Input
              required={!editingUser}
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className="h-10 border border-primary/10 px-3 text-sm shadow-none"
              placeholder={editingUser ? 'De trong neu khong doi' : undefined}
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Vai tro
              <select
                className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as UserRole,
                  }))
                }
              >
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {roleLabels[option]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Trang thai
              <select
                className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.isActive ? 'ACTIVE' : 'INACTIVE'}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.value === 'ACTIVE',
                  }))
                }
              >
                <option value="ACTIVE">Hoat dong</option>
                <option value="INACTIVE">Da khoa</option>
              </select>
            </label>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Huy
            </Button>
            <Button
              type="submit"
              disabled={createUser.isPending || updateUser.isPending}
            >
              {editingUser ? 'Luu thay doi' : 'Tao tai khoan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
