import {
  isBillingMonthString,
  isDateInputString,
  parseOptionalNonNegativeNumber,
  parsePositiveNumber,
  validateOptionalTextMax,
} from "./common";

export type InvoiceCreateFormValues = {
  bookingId: string;
  billingMonth: string;
  dueDate: string;
  rentAmount: string;
  electricityAmount: string;
  waterAmount: string;
  electricityNewIndex: string;
  waterNewIndex: string;
  additionalFees: string;
  notes: string;
};

export type InvoiceEditFormValues = {
  dueDate: string;
  rentAmount: string;
  electricityAmount: string;
  waterAmount: string;
  additionalFees: string;
  notes: string;
};

function validateInvoiceBase(values: {
  dueDate: string;
  rentAmount: string;
  additionalFees: string;
  notes: string;
}): string | null {
  if (!isDateInputString(values.dueDate)) {
    return "Hạn thanh toán không hợp lệ.";
  }

  const rent = parsePositiveNumber(values.rentAmount);
  if (rent == null) return "Tiền thuê phải lớn hơn 0.";

  const additionalFees = parseOptionalNonNegativeNumber(values.additionalFees);
  if (additionalFees === null) return "Phí khác không được âm.";

  const notesError = validateOptionalTextMax(values.notes, 500, "Ghi chú");
  if (notesError) return notesError;

  return null;
}

export function validateInvoiceCreateForm(
  values: InvoiceCreateFormValues,
): string | null {
  if (!values.bookingId.trim()) return "Vui lòng chọn đơn đặt phòng.";
  if (!isBillingMonthString(values.billingMonth)) {
    return "Kỳ hóa đơn phải có dạng YYYY-MM.";
  }

  const baseError = validateInvoiceBase(values);
  if (baseError) return baseError;

  const electricityAmount = parseOptionalNonNegativeNumber(values.electricityAmount);
  if (electricityAmount === null) return "Tiền điện không được âm.";

  const waterAmount = parseOptionalNonNegativeNumber(values.waterAmount);
  if (waterAmount === null) return "Tiền nước không được âm.";

  return null;
}

export function validateInvoiceUtilityForm(
  values: InvoiceCreateFormValues,
): string | null {
  const baseError = validateInvoiceCreateForm(values);
  if (baseError) return baseError;

  const electricityIndex = parseOptionalNonNegativeNumber(values.electricityNewIndex);
  if (electricityIndex === null) return "Chỉ số điện mới không được âm.";

  const waterIndex = parseOptionalNonNegativeNumber(values.waterNewIndex);
  if (waterIndex === null) return "Chỉ số nước mới không được âm.";

  if (electricityIndex == null && waterIndex == null) {
    return "Nhập ít nhất một chỉ số điện hoặc nước mới.";
  }

  return null;
}

export function validateInvoiceEditForm(values: InvoiceEditFormValues): string | null {
  const baseError = validateInvoiceBase(values);
  if (baseError) return baseError;

  const electricityAmount = parseOptionalNonNegativeNumber(values.electricityAmount);
  if (electricityAmount === null) return "Tiền điện không được âm.";

  const waterAmount = parseOptionalNonNegativeNumber(values.waterAmount);
  if (waterAmount === null) return "Tiền nước không được âm.";

  return null;
}
