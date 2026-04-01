<template>
  <div class="main-layout">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-left">
        <h2>AI 对话助手</h2>
      </div>
      <div class="header-right">
        <span class="username">欢迎，{{ authStore.user?.username }}</span>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </header>
    <!-- 内容区域 -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

// 退出登录
const handleLogout = () => {
  authStore.logoutAction();
  router.push({ name: "Login" });
};
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #1a73e8;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  font-size: 18px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.username {
  font-size: 14px;
}

.logout-btn {
  padding: 6px 12px;
  background-color: white;
  color: #1a73e8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #f0f2f5;
}

.content {
  flex: 1;
  overflow: hidden;
}
</style>
