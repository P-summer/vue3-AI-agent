<template>
  <div class="chat-list">
    <!-- 新建对话按钮 -->
    <button class="new-chat-btn" @click="createNewChat">
      <span>+</span> 新建对话
    </button>
    <!-- 会话列表 -->
    <div class="session-list">
      <div
        v-for="session in chatStore.sessions"
        :key="session.id"
        class="session-item"
        :class="{
          active: session.ext_session_id === chatStore.activeSessionId,
        }"
        @click="chatStore.activeSessionId = session.ext_session_id"
      >
        <div class="session-title">{{ session.title }}</div>
        <el-dropdown
          trigger="click"
          @command="(cmd) => handleMenuCommand(cmd, session)"
          @click.stop
        >
          <div class="more-btn" @click.stop>
            <el-icon><MoreFilled /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="rename">重命名</el-dropdown-item>
              <el-dropdown-item command="delete">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div v-if="chatStore.sessions.length === 0" class="empty-tip">
        暂无对话，点击新建开始聊天吧
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useChatStore } from "@/stores/chat";
import { ElMessageBox, ElMessage } from "element-plus";
import { MoreFilled } from "@element-plus/icons-vue";
import { renameChatSession } from "@/request/chat";
import type { ChatSession } from "@/types/chat";

const chatStore = useChatStore();

// 是否可以新建会话：当前激活的会话存在且有消息（至少一条）
const canCreateNewSession = computed(() => {
  const active = chatStore.activeSession;
  return active && active.messages && active.messages.length > 0;
});
// 新建会话
const createNewChat = async () => {
  if (!canCreateNewSession.value) {
    return;
  }
  await chatStore.createSession();
};

// 处理菜单命令
const handleMenuCommand = async (command: string, session: ChatSession) => {
  if (command === "rename") {
    try {
      const { value: newTitle } = await ElMessageBox.prompt(
        "请输入新标题",
        "重命名对话",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputValue: session.title,
          inputValidator: (val) => {
            if (!val || val.trim() === "") return "标题不能为空";
            if (val.length > 50) return "标题不能超过50个字符";
            return true;
          },
        },
      );
      if (newTitle && newTitle !== session.title) {
        // 调用后端接口更新标题
        await renameChatSession({
          ext_session_id: session.ext_session_id,
          title: newTitle,
        });
        // 更新本地 store 中的标题
        const target = chatStore.sessions.find(
          (s) => s.ext_session_id === session.ext_session_id,
        );
        if (target) target.title = newTitle;
        ElMessage.success("重命名成功");
      }
    } catch (err) {
      // 用户取消
    }
  } else if (command === "delete") {
    ElMessageBox.confirm("确定删除？删除后无法恢复", "提示", {
      type: "warning",
    })
      .then(async () => {
        await chatStore.deleteSession(session.ext_session_id);
      })
      .catch(() => ElMessage.info("已取消删除"));
  }
};
</script>

<style scoped>
.chat-list {
  width: 260px;
  height: 100%;
  background-color: #f8f9fa;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.new-chat-btn {
  margin: 10px;
  padding: 10px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.new-chat-btn:hover {
  background-color: #0d66d0;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 5px;
}

.session-item {
  padding: 10px 12px;
  margin-bottom: 5px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #333;
}

.session-item:hover {
  background-color: #e8eaed;
}

.session-item.active {
  background-color: #d2e3fc;
  color: #1a73e8;
  font-weight: 500;
}

.delete-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  display: none;
}

.session-item:hover .delete-btn {
  display: block;
}

.delete-btn:hover {
  color: #f5222d;
}

.empty-tip {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>
