import { RoomRepository } from "../repositories/room.repo.js";
import { RoomImageRepository } from "../repositories/room-image.repo.js";
import { IdentityRepository } from "../repositories/identity.repo.js";
import { Types } from "mongoose";
import { ROOM_STATUS, type ITenantRef } from "../models/Room.model.js";
import { AmenityModel } from "../models/Amenity.model.js";
import { RagRoomService } from "./rag-room.service.js";

/**
 * Validate tenants array against business rules:
 * - At most one primary tenant
 * - Number of tenants cannot exceed maxOccupants
 */
const validateTenants = (tenants: ITenantRef[], maxOccupants: number): void => {
  if (!tenants || tenants.length === 0) return;

  // Only one primary tenant allowed
  const primaryCount = tenants.filter((t) => t.isPrimaryTenant).length;
  if (primaryCount > 1) {
    throw new Error("Only one tenant can be the primary tenant");
  }

  // Tenants cannot exceed maxOccupants
  if (tenants.length > maxOccupants) {
    throw new Error(
      `Number of tenants (${tenants.length}) cannot exceed max occupants (${maxOccupants})`
    );
  }
};

const ROOM_RAG_FIELDS = new Set([
  "title",
  "description",
  "address",
  "city",
  "district",
  "ward",
  "pricePerMonth",
  "depositAmount",
  "areaSqm",
  "maxOccupants",
  "roomType",
  "status",
  "isPublished",
  "amenityIds",
]);

const shouldRebuildRoomRag = (data: Record<string, unknown>) => {
  return Object.keys(data).some((key) => ROOM_RAG_FIELDS.has(key));
};

const validateAmenityIds = async (amenityIds?: unknown) => {
  if (amenityIds === undefined) return;
  if (!Array.isArray(amenityIds)) {
    throw new Error("amenityIds must be an array");
  }

  const invalidAmenityId = amenityIds.find(
    (amenityId) => typeof amenityId !== "string" || !Types.ObjectId.isValid(amenityId)
  );
  if (invalidAmenityId) {
    throw new Error(`Invalid amenity id: ${invalidAmenityId}`);
  }

  if (amenityIds.length === 0) return;

  const existingCount = await AmenityModel.countDocuments({
    _id: { $in: amenityIds },
  });

  if (existingCount !== amenityIds.length) {
    throw new Error("One or more amenities do not exist");
  }
};

export const RoomService = {
  createRoom: async (data: any, landlordId: string) => {
    const tenants: ITenantRef[] = data.tenants ?? [];
    const maxOccupants = data.maxOccupants ?? 1;
    validateTenants(tenants, maxOccupants);
    await validateAmenityIds(data.amenityIds);

    const room = await RoomRepository.create({
      ...data,
      landlordId,
      status: ROOM_STATUS.AVAILABLE,
    });

    if (room.isPublished) {
      void RagRoomService.rebuildRoomEmbeddingBestEffort(room._id.toString());
    }

    return room;
  },

  getAllRooms: async (filter: any, skip: number, limit: number) => {
    const [rooms, total] = await Promise.all([
      RoomRepository.findAll(filter, skip, limit),
      RoomRepository.count(filter),
    ]);

    return { rooms, total };
  },

  searchRooms: async (keyword: any, skip: number, limit: number) => {
    const [rooms, total] = await Promise.all([
      RoomRepository.search(keyword, skip, limit),
      RoomRepository.countSearch(keyword),
    ]);

    return { rooms, total };
  },

  getRoomById: async (id: string, landlordId?: string) => {
    return await RoomRepository.findById(id, landlordId);
  },

  updateRoom: async (id: string, landlordId: string, data: any) => {
    // Strip internal/system fields that should never be directly updated
    const {
      tenants,
      embedding: _embedding,
      deletedAt: _deletedAt,
      landlordId: _landlordId,
      ...allowedFields
    } = data;
    await validateAmenityIds(allowedFields.amenityIds);

    // Validate tenants if present in update data
    if (tenants !== undefined) {
      let maxOccupants = allowedFields.maxOccupants;
      if (maxOccupants === undefined) {
        const currentRoom = await RoomRepository.findById(id, landlordId);
        maxOccupants = currentRoom?.maxOccupants ?? 1;
      }
      validateTenants(tenants, maxOccupants);
      (allowedFields as any).tenants = tenants;
    }

    const room = await RoomRepository.update(id, landlordId, allowedFields);

    if (room && shouldRebuildRoomRag(allowedFields)) {
      void RagRoomService.rebuildRoomEmbeddingBestEffort(room._id.toString());
    }

    return room;
  },

  deleteRoom: async (id: string, landlordId: string) => {
    return await RoomRepository.delete(id, landlordId);
  },

  // Publish/Unpublish
  publishRoom: async (id: string, landlordId: string) => {
    const room = await RoomRepository.update(id, landlordId, { isPublished: true });
    if (room) {
      void RagRoomService.rebuildRoomEmbeddingBestEffort(room._id.toString());
    }
    return room;
  },

  unpublishRoom: async (id: string, landlordId: string) => {
    return await RoomRepository.update(id, landlordId, { isPublished: false });
  },

  // Room Images
  uploadRoomImage: async (roomId: string, imageData: any) => {
    const existingImageCount = await RoomImageRepository.countByRoomId(roomId);

    return await RoomImageRepository.create({
      roomId,
      url: imageData.url,
      publicId: imageData.publicId,
      caption: imageData.caption,
      order: imageData.order || 0,
      isPrimary: imageData.isPrimary || existingImageCount === 0,
    });
  },

  getRoomImages: async (roomId: string) => {
    return await RoomImageRepository.findByRoomId(roomId);
  },

  deleteRoomImage: async (imageId: string, roomId: string) => {
    return await RoomImageRepository.delete(imageId, roomId);
  },

  updateRoomImage: async (imageId: string, roomId: string, updateData: any) => {
    return await RoomImageRepository.update(imageId, roomId, updateData);
  },

  setPrimaryImage: async (imageId: string, roomId: string) => {
    return await RoomImageRepository.setPrimaryImage(roomId, imageId);
  },
  getTenantListByLandlord : async (landlordId: string) => {
    const rooms =
      await RoomRepository.getTenantListByLandlord(landlordId);

    const seen = new Set<string>();
    const results: any[] = [];

    for (const room of rooms as any[]) {
      for (const tenant of room.tenants) {
        const user = tenant.tenantId;
        if (!user) continue;

        const userId = user._id.toString();

        // Skip if this tenant has already been added (avoid duplicates
        // when the same tenant rents multiple rooms from the same landlord)
        if (seen.has(userId)) continue;
        seen.add(userId);

        // Fetch verified identity for this user
        const identity = await IdentityRepository.findVerifiedByUserId(userId);

        results.push({
          tenantId: user._id,
          tenantName: identity?.fullName || user.fullName,
          tenantEmail: user.email,
          tenantPhone: identity?.phone || user.phone,
          tenantAvatarUrl: user.avatarUrl,
          isPrimaryTenant: tenant.isPrimaryTenant,
          cccdNumber: identity?.cccdNumber || '',
          cccdFrontImage: identity?.cccdFrontImage || '',
          cccdBackImage: identity?.cccdBackImage || '',
          dateOfBirth: identity?.dateOfBirth || '',
          roomTitle: room.title,
          address: room.address,
        });
      }
    }

    return results;
  }
};
