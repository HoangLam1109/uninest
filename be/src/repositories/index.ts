import User from "../models/User.model.js";

import { UserRepository } from "./user.repo.js";

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
