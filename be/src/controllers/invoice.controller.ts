import type { Request, Response } from "express";
import mongoose from "mongoose";
import { InvoiceService } from "../services/invoice.service.js";

/**
 * CREATE INVOICE (Landlord)
 */
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      bookingId,
      billingMonth,
      dueDate,
      rentAmount,
      electricityAmount,
      waterAmount,
      additionalFees,
      notes,
      detailData,
    } = req.body;

    if (!bookingId || !billingMonth || !dueDate || !rentAmount) {
      return res.status(400).json({
        success: false,
        message: "Booking ID, billing month, due date, and rent amount are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId as string))
      return res.status(400).json({ success: false, message: "Invalid booking id" });

    // Validate billingMonth format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(billingMonth)) {
      return res.status(400).json({
        success: false,
        message: "Billing month must be in YYYY-MM format",
      });
    }

    const invoice = await InvoiceService.createInvoice(bookingId, landlordId, {
      billingMonth,
      dueDate: new Date(dueDate),
      rentAmount,
      electricityAmount,
      waterAmount,
      additionalFees,
      notes,
      detailData,
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
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
 * GET INVOICE BY ID
 */
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    let { id: invoiceId } = req.params;
    const userId = req.userId;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    const invoice = await InvoiceService.getInvoiceById(invoiceId, userId);

    return res.json({ success: true, data: invoice });
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
 * GET LANDLORD INVOICES
 */
export const getLandlordInvoices = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { invoices, total } = await InvoiceService.getInvoicesByLandlord(
      landlordId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: invoices,
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
 * GET TENANT INVOICES
 */
export const getTenantInvoices = async (req: Request, res: Response) => {
  try {
    const tenantId = req.userId;
    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { invoices, total } = await InvoiceService.getInvoicesByTenant(
      tenantId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: invoices,
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
 * UPDATE INVOICE (Landlord - DRAFT only)
 */
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: invoiceId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    const {
      rentAmount,
      electricityAmount,
      waterAmount,
      additionalFees,
      notes,
      dueDate,
    } = req.body;

    const updateData: {
      rentAmount?: any;
      electricityAmount?: any;
      waterAmount?: any;
      additionalFees?: any;
      notes?: any;
      dueDate?: Date;
    } = {
      rentAmount,
      electricityAmount,
      waterAmount,
      additionalFees,
      notes,
    };
    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    const invoice = await InvoiceService.updateInvoice(invoiceId, landlordId, updateData);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    return res.json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
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
 * SEND INVOICE (Landlord - DRAFT to SENT)
 */
export const sendInvoice = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: invoiceId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    const invoice = await InvoiceService.sendInvoice(invoiceId, landlordId);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    return res.json({
      success: true,
      message: "Invoice sent successfully",
      data: invoice,
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
 * MARK INVOICE AS PAID (Landlord)
 */
export const markInvoiceAsPaid = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: invoiceId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    const invoice = await InvoiceService.markAsPaid(invoiceId, landlordId);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    return res.json({
      success: true,
      message: "Invoice marked as paid",
      data: invoice,
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
 * DELETE INVOICE (Landlord - DRAFT only)
 */
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: invoiceId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    const invoice = await InvoiceService.deleteInvoice(invoiceId, landlordId);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    return res.json({
      success: true,
      message: "Invoice deleted successfully",
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
 * GET INVOICE DETAIL
 */
export const getInvoiceDetail = async (req: Request, res: Response) => {
  try {
    let { id: invoiceId } = req.params;
    const userId = req.userId;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    // Verify access to invoice
    await InvoiceService.getInvoiceById(invoiceId, userId);

    const detail = await InvoiceService.getInvoiceDetail(invoiceId);

    return res.json({
      success: true,
      data: detail,
    });
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
 * UPDATE INVOICE DETAIL (Landlord)
 */
export const updateInvoiceDetail = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    let { id: invoiceId } = req.params;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!invoiceId || typeof invoiceId !== "string" || !mongoose.Types.ObjectId.isValid(invoiceId))
      return res.status(400).json({ success: false, message: "Invalid invoice id" });

    // Verify landlord owns invoice
    const invoice = await InvoiceService.getInvoiceById(invoiceId, landlordId);

    const detail = await InvoiceService.updateInvoiceDetail(invoiceId, req.body);

    return res.json({
      success: true,
      message: "Invoice detail updated successfully",
      data: detail,
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
