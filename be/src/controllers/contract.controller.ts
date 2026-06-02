import type { Request, Response } from "express";
import mongoose from "mongoose";
import { ContractService } from "../services/contract.service.js";

/**
 * CREATE CONTRACT FROM BOOKING (Landlord)
 */
export const createContractFromBooking = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { bookingId, monthlyRent, depositAmount, terms, contractFileUrl, startDate } =
      req.body;

    if (!bookingId || !monthlyRent) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and monthly rent are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId as string))
      return res.status(400).json({ success: false, message: "Invalid booking id" });

    const contractData: any = {
      monthlyRent,
      depositAmount,
      terms,
      contractFileUrl,
    };
    if (startDate) contractData.startDate = new Date(startDate);

    const contract = await ContractService.createContractFromBooking(
      bookingId,
      landlordId,
      contractData
    );

    return res.status(201).json({
      success: true,
      message: "Contract created successfully",
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

    const updateData: any = { monthlyRent, depositAmount, terms, contractFileUrl };
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
      message: "Contract activated successfully",
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

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Start date is required for renewal",
      });
    }

    const renewalData: any = {
      monthlyRent,
      depositAmount,
      terms,
      contractFileUrl,
      startDate: new Date(startDate),
    };
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
