import type { Request, Response } from "express";
import mongoose from "mongoose";
import { LandlordBankInfoService } from "../services/landlord-bank-info.service.js";

export const createBankInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const { bankBin, bankName, accountNumber, accountHolder, branch } = req.body;
    if (!bankBin || !bankName || !accountNumber || !accountHolder) return res.status(400).json({ success: false, message: "Mã ngân hàng, tên NH, STK và chủ TK là bắt buộc" });
    const bi = await LandlordBankInfoService.createBankInfo(userId, { bankBin, bankName, accountNumber, accountHolder, branch });
    return res.status(201).json({ success: true, message: "Đã lưu thông tin tài khoản", data: bi });
  } catch (err: any) { return res.status(err.message.includes("đã có") ? 409 : 400).json({ success: false, message: err.message }); }
};
export const getMyBankInfos = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    return res.json({ success: true, data: await LandlordBankInfoService.getMyBankInfos(userId) });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
export const getMyVerifiedBankInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    return res.json({ success: true, data: await LandlordBankInfoService.getMyVerifiedBankInfo(userId) });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
export const updateBankInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; const id = req.params.id as string;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const bi = await LandlordBankInfoService.updateBankInfo(id, userId, req.body);
    return res.json({ success: true, message: "Đã cập nhật", data: bi });
  } catch (err: any) { return res.status(err.message.includes("not found") ? 404 : 400).json({ success: false, message: err.message }); }
};
export const getAdminBankInfos = async (req: Request, res: Response) => {
  try { return res.json({ success: true, data: await LandlordBankInfoService.getAdminBankInfos(typeof req.query.status === "string" ? req.query.status : undefined) }); }
  catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
export const verifyBankInfo = async (req: Request, res: Response) => {
  try {
    const adminId = req.userId; const id = req.params.id as string;
    if (!adminId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    return res.json({ success: true, message: "Đã duyệt", data: await LandlordBankInfoService.verifyBankInfo(id, adminId) });
  } catch (err: any) { return res.status(err.message.includes("not found") ? 404 : 400).json({ success: false, message: err.message }); }
};
export const rejectBankInfo = async (req: Request, res: Response) => {
  try {
    const adminId = req.userId; const id = req.params.id as string;
    if (!adminId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    return res.json({ success: true, message: "Đã từ chối", data: await LandlordBankInfoService.rejectBankInfo(id, adminId) });
  } catch (err: any) { return res.status(err.message.includes("not found") ? 404 : 400).json({ success: false, message: err.message }); }
};
export const getLandlordBankInfo = async (req: Request, res: Response) => {
  try {
    const landlordId = req.params.landlordId as string;
    if (!mongoose.Types.ObjectId.isValid(landlordId)) return res.status(400).json({ success: false, message: "Invalid landlord id" });
    return res.json({ success: true, data: await LandlordBankInfoService.getLandlordBankInfo(landlordId) });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
export const getBankList = async (_req: Request, res: Response) => {
  try { return res.json({ success: true, data: LandlordBankInfoService.getBankList() }); }
  catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
};
