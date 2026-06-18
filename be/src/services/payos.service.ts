import { payosClient, PAYOS_CONFIG } from "../config/payos.config.js";
import { PaymentRepository } from "../repositories/payment.repo.js";
import { InvoiceRepository } from "../repositories/invoice.repo.js";
import { ServiceSubscriptionRepository } from "../repositories/service-subscription.repo.js";
import { ServicePackageRepository } from "../repositories/service-package.repo.js";
import { PAYMENT_STATUS } from "../models/Payment.model.js";
import { SUBSCRIPTION_STATUS } from "../models/ServiceSubscription.model.js";
import { INVOICE_STATUS } from "../models/Invoice.model.js";

export class PayOSService {
  static async createPaymentLink(params: {
    paymentId: string;
    amount: number;
    description: string;
  }) {
    const orderCode = Number(String(Date.now()).slice(-8));

    const paymentLink = await payosClient.paymentRequests.create({
      orderCode,
      amount: params.amount,
      description: params.description.slice(0, 25),
      returnUrl: PAYOS_CONFIG.returnUrl,
      cancelUrl: PAYOS_CONFIG.cancelUrl,
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
    if (note.includes("Subscription:") && note.includes("package:")) {
      const packageId = note.split("package:")[1]?.trim();
      if (packageId) {
        const pkg = await ServicePackageRepository.findById(packageId);
        if (pkg) {
          const userId = payment.paperId.toString();
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + pkg.durationDays);

          await ServiceSubscriptionRepository.create({
            userId,
            packageId,
            paymentId: payment._id,
            startDate,
            endDate,
            status: SUBSCRIPTION_STATUS.ACTIVE,
            autoRenew: false,
          });
        }
      }
    }
  }

  static async getPaymentStatus(orderCode: string) {
    return await payosClient.paymentRequests.get(Number(orderCode));
  }

  static async cancelPayment(orderCode: string) {
    return await payosClient.paymentRequests.cancel(Number(orderCode));
  }
}