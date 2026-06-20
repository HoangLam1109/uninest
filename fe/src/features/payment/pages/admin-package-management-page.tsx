import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Edit3,
  Loader2,
  PackagePlus,
  Plus,
  Search,
  ShieldOff,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-error'
import { servicePackageApi } from '../api/service-package.api'
import type {
  CreateServicePackagePayload,
  ServicePackage,
  UpdateServicePackagePayload,
} from '../types/service-package.type'

function formatCurrency(value: number, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

const emptyForm: CreateServicePackagePayload = {
  name: '',
  price: 0,
  durationDays: 30,
  description: '',
  features: {},
  maxRooms: undefined,
}

type FeatureEntry = { id: number; key: string; value: string }
let nextFeatureId = 1

function featuresToEntries(features: Record<string, string>): FeatureEntry[] {
  return Object.entries(features).map(([key, value]) => ({
    id: nextFeatureId++,
    key,
    value,
  }))
}

function entriesToFeatures(entries: FeatureEntry[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const entry of entries) {
    const trimmedKey = entry.key.trim()
    if (trimmedKey && entry.value.trim()) {
      result[trimmedKey] = entry.value.trim()
    }
  }
  return result
}

export function AdminPackageManagementPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null)
  const [deletingPackage, setDeletingPackage] = useState<ServicePackage | null>(null)
  const [form, setForm] = useState<CreateServicePackagePayload>(emptyForm)
  const [featureEntries, setFeatureEntries] = useState<FeatureEntry[]>([])

  const packagesQuery = useQuery({
    queryKey: ['admin-service-packages'],
    queryFn: async () => {
      const { data } = await servicePackageApi.list({ limit: 100 })
      return data
    },
  })

  const packages = packagesQuery.data?.data ?? []

  const filteredPackages = packages.filter((pkg) => {
    const keyword = normalize(search)
    if (!keyword) return true
    return (
      normalize(pkg.name).includes(keyword) ||
      normalize(pkg.description ?? '').includes(keyword) ||
      normalize(String(pkg.price)).includes(keyword) ||
      normalize(String(pkg.durationDays)).includes(keyword)
    )
  })

  const activeCount = packages.filter((p) => p.isActive).length
  const inactiveCount = packages.filter((p) => !p.isActive).length

  function openCreate() {
    setEditingPackage(null)
    setForm(emptyForm)
    setFeatureEntries([])
    setFormOpen(true)
  }

  function openEdit(pkg: ServicePackage) {
    setEditingPackage(pkg)
    setForm({
      name: pkg.name,
      price: pkg.price,
      durationDays: pkg.durationDays,
      description: pkg.description ?? '',
      features: pkg.features ?? {},
      maxRooms: pkg.maxRooms,
    })
    setFeatureEntries(featuresToEntries(pkg.features ?? {}))
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingPackage(null)
  }

  function updateField<K extends keyof CreateServicePackagePayload>(
    key: K,
    value: CreateServicePackagePayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const createMutation = useMutation({
    mutationFn: async (payload: CreateServicePackagePayload) => {
      const { data } = await servicePackageApi.create(payload)
      return data.data
    },
    onSuccess: () => {
      toast.success('Đã tạo gói dịch vụ mới')
      queryClient.invalidateQueries({ queryKey: ['admin-service-packages'] })
      closeForm()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể tạo gói dịch vụ'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateServicePackagePayload
    }) => {
      const { data } = await servicePackageApi.update(id, payload)
      return data.data
    },
    onSuccess: () => {
      toast.success('Đã cập nhật gói dịch vụ')
      queryClient.invalidateQueries({ queryKey: ['admin-service-packages'] })
      closeForm()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật gói'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await servicePackageApi.delete(id)
    },
    onSuccess: () => {
      toast.success('Đã xóa gói dịch vụ')
      queryClient.invalidateQueries({ queryKey: ['admin-service-packages'] })
      setDeletingPackage(null)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể xóa gói'))
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await servicePackageApi.update(id, { isActive })
      return data.data
    },
    onSuccess: (result) => {
      toast.success(
        result.isActive ? 'Đã kích hoạt gói dịch vụ' : 'Đã vô hiệu hóa gói dịch vụ',
      )
      queryClient.invalidateQueries({ queryKey: ['admin-service-packages'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể thay đổi trạng thái'))
    },
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!form.name.trim() || form.price <= 0 || form.durationDays <= 0) {
      toast.error('Vui lòng điền đầy đủ tên, giá và thời hạn')
      return
    }

    const payload = { ...form, features: entriesToFeatures(featureEntries) }
    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage._id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="min-h-svh bg-slate-50 px-4 py-6 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:max-w-[1360px] xl:gap-7 2xl:max-w-[1536px] 2xl:gap-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between xl:gap-8">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl 2xl:text-4xl">
              Quản lý gói dịch vụ
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base 2xl:max-w-3xl">
              Tạo và quản lý các gói dịch vụ dành cho Tenant và Landlord trên hệ thống
              UniNest.
            </p>
          </div>
          <Button type="button" size="lg" onClick={openCreate}>
            <PackagePlus className="size-5" />
            Tạo gói mới
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-3 xl:gap-5 2xl:gap-6">
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Tổng số gói</p>
            <p className="mt-2 text-2xl font-bold text-slate-950 2xl:text-3xl">
              {packages.length}
            </p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Đang kích hoạt</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-green-700 2xl:text-3xl">
              <ShieldCheck className="size-5" />
              {activeCount}
            </p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Đã vô hiệu</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-400 2xl:text-3xl">
              <ShieldOff className="size-5" />
              {inactiveCount}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-primary/10 bg-white">
          <div className="border-b border-primary/10 p-4 xl:p-5 2xl:p-6">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 border border-primary/10 py-2 pl-9 pr-3 text-sm shadow-none"
                placeholder="Tìm theo tên gói, mô tả..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {packagesQuery.isLoading ? (
              <div className="flex min-h-60 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                <Loader2 className="size-4 animate-spin text-primary" />
                Đang tải gói dịch vụ...
              </div>
            ) : packagesQuery.isError ? (
              <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                <p className="font-semibold text-red-600">
                  Không thể tải danh sách gói dịch vụ.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => packagesQuery.refetch()}
                >
                  Thử lại
                </Button>
              </div>
            ) : filteredPackages.length > 0 ? (
              <table className="w-full min-w-[800px] table-fixed text-left xl:min-w-0">
                <colgroup>
                  <col className="w-[25%]" />
                  <col className="w-[20%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[16%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Tên gói
                    </th>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Mô tả
                    </th>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Giá
                    </th>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Thời hạn
                    </th>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 font-semibold xl:px-5 2xl:px-6">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg._id} className="align-middle">
                      <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                        <p className="truncate font-semibold text-slate-900">
                          {pkg.name}
                        </p>
                      </td>
                      <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                        <p className="line-clamp-2 text-sm text-slate-500">
                          {pkg.description || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-900 xl:px-5 2xl:px-6 2xl:py-5">
                        {formatCurrency(pkg.price)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 xl:px-5 2xl:px-6 2xl:py-5">
                        {pkg.durationDays} ngày
                      </td>
                      <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                        <button
                          type="button"
                          className={cn(
                            'inline-flex rounded-lg px-2.5 py-1 text-xs font-bold transition-opacity hover:opacity-80',
                            pkg.isActive
                              ? 'bg-green-500/10 text-green-700'
                              : 'bg-slate-500/10 text-slate-500',
                          )}
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: pkg._id,
                              isActive: !pkg.isActive,
                            })
                          }
                          disabled={toggleActiveMutation.isPending}
                        >
                          {pkg.isActive ? 'Đang kích hoạt' : 'Đã vô hiệu'}
                        </button>
                      </td>
                      <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEdit(pkg)}
                          >
                            <Edit3 className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-red-500 hover:text-red-600"
                            onClick={() => setDeletingPackage(pkg)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
                {search
                  ? 'Không có gói dịch vụ phù hợp bộ lọc.'
                  : 'Chưa có gói dịch vụ nào. Hãy tạo gói đầu tiên!'}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        className="max-h-[calc(100svh-2rem)] max-w-lg overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              {editingPackage ? 'Chỉnh sửa gói' : 'Tạo gói mới'}
            </p>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              {editingPackage
                ? `Đang sửa: ${editingPackage.name}`
                : 'Điền thông tin gói dịch vụ'}
            </h2>
          </div>
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Đóng"
            onClick={closeForm}
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Tên gói <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="h-10 border border-primary/10 text-sm shadow-none"
              placeholder="Ví dụ: Gói Tenant, Gói Landlord..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Giá (VND) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => updateField('price', Number(e.target.value))}
                className="h-10 border border-primary/10 text-sm shadow-none"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Thời hạn (ngày) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={form.durationDays}
                onChange={(e) => updateField('durationDays', Number(e.target.value))}
                className="h-10 border border-primary/10 text-sm shadow-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Số phòng tối đa
            </label>
            <Input
              type="number"
              min={0}
              value={form.maxRooms ?? ''}
              onChange={(e) => {
                const val = e.target.value
                updateField(
                  'maxRooms',
                  val === '' ? undefined : Number(val),
                )
              }}
              className="h-10 border border-primary/10 text-sm shadow-none"
              placeholder="Không giới hạn"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Mô tả
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="h-24 w-full resize-none rounded-lg border border-primary/10 px-3 py-2 text-sm shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Mô tả ngắn về gói dịch vụ..."
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Tính năng
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto gap-1 px-2 py-1 text-xs text-primary hover:text-primary/80"
                onClick={() =>
                  setFeatureEntries((prev) => [
                    ...prev,
                    { id: nextFeatureId++, key: '', value: '' },
                  ])
                }
              >
                <Plus className="size-3.5" />
                Thêm tính năng
              </Button>
            </div>

            {featureEntries.length === 0 ? (
              <p className="text-xs text-slate-400">
                Chưa có tính năng nào. Nhấn "Thêm tính năng" để thêm.
              </p>
            ) : (
              <div className="space-y-2">
                {featureEntries.map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-2">
                    <Input
                      value={entry.key}
                      onChange={(e) => {
                        const next = [...featureEntries]
                        next[index] = { ...next[index], key: e.target.value }
                        setFeatureEntries(next)
                      }}
                      className="h-9 flex-1 border border-primary/10 text-sm shadow-none"
                      placeholder="Tên tính năng"
                    />
                    <Input
                      value={entry.value}
                      onChange={(e) => {
                        const next = [...featureEntries]
                        next[index] = { ...next[index], value: e.target.value }
                        setFeatureEntries(next)
                      }}
                      className="h-9 flex-1 border border-primary/10 text-sm shadow-none"
                      placeholder="Mô tả"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-red-400 hover:text-red-600"
                      onClick={() =>
                        setFeatureEntries((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={closeForm}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : editingPackage ? (
                'Cập nhật gói'
              ) : (
                'Tạo gói'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deletingPackage !== null}
        onClose={() => setDeletingPackage(null)}
        className="max-w-md"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-500">
              Xác nhận xóa
            </p>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              Xóa gói dịch vụ?
            </h2>
          </div>
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Đóng"
            onClick={() => setDeletingPackage(null)}
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Bạn có chắc muốn xóa gói{' '}
          <span className="font-bold text-slate-900">
            {deletingPackage?.name}
          </span>
          ? Hành động này sẽ vô hiệu hóa gói và không thể hoàn tác.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeletingPackage(null)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (deletingPackage) deleteMutation.mutate(deletingPackage._id)
            }}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              'Xóa gói'
            )}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
