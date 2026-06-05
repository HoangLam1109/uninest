import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Pagination } from '@/components/common/pagination'
import { Button } from '@/components/ui/button'
import { ContractCard } from '../components/contract-card'
import { ContractFormModal } from '../components/contract-form-modal'
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
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">
            Hợp đồng
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
            Quản lý hợp đồng thuê phòng
          </h1>
        </div>
        <Button
          type="button"
          onClick={() => setModalState({ mode: 'create', contract: null })}
        >
          <Plus className="size-4" />
          Tạo hợp đồng
        </Button>
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
          Chưa có hợp đồng nào.
        </div>
      ) : null}

      {!contractsQuery.isLoading && !contractsQuery.isError && contracts.length > 0 ? (
        <div className="grid gap-5">
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
