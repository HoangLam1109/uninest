import { ContractRepository } from "../repositories/contract.repo.js";
import { BookingRepository } from "../repositories/booking.repo.js";
import { RoomRepository } from "../repositories/room.repo.js";
import { CONTRACT_STATUS } from "../models/Contract.model.js";
import { BOOKING_STATUS } from "../models/Booking.model.js";
import { ROOM_STATUS } from "../models/Room.model.js";

export const ContractService = {
  createContractFromBooking: async (
    bookingId: string,
    landlordId: string,
    contractData: {
      monthlyRent: number;
      depositAmount?: number;
      terms?: string;
      contractFileUrl?: string;
      startDate?: Date;
    }
  ) => {
    // Fetch booking
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify booking is APPROVED
    if (booking.status !== BOOKING_STATUS.APPROVED) {
      throw new Error(
        `Cannot create contract from booking with status: ${booking.status}`
      );
    }

    // Verify landlord owns the room
    if ((booking.roomId as any).landlordId.toString() !== landlordId) {
      throw new Error("You do not own this room");
    }

    // Check if contract already exists for this booking
    const existingContract = await ContractRepository.findByBookingId(bookingId);
    if (existingContract) {
      throw new Error("Contract already exists for this booking");
    }

    // Create contract
    const contract = await ContractRepository.create({
      bookingId,
      landlordId,
      tenantId: booking.tenantId,
      monthlyRent: contractData.monthlyRent,
      depositAmount: contractData.depositAmount,
      terms: contractData.terms,
      contractFileUrl: contractData.contractFileUrl,
      startDate: contractData.startDate || new Date(),
      status: CONTRACT_STATUS.DRAFT,
    });

    return contract;
  },

  getContractById: async (id: string, userId: string) => {
    const contract = await ContractRepository.findById(id);
    if (!contract) {
      throw new Error("Contract not found");
    }

    // Verify user is landlord or tenant
    const isLandlord = contract.landlordId._id.toString() === userId;
    const isTenant = contract.tenantId._id.toString() === userId;

    if (!isLandlord && !isTenant) {
      throw new Error("You do not have access to this contract");
    }

    return contract;
  },

  getContractsByLandlord: async (
    landlordId: string,
    skip: number,
    limit: number
  ) => {
    const [contracts, total] = await Promise.all([
      ContractRepository.findByLandlordId(landlordId, skip, limit),
      ContractRepository.countByLandlordId(landlordId),
    ]);

    return { contracts, total };
  },

  getContractsByTenant: async (
    tenantId: string,
    skip: number,
    limit: number
  ) => {
    const [contracts, total] = await Promise.all([
      ContractRepository.findByTenantId(tenantId, skip, limit),
      ContractRepository.countByTenantId(tenantId),
    ]);

    return { contracts, total };
  },

  updateContract: async (
    contractId: string,
    landlordId: string,
    updateData: {
      monthlyRent?: number;
      depositAmount?: number;
      terms?: string;
      contractFileUrl?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) => {
    const contract = await ContractRepository.findById(contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    // Only allow updates on DRAFT status
    if (contract.status !== CONTRACT_STATUS.DRAFT) {
      throw new Error(
        `Cannot update contract with status: ${contract.status}`
      );
    }

    // Verify landlord ownership
    if (contract.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this contract");
    }

    // Prevent updating sensitive fields
    const cleanData = { ...updateData };
    delete (cleanData as any).status;
    delete (cleanData as any).signedAt;

    const updated = await ContractRepository.update(contractId, cleanData);
    return updated;
  },

  activateContract: async (contractId: string, landlordId: string) => {
    const contract = await ContractRepository.findById(contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    // Verify landlord ownership
    if (contract.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this contract");
    }

    // Only allow activation from DRAFT status
    if (contract.status !== CONTRACT_STATUS.DRAFT) {
      throw new Error(
        `Cannot activate contract with status: ${contract.status}`
      );
    }

    const updated = await ContractRepository.update(contractId, {
      status: CONTRACT_STATUS.ACTIVE,
      signedAt: new Date(),
    });

    return updated;
  },

  terminateContract: async (contractId: string, landlordId: string) => {
    const contract = await ContractRepository.findById(contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    // Verify landlord ownership
    if (contract.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this contract");
    }

    // Only allow termination from ACTIVE or DRAFT status
    if (![CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.DRAFT].includes(contract.status)) {
      throw new Error(
        `Cannot terminate contract with status: ${contract.status}`
      );
    }

    // If ACTIVE contract, revert room status and cancel booking
    if (contract.status === CONTRACT_STATUS.ACTIVE) {
      const booking = await BookingRepository.findById(
        contract.bookingId.toString()
      );
      if (booking) {
        // Revert room status from RENTED back to AVAILABLE
        await RoomRepository.update(
          booking.roomId._id.toString(),
          landlordId,
          { status: ROOM_STATUS.AVAILABLE }
        );
        // Cancel the booking
        await BookingRepository.update(booking._id.toString(), {
          status: BOOKING_STATUS.CANCELLED,
        });
      }
    }

    const updated = await ContractRepository.softDelete(contractId);
    return updated;
  },

  renewContract: async (
    contractId: string,
    landlordId: string,
    renewalData: {
      monthlyRent?: number;
      depositAmount?: number;
      startDate: Date;
      endDate?: Date;
      terms?: string;
      contractFileUrl?: string;
    }
  ) => {
    const originalContract = await ContractRepository.findById(contractId);
    if (!originalContract) {
      throw new Error("Contract not found");
    }

    // Verify landlord ownership
    if (originalContract.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this contract");
    }

    // Create new contract as renewal
    const renewalContract = await ContractRepository.create({
      bookingId: originalContract.bookingId,
      landlordId: originalContract.landlordId,
      tenantId: originalContract.tenantId,
      renewalFromId: contractId,
      monthlyRent: renewalData.monthlyRent || originalContract.monthlyRent,
      depositAmount: renewalData.depositAmount || originalContract.depositAmount,
      terms: renewalData.terms || originalContract.terms,
      contractFileUrl: renewalData.contractFileUrl || originalContract.contractFileUrl,
      startDate: renewalData.startDate,
      endDate: renewalData.endDate,
      status: CONTRACT_STATUS.DRAFT,
    });

    return renewalContract;
  },
};
