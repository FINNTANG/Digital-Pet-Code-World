# API 模块说明文档

## 📁 目录结构

```
src/api/
├── auth.js              # 认证模块API
├── auth.example.js      # 认证模块使用示例
└── README.md            # 本文件
```

## 🚀 认证模块 (auth.js)

### 功能概览

认证模块基于 `src/utils/request.js` 封装，提供完整的用户认证功能：

- ✅ 用户登录（支持用户名/邮箱）
- ✅ 用户注册
- ✅ 用户登出
- ✅ Token 刷新
- ✅ Token 验证
- ✅ 登录状态检查
- ✅ 完整流程函数（推荐使用）

### 快速开始

#### 1. 基础登录

```javascript
import { login } from '@/api/auth';

const response = await login({
  username: 'testuser',
  password: 'password123'
});

console.log(response.data.user);
console.log(response.data.tokens);
```

#### 2. 使用流程函数（推荐）

```javascript
import { loginFlow, registerFlow, logoutFlow } from '@/api/auth';

// 登录（自动保存token）
const { user, tokens } = await loginFlow({
  username: 'testuser',
  password: 'password123'
});

// 注册（自动保存token）
const { user, tokens } = await registerFlow({
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123',
  password_confirm: 'password123'
});

// 登出（自动清除token和数据）
await logoutFlow();
```

#### 3. 检查登录状态

```javascript
import { isAuthenticated, getAccessToken } from '@/api/auth';

if (isAuthenticated()) {
  const token = getAccessToken();
  console.log('已登录，token:', token);
} else {
  console.log('未登录');
  window.location.href = '/login';
}
```

## 📚 API 参考

### 基础API函数

#### `login(data)`

用户登录接口

**参数：**
- `data.username` (string, 必填) - 用户名或邮箱
- `data.password` (string, 必填) - 密码

**返回：**
```javascript
{
  status: "success",
  message: "登录成功",
  data: {
    user: {
      id: 1,
      username: "testuser",
      email: "user@example.com",
      full_name: "Test User",
      is_active: true
    },
    tokens: {
      access: "eyJ0eXAiOiJKV1QiLCJhbGc...",
      refresh: "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  }
}
```

#### `register(data)`

用户注册接口

**参数：**
- `data.username` (string, 必填) - 用户名
- `data.email` (string, 必填) - 邮箱
- `data.password` (string, 必填) - 密码
- `data.password_confirm` (string, 必填) - 确认密码
- `data.phone` (string, 可选) - 手机号

**返回：** 同 login

#### `logout(data)`

用户登出接口

**参数：**
- `data.refresh` (string, 可选) - 刷新令牌

**返回：**
```javascript
{
  status: "success",
  message: "登出成功"
}
```

#### `refreshToken(data)`

刷新访问令牌（通常由拦截器自动调用）

**参数：**
- `data.refresh` (string, 必填) - 刷新令牌

**返回：**
```javascript
{
  access: "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 流程函数（推荐）

#### `loginFlow(credentials)`

完整登录流程：登录 → 保存token → 返回用户信息

**参数：**
- `credentials.username` (string) - 用户名或邮箱
- `credentials.password` (string) - 密码

**返回：**
```javascript
{
  user: { /* 用户信息 */ },
  tokens: { /* JWT令牌 */ }
}
```

#### `registerFlow(registerData)`

完整注册流程：注册 → 保存token → 返回用户信息

**参数：** 同 register

**返回：** 同 loginFlow

#### `logoutFlow()`

完整登出流程：调用登出接口 → 清除token → 清除用户数据

**返回：** Promise<void>

### 工具函数

#### `isAuthenticated()`

检查用户是否已登录

**返回：** boolean

#### `getAccessToken()`

获取当前访问令牌

**返回：** string | null

#### `getRefreshToken()`

获取当前刷新令牌

**返回：** string | null

#### `clearAuthData()`

清除所有认证信息

**返回：** void

## 🎯 使用场景

### 场景 1: 登录页面

```javascript
import { loginFlow } from '@/api/auth';

async function handleLogin(formData) {
  try {
    const { user } = await loginFlow(formData);
    
    // 登录成功，跳转到首页
    console.log('欢迎:', user.username);
    window.location.href = '/home';
    
  } catch (error) {
    // 显示错误信息
    alert('登录失败: ' + error.message);
  }
}
```

### 场景 2: 注册页面

```javascript
import { registerFlow } from '@/api/auth';

async function handleRegister(formData) {
  try {
    // 验证两次密码是否一致
    if (formData.password !== formData.password_confirm) {
      throw new Error('两次密码不一致');
    }
    
    const { user } = await registerFlow(formData);
    
    // 注册成功，跳转到首页
    console.log('注册成功:', user.username);
    window.location.href = '/home';
    
  } catch (error) {
    alert('注册失败: ' + error.message);
  }
}
```

### 场景 3: 路由守卫

```javascript
import { isAuthenticated } from '@/api/auth';

