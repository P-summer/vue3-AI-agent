// src/stores/auth.ts
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { login, register, logout, getCurrentUser } from "@/request/auth";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth";
import { ElMessage } from "element-plus";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isLogin = computed(() => !!user.value);
  // 标记用户初始化是否完成（解决异步时机问题）
  const initFinished = ref(false);
  // 防止 initUser 重复调用（比如多路由触发时）
  let initPromise: Promise<void> | null = null;
  // 初始化：页面加载时从后端拉取用户信息（有 Token 时）
  const initUser = async () => {
    // 如果已经初始化过/正在初始化，直接返回
    if (initFinished.value || initPromise) return initPromise;
    // 把请求赋值给 initPromise，防止并发调用
    initPromise = new Promise(async (resolve) => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getCurrentUser();
          user.value = res.userInfo;
        } catch (e) {
          // token 失效/接口报错：清空本地 token，避免假登录态
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          user.value = null;
          ElMessage.error("登录状态失效，请重新登录");
        }
      }
      // 无论成功/失败，都标记初始化完成
      initFinished.value = true;
      resolve();
    });

    return initPromise;
  };

  // 登录
  const loginAction = async (params: LoginRequest) => {
    try {
      const res = await login(params);
      user.value = res.data.user;
      localStorage.setItem("userInfo", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      ElMessage.success("登录成功");
      return true;
    } catch (error: any) {
      const msg = error.message || "登录失败";
      ElMessage.error(msg);
      return msg;
    }
  };

  // 注册（增加前端验证）
  const registerAction = async (params: RegisterRequest) => {
    if (params.password !== params.confirmPassword) {
      ElMessage.error("两次密码不一致");
      return "两次密码不一致";
    }
    if (params.password.length < 6) {
      ElMessage.error("密码长度不能少于6位");
      return "密码长度不能少于6位";
    }
    try {
      const res = await register(params);
      ElMessage.success("注册成功，请登录");
      return true;
    } catch (error: any) {
      const msg = error.message || "注册失败";
      ElMessage.error(msg);
      return msg;
    }
  };

  // 退出登录（清空后端+本地）
  const logoutAction = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn("退出接口失败:", e);
    }
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    user.value = null;
    ElMessage.success("退出成功");
  };

  return { user, isLogin, initUser, loginAction, registerAction, logoutAction };
});
