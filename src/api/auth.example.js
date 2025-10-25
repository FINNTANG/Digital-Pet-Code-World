/**
 * auth.js 模块使用示例
 * 
 * 展示如何在实际项目中使用认证API
 */

import { 
  login, 
  register, 
  logout,
  loginFlow,
  registerFlow,
  logoutFlow,
  isAuthenticated,
  getAccessToken,
  clearAuthData
} from './auth';

// ==================== 基础使用示例 ====================

/**
 * 示例 1: 基础登录
 */
export async function example1_basicLogin() {
  try {
    const response = await login({
      username: 'testuser',
      password: 'SecurePass123!'
    });
    
    console.log('登录成功:', response);
    console.log('用户信息:', response.data.user);
    console.log('Access Token:', response.data.tokens.access);
    
    // 手动保存tokens
    localStorage.setItem('access_token', response.data.tokens.access);
    localStorage.setItem('refresh_token', response.data.tokens.refresh);
    
  } catch (error) {
    console.error('登录失败:', error.message);
  }
}

/**
 * 示例 2: 使用邮箱登录
 */
export async function example2_loginWithEmail() {
  try {
    const response = await login({
      username: 'user@example.com',  // 使用邮箱
      password: 'SecurePass123!'
    });
    
    console.log('登录成功');
  } catch (error) {
    console.error('登录失败:', error.message);
  }
}

/**
 * 示例 3: 用户注册
 */
export async function example3_register() {
  try {
    const response = await register({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      password_confirm: 'SecurePass123!',
      phone: '13800138000'  // 可选
    });
    
    console.log('注册成功:', response.data.user);
    
    // 保存返回的tokens
    const { access, refresh } = response.data.tokens;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
  } catch (error) {
    console.error('注册失败:', error.message);
  }
}

/**
 * 示例 4: 用户登出
 */
export async function example4_logout() {
  try {
    await logout();
    
    // 清除本地tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    console.log('登出成功');
  } catch (error) {
    console.error('登出失败:', error.message);
  }
}

// ==================== 使用流程函数 ====================

/**
 * 示例 5: 使用 loginFlow（推荐）
 */
export async function example5_loginFlow() {
  try {
    // 一行代码完成登录和token保存
    const { user, tokens } = await loginFlow({
      username: 'testuser',
      password: 'SecurePass123!'
    });
    
    console.log('登录成功，用户:', user.username);
    console.log('Token已自动保存');
    
    // 可以直接使用user对象
    return user;
    
  } catch (error) {
    console.error('登录失败:', error.message);
  }
}

/**
 * 示例 6: 使用 registerFlow（推荐）
 */
export async function example6_registerFlow() {
  try {
    const { user, tokens } = await registerFlow({
      username: 'newuser123',
      email: 'newuser123@example.com',
      password: 'SecurePass123!',
      password_confirm: 'SecurePass123!'
    });
    
    console.log('注册成功，用户:', user.username);
    console.log('Token已自动保存');
    
    return user;
    
  } catch (error) {
    console.error('注册失败:', error.message);
  }
}

/**
 * 示例 7: 使用 logoutFlow（推荐）
 */
export async function example7_logoutFlow() {
  try {
    await logoutFlow();
    console.log('登出成功，所有数据已清除');
    
    // 可以跳转到登录页
    // window.location.href = '/login';
    
  } catch (error) {
    console.error('登出失败:', error.message);
  }
}

// ==================== 工具函数使用 ====================

/**
 * 示例 8: 检查登录状态
 */
export function example8_checkAuth() {
  if (isAuthenticated()) {
    console.log('用户已登录');
    const token = getAccessToken();
    console.log('当前Token:', token);
  } else {
    console.log('用户未登录，请先登录');
    // 跳转到登录页
    // window.location.href = '/login';
  }
}

/**
 * 示例 9: 清除所有认证数据
 */
export function example9_clearAuth() {
  clearAuthData();
  console.log('所有认证数据已清除');
}

// ==================== React 组件示例 ====================

/**
 * 示例 10: React 登录组件
 */
