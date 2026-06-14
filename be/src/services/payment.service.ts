import { PaymentRepository } from "../repositories/payment.repo.js";
import { InvoiceRepository } from "../repositories/invoice.repo.js";
import { BookingRepository } from "../repositories/booking.repo.js";
import { WalletService } from "./wallet.service.js";
import {
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_TYPE,
} from "../models/Payment.model.js";
import { INVOICE_STATUS } from "../models/Invoice.model.js";

export class PaymentService {
  static async payInvoice(
    invoiceId: string,
    payerId: string,
    method: PAYMENT_METHOD,
    gatewayData?: any
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
        `Cannot pay invoice with status: ${invoice.status}. Only SENT or OVERDUE invoices can be paid.`
      );
    }

    const existingPayments = await PaymentRepository.findByInvoice(invoiceId);
    const completedPayment = existingPayments.find(
      (p: any) => p.status === PAYMENT_STATUS.COMPLETED
    );
    if (completedPayment) {
      throw new Error("This invoice has already been paid");
    }

    const bookingId = invoice.bookingId._id
      ? invoice.bookingId._id.toString()
      : invoice.bookingId.toString();
    const landlordId = invoice.landlordId._id
      ? invoice.landlordId._id.toString()
      : invoice.landlordId.toString();
    const amount = invoice.totalAmount;

    const paymentData: any = {
      bookingId,
      paperId: payerId,
      receiverId: landlordId,
      invoiceId,
      amount,
      currency: "VND",
      type: PAYMENT_TYPE.RENT,
      method,
      status: PAYMENT_STATUS.PENDING,
      note: `Payment for invoice ${invoiceId} (${invoice.billingMonth})`,
    };

    let payment: any = await PaymentRepository.create(paymentData);
    if (!payment) {
      throw new Error("Failed to create payment record");
    }

    try {
      if (method === PAYMENT_METHOD.WALLET) {
        const result = await WalletService.payWithWallet(
          payerId,
          landlordId,
          amount,
          payment._id.toString(),
          `Rent payment for ${invoice.billingMonth}`
        );

        const updated = await PaymentRepository.update(payment._id.toString(), {
          walletTxId: result.payerTransaction._id,
          status: PAYMENT_STATUS.COMPLETED,
          paidAt: new Date(),
        });
        if (updated) payment = updated;
      } else if (
        method === PAYMENT_METHOD.BANK_TRANSFER ||
        method === PAYMENT_METHOD.CASH
      ) {
        const updated = await PaymentRepository.update(payment._id.toString(), {
          status: PAYMENT_STATUS.COMPLETED,
          paidAt: new Date(),
          gatewayResponse: gatewayData || null,
        });
        if (updated) payment = updated;
      } else if (
        method === PAYMENT_METHOD.VNPAY ||
        method === PAYMENT_METHOD.MOMO
      ) {
        const txRef = `${method}_${invoiceId}_${Date.now()}`;
        const updated = await PaymentRepository.update(payment._id.toString(), {
          transactionRef: txRef,
          gatewayResponse: gatewayData || null,
        });
        if (updated) payment = updated;
      }

      await InvoiceRepository.update(invoiceId, {
        status: INVOICE_STATUS.PAID,
        paidAt: new Date(),
      });

      return payment;
    } catch (err: any) {
      await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.FAILED,
      });
      throw new Error(`Payment failed: ${err.message}`);
    }
  }

  static async payDeposit(
    bookingId: string,
    tenantId: string,
    method: PAYMENT_METHOD
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
      PAYMENT_TYPE.DEPOSIT
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

    const paymentData: any = {
      bookingId,
      paperId: tenantId,
      receiverId: landlordId,
      amount: depositAmount,
      currency: "VND",
      type: PAYMENT_TYPE.DEPOSIT,
      method,
      status: PAYMENT_STATUS.PENDING,
      note: `Deposit for room: ${room.title}`,
    };

    let payment: any = await PaymentRepository.create(paymentData);
    if (!payment) {
      throw new Error("Failed to create deposit payment record");
    }

    try {
      if (method === PAYMENT_METHOD.WALLET) {
        const result = await WalletService.payWithWallet(
          tenantId,
          landlordId,
          depositAmount,
          payment._id.toString(),
          `Deposit for booking ${bookingId}`
        );

        const updated = await PaymentRepository.update(payment._id.toString(), {
          walletTxId: result.payerTransaction._id,
          status: PAYMENT_STATUS.COMPLETED,
          paidAt: new Date(),
        });
        if (updated) payment = updated;
      } else {
        const updated = await PaymentRepository.update(payment._id.toString(), {
          status: PAYMENT_STATUS.COMPLETED,
          paidAt: new Date(),
        });
        if (updated) payment = updated;
      }

      return payment;
    } catch (err: any) {
      await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.FAILED,
      });
      throw new Error(`Deposit payment failed: ${err.message}`);
    }
  }

  static async getPaymentById(paymentId: string, userId: string) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (
      payment.paperId.toString() !== userId &&
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

  static async getReceivedPayments(userId: string, skip: number, limit: number) {
    const [payments, total] = await Promise.all([
      PaymentRepository.findByReceiverId(userId, skip, limit),
      PaymentRepository.countByReceiverId(userId),
    ]);

    return { payments, total };
  }

  static async getPaymentsByInvoice(invoiceId: string, landlordId: string) {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const invLandlordId = invoice.landlordId._id
      ? invoice.landlordId._id.toString()
      : invoice.landlordId.toString();

    if (invLandlordId !== landlordId) {
      throw new Error("You do not own this invoice");
    }

    return await PaymentRepository.findByInvoice(invoiceId);
  }

  static async getPaymentsByBooking(bookingId: string) {
    return await PaymentRepository.findByBooking(bookingId);
  }

  static async requestRefund(paymentId: string, userId: string, reason: string) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.paperId.toString() !== userId) {
      throw new Error("You can only request refund for your own payments");
    }

    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      throw new Error("Can only request refund for completed payments");
    }

    const updated = await PaymentRepository.update(paymentId, {
      status: PAYMENT_STATUS.REFUNDED,
      note: `REFUND REQUESTED: ${reason}. ${payment.note || ""}`,
    });

    return updated;
  }

  static async processRefund(paymentId: string, reviewerId: string) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== PAYMENT_STATUS.REFUNDED) {
      throw new Error(
        `Cannot process refund for payment with status: ${payment.status}`
      );
    }

    await WalletService.payWithWallet(
      payment.receiverId.toString(),
      payment.paperId.toString(),
      payment.amount,
      paymentId,
      `Refund for payment ${paymentId}`
    );

    const updated = await PaymentRepository.update(paymentId, {
      status: PAYMENT_STATUS.REFUNDED,
      note: `REFUND PROCESSED by ${reviewerId}. ${payment.note || ""}`,
    });

    return updated;
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

  static async handleGatewayReturn(gateway: string, queryParams: Record<string, string>) {
    const txRef =
      queryParams.transactionRef ||
      queryParams.txnRef ||
      queryParams.orderId;

    if (!txRef) {
      throw new Error("Invalid gateway response: missing transactionRef");
    }

    const payment = await PaymentRepository.findByTransactionRef(txRef);
    if (!payment) {
      throw new Error("Payment not found for this transaction");
    }

    if (
      (gateway === "VNPAY" && payment.method !== PAYMENT_METHOD.VNPAY) ||
      (gateway === "MOMO" && payment.method !== PAYMENT_METHOD.MOMO)
    ) {
      throw new Error("Gateway mismatch");
    }

    const isSuccess =
      queryParams.resultCode === "0" ||
      queryParams.vnp_ResponseCode === "00" ||
      queryParams.transactionStatus === "00";

    if (isSuccess) {
      const updated = await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.COMPLETED,
        paidAt: new Date(),
        gatewayResponse: queryParams,
      });

      if (payment.invoiceId) {
        await InvoiceRepository.update(payment.invoiceId.toString(), {
          status: INVOICE_STATUS.PAID,
          paidAt: new Date(),
        });
      }

      return updated;
    } else {
      await PaymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.FAILED,
        gatewayResponse: queryParams,
      });

      throw new Error("Payment was not successful");
    }
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

    return {
      totalPayments,
      totalAmount,
      pendingAmount,
      completedAmount,
    };
  }
}