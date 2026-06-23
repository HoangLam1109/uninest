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

export function validateRegisterForm(form: RegisterFormValues): string | null {
  const fullName = form.fullName.trim();
  const email = form.email.trim().toLowerCase();
  const phone = form.phone.trim();

  if (fullName.length < 2) {
    return "Họ và tên phải có ít nhất 2 ký tự.";
  }
  if (!email) return "Vui lòng nhập email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email không hợp lệ.";
  }
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
