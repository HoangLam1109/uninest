import type { Request, Response } from "express";
import mongoose from "mongoose";
import { ServiceSubscriptionService } from "../services/service-subscription.service.js";

export const subscribe = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const packageId = req.params.packageId as string;
    const { autoRenew } = req.body;

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({ success: false, message: "Invalid package ID" });
    }

    const subscription = await ServiceSubscriptionService.subscribe(userId, packageId, autoRenew);

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      data: subscription,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getMySubscriptions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const { subscriptions, total } = await ServiceSubscriptionService.getMySubscriptions(
      userId,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: subscriptions,
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

export const getActiveSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const subscription = await ServiceSubscriptionService.getActiveSubscription(userId);

    return res.json({ success: true, data: subscription });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getSubscriptionById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const subscription = await ServiceSubscriptionService.getById(id, userId);

    return res.json({ success: true, data: subscription });
  } catch (err: any) {
    return res.status(403).json({ success: false, message: err.message });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const subscription = await ServiceSubscriptionService.cancel(id, userId);

    return res.json({
      success: true,
      message: "Subscription cancelled",
      data: subscription,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const checkExpiredSubscriptions = async (_req: Request, res: Response) => {
  try {
    const count = await ServiceSubscriptionService.checkExpiredSubscriptions();

    return res.json({
      success: true,
      message: `${count} subscriptions marked as expired`,
      data: { expiredCount: count },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};