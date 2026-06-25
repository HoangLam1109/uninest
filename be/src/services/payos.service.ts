import { payosClient, createPayOSClient, PAYOS_CONFIG } from "../config/payos.config.js";
import { PaymentRepository } from "../repositories/payment.repo.js";
import { InvoiceRepository } from "../repositories/invoice.repo.js";
import { BankAccountRepository } from "../repositories/bank-account.repo.js";
import { ServiceSubscriptionRepository } from "../repositories/service-subscription.repo.js";
import { ServicePackageRepository } from "../repositories/service-package.repo.js";
import { userRepository } from "../repositories/index.js";
import { PAYMENT_STATUS } from "../models/Payment.model.js";
import { SUBSCRIPTION_STATUS } from "../models/ServiceSubscription.model.js";
import { INVOICE_STATUS } from "../models/Invoice.model.js";
import { USER_ROLES } from "../constants/role.constant.js";
import { applyRoleUpgradeFromPayment } from "./role-upgrade.service.js";
import { isPaidUpgradeRole } from "./role-upgrade.service.js";

function extractSubscriptionPackageId(note?: string | null) {
  if (!note) return null;

  const match = note.match(/package:\s*([a-fA-F0-9]{24})/);
  return match?.[1] ?? null;
}

function normalizeVietnameseText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolvePackageTargetRole(pkg: {
  targetRole?: string;
  name?: string;
  description?: string;
  maxRooms?: number;
}) {
  if (pkg.targetRole && isPaidUpgradeRole(pkg.targetRole as any)) {
    return pkg.targetRole;
  }

  const normalizedText = normalizeVietnameseText(
    `${pkg.name ?? ""} ${pkg.description ?? ""}`,
  );

  if (
    normalizedText.includes("landlord") ||
    normalizedText.includes("chu nha") ||
    normalizedText.includes("chu tro")
  ) {
    return USER_ROLES.LANDLORD;
  }

  if (
    normalizedText.includes("tenant") ||
    normalizedText.includes("nguoi thue") ||
    normalizedText.includes("cu dan")
  ) {
    return USER_ROLES.TENANT;
  }

  if ((pkg.maxRooms ?? 0) > 0) {
    return USER_ROLES.LANDLORD;
  }

  return USER_ROLES.TENANT;
}

