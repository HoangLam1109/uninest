import { ServiceSubscriptionRepository } from "../repositories/service-subscription.repo.js";
import { ServicePackageRepository } from "../repositories/service-package.repo.js";
import { PaymentRepository } from "../repositories/payment.repo.js";
import { WalletService } from "./wallet.service.js";
import { SUBSCRIPTION_STATUS } from "../models/ServiceSubscription.model.js";
import { PAYMENT_STATUS, PAYMENT_METHOD, PAYMENT_TYPE } from "../models/Payment.model.js";

export class ServiceSubscriptionService {
  static async subscribe(userId: string, packageId: string, autoRenew?: boolean) {
    const pkg = await ServicePackageRepository.findById(packageId);
    if (!pkg) {
      throw new Error("Service package not found");
    }

    const activeSub = await ServiceSubscriptionRepository.findActiveByUserId(userId);
    if (activeSub) {
      throw new Error("You already have an active subscription");
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pkg.durationDays);

    const payment = await PaymentRepository.create({
      bookingId: undefined,
      paperId: userId,
      receiverId: userId,
      amount: pkg.price,
      currency: "VND",
      type: PAYMENT_TYPE.SERVICE_FEE,
      method: PAYMENT_METHOD.WALLET,
      status: PAYMENT_STATUS.PENDING,
      note: `Subscription: ${pkg.name}`,
    });

    try {
      await WalletService.payWithWallet(
        userId,
        null,
        pkg.price,
        payment._id.toString(),
        `Subscription: ${pkg.name}`
      );

      await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.COMPLETED,
        paidAt: new Date(),
      });

      const subscription = await ServiceSubscriptionRepository.create({
        userId,
        packageId,
        paymentId: payment._id,
        startDate,
        endDate,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        autoRenew: autoRenew || false,
      });

      return subscription;
    } catch (err: any) {
      await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.FAILED,
      });
      throw new Error(`Subscription failed: ${err.message}`);
    }
  }

  static async getById(id: string, userId: string) {
    const sub = await ServiceSubscriptionRepository.findById(id);
    if (!sub) {
      throw new Error("Subscription not found");
    }
    if (sub.userId.toString() !== userId) {
      throw new Error("You do not have access to this subscription");
    }
    return sub;
  }

  static async getMySubscriptions(userId: string, skip: number, limit: number) {
    const [subscriptions, total] = await Promise.all([
      ServiceSubscriptionRepository.findByUserId(userId, skip, limit),
      ServiceSubscriptionRepository.countByUserId(userId),
    ]);
    return { subscriptions, total };
  }

  static async getActiveSubscription(userId: string) {
    return await ServiceSubscriptionRepository.findActiveByUserId(userId);
  }

  static async cancel(id: string, userId: string) {
    const sub = await ServiceSubscriptionRepository.findById(id);
    if (!sub) {
      throw new Error("Subscription not found");
    }
    if (sub.userId.toString() !== userId) {
      throw new Error("You can only cancel your own subscription");
    }
    if (sub.status !== SUBSCRIPTION_STATUS.ACTIVE) {
      throw new Error("Only active subscriptions can be cancelled");
    }
    return await ServiceSubscriptionRepository.cancel(id);
  }

  static async checkExpiredSubscriptions() {
    const now = new Date();
    const expired = await ServiceSubscriptionRepository.findExpiringSubscriptions(now);

    let expiredCount = 0;
    for (const sub of expired) {
      await ServiceSubscriptionRepository.update(sub._id.toString(), {
        status: SUBSCRIPTION_STATUS.EXPIRED,
      });
      expiredCount++;
    }
    return expiredCount;
  }
}