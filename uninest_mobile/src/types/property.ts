export type Property = {
  _id: string;
  name: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  totalRooms?: number;
  description?: string;
  coverImageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePropertyPayload = {
  name: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  totalRooms?: number;
  description?: string;
  coverImageUrl?: string;
};

export type PropertyListResponse = {
  success: boolean;
  data: Property[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type PropertyResponse = {
  success: boolean;
  message?: string;
  data: Property;
};
