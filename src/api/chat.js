/**
 * LLM 聊天模块 API
 * 包含聊天消息、会话管理、历史记录等功能
 * 
 * @module api/chat
 */

import request from '@/utils/request';

// ==================== 聊天相关 API ====================

/**
 * 发送聊天消息并获取AI回复
 * 
 * @param {Object} data - 消息数据
 * @param {string} data.user_message - 用户的消息内容（必填）
 * @param {string} data.session_id - 会话ID（必填）
 * @param {string} data.pet_type - 宠物类型：fox/dog/snake（必填）
 * @param {number} data.health - 宠物当前健康值，范围0-100（必填）
 * @param {number} data.happiness - 宠物当前快乐值，范围0-100（必填）
 * @param {string} [data.image_data] - Base64编码的图片数据（可选，用于情绪识别）
 * 
 * @returns {Promise<Object>} 返回AI回复
 * @returns {boolean} return.success - 请求是否成功
 * @returns {Object} return.data - 响应数据
 * @returns {boolean} return.data.result - 处理结果
 * @returns {string} return.data.message - 宠物的回复消息
 * @returns {string[]} return.data.options - 用户可选的回复选项数组
 * @returns {number} return.data.health - 更新后的宠物健康值（0-100）
 * @returns {number} return.data.mood - 更新后的宠物快乐值（0-100）
 * @returns {string} return.response - 响应消息（通常与data.message相同）
 * 
 * @throws {Error} 发送失败时抛出错误
 * 
 * @example
 * // 基本使用
 * const response = await chat({
 *   user_message: '你好，请介绍一下你自己',
 *   session_id: 'default',
 *   pet_type: 'fox',
 *   health: 80,
 *   happiness: 75
 * });
 * 
 * // 返回示例：
 * // {
 * //   "success": true,
 * //   "data": {
 * //     "result": true,
 * //     "message": "*Yip!* I'm Lingling, clever and spiritual!",
 * //     "options": ["Tell me a riddle", "Want to play?", "Show me a trick"],
 * //     "health": 85,
 * //     "mood": 80
 * //   },
 * //   "response": "*Yip!* I'm Lingling, clever and spiritual!"
 * // }
 * 
 * @example
 * // 带图片数据的聊天（用于情绪识别）
 * const response = await chat({
 *   user_message: '看看我现在的表情',
 *   session_id: 'my-session',
 *   pet_type: 'dog',
 *   health: 90,
 *   happiness: 85,
 *   image_data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
 * });
 */
export function chat(data) {
  return request({
    url: '/llm/chat/',
    method: 'post',
    data
  });
}

/**
 * 发送聊天消息的别名函数
 * @see chat
 */
export const sendMessage = chat;

// ==================== 消息历史 API ====================

/**
 * 获取消息历史记录
 * 
 * 支持分页、搜索、排序和会话过滤
 * 
 * @param {Object} [params] - 查询参数
 * @param {string} [params.session_id] - 会话ID，用于过滤特定会话的消息
 * @param {number} [params.limit] - 返回数量限制（默认50）
 * @param {string} [params.search] - 搜索关键词
 * @param {string} [params.ordering] - 排序字段（如：'-created_at' 表示按创建时间降序）
 * @param {number} [params.page] - 页码（从1开始）
 * 
 * @returns {Promise<Object>} 返回消息列表
 * @returns {number} return.count - 消息总数
 * @returns {string|null} return.next - 下一页URL
 * @returns {string|null} return.previous - 上一页URL
 * @returns {Array<Object>} return.results - 消息列表
 * @returns {number} return.results[].id - 消息ID
 * @returns {string} return.results[].content - 消息内容
 * @returns {string} return.results[].role - 角色（user/assistant/system）
 * @returns {string} return.results[].session_id - 会话ID
 * @returns {string} return.results[].created_at - 创建时间
 * 
 * @throws {Error} 获取失败时抛出错误
 * 
 * @example
 * // 获取默认会话的最近50条消息
 * const response = await getMessages({
 *   session_id: 'default',
 *   limit: 50,
 *   ordering: '-created_at'
 * });
 * console.log('消息列表:', response.results);
 * 
 * @example
 * // 搜索包含关键词的消息
 * const response = await getMessages({
 *   search: 'JavaScript',
 *   page: 1
 * });
 * 
 * @example
 * // 分页获取所有消息
 * const response = await getMessages({
 *   page: 2,
 *   limit: 20
 * });
 */
