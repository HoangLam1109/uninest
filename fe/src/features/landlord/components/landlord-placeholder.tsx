import { LandlordDashboardHeader } from '@/features/landlord'

type LandlordPlaceholderPageProps = {
  title: string
}

export function LandlordPlaceholderPage({ title }: LandlordPlaceholderPageProps) {
  return (
    <>
      <LandlordDashboardHeader
        greeting={title}
        subtitle="Tính năng đang được phát triển."
      />
      <div className="rounded-2xl border border-dashed border-primary/20 bg-white p-12 text-center">
        <p className="text-slate-500">Nội dung sẽ sớm có mặt trên UniNest.</p>
      </div>
    </>
  )
}
