export type UpdateUserPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
};

export type ApiUserRecord = {
  _id?: string;
  id?: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: string;
};

export type UpdateUserResponse = {
  success: boolean;
  data: ApiUserRecord;
};
