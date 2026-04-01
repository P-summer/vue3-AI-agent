<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label>用户名</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-item">
          <label>密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <div class="error-text" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="auth-btn" :disabled="loading">
          {{ loading ? "登录中..." : "登录" }}
        </button>
      </form>
      <div class="auth-link">
        还没有账号？<router-link to="/auth/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type { LoginRequest } from "@/types/auth";

const router = useRouter();
const authStore = useAuthStore();

// 表单数据
const form = ref<LoginRequest>({
  username: "",
  password: "",
});
const loading = ref(false);
const errorMsg = ref("");

// 登录处理
const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const result = await authStore.loginAction(form.value);
    if (result === true) {
      // 登录成功，跳转到之前的页面或聊天页
      const redirect =
        (router.currentRoute.value.query.redirect as string) || "/chat";
      router.push(redirect);
    } else {
      errorMsg.value = result;
    }
  } catch (err) {
    errorMsg.value = (err as Error).message || "登录失败";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-card {
  width: 400px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.auth-card h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

.form-item input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-item input:focus {
  outline: none;
  border-color: #1a73e8;
}

.auth-btn {
  width: 100%;
  padding: 12px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-btn:disabled {
  background-color: #9fc1f7;
  cursor: not-allowed;
}

.auth-btn:hover:not(:disabled) {
  background-color: #0d66d0;
}

.error-text {
  color: #f5222d;
  text-align: center;
  margin-bottom: 16px;
  min-height: 20px;
}

.auth-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
}

.auth-link a {
  color: #1a73e8;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
