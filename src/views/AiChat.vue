<template>
  <div class="chat-container">
    <!-- 用户选择区域 -->
    <div class="user-panel">
      <label for="user-select">当前用户：</label>
      <select id="user-select" v-model="currentUserId">
        <option value="user1">用户A (user1)</option>
        <option value="user2">用户B (user2)</option>
        <option value="user3">用户C (user3)</option>
      </select>
      <span class="user-hint">（记忆按用户隔离）</span>
    </div>

    <!-- 对话历史 -->
    <div class="chat-history" ref="chatHistoryRef">
      <div
        v-for="(msg, index) in messageList"
        :key="index"
        :class="msg.role === 'user' ? 'user-msg' : 'ai-msg'"
      >
        <span v-if="msg.content">
          <span>{{ msg.role === "user" ? "你" : "AI" }}：</span>
          <span class="file-content" v-html="marked.parse(msg.content)"></span>
        </span>
      </div>
      <!-- 加载状态 -->
      <div v-if="isLoading" class="ai-msg">
        <span>AI：</span>
        <span>正在思考中...</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <textarea
        v-model="promptValue"
        placeholder="输入你的问题...按Enter发送，Shift+Enter换行"
        @keydown="handleKeyDown"
        :disabled="isLoading"
      ></textarea>
      <button
        class="send-btn"
        @click="handleSend"
        :disabled="!promptValue.trim() || isLoading"
      >
        {{ isLoading ? "发送中..." : "发送" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from "vue";
import { sendAiMessageStreams } from "@/request/aiAgent";
import { marked } from "marked";

interface Message {
  role: "user" | "assistant";
  content: string;
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

// ---------- 用户管理 ----------
const currentUserId = ref("user1"); // 默认用户ID

// ---------- 聊天数据 ----------
const promptValue = ref("");
const messageList = reactive<Message[]>([]);
const isLoading = ref(false);
const chatHistoryRef = ref<HTMLDivElement | null>(null);

// 根据当前用户生成 localStorage 的 key
const getStorageKey = (userId: string) => `aiChatHistory_${userId}`;

// 加载指定用户的聊天记录
const loadUserHistory = (userId: string) => {
  // 清空当前列表
  messageList.splice(0, messageList.length);
  const saved = localStorage.getItem(getStorageKey(userId));
  if (saved) {
    try {
      const history = JSON.parse(saved) as Message[];
      messageList.push(...history);
    } catch (e) {
      console.warn("解析历史记录失败", e);
    }
  }
  nextTick(() => scrollToBottom());
};

// 监听用户切换
watch(currentUserId, (newId, oldId) => {
  if (newId !== oldId) {
    loadUserHistory(newId);
  }
});

// 保存历史到 localStorage（自动触发）
watch(
  messageList,
  () => {
    localStorage.setItem(
      getStorageKey(currentUserId.value),
      JSON.stringify(messageList),
    );
    scrollToBottom();
  },
  { deep: true },
);

// ---------- 发送消息 ----------
const handleSend = async () => {
  const prompt = promptValue.value.trim();
  if (!prompt || isLoading.value) return;

  // 添加用户消息
  messageList.push({ role: "user", content: prompt });
  promptValue.value = "";
  isLoading.value = true;

  const aiMessageIndex = messageList.length;
  messageList.push({ role: "assistant", content: "" });
  const aiMessage = messageList[aiMessageIndex] || {
    role: "assistant",
    content: "",
  };

  let fullContent = "";
  let hasStarted = false;

  try {
    await sendAiMessageStreams(
      prompt,
      currentUserId.value, // 使用当前选中的用户 ID 作为 sessionId
      (chunk) => {
        if (!hasStarted) {
          hasStarted = true;
          isLoading.value = false;
        }
        fullContent += chunk;
        aiMessage.content = fullContent;
      },
      (finalContent) => {
        aiMessage.content = finalContent;
        isLoading.value = false;
      },
      (errorMsg) => {
        aiMessage.content = `出错了！${errorMsg}`;
        isLoading.value = false;
      },
    );
  } catch (error) {
    aiMessage.content = `出错了！${
      error instanceof Error ? error.message : "请求失败"
    }`;
    isLoading.value = false;
  }
};

// 键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    if (e.shiftKey) return;
    e.preventDefault();
    handleSend();
  }
};

const scrollToBottom = () => {
  if (chatHistoryRef.value) {
    chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight;
  }
};

onMounted(() => {
  // 加载默认用户的聊天记录
  loadUserHistory(currentUserId.value);
});
</script>

<style scoped>
/* 原有样式保持不变，仅添加用户选择区域的样式 */
.chat-container {
  width: 800px;
  margin: 20px auto;
}

.user-panel {
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: #f0f2f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-panel label {
  font-weight: 500;
  color: #333;
}

.user-panel select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
}

.user-panel select:focus {
  outline: none;
  border-color: #1a73e8;
}

.user-hint {
  color: #666;
  font-size: 13px;
  margin-left: auto;
}

.chat-history {
  height: 450px; /* 稍微减小高度，给用户面板留出空间 */
  border: 1px solid #ccc;
  padding: 10px;
  overflow-y: auto;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

/* 以下样式保持原样，不再重复，可从原文件复制 */
.ai-msg .file-content {
  line-height: 1.6;
  font-size: 15px;
}
.ai-msg .file-content p {
  margin: 0.5em 0;
}
.ai-msg .file-content strong {
  color: #1a73e8;
}
.ai-msg .file-content ul,
.ai-msg .file-content ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}
.ai-msg .file-content li {
  margin: 0.2em 0;
}
.ai-msg .file-content code {
  background-color: #f0f0f0;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}
.ai-msg .file-content pre {
  background-color: #f5f5f5;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}
.ai-msg .file-content blockquote {
  border-left: 4px solid #ddd;
  margin: 0.5em 0;
  padding-left: 1em;
  color: #666;
}
.user-msg {
  text-align: right;
  margin: 8px 0;
  color: #1a73e8;
}
.ai-msg {
  text-align: left;
  margin: 8px 0;
  color: #333;
}
.input-area {
  display: flex;
  gap: 10px;
}
textarea {
  flex: 1;
  height: 80px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
  font-size: 14px;
}
textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
.send-btn {
  width: 80px;
  height: 90px;
  border: none;
  border-radius: 4px;
  background-color: #1a73e8;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}
.send-btn:disabled {
  background-color: #9fc1f7;
  cursor: not-allowed;
}
.send-btn:hover:not(:disabled) {
  background-color: #0d66d0;
}
</style>
