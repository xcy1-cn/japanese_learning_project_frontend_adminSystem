import request from "./request";

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PagedResult<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

const getCountByListApi = (url: string): Promise<ApiResponse<PagedResult<unknown>>> => {
  return request.get(url, {
    params: {
      page: 1,
      pageSize: 1,
    },
  });
};

export const getDashboardCountsApi = async () => {
  const [articleRes, sentenceRes, vocabularyRes, grammarRes, questionRes] = await Promise.all([
    getCountByListApi("/Article"),
    getCountByListApi("/Sentence"),
    getCountByListApi("/Vocabulary"),
    getCountByListApi("/GrammarPoint"),
    getCountByListApi("/Question"),
  ]);

  return {
    articleCount: articleRes.data?.total || 0,
    sentenceCount: sentenceRes.data?.total || 0,
    vocabularyCount: vocabularyRes.data?.total || 0,
    grammarCount: grammarRes.data?.total || 0,
    questionCount: questionRes.data?.total || 0,
  };
};
