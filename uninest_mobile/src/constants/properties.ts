export type PropertyImageKey = "5" | "6" | "7" | "8" | "9";

export type PropertyDetails = {
  key: PropertyImageKey;
  title: string;
  location: string;
};

export const PROPERTY_DETAILS: Record<PropertyImageKey, PropertyDetails> = {
  "5": {
    key: "5",
    title: "Căn hộ Landmark",
    location: "📍 Quận 1, cách cơ sở 0.4 km",
  },
  "6": {
    key: "6",
    title: "Phòng trọ St. Pancras",
    location: "📍 Quận 7, gần RMIT (0.9 km)",
  },
  "7": {
    key: "7",
    title: "Căn hộ Studio Quận 7 Full Nội thất",
    location: "📍 Quận 7, gần RMIT (0.9 km)",
  },
  "8": {
    key: "8",
    title: "Phòng trọ cao cấp Bình Thạnh",
    location: "📍 Bình Thạnh, TP. HCM",
  },
  "9": {
    key: "9",
    title: "Căn hộ dịch vụ Quận 1 - Gần trung tâm",
    location: "📍 Quận 1, gần trung tâm",
  },
};

export const PROPERTY_IMAGES: Record<PropertyImageKey, any> = {
  "5": require("../../assets/images/5.png"),
  "6": require("../../assets/images/6.png"),
  "7": require("../../assets/images/7.png"),
  "8": require("../../assets/images/8.png"),
  "9": require("../../assets/images/9.png"),
};

export function getPropertyDetails(image?: string | string[]): PropertyDetails {
  const key = Array.isArray(image) ? image[0] : image;

  return key && key in PROPERTY_DETAILS
    ? PROPERTY_DETAILS[key as PropertyImageKey]
    : PROPERTY_DETAILS["5"];
}

export function formatVnd(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
}
