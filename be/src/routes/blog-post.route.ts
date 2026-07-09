import express from "express";
import {
  createBlogPost,
  deleteBlogPost,
  getAdminBlogPosts,
  getPublicBlogPostBySlug,
  getPublicBlogPosts,
  publishBlogPost,
  unpublishBlogPost,
  updateBlogPost,
} from "../controllers/blog-post.controller.js";
import { USER_ROLES } from "../constants/role.constant.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", getPublicBlogPosts);
router.get("/admin", authenticateMiddleware.authenticateUser, authorizeRoles(USER_ROLES.ADMIN), getAdminBlogPosts);
router.post(
  "/admin",
  authenticateMiddleware.authenticateUser,
  authorizeRoles(USER_ROLES.ADMIN),
  uploadSingleImage,
  createBlogPost,
);
router.put(
  "/admin/:id",
  authenticateMiddleware.authenticateUser,
  authorizeRoles(USER_ROLES.ADMIN),
  uploadSingleImage,
  updateBlogPost,
);
router.patch(
  "/admin/:id/publish",
  authenticateMiddleware.authenticateUser,
  authorizeRoles(USER_ROLES.ADMIN),
  publishBlogPost,
);
router.patch(
  "/admin/:id/unpublish",
  authenticateMiddleware.authenticateUser,
  authorizeRoles(USER_ROLES.ADMIN),
  unpublishBlogPost,
);
router.delete(
  "/admin/:id",
  authenticateMiddleware.authenticateUser,
  authorizeRoles(USER_ROLES.ADMIN),
  deleteBlogPost,
);
router.get("/:slug", getPublicBlogPostBySlug);

export default router;
