import { ServiceSubscriptionRepository } from "../repositories/service-subscription.repo.js";
import { ServicePackageRepository } from "../repositories/service-package.repo.js";
import { PaymentRepository } from "../repositories/payment.repo.js";
import { PaymentService } from "./payment.service.js";
import { PayOSService } from "./payos.service.js";
import { SUBSCRIPTION_STATUS } from "../models/ServiceSubscription.model.js";
import { PAYMENT_METHOD, PAYMENT_TYPE, PAYMENT_STATUS } from "../models/Payment.model.js";

export class ServiceSubscriptionService {
  static async subscribe(userId: string, packageId: string, method: PAYMENT_METHOD, autoRenew?: boolean) {
    const pkg = await ServicePackageRepository.findById(packageId);
    if (!pkg) {
      throw new Error("Service package not found");
    }

    const activeSub = await ServiceSubscriptionRepository.findActiveByUserId(userId);
    if (activeSub) {
      throw new Error("You already have an active subscription");
    }

    // Cancel any existing PENDING SERVICE_FEE payments for this user before creating a new one.
    // This handles the case where the user cancels on PayOS and tries again
    // — the old PENDING payment would otherwise cause PayOS duplicate errors.
    const existingPayments = await PaymentRepository.findByPayerId(userId, 0, 50);
    const pendingServiceFee = existingPayments.find(
      (payment: any) =>
        payment.status === PAYMENT_STATUS.PENDING &&
        payment.type === PAYMENT_TYPE.SERVICE_FEE,
    );
    if (pendingServiceFee) {
      const orderCode = pendingServiceFee.transactionRef?.toString();
      if (!orderCode) {
        await PaymentRepository.update(pendingServiceFee._id.toString(), {
          status: PAYMENT_STATUS.CANCELLED,
        });
      } else {
        const synced = await PayOSService.syncPaymentStatus(orderCode);
        if (synced.payment.status === PAYMENT_STATUS.COMPLETED) {
          // The previous payment was actually paid — subscription should already exist
          const freshSub = await ServiceSubscriptionRepository.findActiveByUserId(userId);
          if (freshSub) {
            throw new Error("You already have an active subscription");
          }
        }
        if (synced.payment.status !== PAYMENT_STATUS.CANCELLED) {
          await PayOSService.cancelPayment(orderCode);
        }
      }
    }

    return PaymentService.processPayment({
      payerId: userId,
      receiverId: userId, // platform receives subscription fee
      amount: pkg.price,
      type: PAYMENT_TYPE.SERVICE_FEE,
      description: `Subscription: ${pkg.name} (package: ${packageId})`,
      method,
      subscriptionPackageId: packageId,
    });
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