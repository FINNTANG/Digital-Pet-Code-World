/**
 * API 使用示例
 * 本文件展示了各个 API 模块的实际使用方法
 */

import { 
  authAPI, 
  userAPI, 
  llmAPI, 
  llmConfigAPI,
  tokenManager,
  buildPageParams,
  downloadFile,
  uploadFile
} from './request';

// ==================== 认证示例 ====================

/**
 * 示例 1: 用户登录
 */
export async function exampleLogin() {
  try {
    const response = await authAPI.login({
      username: 'testuser',
      password: 'SecurePass123!'
    });
    
    console.log('登录成功:', response);
    
    // 保存 tokens
    if (response.data?.tokens) {
      const { access, refresh } = response.data.tokens;
      tokenManager.setTokens(access, refresh);
    }
    
    return response;
  } catch (error) {
    console.error('登录失败:', error.message);
    throw error;
  }
}

/**
 * 示例 2: 用户注册
 */
export async function exampleRegister() {
  try {
    const response = await authAPI.register({
      username: 'newuser123',
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      password_confirm: 'SecurePass123!',
      phone: '13800138000'
    });
    
    console.log('注册成功:', response);
    
    // 自动保存 tokens（注册后会返回 tokens）
    if (response.data?.tokens) {
      const { access, refresh } = response.data.tokens;
      tokenManager.setTokens(access, refresh);
    }
    
    return response;
  } catch (error) {
    console.error('注册失败:', error.message);
    throw error;
  }
}

/**
 * 示例 3: 用户登出
 */
export async function exampleLogout() {
  try {
    await authAPI.logout();
    tokenManager.clearTokens();
    console.log('登出成功');
  } catch (error) {
    console.error('登出失败:', error.message);
    // 即使失败也清除本地 tokens
    tokenManager.clearTokens();
  }
}

// ==================== 用户管理示例 ====================

/**
 * 示例 4: 获取当前用户信息
 */
export async function exampleGetUserInfo() {
  try {
    const user = await userAPI.getMe();
    console.log('用户信息:', user);
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error.message);
    throw error;
  }
}

/**
 * 示例 5: 更新用户信息
 */
export async function exampleUpdateUserInfo() {
  try {
    // 使用 PATCH 进行部分更新（推荐）
    const response = await userAPI.patchMe({
      first_name: '张',
      last_name: '三',
      profile: {
        bio: '这是我的个人简介',
        gender: 'M'
      }
    });
    
    console.log('更新成功:', response);
    return response;
  } catch (error) {
    console.error('更新失败:', error.message);
    throw error;
  }
}

/**
 * 示例 6: 修改密码
 */
export async function exampleChangePassword(oldPassword, newPassword) {
  try {
    await userAPI.changePassword({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPassword
    });
    
    console.log('密码修改成功');
  } catch (error) {
    console.error('密码修改失败:', error.message);
    throw error;
  }
}

/**
 * 示例 7: 上传头像
 */
export async function exampleUploadAvatar(file) {
  try {
    const response = await userAPI.uploadAvatar(file);
    console.log('头像上传成功:', response);
    return response;
  } catch (error) {
    console.error('头像上传失败:', error.message);
    throw error;
  }
}

/**
 * 示例 8: 获取用户列表（管理员）
 */
export async function exampleGetUserList() {
  try {
    const params = buildPageParams(1, 20, {
      search: 'test',
      ordering: '-date_joined'
    });
    
    const response = await userAPI.getList(params);
    console.log('用户列表:', response);
    return response;
  } catch (error) {
    console.error('获取用户列表失败:', error.message);
    throw error;
  }
}

// ==================== LLM 服务示例 ====================

/**
 * 示例 9: 发送聊天消息
 */
export async function exampleSendChatMessage(message, sessionId = 'default') {
  try {
    const response = await llmAPI.chat({
      message: message,
      session_id: sessionId
    });
    
    console.log('AI 回复:', response.data?.reply);
    return response;
  } catch (error) {
    console.error('发送消息失败:', error.message);
    throw error;
  }
}

/**
 * 示例 10: 获取聊天历史
 */
export async function exampleGetChatHistory(sessionId = 'default') {
  try {
    const response = await llmAPI.getMessages({
      session_id: sessionId,
      limit: 50,
      ordering: '-created_at'
    });
    
    console.log('聊天历史:', response);
    return response;
  } catch (error) {
    console.error('获取聊天历史失败:', error.message);
    throw error;
  }
}

/**
 * 示例 11: 获取会话列表
 */
export async function exampleGetSessions() {
  try {
    const response = await llmAPI.getSessions({
      ordering: '-updated_at'
    });
    
    console.log('会话列表:', response);
    return response;
  } catch (error) {
    console.error('获取会话列表失败:', error.message);
    throw error;
  }
}

