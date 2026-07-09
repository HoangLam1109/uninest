import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { Identity } from '@/features/identity/types/identity.type'

type DeleteIdentityConfirmModalProps = {
  identity: Identity | null
  open: boolean
  isPending?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteIdentityConfirmModal({
  identity,
  open,
  isPending = false,
  onClose,
  onConfirm,
}: DeleteIdentityConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xóa hồ sơ định danh"
      className="max-w-md"
    >
      {identity ? (
        <div className="space-y-5">
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              Bạn có chắc muốn xóa hồ sơ định danh của{' '}
              <span className="font-semibold text-foreground">
                {identity.fullName}
              </span>
              ?
            </p>
            <p>Thao tác này không thể hoàn tác.</p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
