import {
  LANDLORD_PACKAGE_PRICE,
  TENANT_PACKAGE_PRICE,
} from "@/constants/upgrade-features";

export type MembershipPlanKey =
  | "GUEST"
  | "TENANT"
  | "LANDLORD"
  | "ADMIN"
  | "STAFF";

export type MembershipStatusTone = "free" | "active" | "expired";

export type MembershipPlanDisplay = {
  key: MembershipPlanKey;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  accentSoft: string;
  priceLabel?: string;
  statusLabel: string;
  statusTone: MembershipStatusTone;
  expiryText?: string;
  showUpgrade: boolean;
  actionLabel: string;
};

function formatExpiryVi(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isExpired(roleExpiresAt?: string | null): boolean {
  if (!roleExpiresAt) return false;
  return new Date(roleExpiresAt).getTime() < Date.now();
}

export function getMembershipPlanDisplay(
  role?: string | null,
  roleExpiresAt?: string | null,
): MembershipPlanDisplay {
  const expiryText = formatExpiryVi(roleExpiresAt);
  const expired = isExpired(roleExpiresAt);

  switch (role) {
    case "TENANT": {
      const active = !expired;
      return {
        key: "TENANT",
        title: "Gói Người thuê",
        subtitle: "Đặt phòng, chat, hợp đồng & AI tìm phòng",
        icon: "🔑",
        accent: "#F28C1B",
        accentSoft: "#FFF4E8",
        priceLabel: `${TENANT_PACKAGE_PRICE}/tháng`,
        statusLabel: active ? "Đang dùng" : "Đã hết hạn",
        statusTone: active ? "active" : "expired",
        expiryText: expiryText ? `Hết hạn: ${expiryText}` : undefined,
        showUpgrade: !active,
        actionLabel: active ? "Gia hạn gói" : "Nâng cấp lại",
      };
    }
    case "LANDLORD":
      return {
        key: "LANDLORD",
        title: "Gói Chủ nhà",
        subtitle: "Đăng tin, quản lý phòng và thuê trên UniNest",
        icon: "🏠",
        accent: "#5D4E37",
        accentSoft: "#F0EBE3",
        priceLabel: `${LANDLORD_PACKAGE_PRICE}/tháng`,
        statusLabel: expired ? "Đã hết hạn" : "Đang dùng",
        statusTone: expired ? "expired" : "active",
        expiryText: expiryText ? `Hết hạn: ${expiryText}` : undefined,
        showUpgrade: expired,
        actionLabel: expired ? "Nâng cấp lại" : "Quản lý gói",
      };
    case "ADMIN":
      return {
        key: "ADMIN",
        title: "Gói Quản trị",
        subtitle: "Toàn quyền quản lý hệ thống UniNest",
        icon: "⚙️",
        accent: "#2F261A",
        accentSoft: "#EDE8E0",
        statusLabel: "Quản trị viên",
        statusTone: "active",
        showUpgrade: false,
        actionLabel: "Xem chi tiết",
      };
    case "STAFF":
      return {
        key: "STAFF",
        title: "Gói Nhân viên",
        subtitle: "Hỗ trợ vận hành và quản lý UniNest",
        icon: "🛠️",
        accent: "#6B5E4D",
        accentSoft: "#EDE8E0",
        statusLabel: "Nhân viên",
        statusTone: "active",
        showUpgrade: false,
        actionLabel: "Xem chi tiết",
      };
    default:
      return {
        key: "GUEST",
        title: "Gói Khách",
        subtitle: "Truy cập cơ bản — khám phá phòng trọ",
        icon: "👤",
        accent: "#8A7B68",
        accentSoft: "#F5EFE6",
        statusLabel: "Miễn phí",
        statusTone: "free",
        showUpgrade: true,
        actionLabel: "Nâng cấp gói",
      };
  }
}
