import request from "./request";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginUserInfo {
  token: string;
  username: string;
  role: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const loginApi = (data: LoginRequest) => {
  return request.post<ApiResponse<LoginUserInfo>>("/Auth/login", data);
};
