import axios from 'axios';

// ==================== 配置常量 ====================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// ==================== Token 管理 ====================
export const tokenManager = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (access, refresh) => {
    if (access) localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  hasToken: () => !!localStorage.getItem(TOKEN_KEY)
};

// ==================== Axios 实例创建 ====================
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== 请求拦截器 ====================
request.interceptors.request.use(
  config => {
    // 自动添加 Authorization header
    const token = tokenManager.getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 打印请求日志（开发环境）
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }
    
    return config;
  },
  error => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

// ==================== 响应拦截器 ====================
let isRefreshing = false;
let refreshSubscribers = [];

// 订阅 token 刷新完成事件
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// 通知所有订阅者 token 刷新完成
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

request.interceptors.response.use(
  response => {
    // 打印响应日志（开发环境）
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    
    // 统一响应格式处理
    return response.data;
  },
  async error => {
    const originalRequest = error.config;
    
    // 处理 401 未授权错误 - 尝试刷新 token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新，则等待刷新完成
        return new Promise(resolve => {
          subscribeTokenRefresh(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(request(originalRequest));
          });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = tokenManager.getRefreshToken();
      
      if (refreshToken) {
        try {
          // 调用刷新 token 接口
          const response = await axios.post(
            `${API_BASE_URL}/token/refresh/`,
            { refresh: refreshToken }
          );
          
          const newAccessToken = response.data.access;
          tokenManager.setTokens(newAccessToken, refreshToken);
          
          // 更新请求头
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // 通知所有等待的请求
          onTokenRefreshed(newAccessToken);
          isRefreshing = false;
          
          // 重试原始请求
          return request(originalRequest);
        } catch (refreshError) {
          // 刷新失败，清除 token 并跳转登录
          isRefreshing = false;
          tokenManager.clearTokens();
          
          // 触发全局登出事件
          window.dispatchEvent(new CustomEvent('auth:logout', { 
            detail: { reason: 'token_refresh_failed' }
          }));
          
          return Promise.reject(refreshError);
        }
      } else {
        // 没有 refresh token，直接跳转登录
        tokenManager.clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout', { 
          detail: { reason: 'no_refresh_token' }
        }));
      }
    }
    
    // 统一错误处理
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.detail
      || error.response?.data?.error
      || error.message 
      || '请求失败';
    
    console.error('[API Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data
    });
    
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
      originalError: error
    });
  }
);

// ==================== API 模块 ====================

/**
 * 认证相关 API
 */
export const authAPI = {
  /**
   * 用户登录
   * @param {Object} data - 登录信息
   * @param {string} data.username - 用户名或邮箱
   * @param {string} data.password - 密码
   * @returns {Promise}
   */
  login: (data) => request.post('/auth/login/', data),
  
  /**
   * 用户注册
   * @param {Object} data - 注册信息
   * @param {string} data.username - 用户名
   * @param {string} data.email - 邮箱
   * @param {string} data.password - 密码
   * @param {string} data.password_confirm - 确认密码
   * @param {string} [data.phone] - 手机号（可选）
   * @returns {Promise}
   */
  register: (data) => request.post('/auth/register/', data),
  
  /**
   * 用户登出
   * @returns {Promise}
   */
  logout: () => request.post('/auth/logout/')
};

/**
 * Token 相关 API
 */
export const tokenAPI = {
  /**
   * 刷新 access token
   * @param {string} refreshToken - refresh token
   * @returns {Promise}
   */
  refresh: (refreshToken) => request.post('/token/refresh/', { 
    refresh: refreshToken 
  })
};

/**
 * 用户管理相关 API
 */
