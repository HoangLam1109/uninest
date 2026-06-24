import { isDateInputString, validatePhone } from "./common";

export type IdentityFormValues = {
  fullName: string;
  dateOfBirth: string;
  phone: string;
  cccdNumber: string;
};

export function validateIdentityForm(values: IdentityFormValues): string | null {
  const fullName = values.fullName.trim();
  if (fullName.length < 3) return "Họ tên phải có ít nhất 3 ký tự.";
  if (fullName.length > 100) return "Họ tên tối đa 100 ký tự.";

  const dateOfBirth = values.dateOfBirth.trim();
  if (!dateOfBirth) return "Ngày sinh là bắt buộc.";
  if (!isDateInputString(dateOfBirth) || Number.isNaN(Date.parse(dateOfBirth))) {
    return "Ngày sinh không hợp lệ.";
  }

  const phoneError = validatePhone(values.phone);
  if (phoneError) return phoneError;

  const cccdNumber = values.cccdNumber.trim();
  if (cccdNumber.length < 9) return "CCCD/CMND phải có ít nhất 9 ký tự.";
  if (cccdNumber.length > 12) return "CCCD/CMND tối đa 12 ký tự.";

  return null;
}
