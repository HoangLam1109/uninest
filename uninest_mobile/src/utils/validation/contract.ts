import {
  isOptionalHttpUrl,
  parseOptionalNonNegativeNumber,
  parsePositiveNumber,
  validateContractDates,
  validateOptionalTextMax,
} from "./common";

export type ContractFormMode = "create" | "edit" | "renew";

export type ContractFormValues = {
  mode: ContractFormMode;
  bookingId: string;
  monthlyRent: string;
  depositAmount: string;
  startDate: string;
  endDate: string;
  contractFileUrl: string;
  terms: string;
};

export function validateContractForm(values: ContractFormValues): string | null {
  if (values.mode === "create" && !values.bookingId.trim()) {
    return "Vui lòng chọn đơn đặt phòng.";
  }

  const monthlyRent = parsePositiveNumber(values.monthlyRent);
  if (monthlyRent == null) return "Giá thuê phải lớn hơn 0.";

  const depositAmount = parseOptionalNonNegativeNumber(values.depositAmount);
  if (depositAmount === null) return "Tiền cọc không được âm.";

  const termsError = validateOptionalTextMax(values.terms, 5000, "Điều khoản");
  if (termsError) return termsError;

  if (!isOptionalHttpUrl(values.contractFileUrl)) {
    return "Link hợp lệ phải bắt đầu bằng http:// hoặc https://";
  }

  if (values.mode === "renew" && !values.startDate.trim()) {
    return "Vui lòng nhập ngày bắt đầu gia hạn.";
  }

  const dateError = validateContractDates(values.startDate, values.endDate);
  if (dateError) return dateError;

  return null;
}