/**
 * 示例 12: 删除会话
 */
export async function exampleDeleteSession(sessionId) {
  try {
    await llmAPI.deleteSession(sessionId);
    console.log(`会话 ${sessionId} 已删除`);
  } catch (error) {
    console.error('删除会话失败:', error.message);
    throw error;
  }
}

/**
 * 示例 13: 获取聊天统计
 */
export async function exampleGetChatStatistics() {
  try {
    const response = await llmAPI.getStatistics();
    console.log('聊天统计:', response);
    return response;
  } catch (error) {
    console.error('获取统计失败:', error.message);
    throw error;
  }
}

// ==================== LLM 配置管理示例（管理员）====================

/**
 * 示例 14: 获取 LLM 配置列表
 */
export async function exampleGetLLMConfigs() {
  try {
    const response = await llmConfigAPI.getList({
      ordering: '-created_at'
    });
    
    console.log('LLM 配置列表:', response);
    return response;
  } catch (error) {
    console.error('获取配置列表失败:', error.message);
    throw error;
  }
}

/**
 * 示例 15: 创建 LLM 配置
 */
export async function exampleCreateLLMConfig() {
  try {
    const response = await llmConfigAPI.create({
      name: 'OpenAI GPT-4 配置',
      provider: 'openai',
      model_name: 'gpt-4',
      api_key: 'sk-your-api-key-here',
      api_base: 'https://api.openai.com/v1',
      is_active: true,
      max_tokens: 2000,
      temperature: 0.7
    });
    
    console.log('配置创建成功:', response);
    return response;
  } catch (error) {
    console.error('创建配置失败:', error.message);
    throw error;
  }
}

/**
 * 示例 16: 更新 LLM 配置
 */
export async function exampleUpdateLLMConfig(configId) {
  try {
    // 使用 PATCH 进行部分更新
    const response = await llmConfigAPI.partialUpdate(configId, {
      temperature: 0.8,
      max_tokens: 3000
    });
    
    console.log('配置更新成功:', response);
    return response;
  } catch (error) {
    console.error('更新配置失败:', error.message);
    throw error;
  }
}

/**
 * 示例 17: 激活/禁用配置
 */
export async function exampleToggleLLMConfig(configId, activate = true) {
  try {
    if (activate) {
      await llmConfigAPI.activate(configId);
      console.log(`配置 ${configId} 已激活`);
    } else {
      await llmConfigAPI.deactivate(configId);
      console.log(`配置 ${configId} 已禁用`);
    }
  } catch (error) {
    console.error('切换配置状态失败:', error.message);
    throw error;
  }
}

// ==================== 工具函数示例 ====================

/**
 * 示例 18: 文件下载
 */
export async function exampleDownloadFile() {
  try {
    await downloadFile('/api/files/report.pdf', 'report.pdf');
    console.log('文件下载成功');
  } catch (error) {
    console.error('文件下载失败:', error.message);
    throw error;
  }
}

/**
 * 示例 19: 文件上传（带进度）
 */
export async function exampleUploadFileWithProgress(file) {
  try {
    const response = await uploadFile(
      '/api/upload/',
      file,
      { 
        type: 'document',
        category: 'general'
      },
      (progress) => {
        console.log(`上传进度: ${progress}%`);
        // 这里可以更新 UI 进度条
      }
    );
    
    console.log('文件上传成功:', response);
    return response;
  } catch (error) {
    console.error('文件上传失败:', error.message);
    throw error;
  }
}

// ==================== 完整流程示例 ====================

/**
 * 示例 20: 完整的登录到聊天流程
 */
export async function exampleCompleteFlow() {
  try {
    // 1. 用户登录
    console.log('步骤 1: 登录...');
    const loginResponse = await authAPI.login({
      username: 'testuser',
      password: 'SecurePass123!'
    });
    
    // 保存 tokens
    const { access, refresh } = loginResponse.data.tokens;
    tokenManager.setTokens(access, refresh);
    console.log('✓ 登录成功');
    
    // 2. 获取用户信息
    console.log('\n步骤 2: 获取用户信息...');
    const userInfo = await userAPI.getMe();
    console.log('✓ 用户信息:', userInfo.username);
    
    // 3. 发送聊天消息
    console.log('\n步骤 3: 发送聊天消息...');
    const chatResponse = await llmAPI.chat({
      message: '你好，请介绍一下你自己',
      session_id: 'demo-session'
    });
    console.log('✓ AI 回复:', chatResponse.data.reply);
    
    // 4. 获取会话列表
    console.log('\n步骤 4: 获取会话列表...');
    const sessions = await llmAPI.getSessions();
    console.log(`✓ 共有 ${sessions.count} 个会话`);
    
    // 5. 获取聊天统计
    console.log('\n步骤 5: 获取聊天统计...');
    const stats = await llmAPI.getStatistics();
    console.log('✓ 统计信息:', stats);
    
    console.log('\n=== 完整流程执行成功 ===');
    
  } catch (error) {
    console.error('流程执行失败:', error.message);
    throw error;
  }
}

