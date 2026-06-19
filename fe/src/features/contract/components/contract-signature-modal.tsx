import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { CheckCircle2, Eraser, PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { Contract, ConfirmContractPayload } from '../types/contract.type'

type ContractSignatureModalProps = {
  open: boolean
  contract?: Contract | null
  isPending?: boolean
  onClose: () => void
  onConfirm: (contractId: string, payload: ConfirmContractPayload) => void
}

function getCanvasPoint(
  canvas: HTMLCanvasElement,
  event: ReactPointerEvent<HTMLCanvasElement>,
) {
  const rect = canvas.getBoundingClientRect()

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

export function ContractSignatureModal({
  open,
  contract,
  isPending = false,
  onClose,
  onConfirm,
}: ContractSignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)
  const signatureResetKey = open ? `open:${contract?._id ?? 'none'}` : 'closed'
  const [prevSignatureResetKey, setPrevSignatureResetKey] = useState(signatureResetKey)

  if (signatureResetKey !== prevSignatureResetKey) {
    setPrevSignatureResetKey(signatureResetKey)
    if (hasSignature) {
      setHasSignature(false)
    }
  }

  useEffect(() => {
    if (!open) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ratio = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = width * ratio
    canvas.height = height * ratio

    const context = canvas.getContext('2d')
    if (!context) return

    context.scale(ratio, ratio)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.lineWidth = 2.4
    context.strokeStyle = '#0f172a'
    context.clearRect(0, 0, width, height)
  }, [open, contract?._id])

  function clearSignature() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  function startDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const point = getCanvasPoint(canvas, event)
    isDrawingRef.current = true
    canvas.setPointerCapture(event.pointerId)
    context.beginPath()
    context.moveTo(point.x, point.y)
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const point = getCanvasPoint(canvas, event)
    context.lineTo(point.x, point.y)
    context.stroke()
    setHasSignature(true)
  }

  function stopDrawing() {
    isDrawingRef.current = false
  }

  function handleConfirm() {
    if (!contract || !hasSignature || !canvasRef.current) return

    onConfirm(contract._id, {
      tenantSignatureDataUrl: canvasRef.current.toDataURL('image/png'),
    })
  }

  const fileUrl = contract?.signedContractFileUrl ?? contract?.contractFileUrl

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ký hợp đồng online"
      className="max-h-[92svh] max-w-6xl overflow-y-auto"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="min-h-[60svh] overflow-hidden rounded-lg border border-primary/10 bg-slate-50">
          {fileUrl ? (
            <iframe
              title="File hợp đồng"
              src={fileUrl}
              className="h-[60svh] w-full bg-white"
            />
          ) : (
            <div className="flex h-[60svh] items-center justify-center px-6 text-center text-sm font-semibold text-slate-500">
              Hợp đồng chưa có file PDF để xem.
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border border-primary/10 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-950">
              <PenLine className="size-4 text-primary" />
              Chữ ký người thuê
            </div>
            <canvas
              ref={canvasRef}
              className="h-48 w-full touch-none rounded-lg border border-dashed border-slate-300 bg-white"
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              onPointerLeave={stopDrawing}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={clearSignature}
            >
              <Eraser className="size-4" />
              Xóa chữ ký
            </Button>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end lg:flex-col">
            <Button type="button" variant="ghost" disabled={isPending} onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="button"
              disabled={isPending || !hasSignature || !fileUrl}
              onClick={handleConfirm}
            >
              <CheckCircle2 className="size-4" />
              {isPending ? 'Đang xác nhận...' : 'Xác nhận hợp đồng'}
            </Button>
          </div>
        </aside>
      </div>
    </Modal>
  )
}
