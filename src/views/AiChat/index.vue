<template>
  <div class="chat-container">
    <!-- 对话列表 -->
    <ChatList />
    <!-- 对话房间 -->
    <ChatRoom :session-id="chatStore.activeSessionId" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import ChatList from "./ChatList.vue";
import ChatRoom from "./ChatRoom.vue";
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth";

const chatStore = useChatStore();
const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initUser(); // 先初始化用户
  if (authStore.isLogin) {
    await chatStore.initSessions();
    // console.log(chatStore.sessions);
    if (chatStore.sessions.length === 0) await chatStore.createSession();
  }
});
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100%;
  width: 100%;
}
</style>
