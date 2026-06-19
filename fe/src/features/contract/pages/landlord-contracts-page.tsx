import { useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { Pagination } from '@/components/common/pagination'
import { Button } from '@/components/ui/button'
import { LandlordDashboardHeader } from '@/features/landlord'
import { ContractCard } from '../components/contract-card'
import { ContractFormModal } from '../components/contract-form-modal'
import { ContractSummary } from '../components/contract-summary'
import {
  useActivateContract,
  useCreateContract,
  useGetLandlordContracts,
  useRenewContract,
  useTerminateContract,
  useUpdateContract,
} from '../hooks/use-contracts'
import type {
  Contract,
  CreateContractPayload,
  RenewContractPayload,
  UpdateContractPayload,
} from '../types/contract.type'

type ModalState =
  | { mode: 'create'; contract: null }
  | { mode: 'edit' | 'renew'; contract: Contract }
  | null

export function LandlordContractsPage() {
  const [page, setPage] = useState(1)
  const [modalState, setModalState] = useState<ModalState>(null)
  const contractsQuery = useGetLandlordContracts({ page, limit: 10 })
  const createContract = useCreateContract()
  const updateContract = useUpdateContract()
  const activateContract = useActivateContract()
  const terminateContract = useTerminateContract()
  const renewContract = useRenewContract()

  const contracts = contractsQuery.data?.data ?? []
  const pagination = contractsQuery.data?.pagination
  const isActionPending =
    createContract.isPending ||
    updateContract.isPending ||
    activateContract.isPending ||
    terminateContract.isPending ||
    renewContract.isPending

  function closeModal() {
    setModalState(null)
  }

  function handleSubmit(
    payload: CreateContractPayload | UpdateContractPayload | RenewContractPayload,
  ) {
    if (!modalState) return

    if (modalState.mode === 'create') {
      createContract.mutate(payload as CreateContractPayload, {
        onSuccess: closeModal,
      })
      return
    }

    if (modalState.mode === 'renew') {
      renewContract.mutate(
        {
          id: modalState.contract._id,
          payload: payload as RenewContractPayload,
        },
        { onSuccess: closeModal },
      )
      return
    }

    updateContract.mutate(
      {
        id: modalState.contract._id,
        payload: payload as UpdateContractPayload,
      },
      { onSuccess: closeModal },
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <LandlordDashboardHeader
          greeting="Quản lý hợp đồng"
          subtitle="Theo dõi trạng thái ký, thời hạn thuê và file hợp đồng của từng phòng."
        />
        <Button
          type="button"
          className="w-full sm:w-fit"
          onClick={() => setModalState({ mode: 'create', contract: null })}
        >
          <Plus className="size-4" />
          Tạo hợp đồng
        </Button>
      </header>

      <ContractSummary
        contracts={contracts}
        total={pagination?.total}
        mode="landlord"
      />

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
            Chưa có hợp đồng nào
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Tạo hợp đồng từ booking đã duyệt để quản lý thời hạn thuê và quy trình ký.
          </p>
        </div>
      ) : null}

      {!contractsQuery.isLoading && !contractsQuery.isError && contracts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {contracts.map((contract) => (
            <ContractCard
              key={contract._id}
              contract={contract}
              mode="landlord"
              isActionPending={isActionPending}
              onEdit={(selectedContract) =>
                setModalState({ mode: 'edit', contract: selectedContract })
              }
              onRenew={(selectedContract) =>
                setModalState({ mode: 'renew', contract: selectedContract })
              }
              onActivate={activateContract.mutate}
              onTerminate={terminateContract.mutate}
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

      <ContractFormModal
        open={Boolean(modalState)}
        mode={modalState?.mode ?? 'create'}
        contract={modalState?.contract}
        isPending={isActionPending}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
