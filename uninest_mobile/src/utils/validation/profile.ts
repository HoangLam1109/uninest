import { validatePhone } from "./common";

export function validateProfilePersonal(fullName: string, phone: string): string | null {
  if (fullName.trim().length < 3) {
    return "Họ tên phải có ít nhất 3 ký tự.";
  }
  return validatePhone(phone);
}

export function validateLandlordProfileEdit(
  fullName: string,
  email: string,
  phone: string,
  password: string,
  confirmPassword: string,
): string | null {
  const trimmedName = fullName.trim();
  if (trimmedName.length < 2) {
    return "Họ và tên phải có ít nhất 2 ký tự.";
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) return "Vui lòng nhập email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return "Email không hợp lệ.";
  }

  const phoneError = validatePhone(phone);
  if (phoneError) return phoneError;

  if (password || confirmPassword) {
    if (!password) return "Vui lòng nhập mật khẩu mới.";
    if (password.length < 8) return "Mật khẩu mới phải có ít nhất 8 ký tự.";
    if (password !== confirmPassword) return "Mật khẩu xác nhận không khớp.";
  }

  return null;
}
