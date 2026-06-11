import { BookingRepository } from "../repositories/booking.repo.js";
import { RoomRepository } from "../repositories/room.repo.js";
import { IdentityRepository } from "../repositories/identity.repo.js";
import { BOOKING_STATUS } from "../models/Booking.model.js";
import { IDENTITY_STATUS } from "../models/Identity.model.js";
import { ROOM_STATUS } from "../models/Room.model.js";

export const BookingService = {
  createBooking: async (
    roomId: string,
    tenantId: string,
    identityIds: string[],
    checkInDate: Date,
    checkOutDate?: Date,
    notes?: string
  ) => {
    // Verify room exists and is AVAILABLE
    const room = await RoomRepository.findById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status !== ROOM_STATUS.AVAILABLE) {
      throw new Error(
        `Room is not available. Current status: ${room.status}`
      );
    }

    // Verify all identities exist and belong to tenant
    for (const id of identityIds) {
      const identity = await IdentityRepository.findById(id);
      if (!identity) {
        throw new Error(`Identity profile ${id} not found`);
      }
      if (identity.userId._id.toString() !== tenantId) {
        throw new Error(`Identity profile ${id} does not belong to you`);
      }
      if (identity.status === IDENTITY_STATUS.REJECTED) {
        throw new Error(`Identity profile ${id} has been rejected. Please create a new one.`);
      }
    }

    // Check if tenant already has pending/approved booking for this room
    const existingBooking = await BookingRepository.findByRoomAndTenant(
      roomId,
      tenantId
    );
    if (existingBooking) {
      throw new Error(
        "You already have an active booking for this room"
      );
    }

    // Check if room has active approved booking
    const activeBookingCount = await BookingRepository.countActiveBookingsByRoom(
      roomId
    );
    if (activeBookingCount > 0) {
      throw new Error("Room is already booked");
    }

    // Calculate total price if checkout date provided
    let totalPrice: number | undefined;
    if (checkOutDate) {
      const days = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      totalPrice = room.pricePerMonth * days;
    }

    const booking = await BookingRepository.create({
      roomId,
      tenantId,
      identityIds,
      checkInDate,
      checkOutDate,
      totalPrice,
      notes,
      status: BOOKING_STATUS.PENDING,
      isCurrent: true,
    });

    return booking;
  },

  getBookingById: async (id: string) => {
    return await BookingRepository.findById(id);
  },

  getTenantBookings: async (tenantId: string, skip: number, limit: number) => {
    const [bookings, total] = await Promise.all([
      BookingRepository.findByTenantId(tenantId, skip, limit),
      BookingRepository.countByTenantId(tenantId),
    ]);

    return { bookings, total };
  },

  getLandlordBookings: async (
    landlordId: string,
    roomIds: string[],
    skip: number,
    limit: number
  ) => {
    if (roomIds.length === 0) {
      return { bookings: [], total: 0 };
    }

    const [bookings, total] = await Promise.all([
      BookingRepository.findByLandlordRoomIds(roomIds, skip, limit),
      BookingRepository.countByLandlordRoomIds(roomIds),
    ]);

    return { bookings, total };
  },

  approveBooking: async (bookingId: string, landlordId: string) => {
    // Fetch booking with room details
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify landlord owns the room
    if ((booking.roomId as any).landlordId.toString() !== landlordId) {
      throw new Error("You do not own this room");
    }

    // Verify booking is pending
    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new Error(
        `Cannot approve booking with status: ${booking.status}`
      );
    }

    // Update booking status
    const updatedBooking = await BookingRepository.update(bookingId, {
      status: BOOKING_STATUS.APPROVED,
    });

    // Update room status to DEPOSITED (đã cọc)
    await RoomRepository.update(
      booking.roomId._id.toString(),
      landlordId,
      { status: ROOM_STATUS.DEPOSITED }
    );

    // Verify all tenant's identities
    const identities = (booking as any).identityIds || [];
    for (const identity of identities) {
      const identityId = identity._id || identity;
      await IdentityRepository.update(identityId.toString(), {
        status: IDENTITY_STATUS.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: landlordId,
      });
    }

    return updatedBooking;
  },

  rejectBooking: async (bookingId: string, landlordId: string) => {
    // Fetch booking
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify landlord owns the room
    if ((booking.roomId as any).landlordId.toString() !== landlordId) {
      throw new Error("You do not own this room");
    }

    // Verify booking is pending
    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new Error(
        `Cannot reject booking with status: ${booking.status}`
      );
    }

    // Update booking status
    const updated = await BookingRepository.update(bookingId, {
      status: BOOKING_STATUS.REJECTED,
    });

    // Reject all identities
    const identities = (booking as any).identityIds || [];
    for (const identity of identities) {
      const identityId = identity._id || identity;
      await IdentityRepository.update(identityId.toString(), {
        status: IDENTITY_STATUS.REJECTED,
        verifiedBy: landlordId,
      });
    }

    return updated;
  },

  cancelBooking: async (bookingId: string, tenantId: string) => {
    // Fetch booking
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify tenant owns the booking
    if (booking.tenantId._id.toString() !== tenantId) {
      throw new Error("This is not your booking");
    }

    // Only allow cancellation of PENDING or APPROVED bookings
    if (![BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED].includes(booking.status)) {
      throw new Error(
        `Cannot cancel booking with status: ${booking.status}`
      );
    }

    // If booking was approved, revert room status back to AVAILABLE
    if (booking.status === BOOKING_STATUS.APPROVED) {
      await RoomRepository.update(
        booking.roomId._id.toString(),
        (booking.roomId as any).landlordId.toString(),
        { status: ROOM_STATUS.AVAILABLE }
      );
    }

    // Update booking status
    return await BookingRepository.update(bookingId, {
      status: BOOKING_STATUS.CANCELLED,
    });
  },

  deleteBookingByLandlord: async (bookingId: string, landlordId: string) => {
    // Fetch booking
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify landlord owns the room
    if ((booking.roomId as any).landlordId.toString() !== landlordId) {
      throw new Error("You do not own this room");
    }

    // Soft delete
    return await BookingRepository.softDelete(bookingId);
  },
};
