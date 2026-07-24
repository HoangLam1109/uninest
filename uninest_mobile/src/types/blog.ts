export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string | null;
  authorName: string;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type BlogListResponse = {
  success: boolean;
  data: BlogPost[];
  pagination: BlogPagination;
};

export type BlogResponse = {
  success: boolean;
  data: BlogPost;
  message?: string;
};
