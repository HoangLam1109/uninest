# UNINEST - API DOCUMENTATION

> **Base URL:** `http://localhost:<PORT>` (PORT từ biến môi trường)  
> **Default PORT:** có thể là 3000 hoặc 5000  
> **Content-Type:** `application/json` cho tất cả request có body

---

## Middleware Tổng Quan

Hệ thống sử dụng 2 middleware xác thực JWT:

| Middleware | Mô tả |
|---|---|
| `authenticateUser` | Xác thực Access Token từ Header `Authorization: Bearer <token>`. Gắn `req.user` và `req.userId`. |
| `refreshTokenValidation` | Xác thực Refresh Token từ Body `refreshToken`. Gắn `req.userId`. |

---

## 1. AUTH (`/api/auth`)

---

### 1.1 Đăng ký

**Method:** `POST`

**URL:** `http://localhost:3000/api/auth/register`

**Chức năng:** Đăng ký tài khoản mới.

**Middleware:** Không có

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "fullName": "Nguyen Van A",
  "password": "123a123@",
  "phone": "0901234567"
}
```

**Headers:** Không yêu cầu

**Response Thành Công (201):**
```json
{
  "message": "User created successfully!"
}
```

**Response Lỗi (400):**
```json
{
  "message": "Missing required fields!"
}
```
```json
{
  "message": "Email already exists!"
}
```

**Luồng xử lý:**
1. Controller nhận `email, fullName, password, phone`.
2. Validate các trường bắt buộc.
3. Kiểm tra email đã tồn tại chưa qua `UserService.getUserByEmail`.
4. Tạo user mới qua `UserService.createUser`.
5. Trả về kết quả.

---

### 1.2 Đăng nhập

**Method:** `POST`

**URL:** `http://localhost:3000/api/auth/login`

**Chức năng:** Đăng nhập bằng email và password, trả về Access Token + Refresh Token.

**Middleware:** Không có

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "password": "123a123@"
}
```

**Headers:** Không yêu cầu

**Response Thành Công (200):**
```json
{
  "message": "Login successful!",
  "data": {
    "user": {
      "id": "665a1b2c...",
      "email": "user@gmail.com",
      "fullName": "Nguyen Van A",
      "phone": "0901234567",
      "role": "TENANT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Response Lỗi (400):**
```json
{
  "message": "Missing credentials"
}
```
```json
{
  "message": "User not found!"
}
```
```json
{
  "message": "Invalid password!"
}
```

**Luồng xử lý:**
1. Controller nhận `email, password`.
2. Validate credentials.
3. Tìm user qua `UserService.getUserByEmail`.
4. So sánh password với bcrypt.
5. Tạo token pair (`accessToken` + `refreshToken`) qua JWT utils.
6. Trả về user info + tokens.

---

### 1.3 Lấy thông tin người dùng hiện tại

**Method:** `GET`

**URL:** `http://localhost:3000/api/auth/me`

**Chức năng:** Lấy thông tin user đang đăng nhập.

**Middleware:** `authenticateUser`

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "message": "User fetched successfully!",
  "data": {
    "user": {
      "id": "665a1b2c...",
      "email": "user@gmail.com",
      "fullName": "Nguyen Van A",
      "phone": "0901234567",
      "role": "TENANT"
    }
  }
}
```

**Response Lỗi (401):**
```json
{
  "message": "Unauthorized"
}
```

**Luồng xử lý:**
1. Middleware xác thực JWT, gắn `req.user`.
2. Controller kiểm tra `req.user`.
3. Trả về thông tin user đã được sanitize.

---

### 1.4 Đăng xuất

**Method:** `POST`

**URL:** `http://localhost:3000/api/auth/logout`

**Chức năng:** Đăng xuất (stateless JWT - client tự xóa token).

**Middleware:** `authenticateUser`

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "message": "Logout successful!"
}
```

**Luồng xử lý:**
1. Middleware xác thực JWT.
2. Controller trả về thành công (stateless - client tự xóa token).

---

### 1.5 Refresh Token

**Method:** `POST`

**URL:** `http://localhost:3000/api/auth/refresh-token`

**Chức năng:** Lấy Access Token mới từ Refresh Token.

**Middleware:** `refreshTokenValidation`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Headers:** Không yêu cầu

**Response Thành Công (200):**
```json
{
  "message": "Token refreshed successfully!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Response Lỗi (401):**
```json
{
  "message": "No refresh token provided"
}
```
```json
{
  "message": "Invalid or expired refresh token"
}
```

**Luồng xử lý:**
1. Middleware `refreshTokenValidation` kiểm tra refresh token từ body.
2. Verify refresh token, trích xuất `userId`.
3. Controller tạo access token mới.
4. Trả về access token mới.

---

## 2. PROPERTIES (`/api/properties`)

---

### 2.1 Tạo Property

**Method:** `POST`

**URL:** `http://localhost:3000/api/properties/create`

**Chức năng:** Landlord tạo mới một property (nhà trọ).

**Middleware:** `authenticateUser`

**Request Body:**
```json
{
  "name": "Sunrise Apartment",
  "address": "123 Nguyen Hue, District 1",
  "city": "Ho Chi Minh",
  "district": "District 1",
  "ward": "Ben Nghe",
  "latitude": 10.7769,
  "longitude": 106.7009,
  "totalRooms": 20,
  "description": "A modern apartment building near the city center",
  "coverImageUrl": "https://example.com/images/cover.jpg"
}
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (201):**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": { /* Property object */ }
}
```

**Response Lỗi (400):**
```json
{
  "success": false,
  "message": "Name and address are required"
}
```

**Luồng xử lý:**
1. Middleware xác thực → lấy `landlordId`.
2. Controller validate `name`, `address` bắt buộc.
3. Gọi `PropertyService.createProperty`.
4. Repository tạo mới Property trong MongoDB.
5. Trả về property vừa tạo.

---

### 2.2 Lấy danh sách Property (Landlord)

**Method:** `GET`

**URL:** `http://localhost:3000/api/properties`

**Chức năng:** Landlord xem danh sách property của mình.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10&city=Ho Chi Minh&district=District 1&search=Sunrise
```

| Param | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| page | number | 1 | Số trang |
| limit | number | 10 | Số lượng mỗi trang |
| city | string | - | Lọc theo thành phố |
| district | string | - | Lọc theo quận |
| search | string | - | Tìm kiếm theo tên/địa chỉ/thành phố |

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Property */ ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Controller xây dựng filter từ query params.
3. Gọi `PropertyService.getAllProperties`.
4. Repository query MongoDB với filter + phân trang.
5. Trả về danh sách + pagination.

---

### 2.3 Lấy chi tiết Property (Landlord)

**Method:** `GET`

**URL:** `http://localhost:3000/api/properties/:id`

**Chức năng:** Landlord xem chi tiết một property của mình.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của property
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": { /* Property object */ }
}
```

**Response Lỗi (404):**
```json
{
  "success": false,
  "message": "Property not found"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `PropertyService.getPropertyById` (chỉ lấy property của landlord đó).
4. Trả về property.

---

### 2.4 Cập nhật Property

**Method:** `PUT`

**URL:** `http://localhost:3000/api/properties/:id`

**Chức năng:** Landlord cập nhật thông tin property.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của property
```

**Request Body:** (tất cả các trường đều optional, chỉ gửi trường cần update)
```json
{
  "name": "Sunrise Apartment Updated",
  "address": "456 Le Loi, District 1",
  "city": "Ho Chi Minh",
  "district": "District 1",
  "ward": "Ben Thanh",
  "latitude": 10.7730,
  "longitude": 106.6985,
  "totalRooms": 25,
  "description": "Updated description",
  "coverImageUrl": "https://example.com/images/new-cover.jpg"
}
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": { /* Updated Property object */ }
}
```

**Response Lỗi (404):**
```json
{
  "success": false,
  "message": "Property not found"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `PropertyService.updateProperty`.
4. Repository cập nhật MongoDB.
5. Trả về property đã update.

---

### 2.5 Xóa Property (Soft Delete)

**Method:** `DELETE`

**URL:** `http://localhost:3000/api/properties/:id`

**Chức năng:** Landlord xóa mềm một property (set `deletedAt`).

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của property
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

**Response Lỗi (404):**
```json
{
  "success": false,
  "message": "Property not found"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `PropertyService.deleteProperty` (soft delete - set `deletedAt`).
4. Trả về thành công.

---

### 2.6 Lấy chi tiết Property (Public)

**Method:** `GET`

**URL:** `http://localhost:3000/api/properties/public/:id`

**Chức năng:** Xem chi tiết property công khai (không cần đăng nhập).

**Middleware:** Không có

**Path Params:**
```
:id - MongoDB ObjectId của property
```

**Headers:** Không yêu cầu

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": { /* Property object */ }
}
```

**Response Lỗi (404):**
```json
{
  "success": false,
  "message": "Property not found"
}
```

**Luồng xử lý:**
1. Validate ObjectId.
2. Gọi `PropertyService.getPropertyByIdPublic` (không check quyền sở hữu).
3. Trả về property.

---

## 3. ROOMS (`/api/rooms`)

---

### 3.1 Tạo Room

**Method:** `POST`

**URL:** `http://localhost:3000/api/rooms/create`

