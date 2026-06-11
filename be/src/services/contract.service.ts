import { ContractRepository } from "../repositories/contract.repo.js";
import { BookingRepository } from "../repositories/booking.repo.js";
import { IdentityRepository } from "../repositories/identity.repo.js";
import { RoomRepository } from "../repositories/room.repo.js";
import { CONTRACT_STATUS } from "../models/Contract.model.js";
import { BOOKING_STATUS } from "../models/Booking.model.js";
import { IDENTITY_STATUS } from "../models/Identity.model.js";
import { ROOM_STATUS } from "../models/Room.model.js";
import { PDFDocument } from "pdf-lib";
import {
  openPdfFromGridFs,
  openPdfFromUrl,
  uploadPdfToGridFs,
} from "../config/gridfs.config.js";

function getDataUrlBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!match?.[2]) {
    throw new Error("Invalid signature image");
  }

  return {
    format: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function uploadSignedPdf(buffer: Buffer, contractId: string) {
  const filename = `${contractId}-${Date.now()}.pdf`;
  return uploadPdfToGridFs(filename, buffer, { contractId, type: "signed" });
}

async function createSignedContractPdf(
  contractFileUrl: string,
  tenantSignatureDataUrl: string,
  contractId: string
) {
  const response = await fetch(contractFileUrl);
  if (!response.ok) {
    throw new Error("Cannot download contract PDF");
  }

  const pdfBytes = await response.arrayBuffer();
  const pdfDocument = await PDFDocument.load(pdfBytes);
  const pages = pdfDocument.getPages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("Contract PDF has no pages");
  }

  const signature = getDataUrlBuffer(tenantSignatureDataUrl);
  const signatureImage =
    signature.format === "png"
      ? await pdfDocument.embedPng(signature.buffer)
      : await pdfDocument.embedJpg(signature.buffer);
  const signatureWidth = 160;
  const signatureHeight =
    (signatureImage.height / signatureImage.width) * signatureWidth;
  const { width } = page.getSize();

  page.drawImage(signatureImage, {
    x: Math.max(width - signatureWidth - 72, 36),
    y: 48,
    width: signatureWidth,
    height: signatureHeight,
  });

  const signedPdfBytes = await pdfDocument.save();
  return uploadSignedPdf(Buffer.from(signedPdfBytes), contractId);
}

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
      endDate?: Date;
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

    // Fetch verified identities for tenant info
    const identityIds = (booking as any).identityIds || [];
    if (!identityIds.length) {
      throw new Error("No identity profiles found for this booking");
    }

    // Verify at least one identity is VERIFIED
    const identities = await Promise.all(
      identityIds.map((id: any) => IdentityRepository.findById(id._id || id.toString()))
    );
    const verifiedIdentity = identities.find((id) => id && id.status === IDENTITY_STATUS.VERIFIED);
    if (!verifiedIdentity) {
      throw new Error("No verified identity found. Please verify at least one identity first.");
    }

    // Create contract with auto-filled tenant info from identity
    const contract = await ContractRepository.create({
      bookingId,
      landlordId,
      tenantId: booking.tenantId,
      monthlyRent: contractData.monthlyRent,
      depositAmount: contractData.depositAmount,
      terms: contractData.terms,
      contractFileUrl: contractData.contractFileUrl,
      startDate: contractData.startDate || new Date(),
      endDate: contractData.endDate,
      status: CONTRACT_STATUS.DRAFT,
    });

    return {
      contract,
      tenantIdentity: {
        fullName: verifiedIdentity.fullName,
        dateOfBirth: verifiedIdentity.dateOfBirth,
        phone: verifiedIdentity.phone,
        cccdNumber: verifiedIdentity.cccdNumber,
        cccdFrontImage: verifiedIdentity.cccdFrontImage,
        cccdBackImage: verifiedIdentity.cccdBackImage,
        coTenants: verifiedIdentity.coTenants,
      },
    };
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

    // Only allow sending from DRAFT status
    if (contract.status !== CONTRACT_STATUS.DRAFT) {
      throw new Error(
        `Cannot activate contract with status: ${contract.status}`
      );
    }

    const updated = await ContractRepository.update(contractId, {
      status: CONTRACT_STATUS.PENDING_TENANT_SIGNATURE,
    });

    return updated;
  },

  confirmContractByTenant: async (
    contractId: string,
    tenantId: string,
    signatureData: {
      tenantSignatureDataUrl: string;
    }
  ) => {
    const contract = await ContractRepository.findById(contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    if (contract.tenantId._id.toString() !== tenantId) {
      throw new Error("You do not have access to this contract");
    }

    if (contract.status !== CONTRACT_STATUS.PENDING_TENANT_SIGNATURE) {
      throw new Error(
        `Cannot confirm contract with status: ${contract.status}`
      );
    }

    if (!signatureData.tenantSignatureDataUrl) {
      throw new Error("Tenant signature is required");
    }

    const signedContractStorageKey = contract.contractFileUrl
      ? await createSignedContractPdf(
          contract.contractFileUrl,
          signatureData.tenantSignatureDataUrl,
          contractId
        )
      : undefined;

    const updateData: any = {
      status: CONTRACT_STATUS.ACTIVE,
      signedAt: new Date(),
      tenantConfirmedAt: new Date(),
      tenantSignatureDataUrl: signatureData.tenantSignatureDataUrl,
    };

    if (signedContractStorageKey) {
      updateData.signedContractStorageKey = signedContractStorageKey;
      delete updateData.signedContractFileUrl;
    }

    const updated = await ContractRepository.update(contractId, updateData);

    // Update room status from DEPOSITED to RENTED when contract becomes active
    const bookingId = (contract.bookingId as any)._id?.toString() ?? contract.bookingId.toString();

    const booking = await BookingRepository.findById(bookingId);
    if (booking) {
      const roomId = (booking.roomId as any)._id?.toString() ?? booking.roomId.toString();

      await RoomRepository.update(
        roomId,
        contract.landlordId._id.toString(),
        { status: ROOM_STATUS.RENTED }
      );

      // Sync verified identities to room's tenant list
      const identityIds = (booking as any).identityIds || [];
      const identities = await Promise.all(
        identityIds.map((id: any) => IdentityRepository.findById(id._id || id.toString()))
      );
      const verifiedIdentities = identities.filter(
        (id) => id && id.status === IDENTITY_STATUS.VERIFIED
      );

      if (verifiedIdentities.length > 0) {
        const existingTenantIds = new Set(
          ((booking.roomId as any).tenants || []).map((t: any) =>
            (t.tenantId?._id || t.tenantId).toString()
          )
        );

        const newTenants = verifiedIdentities
          .filter((identity) => !existingTenantIds.has(identity!.userId._id.toString()))
          .map((identity, index) => ({
            tenantId: identity!.userId._id,
            isPrimaryTenant: index === 0,
          }));

        if (newTenants.length > 0) {
          await RoomRepository.addTenants(roomId, contract.landlordId._id.toString(), newTenants);
        }
      }
    }

    return updated;
  },

  getContractFile: async (contractId: string, userId: string) => {
    const contract = await ContractRepository.findById(contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    const isLandlord = contract.landlordId._id.toString() === userId;
    const isTenant = contract.tenantId._id.toString() === userId;

    if (!isLandlord && !isTenant) {
      throw new Error("You do not have access to this contract");
    }

    if (contract.signedContractStorageKey) {
      return openPdfFromGridFs(contract.signedContractStorageKey);
    }

    const fileUrl = contract.signedContractFileUrl ?? contract.contractFileUrl;
    if (!fileUrl) {
      throw new Error("Contract file not found");
    }

    return openPdfFromUrl(fileUrl);
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

    // Allow termination from DRAFT, PENDING_TENANT_SIGNATURE, or ACTIVE status
    if (
      ![CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.DRAFT, CONTRACT_STATUS.PENDING_TENANT_SIGNATURE].includes(
        contract.status
      )
    ) {
      throw new Error(
        `Cannot terminate contract with status: ${contract.status}`
      );
    }

    // If contract is not DRAFT, revert booking and room
    if (contract.status !== CONTRACT_STATUS.DRAFT) {
      const bookingId = (contract.bookingId as any)._id?.toString() ?? contract.bookingId.toString();

      const booking = await BookingRepository.findById(bookingId);
      if (booking) {
        const roomId = (booking.roomId as any)._id?.toString() ?? booking.roomId.toString();

        await RoomRepository.update(
          roomId,
          landlordId,
          { status: ROOM_STATUS.AVAILABLE }
        );
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
