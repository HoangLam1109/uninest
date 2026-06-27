import { useState } from 'react'
import { Building2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminIdentityModerationPage } from '@/features/identity/pages/admin-identity-moderation-page'
import { AdminBankAccountModerationPage } from '@/features/bank-account/pages/admin-bank-account-moderation-page'

type ModerationTab = 'cccd' | 'bank'

const tabs: Array<{ key: ModerationTab; label: string; icon: typeof ShieldCheck }> = [
  { key: 'cccd', label: 'CCCD', icon: ShieldCheck },
  { key: 'bank', label: 'Ngân hàng', icon: Building2 },
]

export function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<ModerationTab>('cccd')

  return (
    <div className="flex flex-col gap-6 px-4 pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8">
      {/* Tab Bar */}
      <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'cccd' ? (
        <AdminIdentityModerationPage />
      ) : (
        <AdminBankAccountModerationPage />
      )}
    </div>
  )
}
