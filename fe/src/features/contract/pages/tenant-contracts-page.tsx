import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Pagination } from '@/components/common/pagination'
import { ContractCard } from '../components/contract-card'
import { ContractSignatureModal } from '../components/contract-signature-modal'
import { ContractSummary } from '../components/contract-summary'
import {
  useConfirmContractByTenant,
  useGetTenantContracts,
} from '../hooks/use-contracts'
import type { ConfirmContractPayload, Contract } from '../types/contract.type'

export function TenantContractsPage() {
  const [page, setPage] = useState(1)
  const [signingContract, setSigningContract] = useState<Contract | null>(null)
  const contractsQuery = useGetTenantContracts({ page, limit: 10 })
  const confirmContract = useConfirmContractByTenant()
  const contracts = contractsQuery.data?.data ?? []
  const pagination = contractsQuery.data?.pagination

  function handleConfirm(contractId: string, payload: ConfirmContractPayload) {
    confirmContract.mutate(
      {
        id: contractId,
        payload,
      },
      {
        onSuccess: () => setSigningContract(null),
      },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 md:gap-6 md:px-6 lg:gap-8 lg:px-8 2xl:mx-0 2xl:max-w-none">
      <header className="rounded-xl border border-primary/10 bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm font-semibold text-primary">Hợp đồng của tôi</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
          Theo dõi hợp đồng thuê phòng
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Xem trạng thái ký, thời hạn thuê và file hợp đồng đã được chủ nhà gửi.
        </p>
      </header>

      <ContractSummary contracts={contracts} total={pagination?.total} mode="tenant" />

      {contractsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-xl bg-border/60" />
          ))}
        </div>
      ) : null}

      {contractsQuery.isError ? (
        <div className="rounded-xl border border-red-500/20 bg-white p-8 text-center text-sm text-red-600">
          Không thể tải danh sách hợp đồng.
        </div>
      ) : null}

      {!contractsQuery.isLoading && !contractsQuery.isError && contracts.length === 0 ? (
        <div className="rounded-xl border border-primary/10 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">
            Bạn chưa có hợp đồng nào
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Khi chủ nhà gửi hợp đồng, bạn có thể xem file và ký xác nhận tại đây.
          </p>
        </div>
      ) : null}

      {!contractsQuery.isLoading && !contractsQuery.isError && contracts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {contracts.map((contract) => (
            <ContractCard
              key={contract._id}
              contract={contract}
              mode="tenant"
              isActionPending={confirmContract.isPending}
              onTenantSign={setSigningContract}
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

      <ContractSignatureModal
        open={Boolean(signingContract)}
        contract={signingContract}
        isPending={confirmContract.isPending}
        onClose={() => setSigningContract(null)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
