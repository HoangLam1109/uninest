import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "UniNest API Documentation",
      version: "1.0.0",
      description:
        "API documentation for UniNest - Student Housing Management Platform",
      contact: { name: "UniNest Team" },
    },
    servers: [
      { url: "http://localhost:3000", description: "Development Server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string", format: "email" },
            fullName: { type: "string" },
            phone: { type: "string" },
            avatarUrl: { type: "string" },
            role: {
              type: "string",
              enum: ["ADMIN", "STAFF", "LANDLORD", "TENANT", "GUEST"],
            },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Property: {
          type: "object",
          properties: {
            _id: { type: "string" },
            landlordId: { type: "string" },
            name: { type: "string" },
            address: { type: "string" },
            city: { type: "string" },
            district: { type: "string" },
            ward: { type: "string" },
            latitude: { type: "number" },
            longitude: { type: "number" },
            totalRooms: { type: "number" },
            description: { type: "string" },
            coverImageUrl: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Room: {
          type: "object",
          properties: {
            _id: { type: "string" },
            propertyId: { type: "string", nullable: true },
            landlordId: { type: "string" },
            amenityIds: { type: "array", items: { type: "string" } },
            title: { type: "string" },
            description: { type: "string" },
            address: { type: "string" },
            city: { type: "string" },
            district: { type: "string" },
            ward: { type: "string" },
            latitude: { type: "number" },
            longitude: { type: "number" },
            pricePerMonth: { type: "number" },
            depositAmount: { type: "number" },
            electricityRate: { type: "number" },
            waterRate: { type: "number" },
            areaSqm: { type: "number" },
            maxOccupants: { type: "number" },
            roomType: {
              type: "string",
              enum: ["STUDIO", "SINGLE", "SHARED", "APARTMENT"],
            },
            status: {
              type: "string",
              enum: ["AVAILABLE", "DEPOSITED", "RENTED", "MAINTENANCE"],
            },
            isPublished: { type: "boolean" },
            tenants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tenantId: { type: "string" },
                  isPrimaryTenant: { type: "boolean" },
                },
              },
            },
            deletedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        RoomImage: {
          type: "object",
          properties: {
            _id: { type: "string" },
            roomId: { type: "string" },
            url: { type: "string" },
            caption: { type: "string" },
            order: { type: "number" },
            isPrimary: { type: "boolean" },
            uploadedAt: { type: "string", format: "date-time" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            roomId: { type: "string" },
            tenantId: { type: "string" },
            contractId: { type: "string", nullable: true },
            checkInDate: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
            },
            totalPrice: { type: "number" },
            movedInAt: { type: "string", format: "date-time", nullable: true },
            movedOutAt: { type: "string", format: "date-time", nullable: true },
            isCurrent: { type: "boolean" },
            notes: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Contract: {
          type: "object",
          properties: {
            _id: { type: "string" },
            bookingId: { type: "string" },
            landlordId: { type: "string" },
            tenantId: { type: "string" },
            renewalFromId: { type: "string", nullable: true },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time", nullable: true },
            monthlyRent: { type: "number" },
            depositAmount: { type: "number" },
            terms: { type: "string" },
            contractFileUrl: { type: "string" },
            status: {
              type: "string",
              enum: ["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"],
            },
            signedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Invoice: {
          type: "object",
          properties: {
            _id: { type: "string" },
            bookingId: { type: "string" },
            landlordId: { type: "string" },
            tenantId: { type: "string" },
            billingMonth: { type: "string", example: "2026-06" },
            dueDate: { type: "string", format: "date-time" },
            rentAmount: { type: "number" },
            electricityAmount: { type: "number" },
            waterAmount: { type: "number" },
            additionalFees: { type: "number" },
            totalAmount: { type: "number" },
            status: {
              type: "string",
              enum: ["DRAFT", "SENT", "PAID", "OVERDUE"],
            },
            notes: { type: "string" },
            sentAt: { type: "string", format: "date-time", nullable: true },
            paidAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        InvoiceDetail: {
          type: "object",
          properties: {
            _id: { type: "string" },
            invoiceId: { type: "string" },
            electricityOldIndex: { type: "number" },
            electricityNewIndex: { type: "number" },
            electricityUsage: { type: "number" },
            electricityRate: { type: "number" },
            electricityAmount: { type: "number" },
            waterOldIndex: { type: "number" },
            waterNewIndex: { type: "number" },
            waterUsage: { type: "number" },
            waterRate: { type: "number" },
            waterAmount: { type: "number" },
            otherDetails: { type: "object" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Review: {
          type: "object",
          properties: {
            _id: { type: "string" },
            reviewerId: { type: "string" },
            roomId: { type: "string" },
            rating: { type: "number", minimum: 1, maximum: 5 },
            comment: { type: "string" },
            imageUrls: { type: "array", items: { type: "string" } },
            landlordReply: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Favorite: {
          type: "object",
          properties: {
            _id: { type: "string" },
            tenantId: { type: "string" },
            roomId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            bookingId: { type: "string", nullable: true },
            payerId: { type: "string", description: "Payer ID" },
            receiverId: { type: "string" },
            invoiceId: { type: "string", nullable: true },
            amount: { type: "number", example: 3500000 },
            currency: { type: "string", default: "VND" },
            type: {
              type: "string",
              enum: [
                "RENT",
                "DEPOSIT",
                "UTILITY",
                "SERVICE_FEE",
                "TENANT_PACKAGE",
                "LANDLORD_PACKAGE",
                "REFUND",
              ],
            },
            method: {
              type: "string",
              enum: ["BANK_TRANSFER", "CASH", "PAYOS"],
            },
            status: {
              type: "string",
              enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
            },
            transactionRef: { type: "string", nullable: true },
            gatewayResponse: { type: "object", nullable: true },
            note: { type: "string" },
            paidAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ServicePackage: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Premium" },
            description: { type: "string" },
            price: { type: "number", example: 99000 },
            durationDays: { type: "number", example: 30 },
            features: { type: "array", items: { type: "string" } },
            isActive: { type: "boolean", default: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ServiceSubscription: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            packageId: { type: "string" },
            paymentId: { type: "string" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
            },
            autoRenew: { type: "boolean", default: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "array", items: { type: "object" } },
            pagination: {
              type: "object",
              properties: {
                total: { type: "number" },
                page: { type: "number" },
                limit: { type: "number" },
                totalPages: { type: "number" },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
    paths: {
      // ==================== AUTH ====================
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "fullName", "password", "phone"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "user@example.com",
                    },
                    fullName: { type: "string", example: "Nguyen Van A" },
                    password: {
                      type: "string",
                      format: "password",
                      example: "Abc@1234",
                    },
                    phone: { type: "string", example: "0912345678" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User created successfully" },
            400: {
              description: "Missing required fields / Email already exists",
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "user@example.com",
                    },
                    password: {
                      type: "string",
                      format: "password",
                      example: "Abc@1234",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                          accessToken: { type: "string" },
                          refreshToken: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "User not found / Invalid password" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current authenticated user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "User fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout user (client drops tokens)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Logout successful" },
          },
        },
      },
      "/api/auth/refresh-token": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token using refresh token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: {
                    refreshToken: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIs...",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Token refreshed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: { accessToken: { type: "string" } },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "No refresh token / Invalid or expired token" },
          },
        },
      },

      // ==================== USERS ====================
      "/api/users/getByEmail/{email}": {
        get: {
          tags: ["Users"],
          summary: "Get user by email",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "email",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "user@example.com",
            },
          ],
          responses: {
            200: { description: "User found" },
            500: { description: "Server error" },
          },
        },
      },
      "/api/users/getByFullName/{fullName}": {
        get: {
          tags: ["Users"],
          summary: "Get user by full name",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "fullName",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "Nguyen Van A",
            },
          ],
          responses: {
            200: { description: "User found" },
            500: { description: "Server error" },
          },
        },
      },
      "/api/users/getByPhone/{phone}": {
        get: {
          tags: ["Users"],
          summary: "Get user by phone",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "phone",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "0912345678",
            },
          ],
          responses: {
            200: { description: "User found" },
            500: { description: "Server error" },
          },
        },
      },
      "/api/users/getAll": {
        get: {
          tags: ["Users"],
          summary: "Get all users",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "List of all users" },
          },
        },
      },
      "/api/users/create": {
        post: {
          tags: ["Users"],
          summary: "Create a new user (Admin)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "fullName", "password", "phone"],
                  properties: {
                    email: { type: "string", format: "email" },
                    fullName: { type: "string" },
                    password: { type: "string" },
                    phone: { type: "string" },
                    role: {
                      type: "string",
                      enum: ["ADMIN", "STAFF", "LANDLORD", "TENANT", "GUEST"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User created" },
          },
        },
      },
      "/api/users/update/{id}": {
        put: {
          tags: ["Users"],
          summary: "Update user by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    fullName: { type: "string" },
                    phone: { type: "string" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "User updated" },
            404: { description: "User not found" },
          },
        },
      },
      "/api/users/delete/{id}": {
        delete: {
          tags: ["Users"],
          summary: "Delete user by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "User deleted" },
            404: { description: "User not found" },
          },
        },
      },
      "/api/users/getById/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get user by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "User found" },
            404: { description: "User not found" },
          },
        },
      },

      // ==================== PROPERTIES ====================
      "/api/properties/create": {
        post: {
          tags: ["Properties"],
          summary: "Create a new property (Landlord)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "address"],
                  properties: {
                    name: { type: "string", example: "Sunrise Apartments" },
                    address: {
                      type: "string",
                      example: "123 Nguyen Hue, District 1",
                    },
                    city: { type: "string", example: "Ho Chi Minh" },
                    district: { type: "string", example: "District 1" },
                    ward: { type: "string", example: "Ben Nghe" },
                    latitude: { type: "number", example: 10.7769 },
                    longitude: { type: "number", example: 106.7009 },
                    totalRooms: { type: "number", example: 20 },
                    description: { type: "string" },
                    coverImageUrl: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Property created successfully" },
            400: { description: "Name and address are required" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/properties/": {
        get: {
          tags: ["Properties"],
          summary: "Get all properties (Landlord's own)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "city", in: "query", schema: { type: "string" } },
            { name: "district", in: "query", schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } },
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of properties" },
          },
        },
      },
      "/api/properties/{id}": {
        get: {
          tags: ["Properties"],
          summary: "Get property by ID (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Property found" },
            404: { description: "Property not found" },
          },
        },
        put: {
          tags: ["Properties"],
          summary: "Update property (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    address: { type: "string" },
                    city: { type: "string" },
                    district: { type: "string" },
                    description: { type: "string" },
                    coverImageUrl: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Property updated" },
            404: { description: "Property not found" },
          },
        },
        delete: {
          tags: ["Properties"],
          summary: "Soft delete property (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Property deleted successfully" },
            404: { description: "Property not found" },
          },
        },
      },
      "/api/properties/public/{id}": {
        get: {
          tags: ["Properties"],
          summary: "Get property by ID (Public)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Property found" },
            400: { description: "Invalid id" },
            404: { description: "Property not found" },
          },
        },
      },

      // ==================== ROOMS ====================
      "/api/rooms/create": {
        post: {
          tags: ["Rooms"],
          summary: "Create a new room (Landlord)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "address", "pricePerMonth"],
                  properties: {
                    propertyId: { type: "string" },
                    title: { type: "string", example: "Cozy Studio near RMIT" },
                    description: { type: "string" },
                    address: { type: "string" },
                    city: { type: "string" },
                    district: { type: "string" },
                    ward: { type: "string" },
                    latitude: { type: "number" },
                    longitude: { type: "number" },
                    pricePerMonth: { type: "number", example: 3500000 },
                    depositAmount: { type: "number" },
                    electricityRate: { type: "number" },
                    waterRate: { type: "number" },
                    areaSqm: { type: "number" },
                    maxOccupants: { type: "number", default: 1 },
                    roomType: {
                      type: "string",
                      enum: ["STUDIO", "SINGLE", "SHARED", "APARTMENT"],
                    },
                    amenityIds: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Room created successfully" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/rooms/getAll": {
        get: {
          tags: ["Rooms"],
          summary: "Get all rooms (Landlord's own)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "city", in: "query", schema: { type: "string" } },
            { name: "district", in: "query", schema: { type: "string" } },
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["AVAILABLE", "DEPOSITED", "RENTED", "MAINTENANCE"],
              },
            },
            { name: "minPrice", in: "query", schema: { type: "number" } },
            { name: "maxPrice", in: "query", schema: { type: "number" } },
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of rooms" },
          },
        },
      },
      "/api/rooms/search": {
        get: {
          tags: ["Rooms"],
          summary: "Search rooms",
          parameters: [
            {
              name: "q",
              in: "query",
              schema: { type: "string" },
              description: "Search keyword (title, address, city, district)",
            },
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["AVAILABLE", "DEPOSITED", "RENTED", "MAINTENANCE"],
              },
            },
            {
              name: "roomType",
              in: "query",
              schema: {
                type: "string",
                enum: ["STUDIO", "SINGLE", "SHARED", "APARTMENT"],
              },
            },
            { name: "minPrice", in: "query", schema: { type: "number" } },
            { name: "maxPrice", in: "query", schema: { type: "number" } },
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Search results" },
          },
        },
      },
      "/api/rooms/getById/{id}": {
        get: {
          tags: ["Rooms"],
          summary: "Get room by ID (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Room found" },
            404: { description: "Room not found" },
          },
        },
      },
      "/api/rooms/update/{id}": {
        put: {
          tags: ["Rooms"],
          summary: "Update room (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    pricePerMonth: { type: "number" },
                    status: {
                      type: "string",
                      enum: ["AVAILABLE", "DEPOSITED", "RENTED", "MAINTENANCE"],
                    },
                    roomType: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Room updated" },
            404: { description: "Room not found" },
          },
        },
      },
      "/api/rooms/delete/{id}": {
        delete: {
          tags: ["Rooms"],
          summary: "Delete room (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Room deleted successfully" },
            404: { description: "Room not found" },
          },
        },
      },
      "/api/rooms/{id}/publish": {
        patch: {
          tags: ["Rooms"],
          summary: "Publish a room",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Room published successfully" },
            404: { description: "Room not found" },
          },
        },
      },
      "/api/rooms/{id}/unpublish": {
        patch: {
          tags: ["Rooms"],
          summary: "Unpublish a room",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Room unpublished successfully" },
            404: { description: "Room not found" },
          },
        },
      },
      "/api/rooms/tenants": {
        get: {
          tags: ["Rooms"],
          summary: "Get tenant list by landlord (alias)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "List of tenants" },
          },
        },
      },
      "/api/rooms/{id}/images": {
        post: {
          tags: ["Rooms"],
          summary: "Upload room image (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Room ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["url"],
                  properties: {
                    url: {
                      type: "string",
                      example: "https://example.com/image.jpg",
                    },
                    caption: { type: "string" },
                    order: { type: "number", default: 0 },
                    isPrimary: { type: "boolean", default: false },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Image uploaded successfully" },
            404: { description: "Room not found" },
          },
        },
        get: {
          tags: ["Rooms"],
          summary: "Get room images (Public)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Room ID",
            },
          ],
          responses: {
            200: { description: "List of room images" },
          },
        },
      },
      "/api/rooms/{id}/images/{imageId}/primary": {
        patch: {
          tags: ["Rooms"],
          summary: "Set primary room image",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Room ID",
            },
            {
              name: "imageId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Image ID",
            },
          ],
          responses: {
            200: { description: "Primary image set successfully" },
          },
        },
      },
      "/api/rooms/{id}/images/{imageId}": {
        delete: {
          tags: ["Rooms"],
          summary: "Delete room image",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Room ID",
            },
            {
              name: "imageId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Image ID",
            },
          ],
          responses: {
            200: { description: "Image deleted successfully" },
            404: { description: "Image not found" },
          },
        },
      },

      // ==================== FAVORITES ====================
      "/api/favorites/": {
        get: {
          tags: ["Favorites"],
          summary: "Get tenant's favorite rooms",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of favorites" },
          },
        },
      },
      "/api/favorites/{roomId}/check": {
        get: {
          tags: ["Favorites"],
          summary: "Check if room is favorited by current user",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "roomId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Favorite status",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          roomId: { type: "string" },
                          isFavorited: { type: "boolean" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/favorites/{roomId}/count": {
        get: {
          tags: ["Favorites"],
          summary: "Get room favorite count (Public)",
          parameters: [
            {
              name: "roomId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Favorite count",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          roomId: { type: "string" },
                          favoriteCount: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/favorites/{roomId}": {
        post: {
          tags: ["Favorites"],
          summary: "Add room to favorites",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "roomId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            201: { description: "Room added to favorites" },
            409: { description: "Room is already in your favorites" },
          },
        },
        delete: {
          tags: ["Favorites"],
          summary: "Remove room from favorites",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "roomId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Room removed from favorites" },
            404: { description: "Favorite not found" },
          },
        },
      },

      // ==================== BOOKINGS ====================
      "/api/bookings/": {
        post: {
          tags: ["Bookings"],
          summary: "Create a new booking (Tenant)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["roomId", "checkInDate"],
                  properties: {
                    roomId: { type: "string", example: "665a1b2c..." },
                    checkInDate: {
                      type: "string",
                      format: "date-time",
                      example: "2026-07-01T00:00:00.000Z",
                    },
                    notes: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Booking created successfully" },
            400: { description: "Room ID and viewing date are required" },
          },
        },
      },
      "/api/bookings/my": {
        get: {
          tags: ["Bookings"],
          summary: "Get current tenant's bookings",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of tenant's bookings" },
          },
        },
      },
      "/api/bookings/landlord": {
        get: {
          tags: ["Bookings"],
          summary: "Get landlord's bookings for their rooms",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
              },
            },
          ],
          responses: {
            200: { description: "Paginated list of landlord's bookings" },
          },
        },
      },
      "/api/bookings/{id}": {
        get: {
          tags: ["Bookings"],
          summary: "Get booking by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Booking found" },
          },
        },
      },
      "/api/bookings/{id}/approve": {
        patch: {
          tags: ["Bookings"],
          summary: "Approve booking (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Booking approved successfully" },
            403: { description: "Landlord does not own this room" },
            404: { description: "Booking not found" },
          },
        },
      },
      "/api/bookings/{id}/reject": {
        patch: {
          tags: ["Bookings"],
          summary: "Reject booking (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Booking rejected successfully" },
            403: { description: "Landlord does not own this room" },
            404: { description: "Booking not found" },
          },
        },
      },
      "/api/bookings/{id}/cancel": {
        patch: {
          tags: ["Bookings"],
          summary: "Cancel booking (Tenant)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Booking cancelled successfully" },
          },
        },
      },

      // ==================== CONTRACTS ====================
      "/api/contracts/": {
        post: {
          tags: ["Contracts"],
          summary: "Create contract from booking (Landlord)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["bookingId", "monthlyRent"],
                  properties: {
                    bookingId: { type: "string" },
                    monthlyRent: { type: "number", example: 3500000 },
                    depositAmount: { type: "number", example: 3500000 },
                    terms: { type: "string" },
                    contractFileUrl: { type: "string" },
                    startDate: {
                      type: "string",
                      format: "date-time",
                      example: "2026-07-01T00:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Contract created successfully" },
            400: { description: "Booking ID and monthly rent are required" },
            403: { description: "Landlord does not own this booking" },
          },
        },
      },
      "/api/contracts/landlord": {
        get: {
          tags: ["Contracts"],
          summary: "Get landlord's contracts",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of landlord's contracts" },
          },
        },
      },
      "/api/contracts/tenant": {
        get: {
          tags: ["Contracts"],
          summary: "Get tenant's contracts",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of tenant's contracts" },
          },
        },
      },
      "/api/contracts/{id}": {
        get: {
          tags: ["Contracts"],
          summary: "Get contract by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Contract found" },
            403: { description: "User does not have access" },
          },
        },
        put: {
          tags: ["Contracts"],
          summary: "Update contract (Landlord - DRAFT only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    monthlyRent: { type: "number" },
                    depositAmount: { type: "number" },
                    terms: { type: "string" },
                    contractFileUrl: { type: "string" },
                    startDate: { type: "string", format: "date-time" },
                    endDate: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Contract updated successfully" },
            403: { description: "Landlord does not own this contract" },
            404: { description: "Contract not found" },
          },
        },
      },
      "/api/contracts/{id}/activate": {
        patch: {
          tags: ["Contracts"],
          summary: "Activate contract (Landlord - DRAFT to ACTIVE)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Contract activated successfully" },
            403: { description: "Landlord does not own this contract" },
          },
        },
      },
      "/api/contracts/{id}/terminate": {
        patch: {
          tags: ["Contracts"],
          summary: "Terminate contract (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Contract terminated successfully" },
            403: { description: "Landlord does not own this contract" },
          },
        },
      },
      "/api/contracts/{id}/renew": {
        post: {
          tags: ["Contracts"],
          summary: "Renew contract (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["startDate"],
                  properties: {
                    startDate: {
                      type: "string",
                      format: "date-time",
                      example: "2027-07-01T00:00:00.000Z",
                    },
                    monthlyRent: { type: "number" },
                    depositAmount: { type: "number" },
                    endDate: { type: "string", format: "date-time" },
                    terms: { type: "string" },
                    contractFileUrl: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Contract renewed successfully" },
            400: { description: "Start date is required" },
            403: { description: "Landlord does not own this contract" },
          },
        },
      },

      // ==================== INVOICES ====================
      "/api/invoices/": {
        post: {
          tags: ["Invoices"],
          summary: "Create invoice (Landlord)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "bookingId",
                    "billingMonth",
                    "dueDate",
                    "rentAmount",
                  ],
                  properties: {
                    bookingId: { type: "string" },
                    billingMonth: {
                      type: "string",
                      example: "2026-06",
                      pattern: "^\\d{4}-\\d{2}$",
                    },
                    dueDate: {
                      type: "string",
                      format: "date-time",
                      example: "2026-07-05T00:00:00.000Z",
                    },
                    rentAmount: { type: "number", example: 3500000 },
                    electricityAmount: { type: "number", example: 450000 },
                    waterAmount: { type: "number", example: 80000 },
                    additionalFees: { type: "number", example: 100000 },
                    notes: { type: "string" },
                    detailData: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Invoice created successfully" },
            400: {
              description:
                "Booking ID, billing month, due date, and rent amount are required",
            },
          },
        },
      },
      "/api/invoices/landlord": {
        get: {
          tags: ["Invoices"],
          summary: "Get landlord's invoices",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of landlord's invoices" },
          },
        },
      },
      "/api/invoices/tenant": {
        get: {
          tags: ["Invoices"],
          summary: "Get tenant's invoices",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of tenant's invoices" },
          },
        },
      },
      "/api/invoices/{id}": {
        get: {
          tags: ["Invoices"],
          summary: "Get invoice by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Invoice found" },
            403: { description: "User does not have access" },
          },
        },
        put: {
          tags: ["Invoices"],
          summary: "Update invoice (Landlord - DRAFT only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rentAmount: { type: "number" },
                    electricityAmount: { type: "number" },
                    waterAmount: { type: "number" },
                    additionalFees: { type: "number" },
                    notes: { type: "string" },
                    dueDate: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Invoice updated successfully" },
            403: { description: "Landlord does not own this invoice" },
            404: { description: "Invoice not found" },
          },
        },
        delete: {
          tags: ["Invoices"],
          summary: "Delete invoice (Landlord - DRAFT only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Invoice deleted successfully" },
            403: { description: "Landlord does not own this invoice" },
            404: { description: "Invoice not found" },
          },
        },
      },
      "/api/invoices/{id}/send": {
        patch: {
          tags: ["Invoices"],
          summary: "Send invoice (Landlord - DRAFT to SENT)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Invoice sent successfully" },
            403: { description: "Landlord does not own this invoice" },
          },
        },
      },
      "/api/invoices/{id}/mark-paid": {
        patch: {
          tags: ["Invoices"],
          summary: "Mark invoice as paid (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Invoice marked as paid" },
            403: { description: "Landlord does not own this invoice" },
          },
        },
      },
      "/api/invoices/{id}/detail": {
        get: {
          tags: ["Invoices"],
          summary: "Get invoice detail",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Invoice detail" },
            403: { description: "User does not have access" },
          },
        },
        put: {
          tags: ["Invoices"],
          summary: "Update invoice detail (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    electricityOldIndex: { type: "number" },
                    electricityNewIndex: { type: "number" },
                    electricityRate: { type: "number" },
                    waterOldIndex: { type: "number" },
                    waterNewIndex: { type: "number" },
                    waterRate: { type: "number" },
                    otherDetails: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Invoice detail updated successfully" },
            403: { description: "User does not have access" },
          },
        },
      },

      // ==================== REVIEWS ====================
      "/api/reviews/stats": {
        get: {
          tags: ["Reviews"],
          summary: "Get room rating statistics (Public)",
          parameters: [
            {
              name: "roomId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Rating statistics" },
            400: { description: "Valid room ID is required" },
          },
        },
      },
      "/api/reviews/room": {
        get: {
          tags: ["Reviews"],
          summary: "Get reviews by room (Public)",
          parameters: [
            {
              name: "roomId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of reviews with statistics" },
            400: { description: "Valid room ID is required" },
          },
        },
      },
      "/api/reviews/": {
        post: {
          tags: ["Reviews"],
          summary: "Create a review (Tenant)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["roomId", "rating", "comment"],
                  properties: {
                    roomId: { type: "string" },
                    rating: {
                      type: "number",
                      minimum: 1,
                      maximum: 5,
                      example: 4,
                    },
                    comment: {
                      type: "string",
                      minLength: 10,
                      example: "Great room with excellent facilities!",
                    },
                    imageUrls: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Review created successfully" },
            400: { description: "Room ID, rating, and comment are required" },
          },
        },
        get: {
          tags: ["Reviews"],
          summary: "Get my reviews (Tenant)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of tenant's reviews" },
          },
        },
      },
      "/api/reviews/{id}": {
        get: {
          tags: ["Reviews"],
          summary: "Get review by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Review found" },
            404: { description: "Review not found" },
          },
        },
        put: {
          tags: ["Reviews"],
          summary: "Update review (Tenant)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rating: { type: "number", minimum: 1, maximum: 5 },
                    comment: { type: "string" },
                    imageUrls: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Review updated successfully" },
            403: { description: "Can only edit own review" },
            404: { description: "Review not found" },
          },
        },
        delete: {
          tags: ["Reviews"],
          summary: "Delete review (Tenant)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Review deleted successfully" },
            403: { description: "Can only delete own review" },
            404: { description: "Review not found" },
          },
        },
      },
      "/api/reviews/{id}/reply": {
        patch: {
          tags: ["Reviews"],
          summary: "Add landlord reply to review",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["reply"],
                  properties: {
                    reply: {
                      type: "string",
                      example: "Thank you for your feedback!",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Reply added successfully" },
            403: { description: "Landlord does not own the room" },
            404: { description: "Review not found" },
          },
        },
      },

      // ==================== PAYMENTS ====================
      "/api/payments/pay-invoice/{invoiceId}": {
        post: {
          tags: ["Payments"],
          summary: "Pay invoice (PAYOS)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "invoiceId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Invoice ID to pay",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["method"],
                  properties: {
                    method: {
                      type: "string",
                      enum: ["PAYOS"],
                      example: "PAYOS",
                      description:
                        "Payment method: PAYOS for online payment gateway",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description:
                "Payment processed. For PAYOS: status PENDING with checkoutUrl.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          payment: { $ref: "#/components/schemas/Payment" },
                          checkoutUrl: {
                            type: "string",
                            description:
                              "PayOS checkout URL (only when method=PAYOS)",
                          },
                          orderCode: {
                            type: "number",
                            description:
                              "PayOS order code (only when method=PAYOS)",
                          },
                          status: {
                            type: "string",
                            enum: ["COMPLETED", "PENDING"],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Invalid invoice / Already paid / Wrong method",
            },
          },
        },
      },
      "/api/payments/pay-deposit/{bookingId}": {
        post: {
          tags: ["Payments"],
          summary: "Pay deposit (PAYOS)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookingId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Booking ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["method"],
                  properties: {
                    method: {
                      type: "string",
                      enum: ["PAYOS"],
                      example: "PAYOS",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Deposit payment processed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          payment: { $ref: "#/components/schemas/Payment" },
                          checkoutUrl: { type: "string" },
                          status: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Deposit already paid" },
          },
        },
      },
      "/api/payments/stats": {
        get: {
          tags: ["Payments"],
          summary: "Get payment statistics",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Payment statistics",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          totalPayments: { type: "number" },
                          totalAmount: { type: "number" },
                          pendingAmount: { type: "number" },
                          completedAmount: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/payments/my": {
        get: {
          tags: ["Payments"],
          summary: "Get my payments (as payer/tenant)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of my payments" },
          },
        },
      },
      "/api/payments/received": {
        get: {
          tags: ["Payments"],
          summary: "Get received payments (as receiver/landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of received payments" },
          },
        },
      },
      "/api/payments/invoice/{invoiceId}": {
        get: {
          tags: ["Payments"],
          summary: "Get payments by invoice (Landlord)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "invoiceId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "List of payments for invoice" },
            403: { description: "You do not own this invoice" },
          },
        },
      },
      "/api/payments/{id}/refund": {
        post: {
          tags: ["Payments"],
          summary: "Request refund for a payment",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Payment ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["reason"],
                  properties: {
                    reason: {
                      type: "string",
                      example: "Overcharged for electricity",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Refund requested successfully" },
            403: { description: "Can only request refund for own payments" },
          },
        },
      },
      "/api/payments/{id}": {
        get: {
          tags: ["Payments"],
          summary: "Get payment by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Payment found" },
            403: { description: "You do not have access to this payment" },
          },
        },
      },
      // ==================== SERVICE PACKAGES ====================
      "/api/service-packages/active": {
        get: {
          tags: ["Service Packages"],
          summary: "Get active service packages (Public)",
          responses: {
            200: {
              description: "List of active service packages",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ServicePackage" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/service-packages/": {
        get: {
          tags: ["Service Packages"],
          summary: "Get all service packages (Public)",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of service packages" },
          },
        },
        post: {
          tags: ["Service Packages"],
          summary: "Create service package (Admin only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "price", "durationDays"],
                  properties: {
                    name: { type: "string", example: "Premium" },
                    description: {
                      type: "string",
                      example: "Premium listing with priority placement",
                    },
                    price: { type: "number", example: 99000 },
                    durationDays: { type: "number", example: 30 },
                    features: {
                      type: "array",
                      items: { type: "string" },
                      example: ["Priority listing", "Highlighted badge"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Package created" },
            403: { description: "Admin only" },
          },
        },
      },
      "/api/service-packages/{id}": {
        get: {
          tags: ["Service Packages"],
          summary: "Get package by ID (Public)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Package found" },
            404: { description: "Package not found" },
          },
        },
        put: {
          tags: ["Service Packages"],
          summary: "Update service package (Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    durationDays: { type: "number" },
                    features: { type: "array", items: { type: "string" } },
                    isActive: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Package updated" },
            403: { description: "Admin only" },
          },
        },
        delete: {
          tags: ["Service Packages"],
          summary: "Delete service package (Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Package deleted" },
            403: { description: "Admin only" },
          },
        },
      },

      // ==================== SERVICE SUBSCRIPTIONS ====================
      "/api/service-subscriptions/packages/{packageId}/subscribe": {
        post: {
          tags: ["Service Subscriptions"],
          summary: "Subscribe to a service package (PAYOS)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "packageId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Service package ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["method"],
                  properties: {
                    method: {
                      type: "string",
                      enum: ["PAYOS"],
                      example: "PAYOS",
                    },
                    autoRenew: { type: "boolean", default: false },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description:
                "Subscription created. PAYOS: returns checkoutUrl.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          payment: { $ref: "#/components/schemas/Payment" },
                          checkoutUrl: { type: "string" },
                          status: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Already have active subscription" },
          },
        },
      },
      "/api/service-subscriptions/my": {
        get: {
          tags: ["Service Subscriptions"],
          summary: "Get my subscriptions",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "number", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "number", default: 10 },
            },
          ],
          responses: {
            200: { description: "Paginated list of my subscriptions" },
          },
        },
      },
      "/api/service-subscriptions/active": {
        get: {
          tags: ["Service Subscriptions"],
          summary: "Get my active subscription",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Active subscription or null",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        $ref: "#/components/schemas/ServiceSubscription",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/service-subscriptions/check-expiry": {
        post: {
          tags: ["Service Subscriptions"],
          summary: "Check and expire subscriptions (Admin only)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Expiry check result",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          expiredCount: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
            403: { description: "Admin only" },
          },
        },
      },
      "/api/service-subscriptions/{id}": {
        get: {
          tags: ["Service Subscriptions"],
          summary: "Get subscription by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Subscription found" },
            403: { description: "Not your subscription" },
          },
        },
      },
      "/api/service-subscriptions/{id}/cancel": {
        post: {
          tags: ["Service Subscriptions"],
          summary: "Cancel subscription",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Subscription cancelled" },
            400: { description: "Only active subscriptions can be cancelled" },
          },
        },
      },

      // ==================== PAYOS ====================
      "/api/payos/webhook": {
        post: {
          tags: ["PayOS"],
          summary: "PayOS webhook callback (called by PayOS servers)",
          description:
            "No auth required. PayOS sends payment status updates to this endpoint. The backend verifies the signature and updates payment status accordingly.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["code", "desc", "success", "data", "signature"],
                  properties: {
                    code: { type: "string", example: "00" },
                    desc: { type: "string" },
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        orderCode: { type: "number" },
                        amount: { type: "number" },
                        description: { type: "string" },
                        accountNumber: { type: "string" },
                        reference: { type: "string" },
                        transactionDateTime: { type: "string" },
                        currency: { type: "string" },
                      },
                    },
                    signature: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Webhook processed successfully" },
            400: { description: "Invalid webhook data / Payment not found" },
          },
        },
      },
      "/api/payos/status/{orderCode}": {
        get: {
          tags: ["PayOS"],
          summary: "Check PayOS payment status",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "orderCode",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "PayOS order code",
            },
          ],
          responses: {
            200: { description: "Payment status from PayOS" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsDoc(options);

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}
