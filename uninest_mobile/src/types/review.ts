export type ReviewReviewer = {
  _id: string;
  fullName?: string;
  avatar?: string;
};

export type Review = {
  _id: string;
  reviewerId: string | ReviewReviewer;
  roomId: string;
  rating: number;
  comment: string;
  imageUrls?: string[];
  landlordReply?: string;
  isVerified?: boolean;
  createdAt?: string;
};

export type ReviewStatistics = {
  averageRating: number;
  reviewCount: number;
  ratingDistribution?: { _id: number; count: number }[];
};

export type RoomReviewsResponse = {
  success: boolean;
  data: Review[];
  statistics?: ReviewStatistics;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
