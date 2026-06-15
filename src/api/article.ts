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

export interface Article {
  id: number;
  title: string;
  content: string;
  level?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleListParams {
  keyword?: string;
  level?: string;
  category?: string;
  page: number;
  pageSize: number;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  level?: string;
  category?: string;
}

export interface UpdateArticleRequest {
  id: number;
  title: string;
  content: string;
  level?: string;
  category?: string;
}

export const getArticleListApi = (
  params: ArticleListParams,
): Promise<ApiResponse<PagedResult<Article>>> => {
  return request.get("/Article", { params });
};

export const getArticleDetailApi = (id: number): Promise<ApiResponse<Article>> => {
  return request.get(`/Article/${id}`);
};

export const createArticleApi = (data: CreateArticleRequest): Promise<ApiResponse<Article>> => {
  return request.post("/Article", data);
};

export const updateArticleApi = (
  id: number,
  data: UpdateArticleRequest,
): Promise<ApiResponse<null>> => {
  return request.put(`/Article/${id}`, data);
};

export const deleteArticleApi = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/Article/${id}`);
};
