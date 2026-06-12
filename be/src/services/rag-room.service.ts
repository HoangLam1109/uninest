import { Types } from "mongoose";
import { ROOM_STATUS, RoomModel } from "../models/Room.model.js";
import { ReviewModel } from "../models/Review.model.js";
import { EmbeddingService } from "./embedding.service.js";
import { GeminiService } from "./gemini.service.js";

export type RoomAiFilters = {
  city?: string;
  district?: string;
  roomType?: string;
  maxPrice?: number;
  minPrice?: number;
  minRating?: number;
  limit?: number;
};

type RagRoomSearchResult = {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  pricePerMonth: number;
  depositAmount?: number;
  areaSqm?: number;
  maxOccupants?: number;
  roomType?: string;
  status?: string;
  ratingAvg?: number;
  reviewCount?: number;
  ragText?: string;
  score?: number;
};

function formatValue(value: unknown, fallback = "Chua co du lieu") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function buildVectorFilter(filters: RoomAiFilters) {
  const vectorFilter: Record<string, any> = {
    isPublished: true,
    status: ROOM_STATUS.AVAILABLE,
  };

  if (filters.city) vectorFilter.city = filters.city;
  if (filters.district) vectorFilter.district = filters.district;
  if (filters.roomType) vectorFilter.roomType = filters.roomType;

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    vectorFilter.pricePerMonth = {};
    if (filters.minPrice !== undefined) vectorFilter.pricePerMonth.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) vectorFilter.pricePerMonth.$lte = filters.maxPrice;
  }

  if (filters.minRating !== undefined) {
    vectorFilter.ratingAvg = { $gte: filters.minRating };
  }

  return vectorFilter;
}

function buildMongoFilter(filters: RoomAiFilters) {
  const mongoFilter: Record<string, any> = {
    isPublished: true,
    status: ROOM_STATUS.AVAILABLE,
  };

  if (filters.city) mongoFilter.city = createLocationRegex(filters.city);
  if (filters.district) mongoFilter.district = createLocationRegex(filters.district);
  if (filters.roomType) mongoFilter.roomType = filters.roomType;

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    mongoFilter.pricePerMonth = {};
    if (filters.minPrice !== undefined) mongoFilter.pricePerMonth.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) mongoFilter.pricePerMonth.$lte = filters.maxPrice;
  }

  if (filters.minRating !== undefined) {
    mongoFilter.ratingAvg = { $gte: filters.minRating };
  }

  return mongoFilter;
}

function createLocationRegex(value: string) {
  const normalized = normalizeLocation(value);
  const escapedValue = escapeRegex(value);

  if (normalized.match(/^(quan|district)\s+\d+$/)) {
    const districtNumber = normalized.match(/\d+/)?.[0];
    if (districtNumber) {
      return new RegExp(`(quan|quận|district|q)\\s*${districtNumber}\\b`, "i");
    }
  }

  return new RegExp(escapedValue, "i");
}

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isVectorSearchConfigurationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("needs to be indexed as filter") ||
    message.includes("$vectorSearch") ||
    message.includes("PlanExecutor error during aggregation")
  );
}

function getAnswer(aiAnswer: { answer: string }, rooms: RagRoomSearchResult[]) {
  const normalizedAnswer = aiAnswer.answer
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const saysNoData =
    normalizedAnswer.includes("chua co du du lieu") ||
    normalizedAnswer.includes("khong tim thay");

  if (rooms.length > 0 && saysNoData) {
    return `Mình tìm thấy ${rooms.length} phòng phù hợp với dữ liệu hiện có. Bạn có thể xem các gợi ý bên dưới.`;
  }

  return aiAnswer.answer;
}

function buildContext(rooms: RagRoomSearchResult[]) {
  if (rooms.length === 0) {
    return "Khong tim thay phong phu hop trong du lieu hien co.";
  }

  return rooms
    .map((room, index) => {
      return [
        `Phong ${index + 1}`,
        `roomId: ${room._id.toString()}`,
        `Ten phong: ${formatValue(room.title)}`,
        `Gia moi thang: ${formatValue(room.pricePerMonth)}`,
        `Dia chi: ${formatValue(room.address)}`,
        `Thanh pho: ${formatValue(room.city)}`,
        `Quan/Huyen: ${formatValue(room.district)}`,
        `Phuong/Xa: ${formatValue(room.ward)}`,
        `Dien tich: ${formatValue(room.areaSqm)} m2`,
        `Loai phong: ${formatValue(room.roomType)}`,
        `Danh gia trung binh: ${formatValue(room.ratingAvg)}/5`,
        `So luong review: ${formatValue(room.reviewCount)}`,
        `Diem vector: ${formatValue(room.score)}`,
        `Noi dung RAG: ${formatValue(room.ragText)}`,
      ].join("\n");
    })
    .join("\n\n");
}

async function getRoomReviewsForRag(roomId: string) {
  return ReviewModel.find({ roomId, deletedAt: null })
    .sort({ createdAt: -1 })
    .limit(15)
    .select("rating comment landlordReply createdAt")
    .lean();
}

async function fallbackSearchRooms(filters: RoomAiFilters, limit: number) {
  return RoomModel.find(buildMongoFilter(filters))
    .sort({ ratingAvg: -1, reviewCount: -1, createdAt: -1 })
    .limit(limit)
    .select(
      "title description address city district ward pricePerMonth depositAmount areaSqm maxOccupants roomType status ratingAvg reviewCount ragText"
    )
    .lean<RagRoomSearchResult[]>();
}

