import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/index.js";

import type { IUser } from "../models/User.model.js";

export interface CreateUserData {
  email: string;
  fullName: string;
  password: string;
  phone: string;
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  phone?: string;
  password?: string;
  avatarUrl?: string;
}

export interface ITenant {
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantAvatarUrl?: string;
  isPrimaryTenant: boolean;
}


export class UserService {
  async getUser(userId: string): Promise<IUser | null> {
    return await userRepository.findById(
      userId,
      "_id email fullName phone avatarUrl"
    );
  }

  async createUser(
    userData: CreateUserData,
    performedBy?: string
  ): Promise<IUser> {
    const newUser = await this._passwordCheck("", userData, performedBy);
    const createdUser = await userRepository.create(newUser);

    return createdUser;
  }

  async updateUser(
    userId: string,
    userData: UpdateUserData,
    performedBy?: string
  ): Promise<IUser | null> {
    const newUser = await this._passwordCheck(userId, userData, performedBy);
    const updatedUser = await userRepository.updateById(userId, newUser);

    return updatedUser;
  }

  async deleteUser(
    userId: string,
  ): Promise<IUser | null> {
    const deletedUser = await userRepository.deleteById(userId);
    return deletedUser;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await userRepository.findByEmail(email);
  }

  async getUserByFullName(fullName: string): Promise<IUser | null> {
    return await userRepository.findByFullName(fullName);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await userRepository.findAll(
      "_id email fullName phoneNumber identityNumber gender age dateOfBirth address"
    );
  }

  async searchUsers(query: string): Promise<any[]> {
    return await userRepository.searchUsers(query);
  }

  async getUserByPhone(phone: string): Promise<IUser | null> {
    return await userRepository.findByPhone(phone);
  }

  // Private helper method to hash passwords
  private async _passwordCheck(
    userId: string,
    userData: UpdateUserData | CreateUserData,
    performedBy?: string
  ): Promise<UpdateUserData | CreateUserData> {
    if (userData.password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const newUser = {
        ...userData,
        password: hashedPassword,
      };

      return newUser;
    } else return userData;
  }
  

  async getUserByPhone(phone: string): Promise<IUser | null> {
    return await userRepository.findByPhone(phone);
  }
  async updateUserProfile(userId: string, userData: UpdateUserData): Promise<IUser | null> {
    const updatedUser = await userRepository.updateById(userId, userData);
    return updatedUser;
  }
  
  async getUserProfile (userId: string): Promise<IUser | null> {
    return await userRepository.findById(userId);
  }
}
  