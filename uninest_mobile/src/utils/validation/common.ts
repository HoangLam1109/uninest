export const PHONE_REGEX = /^0\d{9,10}$/;

export function getTodayStartTime() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidIsoDateString(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !Number.isNaN(Date.parse(trimmed));
}

export function isDateInputString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

export function isBillingMonthString(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value.trim());
}

export function parsePositiveNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function parseOptionalNonNegativeNumber(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export function isOptionalHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validatePhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Vui lòng nhập số điện thoại.";
  if (trimmed.length < 10) return "Số điện thoại phải có ít nhất 10 ký tự.";
  if (!PHONE_REGEX.test(trimmed)) {
    return "Số điện thoại phải bắt đầu bằng 0.";
  }
  return null;
}

export function validateOptionalTextMax(
  value: string,
  max: number,
  label = "Nội dung",
): string | null {
  if (value.trim().length > max) {
    return `${label} tối đa ${max} ký tự.`;
  }
  return null;
}

export function validateContractDates(
  startDate?: string,
  endDate?: string,
): string | null {
  const start = startDate?.trim();
  const end = endDate?.trim();

  if (start) {
    if (!isValidIsoDateString(start)) return "Ngày không hợp lệ.";
    if (Date.parse(start) < getTodayStartTime()) {
      return "Không được chọn ngày trong quá khứ.";
    }
  }

  if (end) {
    if (!isValidIsoDateString(end)) return "Ngày không hợp lệ.";
    if (Date.parse(end) < getTodayStartTime()) {
      return "Không được chọn ngày trong quá khứ.";
    }
  }

  if (start && end && Date.parse(end) < Date.parse(start)) {
    return "Ngày kết thúc phải sau ngày bắt đầu.";
  }

  return null;
}
