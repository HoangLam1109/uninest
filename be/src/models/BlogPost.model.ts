import { Schema, model, type Document, type Types } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  coverImageStorageKey?: string;
  authorName: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  updatedByName?: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [180, "Blog title cannot exceed 180 characters"],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: [220, "Blog slug cannot exceed 220 characters"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [320, "Blog excerpt cannot exceed 320 characters"],
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
      trim: true,
    },
    coverImageUrl: {
      type: String,
      trim: true,
    },
    coverImageStorageKey: {
      type: String,
      trim: true,
    },
    authorName: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [120, "Author name cannot exceed 120 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedByName: {
      type: String,
      trim: true,
      maxlength: [120, "Updater name cannot exceed 120 characters"],
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "blog_posts",
  },
);

BlogPostSchema.index({ isPublished: 1, publishedAt: -1, deletedAt: 1 });

export const BlogPostModel = model<IBlogPost>("BlogPost", BlogPostSchema);