export function LoginComponent() {
  // React 示例（伪代码）
  const [form, setForm] = React.useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { user } = await loginFlow(form);
      console.log('登录成功:', user);
      
      // 跳转到首页或其他页面
      window.location.href = '/home';
      
    } catch (err) {
      setError(err.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="用户名或邮箱"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="密码"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}

/**
 * 示例 11: React 注册组件
 */
export function RegisterComponent() {
  const [form, setForm] = React.useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    phone: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.username) {
      newErrors.username = '请输入用户名';
    }
    
    if (!form.email) {
      newErrors.email = '请输入邮箱';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = '邮箱格式不正确';
    }
    
    if (!form.password) {
      newErrors.password = '请输入密码';
    } else if (form.password.length < 8) {
      newErrors.password = '密码至少8位';
    }
    
    if (form.password !== form.password_confirm) {
      newErrors.password_confirm = '两次密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { user } = await registerFlow(form);
      console.log('注册成功:', user);
      
      // 跳转到首页
      window.location.href = '/home';
      
    } catch (err) {
      setErrors({ submit: err.message || '注册失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="用户名"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      {errors.username && <span>{errors.username}</span>}
      
      <input
        type="email"
        placeholder="邮箱"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      {errors.email && <span>{errors.email}</span>}
      
      <input
        type="password"
        placeholder="密码"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {errors.password && <span>{errors.password}</span>}
      
      <input
        type="password"
        placeholder="确认密码"
        value={form.password_confirm}
        onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
      />
      {errors.password_confirm && <span>{errors.password_confirm}</span>}
      
      <input
        type="tel"
        placeholder="手机号（可选）"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      
      {errors.submit && <div className="error">{errors.submit}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? '注册中...' : '注册'}
      </button>
    </form>
  );
}

/**
 * 示例 12: React 路由守卫
 */
export function PrivateRoute({ children }) {
  React.useEffect(() => {
    if (!isAuthenticated()) {
      console.log('未登录，跳转到登录页');
      window.location.href = '/login';
    }
  }, []);

  return isAuthenticated() ? children : null;
}

// ==================== 高级使用示例 ====================

/**
 * 示例 13: 错误处理
 */
export async function example13_errorHandling() {
  try {
    await loginFlow({
      username: 'wronguser',
      password: 'wrongpass'
    });
  } catch (error) {
    // 根据错误类型进行不同处理
    if (error.message.includes('Invalid credentials')) {
      console.error('用户名或密码错误');
    } else if (error.message.includes('Account disabled')) {
      console.error('账号已被禁用');
    } else if (error.message.includes('Network')) {
      console.error('网络错误，请检查网络连接');
    } else {
      console.error('登录失败:', error.message);
    }
  }
}

/**
 * 示例 14: 自动登录
 */
export async function example14_autoLogin() {
  // 检查是否已登录
  if (isAuthenticated()) {
    console.log('已登录，无需重复登录');
    return;
  }
  
  // 检查是否有保存的登录信息（记住密码功能）
  const savedUsername = localStorage.getItem('saved_username');
  const savedPassword = localStorage.getItem('saved_password');
  
  if (savedUsername && savedPassword) {
    try {
      await loginFlow({
        username: savedUsername,
        password: savedPassword
      });
      console.log('自动登录成功');
    } catch (error) {
      console.error('自动登录失败:', error.message);
      // 清除保存的登录信息
      localStorage.removeItem('saved_username');
      localStorage.removeItem('saved_password');
    }
  }
}

/**
 * 示例 15: 登录并记住密码
 */
export async function example15_loginWithRemember(credentials, remember) {
  try {
    const { user } = await loginFlow(credentials);
    
    // 如果选择记住密码
    if (remember) {
      localStorage.setItem('saved_username', credentials.username);
      // 注意：实际项目中不应该明文保存密码，这里仅作示例
      // 更安全的做法是使用 remember token 或其他机制
      localStorage.setItem('saved_password', credentials.password);
    }
    
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * 示例 16: 监听 token 过期事件
 */
export function example16_listenTokenExpired() {
  // 监听全局登出事件（在 request.js 拦截器中触发）
  window.addEventListener('auth:logout', (event) => {
    const { reason } = event.detail;
    
    console.log('登出原因:', reason);
    
    if (reason === 'token_refresh_failed') {
      alert('登录已过期，请重新登录');
    } else if (reason === 'no_refresh_token') {
      console.log('未找到刷新令牌');
    }
    
    // 跳转到登录页
    window.location.href = '/login';
  });
}

/**
 * 示例 17: 完整的登录到使用流程
 */
export async function example17_completeFlow() {
  try {
    // 1. 检查是否已登录
    if (isAuthenticated()) {
      console.log('已登录，跳过登录步骤');
      return;
    }
    
    // 2. 执行登录
    console.log('开始登录...');
    const { user, tokens } = await loginFlow({
      username: 'testuser',
      password: 'SecurePass123!'
    });
    
    console.log('登录成功，用户:', user.username);
    console.log('Token:', tokens.access);
    
    // 3. 使用其他API（这些API会自动使用保存的token）
    // 例如：获取用户详细信息、获取数据等
    console.log('可以开始使用需要认证的API了');
    
    // 4. 稍后登出
    setTimeout(async () => {
      console.log('准备登出...');
      await logoutFlow();
      console.log('登出成功');
    }, 60000); // 60秒后登出
    
  } catch (error) {
    console.error('流程失败:', error.message);
  }
}

// 导出所有示例
export default {
  example1_basicLogin,
  example2_loginWithEmail,
  example3_register,
  example4_logout,
  example5_loginFlow,
  example6_registerFlow,
  example7_logoutFlow,
  example8_checkAuth,
  example9_clearAuth,
  example13_errorHandling,
  example14_autoLogin,
  example15_loginWithRemember,
  example16_listenTokenExpired,
  example17_completeFlow,
  
  // React组件
  LoginComponent,
  RegisterComponent,
  PrivateRoute
};