**Chức năng:** Landlord tạo phòng mới.

**Middleware:** `authenticateUser`

**Request Body:** (từ `RoomService.createRoom(req.body, landlordId)`, body được truyền trực tiếp)
```json
{
  "propertyId": "665a1b2c3d4e5f6a7b8c9d0e",
  "title": "Phòng 301 - Ban công",
  "description": "Phòng rộng 25m2 có ban công thoáng mát",
  "address": "123 Nguyen Hue, District 1, HCMC",
  "city": "Ho Chi Minh",
  "district": "District 1",
  "latitude": 10.7769,
  "longitude": 106.7009,
  "pricePerMonth": 4500000,
  "depositAmount": 4500000,
  "areaSqm": 25,
  "maxOccupants": 2,
  "roomType": "STUDIO",
  "amenities": ["665a1b2c...", "665a1b2d..."],
  "status": "AVAILABLE"
}
```

> **Ghi chú:** `roomType` có thể là: `STUDIO`, `SINGLE`, `SHARED`, `APARTMENT`  
> `status` có thể là: `AVAILABLE`, `RENTED`, `MAINTENANCE`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (201):**
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": { /* Room object */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Controller truyền toàn bộ `req.body` + `landlordId` cho Service.
3. `RoomService.createRoom` xử lý và tạo room.
4. Repository lưu MongoDB.
5. Trả về room vừa tạo.

---

### 3.2 Lấy danh sách Room (Landlord)

**Method:** `GET`

**URL:** `http://localhost:3000/api/rooms/getAll`

**Chức năng:** Landlord xem danh sách phòng của mình.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10&city=Ho Chi Minh&district=District 1&status=AVAILABLE&minPrice=3000000&maxPrice=7000000
```

| Param | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| page | number | 1 | Số trang |
| limit | number | 10 | Số lượng mỗi trang |
| city | string | - | Lọc theo thành phố |
| district | string | - | Lọc theo quận |
| status | string | - | `AVAILABLE`, `RENTED`, `MAINTENANCE` |
| minPrice | number | - | Giá thấp nhất |
| maxPrice | number | - | Giá cao nhất |

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Room */ ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Controller xây dựng filter từ query params.
3. Gọi `RoomService.getAllRooms`.
4. Repository query MongoDB + phân trang.
5. Trả về danh sách + pagination.

---

### 3.3 Lấy chi tiết Room (Landlord)

**Method:** `GET`

**URL:** `http://localhost:3000/api/rooms/getById/:id`

