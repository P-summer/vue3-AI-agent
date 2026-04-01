// src/request/chat.ts
import service from "./axios";
import type { ChatSession, Message } from "@/types/chat";

// 获取会话列表
export const getChatSessions = async (): Promise<ChatSession[]> => {
  const res = await service.get("/api/conversation/list");
  return res.data;
};

// 创建会话
export const createChatSession = async (data: {
  ext_session_id: string;
  title: string;
}): Promise<ChatSession> => {
  const res = await service.post("/api/conversation/create", data);
  return res.data;
};

// 删除会话
export const deleteChatSession = async (sessionId: string) => {
  return service.post(`/api/conversation/delete`, {
    ext_session_id: sessionId,
  });
};
// 重命名会话
export const renameChatSession = async (data: {
  ext_session_id: string;
  title: string;
}): Promise<ChatSession> => {
  const res = await service.post("/api/conversation/rename", data);
  return res.data;
};
// 获取当前会话消息列表
export const getSessionMessages = async (
  sessionId: string,
): Promise<Message[]> => {
  const res = await service.get(`/api/message/list`, {
    params: { ext_session_id: sessionId },
  });
  return res.data;
};
