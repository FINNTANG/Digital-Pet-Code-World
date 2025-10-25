# API 使用文档

## 📦 项目简介

基于 FastAPI Swagger 文档自动生成的 axios 请求封装，包含完整的用户管理、认证和 LLM 服务 API。

## 🚀 快速开始

### 环境配置

在项目根目录创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 基本使用

```javascript
import { authAPI, userAPI, llmAPI, tokenManager } from '@/utils/request';

// 用户登录
const login = async () => {
  try {
    const response = await authAPI.login({
      username: 'testuser',
      password: 'SecurePass123!'
    });
    
    // 保存 tokens
    const { tokens } = response.data;
    tokenManager.setTokens(tokens.access, tokens.refresh);
    
    console.log('登录成功:', response);
  } catch (error) {
    console.error('登录失败:', error.message);
  }
};
```

## 📚 API 模块

### 1. 认证模块 (authAPI)

#### 登录
```javascript
const response = await authAPI.login({
  username: 'testuser',  // 或使用 email
  password: 'SecurePass123!'
});
```

#### 注册
```javascript
const response = await authAPI.register({
  username: 'newuser',
  email: 'user@example.com',
  password: 'SecurePass123!',
  password_confirm: 'SecurePass123!',
  phone: '13800138000'  // 可选
});
```

#### 登出
```javascript
await authAPI.logout();
tokenManager.clearTokens();
```

---

### 2. 用户管理模块 (userAPI)

#### 获取当前用户信息
```javascript
const userInfo = await userAPI.getMe();
console.log(userInfo);
```

#### 更新用户信息
```javascript
// 完整更新
await userAPI.updateMe({
  first_name: '张',
  last_name: '三',
  phone: '13800138000',
  bio: '这是我的个人简介',
  gender: 'M',  // M/F/O
  birth_date: '1990-01-01'
});

// 部分更新（推荐）
await userAPI.patchMe({
  bio: '更新后的简介'
});
```

#### 修改密码
```javascript
await userAPI.changePassword({
  old_password: 'OldPass123!',
  new_password: 'NewPass123!',
  new_password_confirm: 'NewPass123!'
});
```

#### 上传头像
```javascript
const fileInput = document.querySelector('#avatar-input');
const file = fileInput.files[0];

await userAPI.uploadAvatar(file);
```

#### 删除头像
```javascript
await userAPI.deleteAvatar();
```

#### 管理员操作

```javascript
// 获取用户列表
const users = await userAPI.getList({
  search: 'keyword',
  ordering: '-date_joined',
  page: 1
});

// 获取用户详情
const user = await userAPI.getDetail(userId);

// 创建用户
await userAPI.create({
  username: 'newuser',
  email: 'user@example.com',
  // ...
});

// 更新用户
await userAPI.update(userId, userData);

// 部分更新
await userAPI.partialUpdate(userId, { is_active: false });

// 删除用户
await userAPI.delete(userId);
```

---

### 3. LLM 服务模块 (llmAPI)

#### 发送聊天消息
```javascript
const response = await llmAPI.chat({
  message: '你好，请介绍一下自己',
  session_id: 'default'  // 可选
});

console.log(response.data.reply);
```

#### 获取消息历史
```javascript
const messages = await llmAPI.getMessages({
  session_id: 'default',
  limit: 50,
  page: 1
});
```

#### 获取会话列表
```javascript
const sessions = await llmAPI.getSessions({
  ordering: '-updated_at'
});
```

#### 删除会话
```javascript
await llmAPI.deleteSession('session_id_here');
```

#### 清空会话
```javascript
await llmAPI.clearSession('session_id_here');
```

#### 获取统计信息
```javascript
const stats = await llmAPI.getStatistics();
console.log('总消息数:', stats.total_messages);
```

---

### 4. LLM 配置模块 (llmConfigAPI) - 管理员

#### 获取配置列表
```javascript
const configs = await llmConfigAPI.getList({
  search: 'openai',
  page: 1
});
```