**Chức năng:** Landlord xem chi tiết phòng.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của room
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": { /* Room object */ }
}
```

**Response Lỗi (404):**
```json
{
  "success": false,
  "message": "Not found"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `RoomService.getRoomById`.
4. Trả về room.

---

### 3.4 Cập nhật Room

**Method:** `PUT`

**URL:** `http://localhost:3000/api/rooms/update/:id`

**Chức năng:** Landlord cập nhật thông tin phòng.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của room
```

**Request Body:** (tất cả optional, `req.body` được truyền trực tiếp)
```json
{
  "title": "Phòng 301 - Đã sửa",
  "pricePerMonth": 5000000,
  "status": "AVAILABLE"
}
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": { /* Updated Room */ }
}
```

**Response Lỗi (404):**
```json
{
  "success": false,
  "message": "Not found"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `RoomService.updateRoom(id, landlordId, req.body)`.
4. Repository cập nhật MongoDB.
5. Trả về room đã update.

---

### 3.5 Xóa Room

**Method:** `DELETE`

**URL:** `http://localhost:3000/api/rooms/delete/:id`

**Chức năng:** Landlord xóa phòng.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của room
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Deleted successfully"
}
```

**Response Lỗi (404):**
```json
{
  "success": false,
  "message": "Not found"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `RoomService.deleteRoom`.
4. Repository xóa trong MongoDB.
5. Trả về thành công.

---

### 3.6 Publish Room

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/rooms/:id/publish`

**Chức năng:** Landlord publish phòng (hiển thị công khai).

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của room
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Room published successfully",
  "data": { /* Room object */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `RoomService.publishRoom`.
4. Repository set `isPublished = true`.
5. Trả về room đã publish.

---

### 3.7 Unpublish Room

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/rooms/:id/unpublish`

**Chức năng:** Landlord ẩn phòng khỏi danh sách công khai.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của room
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Room unpublished successfully",
  "data": { /* Room object */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `RoomService.unpublishRoom`.
4. Repository set `isPublished = false`.
5. Trả về room đã unpublish.

---

### 3.8 Upload Ảnh Phòng

**Method:** `POST`

**URL:** `http://localhost:3000/api/rooms/:id/images`

**Chức năng:** Landlord upload ảnh cho phòng.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của room
```

**Request Body:**
```json
{
  "url": "https://example.com/images/room301-1.jpg",
  "caption": "Góc nhìn từ cửa sổ",
  "order": 1,
  "isPrimary": true
}
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (201):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": { /* RoomImage object */ }
}
```

**Response Lỗi (400):**
```json
{
  "success": false,
  "message": "Image URL is required"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId + verify room thuộc landlord.
3. Validate `url` bắt buộc.
4. Gọi `RoomService.uploadRoomImage`.
5. Repository tạo RoomImage trong MongoDB.
6. Trả về image vừa tạo.

---

### 3.9 Lấy danh sách Ảnh Phòng (Public)

**Method:** `GET`

**URL:** `http://localhost:3000/api/rooms/:id/images`

**Chức năng:** Xem danh sách ảnh của một phòng (công khai).

**Middleware:** Không có

**Path Params:**
```
:id - MongoDB ObjectId của room
```

**Headers:** Không yêu cầu

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of RoomImage */ ]
}
```

**Luồng xử lý:**
1. Validate ObjectId.
2. Gọi `RoomService.getRoomImages`.
3. Repository query MongoDB.
4. Trả về danh sách ảnh.

---

### 3.10 Đặt Ảnh Chính

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/rooms/:id/images/:imageId/primary`

**Chức năng:** Landlord đặt một ảnh làm ảnh chính (primary) của phòng.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của room
:imageId - MongoDB ObjectId của ảnh
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Primary image set successfully",
  "data": { /* RoomImage object */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId room + imageId.
3. Verify room thuộc landlord.
4. Gọi `RoomService.setPrimaryImage`.
5. Repository set `isPrimary = true` cho ảnh đó, `false` cho các ảnh khác.
6. Trả về ảnh.

---

### 3.11 Xóa Ảnh Phòng

**Method:** `DELETE`

**URL:** `http://localhost:3000/api/rooms/:id/images/:imageId`

**Chức năng:** Landlord xóa ảnh của phòng.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của room
:imageId - MongoDB ObjectId của ảnh
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId room + imageId.
3. Verify room thuộc landlord.
4. Gọi `RoomService.deleteRoomImage`.
5. Repository xóa ảnh khỏi MongoDB.
6. Trả về thành công.

---

## 4. FAVORITES (`/api/favorites`)

---

### 4.1 Lấy danh sách Yêu thích (Tenant)

**Method:** `GET`

**URL:** `http://localhost:3000/api/favorites`

**Chức năng:** Tenant xem danh sách phòng đã yêu thích.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Favorite with populated room */ ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `tenantId`.
2. Controller lấy `page`, `limit` từ query.
3. Gọi `FavoriteService.getTenantFavorites`.
4. Repository query MongoDB favorites của tenant + populate room.
5. Trả về danh sách + pagination.

---

### 4.2 Kiểm tra phòng đã Yêu thích

**Method:** `GET`

**URL:** `http://localhost:3000/api/favorites/:roomId/check`

**Chức năng:** Tenant kiểm tra xem đã yêu thích phòng này chưa.

**Middleware:** `authenticateUser`

**Path Params:**
```
:roomId - MongoDB ObjectId của room
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": {
    "roomId": "665a1b2c3d4e5f6a7b8c9d0e",
    "isFavorited": true
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `tenantId`.
2. Validate ObjectId của room.
3. Gọi `FavoriteService.isFavorited`.
4. Repository kiểm tra xem có document favorite không.
5. Trả về `isFavorited: true/false`.

---

### 4.3 Đếm số lượt Yêu thích của phòng (Public)

**Method:** `GET`

**URL:** `http://localhost:3000/api/favorites/:roomId/count`

**Chức năng:** Đếm số lượng người đã yêu thích một phòng (công khai).

**Middleware:** Không có

**Path Params:**
```
:roomId - MongoDB ObjectId của room
```

**Headers:** Không yêu cầu

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": {
    "roomId": "665a1b2c3d4e5f6a7b8c9d0e",
    "favoriteCount": 12
  }
}
```

**Luồng xử lý:**
1. Validate ObjectId.
2. Gọi `FavoriteService.getRoomFavoriteCount`.
3. Repository countDocuments trong MongoDB.
4. Trả về số lượng.

---

### 4.4 Thêm Yêu thích

**Method:** `POST`

**URL:** `http://localhost:3000/api/favorites/:roomId`

**Chức năng:** Tenant thêm phòng vào danh sách yêu thích.

**Middleware:** `authenticateUser`

