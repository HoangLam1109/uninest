export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: string;
};

export type RegisterPayload = {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  otp: string;
};

export type SendRegisterOtpPayload = {
  email: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
};

export type LoginResponse = {
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type MeResponse = {
  message: string;
  data: {
    user: AuthUser;
  };
};
