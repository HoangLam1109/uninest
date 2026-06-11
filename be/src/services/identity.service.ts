import { IdentityRepository } from "../repositories/identity.repo.js";
import { BookingRepository } from "../repositories/booking.repo.js";
import { IDENTITY_STATUS } from "../models/Identity.model.js";

export const IdentityService = {
  /**
   * Tenant tạo hồ sơ định danh
   */
  createIdentity: async (userId: string, data: {
    fullName: string;
    dateOfBirth: Date;
    phone: string;
    cccdNumber: string;
    cccdFrontImage: string;
    cccdBackImage: string;
    coTenants?: { fullName: string; dateOfBirth?: Date; phone?: string; cccdNumber?: string }[];
  }) => {
    // Check if cccdNumber is already used
    const existing = await IdentityRepository.findByCccdNumber(data.cccdNumber);
    if (existing) {
      throw new Error("CCCD number is already registered");
    }

    const identity = await IdentityRepository.create({
      userId,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      phone: data.phone,
      cccdNumber: data.cccdNumber,
      cccdFrontImage: data.cccdFrontImage,
      cccdBackImage: data.cccdBackImage,
      coTenants: data.coTenants || [],
      status: IDENTITY_STATUS.PENDING_VERIFICATION,
    });

    return identity;
  },

  getIdentityById: async (id: string, userId: string) => {
    const identity = await IdentityRepository.findById(id);
    if (!identity) throw new Error("Identity not found");

    // Owner can always view
    const isOwner = identity.userId._id.toString() === userId;
    if (isOwner) return identity;

    // Landlord: check if there's a booking with this identity where
    // the room belongs to this landlord
    const bookings = await BookingRepository.findByIdentityIds([id]);
    for (const booking of bookings) {
      const room = booking.roomId as any;
      const roomLandlordId = room?.landlordId?.toString?.() ?? room?.landlordId;
      if (roomLandlordId === userId) return identity;
    }

    throw new Error("You do not have access to this identity");
  },

  getMyIdentities: async (userId: string) => {
    return IdentityRepository.findByUserId(userId);
  },

  updateIdentity: async (id: string, userId: string, data: {
    fullName?: string;
    dateOfBirth?: Date;
    phone?: string;
    cccdFrontImage?: string;
    cccdBackImage?: string;
    coTenants?: { fullName: string; dateOfBirth?: Date; phone?: string; cccdNumber?: string }[];
  }) => {
    const identity = await IdentityRepository.findById(id);
    if (!identity) throw new Error("Identity not found");

    if (identity.userId._id.toString() !== userId) {
      throw new Error("You do not own this identity");
    }

    if (identity.status !== IDENTITY_STATUS.PENDING_VERIFICATION) {
      throw new Error("Cannot update identity that has been verified or rejected");
    }

    // Don't allow changing cccdNumber after creation
    const cleanData = { ...data };
    delete (cleanData as any).cccdNumber;

    return IdentityRepository.update(id, cleanData);
  },

  /**
   * Verify identity (called internally when booking is approved)
   */
  verifyIdentity: async (identityId: string, landlordId: string) => {
    const identity = await IdentityRepository.findById(identityId);
    if (!identity) throw new Error("Identity not found");

    if (identity.status !== IDENTITY_STATUS.PENDING_VERIFICATION) {
      throw new Error(`Cannot verify identity with status: ${identity.status}`);
    }

    return IdentityRepository.update(identityId, {
      status: IDENTITY_STATUS.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: landlordId,
    });
  },

  /**
   * Reject identity (called internally when booking is rejected)
   */
  rejectIdentity: async (identityId: string, landlordId: string) => {
    const identity = await IdentityRepository.findById(identityId);
    if (!identity) throw new Error("Identity not found");

    return IdentityRepository.update(identityId, {
      status: IDENTITY_STATUS.REJECTED,
      verifiedBy: landlordId,
    });
  },
};
