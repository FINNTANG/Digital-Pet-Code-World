/**
 * 认证模块 API
 * 包含用户登录、注册、登出等认证相关接口
 * 
 * @module api/auth
 */

import request from '@/utils/request';

/**
 * 用户登录
 * 
 * 支持使用用户名或邮箱登录
 * 
 * @param {Object} data - 登录信息
 * @param {string} data.username - 用户名或邮箱
 * @param {string} data.password - 密码
 * 
 * @returns {Promise<Object>} 返回登录响应
 * @returns {string} return.status - 状态：success
 * @returns {string} return.message - 消息：登录成功
 * @returns {Object} return.data - 响应数据
 * @returns {Object} return.data.user - 用户信息
 * @returns {number} return.data.user.id - 用户ID
 * @returns {string} return.data.user.username - 用户名
 * @returns {string} return.data.user.email - 邮箱
 * @returns {string} return.data.user.full_name - 全名
 * @returns {boolean} return.data.user.is_active - 是否活跃
 * @returns {Object} return.data.tokens - JWT令牌
 * @returns {string} return.data.tokens.access - 访问令牌（有效期1小时）
 * @returns {string} return.data.tokens.refresh - 刷新令牌（有效期7天）
 * 
 * @throws {Error} 登录失败时抛出错误
 * 
 * @example
 * // 使用用户名登录
 * const response = await authAPI.login({
 *   username: 'testuser',
 *   password: 'SecurePass123!'
 * });
 * console.log(response.data.tokens.access);
 * 
 * @example
 * // 使用邮箱登录
 * const response = await authAPI.login({
 *   username: 'user@example.com',
 *   password: 'SecurePass123!'
 * });
 */
export function login(data) {
  return request({
    url: '/auth/login/',
    method: 'post',
    data
  });
}

/**
 * 用户注册
 * 
 * 创建新用户账号并自动登录，返回用户信息和JWT令牌
 * 
 * @param {Object} data - 注册信息
 * @param {string} data.username - 用户名（必填，最多150字符，只能包含字母、数字、@、.、-、_）
 * @param {string} data.email - 邮箱地址（必填，有效的邮箱格式）
 * @param {string} data.password - 密码（必填，建议包含大小写字母、数字和特殊字符）
 * @param {string} data.password_confirm - 确认密码（必填，必须与password相同）
 * @param {string} [data.phone] - 手机号（可选，11位手机号码）
 * 
 * @returns {Promise<Object>} 返回注册响应
 * @returns {string} return.status - 状态：success
 * @returns {string} return.message - 消息：注册成功
 * @returns {Object} return.data - 响应数据
 * @returns {Object} return.data.user - 用户信息
 * @returns {number} return.data.user.id - 用户ID
 * @returns {string} return.data.user.username - 用户名
 * @returns {string} return.data.user.email - 邮箱
 * @returns {string} return.data.user.phone - 手机号
 * @returns {Object} return.data.tokens - JWT令牌
 * @returns {string} return.data.tokens.access - 访问令牌
 * @returns {string} return.data.tokens.refresh - 刷新令牌
 * 
 * @throws {Error} 注册失败时抛出错误（如用户名已存在、邮箱已被使用等）
 * 
 * @example
 * // 基本注册
 * const response = await authAPI.register({
 *   username: 'newuser',
 *   email: 'newuser@example.com',
 *   password: 'SecurePass123!',
 *   password_confirm: 'SecurePass123!'
 * });
 * 
 * @example
 * // 带手机号的注册
 * const response = await authAPI.register({
 *   username: 'newuser',
 *   email: 'newuser@example.com',
 *   password: 'SecurePass123!',
 *   password_confirm: 'SecurePass123!',
 *   phone: '13800138000'
 * });
 * 
 * // 保存返回的tokens
 * const { access, refresh } = response.data.tokens;
 * localStorage.setItem('access_token', access);
 * localStorage.setItem('refresh_token', refresh);
 */
export function register(data) {
  return request({
    url: '/auth/register/',
    method: 'post',
    data
  });
}

/**
 * 用户登出
 * 
 * 将Refresh Token加入黑名单（需要后端启用token blacklist功能）
 * 前端应在调用此接口后清除本地存储的tokens
 * 
 * @param {Object} [data] - 登出数据（可选）
 * @param {string} [data.refresh] - 刷新令牌（如果不传，后端会从请求头获取）
 * 
 * @returns {Promise<Object>} 返回登出响应
 * @returns {string} return.status - 状态：success
 * @returns {string} return.message - 消息：登出成功
 * 
 * @throws {Error} 登出失败时抛出错误
 * 
 * @example
 * // 基本登出
 * await authAPI.logout();
 * // 清除本地tokens
 * localStorage.removeItem('access_token');
 * localStorage.removeItem('refresh_token');
 * 
 * @example
 * // 传入refresh token登出
 * const refreshToken = localStorage.getItem('refresh_token');
 * await authAPI.logout({ refresh: refreshToken });
 */
export function logout(data) {
  return request({
    url: '/auth/logout/',
    method: 'post',
    data
  });
}

