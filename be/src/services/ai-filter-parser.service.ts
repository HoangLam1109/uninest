import { ROOM_TYPE } from "../models/Room.model.js";
import type { RoomAiFilters } from "./rag-room.service.js";

const DISTRICTS: Array<[string, string]> = [
  ["binh thanh", "Binh Thanh"],
  ["tan binh", "Tan Binh"],
  ["tan phu", "Tan Phu"],
  ["go vap", "Go Vap"],
  ["phu nhuan", "Phu Nhuan"],
  ["thu duc", "Thu Duc"],
  ["binh tan", "Binh Tan"],
  ["nha be", "Nha Be"],
  ["binh chanh", "Binh Chanh"],
  ["hoc mon", "Hoc Mon"],
  ["cu chi", "Cu Chi"],
  ["can gio", "Can Gio"],
  ["quan 1", "District 1"],
  ["q1", "District 1"],
  ["district 1", "District 1"],
  ["quan 2", "District 2"],
  ["q2", "District 2"],
  ["district 2", "District 2"],
  ["quan 3", "District 3"],
  ["q3", "District 3"],
  ["district 3", "District 3"],
  ["quan 4", "District 4"],
  ["q4", "District 4"],
  ["district 4", "District 4"],
  ["quan 5", "District 5"],
  ["q5", "District 5"],
  ["district 5", "District 5"],
  ["quan 6", "District 6"],
  ["q6", "District 6"],
  ["district 6", "District 6"],
  ["quan 7", "District 7"],
  ["q7", "District 7"],
  ["district 7", "District 7"],
  ["quan 8", "District 8"],
  ["q8", "District 8"],
  ["district 8", "District 8"],
  ["quan 9", "Quận 9"],
  ["q9", "Quận 9"],
  ["district 9", "District 9"],
  ["quan 10", "District 10"],
  ["q10", "District 10"],
  ["district 10", "District 10"],
  ["quan 11", "District 11"],
  ["q11", "District 11"],
  ["district 11", "District 11"],
  ["quan 12", "District 12"],
  ["q12", "District 12"],
  ["district 12", "District 12"],
];

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parseAmountToVnd(amount: string, unit?: string) {
  const numeric = Number(amount.replace(",", "."));
  if (!Number.isFinite(numeric)) return undefined;

  if (unit && ["trieu", "m"].includes(unit)) return Math.round(numeric * 1_000_000);
  if (unit && ["k", "nghin", "ngan"].includes(unit)) return Math.round(numeric * 1_000);
  if (numeric >= 100_000) return Math.round(numeric);
  return undefined;
}

function parsePrice(text: string): Pick<RoomAiFilters, "minPrice" | "maxPrice"> {
  const filters: Pick<RoomAiFilters, "minPrice" | "maxPrice"> = {};
  const rangeMatch = text.match(
    /tu\s+(\d+(?:[.,]\d+)?)\s*(trieu|m|k|nghin|ngan)?\s+(?:den|toi)\s+(\d+(?:[.,]\d+)?)\s*(trieu|m|k|nghin|ngan)?/
  );

  if (rangeMatch) {
    const min = parseAmountToVnd(rangeMatch[1] || "", rangeMatch[2] || rangeMatch[4]);
    const max = parseAmountToVnd(rangeMatch[3] || "", rangeMatch[4] || rangeMatch[2]);
    if (min !== undefined) filters.minPrice = min;
    if (max !== undefined) filters.maxPrice = max;
    return filters;
  }

  const priceRegex = /(\d+(?:[.,]\d+)?)\s*(trieu|m|k|nghin|ngan|vnd|dong)?/g;
  for (const match of text.matchAll(priceRegex)) {
    const value = parseAmountToVnd(match[1] || "", match[2]);
    if (value === undefined) continue;

    const start = match.index || 0;
    const before = text.slice(Math.max(0, start - 28), start);
    const after = text.slice(start, Math.min(text.length, start + 28));
    const windowText = `${before} ${after}`;

    if (/(duoi|toi da|khong qua|nho hon|<=|re hon)/.test(windowText)) {
      filters.maxPrice = value;
      continue;
    }

    if (/(tren|toi thieu|lon hon|>=)/.test(windowText)) {
      filters.minPrice = value;
      continue;
    }

    if (/(gia|tam gia|ngan sach|budget)/.test(windowText) && filters.maxPrice === undefined) {
      filters.maxPrice = value;
    }
  }

  return filters;
}

function parseDistrict(text: string) {
  const district = DISTRICTS.find(([keyword]) => text.includes(keyword));
  return district?.[1];
}

function parseCity(text: string) {
  if (
    text.includes("ho chi minh") ||
    text.includes("hcm") ||
    text.includes("sai gon") ||
    text.includes("saigon")
  ) {
    return "Ho Chi Minh";
  }

  if (text.includes("ha noi") || text.includes("hanoi")) {
    return "Ha Noi";
  }

  return undefined;
}

function parseRoomType(text: string) {
  if (text.includes("studio")) return ROOM_TYPE.STUDIO;
  if (text.includes("can ho") || text.includes("apartment")) return ROOM_TYPE.APARTMENT;
  if (text.includes("phong don") || text.includes("single")) return ROOM_TYPE.SINGLE;
  if (text.includes("o ghep") || text.includes("share") || text.includes("shared")) {
    return ROOM_TYPE.SHARED;
  }
  return undefined;
}

function parseMinRating(text: string) {
  const ratingMatch = text.match(/(?:tu\s*)?([1-5](?:[.,]\d)?)\s*(?:sao|star)/);
  if (ratingMatch) {
    const rating = Number((ratingMatch[1] || "").replace(",", "."));
    if (Number.isFinite(rating)) return Math.min(Math.max(rating, 1), 5);
  }

  if (/(review tot|danh gia tot|duoc danh gia cao|uy tin)/.test(text)) {
    return 4;
  }

  return undefined;
}

export const AiFilterParserService = {
  parseRoomSearchFilters: (question: string): RoomAiFilters => {
    const text = normalizeText(question);
    const filters: RoomAiFilters = {};
    const priceFilters = parsePrice(text);
    const city = parseCity(text);
    const district = parseDistrict(text);
    const roomType = parseRoomType(text);
    const minRating = parseMinRating(text);

    if (priceFilters.minPrice !== undefined) filters.minPrice = priceFilters.minPrice;
    if (priceFilters.maxPrice !== undefined) filters.maxPrice = priceFilters.maxPrice;
    if (city !== undefined) filters.city = city;
    if (district !== undefined) filters.district = district;
    if (roomType !== undefined) filters.roomType = roomType;
    if (minRating !== undefined) filters.minRating = minRating;

    return filters;
  },
};
