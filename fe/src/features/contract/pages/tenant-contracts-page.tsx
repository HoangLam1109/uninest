import { useState } from 'react'
import { Pagination } from '@/components/common/pagination'
import { ContractCard } from '../components/contract-card'
import { useGetTenantContracts } from '../hooks/use-contracts'

export function TenantContractsPage() {
  const [page, setPage] = useState(1)
  const contractsQuery = useGetTenantContracts({ page, limit: 10 })
  const contracts = contractsQuery.data?.data ?? []
  const pagination = contractsQuery.data?.pagination

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold uppercase text-primary">
          Hợp đồng của tôi
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
          Theo dõi hợp đồng thuê phòng
        </h1>
      </header>

      {contractsQuery.isLoading ? (
        <div className="grid gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl bg-border/60" />
          ))}
        </div>
      ) : null}

      {contractsQuery.isError ? (
        <div className="rounded-xl border border-red-500/20 bg-white p-8 text-center text-sm text-red-600">
          Không thể tải danh sách hợp đồng.
        </div>
      ) : null}

      {!contractsQuery.isLoading && !contractsQuery.isError && contracts.length === 0 ? (
        <div className="rounded-xl border border-primary/10 bg-white p-8 text-center text-sm text-slate-500">
          Bạn chưa có hợp đồng nào.
        </div>
      ) : null}

      {!contractsQuery.isLoading && !contractsQuery.isError && contracts.length > 0 ? (
        <div className="grid gap-5">
          {contracts.map((contract) => (
            <ContractCard
              key={contract._id}
              contract={contract}
              mode="tenant"
            />
          ))}
        </div>
      ) : null}

      {pagination ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          isDisabled={contractsQuery.isFetching}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  )
}