#### 创建配置
```javascript
await llmConfigAPI.create({
  name: 'OpenAI GPT-4',
  provider: 'openai',  // openai/azure/anthropic/local/other
  model_name: 'gpt-4',
  api_key: 'sk-...',
  api_base: 'https://api.openai.com/v1',  // 可选
  is_active: true,
  max_tokens: 2000,
  temperature: 0.7
});
```

#### 更新配置
```javascript
// 完整更新
await llmConfigAPI.update(configId, configData);

// 部分更新
await llmConfigAPI.partialUpdate(configId, {
  temperature: 0.8
});
```

#### 激活/禁用配置
```javascript
await llmConfigAPI.activate(configId);
await llmConfigAPI.deactivate(configId);
```

#### 删除配置
```javascript
await llmConfigAPI.delete(configId);
```

---

### 5. Token 管理 (tokenManager)

```javascript
import { tokenManager } from '@/utils/request';

// 获取 access token
const accessToken = tokenManager.getAccessToken();

// 获取 refresh token
const refreshToken = tokenManager.getRefreshToken();

// 设置 tokens
tokenManager.setTokens(accessToken, refreshToken);

// 清除 tokens
tokenManager.clearTokens();

// 检查是否有 token
const hasToken = tokenManager.hasToken();
```

---

## 🔧 工具函数

### 分页参数构建
```javascript
import { buildPageParams } from '@/utils/request';

const params = buildPageParams(1, 20, {
  search: 'keyword',
  ordering: '-created_at'
});

const users = await userAPI.getList(params);
```

### 文件下载
```javascript
import { downloadFile } from '@/utils/request';

await downloadFile('/api/files/report.pdf', 'report.pdf');
```

### 文件上传（带进度）
```javascript
import { uploadFile } from '@/utils/request';

const file = document.querySelector('#file-input').files[0];

await uploadFile(
  '/api/upload/',
  file,
  { type: 'document' },  // 额外数据
  (progress) => {
    console.log(`上传进度: ${progress}%`);
  }
);
```

---

## 🎯 React 组件示例

### 登录组件
```javascript
import React, { useState } from 'react';
import { authAPI, tokenManager } from '@/utils/request';

function LoginForm() {
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.login(form);
      const { tokens } = response.data;
      
      // 保存 tokens
      tokenManager.setTokens(tokens.access, tokens.refresh);
      
      // 跳转到首页
      window.location.href = '/home';
    } catch (error) {
      alert('登录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
        placeholder="用户名或邮箱"
      />
      <input
        type="password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        placeholder="密码"
      />
      <button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
```

### 聊天组件
```javascript
import React, { useState, useEffect } from 'react';
import { llmAPI } from '@/utils/request';

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 加载历史消息
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await llmAPI.getMessages({
        session_id: 'default',
        limit: 50
      });
      setMessages(response.results || []);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const response = await llmAPI.chat({
        message: input,
        session_id: 'default'
      });
      
      // 添加消息到列表
      setMessages([...messages, {
        role: 'user',
        content: input
      }, {
        role: 'assistant',
        content: response.data.reply
      }]);
      
      setInput('');
    } catch (error) {
      alert('发送失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
        />
        <button onClick={sendMessage} disabled={loading}>
          发送
        </button>
      </div>
    </div>
  );
}
```

