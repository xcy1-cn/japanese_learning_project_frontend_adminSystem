import request from "./request";

export interface ImportError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface ImportResult {
  successCount: number;
  failCount: number;
  errors: ImportError[];
}

export const importVocabulariesApi = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return request.post<ImportResult>("/Import/vocabularies", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const importGrammarPointsApi = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return request.post<ImportResult>("/Import/grammar-points", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const importQuestionsApi = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return request.post<ImportResult>("/Import/questions", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