export class PayOSService {
  static async createPaymentLink(params: {
    paymentId: string;
    amount: number;
    description: string;
    returnUrl: string | undefined;
    cancelUrl: string | undefined;
    /** Optional: landlord's PayOS keys for direct settlement */
    payosKeys?: {
      clientId: string;
      apiKey: string;
      checksumKey: string;
    };
  }) {
    const orderCode = Number(
      String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 100)).padStart(2, "0")
    );

    // Use landlord-specific client if keys provided, otherwise default system client
    const client = params.payosKeys
      ? createPayOSClient(params.payosKeys)
      : payosClient;

    const paymentLink = await client.paymentRequests.create({
      orderCode,
      amount: params.amount,
      description: params.description.slice(0, 25),
      returnUrl: params.returnUrl || PAYOS_CONFIG.returnUrl,
      cancelUrl: params.cancelUrl || PAYOS_CONFIG.cancelUrl,
    });

    await PaymentRepository.update(params.paymentId, {
      transactionRef: String(orderCode),
      gatewayResponse: paymentLink,
    });

    return {
      checkoutUrl: paymentLink.checkoutUrl,
      orderCode,
    };
  }

  static async handleWebhook(webhookData: any) {
    const webhookBody = await payosClient.webhooks.verify(webhookData);

    if (!webhookBody || !webhookBody.orderCode) {
      throw new Error("Invalid webhook data");
    }

    const orderCode = String(webhookBody.orderCode);
    const payment = await PaymentRepository.findByTransactionRef(orderCode);
    if (!payment) {
      throw new Error(`Payment not found for orderCode: ${orderCode}`);
    }

    if (payment.status === PAYMENT_STATUS.COMPLETED) {
      return payment;
    }

    const pinfo = await payosClient.paymentRequests.get(Number(orderCode));

    if (pinfo.status === "PAID") {
      const updated = await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.COMPLETED,
        paidAt: new Date(),
        gatewayResponse: {
          ...(payment.gatewayResponse || {}),
          payosReference: webhookBody.reference,
          payosAccountNumber: webhookBody.accountNumber,
          payosTransactionTime: webhookBody.transactionDateTime,
          webhookReceived: true,
        },
      });

      await this.executePostPayment(payment);
      return updated;
    } else if (pinfo.status === "CANCELLED") {
      const updated = await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.CANCELLED,
        gatewayResponse: {
          ...(payment.gatewayResponse || {}),
          payosStatus: pinfo.status,
          webhookReceived: true,
        },
      });

      return updated;
    } else {
      await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.FAILED,
        gatewayResponse: {
          ...(payment.gatewayResponse || {}),
          payosStatus: pinfo.status,
        },
      });
      throw new Error(`Payment failed with PayOS status: ${pinfo.status}`);
    }
  }

  private static async executePostPayment(payment: any) {
    const invoiceId = payment.invoiceId;
    if (invoiceId) {
      await InvoiceRepository.update(invoiceId.toString(), {
        status: INVOICE_STATUS.PAID,
        paidAt: new Date(),
      });
    }

    const note: string = payment.note || "";
    if (payment.type === "SERVICE_FEE" && note.includes("Subscription:")) {
      const packageId = extractSubscriptionPackageId(note);
      if (packageId) {
        const pkg = await ServicePackageRepository.findById(packageId);
        if (pkg) {
          const userId = payment.payerId.toString();
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + pkg.durationDays);
          const targetRole = resolvePackageTargetRole(pkg);

          await ServiceSubscriptionRepository.create({
            userId,
            packageId,
            paymentId: payment._id,
            startDate,
            endDate,
            status: SUBSCRIPTION_STATUS.ACTIVE,
            autoRenew: false,
          });

          // Upgrade user role to the package target role with expiry matching subscription end
          await userRepository.updateById(userId, {
            role: targetRole,
            roleExpiresAt: endDate,
          });
        }
      }
    }

    await applyRoleUpgradeFromPayment(payment);
  }

  static async syncPaymentStatus(orderCode: string) {
    const payment = await PaymentRepository.findByTransactionRef(orderCode);
    if (!payment) {
      throw new Error(`Payment not found for orderCode: ${orderCode}`);
    }

    // Determine which PayOS client to use (landlord-specific or system default)
    const client = await this.resolvePayOSClient(payment);

    const pinfo = await client.paymentRequests.get(Number(orderCode));

    if (payment.status === PAYMENT_STATUS.COMPLETED) {
      return { payment, payosStatus: pinfo.status };
    }

    if (pinfo.status === "PAID") {
      const updated = await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.COMPLETED,
        paidAt: new Date(),
        gatewayResponse: {
          ...(payment.gatewayResponse || {}),
          payosStatus: pinfo.status,
          statusSyncedAt: new Date(),
        },
      });

      await this.executePostPayment(payment);
      return { payment: updated || payment, payosStatus: pinfo.status };
    }

    if (pinfo.status === "CANCELLED") {
      const updated = await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.CANCELLED,
        gatewayResponse: {
          ...(payment.gatewayResponse || {}),
          payosStatus: pinfo.status,
          statusSyncedAt: new Date(),
        },
      });

      return { payment: updated || payment, payosStatus: pinfo.status };
    }

    return { payment, payosStatus: pinfo.status };
  }

  static async getPaymentStatus(orderCode: string) {
    return await this.syncPaymentStatus(orderCode);
  }

  static async cancelPayment(orderCode: string) {
    const payment = await PaymentRepository.findByTransactionRef(orderCode);
    if (!payment) {
      throw new Error(`Payment not found for orderCode: ${orderCode}`);
    }

    if (payment.status === PAYMENT_STATUS.COMPLETED) {
      return { payment, payosStatus: "PAID" };
    }

    const client = await this.resolvePayOSClient(payment);

    const pinfo = await client.paymentRequests.get(Number(orderCode));
    if (pinfo.status === "PAID") {
      const updated = await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.COMPLETED,
        paidAt: new Date(),
        gatewayResponse: {
          ...(payment.gatewayResponse || {}),
          payosStatus: pinfo.status,
          statusSyncedAt: new Date(),
        },
      });

      await this.executePostPayment(payment);
      return { payment: updated || payment, payosStatus: pinfo.status };
    }

    if (pinfo.status !== "CANCELLED") {
      await client.paymentRequests.cancel(Number(orderCode));
    }

    const updated = await PaymentRepository.update(payment._id.toString(), {
      status: PAYMENT_STATUS.CANCELLED,
      gatewayResponse: {
        ...(payment.gatewayResponse || {}),
        payosStatus: "CANCELLED",
        statusSyncedAt: new Date(),
      },
    });

    return { payment: updated || payment, payosStatus: "CANCELLED" };
  }

  /**
   * Resolve which PayOS client to use for a payment.
   * If the payment's receiver (landlord) has verified PayOS keys, use those.
   * Otherwise fall back to the system default client.
   */
  private static async resolvePayOSClient(payment: any) {
    try {
      const receiverId = payment.receiverId?.toString?.() || payment.receiverId;
      if (receiverId) {
        const bankAccount = await BankAccountRepository.findVerifiedByUserId(receiverId);
        if (bankAccount?.payosClientId && bankAccount?.payosApiKey && bankAccount?.payosChecksumKey) {
          return createPayOSClient({
            clientId: bankAccount.payosClientId,
            apiKey: bankAccount.payosApiKey,
            checksumKey: bankAccount.payosChecksumKey,
          });
        }
      }
    } catch {
      // Fall through to system client
    }
    return payosClient;
  }
}
