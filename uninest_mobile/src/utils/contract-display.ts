import type { Contract, ContractStatus } from "@/types/contract";

export function contractStatusLabel(status: ContractStatus) {
  const map: Record<ContractStatus, string> = {
    DRAFT: "Nháp",
    PENDING_TENANT_SIGNATURE: "Chờ ký",
    ACTIVE: "Đang hiệu lực",
    EXPIRED: "Hết hạn",
    TERMINATED: "Đã chấm dứt",
  };
  return map[status] ?? status;
}

export function getContractBookingId(contract: Contract): string | null {
  const booking = contract.bookingId;
  if (typeof booking === "string") return booking;
  if (typeof booking === "object" && booking !== null && "_id" in booking) {
    return String(booking._id);
  }
  return null;
}
