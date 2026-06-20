import { PaymentRepository } from "../repositories/payment.repo.js";
import { InvoiceRepository } from "../repositories/invoice.repo.js";
import { BookingRepository } from "../repositories/booking.repo.js";
import { ServicePackageRepository } from "../repositories/service-package.repo.js";
import { ServiceSubscriptionRepository } from "../repositories/service-subscription.repo.js";
import { SUBSCRIPTION_STATUS } from "../models/ServiceSubscription.model.js";
import { PayOSService } from "./payos.service.js";
import { USER_ROLES, type UserRole } from "../constants/role.constant.js";
import {
  buildRoleUpgradeNote,
  isPaidUpgradeRole,
  ROLE_UPGRADE_PRICES,
} from "./role-upgrade.service.js";
import {
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_TYPE,
} from "../models/Payment.model.js";
import { INVOICE_STATUS } from "../models/Invoice.model.js";

export class PaymentService {
  static async processPayment(params: {
    payerId: string;
    receiverId: string;
    amount: number;
    type: PAYMENT_TYPE;
    description: string;
    method: PAYMENT_METHOD;
    invoiceId?: string;
    bookingId?: string;
    subscriptionPackageId?: string;
  }) {
    const paymentData: any = {
      payerId: params.payerId,
      receiverId: params.receiverId,
      amount: params.amount,
      currency: "VND",
      type: params.type,
      method: params.method,
      status: PAYMENT_STATUS.PENDING,
      note: params.description,
    };

    if (params.bookingId) {
      paymentData.bookingId = params.bookingId;
    }

    if (params.invoiceId) {
      paymentData.invoiceId = params.invoiceId;
    }

    const payment: any = await PaymentRepository.create(paymentData);
    if (!payment) {
      throw new Error("Failed to create payment record");
    }

    try {
      const payosResult = await PayOSService.createPaymentLink({
        paymentId: payment._id.toString(),
        amount: params.amount,
        description: params.description,
      });

      return {
        payment,
        checkoutUrl: payosResult.checkoutUrl,
        orderCode: payosResult.orderCode,
        status: "PENDING" as const,
      };
    } catch (err: any) {
      await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.FAILED,
      });
      throw new Error(`Payment failed: ${err.message}`);
    }
  }

  private static async createSubscriptionForPayment(
    payment: any,
    packageId: string,
  ) {
    const pkg = await ServicePackageRepository.findById(packageId);
    if (!pkg) return;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pkg.durationDays);

    await ServiceSubscriptionRepository.create({
      userId: payment.payerId,
      packageId,
      paymentId: payment._id,
      startDate,
      endDate,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      autoRenew: false,
    });
  }

  static async payInvoice(
    invoiceId: string,
    payerId: string,
    method: PAYMENT_METHOD,
  ) {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.tenantId._id.toString() !== payerId) {
      throw new Error("You are not the tenant of this invoice");
    }

    if (
      invoice.status !== INVOICE_STATUS.SENT &&
      invoice.status !== INVOICE_STATUS.OVERDUE
    ) {
      throw new Error(
        `Cannot pay invoice with status: ${invoice.status}. Only SENT or OVERDUE invoices can be paid.`,
      );
    }

    const existingPayments = await PaymentRepository.findByInvoice(invoiceId);
    const completedPayment = existingPayments.find(
      (p: any) => p.status === PAYMENT_STATUS.COMPLETED,
    );
    if (completedPayment) {
      throw new Error("This invoice has already been paid");
    }

    const bookingId =
      invoice.bookingId?._id?.toString() || invoice.bookingId?.toString() || "";
    const landlordId =
      invoice.landlordId?._id?.toString() || invoice.landlordId.toString();

    return this.processPayment({
      payerId,
      receiverId: landlordId,
      amount: invoice.totalAmount,
      type: PAYMENT_TYPE.RENT,
      description: `Invoice payment for ${invoice.billingMonth}`,
      method,
      invoiceId,
      bookingId,
    });
  }

  static async payDeposit(
    bookingId: string,
    tenantId: string,
    method: PAYMENT_METHOD,
  ) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.tenantId._id.toString() !== tenantId) {
      throw new Error("This is not your booking");
    }

    const existingDeposit = await PaymentRepository.findByTypeAndBooking(
      bookingId,
      PAYMENT_TYPE.DEPOSIT,
    );
    if (
      existingDeposit &&
      existingDeposit.status === PAYMENT_STATUS.COMPLETED
    ) {
      throw new Error("Deposit has already been paid for this booking");
    }

    const room = booking.roomId as any;
    const depositAmount = room.depositAmount || room.pricePerMonth;
    const landlordId = room.landlordId.toString();

    return this.processPayment({
      payerId: tenantId,
      receiverId: landlordId,
      amount: depositAmount,
      type: PAYMENT_TYPE.DEPOSIT,
      description: `Deposit for room: ${room.title}`,
      method,
      bookingId,
    });
  }

  static async payRoleUpgrade(
    userId: string,
    currentRole: UserRole | undefined,
    targetRole: UserRole,
  ) {
    if (currentRole !== USER_ROLES.GUEST) {
      throw new Error("Only GUEST users can upgrade role via payment");
    }

    if (!isPaidUpgradeRole(targetRole)) {
      throw new Error("Target role must be TENANT or LANDLORD");
    }

    const existingPayments = await PaymentRepository.findByPayerId(
      userId,
      0,
      20,
    );
    const existingPendingUpgrade = existingPayments.find(
      (payment: any) =>
        payment.status === PAYMENT_STATUS.PENDING &&
        payment.note === buildRoleUpgradeNote(targetRole),
    );
    if (existingPendingUpgrade) {
      const orderCode = existingPendingUpgrade.transactionRef?.toString();
      if (!orderCode) {
        await PaymentRepository.update(existingPendingUpgrade._id.toString(), {
          status: PAYMENT_STATUS.CANCELLED,
        });
      } else {
        const synced = await PayOSService.syncPaymentStatus(orderCode);
        if (synced.payment.status === PAYMENT_STATUS.COMPLETED) {
          throw new Error("This role upgrade payment has already been completed");
        }

        if (synced.payment.status === PAYMENT_STATUS.PENDING) {
          await PayOSService.cancelPayment(orderCode);
        }
      }
    }

    const paymentType =
      targetRole === USER_ROLES.TENANT
        ? PAYMENT_TYPE.TENANT_PACKAGE
        : PAYMENT_TYPE.LANDLORD_PACKAGE;

    return this.processPayment({
      payerId: userId,
      receiverId: userId,
      amount: ROLE_UPGRADE_PRICES[targetRole],
      type: paymentType,
      description: buildRoleUpgradeNote(targetRole),
      method: PAYMENT_METHOD.PAYOS,
    });
  }

  static async getPaymentById(paymentId: string, userId: string) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (
      payment.payerId.toString() !== userId &&
      payment.receiverId.toString() !== userId
    ) {
      throw new Error("You do not have access to this payment");
    }

    return payment;
  }

  static async getMyPayments(userId: string, skip: number, limit: number) {
    const [payments, total] = await Promise.all([
      PaymentRepository.findByPayerId(userId, skip, limit),
      PaymentRepository.countByPayerId(userId),
    ]);
    return { payments, total };
  }

  static async getReceivedPayments(
    userId: string,
    skip: number,
    limit: number,
  ) {
    const [payments, total] = await Promise.all([
      PaymentRepository.findByReceiverId(userId, skip, limit),
      PaymentRepository.countByReceiverId(userId),
    ]);
    return { payments, total };
  }

  static async getAdminPayments(skip: number, limit: number) {
    const [payments, total] = await Promise.all([
      PaymentRepository.findAll(skip, limit),
      PaymentRepository.countAll(),
    ]);
    return { payments, total };
  }

  static async getAdminPaymentStats() {
    const [rows, total] = await Promise.all([
      PaymentRepository.getStats(),
      PaymentRepository.countAll(),
    ]);
    let totalAmount = 0;
    let pendingAmount = 0;
    let completedAmount = 0;
    let pendingCount = 0;
    let completedCount = 0;
    let failedCount = 0;
    let refundedCount = 0;

    for (const row of rows as Array<{
      _id: PAYMENT_STATUS;
      count: number;
      amount: number;
    }>) {
      totalAmount += row.amount;

      if (row._id === PAYMENT_STATUS.PENDING) {
        pendingAmount += row.amount;
        pendingCount += row.count;
      } else if (row._id === PAYMENT_STATUS.COMPLETED) {
        completedAmount += row.amount;
        completedCount += row.count;
      } else if (
        row._id === PAYMENT_STATUS.FAILED ||
        row._id === PAYMENT_STATUS.CANCELLED
      ) {
        failedCount += row.count;
      } else if (row._id === PAYMENT_STATUS.REFUNDED) {
        refundedCount += row.count;
      }
    }

    return {
      totalPayments: total,
      totalAmount,
      pendingAmount,
      completedAmount,
      pendingCount,
      completedCount,
      failedCount,
      refundedCount,
    };
  }

  static async getPaymentsByInvoice(invoiceId: string, landlordId: string) {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const invLandlordId =
      invoice.landlordId?._id?.toString() || invoice.landlordId.toString();
    if (invLandlordId !== landlordId) {
      throw new Error("You do not own this invoice");
    }

    return await PaymentRepository.findByInvoice(invoiceId);
  }

  static async getPaymentsByBooking(bookingId: string) {
    return await PaymentRepository.findByBooking(bookingId);
  }

  static async requestRefund(
    paymentId: string,
    userId: string,
    reason: string,
  ) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.payerId.toString() !== userId) {
      throw new Error("You can only request refund for your own payments");
    }

    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      throw new Error("Can only request refund for completed payments");
    }

    return await PaymentRepository.update(paymentId, {
      status: PAYMENT_STATUS.REFUNDED,
      note: `REFUND REQUESTED: ${reason}. ${payment.note || ""}`,
    });
  }

  static async processRefund(paymentId: string, reviewerId: string) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== PAYMENT_STATUS.REFUNDED) {
      throw new Error(
        `Cannot process refund for payment with status: ${payment.status}`,
      );
    }

    await PayOSService.createPaymentLink({
      paymentId: payment._id.toString(),
      amount: payment.amount,
      description: `Refund for payment ${payment._id.toString()}`,
    });

    return await PaymentRepository.update(paymentId, {
      status: PAYMENT_STATUS.REFUNDED,
      note: `REFUND PROCESSED by ${reviewerId}. ${payment.note || ""}`,
    });
  }

  static async updatePaymentStatus(paymentId: string, status: PAYMENT_STATUS) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    const updateData: any = { status };
    if (status === PAYMENT_STATUS.COMPLETED) {
      updateData.paidAt = new Date();
    }

    return await PaymentRepository.update(paymentId, updateData);
  }

  static async getPaymentStats(userId: string, role: string) {
    let totalPayments = 0;
    let totalAmount = 0;
    let pendingAmount = 0;
    let completedAmount = 0;

    let payments: any[] = [];

    if (role === "TENANT" || role === "GUEST") {
      payments = await PaymentRepository.findByPayerId(userId, 0, 1000);
    } else {
      payments = await PaymentRepository.findByReceiverId(userId, 0, 1000);
    }

    for (const p of payments) {
      totalPayments++;
      totalAmount += p.amount;
      if (p.status === PAYMENT_STATUS.PENDING) {
        pendingAmount += p.amount;
      } else if (p.status === PAYMENT_STATUS.COMPLETED) {
        completedAmount += p.amount;
      }
    }

    return { totalPayments, totalAmount, pendingAmount, completedAmount };
  }
}
