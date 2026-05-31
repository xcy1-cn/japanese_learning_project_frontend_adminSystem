import request from "./request";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export const loginApi = (data: LoginRequest) => {
  return request.post<LoginResponse>("/auth/login", data);
};

export const getMeApi = () => {
  return request.get("/auth/me");
};
