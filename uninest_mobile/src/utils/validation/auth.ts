import { PHONE_REGEX } from "./common";

export type RegisterFormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  otp: string;
  terms: boolean;
};

export type ResetPasswordFormValues = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export function validateEmailValue(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return "Vui lòng nhập email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Email không hợp lệ.";
  }
  return null;
}

export function validateRegisterForm(form: RegisterFormValues): string | null {
  const fullName = form.fullName.trim();
  const email = form.email.trim().toLowerCase();
  const phone = form.phone.trim();

  if (fullName.length < 2) {
    return "Họ và tên phải có ít nhất 2 ký tự.";
  }
  const emailError = validateEmailValue(email);
  if (emailError) return emailError;
  if (phone.length < 10 || !PHONE_REGEX.test(phone)) {
    return "Số điện thoại phải bắt đầu bằng 0.";
  }
  if (form.password.length < 8) {
    return "Mật khẩu tối thiểu 8 ký tự.";
  }
  if (!form.confirmPassword.trim()) {
    return "Vui lòng xác nhận mật khẩu.";
  }
  if (form.password !== form.confirmPassword) {
    return "Mật khẩu xác nhận không khớp.";
  }
  if (!/^\d{6}$/.test(form.otp.trim())) {
    return "Mã OTP phải gồm 6 chữ số. Nhấn Gửi OTP để nhận mã qua email.";
  }
  if (!form.terms) {
    return "Bạn cần đồng ý điều khoản sử dụng.";
  }
  return null;
}

export function validateResetPasswordForm(
  form: ResetPasswordFormValues,
): string | null {
  const emailError = validateEmailValue(form.email);
  if (emailError) return emailError;
  if (!/^\d{6}$/.test(form.otp.trim())) {
    return "Mã OTP phải gồm 6 chữ số.";
  }
  if (form.newPassword.length < 8) {
    return "Mật khẩu tối thiểu 8 ký tự.";
  }
  if (!form.confirmPassword.trim()) {
    return "Vui lòng xác nhận mật khẩu mới.";
  }
  if (form.newPassword !== form.confirmPassword) {
    return "Mật khẩu xác nhận không khớp.";
  }
  return null;
}
