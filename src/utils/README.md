# Request 模块文档

## 📁 文件结构

```
src/utils/
├── request.js          # Axios 请求封装核心文件
├── api-examples.js     # API 使用示例代码
├── API_USAGE.md        # 详细使用文档
└── README.md           # 本文件
```

## 🚀 快速开始

### 1. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env`：
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. 导入并使用

```javascript
import { authAPI, userAPI, llmAPI, tokenManager } from '@/utils/request';

// 登录
const response = await authAPI.login({
  username: 'user',
  password: 'pass123'
});

// 保存 token
tokenManager.setTokens(response.data.tokens.access, response.data.tokens.refresh);

// 获取用户信息
const user = await userAPI.getMe();
```

## 📦 核心功能

### ✨ 主要特性

1. **自动 Token 管理**
   - 自动添加 Authorization header
   - Token 过期自动刷新
   - 刷新失败自动登出

2. **统一错误处理**
   - 标准化错误格式
   - 详细错误日志
   - 友好错误提示

3. **请求/响应拦截**
   - 开发环境日志输出
   - 请求参数格式化
   - 响应数据提取

4. **模块化 API**
   - authAPI - 认证模块
   - userAPI - 用户管理
   - llmAPI - LLM 服务
   - llmConfigAPI - LLM 配置管理

5. **工具函数**
   - buildPageParams - 分页参数构建
   - downloadFile - 文件下载
   - uploadFile - 文件上传（带进度）

## 🎯 API 模块概览

### 认证模块 (authAPI)

| 方法 | 说明 | 参数 |
|------|------|------|
| `login(data)` | 用户登录 | `{ username, password }` |
| `register(data)` | 用户注册 | `{ username, email, password, password_confirm, phone? }` |
| `logout()` | 用户登出 | - |

### 用户管理 (userAPI)

| 方法 | 说明 | 权限 |
|------|------|------|
| `getMe()` | 获取当前用户 | 认证用户 |
| `updateMe(data)` | 更新用户信息 | 认证用户 |
| `patchMe(data)` | 部分更新 | 认证用户 |
| `changePassword(data)` | 修改密码 | 认证用户 |
| `uploadAvatar(file)` | 上传头像 | 认证用户 |
| `deleteAvatar()` | 删除头像 | 认证用户 |
| `getList(params)` | 用户列表 | 管理员 |
| `create(data)` | 创建用户 | 管理员 |
| `update(id, data)` | 更新用户 | 管理员 |
| `delete(id)` | 删除用户 | 管理员 |

### LLM 服务 (llmAPI)

| 方法 | 说明 | 参数 |
|------|------|------|
| `chat(data)` | 发送消息 | `{ message, session_id? }` |
| `getMessages(params)` | 消息历史 | `{ session_id?, limit?, page? }` |
| `getSessions(params)` | 会话列表 | `{ page?, ordering? }` |
| `deleteSession(id)` | 删除会话 | `sessionId` |
| `clearSession(id)` | 清空会话 | `sessionId` |
| `getStatistics(params)` | 统计信息 | `params` |

### LLM 配置 (llmConfigAPI)

| 方法 | 说明 | 权限 |
|------|------|------|
| `getList(params)` | 配置列表 | 管理员 |
| `create(data)` | 创建配置 | 管理员 |
| `update(id, data)` | 更新配置 | 管理员 |
| `partialUpdate(id, data)` | 部分更新 | 管理员 |
| `delete(id)` | 删除配置 | 管理员 |
| `activate(id)` | 激活配置 | 管理员 |
| `deactivate(id)` | 禁用配置 | 管理员 |

## 🔐 认证流程

### Token 管理

```javascript
import { tokenManager } from '@/utils/request';

// 保存 tokens
tokenManager.setTokens(accessToken, refreshToken);

// 获取 token
const token = tokenManager.getAccessToken();

// 检查是否已登录
const isLoggedIn = tokenManager.hasToken();

// 清除 tokens
tokenManager.clearTokens();
```

### 自动刷新机制

当 access_token 过期（401 错误）时：
1. 自动使用 refresh_token 获取新的 access_token
2. 更新本地存储的 token
3. 重试原始请求
4. 如果刷新失败，触发 `auth:logout` 事件

### 监听登出事件

```javascript
window.addEventListener('auth:logout', (event) => {
  const { reason } = event.detail;
  console.log('登出原因:', reason);
  
  // 清理状态并跳转登录页
  window.location.href = '/login';
});
```

## 💡 使用示例

### 示例 1: 登录并获取用户信息

```javascript
import { authAPI, userAPI, tokenManager } from '@/utils/request';

async function loginAndGetUser() {
  try {
    // 登录
    const loginRes = await authAPI.login({
      username: 'testuser',
      password: 'password123'
    });
    
    // 保存 tokens
    const { access, refresh } = loginRes.data.tokens;
    tokenManager.setTokens(access, refresh);
    
    // 获取用户信息
    const user = await userAPI.getMe();
    console.log('用户信息:', user);
    
  } catch (error) {
    console.error('操作失败:', error.message);
  }
}
```

