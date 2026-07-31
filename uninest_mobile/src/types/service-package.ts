export type ServicePackageTargetRole = "TENANT" | "LANDLORD";

export type ServicePackage = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  targetRole: ServicePackageTargetRole;
  features?: Record<string, string>;
  maxRooms?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ServicePackagePagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ServicePackageListResponse = {
  success: boolean;
  data: ServicePackage[];
  pagination: ServicePackagePagination;
};

export type ServicePackageResponse = {
  success: boolean;
  message?: string;
  data: ServicePackage;
};

export type ServiceSubscribeResponse = {
  success: boolean;
  message: string;
  data: {
    payment: {
      _id: string;
      amount: number;
      currency: string;
      type: string;
      method: string;
      status: string;
      note?: string;
      transactionRef?: string;
    };
    checkoutUrl: string;
    orderCode: number;
    status: "PENDING";
  };
};

export type ActiveSubscriptionResponse = {
  success: boolean;
  data: {
    subscription: {
      _id: string;
      userId: string;
      packageId: string;
      paymentId: string;
      startDate: string;
      endDate: string;
      status: "ACTIVE" | "EXPIRED" | "CANCELLED";
      autoRenew: boolean;
    } | null;
    package: ServicePackage | null;
  };
};
