import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

export async function imageUriToDataUrl(
  uri: string,
  mimeType = "image/jpeg",
): Promise<string> {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Không đọc được ảnh chữ ký"));
      };
      reader.onerror = () => reject(new Error("Không đọc được ảnh chữ ký"));
      reader.readAsDataURL(blob);
    });
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:${mimeType};base64,${base64}`;
}
