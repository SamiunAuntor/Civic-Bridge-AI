import type { User } from "@/types/domain";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode?: number;
  errors?: unknown;
}

export interface CurrentUserResponse {
  success: true;
  firebaseUser: {
    uid: string;
    email?: string | null;
    name?: string | null;
    picture?: string | null;
  };
  databaseUser: User;
}
