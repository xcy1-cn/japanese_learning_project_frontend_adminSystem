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

export interface Sentence {
  id: number;
  articleId: number;
  japaneseText: string;
  chineseText: string;
  romaji?: string;
  orderIndex: number;
  createdAt?: string;
}

export interface SentenceListParams {
  keyword?: string;
  articleId?: number;
  page: number;
  pageSize: number;
}

export interface CreateSentenceRequest {
  articleId: number;
  japaneseText: string;
  chineseText: string;
  romaji?: string;
  orderIndex: number;
}

export interface UpdateSentenceRequest {
  id: number;
  articleId: number;
  japaneseText: string;
  chineseText: string;
  romaji?: string;
  orderIndex: number;
}

export const getSentenceListApi = (
  params: SentenceListParams,
): Promise<ApiResponse<PagedResult<Sentence>>> => {
  return request.get("/Sentence", { params });
};

export const getArticleSentencesApi = (articleId: number): Promise<Sentence[]> => {
  return request.get(`/Article/${articleId}/sentences`);
};

export const getSentenceDetailApi = (id: number): Promise<ApiResponse<Sentence>> => {
  return request.get(`/Sentence/${id}`);
};

export const createSentenceApi = (data: CreateSentenceRequest): Promise<ApiResponse<Sentence>> => {
  return request.post("/Sentence", data);
};

export const updateSentenceApi = (
  id: number,
  data: UpdateSentenceRequest,
): Promise<ApiResponse<null>> => {
  return request.put(`/Sentence/${id}`, data);
};

export const deleteSentenceApi = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/Sentence/${id}`);
};
