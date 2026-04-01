<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
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
        <div class="form-item">
          <label>确认密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            required
          />
        </div>
        <div class="error-text" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="auth-btn" :disabled="loading">
          {{ loading ? "注册中..." : "注册" }}
        </button>
      </form>
      <div class="auth-link">
        已有账号？<router-link to="/auth/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type { RegisterRequest } from "@/types/auth";

const router = useRouter();
const authStore = useAuthStore();

// 表单数据
const form = ref<RegisterRequest>({
  username: "",
  password: "",
  confirmPassword: "",
});
const loading = ref(false);
const errorMsg = ref("");

// 注册处理
const handleRegister = async () => {
  // 前端验证
  if (form.value.password !== form.value.confirmPassword) {
    errorMsg.value = "两次输入的密码不一致";
    return;
  }
  if (form.value.password.length < 6) {
    errorMsg.value = "密码长度不能少于6位";
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  try {
    const result = await authStore.registerAction(form.value);
    if (result === true) {
      // 注册成功，跳转到登录页
      router.push({ name: "Login", query: { tip: "注册成功，请登录" } });
    } else {
      errorMsg.value = result;
    }
  } catch (err) {
    errorMsg.value = (err as Error).message || "注册失败";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 样式与登录页一致，复用即可 */
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
