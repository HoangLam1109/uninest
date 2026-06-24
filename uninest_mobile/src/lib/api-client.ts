import { env } from "@/config/env";
import { getAccessToken } from "@/lib/auth-session";

type ApiErrorBody = {
  message?: string;
  success?: boolean;
};

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseJsonSafe(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}

function toNetworkErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (
    raw.includes("ConnectException") ||
    raw.includes("Network request failed") ||
    raw.includes("Failed to connect")
  ) {
    return `Không kết nối được máy chủ (${env.apiBaseUrl}). Kiểm tra backend đang chạy và đúng URL (Android emulator: 10.0.2.2, máy thật: IP LAN máy tính).`;
  }
  return raw || "Lỗi mạng không xác định";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    const token = getAccessToken();
    const hasJsonBody =
      options.body !== undefined &&
      options.body !== null &&
      options.body !== "";

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (hasJsonBody) {
      headers["Content-Type"] = "application/json";
    }

    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string> | undefined),
      },
    });
  } catch (error) {
    throw new ApiError(toNetworkErrorMessage(error));
  }

  const body = await parseJsonSafe(response);

  if (!response.ok || body.success === false) {
    const message =
      typeof body.message === "string" && body.message.length > 0
        ? body.message
        : `Yêu cầu thất bại (mã ${response.status})`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),

  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    }),

  put: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "PUT",
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    }),

  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  /** Multipart upload — do not set Content-Type; fetch adds boundary. */
  postForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, formData, "POST"),

  putForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, formData, "PUT"),

  patchForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, formData, "PATCH"),
};

async function requestForm<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PUT" | "PATCH" = "POST",
): Promise<T> {
  let response: Response;
  try {
    const token = getAccessToken();
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  } catch (error) {
    throw new ApiError(toNetworkErrorMessage(error));
  }

  const body = await parseJsonSafe(response);

  if (!response.ok || body.success === false) {
    const message =
      typeof body.message === "string" && body.message.length > 0
        ? body.message
        : `Yêu cầu thất bại (mã ${response.status})`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}
