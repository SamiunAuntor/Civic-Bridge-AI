import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import type { ApiErrorResponse } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorResponse | unknown;

  constructor(message: string, status: number, payload?: ApiErrorResponse | unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function getIdToken() {
  if (!isFirebaseConfigured || !firebaseAuth?.currentUser) {
    throw new ApiError("Unauthorized", 401);
  }

  return firebaseAuth.currentUser.getIdToken();
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : response.statusText || "Request failed";

    if ([401, 403, 404, 422, 500].includes(response.status)) {
      throw new ApiError(message, response.status, payload);
    }

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string) {
    return request<T>(path, { method: "GET" });
  },
  post<T, TBody>(path: string, body: TBody) {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
