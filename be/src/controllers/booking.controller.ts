import type { Request, Response } from "express";
import mongoose from "mongoose";
import { BookingService } from "../services/booking.service.js";
import { RoomRepository } from "../repositories/room.repo.js";

/**
 * CREATE BOOKING (Tenant)
 */
export const createBooking = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { roomId, checkInDate, identityIds, notes } = req.body;
    
    if (!roomId || !checkInDate) {
      return res.status(400).json({
        success: false,
        message: "Room ID and viewing date are required",
      });
    }

    if (!identityIds || !Array.isArray(identityIds) || identityIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one identity profile (identityIds) is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId as string))
      return res.status(400).json({ success: false, message: "Invalid room id" });

    for (const id of identityIds) {
      if (!mongoose.Types.ObjectId.isValid(id as string))
        return res.status(400).json({ success: false, message: `Invalid identity id: ${id}` });
    }

    const booking = await BookingService.createBooking(
      roomId,
      tenantId,
      identityIds,
      new Date(checkInDate),
      notes
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * GET TENANT'S BOOKINGS
 */
export const getTenantBookings = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { bookings, total } = await BookingService.getTenantBookings(
      tenantId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET LANDLORD'S BOOKINGS (for their rooms)
 */
export const getLandlordBookings = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10, status } = req.query;

    // Get all room IDs owned by landlord
    const rooms = await RoomRepository.findAll(
      { landlordId },
      0,
      1000
    );
    const roomIds = rooms.map((room: any) => room._id.toString());

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { bookings, total } = await BookingService.getLandlordBookings(
      landlordId,
      roomIds,
      skip,
      limitNumber
    );

    // Optional filtering by status
    let filteredBookings = bookings;
    if (status) {
      filteredBookings = bookings.filter((b: any) => b.status === status);
    }

    return res.json({
      success: true,
      data: filteredBookings,
      pagination: {
        total: filteredBookings.length,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(filteredBookings.length / limitNumber),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * APPROVE BOOKING (Landlord)
 */
export const approveBooking = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    const { id: bookingId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(bookingId as string))
      return res.status(400).json({ success: false, message: "Invalid booking id" });

    const booking = await BookingService.approveBooking(bookingId as string, landlordId);

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    return res.json({
      success: true,
      message: "Booking approved successfully",
      data: booking,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * REJECT BOOKING (Landlord)
 */
export const rejectBooking = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    const { id: bookingId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(bookingId as string))
      return res.status(400).json({ success: false, message: "Invalid booking id" });

    const booking = await BookingService.rejectBooking(bookingId as string, landlordId);

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    return res.json({
      success: true,
      message: "Booking rejected successfully",
      data: booking,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * CANCEL BOOKING (Tenant)
 */
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    const { id: bookingId } = req.params;

    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(bookingId as string))
      return res.status(400).json({ success: false, message: "Invalid booking id" });

    const booking = await BookingService.cancelBooking(bookingId as string, tenantId);

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    return res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("not your booking")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * DELETE BOOKING (Landlord - soft delete)
 */
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    const { id: bookingId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(bookingId as string))
      return res.status(400).json({ success: false, message: "Invalid booking id" });

    const booking = await BookingService.deleteBookingByLandlord(bookingId as string, landlordId);

    return res.json({
      success: true,
      message: "Booking deleted successfully",
      data: booking,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not own")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * GET BOOKING BY ID
 */
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id: bookingId } = req.params;
    const userId = req.userId;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(bookingId as string))
      return res.status(400).json({ success: false, message: "Invalid booking id" });

    const booking = await BookingService.getBookingById(bookingId as string);

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    // Verify user is tenant or landlord of the booking
    const isTenant = booking.tenantId._id.toString() === userId;
    const isLandlord =
      (booking.roomId as any).landlordId.toString() === userId;

    if (!isTenant && !isLandlord) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: booking });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
