import { getTodayDateString, isDateInputString } from "./common";

export function validateCheckInDate(date: Date): string | null {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const value = `${year}-${month}-${day}`;

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
