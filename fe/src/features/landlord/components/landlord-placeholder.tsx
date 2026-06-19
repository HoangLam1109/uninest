import { LandlordDashboardHeader } from './landlord-dashboard-header'

type LandlordPlaceholderPageProps = {
  title: string
}

export function LandlordPlaceholderPage({ title }: LandlordPlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
      <LandlordDashboardHeader
        greeting={title}
        subtitle="Tính năng đang được phát triển."
      />
      <div className="rounded-2xl border border-dashed border-primary/20 bg-white p-8 text-center md:p-10 lg:p-12">
        <p className="text-sm text-slate-500 md:text-base">
          Nội dung sẽ sớm có mặt trên UniNest.
        </p>
      </div>
    </div>
  )
}
