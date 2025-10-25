/**
 * chat.js 模块使用示例
 * 
 * 展示如何在实际项目中使用 LLM 聊天 API
 */

import {
  chat,
  sendMessage,
  getMessages,
  getSessionMessages,
  getSessions,
  deleteSession,
  clearSession,
  getStatistics,
  chatFlow,
  deleteSessionFlow,
  exportSessionAsText,
  formatMessagesAsConversations,
  getSessionMessageCount,
  sessionExists,
  streamChat
} from './chat';

// ==================== 基础聊天示例 ====================

/**
 * 示例 1: 基础聊天
 */
export async function example1_basicChat() {
  try {
    const response = await chat({
      message: '你好，请介绍一下你自己',
      session_id: 'default'
    });
    
    console.log('AI 回复:', response.data.reply);
    console.log('消息 ID:', response.data.message_id);
    console.log('会话 ID:', response.data.session_id);
    
    return response;
  } catch (error) {
    console.error('聊天失败:', error.message);
  }
}

/**
 * 示例 2: 使用别名函数发送消息
 */
export async function example2_sendMessage() {
  try {
    const response = await sendMessage({
      message: '给我讲个笑话',
      session_id: 'jokes-session'
    });
    
    console.log('笑话:', response.data.reply);
  } catch (error) {
    console.error('发送失败:', error.message);
  }
}

/**
 * 示例 3: 连续对话
 */
export async function example3_conversation() {
  const sessionId = 'conversation-' + Date.now();
  
  try {
    // 第一轮对话
    const response1 = await chat({
      message: '我想学习 JavaScript',
      session_id: sessionId
    });
    console.log('AI:', response1.data.reply);
    
    // 第二轮对话（有上下文）
    const response2 = await chat({
      message: '从哪里开始比较好？',
      session_id: sessionId
    });
    console.log('AI:', response2.data.reply);
    
    // 第三轮对话
    const response3 = await chat({
      message: '推荐一些学习资源',
      session_id: sessionId
    });
    console.log('AI:', response3.data.reply);
    
  } catch (error) {
    console.error('对话失败:', error.message);
  }
}

// ==================== 消息历史示例 ====================

/**
 * 示例 4: 获取消息历史
 */
export async function example4_getMessages() {
  try {
    const response = await getMessages({
      session_id: 'default',
      limit: 50,
      ordering: '-created_at'
    });
    
    console.log(`共有 ${response.count} 条消息`);
    console.log('最近的消息:', response.results.slice(0, 5));
    
    return response;
  } catch (error) {
    console.error('获取消息失败:', error.message);
  }
}

/**
 * 示例 5: 搜索消息
 */
export async function example5_searchMessages() {
  try {
    const response = await getMessages({
      search: 'JavaScript',
      limit: 20
    });
    
    console.log(`找到 ${response.count} 条包含 "JavaScript" 的消息`);
    response.results.forEach(msg => {
      console.log(`[${msg.role}] ${msg.content}`);
    });
    
  } catch (error) {
    console.error('搜索失败:', error.message);
  }
}

/**
 * 示例 6: 分页加载消息
 */
export async function example6_paginatedMessages() {
  const sessionId = 'default';
  const pageSize = 20;
  let allMessages = [];
  let page = 1;
  
  try {
    while (true) {
      const response = await getMessages({
        session_id: sessionId,
        page: page,
        limit: pageSize,
        ordering: '-created_at'
      });
      
      console.log(`加载第 ${page} 页，获取 ${response.results.length} 条消息`);
      allMessages = [...allMessages, ...response.results];
      
      // 检查是否还有下一页
      if (!response.next) {
        break;
      }
      
      page++;
    }
    
    console.log(`总共加载了 ${allMessages.length} 条消息`);
    return allMessages;
    
  } catch (error) {
    console.error('加载失败:', error.message);
  }
}

/**
 * 示例 7: 获取指定会话的所有消息
 */
export async function example7_getSessionMessages() {
  try {
    const messages = await getSessionMessages('my-session', {
      limit: 100,
      ordering: '-created_at'
    });
    
    console.log('会话消息:', messages.results);
    
    // 格式化为对话格式
    const conversations = formatMessagesAsConversations(messages.results);
    console.log('对话格式:', conversations);
    
  } catch (error) {
    console.error('获取失败:', error.message);
  }
}

// ==================== 会话管理示例 ====================

/**
 * 示例 8: 获取会话列表
 */
export async function example8_getSessions() {
  try {
    const response = await getSessions({
      ordering: '-updated_at'
    });
    
    console.log(`共有 ${response.count} 个会话`);
    
    response.results.forEach(session => {
      console.log(`会话: ${session.session_id}`);
      console.log(`消息数: ${session.message_count}`);
      console.log(`最后消息: ${session.last_message}`);
      console.log(`更新时间: ${session.updated_at}`);
      console.log('---');
    });
    
    return response;
  } catch (error) {
    console.error('获取会话列表失败:', error.message);
  }
}

/**
 * 示例 9: 删除会话
 */
