import type { MeterType, ReadingSource } from "@/types/meter";

export function meterTypeLabel(type: MeterType) {
  return type === "ELECTRICITY" ? "Điện" : "Nước";
}

export function meterUnit(type: MeterType) {
  return type === "ELECTRICITY" ? "kWh" : "m³";
}

export function readingSourceLabel(source: ReadingSource) {
  const map: Record<ReadingSource, string> = {
    INITIAL: "Ban đầu",
    MONTHLY: "Hàng tháng",
    TENANT_SELF: "Tự ghi",
    PHOTO: "Ảnh công tơ",
  };
  return map[source] ?? source;
}

export function formatBillingMonth(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

export function formatReadingDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}
