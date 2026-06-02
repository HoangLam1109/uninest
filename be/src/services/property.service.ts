import { PropertyRepository } from "../repositories/property.repo.js";

export const PropertyService = {
  createProperty: async (data: any, landlordId: string) => {
    return await PropertyRepository.create({
      ...data,
      landlordId,
      totalRooms: data.totalRooms || 0,
    });
  },

  getAllProperties: async (filter: any, skip: number, limit: number) => {
    const [properties, total] = await Promise.all([
      PropertyRepository.findAll(filter, skip, limit),
      PropertyRepository.count(filter),
    ]);

    return { properties, total };
  },

  getPropertyById: async (id: string, landlordId: string) => {
    return await PropertyRepository.findById(id, landlordId);
  },

  getPropertyByIdPublic: async (id: string) => {
    return await PropertyRepository.findByIdPublic(id);
  },

  updateProperty: async (id: string, landlordId: string, data: any) => {
    // Prevent direct landlordId change
    const updateData = { ...data };
    delete updateData.landlordId;
    return await PropertyRepository.update(id, landlordId, updateData);
  },

  deleteProperty: async (id: string, landlordId: string) => {
    return await PropertyRepository.softDelete(id, landlordId);
  },

  searchProperties: async (keyword: any, skip: number, limit: number) => {
    const [properties, total] = await Promise.all([
      PropertyRepository.search(keyword, skip, limit),
      PropertyRepository.countSearch(keyword),
    ]);

    return { properties, total };
  },
};
