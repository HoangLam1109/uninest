import { parseOptionalNonNegativeNumber, parsePositiveNumber } from "./common";

export const MAX_ROOM_IMAGES = 12;
export const MAX_ROOM_IMAGE_SIZE = 8 * 1024 * 1024;

export type RoomFormValues = {
  title: string;
  address: string;
  pricePerMonth: string;
  depositAmount: string;
  maxOccupants: string;
  areaSqm: string;
  electricityRate: string;
  waterRate: string;
};

export function validateRoomForm(values: RoomFormValues): string | null {
  if (values.title.trim().length < 2) {
    return "Tên phòng phải có ít nhất 2 ký tự.";
  }
  if (values.address.trim().length < 3) {
    return "Vui lòng nhập địa chỉ.";
  }

  const price = parsePositiveNumber(values.pricePerMonth);
  if (price == null) return "Giá thuê phải lớn hơn 0.";

  const depositAmount = parseOptionalNonNegativeNumber(values.depositAmount);
  if (depositAmount === null) return "Tiền cọc không được âm.";

  const maxOccupantsRaw = values.maxOccupants.trim();
  if (!maxOccupantsRaw) return "Số người ở tối đa phải ≥ 1.";
  const maxOccupants = Number(maxOccupantsRaw);
  if (!Number.isFinite(maxOccupants) || !Number.isInteger(maxOccupants) || maxOccupants < 1) {
    return "Số người ở tối đa phải là số nguyên ≥ 1.";
  }

  const areaSqm = parseOptionalNonNegativeNumber(values.areaSqm);
  if (areaSqm === null) return "Diện tích không được âm.";

  const electricityRate = parseOptionalNonNegativeNumber(values.electricityRate);
  if (electricityRate === null) return "Giá điện không được âm.";

  const waterRate = parseOptionalNonNegativeNumber(values.waterRate);
  if (waterRate === null) return "Giá nước không được âm.";

  return null;
}

export function validateRoomImageSelection(params: {
  currentCount: number;
  newCount: number;
  assets: { fileSize?: number | null }[];
}): string | null {
  const total = params.currentCount + params.newCount;
  if (total > MAX_ROOM_IMAGES) {
    return `Chỉ được tải tối đa ${MAX_ROOM_IMAGES} ảnh.`;
  }

  for (const asset of params.assets) {
    if (asset.fileSize != null && asset.fileSize > MAX_ROOM_IMAGE_SIZE) {
      return "Mỗi ảnh phải có dung lượng tối đa 8MB.";
    }
  }

  return null;
}
