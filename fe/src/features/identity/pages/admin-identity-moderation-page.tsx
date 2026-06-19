import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  Search,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { getApiErrorMessage } from '@/lib/api-error'
import { cn } from '@/lib/utils'
import { identityApi } from '../api/identity.api'
import { IdentityDetail } from '../components/identity-detail'
import type { Identity, IdentityStatus } from '../types/identity.type'

type StatusFilter = 'all' | IdentityStatus

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'PENDING_VERIFICATION', label: 'Chờ xác minh' },
  { value: 'VERIFIED', label: 'Đã xác minh' },
  { value: 'REJECTED', label: 'Đã từ chối' },
]

const statusLabels: Record<IdentityStatus, string> = {
  PENDING_VERIFICATION: 'Chờ xác minh',
  VERIFIED: 'Đã xác minh',
  REJECTED: 'Đã từ chối',
}

const statusStyles: Record<IdentityStatus, string> = {
  PENDING_VERIFICATION: 'bg-amber-500/10 text-amber-700',
  VERIFIED: 'bg-green-500/10 text-green-700',
  REJECTED: 'bg-red-500/10 text-red-600',
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function getIdentityOwner(identity: Identity) {
  const owner = identity.userId
  return typeof owner === 'object' && owner !== null ? owner : null
}

export function AdminIdentityModerationPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('PENDING_VERIFICATION')
  const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(null)

  const identityQuery = useQuery({
    queryKey: ['admin-identities'],
    queryFn: async () => {
      const { data } = await identityApi.adminList()
      return data.data
    },
  })

  const verifyIdentity = useMutation({
    mutationFn: (identityId: string) => identityApi.adminVerify(identityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-identities'] })
      setSelectedIdentityId(null)
      toast.success('Đã xác minh hồ sơ định danh')
    },
    onError: (error) => {
      toast.error('Không thể xác minh hồ sơ', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })

  const rejectIdentity = useMutation({
    mutationFn: (identityId: string) => identityApi.adminReject(identityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-identities'] })
      setSelectedIdentityId(null)
      toast.success('Đã từ chối hồ sơ định danh')
    },
    onError: (error) => {
      toast.error('Không thể từ chối hồ sơ', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })

  const identities = identityQuery.data ?? []
  const pendingCount = identities.filter(
    (identity) => identity.status === 'PENDING_VERIFICATION',
  ).length
  const verifiedCount = identities.filter(
    (identity) => identity.status === 'VERIFIED',
  ).length
  const rejectedCount = identities.filter(
    (identity) => identity.status === 'REJECTED',
  ).length

  const visibleIdentities = useMemo(() => {
    const keyword = normalize(search)

    return identities.filter((identity) => {
      const owner = getIdentityOwner(identity)
      const matchesStatus = status === 'all' || identity.status === status
      const matchesSearch =
        !keyword ||
        [
          identity.fullName,
          identity.cccdNumber,
          identity.phone,
          owner?.email ?? '',
          owner?.fullName ?? '',
        ].some((value) => normalize(value).includes(keyword))

      return matchesStatus && matchesSearch
    })
  }, [identities, search, status])

  const selectedIdentity =
    identities.find((identity) => identity._id === selectedIdentityId) ?? null
  const isMutatingIdentity = verifyIdentity.isPending || rejectIdentity.isPending

  return (
    <div className="min-h-svh bg-slate-50 px-4 py-6 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:max-w-[1360px] xl:gap-7 2xl:max-w-[1536px] 2xl:gap-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between xl:gap-8">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl 2xl:text-4xl">
              Kiểm duyệt hồ sơ định danh
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base 2xl:max-w-3xl">
              Xem ảnh CCCD/CMND, kiểm tra thông tin người thuê và xác minh hồ sơ trước khi cho phép đặt phòng.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3 xl:gap-5 2xl:gap-6">
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Chờ xác minh</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-amber-700 2xl:text-3xl">
              <Clock3 className="size-5" />
              {pendingCount}
            </p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Đã xác minh</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-green-700 2xl:text-3xl">
              <CheckCircle2 className="size-5" />
              {verifiedCount}
            </p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5 2xl:p-6">
            <p className="text-sm text-slate-500">Đã từ chối</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-red-600 2xl:text-3xl">
              <XCircle className="size-5" />
              {rejectedCount}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-primary/10 bg-white">
          <div className="grid gap-3 border-b border-primary/10 p-4 md:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_260px] xl:p-5 2xl:grid-cols-[minmax(0,1fr)_300px] 2xl:p-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 border border-primary/10 py-2 pl-9 pr-3 text-sm shadow-none"
                placeholder="Tìm theo tên, email, CCCD, số điện thoại..."
              />
            </div>
            <select
              className="h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            {identityQuery.isLoading ? (
              <div className="flex min-h-60 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                <Loader2 className="size-4 animate-spin text-primary" />
                Đang tải hồ sơ định danh...
              </div>
            ) : identityQuery.isError ? (
              <div className="p-8 text-center text-sm font-semibold text-red-600">
                Không thể tải danh sách hồ sơ định danh.
              </div>
            ) : visibleIdentities.length > 0 ? (
              <table className="w-full min-w-[880px] table-fixed text-left xl:min-w-0">
                <colgroup>
                  <col className="w-[34%] 2xl:w-[38%]" />
                  <col className="w-[20%]" />
                  <col className="w-[18%]" />
                  <col className="w-[16%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Người thuê</th>
                    <th className="px-4 py-3 font-semibold">CCCD/CMND</th>
                    <th className="px-4 py-3 font-semibold">Liên hệ</th>
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {visibleIdentities.map((identity) => {
                    const owner = getIdentityOwner(identity)
                    const isPending = identity.status === 'PENDING_VERIFICATION'

                    return (
                      <tr key={identity._id}>
                        <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={identity.fullName}
                              className="bg-slate-200 text-slate-700"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {identity.fullName}
                              </p>
                              <p className="truncate text-sm text-slate-500">
                                {owner?.email ?? 'Không có email'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700 xl:px-5 2xl:px-6 2xl:py-5">
                          {identity.cccdNumber}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 xl:px-5 2xl:px-6 2xl:py-5">
                          {identity.phone}
                        </td>
                        <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                          <span
                            className={cn(
                              'rounded-lg px-2.5 py-1 text-xs font-bold',
                              statusStyles[identity.status],
                            )}
                          >
                            {statusLabels[identity.status]}
                          </span>
                        </td>
                        <td className="px-4 py-4 xl:px-5 2xl:px-6 2xl:py-5">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={`Xem hồ sơ ${identity.fullName}`}
                              onClick={() => setSelectedIdentityId(identity._id)}
                            >
                              <Eye className="size-4 text-slate-500" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={`Xác minh ${identity.fullName}`}
                              disabled={!isPending || isMutatingIdentity}
                              onClick={() => verifyIdentity.mutate(identity._id)}
                            >
                              <CheckCircle2 className="size-4 text-green-600" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={`Từ chối ${identity.fullName}`}
                              disabled={!isPending || isMutatingIdentity}
                              onClick={() => rejectIdentity.mutate(identity._id)}
                            >
                              <XCircle className="size-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-sm font-semibold text-slate-500">
                Không có hồ sơ định danh phù hợp bộ lọc.
              </div>
            )}
          </div>
        </section>
      </div>

      <Modal
        open={Boolean(selectedIdentity)}
        onClose={() => setSelectedIdentityId(null)}
        title="Chi tiết hồ sơ định danh"
        className="max-h-[90svh] max-w-2xl overflow-y-auto"
      >
        {selectedIdentity ? (
          <div className="space-y-5">
            <IdentityDetail identity={selectedIdentity} />
            {selectedIdentity.status === 'PENDING_VERIFICATION' ? (
              <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isMutatingIdentity}
                  onClick={() => rejectIdentity.mutate(selectedIdentity._id)}
                >
                  <XCircle className="size-4" />
                  Từ chối
                </Button>
                <Button
                  type="button"
                  disabled={isMutatingIdentity}
                  onClick={() => verifyIdentity.mutate(selectedIdentity._id)}
                >
                  <CheckCircle2 className="size-4" />
                  Xác minh hồ sơ
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
