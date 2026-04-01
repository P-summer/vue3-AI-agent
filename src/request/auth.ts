// src/request/auth.ts
import service from "./axios";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth";

// 登录
export const login = async (params: LoginRequest) => {
  return service.post("/api/auth/login", params);
};

// 注册（前端过滤 confirmPassword）
export const register = async (params: RegisterRequest) => {
  const { confirmPassword, ...data } = params;
  return service.post("/api/auth/register", data);
};

// 退出登录（调用后端接口）
export const logout = async () => {
  return service.post("/api/auth/logout");
};

// 获取当前用户（从后端拉取）
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const res = await service.get("/api/auth/currentUser");
    localStorage.setItem("userInfo", JSON.stringify(res.data));
    return res.data;
  } catch (e) {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    return null;
  }
};
