<template>
  <div class="chat-room" v-if="session">
    <!-- 无消息提示 -->
    <div v-if="session.messages?.length === 0" class="empty-chat">
      <p>开始你的对话吧！</p>
    </div>
    <!-- 对话历史 -->
    <div class="chat-history" ref="chatHistoryRef">
      <div
        v-for="(msg, index) in session.messages"
        :key="index"
        :class="msg.role === 'user' ? 'user-msg' : 'ai-msg'"
      >
        <span>
          <span>{{ msg.role === "user" ? "你" : "AI" }}：</span>
          <span
            class="file-content"
            v-html="marked.parse(msg.content || '')"
          ></span>
        </span>
      </div>
      <!-- 加载状态 -->
      <div v-if="isLoading" class="ai-msg">
        <span>AI：</span>
        <span>正在思考中...</span>
      </div>
    </div>
    <!-- 输入区域 -->
    <div class="input-wrapper">
      <!-- 模型选择栏 -->
      <div class="model-bar">
        <span class="model-label">当前模型：</span>
        <el-select
          v-model="selectedModel"
          placeholder="请选择模型"
          :disabled="isLoading"
          size="default"
          class="model-select"
        >
          <el-option
            v-for="item in modelOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
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
  </div>
  <div v-else class="no-session">请选择或新建一个对话</div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from "vue";
import { marked } from "marked";
import { sendAiMessageStreams, douBaoAgentStream } from "@/request/aiAgent";
import { useChatStore } from "@/stores/chat";
import type { Message } from "@/types/chat";
import { ElMessage, ElSelect, ElOption } from "element-plus";

marked.setOptions({ breaks: true, gfm: true });

const props = defineProps<{ sessionId: string }>();

const chatStore = useChatStore();
const session = computed(() => {
  return chatStore.activeSession;
});

const promptValue = ref("");
const isLoading = ref(false);
const chatHistoryRef = ref<HTMLDivElement | null>(null);

// 模型选项配置
const modelOptions = [
  { label: "DeepSeek-V3.2", value: "/api/deepSeekAgentStream" },
  { label: "doubao", value: "/api/douBaoChat" },
  { label: "planner", value: "/api/chatDeepSeek" },
];
// 默认模型（优先读取本地存储）
const selectedModel = ref<string>(
  localStorage.getItem("selectedModel") || "/api/deepSeekAgentStream",
);

// 监听模型变化，持久化到本地
watch(selectedModel, (newVal) => {
  localStorage.setItem("selectedModel", newVal);
});

// 切换会话时加载消息
watch(
  () => props.sessionId,
  async (newId) => {
    if (newId) {
      await chatStore.switchSession(newId);
      promptValue.value = "";
      nextTick(scrollToBottom);
    }
  },
  { immediate: true },
);

// 滚动到底部
const scrollToBottom = () => {
  if (chatHistoryRef.value)
    chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight;
};

// 监听消息变化自动滚动
watch(
  () => session.value?.messages,
  () => nextTick(scrollToBottom),
  { deep: true },
);

// 发送消息
const handleSend = async () => {
  const prompt = promptValue.value.trim();
  if (!prompt || isLoading.value || !session.value) return;

  // 保存用户消息到后端
  const userMsg: Message = {
    role: "user",
    content: prompt,
    createTime: Date.now(),
  };
  session.value.messages.push(userMsg);
  promptValue.value = "";
  isLoading.value = true;

  // 本地占位 AI 消息
  const aiMsg: Message = {
    role: "assistant",
    content: "",
    createTime: Date.now(),
  };
  const aiMsgIndex = session.value.messages.length;
  session.value.messages.push(aiMsg);
  nextTick(scrollToBottom);

  // 公共回调
  const onChunk = (chunk: string) => {
    session.value!.messages[aiMsgIndex].content += chunk;
    nextTick(scrollToBottom);
  };
  const onDone = () => {
    isLoading.value = false;
  };
  const onError = (err: string) => {
    session.value!.messages[aiMsgIndex].content = `出错了！${err}`;
    isLoading.value = false;
    ElMessage.error(err);
  };
  const onTitleUpdated = (newTitle: string) => {
    const target = chatStore.sessions.find(
      (s) => s.ext_session_id === session.value!.ext_session_id,
    );
    if (target) target.title = newTitle;
  };

  // 根据选中的模型调用不同的流式接口
  try {
    await sendAiMessageStreams(
      prompt,
      session.value.ext_session_id,
      selectedModel.value,
      onChunk,
      onDone,
      onError,
      onTitleUpdated,
    );
    chatStore.initSessions();
  } catch (e) {
    const errMsg = (e as Error).message || "发送失败";
    session.value!.messages[aiMsgIndex].content = `出错了！${errMsg}`;
    isLoading.value = false;
    ElMessage.error(errMsg);
  }
};

