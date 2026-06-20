import type { IdentityStatus } from "@/types/identity";

export function identityStatusLabel(status: IdentityStatus) {
  const map: Record<IdentityStatus, string> = {
    PENDING_VERIFICATION: "Chờ xác minh",
    VERIFIED: "Đã xác minh",
    REJECTED: "Đã từ chối",
  };
  return map[status] ?? status;
}

export function identityStatusColor(status: IdentityStatus) {
  switch (status) {
    case "VERIFIED":
      return "#2E7D32";
    case "REJECTED":
      return "#C62828";
    default:
      return "#E68A2E";
  }
}

export function formatIdentityDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
