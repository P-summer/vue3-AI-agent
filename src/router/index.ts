import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// 懒加载页面
const Login = () => import("@/views/Auth/Login.vue");
const Register = () => import("@/views/Auth/Register.vue");
const Chat = () => import("@/views/AiChat/index.vue");
const MainLayout = () => import("@/views/Layout/MainLayout.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/chat", // 默认跳转到聊天页（会被守卫拦截到登录）
    },
    {
      path: "/auth",
      children: [
        { path: "login", component: Login, name: "Login" },
        { path: "register", component: Register, name: "Register" },
      ],
    },
    {
      path: "/",
      component: MainLayout,
      meta: { requiresAuth: true }, // 需要登录
      children: [{ path: "chat", component: Chat, name: "Chat" }],
    },
    { path: "/:pathMatch(.*)*", redirect: "/" }, // 404
  ],
});

// 路由守卫：验证登录状态
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.initUser();
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !authStore.isLogin) {
    // 未登录，跳转到登录页
    next({ name: "Login", query: { redirect: to.fullPath } });
  } else if (to.name === "Login" && authStore.isLogin) {
    // 已登录，访问登录页跳转到聊天页
    next({ name: "Chat" });
  } else {
    next();
  }
});

export default router;
