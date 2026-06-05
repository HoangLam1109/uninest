export type LandlordTenant = {
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantAvatarUrl?: string;
  isPrimaryTenant: boolean;
  roomTitle: string;
  address: string;
};

export type LandlordTenantListResponse = {
  success: boolean;
  data: LandlordTenant[];
};
