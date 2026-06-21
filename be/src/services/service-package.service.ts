import type { UserRole } from "../constants/role.constant.js";
import { ServicePackageRepository } from "../repositories/service-package.repo.js";

export class ServicePackageService {
  static async create(data: {
    name: string;
    price: number;
    durationDays: number;
    targetRole: UserRole;
    description?: string;
    features?: Record<string, any>;
    maxRooms?: number;
  }) {
    return await ServicePackageRepository.create(data);
  }

  static async getById(id: string) {
    const pkg = await ServicePackageRepository.findById(id);
    if (!pkg) {
      throw new Error("Service package not found");
    }
    return pkg;
  }

  static async getAllActive(skip: number, limit: number) {
    const [packages, total] = await Promise.all([
      ServicePackageRepository.findAllActive(skip, limit),
      ServicePackageRepository.countAllActive(),
    ]);
    return { packages, total };
  }

  static async getAll(skip: number, limit: number) {
    const [packages, total] = await Promise.all([
      ServicePackageRepository.findAll(skip, limit),
      ServicePackageRepository.countAll(),
    ]);
    return { packages, total };
  }

  static async update(
    id: string,
    data: {
      name?: string;
      price?: number;
      durationDays?: number;
      targetRole?: UserRole;
      description?: string;
      features?: Record<string, any>;
      maxRooms?: number;
      isActive?: boolean;
    }
  ) {
    const pkg = await ServicePackageRepository.findById(id);
    if (!pkg) {
      throw new Error("Service package not found");
    }
    return await ServicePackageRepository.update(id, data);
  }

  static async delete(id: string) {
    const pkg = await ServicePackageRepository.findById(id);
    if (!pkg) {
      throw new Error("Service package not found");
    }
    return await ServicePackageRepository.softDelete(id);
  }
}
