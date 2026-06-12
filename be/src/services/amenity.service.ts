import { AmenityRepository } from "../repositories/amenity.repo.js";

const DEFAULT_AMENITIES = [
  "Máy lạnh",
  "Máy giặt",
  "Kệ bếp",
  "Ban công",
  "Cửa sổ lớn",
  "Chỗ để xe",
  "Giờ giấc tự do",
  "Không chung chủ",
  "Wifi",
  "Tủ lạnh",
  "Nội thất cơ bản",
  "Nhà vệ sinh riêng",
];

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export const AmenityService = {
  ensureDefaultAmenities: async () => {
    const existingAmenities = await AmenityRepository.findAll();
    if (existingAmenities.length > 0) return existingAmenities;

    await Promise.all(
      DEFAULT_AMENITIES.map(async (name) => {
        try {
          await AmenityRepository.create({ name });
        } catch (error: any) {
          if (error?.code !== 11000) throw error;
        }
      })
    );

    return AmenityRepository.findAll();
  },

  getAllAmenities: async () => {
    return AmenityService.ensureDefaultAmenities();
  },

  createAmenity: async (input: { name: string }) => {
    const name = normalizeName(input.name);
    if (!name) throw new Error("Amenity name is required");

    return AmenityRepository.create({ name });
  },

  updateAmenity: async (id: string, input: { name?: string }) => {
    const updateData: { name?: string } = {};
    if (input.name !== undefined) {
      const name = normalizeName(input.name);
      if (!name) throw new Error("Amenity name is required");
      updateData.name = name;
    }

    return AmenityRepository.update(id, updateData);
  },

  deleteAmenity: async (id: string) => {
    return AmenityRepository.delete(id);
  },
};
