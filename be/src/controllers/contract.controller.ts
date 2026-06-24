import type { Request, Response } from "express";
import mongoose from "mongoose";
import { ContractService } from "../services/contract.service.js";

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * CREATE CONTRACT FROM BOOKING (Landlord)
 */
export const createContractFromBooking = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      bookingId,
      monthlyRent,
      depositAmount,
      terms,
      contractFileUrl,
      startDate,
      endDate,
    } = req.body;
    const contractFile = req.file;

    if (!bookingId || !monthlyRent) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and monthly rent are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId as string))
      return res.status(400).json({ success: false, message: "Invalid booking id" });

    const contractData: any = {
      monthlyRent: Number(monthlyRent),
      depositAmount: toOptionalNumber(depositAmount),
      terms,
      contractFileUrl,
    };
    if (contractFile) {
      contractData.contractFileStorageKey = await ContractService.uploadContractPdf(
        contractFile,
        bookingId,
        "draft"
      );
      delete contractData.contractFileUrl;
    }
    if (startDate) contractData.startDate = new Date(startDate);
    if (endDate) contractData.endDate = new Date(endDate);

    const result = await ContractService.createContractFromBooking(
      bookingId,
      landlordId,
      contractData
    );

    return res.status(201).json({
      success: true,
      message: "Contract created successfully with verified tenant identity",
      data: result,
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
 * GET CONTRACT BY ID
 */
export const getContractById = async (req: Request, res: Response) => {
  try {
    const { id: contractId } = req.params;
    const userId = req.userId;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(contractId as string))
      return res.status(400).json({ success: false, message: "Invalid contract id" });

    const contract = await ContractService.getContractById(contractId as string, userId);

    return res.json({ success: true, data: contract });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not have access")
      ? 403
      : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * STREAM VIEWABLE CONTRACT FILE
 */
export const streamContractFile = async (req: Request, res: Response) => {
  try {
    const { id: contractId } = req.params;
    const userId = req.userId;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(contractId as string))
      return res.status(400).json({ success: false, message: "Invalid contract id" });

    const file = await ContractService.getContractFile(contractId as string, userId);

    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
    file.stream.on("error", () => {
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Cannot stream contract file" });
      } else {
        res.end();
      }
    });
    file.stream.pipe(res);
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not have access")
      ? 403
      : 500;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * GET LANDLORD CONTRACTS
 */
export const getLandlordContracts = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { contracts, total } = await ContractService.getContractsByLandlord(
      landlordId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: contracts,
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
 * GET TENANT CONTRACTS
 */
export const getTenantContracts = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { contracts, total } = await ContractService.getContractsByTenant(
      tenantId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: contracts,
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
 * UPDATE CONTRACT (Landlord - DRAFT only)
 */
export const updateContract = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    const { id: contractId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(contractId as string))
      return res.status(400).json({ success: false, message: "Invalid contract id" });

    const {
      monthlyRent,
      depositAmount,
      terms,
      contractFileUrl,
      startDate,
      endDate,
    } = req.body;
    const contractFile = req.file;

    const updateData: any = {
      monthlyRent: toOptionalNumber(monthlyRent),
      depositAmount: toOptionalNumber(depositAmount),
      terms,
      contractFileUrl,
    };
    if (contractFile) {
      updateData.contractFileStorageKey = await ContractService.uploadContractPdf(
        contractFile,
        contractId as string,
        "updated"
      );
      delete updateData.contractFileUrl;
    }
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const contract = await ContractService.updateContract(contractId as string, landlordId, updateData);

    if (!contract)
      return res.status(404).json({ success: false, message: "Contract not found" });

    return res.json({
      success: true,
      message: "Contract updated successfully",
      data: contract,
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
 * ACTIVATE CONTRACT (Landlord - DRAFT to ACTIVE)
 */
export const activateContract = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    const { id: contractId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(contractId as string))
      return res.status(400).json({ success: false, message: "Invalid contract id" });

    const contract = await ContractService.activateContract(contractId as string, landlordId);

    if (!contract)
      return res.status(404).json({ success: false, message: "Contract not found" });

    return res.json({
      success: true,
      message: "Contract sent to tenant for signature successfully",
      data: contract,
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
 * CONFIRM CONTRACT (Tenant - sign online and activate)
 */
export const confirmContractByTenant = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    const { id: contractId } = req.params;

    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(contractId as string))
      return res.status(400).json({ success: false, message: "Invalid contract id" });

    const { tenantSignatureDataUrl } = req.body;

    const contract = await ContractService.confirmContractByTenant(
      contractId as string,
      tenantId,
      {
        tenantSignatureDataUrl,
      }
    );

    if (!contract)
      return res.status(404).json({ success: false, message: "Contract not found" });

    return res.json({
      success: true,
      message: "Contract confirmed successfully",
      data: contract,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ||
      err.message.includes("do not have access")
      ? 403
      : 400;
    return res
      .status(statusCode)
      .json({ success: false, message: err.message });
  }
};

/**
 * TERMINATE CONTRACT (Landlord)
 */
export const terminateContract = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    const { id: contractId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(contractId as string))
      return res.status(400).json({ success: false, message: "Invalid contract id" });

    const contract = await ContractService.terminateContract(contractId as string, landlordId);

    if (!contract)
      return res.status(404).json({ success: false, message: "Contract not found" });

    return res.json({
      success: true,
      message: "Contract terminated successfully",
      data: contract,
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
 * RENEW CONTRACT (Landlord)
 */
export const renewContract = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    const { id: contractId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(contractId as string))
      return res.status(400).json({ success: false, message: "Invalid contract id" });

    const { monthlyRent, depositAmount, startDate, endDate, terms, contractFileUrl } =
      req.body;
    const contractFile = req.file;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Start date is required for renewal",
      });
    }

    const renewalData: any = {
      monthlyRent: toOptionalNumber(monthlyRent),
      depositAmount: toOptionalNumber(depositAmount),
      terms,
      contractFileUrl,
      startDate: new Date(startDate),
    };
    if (contractFile) {
      renewalData.contractFileStorageKey = await ContractService.uploadContractPdf(
        contractFile,
        contractId as string,
        "renewal"
      );
      delete renewalData.contractFileUrl;
    }
    if (endDate) renewalData.endDate = new Date(endDate);

    const renewalContract = await ContractService.renewContract(contractId as string, landlordId, renewalData);

    return res.status(201).json({
      success: true,
      message: "Contract renewed successfully",
      data: renewalContract,
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
