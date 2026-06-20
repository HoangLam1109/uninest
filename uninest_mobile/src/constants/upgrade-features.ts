export type UpgradeFeatureKey =
  | "chat"
  | "booking"
  | "ai_search"
  | "messages"
  | "contracts"
  | "invoices"
  | "meter"
  | "identity"
  | "rooms"
  | "generic";

export type UpgradeFeatureConfig = {
  icon: string;
  title: string;
  description: string;
  benefits: string[];
};

export const UPGRADE_FEATURES: Record<UpgradeFeatureKey, UpgradeFeatureConfig> = {
  chat: {
    icon: "💬",
    title: "Nâng cấp để chat với chủ nhà",
    description:
      "Gói Người thuê giúp bạn trò chuyện trực tiếp với chủ nhà về phòng, lịch xem và điều khoản thuê.",
    benefits: ["Chat trực tiếp", "Đặt phòng online", "Quản lý hợp đồng"],
  },
  booking: {
    icon: "📅",
    title: "Nâng cấp để đặt phòng",
    description:
      "Đăng ký gói Người thuê để gửi yêu cầu thuê phòng và theo dõi trạng thái duyệt từ chủ nhà.",
    benefits: ["Đặt phòng trực tuyến", "Theo dõi đơn đăng ký", "Ký hợp đồng điện tử"],
  },
  ai_search: {
    icon: "✨",
    title: "Nâng cấp để dùng AI tìm phòng",
    description:
      "AI tìm phòng chỉ dành cho tài khoản Người thuê. Mô tả nhu cầu và nhận gợi ý phòng phù hợp.",
    benefits: ["AI gợi ý phòng thông minh", "Lọc theo ngân sách", "Lưu phòng yêu thích"],
  },
  messages: {
    icon: "📨",
    title: "Nâng cấp để nhắn tin",
    description:
      "Tính năng tin nhắn yêu cầu gói Người thuê để trao đổi với chủ nhà trong ứng dụng.",
    benefits: ["Hộp thư tập trung", "Chat theo từng phòng", "Thông báo nhanh"],
  },
  contracts: {
    icon: "📄",
    title: "Nâng cấp để xem hợp đồng",
    description:
      "Quản lý và ký hợp đồng thuê trực tuyến khi bạn nâng cấp lên gói Người thuê.",
    benefits: ["Xem hợp đồng", "Ký điện tử", "Lưu trữ an toàn"],
  },
  invoices: {
    icon: "🧾",
    title: "Nâng cấp để xem hóa đơn",
    description:
      "Nhận và theo dõi hóa đơn tiền phòng, điện nước sau khi nâng cấp gói Người thuê.",
    benefits: ["Hóa đơn định kỳ", "Theo dõi thanh toán", "Lịch sử rõ ràng"],
  },
  meter: {
    icon: "⚡",
    title: "Nâng cấp để xem chỉ số",
    description:
      "Theo dõi chỉ số điện nước và tiêu thụ hàng tháng với gói Người thuê.",
    benefits: ["Lịch sử chỉ số", "Minh bạch tiêu thụ", "Đối chiếu hóa đơn"],
  },
  identity: {
    icon: "🪪",
    title: "Nâng cấp để xác minh CCCD",
    description:
      "Gửi hồ sơ xác minh danh tính và tăng độ tin cậy khi thuê phòng trên UniNest.",
    benefits: ["Xác minh CCCD", "Tăng uy tín", "Thuê phòng nhanh hơn"],
  },
  rooms: {
    icon: "🏠",
    title: "Nâng cấp để quản lý đơn thuê",
    description:
      "Xem và theo dõi các đơn đặt phòng của bạn sau khi nâng cấp gói Người thuê.",
    benefits: ["Danh sách đơn thuê", "Hủy đơn chờ duyệt", "Theo dõi trạng thái"],
  },
  generic: {
    icon: "👑",
    title: "Nâng cấp gói Người thuê",
    description:
      "Tính năng này yêu cầu gói Người thuê. Nâng cấp để sử dụng đầy đủ dịch vụ trên UniNest.",
    benefits: ["Đặt phòng & chat", "Hợp đồng & hóa đơn", "AI tìm phòng"],
  },
};

export const TENANT_PACKAGE_PRICE = "30.000đ";
export const LANDLORD_PACKAGE_PRICE = "99.000đ";