// 键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

onMounted(async () => {});
</script>

<style scoped>
.chat-room {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fb; /* 柔和背景 */
}

.empty-chat,
.no-session {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #8e9aaf;
  font-size: 16px;
}

/* 聊天历史区域 - 增加左右留白 */
.chat-history {
  flex: 1;
  padding: 20px 10%; /* 左右使用百分比留白，窄屏自动适应 */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px; /* 消息之间的间距 */
}

/* 大屏时限制最大留白，避免太宽 */
@media (min-width: 1200px) {
  .chat-history {
    padding: 20px 15%;
  }
}

/* 消息容器 */
.user-msg,
.ai-msg {
  display: flex;
  width: 100%;
  margin: 4px 0;
}

.user-msg {
  justify-content: flex-end;
}

.ai-msg {
  justify-content: flex-start;
}

/* 消息气泡本体 */
.user-msg > span,
.ai-msg > span {
  display: inline-block;
  max-width: 80%; /* 气泡最大宽度，留出余白 */
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 用户气泡（蓝色） */
.user-msg > span {
  background-color: #1a73e8;
  color: white;
  border-bottom-right-radius: 4px;
}

/* AI 气泡（浅灰色） */
.ai-msg > span {
  background-color: #ffffff;
  color: #1e2a3a;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 隐藏角色前缀（“你：”和“AI：”） */
.user-msg span span:first-child,
.ai-msg span span:first-child {
  display: none;
}

/* Markdown 内容样式继承 */
.file-content {
  color: inherit;
}

/* 链接适配 */
.ai-msg .file-content a {
  color: #1a73e8;
  text-decoration: none;
}
.ai-msg .file-content a:hover {
  text-decoration: underline;
}
.user-msg .file-content a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
}

/* 代码块适配 */
.ai-msg .file-content pre,
.ai-msg .file-content code {
  background-color: #f0f2f5;
  color: #1e2a3a;
}
.user-msg .file-content pre,
.user-msg .file-content code {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 加载状态气泡（复用 AI 气泡） */
.ai-msg:has(span:only-child) span {
  background-color: #e9ecf0;
  color: #333333;
  font-style: italic;
}

/* 输入区域整体容器 */
.input-wrapper {
  background-color: white;
  border-top: 1px solid #e9ecf0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.02);
}

/* 模型选择栏样式，与输入区域左右留白对齐 */
.model-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10% 0 10%;
  background-color: white;
}

@media (min-width: 1200px) {
  .model-bar {
    padding: 12px 15% 0 15%;
  }
}

.model-label {
  font-size: 14px;
  color: #5f6b7a;
  white-space: nowrap;
}

.model-select {
  width: 200px;
}

/* 输入区域 */
.input-area {
  display: flex;
  gap: 12px;
  padding: 12px 10% 16px 10%;
}

@media (min-width: 1200px) {
  .input-area {
    padding: 12px 15% 16px 15%;
  }
}

textarea {
  flex: 1;
  height: 80px;
  padding: 12px 16px;
  border: 1px solid #d9e1ec;
  border-radius: 24px;
  resize: none;
  font-size: 15px;
  line-height: 1.5;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
}

textarea:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

textarea:disabled {
  background-color: #f5f7fb;
  cursor: not-allowed;
}

.send-btn {
  width: 80px;
  height: 80px;
  border: none;
  border-radius: 40px;
  background-color: #1a73e8;
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition:
    background-color 0.2s,
    transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:disabled {
  background-color: #a0c3f0;
  cursor: not-allowed;
}

.send-btn:hover:not(:disabled) {
  background-color: #0d66d0;
  transform: scale(1.02);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