export function getMessages(params = {}) {
  return request({
    url: '/llm/messages/',
    method: 'get',
    params
  });
}

/**
 * 获取消息历史的别名函数
 * @see getMessages
 */
export const getMessageHistory = getMessages;

/**
 * 获取指定会话的所有消息
 * 
 * @param {string} sessionId - 会话ID
 * @param {Object} [options] - 其他选项
 * @param {number} [options.limit] - 消息数量限制
 * @param {string} [options.ordering] - 排序方式
 * 
 * @returns {Promise<Object>} 返回消息列表
 * 
 * @example
 * const messages = await getSessionMessages('my-session', {
 *   limit: 100,
 *   ordering: '-created_at'
 * });
 */
export function getSessionMessages(sessionId, options = {}) {
  return getMessages({
    session_id: sessionId,
    ...options
  });
}

// ==================== 会话管理 API ====================

/**
 * 获取会话列表
 * 
 * 返回用户的所有会话，包含消息数量、最后消息时间等信息
 * 
 * @param {Object} [params] - 查询参数
 * @param {string} [params.search] - 搜索关键词
 * @param {string} [params.ordering] - 排序字段（如：'-updated_at' 表示按更新时间降序）
 * @param {number} [params.page] - 页码
 * 
 * @returns {Promise<Object>} 返回会话列表
 * @returns {number} return.count - 会话总数
 * @returns {string|null} return.next - 下一页URL
 * @returns {string|null} return.previous - 上一页URL
 * @returns {Array<Object>} return.results - 会话列表
 * @returns {string} return.results[].session_id - 会话ID
 * @returns {string} return.results[].title - 会话标题
 * @returns {number} return.results[].message_count - 消息数量
 * @returns {string} return.results[].last_message - 最后一条消息
 * @returns {string} return.results[].last_message_time - 最后消息时间
 * @returns {string} return.results[].created_at - 创建时间
 * @returns {string} return.results[].updated_at - 更新时间
 * 
 * @throws {Error} 获取失败时抛出错误
 * 
 * @example
 * // 获取所有会话，按更新时间倒序
 * const response = await getSessions({
 *   ordering: '-updated_at'
 * });
 * console.log(`共有 ${response.count} 个会话`);
 * response.results.forEach(session => {
 *   console.log(`会话: ${session.session_id}, 消息数: ${session.message_count}`);
 * });
 * 
 * @example
 * // 搜索会话
 * const response = await getSessions({
 *   search: 'AI对话'
 * });
 */
export function getSessions(params = {}) {
  return request({
    url: '/llm/sessions/',
    method: 'get',
    params
  });
}

/**
 * 获取会话列表的别名函数
 * @see getSessions
 */
export const getSessionList = getSessions;

/**
 * 删除指定会话的所有消息
 * 
 * 注意：此操作不可恢复
 * 
 * @param {string} sessionId - 会话ID
 * 
 * @returns {Promise<Object>} 返回删除结果
 * @returns {string} return.status - 状态：success
 * @returns {string} return.message - 消息：删除成功
 * 
 * @throws {Error} 删除失败时抛出错误
 * 
 * @example
 * await deleteSession('my-session');
 * console.log('会话已删除');
 * 
 * @example
 * // 带确认的删除
 * if (confirm('确定要删除这个会话吗？')) {
 *   await deleteSession(sessionId);
 *   alert('删除成功');
 * }
 */
export function deleteSession(sessionId) {
  return request({
    url: `/llm/sessions/${sessionId}/`,
    method: 'delete'
  });
}

/**
 * 清空指定会话（与deleteSession相同，提供别名）
 * 
 * @param {string} sessionId - 会话ID
 * @returns {Promise<Object>} 返回清空结果
 * 
 * @example
 * await clearSession('my-session');
 */
export function clearSession(sessionId) {
  return request({
    url: `/llm/sessions/${sessionId}/clear/`,
    method: 'post'
  });
}

/**
 * 批量删除会话
 * 
 * @param {Array<string>} sessionIds - 会话ID数组
 * 
 * @returns {Promise<Array>} 返回删除结果数组
 * 
 * @example
 * const results = await batchDeleteSessions(['session1', 'session2']);
 * console.log(`成功删除 ${results.length} 个会话`);
 */
export async function batchDeleteSessions(sessionIds) {
  const promises = sessionIds.map(id => deleteSession(id));
  return Promise.all(promises);
}

// ==================== 统计信息 API ====================

