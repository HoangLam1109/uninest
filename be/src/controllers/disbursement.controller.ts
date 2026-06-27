import type { Request, Response } from "express";
import mongoose from "mongoose";
import { DisbursementRepository } from "../repositories/disbursement.repo.js";
import { DisbursementService } from "../services/disbursement.service.js";

export const getPendingDisbursements = async (_req: Request, res: Response) => {
  try { return res.json({ success: true, data: await DisbursementRepository.findPending(50) }); }
  catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
export const getAdminDisbursements = async (req: Request, res: Response) => {
  try {
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
    const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;
    const filter: any = {}; if (state) filter.state = state;
    return res.json({ success: true, data: await DisbursementRepository.findAll(filter, limit, offset) });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
export const getLandlordDisbursements = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;
    return res.json({ success: true, data: await DisbursementRepository.findByLandlord(userId, limit, offset) });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
export const getDisbursementStats = async (_req: Request, res: Response) => {
  try { return res.json({ success: true, data: await DisbursementRepository.getStats() }); }
  catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
export const getDisbursementById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const d = await DisbursementRepository.findById(id);
    if (!d) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: d });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
export const retryDisbursement = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    return res.json({ success: true, message: "Retry initiated", data: await DisbursementService.retryDisbursement(id) });
  } catch (err: any) { return res.status(err.message.includes("not found") ? 404 : 400).json({ success: false, message: err.message }); }
};
export const syncDisbursement = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    return res.json({ success: true, message: "Synced", data: await DisbursementService.syncDisbursementStatus(id) });
  } catch (err: any) { return res.status(err.message.includes("not found") ? 404 : 400).json({ success: false, message: err.message }); }
};
export const syncAllDisbursements = async (_req: Request, res: Response) => {
  try { await DisbursementService.syncAllProcessing(); return res.json({ success: true, message: "All synced" }); }
  catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
export const manualCompleteDisbursement = async (req: Request, res: Response) => {
  try {
    const adminId = req.userId; const id = req.params.id as string;
    if (!adminId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    return res.json({ success: true, message: "Đã xác nhận chuyển tiền", data: await DisbursementService.manualComplete(id, adminId, req.body.note) });
  } catch (err: any) { return res.status(err.message.includes("not found") ? 404 : 400).json({ success: false, message: err.message }); }
};
