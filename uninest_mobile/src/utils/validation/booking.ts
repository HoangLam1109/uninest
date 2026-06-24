import { getTodayDateString, isDateInputString } from "./common";

function toDateInputString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Chuyển Date sang ISO string (00:00 local) cho API booking — khớp FE. */
export function toBookingIsoDate(date: Date) {
  return new Date(`${toDateInputString(date)}T00:00:00.000`).toISOString();
}

export function validateCheckInDate(date: Date): string | null {
  const value = toDateInputString(date);

  if (!isDateInputString(value)) {
    return "Ngày không hợp lệ.";
  }
  if (value < getTodayDateString()) {
    return "Không được đặt phòng trong quá khứ.";
  }
  return null;
}

export function validateBookingNotes(notes: string): string | null {
  if (notes.trim().length > 500) {
    return "Ghi chú tối đa 500 ký tự.";
  }
  return null;
}