/**
 * 获取聊天统计信息
 * 
 * 返回用户的聊天统计数据，如总消息数、会话数等
 * 
 * @param {Object} [params] - 查询参数
 * @param {string} [params.search] - 搜索关键词
 * @param {string} [params.ordering] - 排序字段
 * @param {number} [params.page] - 页码
 * 
 * @returns {Promise<Object>} 返回统计信息
 * @returns {number} return.total_messages - 总消息数
 * @returns {number} return.total_sessions - 总会话数
 * @returns {number} return.total_tokens - 总token使用量
 * @returns {Object} return.today - 今日统计
 * @returns {Object} return.this_week - 本周统计
 * @returns {Object} return.this_month - 本月统计
 * 
 * @throws {Error} 获取失败时抛出错误
 * 
 * @example
 * const stats = await getStatistics();
 * console.log('总消息数:', stats.total_messages);
 * console.log('总会话数:', stats.total_sessions);
 * console.log('今日消息:', stats.today.messages);
 */
export function getStatistics(params = {}) {
  return request({
    url: '/llm/statistics/',
    method: 'get',
    params
  });
}

/**
 * 获取统计信息的别名函数
 * @see getStatistics
 */
export const getChatStatistics = getStatistics;

// ==================== 高级功能 ====================

/**
 * 流式聊天（如果后端支持）
 * 
 * @param {Object} data - 消息数据
 * @param {Function} onMessage - 收到消息片段时的回调
 * @param {Function} [onComplete] - 完成时的回调
 * @param {Function} [onError] - 出错时的回调
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * await streamChat(
 *   { message: '讲个故事', session_id: 'default' },
 *   (chunk) => {
 *     console.log('收到:', chunk);
 *     // 更新UI显示
 *   },
 *   () => {
 *     console.log('完成');
 *   },
 *   (error) => {
 *     console.error('出错:', error);
 *   }
 * );
 */
