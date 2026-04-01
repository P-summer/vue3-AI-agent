// src/stores/chat.ts
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { ChatSession, Message } from "@/types/chat";
import { useAuthStore } from "./auth";
import {
  getChatSessions,
  createChatSession,
  deleteChatSession,
  getSessionMessages,
} from "@/request/chat";
import { ElMessage } from "element-plus";
import { v4 as uuidv4 } from "uuid";

export const useChatStore = defineStore("chat", () => {
  const authStore = useAuthStore();
  const sessions = ref<ChatSession[]>([]);
  const activeSessionId = ref<string>("");
  const loading = ref(false);

  // 初始化会话列表（从后端拉取）
  const initSessions = async () => {
    if (!authStore.isLogin) return;
    loading.value = true;
    try {
      const res = await getChatSessions();
      sessions.value = res.list || [];
      // 默认激活第一个会话，并加载其消息
      if (sessions.value.length > 0) {
        activeSessionId.value = sessions.value[0].ext_session_id;
        await loadSessionMessages(sessions.value[0].ext_session_id);
      }
    } catch (e) {
      ElMessage.error("加载会话失败");
      sessions.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 加载会话消息（懒加载）
  const loadSessionMessages = async (sessionId: string) => {
    const session = sessions.value.find((s) => s.ext_session_id === sessionId);
    if (session) {
      const messageRes = await getSessionMessages(sessionId);
      session.messages = messageRes.list || [];
    }
  };

  // 创建会话（调用后端）
  const createSession = async (title = "新对话") => {
    if (!authStore.isLogin) throw new Error("请先登录");
    loading.value = true;
    try {
      const uuid = uuidv4();
      const newSession = await createChatSession({
        ext_session_id: uuid,
        title,
      });
      sessions.value.unshift(newSession);
      activeSessionId.value = newSession.ext_session_id;
      // ElMessage.success("创建会话成功");
      return newSession;
    } catch (e) {
      // ElMessage.error("创建会话失败");
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // 切换会话（并加载消息）
  const switchSession = async (sessionId: string) => {
    activeSessionId.value = sessionId;
    await loadSessionMessages(sessionId);
  };

  // 删除会话（调用后端）
  const deleteSession = async (sessionId: string) => {
    loading.value = true;
    try {
      await deleteChatSession(sessionId);
      const index = sessions.value.findIndex(
        (s) => s.ext_session_id === sessionId,
      );
      if (index > -1) sessions.value.splice(index, 1);
      // 切换激活会话
      if (activeSessionId.value === sessionId) {
        activeSessionId.value =
          sessions.value.length > 0 ? sessions.value[0].ext_session_id : "";
        if (sessions.value.length > 0)
          await loadSessionMessages(sessions.value[0].ext_session_id);
      }
      ElMessage.success("删除会话成功");
    } catch (e) {
      ElMessage.error("删除会话失败");
    } finally {
      loading.value = false;
    }
  };

  // 计算属性：当前激活的会话
  const activeSession = computed(() => {
    return (
      sessions.value.find((s) => s.ext_session_id === activeSessionId.value) ||
      null
    );
  });

  return {
    sessions,
    activeSessionId,
    activeSession,
    loading,
    initSessions,
    createSession,
    switchSession,
    deleteSession,
    loadSessionMessages,
  };
});