export const userAPI = {
  /**
   * 获取用户列表（管理员）
   * @param {Object} params - 查询参数
   * @param {string} [params.search] - 搜索关键词
   * @param {string} [params.ordering] - 排序字段
   * @param {number} [params.page] - 页码
   * @returns {Promise}
   */
  getList: (params) => request.get('/users/', { params }),
  
  /**
   * 创建用户（管理员）
   * @param {Object} data - 用户信息
   * @returns {Promise}
   */
  create: (data) => request.post('/users/', data),
  
  /**
   * 获取用户详情（管理员）
   * @param {number} id - 用户ID
   * @returns {Promise}
   */
  getDetail: (id) => request.get(`/users/${id}/`),
  
  /**
   * 更新用户（管理员）
   * @param {number} id - 用户ID
   * @param {Object} data - 用户信息
   * @returns {Promise}
   */
  update: (id, data) => request.put(`/users/${id}/`, data),
  
  /**
   * 部分更新用户（管理员）
   * @param {number} id - 用户ID
   * @param {Object} data - 用户信息
   * @returns {Promise}
   */
  partialUpdate: (id, data) => request.patch(`/users/${id}/`, data),
  
  /**
   * 删除用户（管理员）
   * @param {number} id - 用户ID
   * @returns {Promise}
   */
  delete: (id) => request.delete(`/users/${id}/`),
  
  /**
   * 获取当前用户信息
   * @returns {Promise}
   */
  getMe: () => request.get('/users/me/'),
  
  /**
   * 更新当前用户信息
   * @param {Object} data - 用户信息
   * @param {string} [data.first_name] - 名字
   * @param {string} [data.last_name] - 姓氏
   * @param {string} [data.phone] - 手机号
   * @param {string} [data.bio] - 个人简介
   * @param {string} [data.gender] - 性别（M/F/O）
   * @param {string} [data.birth_date] - 出生日期
   * @returns {Promise}
   */
  updateMe: (data) => request.put('/users/update_me/', data),
  
  /**
   * 部分更新当前用户信息
   * @param {Object} data - 用户信息
   * @returns {Promise}
   */
  patchMe: (data) => request.patch('/users/update_me/', data),
  
  /**
   * 修改密码
   * @param {Object} data - 密码信息
   * @param {string} data.old_password - 旧密码
   * @param {string} data.new_password - 新密码
   * @param {string} data.new_password_confirm - 确认新密码
   * @returns {Promise}
   */
  changePassword: (data) => request.post('/users/change_password/', data),
  
  /**
   * 上传头像
   * @param {File} file - 头像文件
   * @returns {Promise}
   */
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return request.post('/users/upload_avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  /**
   * 删除头像
   * @returns {Promise}
   */
  deleteAvatar: () => request.delete('/users/delete_avatar/')
};

/**
 * LLM 服务相关 API
 */
export const llmAPI = {
  /**
   * 发送聊天消息
   * @param {Object} data - 消息数据
   * @param {string} data.message - 消息内容
   * @param {string} [data.session_id] - 会话ID
   * @returns {Promise}
   */
  chat: (data) => request.post('/llm/chat/', data),
  
  /**
   * 获取消息历史
   * @param {Object} params - 查询参数
   * @param {string} [params.session_id] - 会话ID
   * @param {number} [params.limit] - 返回数量限制
   * @param {string} [params.search] - 搜索关键词
   * @param {string} [params.ordering] - 排序字段
   * @param {number} [params.page] - 页码
   * @returns {Promise}
   */
  getMessages: (params) => request.get('/llm/messages/', { params }),
  
  /**
   * 获取会话列表
   * @param {Object} params - 查询参数
   * @param {string} [params.search] - 搜索关键词
   * @param {string} [params.ordering] - 排序字段
   * @param {number} [params.page] - 页码
   * @returns {Promise}
   */
  getSessions: (params) => request.get('/llm/sessions/', { params }),
  
  /**
   * 删除指定会话
   * @param {string} sessionId - 会话ID
   * @returns {Promise}
   */
  deleteSession: (sessionId) => request.delete(`/llm/sessions/${sessionId}/`),
  
  /**
   * 清空指定会话
   * @param {string} sessionId - 会话ID
   * @returns {Promise}
   */
  clearSession: (sessionId) => request.post(`/llm/sessions/${sessionId}/clear/`),
  
  /**
   * 获取聊天统计信息
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getStatistics: (params) => request.get('/llm/statistics/', { params })
};

/**
 * LLM 配置管理相关 API（管理员）
 */
export const llmConfigAPI = {
  /**
   * 获取配置列表
   * @param {Object} params - 查询参数
   * @param {string} [params.search] - 搜索关键词
   * @param {string} [params.ordering] - 排序字段
   * @param {number} [params.page] - 页码
   * @returns {Promise}
   */
  getList: (params) => request.get('/llm-configs/', { params }),
  
  /**
   * 创建配置
   * @param {Object} data - 配置信息
   * @param {string} data.name - 配置名称
   * @param {string} data.provider - 提供商（openai/azure/anthropic/local/other）
   * @param {string} data.model_name - 模型名称
   * @param {string} data.api_key - API密钥
   * @param {string} [data.api_base] - API基础URL
   * @param {boolean} [data.is_active] - 是否启用
   * @param {number} [data.max_tokens] - 最大Token数
   * @param {number} [data.temperature] - 温度参数
   * @returns {Promise}
   */
  create: (data) => request.post('/llm-configs/', data),
  
  /**
   * 获取配置详情
   * @param {number} id - 配置ID
   * @returns {Promise}
   */
  getDetail: (id) => request.get(`/llm-configs/${id}/`),
  
  /**
   * 更新配置
   * @param {number} id - 配置ID
   * @param {Object} data - 配置信息
   * @returns {Promise}
   */
  update: (id, data) => request.put(`/llm-configs/${id}/`, data),
  
  /**
   * 部分更新配置
   * @param {number} id - 配置ID
   * @param {Object} data - 配置信息
   * @returns {Promise}
   */
  partialUpdate: (id, data) => request.patch(`/llm-configs/${id}/`, data),
  
  /**
   * 删除配置
   * @param {number} id - 配置ID
   * @returns {Promise}
   */
  delete: (id) => request.delete(`/llm-configs/${id}/`),
  
  /**
   * 激活指定配置
   * @param {number} id - 配置ID
   * @returns {Promise}
   */
  activate: (id) => request.post(`/llm-configs/${id}/activate/`),
  
  /**
   * 禁用指定配置
   * @param {number} id - 配置ID
   * @returns {Promise}
   */
  deactivate: (id) => request.post(`/llm-configs/${id}/deactivate/`)
};

// ==================== 工具函数 ====================

/**
 * 处理分页参数
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {Object} otherParams - 其他参数
 * @returns {Object}
 */
export const buildPageParams = (page = 1, pageSize = 10, otherParams = {}) => {
  return {
    page,
    page_size: pageSize,
    ...otherParams
  };
};

/**
 * 下载文件
 * @param {string} url - 文件URL
 * @param {string} filename - 文件名
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await request.get(url, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * 上传文件通用方法
 * @param {string} url - 上传地址
 * @param {File} file - 文件对象
 * @param {Object} additionalData - 额外数据
 * @param {Function} onProgress - 进度回调
 * @returns {Promise}
 */
export const uploadFile = (url, file, additionalData = {}, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });
  
  return request.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    }
  });
};

// 默认导出 request 实例
export default request;