### 用户资料组件
```javascript
import React, { useState, useEffect } from 'react';
import { userAPI } from '@/utils/request';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const data = await userAPI.getMe();
      setUser(data);
      setForm(data);
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };

  const handleSave = async () => {
    try {
      await userAPI.patchMe({
        first_name: form.first_name,
        last_name: form.last_name,
        bio: form.profile?.bio,
        phone: form.profile?.phone
      });
      
      setEditing(false);
      loadUserInfo();
      alert('保存成功');
    } catch (error) {
      alert('保存失败: ' + error.message);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await userAPI.uploadAvatar(file);
      loadUserInfo();
      alert('头像上传成功');
    } catch (error) {
      alert('上传失败: ' + error.message);
    }
  };

  if (!user) return <div>加载中...</div>;

  return (
    <div className="user-profile">
      <div className="avatar">
        <img src={user.profile?.avatar_url || '/default-avatar.png'} alt="头像" />
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          style={{ display: 'none' }}
          id="avatar-upload"
        />
        <label htmlFor="avatar-upload">更换头像</label>
      </div>
      
      {editing ? (
        <div className="edit-form">
          <input
            value={form.first_name || ''}
            onChange={e => setForm({ ...form, first_name: e.target.value })}
            placeholder="名字"
          />
          <input
            value={form.last_name || ''}
            onChange={e => setForm({ ...form, last_name: e.target.value })}
            placeholder="姓氏"
          />
          <textarea
            value={form.profile?.bio || ''}
            onChange={e => setForm({ 
              ...form, 
              profile: { ...form.profile, bio: e.target.value }
            })}
            placeholder="个人简介"
          />
          <button onClick={handleSave}>保存</button>
          <button onClick={() => setEditing(false)}>取消</button>
        </div>
      ) : (
        <div className="user-info">
          <h2>{user.full_name || user.username}</h2>
          <p>{user.email}</p>
          <p>{user.profile?.bio}</p>
          <button onClick={() => setEditing(true)}>编辑</button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔐 认证流程

### 自动 Token 刷新

请求封装已内置自动 token 刷新机制：

1. 请求拦截器自动添加 `Authorization: Bearer <access_token>`
2. 响应拦截器检测 401 错误
3. 自动调用 refresh token 接口
4. 重试原始请求
5. 如果刷新失败，触发全局登出事件

### 监听登出事件

```javascript
// 在 App.jsx 或路由守卫中监听
useEffect(() => {
  const handleLogout = (event) => {
    const { reason } = event.detail;
    console.log('登出原因:', reason);
    
    // 清理用户状态
    tokenManager.clearTokens();
    
    // 跳转登录页
    window.location.href = '/login';
  };
  
  window.addEventListener('auth:logout', handleLogout);
  
  return () => {
    window.removeEventListener('auth:logout', handleLogout);
  };
}, []);
```

---

## 🛠️ 高级配置

### 自定义请求实例

```javascript
import request from '@/utils/request';

// 直接使用 request 实例
const response = await request.get('/custom/endpoint');
const data = await request.post('/custom/endpoint', { key: 'value' });
```

### 请求配置选项

```javascript
// 自定义超时时间
await request.get('/api/slow-endpoint', {
  timeout: 60000  // 60秒
});

// 取消请求
const source = axios.CancelToken.source();

request.get('/api/data', {
  cancelToken: source.token
});

// 取消请求
source.cancel('用户取消');
```

---

## 📝 错误处理

所有 API 请求的错误都会被统一格式化：

```javascript
try {
  await userAPI.getMe();
} catch (error) {
  console.log(error.status);    // HTTP 状态码
  console.log(error.message);   // 错误消息
  console.log(error.data);      // 原始错误数据
  console.log(error.originalError);  // 原始 axios 错误
}
```

---

## 🎨 TypeScript 支持

创建类型定义文件 `src/utils/request.d.ts`：

```typescript
export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  phone?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  profile: {
    phone?: string;
    avatar_url?: string;
    bio?: string;
    gender?: 'M' | 'F' | 'O';
    birth_date?: string;
  };
}

// ... 更多类型定义
```

---

## 📦 最佳实践

1. **环境变量配置**：使用 `.env` 文件管理 API 地址
2. **错误处理**：始终使用 try-catch 包裹 API 调用
3. **Loading 状态**：在请求期间显示加载指示器
4. **Token 管理**：登录成功后立即保存 tokens
5. **登出清理**：登出时清除所有用户相关数据
6. **请求优化**：使用分页、搜索、排序参数减少数据量
7. **文件上传**：大文件上传时显示进度条

---

## 🐛 常见问题

### 1. CORS 错误
确保后端配置了正确的 CORS 设置。

### 2. 401 未授权
检查 token 是否已过期或未正确保存。

### 3. 请求超时
调整 `timeout` 配置或优化后端响应速度。

### 4. 文件上传失败
确保 Content-Type 为 `multipart/form-data`。

---

## 📞 支持

如有问题，请查看：
- Swagger 文档：http://localhost:8000/docs
- API 文档：http://localhost:8000/redoc
