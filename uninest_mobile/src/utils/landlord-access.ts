export function isLandlordRole(role?: string | null): boolean {
  return role === "LANDLORD" || role === "ADMIN";
}

export function getRoleLabel(role?: string | null): string {
  switch (role) {
    case "LANDLORD":
      return "Chủ nhà";
    case "ADMIN":
      return "Quản trị viên";
    case "STAFF":
      return "Nhân viên";
    case "TENANT":
      return "Người thuê";
    case "GUEST":
      return "Khách";
    default:
      return role ?? "Sinh viên";
  }
}
