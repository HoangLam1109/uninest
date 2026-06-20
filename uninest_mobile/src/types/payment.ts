export type RoleUpgradeTarget = "TENANT" | "LANDLORD";

export type RoleUpgradePayload = {
  targetRole: RoleUpgradeTarget;
  returnUrl?: string;
  cancelUrl?: string;
};

export type RoleUpgradePayment = {
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

export type RoleUpgradePaymentResponse = {
  success: boolean;
  message: string;
  data: RoleUpgradePayment;
};

export type PayOSPaymentStatus = {
  payosStatus: string;
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
};

export type PayOSPaymentStatusResponse = {
  success: boolean;
  data: PayOSPaymentStatus;
};