export const RagRoomService = {
  buildRoomRagText: async (roomId: string): Promise<string> => {
    const room = await RoomModel.findOne({ _id: roomId, deletedAt: null })
      .populate("amenityIds", "name")
      .lean();

    if (!room) {
      throw new Error("Room not found");
    }

    const reviews = await getRoomReviewsForRag(roomId);
    const ratingAvg =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    const amenities = Array.isArray(room.amenityIds)
      ? room.amenityIds
          .map((amenity: any) => amenity?.name)
          .filter(Boolean)
          .join(", ")
      : "";

    const reviewLines = reviews.map((review) => {
      const reply = review.landlordReply ? ` Phan hoi chu nha: ${review.landlordReply}` : "";
      return `- Rating ${review.rating}: ${review.comment}${reply}`;
    });

    return [
      `Ten phong: ${formatValue(room.title)}`,
      `Mo ta: ${formatValue(room.description)}`,
      `Dia chi: ${formatValue(room.address)}`,
      `Thanh pho: ${formatValue(room.city)}`,
      `Quan/Huyen: ${formatValue(room.district)}`,
      `Phuong/Xa: ${formatValue(room.ward)}`,
      `Gia moi thang: ${formatValue(room.pricePerMonth)}`,
      `Tien coc: ${formatValue(room.depositAmount)}`,
      `Dien tich: ${formatValue(room.areaSqm)} m2`,
      `So nguoi toi da: ${formatValue(room.maxOccupants)}`,
      `Loai phong: ${formatValue(room.roomType)}`,
      `Trang thai: ${formatValue(room.status)}`,
      `Tien ich: ${formatValue(amenities)}`,
      `Danh gia trung binh: ${ratingAvg.toFixed(1)}/5`,
      `So luong review: ${reviews.length}`,
      "",
      "Review gan day:",
      reviewLines.length > 0 ? reviewLines.join("\n") : "Chua co review.",
    ].join("\n");
  },

  rebuildRoomEmbedding: async (roomId: string): Promise<void> => {
    const ragText = await RagRoomService.buildRoomRagText(roomId);
    const embedding = await EmbeddingService.embedText(ragText);
    const stats = await ReviewModel.aggregate([
      { $match: { roomId: new Types.ObjectId(roomId), deletedAt: null } },
      {
        $group: {
          _id: "$roomId",
          ratingAvg: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    await RoomModel.findByIdAndUpdate(roomId, {
      $set: {
        ragText,
        embedding,
        ragUpdatedAt: new Date(),
        ratingAvg: stats[0]?.ratingAvg || 0,
        reviewCount: stats[0]?.reviewCount || 0,
      },
    });
  },

  rebuildRoomEmbeddingBestEffort: async (roomId: string): Promise<void> => {
    try {
      await RagRoomService.rebuildRoomEmbedding(roomId);
    } catch (error) {
      console.error("[RagRoomService] rebuildRoomEmbedding failed:", error);
    }
  },

  rebuildPublishedRoomIndex: async (): Promise<{ processed: number; failed: number }> => {
    const rooms = await RoomModel.find({
      isPublished: true,
      deletedAt: null,
    }).select("_id");

    let processed = 0;
    let failed = 0;

    for (const room of rooms) {
      try {
        await RagRoomService.rebuildRoomEmbedding(room._id.toString());
        processed += 1;
      } catch (error) {
        failed += 1;
        console.error(`[RagRoomService] Failed to rebuild room ${room._id.toString()}:`, error);
      }
    }

    return { processed, failed };
  },

  searchRoomsWithRag: async (question: string, filters: RoomAiFilters) => {
    const startedAt = Date.now();
    const limit = Math.min(Math.max(filters.limit || 5, 1), 10);
    const queryVector = await EmbeddingService.embedText(question);
    const vectorFilter = buildVectorFilter(filters);
    const numCandidates = Math.max(limit * 20, 100);
    let source: "vector" | "fallback" = "vector";

    let rooms: RagRoomSearchResult[] = [];

    try {
      rooms = await RoomModel.aggregate<RagRoomSearchResult>([
        {
          $vectorSearch: {
            index: process.env.MONGODB_ROOM_VECTOR_INDEX || "room_vector_index",
            path: "embedding",
            queryVector,
            numCandidates,
            limit,
            filter: vectorFilter,
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            address: 1,
            city: 1,
            district: 1,
            ward: 1,
            pricePerMonth: 1,
            depositAmount: 1,
            areaSqm: 1,
            maxOccupants: 1,
            roomType: 1,
            status: 1,
            ratingAvg: 1,
            reviewCount: 1,
            ragText: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ]);
    } catch (error) {
      if (!isVectorSearchConfigurationError(error)) {
        throw error;
      }

      source = "fallback";
      console.warn("[RagRoomService] vector search unavailable, using fallback search:", error);
      rooms = await fallbackSearchRooms(filters, limit);
    }

    if (rooms.length === 0) {
      source = "fallback";
      rooms = await fallbackSearchRooms(filters, limit);
    }

    const context = buildContext(rooms);
    const aiAnswer = await GeminiService.generateRoomSearchAnswer({
      question,
      context,
    });
    const latencyMs = Date.now() - startedAt;

    console.info("[RagRoomService] searchRoomsWithRag", {
      filters,
      source,
      roomIds: rooms.map((room) => room._id.toString()),
      latencyMs,
    });

    return {
      answer: getAnswer(aiAnswer, rooms),
      rooms: aiAnswer.rooms,
      missingInfo: aiAnswer.missingInfo,
      matches: rooms,
      filters,
      source,
      latencyMs,
    };
  },
};