export async function example9_deleteSession() {
  const sessionId = 'old-session';
  
  try {
    // 确认删除
    const count = await getSessionMessageCount(sessionId);
    const confirmed = confirm(`确定要删除会话 "${sessionId}" 吗？\n该会话有 ${count} 条消息。`);
    
    if (confirmed) {
      await deleteSession(sessionId);
      console.log('会话已删除');
    }
    
  } catch (error) {
    console.error('删除失败:', error.message);
  }
}

/**
 * 示例 10: 清空会话
 */
export async function example10_clearSession() {
  try {
    await clearSession('temp-session');
    console.log('会话已清空');
  } catch (error) {
    console.error('清空失败:', error.message);
  }
}

// ==================== 统计信息示例 ====================

/**
 * 示例 11: 获取统计信息
 */
export async function example11_getStatistics() {
  try {
    const stats = await getStatistics();
    
    console.log('=== 聊天统计 ===');
    console.log('总消息数:', stats.total_messages);
    console.log('总会话数:', stats.total_sessions);
    console.log('总 Token 数:', stats.total_tokens);
    
    if (stats.today) {
      console.log('\n今日统计:');
      console.log('- 消息数:', stats.today.messages);
      console.log('- 会话数:', stats.today.sessions);
    }
    
    if (stats.this_week) {
      console.log('\n本周统计:');
      console.log('- 消息数:', stats.this_week.messages);
      console.log('- 会话数:', stats.this_week.sessions);
    }
    
    return stats;
  } catch (error) {
    console.error('获取统计失败:', error.message);
  }
}

// ==================== 流程函数示例 ====================

/**
 * 示例 12: 使用 chatFlow（推荐）
 */
export async function example12_chatFlow() {
  try {
    const { reply, history } = await chatFlow(
      '你好，我想了解 React Hooks',
      'react-session'
    );
    
    console.log('AI 回复:', reply.data.reply);
    console.log('历史记录数量:', history.count);
    console.log('最近 5 条消息:', history.results.slice(0, 5));
    
  } catch (error) {
    console.error('聊天流程失败:', error.message);
  }
}

/**
 * 示例 13: 使用 deleteSessionFlow
 */
export async function example13_deleteSessionFlow() {
  try {
    const { deleted, sessions } = await deleteSessionFlow('old-session');
    
    if (deleted) {
      console.log('会话已删除');
      console.log(`剩余 ${sessions.count} 个会话`);
    } else {
      console.log('用户取消删除');
    }
    
  } catch (error) {
    console.error('删除流程失败:', error.message);
  }
}

// ==================== 工具函数示例 ====================

/**
 * 示例 14: 导出会话为文本
 */
export async function example14_exportSession() {
  try {
    const text = await exportSessionAsText('default');
    console.log('会话文本:');
    console.log(text);
    
    // 下载为文件
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('会话已导出');
  } catch (error) {
    console.error('导出失败:', error.message);
  }
}

/**
 * 示例 15: 检查会话是否存在
 */
export async function example15_checkSession() {
  const sessionId = 'my-session';
  
  try {
    const exists = await sessionExists(sessionId);
    
    if (exists) {
      console.log(`会话 "${sessionId}" 存在`);
      const count = await getSessionMessageCount(sessionId);
      console.log(`该会话有 ${count} 条消息`);
    } else {
      console.log(`会话 "${sessionId}" 不存在`);
    }
    
  } catch (error) {
    console.error('检查失败:', error.message);
  }
}

// ==================== React 组件示例 ====================

/**
 * 示例 16: React 聊天组件
 */
