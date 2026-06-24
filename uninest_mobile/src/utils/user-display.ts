import type { ImageSourcePropType } from "react-native";

import { DEFAULT_AVATAR_IMAGE } from "@/constants/images";

export function getUserAvatarSource(
  avatarUrl?: string | null,
): ImageSourcePropType {
  const trimmed = avatarUrl?.trim();
  if (trimmed) return { uri: trimmed };
  return DEFAULT_AVATAR_IMAGE;
}