### 示例 2: 发送聊天消息

```javascript
import { llmAPI } from '@/utils/request';

async function sendChatMessage(message) {
  try {
    const response = await llmAPI.chat({
      message: message,
      session_id: 'my-session'
    });
    
    console.log('AI 回复:', response.data.reply);
    return response.data.reply;
    
  } catch (error) {
    console.error('发送失败:', error.message);
  }
}
```

### 示例 3: 上传头像

```javascript
import { userAPI } from '@/utils/request';

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  
  try {
    const response = await userAPI.uploadAvatar(file);
    console.log('上传成功:', response.data.profile.avatar_url);
    
  } catch (error) {
    console.error('上传失败:', error.message);
  }
}
```

### 示例 4: 分页加载数据

```javascript
import { llmAPI, buildPageParams } from '@/utils/request';

async function loadMessages(page = 1) {
  try {
    const params = buildPageParams(page, 20, {
      session_id: 'default',
      ordering: '-created_at'
    });
    
    const response = await llmAPI.getMessages(params);
    
    console.log(`第 ${page} 页，共 ${response.count} 条`);
    console.log('消息列表:', response.results);
    
    return {
      data: response.results,
      total: response.count,
      hasNext: !!response.next
    };
    
  } catch (error) {
    console.error('加载失败:', error.message);
  }
}
```

## 🎨 React 集成

### 使用示例

```jsx
import React, { useState, useEffect } from 'react';
import { userAPI } from '@/utils/request';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await userAPI.getMe();
      setUser(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>未登录</div>;

  return (
    <div>
      <h1>{user.full_name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 自定义 Hooks

查看 `api-examples.js` 中的 `useUserInfo` 和 `useChat` hooks 示例。

## 🛠️ 高级配置

### 自定义超时时间

```javascript
import request from '@/utils/request';

const response = await request.get('/slow-api', {
  timeout: 60000  // 60秒
});
```

### 取消请求

```javascript
import axios from 'axios';
import request from '@/utils/request';

const source = axios.CancelToken.source();

request.get('/api/data', {
  cancelToken: source.token
});

// 取消请求
source.cancel('用户取消操作');
```

### 自定义请求头

```javascript
import request from '@/utils/request';

const response = await request.post('/api/data', data, {
  headers: {
    'Custom-Header': 'value'
  }
});
```

## 📝 错误处理

### 错误格式

所有 API 错误都会被格式化为：

```javascript
{
  status: 404,              // HTTP 状态码
  message: '资源未找到',     // 错误消息
  data: { ... },           // 原始错误数据
  originalError: Error     // 原始 axios 错误
}
```

### 错误处理示例

```javascript
try {
  await userAPI.getMe();
} catch (error) {
  switch (error.status) {
    case 401:
      console.log('未授权，请登录');
      break;
    case 403:
      console.log('没有权限');
      break;
    case 404:
      console.log('资源不存在');
      break;
    case 500:
      console.log('服务器错误');
      break;
    default:
      console.log('请求失败:', error.message);
  }
}
```

## 🔍 调试技巧

### 开发环境日志

在开发环境下，所有请求和响应都会自动打印到控制台：

```
[API Request] POST /auth/login/ { data: {...} }
[API Response] /auth/login/ { status: "success", data: {...} }
```

### 查看网络请求

打开浏览器开发者工具 → Network 标签页查看详细的网络请求信息。

## 📚 更多资源

- **详细文档**: 查看 `API_USAGE.md`
- **代码示例**: 查看 `api-examples.js`
- **Swagger 文档**: http://localhost:8000/docs
- **API 文档**: http://localhost:8000/redoc

## ⚠️ 注意事项

1. **环境变量**: 确保正确配置 `VITE_API_BASE_URL`
2. **Token 管理**: 登录后立即保存 tokens
3. **错误处理**: 始终使用 try-catch 包裹 API 调用
4. **安全性**: 不要在代码中硬编码敏感信息
5. **CORS**: 确保后端配置了正确的 CORS 设置

## 🐛 常见问题

### Q: 请求返回 401 未授权？
A: 检查是否已登录，token 是否已过期或未正确保存。

### Q: 请求超时？
A: 检查网络连接，或调整 timeout 配置。

### Q: CORS 错误？
A: 确保后端配置了正确的 CORS 允许源。

### Q: 文件上传失败？
A: 检查 Content-Type 是否为 multipart/form-data，文件大小是否超限。

### Q: Token 刷新失败？
A: 检查 refresh_token 是否过期，或者后端是否正确配置了刷新接口。

## 📄 License

MIT License

---

**作者**: 资深前端开发
**创建时间**: 2024
**版本**: 1.0.0
