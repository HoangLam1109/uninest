import User from "../models/User.model.js";

import { UserRepository } from "./user.repo.js";
import { PropertyRepository } from "./property.repo.js";
import { RoomImageRepository } from "./room-image.repo.js";
import { FavoriteRepository } from "./favorite.repo.js";
import { BookingRepository } from "./booking.repo.js";
import { ContractRepository } from "./contract.repo.js";
import { InvoiceRepository, InvoiceDetailRepository } from "./invoice.repo.js";
import { MeterReadingRepository } from "./meter-reading.repo.js";
import { ReviewRepository } from "./review.repo.js";
import { IdentityRepository } from "./identity.repo.js";
import { PaymentRepository } from "./payment.repo.js";
import { WalletRepository } from "./wallet.repo.js";
import { WalletTransactionRepository } from "./wallet-transaction.repo.js";
import { ServicePackageRepository } from "./service-package.repo.js";
import { ServiceSubscriptionRepository } from "./service-subscription.repo.js";

// Repository factory
export class RepositoryFactory {
  private static userRepository: UserRepository;

  static async initializeRepositories(): Promise<void> {
    // Redis is disabled - using mock client, no initialization needed
    console.log("Redis disabled - using mock client");
  }

  static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository(User);
    }
    return this.userRepository;
  }
}

// Export individual repositories for convenience
export const userRepository = RepositoryFactory.getUserRepository();

// Export other repositories
export { PropertyRepository, RoomImageRepository, FavoriteRepository, BookingRepository, ContractRepository, InvoiceRepository, InvoiceDetailRepository, MeterReadingRepository, ReviewRepository, IdentityRepository, PaymentRepository, WalletRepository, WalletTransactionRepository, ServicePackageRepository, ServiceSubscriptionRepository };
