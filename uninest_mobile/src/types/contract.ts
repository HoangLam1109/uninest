import type { ContractPdfUpload } from "@/utils/contract-upload";

export type ContractStatus =
  | "DRAFT"
  | "PENDING_TENANT_SIGNATURE"
  | "ACTIVE"
  | "EXPIRED"
  | "TERMINATED";

export type ContractUserRef = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

export type ContractBookingRef = {
  _id: string;
  roomId?: string | { _id: string; title?: string; address?: string };
};

export type Contract = {
  _id: string;
  bookingId: string | ContractBookingRef;
  landlordId?: string | ContractUserRef;
  tenantId?: string | ContractUserRef;
  startDate?: string;
  endDate?: string | null;
  monthlyRent: number;
  depositAmount?: number;
  terms?: string;
  contractFileUrl?: string;
  contractFileStorageKey?: string;
  signedContractFileUrl?: string;
  signedContractStorageKey?: string;
  status: ContractStatus;
  signedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ContractListResponse = {
  success: boolean;
  data: Contract[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateContractPayload = {
  bookingId: string;
  monthlyRent: number;
  depositAmount?: number;
  terms?: string;
  contractFile?: ContractPdfUpload;
  startDate?: string;
  endDate?: string;
};

export type UpdateContractPayload = Partial<
  Omit<CreateContractPayload, "bookingId">
>;

export type RenewContractPayload = UpdateContractPayload & {
  startDate: string;
};

export type ContractMutationResponse = {
  success: boolean;
  message?: string;
  data: Contract | CreateContractResult;
};

export type ConfirmContractPayload = {
  tenantSignatureDataUrl: string;
};

export type ContractResponse = {
  success: boolean;
  message?: string;
  data: Contract;
};

export type CreateContractResult = {
  contract: Contract;
  tenantIdentity?: {
    fullName?: string;
    dateOfBirth?: string;
    phone?: string;
    cccdNumber?: string;
    cccdFrontImage?: string;
    cccdBackImage?: string;
  };
};