**Path Params:**
```
:roomId - MongoDB ObjectId của room
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (201):**
```json
{
  "success": true,
  "message": "Room added to favorites",
  "data": { /* Favorite object */ }
}
```

**Response Lỗi (409):**
```json
{
  "success": false,
  "message": "Room is already in your favorites"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `tenantId`.
2. Validate ObjectId.
3. Gọi `FavoriteService.addFavorite`.
4. Repository tạo document favorite với unique constraint (tenantId, roomId).
5. Nếu trùng sẽ throw lỗi 409.
6. Trả về favorite vừa tạo.

---

### 4.5 Xóa Yêu thích

**Method:** `DELETE`

**URL:** `http://localhost:3000/api/favorites/:roomId`

**Chức năng:** Tenant xóa phòng khỏi danh sách yêu thích.

**Middleware:** `authenticateUser`

**Path Params:**
```
:roomId - MongoDB ObjectId của room
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Room removed from favorites"
}
```

**Response Lỗi (404):**
```json
{
  "success": false,
  "message": "Favorite not found"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `tenantId`.
2. Validate ObjectId.
3. Gọi `FavoriteService.removeFavorite`.
4. Repository xóa document favorite.
5. Trả về thành công.

---

## 5. BOOKINGS (`/api/bookings`)

> **Tất cả API trong nhóm này đều yêu cầu `authenticateUser`**

---

### 5.1 Tạo Booking

**Method:** `POST`

**URL:** `http://localhost:3000/api/bookings`

**Chức năng:** Tenant tạo yêu cầu đặt phòng.

**Middleware:** `authenticateUser`

**Request Body:**
```json
{
  "roomId": "665a1b2c3d4e5f6a7b8c9d0e",
  "checkInDate": "2026-07-01T00:00:00.000Z",
  "checkOutDate": "2026-12-31T00:00:00.000Z",
  "notes": "Tôi muốn thuê dài hạn"
}
```

> `checkOutDate` và `notes` là optional. `checkInDate` là bắt buộc.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": { /* Booking object */ }
}
```

**Response Lỗi (400):**
```json
{
  "success": false,
  "message": "Room ID and check-in date are required"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `tenantId`.
2. Validate `roomId`, `checkInDate`.
3. Gọi `BookingService.createBooking`.
4. Service validate room tồn tại, available.
5. Repository tạo booking với status `PENDING`.
6. Trả về booking vừa tạo.

---

### 5.2 Lấy Booking của Tenant

**Method:** `GET`

**URL:** `http://localhost:3000/api/bookings/my`

**Chức năng:** Tenant xem danh sách booking của mình.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Booking */ ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `tenantId`.
2. Gọi `BookingService.getTenantBookings`.
3. Repository query MongoDB + populate room.
4. Trả về danh sách + pagination.

---

### 5.3 Lấy Booking của Landlord

**Method:** `GET`

**URL:** `http://localhost:3000/api/bookings/landlord`

**Chức năng:** Landlord xem danh sách booking cho các phòng của mình.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10&status=PENDING
```

| Param | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| page | number | 1 | Số trang |
| limit | number | 10 | Số lượng mỗi trang |
| status | string | - | Lọc: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Booking */ ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Lấy danh sách room của landlord.
3. Gọi `BookingService.getLandlordBookings` với danh sách roomIds.
4. Filter theo status nếu có.
5. Trả về danh sách + pagination.

---

### 5.4 Lấy chi tiết Booking

**Method:** `GET`

**URL:** `http://localhost:3000/api/bookings/:id`

**Chức năng:** Xem chi tiết booking (tenant hoặc landlord của booking).

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của booking
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": { /* Booking object with populated room & tenant */ }
}
```

**Response Lỗi (403):**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `userId`.
2. Validate ObjectId.
3. Gọi `BookingService.getBookingById`.
4. Controller kiểm tra user là tenant hoặc landlord của booking.
5. Nếu không phải → 403 Forbidden.
6. Trả về booking.

---

### 5.5 Phê duyệt Booking

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/bookings/:id/approve`

