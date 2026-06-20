export type IdentityStatus = "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";

export type IdentityUser = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
};

export type Identity = {
  _id: string;
  userId: string | IdentityUser;
  fullName: string;
  dateOfBirth: string;
  phone: string;
  cccdNumber: string;
  cccdFrontImage: string;
  cccdBackImage: string;
  status: IdentityStatus;
  verifiedAt?: string;
  verifiedBy?: string | IdentityUser;
  createdAt: string;
  updatedAt: string;
};

export type IdentityListResponse = {
  success: boolean;
  data: Identity[];
  message?: string;
};

export type IdentityResponse = {
  success: boolean;
  data: Identity;
  message?: string;
};