export async function streamChat(data, onMessage, onComplete, onError) {
  try {
    // 这里需要根据后端实际实现调整
    // 如果后端支持 SSE (Server-Sent Events)
    const response = await fetch(`${request.defaults.baseURL}/llm/chat/stream/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data)
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (onComplete) onComplete();
        break;
      }

      const chunk = decoder.decode(value);
      if (onMessage) onMessage(chunk);
    }
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
}

/**
 * 重新生成回复
 * 
 * @param {number} messageId - 消息ID
 * @param {string} sessionId - 会话ID
 * 
 * @returns {Promise<Object>} 返回新的回复
 * 
 * @example
 * const newReply = await regenerateMessage(123, 'default');
 */
export async function regenerateMessage(messageId, sessionId) {
  return request({
    url: '/llm/regenerate/',
    method: 'post',
    data: { message_id: messageId, session_id: sessionId }
  });
}

/**
 * 停止生成（如果后端支持）
 * 
 * @param {string} sessionId - 会话ID
 * 
 * @returns {Promise<Object>} 返回停止结果
 * 
 * @example
 * await stopGeneration('default');
 */
export function stopGeneration(sessionId) {
  return request({
    url: '/llm/stop/',
    method: 'post',
    data: { session_id: sessionId }
  });
}

// ==================== 工具函数 ====================

/**
 * 格式化消息历史为对话格式
 * 
 * @param {Array<Object>} messages - 消息列表
 * @returns {Array<Object>} 格式化后的对话列表
 * 
 * @example
 * const messages = await getMessages({ session_id: 'default' });
 * const conversations = formatMessagesAsConversations(messages.results);
 * // [
 * //   { role: 'user', content: '你好' },
 * //   { role: 'assistant', content: '你好！有什么可以帮你的吗？' }
 * // ]
 */
export function formatMessagesAsConversations(messages) {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.created_at
  }));
}

/**
 * 计算会话的消息数量
 * 
 * @param {string} sessionId - 会话ID
 * @returns {Promise<number>} 消息数量
 * 
 * @example
 * const count = await getSessionMessageCount('default');
 * console.log(`会话有 ${count} 条消息`);
 */
export async function getSessionMessageCount(sessionId) {
  const response = await getMessages({ session_id: sessionId, limit: 1 });
  return response.count;
}

/**
 * 检查会话是否存在
 * 
 * @param {string} sessionId - 会话ID
 * @returns {Promise<boolean>} 是否存在
 * 
 * @example
 * if (await sessionExists('my-session')) {
 *   console.log('会话存在');
 * }
 */
export async function sessionExists(sessionId) {
  try {
    const response = await getSessions({ search: sessionId });
    return response.results.some(s => s.session_id === sessionId);
  } catch (error) {
    return false;
  }
}

/**
 * 导出会话为文本
 * 
 * @param {string} sessionId - 会话ID
 * @returns {Promise<string>} 会话文本
 * 
 * @example
 * const text = await exportSessionAsText('default');
 * console.log(text);
 * // 或下载文件
 * const blob = new Blob([text], { type: 'text/plain' });
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = 'conversation.txt';
 * a.click();
 */
export async function exportSessionAsText(sessionId) {
  const response = await getSessionMessages(sessionId, { limit: 1000 });
  const messages = response.results;
  
  let text = `会话: ${sessionId}\n`;
  text += `导出时间: ${new Date().toLocaleString()}\n`;
  text += `消息数量: ${messages.length}\n`;
  text += '='.repeat(50) + '\n\n';
  
  messages.forEach((msg, index) => {
    const role = msg.role === 'user' ? '用户' : 'AI';
    text += `[${index + 1}] ${role} (${new Date(msg.created_at).toLocaleString()}):\n`;
    text += `${msg.content}\n\n`;
  });
  
  return text;
}

/**
 * 创建新会话（通过发送第一条消息）
 * 
 * @param {string} sessionId - 新会话ID
 * @param {string} message - 第一条消息
 * 
 * @returns {Promise<Object>} 返回AI回复
 * 
 * @example
 * const response = await createSession('new-session', '开始新对话');
 */
export async function createSession(sessionId, message) {
  return chat({
    session_id: sessionId,
    message: message
  });
}

// ==================== 流程函数 ====================

/**
 * 完整的聊天流程
 * 发送消息 → 获取回复 → 更新消息历史
 * 
 * @param {string} message - 消息内容
 * @param {string} [sessionId='default'] - 会话ID
 * @param {Object} [options] - 额外选项
 * 
 * @returns {Promise<Object>} 返回完整结果
 * @returns {Object} return.reply - AI回复
 * @returns {Array} return.history - 更新后的消息历史
 * 
 * @example
 * const { reply, history } = await chatFlow('你好', 'my-session');
 * console.log('AI回复:', reply.data.reply);
 * console.log('历史记录:', history.results);
 */
export async function chatFlow(message, sessionId = 'default', options = {}) {
  try {
    // 1. 发送消息
    const reply = await chat({
      message,
      session_id: sessionId,
      ...options
    });
    
    // 2. 获取更新后的消息历史
    const history = await getSessionMessages(sessionId, {
      limit: 50,
      ordering: '-created_at'
    });
    
    return { reply, history };
  } catch (error) {
    console.error('聊天流程失败:', error);
    throw error;
  }
}

/**
 * 删除会话流程
 * 确认 → 删除 → 刷新会话列表
 * 
 * @param {string} sessionId - 会话ID
 * @param {boolean} [skipConfirm=false] - 是否跳过确认
 * 
 * @returns {Promise<Object>} 返回删除结果和更新后的会话列表
 * 
 * @example
 * const { deleted, sessions } = await deleteSessionFlow('old-session');
 */
export async function deleteSessionFlow(sessionId, skipConfirm = false) {
  try {
    // 1. 确认删除（如果需要）
    if (!skipConfirm) {
      const count = await getSessionMessageCount(sessionId);
      const confirmed = confirm(`确定要删除会话 "${sessionId}" 吗？\n该会话有 ${count} 条消息。`);
      if (!confirmed) {
        return { deleted: false, sessions: null };
      }
    }
    
    // 2. 删除会话
    await deleteSession(sessionId);
    
    // 3. 获取更新后的会话列表
    const sessions = await getSessions({
      ordering: '-updated_at'
    });
    
    return { deleted: true, sessions };
  } catch (error) {
    console.error('删除会话流程失败:', error);
    throw error;
  }
}

// 默认导出所有聊天API
export default {
  // 聊天
  chat,
  sendMessage,
  
  // 消息历史
  getMessages,
  getMessageHistory,
  getSessionMessages,
  
  // 会话管理
  getSessions,
  getSessionList,
  deleteSession,
  clearSession,
  batchDeleteSessions,
  
  // 统计
  getStatistics,
  getChatStatistics,
  
  // 高级功能
  streamChat,
  regenerateMessage,
  stopGeneration,
  
  // 工具函数
  formatMessagesAsConversations,
  getSessionMessageCount,
  sessionExists,
  exportSessionAsText,
  createSession,
  
  // 流程函数
  chatFlow,
  deleteSessionFlow
};
