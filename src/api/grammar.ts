import request from "./request";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PagedResult<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface GrammarPoint {
  id: number;
  title: string;
  explanation: string;
  structure?: string;
  example?: string;
  level?: string;
}

export interface GrammarListParams {
  keyword?: string;
  level?: string;
  page: number;
  pageSize: number;
}

export interface CreateGrammarRequest {
  title: string;
  explanation: string;
  structure?: string;
  example?: string;
  level?: string;
}

export interface UpdateGrammarRequest {
  id: number;
  title: string;
  explanation: string;
  structure?: string;
  example?: string;
  level?: string;
}

export const getGrammarListApi = (
  params: GrammarListParams,
): Promise<ApiResponse<PagedResult<GrammarPoint>>> => {
  return request.get("/GrammarPoint", { params });
};

export const getGrammarDetailApi = (id: number): Promise<ApiResponse<GrammarPoint>> => {
  return request.get(`/GrammarPoint/${id}`);
};

export const createGrammarApi = (
  data: CreateGrammarRequest,
): Promise<ApiResponse<GrammarPoint>> => {
  return request.post("/GrammarPoint", data);
};

export const updateGrammarApi = (
  id: number,
  data: UpdateGrammarRequest,
): Promise<ApiResponse<{ id: number } | null>> => {
  return request.put(`/GrammarPoint/${id}`, data);
};

export const deleteGrammarApi = (id: number): Promise<ApiResponse<{ id: number } | null>> => {
  return request.delete(`/GrammarPoint/${id}`);
};
