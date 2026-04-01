// 长期记忆项类型
export interface MemoryItem {
  id: number;
  userId: string;
  content: string; // 记忆关键内容（如“用户喜欢喝咖啡”）
  createTime: number;
  sessionId?: string; // 关联的会话ID
}

// 原有Message扩展（增加后端生成的id）
export interface Message {
  id?: number; // 新增：后端主键ID
  role: "user" | "assistant";
  content: string;
  createTime?: number; // 新增：消息创建时间
}

// 原有ChatSession扩展（适配后端）
export interface ChatSession {
  id: number;
  ext_session_id: string;
  title: string;
  userId: string;
  createTime: number;
  updateTime: number;
  messages?: Message[]; // 可选：后端返回会话时可附带最新几条消息
}