export function ChatComponent() {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sessionId] = React.useState('chat-' + Date.now());

  // 加载历史消息
  React.useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await getSessionMessages(sessionId, {
        limit: 50,
        ordering: '-created_at'
      });
      setMessages(response.results.reverse());
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    setLoading(true);
    
    try {
      // 添加用户消息到UI
      const userMessage = {
        role: 'user',
        content: input,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      // 发送到服务器
      const response = await chat({
        message: input,
        session_id: sessionId
      });
      
      // 添加AI回复到UI
      const aiMessage = {
        role: 'assistant',
        content: response.data.reply,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      alert('发送失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="role">{msg.role === 'user' ? '你' : 'AI'}</div>
            <div className="content">{msg.content}</div>
            <div className="time">{new Date(msg.created_at).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
}

/**
 * 示例 17: React 会话列表组件
 */
export function SessionListComponent() {
  const [sessions, setSessions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await getSessions({
        ordering: '-updated_at'
      });
      setSessions(response.results);
    } catch (error) {
      console.error('加载会话失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId) => {
    try {
      const { deleted } = await deleteSessionFlow(sessionId, false);
      if (deleted) {
        await loadSessions(); // 重新加载列表
      }
    } catch (error) {
      alert('删除失败: ' + error.message);
    }
  };

  const handleExport = async (sessionId) => {
    try {
      const text = await exportSessionAsText(sessionId);
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('导出失败: ' + error.message);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="session-list">
      <h2>会话列表 ({sessions.length})</h2>
      {sessions.map(session => (
        <div key={session.session_id} className="session-item">
          <div className="session-info">
            <h3>{session.session_id}</h3>
            <p>消息数: {session.message_count}</p>
            <p>最后更新: {new Date(session.updated_at).toLocaleString()}</p>
            {session.last_message && (
              <p className="last-message">最后消息: {session.last_message}</p>
            )}
          </div>
          <div className="session-actions">
            <button onClick={() => handleExport(session.session_id)}>
              导出
            </button>
            <button onClick={() => handleDelete(session.session_id)}>
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 示例 18: React 统计面板组件
 */
export function StatisticsComponent() {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await getStatistics();
      setStats(data);
    } catch (error) {
      console.error('加载统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!stats) return <div>暂无数据</div>;

  return (
    <div className="statistics-panel">
      <h2>聊天统计</h2>
      
      <div className="stat-card">
        <h3>总览</h3>
        <p>总消息数: {stats.total_messages}</p>
        <p>总会话数: {stats.total_sessions}</p>
        <p>总 Token: {stats.total_tokens}</p>
      </div>
      
      {stats.today && (
        <div className="stat-card">
          <h3>今日</h3>
          <p>消息数: {stats.today.messages}</p>
          <p>会话数: {stats.today.sessions}</p>
        </div>
      )}
      
      {stats.this_week && (
        <div className="stat-card">
          <h3>本周</h3>
          <p>消息数: {stats.this_week.messages}</p>
          <p>会话数: {stats.this_week.sessions}</p>
        </div>
      )}
      
      {stats.this_month && (
        <div className="stat-card">
          <h3>本月</h3>
          <p>消息数: {stats.this_month.messages}</p>
          <p>会话数: {stats.this_month.sessions}</p>
        </div>
      )}
    </div>
  );
}

// ==================== 高级示例 ====================

/**
 * 示例 19: 流式聊天（如果后端支持）
 */
export async function example19_streamChat() {
  const displayElement = document.getElementById('chat-display');
  let fullResponse = '';
  
  try {
    await streamChat(
      {
        message: '请给我讲一个长故事',
        session_id: 'stream-session'
      },
      // onMessage
      (chunk) => {
        fullResponse += chunk;
        displayElement.textContent = fullResponse;
      },
      // onComplete
      () => {
        console.log('流式输出完成');
        console.log('完整回复:', fullResponse);
      },
      // onError
      (error) => {
        console.error('流式输出出错:', error);
      }
    );
  } catch (error) {
    console.error('流式聊天失败:', error.message);
  }
}

/**
 * 示例 20: 完整的聊天应用流程
 */
export async function example20_completeApp() {
  const sessionId = 'app-session-' + Date.now();
  
  try {
    // 1. 检查会话是否存在
    console.log('步骤 1: 检查会话');
    const exists = await sessionExists(sessionId);
    console.log('会话存在:', exists);
    
    // 2. 发送第一条消息（创建会话）
    console.log('\n步骤 2: 创建会话');
    const { reply: reply1, history: history1 } = await chatFlow(
      '你好，我想学习 Web 开发',
      sessionId
    );
    console.log('AI:', reply1.data.reply);
    
    // 3. 继续对话
    console.log('\n步骤 3: 继续对话');
    const { reply: reply2 } = await chatFlow(
      '应该学习哪些技术？',
      sessionId
    );
    console.log('AI:', reply2.data.reply);
    
    // 4. 获取会话统计
    console.log('\n步骤 4: 会话统计');
    const messageCount = await getSessionMessageCount(sessionId);
    console.log('消息数量:', messageCount);
    
    // 5. 获取所有消息
    console.log('\n步骤 5: 获取历史');
    const messages = await getSessionMessages(sessionId);
    console.log('历史记录:', messages.results);
    
    // 6. 导出会话
    console.log('\n步骤 6: 导出会话');
    const text = await exportSessionAsText(sessionId);
    console.log('导出文本长度:', text.length);
    
    // 7. 获取全局统计
    console.log('\n步骤 7: 全局统计');
    const stats = await getStatistics();
    console.log('总消息数:', stats.total_messages);
    
    // 8. 获取所有会话
    console.log('\n步骤 8: 会话列表');
    const sessions = await getSessions();
    console.log('会话总数:', sessions.count);
    
    console.log('\n=== 完整流程执行成功 ===');
    
  } catch (error) {
    console.error('流程执行失败:', error.message);
  }
}

// 导出所有示例
export default {
  example1_basicChat,
  example2_sendMessage,
  example3_conversation,
  example4_getMessages,
  example5_searchMessages,
  example6_paginatedMessages,
  example7_getSessionMessages,
  example8_getSessions,
  example9_deleteSession,
  example10_clearSession,
  example11_getStatistics,
  example12_chatFlow,
  example13_deleteSessionFlow,
  example14_exportSession,
  example15_checkSession,
  example19_streamChat,
  example20_completeApp,
  
  // React 组件
  ChatComponent,
  SessionListComponent,
  StatisticsComponent
};
