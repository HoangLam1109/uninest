import type {
  ServicePackage,
  ServicePackageTargetRole,
} from "@/types/service-package";

export function formatServicePackagePrice(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function getServicePackageFeatureList(pkg: ServicePackage): string[] {
  if (pkg.features && Object.keys(pkg.features).length > 0) {
    return Object.values(pkg.features);
  }
  return ["Truy cập đầy đủ tính năng của gói"];
}

export function getPackageVisual(targetRole: ServicePackageTargetRole) {
  if (targetRole === "LANDLORD") {
    return {
      icon: "🏠",
      accent: "#5D4E37",
      accentSoft: "#F0EBE3",
      eyebrow: "Dành cho chủ nhà cho thuê",
    };
  }

  return {
    icon: "🔑",
    accent: "#F28C1B",
    accentSoft: "#FFF4E8",
    eyebrow: "Dành cho người thuê phòng",
    recommended: true as const,
  };
}

export function sortServicePackages(packages: ServicePackage[]) {
  return [...packages].sort((a, b) => {
    if (a.targetRole === b.targetRole) return a.price - b.price;
    if (a.targetRole === "TENANT") return -1;
    if (b.targetRole === "TENANT") return 1;
    return a.price - b.price;
  });
}

export function findPackagePriceByRole(
  packages: ServicePackage[],
  role: ServicePackageTargetRole,
) {
  const match = packages.find((pkg) => pkg.targetRole === role && pkg.isActive);
  return match?.price;
}
