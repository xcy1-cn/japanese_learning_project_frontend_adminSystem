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

export interface Question {
  id: number;
  articleId?: number;
  sentenceId?: number;
  type: string;
  stem: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  answer: string;
  explanation?: string;
  level?: string;
  createdAt?: string;
}

export interface QuestionListParams {
  type?: string;
  keyword?: string;
  page: number;
  pageSize: number;
}

export interface CreateQuestionRequest {
  articleId?: number;
  sentenceId?: number;
  type: string;
  stem: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  answer: string;
  explanation?: string;
  level?: string;
}

export interface UpdateQuestionRequest extends CreateQuestionRequest {
  id: number;
}

export const getQuestionListApi = (
  params: QuestionListParams,
): Promise<ApiResponse<PagedResult<Question>>> => {
  return request.get("/Question", { params });
};

export const getQuestionDetailApi = (id: number): Promise<ApiResponse<Question>> => {
  return request.get(`/Question/${id}`);
};

export const createQuestionApi = (
  data: CreateQuestionRequest,
): Promise<ApiResponse<{ id: number } | Question>> => {
  return request.post("/Question", data);
};

export const updateQuestionApi = (
  id: number,
  data: UpdateQuestionRequest,
): Promise<ApiResponse<null>> => {
  return request.put(`/Question/${id}`, data);
};

export const deleteQuestionApi = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/Question/${id}`);
};
