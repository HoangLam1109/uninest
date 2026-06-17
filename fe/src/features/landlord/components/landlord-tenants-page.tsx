import { useState } from 'react'
import { CalendarDays, CreditCard, Eye, Mail, MapPin, Phone, Star, X } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useGetLandlordTenants } from '@/features/room/hooks/use-rooms'
import { LandlordDashboardHeader } from '../components/landlord-dashboard-header'

const tenantDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatDate(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return tenantDateFormatter.format(d)
}

function ImageLightbox({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="overflow-hidden rounded-lg border border-border transition hover:ring-2 hover:ring-primary/50"
        onClick={() => setOpen(true)}
      >
        <img src={src} alt={alt} className="aspect-16/10 w-full object-cover" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  )
}

export function LandlordTenantsPage() {
  const tenantsQuery = useGetLandlordTenants()
  const tenants = tenantsQuery.data?.data ?? []
  const [selectedTenant, setSelectedTenant] = useState<typeof tenants[0] | null>(null)

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
      
      <LandlordDashboardHeader
        greeting="Danh sách người thuê"
        subtitle={`Tổng ${tenants.length} người thuê đang thuê phòng của bạn.`}
      />

      {tenantsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-xl border border-primary/10 bg-white"
            />
          ))}
        </div>
      ) : null}

      {tenantsQuery.isError ? (
        <div className="rounded-xl border border-red-500/20 bg-white p-8 text-center text-sm text-red-600">
          Không thể tải danh sách người thuê.
        </div>
      ) : null}

      {!tenantsQuery.isLoading && !tenantsQuery.isError && tenants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/20 bg-white p-8 text-center text-sm text-muted-foreground md:p-10">
          Chưa có người thuê nào.
        </div>
      ) : null}

      {!tenantsQuery.isLoading && !tenantsQuery.isError && tenants.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <div
              key={tenant.tenantId}
              className="flex flex-col gap-4 rounded-xl border border-primary/10 bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  name={tenant.tenantName}
                  className="size-12 text-sm"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {tenant.tenantName}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{tenant.roomTitle}</span>
                  </p>
                </div>
                {tenant.isPrimaryTenant ? (
                  <Star className="ml-auto size-4 shrink-0 text-amber-500" />
                ) : null}
              </div>

              <div className="space-y-1.5 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{tenant.tenantEmail}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3.5 shrink-0" />
                  <span>{tenant.tenantPhone}</span>
                </p>
                {tenant.dateOfBirth ? (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-3.5 shrink-0" />
                    <span>{formatDate(tenant.dateOfBirth)}</span>
                  </p>
                ) : null}
                {tenant.cccdNumber ? (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="size-3.5 shrink-0" />
                    <span className="truncate">{tenant.cccdNumber}</span>
                  </p>
                ) : null}
              </div>

              <p className="text-xs text-muted-foreground">
                Địa chỉ:{' '}
                <span className="text-foreground">{tenant.address}</span>
              </p>

              {(tenant.cccdFrontImage || tenant.cccdBackImage) ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-auto gap-1.5 text-xs h-8"
                  onClick={() => setSelectedTenant(tenant)}
                >
                  <Eye className="size-3.5" />
                  Xem CCCD
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <Modal
        open={Boolean(selectedTenant)}
        onClose={() => setSelectedTenant(null)}
        title={`CCCD - ${selectedTenant?.tenantName ?? ''}`}
        className="max-w-lg"
      >
        {selectedTenant ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {selectedTenant.cccdFrontImage ? (
                <div>
                  <ImageLightbox src={selectedTenant.cccdFrontImage} alt="CCCD mặt trước" />
                  <p className="mt-1 text-center text-xs text-slate-500">Mặt trước</p>
                </div>
              ) : null}
              {selectedTenant.cccdBackImage ? (
                <div>
                  <ImageLightbox src={selectedTenant.cccdBackImage} alt="CCCD mặt sau" />
                  <p className="mt-1 text-center text-xs text-slate-500">Mặt sau</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