// React Router 示例
function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    // 未登录，重定向到登录页
    return <Navigate to="/login" />;
  }
  
  return children;
}

// 使用
<PrivateRoute>
  <HomePage />
</PrivateRoute>
```

### 场景 4: 全局登出监听

```javascript
import { logoutFlow } from '@/api/auth';

// 监听全局登出事件（token过期等）
window.addEventListener('auth:logout', (event) => {
  const { reason } = event.detail;
  
  if (reason === 'token_refresh_failed') {
    alert('登录已过期，请重新登录');
  }
  
  // 跳转到登录页
  window.location.href = '/login';
});
```

## 🔄 与 request.js 的关系

`auth.js` 基于 `src/utils/request.js` 构建：

```
auth.js (认证API)
    ↓
request.js (axios封装)
    ↓
axios (HTTP客户端)
```

**优势：**
1. **自动Token管理**: request.js 自动添加 Authorization 头
2. **自动Token刷新**: token过期时自动刷新
3. **统一错误处理**: 标准化的错误格式
4. **请求拦截**: 开发环境日志输出

## 🎨 React 集成示例

### Hook: useAuth

```javascript
import { useState, useEffect } from 'react';
import { isAuthenticated, getAccessToken } from '@/api/auth';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated());
      setToken(getAccessToken());
    };

    checkAuth();
    
    // 监听storage变化
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return { isLoggedIn, token };
}

// 使用
function App() {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <LoginPage />;
  }
  
  return <HomePage />;
}
```

### 组件: AuthProvider

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, loginFlow, logoutFlow } from '@/api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查是否已登录
    if (isAuthenticated()) {
      // 可以在这里加载用户信息
      setUser({ username: 'testuser' }); // 示例
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { user } = await loginFlow(credentials);
    setUser(user);
  };

  const logout = async () => {
    await logoutFlow();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);

// 使用
function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}

function SomeComponent() {
  const { user, logout } = useAuthContext();
  
  return (
    <div>
      <p>欢迎, {user?.username}</p>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

## 🐛 错误处理

### 常见错误

```javascript
import { login } from '@/api/auth';

try {
  await login({ username: 'test', password: 'wrong' });
} catch (error) {
  console.log(error.status);    // HTTP状态码: 401
  console.log(error.message);   // 错误消息: "Invalid credentials"
  console.log(error.data);      // 原始错误数据
}
```

### 错误类型处理

```javascript
async function handleLogin(credentials) {
  try {
    await loginFlow(credentials);
  } catch (error) {
    switch (error.status) {
      case 400:
        alert('请求参数错误');
        break;
      case 401:
        alert('用户名或密码错误');
        break;
      case 403:
        alert('账号已被禁用');
        break;
      case 500:
        alert('服务器错误，请稍后重试');
        break;
      default:
        alert('登录失败: ' + error.message);
    }
  }
}
```

## 📝 最佳实践

### 1. 使用流程函数

✅ **推荐**
```javascript
const { user } = await loginFlow(credentials);
```

❌ **不推荐**
```javascript
const response = await login(credentials);
localStorage.setItem('access_token', response.data.tokens.access);
localStorage.setItem('refresh_token', response.data.tokens.refresh);
```

### 2. 统一错误处理

```javascript
async function handleAuth(action) {
  try {
    return await action();
  } catch (error) {
    // 统一的错误提示
    showNotification('error', error.message);
    logError(error);
  }
}
```

### 3. 页面加载时检查登录状态

```javascript
import { isAuthenticated } from '@/api/auth';

function App() {
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
    }
  }, []);
  
  return <YourApp />;
}
```

### 4. 监听Token过期

```javascript
useEffect(() => {
  const handleLogout = () => {
    window.location.href = '/login';
  };
  
  window.addEventListener('auth:logout', handleLogout);
  return () => window.removeEventListener('auth:logout', handleLogout);
}, []);
```

## 🔒 安全建议

1. **HTTPS**: 生产环境必须使用HTTPS
2. **Token安全**: 不要在URL或日志中暴露token
3. **密码强度**: 前端验证密码强度
4. **定期刷新**: 利用自动token刷新机制
5. **安全存储**: token存储在localStorage，注意XSS防护

## 📚 更多资源

- **完整示例**: 查看 `auth.example.js`
- **基础封装**: 查看 `../utils/request.js`
- **API文档**: 查看 `../utils/API_USAGE.md`

---

**版本**: 1.0.0  
**作者**: 资深前端开发  
**最后更新**: 2024
