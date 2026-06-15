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

export interface Vocabulary {
  id: number;
  word: string;
  reading?: string;
  meaning: string;
  partOfSpeech?: string;
  level?: string;
}

export interface VocabularyListParams {
  word?: string;
  level?: string;
  partOfSpeech?: string;
  page: number;
  pageSize: number;
}

export interface CreateVocabularyRequest {
  word: string;
  reading?: string;
  meaning: string;
  partOfSpeech?: string;
  level?: string;
}

export interface UpdateVocabularyRequest {
  id: number;
  word: string;
  reading?: string;
  meaning: string;
  partOfSpeech?: string;
  level?: string;
}

export const getVocabularyListApi = (
  params: VocabularyListParams,
): Promise<ApiResponse<PagedResult<Vocabulary>>> => {
  return request.get("/Vocabulary", { params });
};

export const getVocabularyDetailApi = (id: number): Promise<ApiResponse<Vocabulary>> => {
  return request.get(`/Vocabulary/${id}`);
};

export const createVocabularyApi = (
  data: CreateVocabularyRequest,
): Promise<ApiResponse<Vocabulary>> => {
  return request.post("/Vocabulary", data);
};

export const updateVocabularyApi = (
  id: number,
  data: UpdateVocabularyRequest,
): Promise<ApiResponse<null>> => {
  return request.put(`/Vocabulary/${id}`, data);
};

export const deleteVocabularyApi = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/Vocabulary/${id}`);
};
