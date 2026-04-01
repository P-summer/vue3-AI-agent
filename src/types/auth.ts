// 用户信息类型
export interface User {
  id: string;
  username: string;
  token: string;
  email: string;
  status: number;
}

// 登录请求参数
export interface LoginRequest {
  username: string;
  password: string;
}

// 注册请求参数
export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword?: string; // 前端验证用
}

// 登录/注册响应
export interface AuthResponse {
  code: number;
  message: string;
  data: {
    user: User;
    token: string;
  };
}