/**
 * 示例 21: 处理文件上传（头像）
 */
export async function exampleHandleAvatarUpload(inputElement) {
  const file = inputElement.files[0];
  
  if (!file) {
    console.error('请选择文件');
    return;
  }
  
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    console.error('不支持的文件类型');
    return;
  }
  
  // 验证文件大小（最大 5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    console.error('文件大小不能超过 5MB');
    return;
  }
  
  try {
    const response = await userAPI.uploadAvatar(file);
    console.log('头像上传成功:', response);
    
    // 更新 UI 显示新头像
    const newAvatarUrl = response.data?.profile?.avatar_url;
    if (newAvatarUrl) {
      document.querySelector('#avatar-img').src = newAvatarUrl;
    }
  } catch (error) {
    console.error('头像上传失败:', error.message);
  }
}

/**
 * 示例 22: 分页加载数据
 */
export async function examplePaginatedData() {
  const pageSize = 20;
  let currentPage = 1;
  let allData = [];
  
  try {
    while (true) {
      const params = buildPageParams(currentPage, pageSize, {
        ordering: '-created_at'
      });
      
      const response = await llmAPI.getMessages(params);
      
      console.log(`加载第 ${currentPage} 页，共 ${response.count} 条记录`);
      
      allData = [...allData, ...response.results];
      
      // 检查是否还有下一页
      if (!response.next) {
        break;
      }
      
      currentPage++;
    }
    
    console.log(`总共加载了 ${allData.length} 条数据`);
    return allData;
    
  } catch (error) {
    console.error('加载数据失败:', error.message);
    throw error;
  }
}

/**
 * 示例 23: 错误处理最佳实践
 */
export async function exampleErrorHandling() {
  try {
    const response = await userAPI.getMe();
    return response;
  } catch (error) {
    // 根据错误类型进行不同处理
    if (error.status === 401) {
      console.error('未授权，请重新登录');
      // 跳转到登录页
      window.location.href = '/login';
    } else if (error.status === 403) {
      console.error('没有权限访问此资源');
    } else if (error.status === 404) {
      console.error('请求的资源不存在');
    } else if (error.status >= 500) {
      console.error('服务器错误，请稍后重试');
    } else {
      console.error('请求失败:', error.message);
    }
    
    throw error;
  }
}

// ==================== React Hook 示例 ====================

/**
 * 示例 24: 自定义 Hook - useUserInfo
 * 使用方法: const { user, loading, error, refresh } = useUserInfo();
 */
export function useUserInfo() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  const loadUser = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await userAPI.getMe();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  React.useEffect(() => {
    loadUser();
  }, []);
  
  return { user, loading, error, refresh: loadUser };
}

/**
 * 示例 25: 自定义 Hook - useChat
 * 使用方法: const { messages, sendMessage, loading } = useChat('session-id');
 */
export function useChat(sessionId = 'default') {
  const [messages, setMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  
  const loadMessages = async () => {
    try {
      const response = await llmAPI.getMessages({
        session_id: sessionId,
        limit: 100
      });
      setMessages(response.results || []);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };
  
  const sendMessage = async (content) => {
    setLoading(true);
    try {
      const response = await llmAPI.chat({
        message: content,
        session_id: sessionId
      });
      
      // 添加消息到列表
      await loadMessages();
      return response;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  React.useEffect(() => {
    loadMessages();
  }, [sessionId]);
  
  return { messages, sendMessage, loading, refresh: loadMessages };
}

// 导出所有示例函数
export default {
  // 认证
  exampleLogin,
  exampleRegister,
  exampleLogout,
  
  // 用户管理
  exampleGetUserInfo,
  exampleUpdateUserInfo,
  exampleChangePassword,
  exampleUploadAvatar,
  exampleGetUserList,
  
  // LLM 服务
  exampleSendChatMessage,
  exampleGetChatHistory,
  exampleGetSessions,
  exampleDeleteSession,
  exampleGetChatStatistics,
  
  // LLM 配置
  exampleGetLLMConfigs,
  exampleCreateLLMConfig,
  exampleUpdateLLMConfig,
  exampleToggleLLMConfig,
  
  // 工具函数
  exampleDownloadFile,
  exampleUploadFileWithProgress,
  
  // 完整流程
  exampleCompleteFlow,
  exampleHandleAvatarUpload,
  examplePaginatedData,
  exampleErrorHandling,
  
  // React Hooks
  useUserInfo,
  useChat
};
