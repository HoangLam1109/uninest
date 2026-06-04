export type RoomLandlord = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

export type Room = {
  _id: string;
  title: string;
  description?: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  pricePerMonth: number;
  depositAmount?: number;
  electricityRate?: number;
  waterRate?: number;
  status?: string;
  roomType?: string;
  areaSqm?: number;
  maxOccupants?: number;
  isPublished?: boolean;
  landlordId?: string | RoomLandlord;
  deletedAt?: string | null;
};

export type RoomListResponse = {
  success: boolean;
  data: Room[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type RoomResponse = {
  success: boolean;
  data: Room;
  message?: string;
};

export type RoomImage = {
  _id: string;
  roomId?: string;
  url: string;
  caption?: string;
  order?: number;
  isPrimary?: boolean;
};

export type RoomImageListResponse = {
  success: boolean;
  data: RoomImage[];
};