**Chức năng:** Landlord phê duyệt booking → status `APPROVED`.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của booking
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Booking approved successfully",
  "data": { /* Updated Booking */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `BookingService.approveBooking`.
4. Service kiểm tra landlord sở hữu room, booking đang PENDING.
5. Repository cập nhật status → `APPROVED`.
6. Trả về booking đã update.

---

### 5.6 Từ chối Booking

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/bookings/:id/reject`

**Chức năng:** Landlord từ chối booking → status `REJECTED`.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của booking
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Booking rejected successfully",
  "data": { /* Updated Booking */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `BookingService.rejectBooking`.
4. Service kiểm tra landlord sở hữu room, booking đang PENDING.
5. Repository cập nhật status → `REJECTED`.
6. Trả về booking đã update.

---

### 5.7 Hủy Booking

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/bookings/:id/cancel`

**Chức năng:** Tenant hủy booking của mình → status `CANCELLED`.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của booking
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": { /* Updated Booking */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `tenantId`.
2. Validate ObjectId.
3. Gọi `BookingService.cancelBooking`.
4. Service kiểm tra tenant sở hữu booking.
5. Repository cập nhật status → `CANCELLED`.
6. Trả về booking đã update.

---

## 6. CONTRACTS (`/api/contracts`)

> **Tất cả API trong nhóm này đều yêu cầu `authenticateUser`**

---

### 6.1 Tạo Hợp đồng từ Booking

**Method:** `POST`

**URL:** `http://localhost:3000/api/contracts`

**Chức năng:** Landlord tạo hợp đồng từ một booking đã được approve.

**Middleware:** `authenticateUser`

**Request Body:**
```json
{
  "bookingId": "665a1b2c3d4e5f6a7b8c9d0e",
  "monthlyRent": 4500000,
  "depositAmount": 4500000,
  "terms": "Hợp đồng 12 tháng, đặt cọc 1 tháng...",
  "contractFileUrl": "https://example.com/contracts/contract-001.pdf",
  "startDate": "2026-07-01T00:00:00.000Z"
}
```

> `bookingId` và `monthlyRent` là bắt buộc. `depositAmount`, `terms`, `contractFileUrl`, `startDate` là optional.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (201):**
```json
{
  "success": true,
  "message": "Contract created successfully",
  "data": { /* Contract object */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate `bookingId`, `monthlyRent`.
3. Gọi `ContractService.createContractFromBooking`.
4. Service kiểm tra booking tồn tại, thuộc landlord, đã APPROVED.
5. Repository tạo contract với status `DRAFT`.
6. Trả về contract vừa tạo.

---

### 6.2 Lấy Hợp đồng của Landlord

**Method:** `GET`

**URL:** `http://localhost:3000/api/contracts/landlord`

**Chức năng:** Landlord xem danh sách hợp đồng của mình.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Contract */ ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Gọi `ContractService.getContractsByLandlord`.
3. Repository query MongoDB + populate.
4. Trả về danh sách + pagination.

---

### 6.3 Lấy Hợp đồng của Tenant

**Method:** `GET`

**URL:** `http://localhost:3000/api/contracts/tenant`

**Chức năng:** Tenant xem danh sách hợp đồng của mình.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Contract */ ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `tenantId`.
2. Gọi `ContractService.getContractsByTenant`.
3. Repository query MongoDB + populate.
4. Trả về danh sách + pagination.

---

### 6.4 Lấy chi tiết Hợp đồng

**Method:** `GET`

**URL:** `http://localhost:3000/api/contracts/:id`

**Chức năng:** Xem chi tiết hợp đồng (landlord hoặc tenant của hợp đồng).

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của contract
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": { /* Contract object với populated booking, landlord, tenant */ }
}
```

**Response Lỗi (403):**
```json
{
  "success": false,
  "message": "do not have access"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `userId`.
2. Validate ObjectId.
3. Gọi `ContractService.getContractById` (check access: landlord hoặc tenant).
4. Trả về contract.

---

### 6.5 Cập nhật Hợp đồng

**Method:** `PUT`

**URL:** `http://localhost:3000/api/contracts/:id`

**Chức năng:** Landlord cập nhật hợp đồng (chỉ khi DRAFT).

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của contract
```

**Request Body:**
```json
{
  "monthlyRent": 5000000,
  "depositAmount": 5000000,
  "terms": "Hợp đồng đã chỉnh sửa...",
  "contractFileUrl": "https://example.com/contracts/updated.pdf",
  "startDate": "2026-07-01T00:00:00.000Z",
  "endDate": "2027-06-30T00:00:00.000Z"
}
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Contract updated successfully",
  "data": { /* Updated Contract */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `ContractService.updateContract`.
4. Service kiểm tra landlord sở hữu, contract đang DRAFT.
5. Repository cập nhật MongoDB.
6. Trả về contract đã update.

---

### 6.6 Kích hoạt Hợp đồng

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/contracts/:id/activate`

**Chức năng:** Landlord kích hoạt hợp đồng → status `ACTIVE`.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của contract
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Contract activated successfully",
  "data": { /* Updated Contract */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `ContractService.activateContract`.
4. Service kiểm tra landlord sở hữu, contract đang DRAFT.
5. Repository set status → `ACTIVE`, set `signedAt`.
6. Trả về contract đã update.

---

### 6.7 Chấm dứt Hợp đồng

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/contracts/:id/terminate`

**Chức năng:** Landlord chấm dứt hợp đồng → status `TERMINATED`.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của contract
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Contract terminated successfully",
  "data": { /* Updated Contract */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `ContractService.terminateContract`.
4. Service kiểm tra landlord sở hữu, contract đang ACTIVE.
5. Repository set status → `TERMINATED`.
6. Trả về contract đã update.

---

### 6.8 Gia hạn Hợp đồng

**Method:** `POST`

**URL:** `http://localhost:3000/api/contracts/:id/renew`

**Chức năng:** Landlord gia hạn hợp đồng (tạo contract mới dựa trên contract cũ).

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của contract hiện tại
```

**Request Body:**
```json
{
  "monthlyRent": 5000000,
  "depositAmount": 5000000,
  "startDate": "2027-07-01T00:00:00.000Z",
  "endDate": "2028-06-30T00:00:00.000Z",
  "terms": "Hợp đồng gia hạn 12 tháng",
  "contractFileUrl": "https://example.com/contracts/renewed.pdf"
}
```

> `startDate` là bắt buộc. Các trường còn lại optional.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (201):**
```json
{
  "success": true,
  "message": "Contract renewed successfully",
  "data": { /* New Contract object với renewalFromId trỏ về contract cũ */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate `startDate` bắt buộc.
3. Gọi `ContractService.renewContract`.
4. Service kiểm tra landlord sở hữu, contract đang ACTIVE/EXPIRED.
5. Repository tạo contract mới với `renewalFromId` = contract cũ.
6. Trả về contract mới.

---

## 7. INVOICES (`/api/invoices`)

> **Tất cả API trong nhóm này đều yêu cầu `authenticateUser`**

---

### 7.1 Tạo Hóa đơn

**Method:** `POST`

**URL:** `http://localhost:3000/api/invoices`

**Chức năng:** Landlord tạo hóa đơn cho booking.

**Middleware:** `authenticateUser`

**Request Body:**
```json
{
  "bookingId": "665a1b2c3d4e5f6a7b8c9d0e",
  "billingMonth": "2026-06",
  "dueDate": "2026-06-10T00:00:00.000Z",
  "rentAmount": 4500000,
  "electricityAmount": 350000,
  "waterAmount": 80000,
  "additionalFees": 100000,
  "notes": "Tiền phòng tháng 6/2026",
  "detailData": {
    "electricityOldIndex": 1200,
    "electricityNewIndex": 1350,
    "electricityUsage": 150,
    "electricityRate": 2333,
    "waterOldIndex": 50,
    "waterNewIndex": 58,
    "waterUsage": 8,
    "waterRate": 10000
  }
}
```

> `bookingId`, `billingMonth` (YYYY-MM), `dueDate`, `rentAmount` là bắt buộc.  
> `electricityAmount`, `waterAmount`, `additionalFees`, `notes`, `detailData` là optional.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (201):**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": { /* Invoice object */ }
}
```

**Response Lỗi (400):**
```json
{
  "success": false,
  "message": "Booking ID, billing month, due date, and rent amount are required"
}
```
```json
{
  "success": false,
  "message": "Billing month must be in YYYY-MM format"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate các trường bắt buộc + format `billingMonth`.
3. Gọi `InvoiceService.createInvoice`.
4. Service kiểm tra booking tồn tại, thuộc landlord.
5. Repository tạo invoice (status `DRAFT`) + invoice detail nếu có.
6. Trả về invoice vừa tạo.

---

### 7.2 Lấy Hóa đơn của Landlord

**Method:** `GET`

**URL:** `http://localhost:3000/api/invoices/landlord`

**Chức năng:** Landlord xem danh sách hóa đơn của mình.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Invoice */ ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Gọi `InvoiceService.getInvoicesByLandlord`.
3. Repository query MongoDB + populate.
4. Trả về danh sách + pagination.

---

### 7.3 Lấy Hóa đơn của Tenant

**Method:** `GET`

**URL:** `http://localhost:3000/api/invoices/tenant`

**Chức năng:** Tenant xem danh sách hóa đơn của mình.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Invoice */ ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `tenantId`.
2. Gọi `InvoiceService.getInvoicesByTenant`.
3. Repository query MongoDB + populate.
4. Trả về danh sách + pagination.

---

### 7.4 Lấy chi tiết Hóa đơn

**Method:** `GET`

**URL:** `http://localhost:3000/api/invoices/:id`

**Chức năng:** Xem chi tiết hóa đơn (landlord hoặc tenant của hóa đơn).

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của invoice
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": { /* Invoice object với populated booking, landlord, tenant */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `userId`.
2. Validate ObjectId.
3. Gọi `InvoiceService.getInvoiceById` (check access).
4. Trả về invoice.

---

### 7.5 Cập nhật Hóa đơn

**Method:** `PUT`

**URL:** `http://localhost:3000/api/invoices/:id`

**Chức năng:** Landlord cập nhật hóa đơn (chỉ khi DRAFT).

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của invoice
```

**Request Body:**
```json
{
  "rentAmount": 5000000,
  "electricityAmount": 400000,
  "waterAmount": 90000,
  "additionalFees": 150000,
  "notes": "Đã cập nhật số điện nước tháng này",
  "dueDate": "2026-06-15T00:00:00.000Z"
}
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Invoice updated successfully",
  "data": { /* Updated Invoice */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `InvoiceService.updateInvoice`.
4. Service kiểm tra landlord sở hữu, invoice đang DRAFT.
5. Repository cập nhật MongoDB.
6. Trả về invoice đã update.

---

### 7.6 Gửi Hóa đơn

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/invoices/:id/send`

**Chức năng:** Landlord gửi hóa đơn cho tenant → status `DRAFT` → `SENT`.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của invoice
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Invoice sent successfully",
  "data": { /* Updated Invoice */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `InvoiceService.sendInvoice`.
4. Service kiểm tra landlord sở hữu, invoice đang DRAFT.
5. Repository set status → `SENT`, set `sentAt`.
6. Trả về invoice đã update.

---

### 7.7 Đánh dấu đã Thanh toán

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/invoices/:id/mark-paid`

**Chức năng:** Landlord đánh dấu hóa đơn đã thanh toán → status `PAID`.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của invoice
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Invoice marked as paid",
  "data": { /* Updated Invoice */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `InvoiceService.markAsPaid`.
4. Service kiểm tra landlord sở hữu, invoice đang SENT/OVERDUE.
5. Repository set status → `PAID`, set `paidAt`.
6. Trả về invoice đã update.

---

### 7.8 Xóa Hóa đơn

**Method:** `DELETE`

**URL:** `http://localhost:3000/api/invoices/:id`

**Chức năng:** Landlord xóa hóa đơn (chỉ khi DRAFT).

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của invoice
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `InvoiceService.deleteInvoice`.
4. Service kiểm tra landlord sở hữu, invoice đang DRAFT.
5. Repository xóa invoice.
6. Trả về thành công.

---

### 7.9 Lấy chi tiết Hóa đơn (Invoice Detail)

**Method:** `GET`

**URL:** `http://localhost:3000/api/invoices/:id/detail`

**Chức năng:** Xem thông tin chi tiết điện/nước của hóa đơn.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của invoice
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": {
    "invoiceId": "665a1b2c...",
    "electricityOldIndex": 1200,
    "electricityNewIndex": 1350,
    "electricityUsage": 150,
    "electricityRate": 2333,
    "electricityAmount": 350000,
    "waterOldIndex": 50,
    "waterNewIndex": 58,
    "waterUsage": 8,
    "waterRate": 10000,
    "waterAmount": 80000,
    "otherDetails": {}
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `userId`.
2. Verify access qua `InvoiceService.getInvoiceById`.
3. Gọi `InvoiceService.getInvoiceDetail`.
4. Trả về invoice detail.

---

### 7.10 Cập nhật chi tiết Hóa đơn

**Method:** `PUT`

**URL:** `http://localhost:3000/api/invoices/:id/detail`

**Chức năng:** Landlord cập nhật thông tin chi tiết điện nước.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của invoice
```

**Request Body:**
```json
{
  "electricityOldIndex": 1350,
  "electricityNewIndex": 1500,
  "electricityUsage": 150,
  "electricityRate": 2500,
  "electricityAmount": 375000,
  "waterOldIndex": 58,
  "waterNewIndex": 65,
  "waterUsage": 7,
  "waterRate": 10000,
  "waterAmount": 70000,
  "otherDetails": {}
}
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Invoice detail updated successfully",
  "data": { /* Updated InvoiceDetail */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Verify landlord sở hữu invoice.
3. Gọi `InvoiceService.updateInvoiceDetail` với `req.body`.
4. Repository cập nhật MongoDB.
5. Trả về detail đã update.

---

## 8. REVIEWS (`/api/reviews`)

---

### 8.1 Thống kê Rating của Phòng (Public)

**Method:** `GET`

**URL:** `http://localhost:3000/api/reviews/stats`

**Chức năng:** Xem thống kê đánh giá của một phòng (công khai).

**Middleware:** Không có

**Query Params:**
```
?roomId=665a1b2c3d4e5f6a7b8c9d0e
```

| Param | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| roomId | string (ObjectId) | CÓ | ID của phòng cần xem thống kê |

**Headers:** Không yêu cầu

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.2,
    "totalReviews": 15,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 3,
      "4": 5,
      "5": 6
    }
  }
}
```

**Luồng xử lý:**
1. Validate `roomId`.
2. Gọi `ReviewService.getRoomRatingStats`.
3. Repository aggregate trong MongoDB.
4. Trả về thống kê.

---

### 8.2 Lấy Reviews theo Phòng (Public)

**Method:** `GET`

**URL:** `http://localhost:3000/api/reviews/room`

**Chức năng:** Xem danh sách review của một phòng (công khai, chỉ hiển thị review đã verified).

**Middleware:** Không có

**Query Params:**
```
?roomId=665a1b2c3d4e5f6a7b8c9d0e&page=1&limit=10
```

| Param | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|---|
| roomId | string (ObjectId) | CÓ | - | ID của phòng |
| page | number | Không | 1 | Số trang |
| limit | number | Không | 10 | Số lượng mỗi trang |

**Headers:** Không yêu cầu

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Review (chỉ verified) */ ],
  "statistics": { /* Thống kê rating */ },
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

**Luồng xử lý:**
1. Validate `roomId`.
2. Gọi `ReviewService.getReviewsByRoom` với `verifiedOnly = true`.
3. Repository query MongoDB + populate reviewer.
4. Trả về reviews + statistics + pagination.

---

### 8.3 Lấy Reviews đang Chờ Duyệt

**Method:** `GET`

**URL:** `http://localhost:3000/api/reviews/pending`

**Chức năng:** Landlord/Admin xem danh sách review chưa được verify.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of pending Review */ ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực.
2. Gọi `ReviewService.getPendingReviews`.
3. Repository query review có `isVerified = false`.
4. Trả về danh sách + pagination.

---

### 8.4 Tạo Review

**Method:** `POST`

**URL:** `http://localhost:3000/api/reviews`

**Chức năng:** Tenant tạo đánh giá cho phòng đã thuê.

**Middleware:** `authenticateUser`

**Request Body:**
```json
{
  "roomId": "665a1b2c3d4e5f6a7b8c9d0e",
  "bookingId": "665a1b2c3d4e5f6a7b8c9d0f",
  "rating": 4,
  "comment": "Phòng sạch sẽ, chủ nhà thân thiện, vị trí thuận tiện",
  "imageUrls": ["https://example.com/review1.jpg", "https://example.com/review2.jpg"]
}
```

> `roomId`, `bookingId`, `rating` (1-5), `comment` (tối thiểu 10 ký tự) là bắt buộc.  
> `imageUrls` là optional.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (201):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": { /* Review object */ }
}
```

**Response Lỗi (400):**
```json
{
  "success": false,
  "message": "Room ID, booking ID, rating, and comment are required"
}
```
```json
{
  "success": false,
  "message": "Rating must be a number between 1 and 5"
}
```
```json
{
  "success": false,
  "message": "Comment must be at least 10 characters long"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `reviewerId`.
2. Validate các trường bắt buộc, rating 1-5, comment >= 10 ký tự.
3. Gọi `ReviewService.createReview`.
4. Service kiểm tra booking tồn tại, thuộc tenant, đã APPROVED.
5. Repository tạo review (status `isVerified = false`).
6. Trả về review vừa tạo.

---

### 8.5 Lấy Reviews của tôi

**Method:** `GET`

**URL:** `http://localhost:3000/api/reviews`

**Chức năng:** Tenant xem danh sách review của mình.

**Middleware:** `authenticateUser`

**Query Params:**
```
?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": [ /* Array of Review */ ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `reviewerId`.
2. Gọi `ReviewService.getReviewsByTenant`.
3. Repository query MongoDB + populate room.
4. Trả về danh sách + pagination.

---

### 8.6 Lấy chi tiết Review

**Method:** `GET`

**URL:** `http://localhost:3000/api/reviews/:id`

**Chức năng:** Xem chi tiết một review.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của review
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "data": { /* Review object với populated reviewer, room */ }
}
```

**Response Lỗi (404):**
```json
{
  "success": false,
  "message": "not found"
}
```

**Luồng xử lý:**
1. Middleware xác thực.
2. Validate ObjectId.
3. Gọi `ReviewService.getReviewById`.
4. Trả về review.

---

### 8.7 Cập nhật Review

**Method:** `PUT`

**URL:** `http://localhost:3000/api/reviews/:id`

**Chức năng:** Tenant chỉnh sửa review của mình.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của review
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Sau một thời gian ở, tôi càng thấy phòng tuyệt vời hơn!",
  "imageUrls": ["https://example.com/updated-review.jpg"]
}
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": { /* Updated Review */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `reviewerId`.
2. Validate ObjectId.
3. Gọi `ReviewService.updateReview` (chỉ chủ review mới sửa được).
4. Repository cập nhật MongoDB.
5. Trả về review đã update.

---

### 8.8 Xóa Review

**Method:** `DELETE`

**URL:** `http://localhost:3000/api/reviews/:id`

**Chức năng:** Tenant xóa review của mình.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của review
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `reviewerId`.
2. Validate ObjectId.
3. Gọi `ReviewService.deleteReview` (chỉ chủ review mới xóa được).
4. Repository xóa khỏi MongoDB.
5. Trả về thành công.

---

### 8.9 Phản hồi Review (Landlord)

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/reviews/:id/reply`

**Chức năng:** Landlord phản hồi review về phòng của mình.

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của review
```

**Request Body:**
```json
{
  "reply": "Cảm ơn bạn đã đánh giá! Chúng tôi sẽ cố gắng cải thiện hơn nữa."
}
```

> `reply` là bắt buộc, không được rỗng.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Reply added successfully",
  "data": { /* Updated Review với landlordReply */ }
}
```

**Response Lỗi (400):**
```json
{
  "success": false,
  "message": "Reply is required"
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId + `reply` không rỗng.
3. Gọi `ReviewService.addLandlordReply`.
4. Service kiểm tra landlord sở hữu room của review.
5. Repository cập nhật `landlordReply`.
6. Trả về review đã update.

---

### 8.10 Xác minh Review

**Method:** `PATCH`

**URL:** `http://localhost:3000/api/reviews/:id/verify`

**Chức năng:** Landlord xác minh review (set `isVerified = true`).

**Middleware:** `authenticateUser`

**Path Params:**
```
:id - MongoDB ObjectId của review
```

**Request Body:** Không có

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response Thành Công (200):**
```json
{
  "success": true,
  "message": "Review verified successfully",
  "data": { /* Updated Review */ }
}
```

**Luồng xử lý:**
1. Middleware xác thực → `landlordId`.
2. Validate ObjectId.
3. Gọi `ReviewService.verifyReview`.
4. Service kiểm tra landlord sở hữu room của review.
5. Repository set `isVerified = true`.
6. Trả về review đã update.

---

## BẢNG TỔNG HỢP API

| Method | URL | Middleware | Chức năng |
|---|---|---|---|
| POST | `/api/auth/register` | - | Đăng ký tài khoản |
| POST | `/api/auth/login` | - | Đăng nhập |
| GET | `/api/auth/me` | authenticateUser | Lấy thông tin user hiện tại |
| POST | `/api/auth/logout` | authenticateUser | Đăng xuất |
| POST | `/api/auth/refresh-token` | refreshTokenValidation | Làm mới access token |
| POST | `/api/properties/create` | authenticateUser | Tạo property |
| GET | `/api/properties` | authenticateUser | Danh sách property (landlord) |
| GET | `/api/properties/:id` | authenticateUser | Chi tiết property (landlord) |
| PUT | `/api/properties/:id` | authenticateUser | Cập nhật property |
| DELETE | `/api/properties/:id` | authenticateUser | Xóa mềm property |
| GET | `/api/properties/public/:id` | - | Chi tiết property (public) |
| POST | `/api/rooms/create` | authenticateUser | Tạo room |
| GET | `/api/rooms/getAll` | authenticateUser | Danh sách room (landlord) |
| GET | `/api/rooms/getById/:id` | authenticateUser | Chi tiết room (landlord) |
| PUT | `/api/rooms/update/:id` | authenticateUser | Cập nhật room |
| DELETE | `/api/rooms/delete/:id` | authenticateUser | Xóa room |
| PATCH | `/api/rooms/:id/publish` | authenticateUser | Publish room |
| PATCH | `/api/rooms/:id/unpublish` | authenticateUser | Unpublish room |
| POST | `/api/rooms/:id/images` | authenticateUser | Upload ảnh phòng |
| GET | `/api/rooms/:id/images` | - | Danh sách ảnh phòng (public) |
| PATCH | `/api/rooms/:id/images/:imageId/primary` | authenticateUser | Đặt ảnh chính |
| DELETE | `/api/rooms/:id/images/:imageId` | authenticateUser | Xóa ảnh phòng |
| GET | `/api/favorites` | authenticateUser | Danh sách yêu thích (tenant) |
| GET | `/api/favorites/:roomId/check` | authenticateUser | Kiểm tra đã yêu thích |
| GET | `/api/favorites/:roomId/count` | - | Đếm lượt yêu thích (public) |
| POST | `/api/favorites/:roomId` | authenticateUser | Thêm yêu thích |
| DELETE | `/api/favorites/:roomId` | authenticateUser | Xóa yêu thích |
| POST | `/api/bookings` | authenticateUser | Tạo booking |
| GET | `/api/bookings/my` | authenticateUser | Booking của tenant |
| GET | `/api/bookings/landlord` | authenticateUser | Booking của landlord |
| GET | `/api/bookings/:id` | authenticateUser | Chi tiết booking |
| PATCH | `/api/bookings/:id/approve` | authenticateUser | Phê duyệt booking |
| PATCH | `/api/bookings/:id/reject` | authenticateUser | Từ chối booking |
| PATCH | `/api/bookings/:id/cancel` | authenticateUser | Hủy booking |
| POST | `/api/contracts` | authenticateUser | Tạo hợp đồng |
| GET | `/api/contracts/landlord` | authenticateUser | Hợp đồng của landlord |
| GET | `/api/contracts/tenant` | authenticateUser | Hợp đồng của tenant |
| GET | `/api/contracts/:id` | authenticateUser | Chi tiết hợp đồng |
| PUT | `/api/contracts/:id` | authenticateUser | Cập nhật hợp đồng |
| PATCH | `/api/contracts/:id/activate` | authenticateUser | Kích hoạt hợp đồng |
| PATCH | `/api/contracts/:id/terminate` | authenticateUser | Chấm dứt hợp đồng |
| POST | `/api/contracts/:id/renew` | authenticateUser | Gia hạn hợp đồng |
| POST | `/api/invoices` | authenticateUser | Tạo hóa đơn |
| GET | `/api/invoices/landlord` | authenticateUser | Hóa đơn của landlord |
| GET | `/api/invoices/tenant` | authenticateUser | Hóa đơn của tenant |
| GET | `/api/invoices/:id` | authenticateUser | Chi tiết hóa đơn |
| PUT | `/api/invoices/:id` | authenticateUser | Cập nhật hóa đơn |
| PATCH | `/api/invoices/:id/send` | authenticateUser | Gửi hóa đơn |
| PATCH | `/api/invoices/:id/mark-paid` | authenticateUser | Đánh dấu đã thanh toán |
| DELETE | `/api/invoices/:id` | authenticateUser | Xóa hóa đơn |
| GET | `/api/invoices/:id/detail` | authenticateUser | Chi tiết điện nước |
| PUT | `/api/invoices/:id/detail` | authenticateUser | Cập nhật chi tiết điện nước |
| GET | `/api/reviews/stats` | - | Thống kê rating (public) |
| GET | `/api/reviews/room` | - | Reviews theo phòng (public) |
| GET | `/api/reviews/pending` | authenticateUser | Reviews chờ duyệt |
| POST | `/api/reviews` | authenticateUser | Tạo review |
| GET | `/api/reviews` | authenticateUser | Reviews của tôi |
| GET | `/api/reviews/:id` | authenticateUser | Chi tiết review |
| PUT | `/api/reviews/:id` | authenticateUser | Cập nhật review |
| DELETE | `/api/reviews/:id` | authenticateUser | Xóa review |
| PATCH | `/api/reviews/:id/reply` | authenticateUser | Phản hồi review |
| PATCH | `/api/reviews/:id/verify` | authenticateUser | Xác minh review |

---

> **Tổng cộng: 58 API endpoints** (10 Auth/Property/Room/Favorite/Booking/Contract/Invoice/Review)

---

## GHI CHÚ CHO TESTER

### Cách lấy Token
1. Gọi `POST /api/auth/register` để tạo tài khoản.
2. Gọi `POST /api/auth/login` để lấy `accessToken` và `refreshToken`.
3. Copy `accessToken` vào Header `Authorization: Bearer <accessToken>` cho các API yêu cầu đăng nhập.

### Cách Refresh Token
- Khi accessToken hết hạn, gọi `POST /api/auth/refresh-token` với body `{ "refreshToken": "..." }`.
- Copy accessToken mới từ response.

### Các API Public (KHÔNG cần token)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `GET /api/properties/public/:id`
- `GET /api/rooms/:id/images`
- `GET /api/favorites/:roomId/count`
- `GET /api/reviews/stats`
- `GET /api/reviews/room`

### ObjectId Format
Tất cả `:id`, `:roomId`, `:imageId`, `:bookingId` là MongoDB ObjectId (24 ký tự hex).  
Ví dụ: `665a1b2c3d4e5f6a7b8c9d0e`
