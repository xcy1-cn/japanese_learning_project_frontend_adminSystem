import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

let isRedirectingToLogin = false;

const clearLoginInfo = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_username");
  localStorage.removeItem("admin_role");
};

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const backendMessage =
      error.response?.data?.message || error.response?.data?.Message || error.response?.data?.title;

    if (status === 401) {
      clearLoginInfo();

      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;

        ElMessage.error("登录已失效，请重新登录");

        router.replace("/login").finally(() => {
          isRedirectingToLogin = false;
        });
      }

      return Promise.reject(error);
    }

    if (status === 403) {
      ElMessage.error("权限不足，无法访问该资源");
      return Promise.reject(error);
    }

    if (status === 404) {
      ElMessage.error(backendMessage || "请求资源不存在");
      return Promise.reject(error);
    }

    if (status === 400) {
      ElMessage.error(backendMessage || "请求参数错误");
      return Promise.reject(error);
    }

    if (status && status >= 500) {
      ElMessage.error(backendMessage || "服务器异常，请稍后重试");
      return Promise.reject(error);
    }

    if (error.code === "ECONNABORTED") {
      ElMessage.error("请求超时，请检查后端服务");
      return Promise.reject(error);
    }

    if (!error.response) {
      ElMessage.error("无法连接后端服务，请检查接口地址或后端是否启动");
      return Promise.reject(error);
    }

    ElMessage.error(backendMessage || "请求失败");

    console.error("API Error:", error);
    return Promise.reject(error);
  },
);

export default request;
