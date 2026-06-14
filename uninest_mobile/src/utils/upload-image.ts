import { Platform } from "react-native";

export type ImageUploadFile = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

function normalizeNativeUri(uri: string) {
  if (Platform.OS === "android" && !uri.startsWith("file://") && !uri.startsWith("content://")) {
    return `file://${uri}`;
  }
  return uri;
}

export async function appendImageToFormData(
  formData: FormData,
  fieldName: string,
  file: ImageUploadFile,
) {
  const fileName = file.fileName ?? `image-${Date.now()}.jpg`;
  const mimeType = file.mimeType ?? "image/jpeg";

  if (Platform.OS === "web") {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    formData.append(fieldName, blob, fileName);
    return;
  }

  formData.append(fieldName, {
    uri: normalizeNativeUri(file.uri),
    name: fileName,
    type: mimeType,
  } as unknown as Blob);
}
