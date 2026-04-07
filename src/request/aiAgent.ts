const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const douBaoAgentStream = async (
  message: string,
  sessionId: string,
  onChunk: (chunk: string) => void,
  onDone: (fullContent: string) => void,
  onError: (error: string) => void,
  onTitleUpdated?: (title: string) => void,
) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BACKEND_URL}/api/douBaoChat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!response.body) throw new Error("ReadableStream not supported");

  const reader = response.body.getReader(); //获取响应流的读取器
  const decoder = new TextDecoder(); // 解码二进制数据为文
  let buffer = "";

  while (true) {
    // read()返回 { done: 是否读完, value: 二进制数据块 }
    const { done, value } = await reader.read(); //异步阻塞：如果后端还没发送下一个数据块，代码会停在这一行等待，直到新数据到达或流结束。
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            onChunk(parsed.content);
          } else if (parsed.done) {
            onDone(parsed.fullContent);
          } else if (parsed.error) {
            onError(parsed.error);
          } else if (parsed.type === "title_updated" && onTitleUpdated) {
            onTitleUpdated(parsed.title);
          }
        } catch (e) {
          console.warn("Failed to parse chunk:", data);
        }
      }
    }
  }
};

export const sendAiMessageStreams = async (
  message: string,
  sessionId: string,
  modelPath: string = "/api/deepSeekAgentStream",
  onChunk: (chunk: string) => void,
  onDone: (fullContent: string) => void,
  onError: (error: string) => void,
  onTitleUpdated?: (title: string) => void,
) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BACKEND_URL}${modelPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!response.body) throw new Error("ReadableStream not supported");

  const reader = response.body.getReader(); //获取响应流的读取器
  const decoder = new TextDecoder(); // 解码二进制数据为文
  let buffer = "";

  while (true) {
    // read()返回 { done: 是否读完, value: 二进制数据块 }
    const { done, value } = await reader.read(); //异步阻塞：如果后端还没发送下一个数据块，代码会停在这一行等待，直到新数据到达或流结束。
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            onChunk(parsed.content);
          } else if (parsed.type === "plan" && parsed.plan) {
            const planText = parsed.plan
              .map(
                (step: any, idx: number) =>
                  `📋 步骤 ${idx + 1}: ${step.description}`,
              )
              .join("\n");
            onChunk(`\n🔍 **思考计划：**\n${planText}\n\n`);
          } else if (parsed.type === "step_result") {
            // 不展示原始结果，只展示一个简短的进度提示
            onChunk(`⚙️ 正在执行步骤 ${parsed.stepIndex + 1}...\n\n`);
          } else if (parsed.done) {
            onDone(parsed.fullContent);
          } else if (parsed.error) {
            onError(parsed.error);
          } else if (parsed.type === "title_updated" && onTitleUpdated) {
            onTitleUpdated(parsed.title);
          }
        } catch (e) {
          console.warn("Failed to parse chunk:", data);
        }
      }
    }
  }
};
