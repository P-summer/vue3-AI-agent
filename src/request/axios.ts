import axios from "axios";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";

// 开发环境用本地后端地址，生产环境用空字符串（相对路径）
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : import.meta.env.VITE_BACKEND_URL || "";

const service = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截：添加 Token
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = localStorage.getItem("token") || authStore.user?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截：统一错误处理 + Token 过期跳转
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      ElMessage.error(res.message || "请求失败");
      return Promise.reject(res);
    }
    return res;
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logoutAction();
      ElMessage.error("登录已过期，请重新登录");
      // window.location.href = "/auth/login";
    }
    ElMessage.error(error.message || "服务器错误");
    return Promise.reject(error);
  },
);

export default service;