/**
 * 刷新访问令牌
 * 
 * 使用refresh token获取新的access token
 * 通常由axios拦截器自动调用，不需要手动调用
 * 
 * @param {Object} data - 刷新数据
 * @param {string} data.refresh - 刷新令牌
 * 
 * @returns {Promise<Object>} 返回新的访问令牌
 * @returns {string} return.access - 新的访问令牌
 * 
 * @throws {Error} 刷新失败时抛出错误（refresh token过期或无效）
 * 
 * @example
 * const refreshToken = localStorage.getItem('refresh_token');
 * const response = await authAPI.refreshToken({ refresh: refreshToken });
 * localStorage.setItem('access_token', response.access);
 */
export function refreshToken(data) {
  return request({
    url: '/token/refresh/',
    method: 'post',
    data
  });
}

/**
 * 验证令牌是否有效
 * 
 * 检查access token是否有效（未过期且未被撤销）
 * 
 * @param {Object} data - 验证数据
 * @param {string} data.token - 要验证的访问令牌
 * 
 * @returns {Promise<Object>} 返回验证结果
 * 
 * @example
 * const token = localStorage.getItem('access_token');
 * const isValid = await authAPI.verifyToken({ token });
 */
export function verifyToken(data) {
  return request({
    url: '/token/verify/',
    method: 'post',
    data
  });
}

// 默认导出所有认证API
export default {
  login,
  register,
  logout,
  refreshToken,
  verifyToken
};

/**
 * 认证流程工具函数
 */

/**
 * 完整的登录流程
 * 包含登录、保存token、获取用户信息
 * 
 * @param {Object} credentials - 登录凭据
 * @param {string} credentials.username - 用户名或邮箱
 * @param {string} credentials.password - 密码
 * 
 * @returns {Promise<Object>} 返回用户信息和tokens
 * 
 * @example
 * const { user, tokens } = await loginFlow({
 *   username: 'testuser',
 *   password: 'password123'
 * });
 */
export async function loginFlow(credentials) {
  try {
    // 1. 调用登录接口
    const response = await login(credentials);
    
    // 2. 提取数据
    const { user, tokens } = response.data;
    
    // 3. 保存tokens到localStorage
    if (tokens) {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
    }
    
    // 4. 返回用户信息和tokens
    return { user, tokens };
  } catch (error) {
    console.error('登录流程失败:', error);
    throw error;
  }
}

/**
 * 完整的注册流程
 * 包含注册、保存token、获取用户信息
 * 
 * @param {Object} registerData - 注册数据
 * @param {string} registerData.username - 用户名
 * @param {string} registerData.email - 邮箱
 * @param {string} registerData.password - 密码
 * @param {string} registerData.password_confirm - 确认密码
 * @param {string} [registerData.phone] - 手机号
 * 
 * @returns {Promise<Object>} 返回用户信息和tokens
 * 
 * @example
 * const { user, tokens } = await registerFlow({
 *   username: 'newuser',
 *   email: 'user@example.com',
 *   password: 'password123',
 *   password_confirm: 'password123'
 * });
 */
export async function registerFlow(registerData) {
  try {
    // 1. 调用注册接口
    const response = await register(registerData);
    
    // 2. 提取数据
    const { user, tokens } = response.data;
    
    // 3. 保存tokens到localStorage
    if (tokens) {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
    }
    
    // 4. 返回用户信息和tokens
    return { user, tokens };
  } catch (error) {
    console.error('注册流程失败:', error);
    throw error;
  }
}

/**
 * 完整的登出流程
 * 包含调用登出接口、清除本地tokens、清除用户状态
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * await logoutFlow();
 * // 跳转到登录页
 * window.location.href = '/login';
 */
export async function logoutFlow() {
  try {
    // 1. 获取refresh token
    const refreshToken = localStorage.getItem('refresh_token');
    
    // 2. 调用登出接口（可选，即使失败也要清除本地数据）
    if (refreshToken) {
      try {
        await logout({ refresh: refreshToken });
      } catch (error) {
        console.warn('登出接口调用失败，继续清除本地数据:', error);
      }
    }
    
    // 3. 清除本地tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // 4. 清除其他用户相关数据（如果有）
    localStorage.removeItem('user_info');
    
    console.log('登出成功');
  } catch (error) {
    console.error('登出流程失败:', error);
    // 即使失败也要清除本地数据
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  }
}

/**
 * 检查用户是否已登录
 * 
 * @returns {boolean} 是否已登录
 * 
 * @example
 * if (isAuthenticated()) {
 *   console.log('用户已登录');
 * } else {
 *   window.location.href = '/login';
 * }
 */
export function isAuthenticated() {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  return !!(accessToken && refreshToken);
}

/**
 * 获取当前访问令牌
 * 
 * @returns {string|null} 访问令牌或null
 * 
 * @example
 * const token = getAccessToken();
 * if (token) {
 *   // 使用token
 * }
 */
export function getAccessToken() {
  return localStorage.getItem('access_token');
}

/**
 * 获取当前刷新令牌
 * 
 * @returns {string|null} 刷新令牌或null
 * 
 * @example
 * const refreshToken = getRefreshToken();
 */
export function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

/**
 * 清除所有认证信息
 * 
 * @example
 * clearAuthData();
 */
export function clearAuthData() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
}
