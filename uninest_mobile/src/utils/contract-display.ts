import type { Contract, ContractStatus, ContractUserRef } from "@/types/contract";

export function contractStatusLabel(status: ContractStatus) {
  const map: Record<ContractStatus, string> = {
    DRAFT: "Bản nháp",
    PENDING_TENANT_SIGNATURE: "Chờ người thuê ký",
    ACTIVE: "Đang hiệu lực",
    EXPIRED: "Hết hạn",
    TERMINATED: "Đã chấm dứt",
  };
  return map[status] ?? status;
}

export function contractStatusBadgeStyle(status: ContractStatus) {
  if (status === "DRAFT") return "draft" as const;
  if (status === "PENDING_TENANT_SIGNATURE") return "pending" as const;
  if (status === "ACTIVE") return "active" as const;
  if (status === "EXPIRED") return "expired" as const;
  return "terminated" as const;
}

export function formatContractCurrency(value?: number) {
  if (typeof value !== "number") return "Chưa cập nhật";
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function formatContractDate(value?: string) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
}

export function getContractPartyName(value?: string | ContractUserRef) {
  if (!value || typeof value === "string") return "Chưa có thông tin";
  return value.fullName ?? value.email ?? "Chưa có thông tin";
}

export function getContractRoomTitle(contract: Contract) {
  const booking = contract.bookingId;
  if (typeof booking === "object" && booking?.roomId) {
    const room = booking.roomId;
    if (typeof room === "object" && room !== null && "title" in room) {
      return room.title ?? "Phòng chưa cập nhật";
    }
  }
  return "Phòng chưa cập nhật";
}

export function getContractRoomAddress(contract: Contract) {
  const booking = contract.bookingId;
  if (typeof booking === "object" && booking?.roomId) {
    const room = booking.roomId;
    if (typeof room === "object" && room !== null && "address" in room) {
      return room.address ?? null;
    }
  }
  return null;
}

export function contractStatusPillStyle(status: ContractStatus) {
  switch (status) {
    case "DRAFT":
      return { backgroundColor: "#F0EBE4", color: "#7A6B58" };
    case "PENDING_TENANT_SIGNATURE":
      return { backgroundColor: "#FFF4D6", color: "#C47A10" };
    case "ACTIVE":
      return { backgroundColor: "#E2F5E8", color: "#2E8B57" };
    case "EXPIRED":
      return { backgroundColor: "#FDECEC", color: "#D14343" };
    default:
      return { backgroundColor: "#EEF1F5", color: "#6B7280" };
  }
}

export function hasContractFile(contract: Contract) {
  return Boolean(
    contract.contractFileStorageKey?.trim() ||
      contract.signedContractStorageKey?.trim() ||
      contract.signedContractFileUrl?.trim() ||
      contract.contractFileUrl?.trim(),
  );
}

export function getExistingContractFileName(contract?: Contract | null) {
  if (!contract) return null;
  if (contract.contractFileStorageKey || contract.signedContractStorageKey) {
    return "contract.pdf";
  }
  const filename = contract.contractFileUrl?.split("/").pop()?.split("?")[0];
  return filename || "contract.pdf";
}

export function getContractBookingId(contract: Contract): string | null {
  const booking = contract.bookingId;
  if (typeof booking === "string") return booking;
  if (typeof booking === "object" && booking !== null && "_id" in booking) {
    return String(booking._id);
  }
  return null;
}
