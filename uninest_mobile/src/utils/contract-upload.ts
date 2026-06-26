import { Platform } from "react-native";

export type ContractPdfUpload = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

function normalizeNativeUri(uri: string) {
  if (
    Platform.OS === "android" &&
    !uri.startsWith("file://") &&
    !uri.startsWith("content://")
  ) {
    return `file://${uri}`;
  }
  return uri;
}

export async function appendPdfToFormData(
  formData: FormData,
  fieldName: string,
  file: ContractPdfUpload,
) {
  const fileName = file.fileName ?? `contract-${Date.now()}.pdf`;
  const mimeType = file.mimeType ?? "application/pdf";

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
