/**
 * API 测试工具
 * 用于在浏览器控制台快速测试 API 功能
 * 
 * 使用方法：
 * 1. 在浏览器中打开应用
 * 2. 打开控制台（F12）
 * 3. 运行测试命令，例如：
 *    - testAPI.testLogin()
 *    - testAPI.testGetUserInfo()
 *    - testAPI.testChat()
 */

import { 
  authAPI, 
  userAPI, 
  llmAPI, 
  llmConfigAPI,
  tokenManager 
} from './request';

const testAPI = {
  // ==================== 测试配置 ====================
  config: {
    testUser: {
      username: 'testuser',
      password: 'testpass123',
      email: 'test@example.com'
    },
    testSession: 'test-session-' + Date.now()
  },

  // ==================== 认证测试 ====================
  
  /**
   * 测试登录
   */
  async testLogin(username, password) {
    console.log('🧪 测试登录...');
    try {
      const response = await authAPI.login({
        username: username || this.config.testUser.username,
        password: password || this.config.testUser.password
      });
      
      console.log('✅ 登录成功:', response);
      
      if (response.data?.tokens) {
        const { access, refresh } = response.data.tokens;
        tokenManager.setTokens(access, refresh);
        console.log('✅ Token 已保存');
      }
      
      return response;
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      return null;
    }
  },

  /**
   * 测试注册
   */
  async testRegister() {
    console.log('🧪 测试注册...');
    const timestamp = Date.now();
    
    try {
      const response = await authAPI.register({
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'TestPass123!',
        password_confirm: 'TestPass123!',
        phone: '13800138000'
      });
      
      console.log('✅ 注册成功:', response);
      return response;
    } catch (error) {
      console.error('❌ 注册失败:', error.message);
      return null;
    }
  },

  /**
   * 测试登出
   */
  async testLogout() {
    console.log('🧪 测试登出...');
    try {
      await authAPI.logout();
      tokenManager.clearTokens();
      console.log('✅ 登出成功');
    } catch (error) {
      console.error('❌ 登出失败:', error.message);
    }
  },

  // ==================== 用户管理测试 ====================
  
  /**
   * 测试获取用户信息
   */
  async testGetUserInfo() {
    console.log('🧪 测试获取用户信息...');
    try {
      const user = await userAPI.getMe();
      console.log('✅ 用户信息:', user);
      return user;
    } catch (error) {
      console.error('❌ 获取失败:', error.message);
      return null;
    }
  },

  /**
   * 测试更新用户信息
   */
  async testUpdateUserInfo() {
    console.log('🧪 测试更新用户信息...');
    try {
      const response = await userAPI.patchMe({
        first_name: '测试',
        last_name: '用户',
        profile: {
          bio: `测试简介 - ${new Date().toLocaleString()}`
        }
      });
      
      console.log('✅ 更新成功:', response);
      return response;
    } catch (error) {
      console.error('❌ 更新失败:', error.message);
      return null;
    }
  },

  /**
   * 测试修改密码
   */
  async testChangePassword(oldPassword, newPassword) {
    console.log('🧪 测试修改密码...');
    try {
      await userAPI.changePassword({
        old_password: oldPassword || 'OldPass123!',
        new_password: newPassword || 'NewPass123!',
        new_password_confirm: newPassword || 'NewPass123!'
      });
      
      console.log('✅ 密码修改成功');
      console.warn('⚠️ 注意：密码已修改，请使用新密码登录');
    } catch (error) {
      console.error('❌ 密码修改失败:', error.message);
    }
  },

  // ==================== LLM 服务测试 ====================
  
  /**
   * 测试发送聊天消息
   */
  async testChat(message) {
    console.log('🧪 测试聊天...');
    try {
      const response = await llmAPI.chat({
        message: message || '你好，请介绍一下自己',
        session_id: this.config.testSession
      });
      
      console.log('✅ AI 回复:', response.data?.reply);
      return response;
    } catch (error) {
      console.error('❌ 聊天失败:', error.message);
      return null;
    }
  },

  /**
   * 测试获取消息历史
   */
  async testGetMessages() {
    console.log('🧪 测试获取消息历史...');
    try {
      const response = await llmAPI.getMessages({
        session_id: this.config.testSession,
        limit: 10
      });
      
      console.log('✅ 消息历史:', response);
      console.log(`共 ${response.count} 条消息`);
      return response;
    } catch (error) {
      console.error('❌ 获取失败:', error.message);
      return null;
    }
  },

  /**
   * 测试获取会话列表
   */
  async testGetSessions() {
    console.log('🧪 测试获取会话列表...');
    try {
      const response = await llmAPI.getSessions();
      console.log('✅ 会话列表:', response);
      console.log(`共 ${response.count} 个会话`);
      return response;
    } catch (error) {
      console.error('❌ 获取失败:', error.message);
      return null;
    }
  },

  /**
   * 测试删除会话
   */
  async testDeleteSession(sessionId) {
    console.log('🧪 测试删除会话...');
    const id = sessionId || this.config.testSession;
    
    try {
      await llmAPI.deleteSession(id);
      console.log(`✅ 会话 ${id} 已删除`);
    } catch (error) {
      console.error('❌ 删除失败:', error.message);
    }
  },

  /**
   * 测试获取统计信息
   */
  async testGetStatistics() {
    console.log('🧪 测试获取统计信息...');
    try {
      const response = await llmAPI.getStatistics();
      console.log('✅ 统计信息:', response);
      return response;
    } catch (error) {
      console.error('❌ 获取失败:', error.message);
      return null;
    }
  },

  // ==================== LLM 配置测试（管理员）====================
  
  /**
   * 测试获取配置列表
   */
  async testGetConfigs() {
    console.log('🧪 测试获取 LLM 配置列表...');
    try {
      const response = await llmConfigAPI.getList();
      console.log('✅ 配置列表:', response);
      return response;
    } catch (error) {
      console.error('❌ 获取失败:', error.message);
      return null;
    }
  },

  /**
   * 测试创建配置
   */
  async testCreateConfig() {
    console.log('🧪 测试创建 LLM 配置...');
    try {
      const response = await llmConfigAPI.create({
        name: `测试配置-${Date.now()}`,
        provider: 'openai',
        model_name: 'gpt-3.5-turbo',
        api_key: 'test-key-' + Date.now(),
        is_active: false,
        max_tokens: 2000,
        temperature: 0.7
      });
      
      console.log('✅ 配置创建成功:', response);
      return response;
    } catch (error) {
      console.error('❌ 创建失败:', error.message);
      return null;
    }
  },

  // ==================== 综合测试 ====================
  
  /**
   * 完整流程测试
   */
  async testCompleteFlow() {
    console.log('\n📋 开始完整流程测试...\n');
    
    const results = {
      login: false,
      getUserInfo: false,
      updateUser: false,
      chat: false,
      getSessions: false,
      statistics: false
    };
    
    try {
      // 1. 登录
      console.log('步骤 1/6: 登录');
      const loginRes = await this.testLogin();
      results.login = !!loginRes;
      
      if (!results.login) {
        console.error('❌ 登录失败，测试终止');
        return results;
      }
      
      // 2. 获取用户信息
      console.log('\n步骤 2/6: 获取用户信息');
      const user = await this.testGetUserInfo();
      results.getUserInfo = !!user;
      
      // 3. 更新用户信息
      console.log('\n步骤 3/6: 更新用户信息');
      const updateRes = await this.testUpdateUserInfo();
      results.updateUser = !!updateRes;
      
      // 4. 发送聊天消息
      console.log('\n步骤 4/6: 发送聊天消息');
      const chatRes = await this.testChat('这是一条测试消息');
      results.chat = !!chatRes;
      
      // 5. 获取会话列表
      console.log('\n步骤 5/6: 获取会话列表');
      const sessions = await this.testGetSessions();
      results.getSessions = !!sessions;
      
      // 6. 获取统计信息
      console.log('\n步骤 6/6: 获取统计信息');
      const stats = await this.testGetStatistics();
      results.statistics = !!stats;
      
      // 输出测试结果
      console.log('\n' + '='.repeat(50));
      console.log('📊 测试结果汇总:');
      console.log('='.repeat(50));
      
      Object.entries(results).forEach(([key, value]) => {
        const icon = value ? '✅' : '❌';
        console.log(`${icon} ${key}: ${value ? '成功' : '失败'}`);
      });
      
      const successCount = Object.values(results).filter(v => v).length;
      const totalCount = Object.keys(results).length;
      
      console.log('\n总成功率:', `${successCount}/${totalCount}`, 
        `(${Math.round(successCount/totalCount*100)}%)`);
      console.log('='.repeat(50) + '\n');
      
    } catch (error) {
      console.error('❌ 测试过程中出现错误:', error);
    }
    
    return results;
  },

  /**
   * 测试 Token 管理
   */
  testTokenManager() {
    console.log('🧪 测试 Token 管理...');
    
    // 设置测试 tokens
    console.log('设置测试 tokens...');
    tokenManager.setTokens('test-access-token', 'test-refresh-token');
    
    // 获取 tokens
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    
    // 检查是否有 token
    const hasToken = tokenManager.hasToken();
    console.log('Has Token:', hasToken);
    
    // 清除 tokens
    console.log('清除 tokens...');
    tokenManager.clearTokens();
    
    const hasTokenAfterClear = tokenManager.hasToken();
    console.log('Has Token (after clear):', hasTokenAfterClear);
    
    console.log('✅ Token 管理测试完成');
  },

  // ==================== 工具方法 ====================
  
  /**
   * 显示帮助信息
   */
  help() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    API 测试工具帮助                         ║
╚════════════════════════════════════════════════════════════╝

📝 使用方法：
  在浏览器控制台中调用 testAPI 对象的方法

🔐 认证测试：
  testAPI.testLogin()              - 测试登录
  testAPI.testRegister()           - 测试注册
  testAPI.testLogout()             - 测试登出

👤 用户管理测试：
  testAPI.testGetUserInfo()        - 获取用户信息
  testAPI.testUpdateUserInfo()     - 更新用户信息
  testAPI.testChangePassword()     - 修改密码

💬 LLM 服务测试：
  testAPI.testChat('消息内容')     - 发送聊天消息
  testAPI.testGetMessages()        - 获取消息历史
  testAPI.testGetSessions()        - 获取会话列表
  testAPI.testDeleteSession(id)    - 删除会话
  testAPI.testGetStatistics()      - 获取统计信息

⚙️ LLM 配置测试（管理员）：
  testAPI.testGetConfigs()         - 获取配置列表
  testAPI.testCreateConfig()       - 创建配置

🧪 综合测试：
  testAPI.testCompleteFlow()       - 完整流程测试
  testAPI.testTokenManager()       - Token 管理测试

📋 其他：
  testAPI.help()                   - 显示此帮助信息
  testAPI.config                   - 查看测试配置

💡 示例：
  // 登录后测试聊天
  await testAPI.testLogin('username', 'password')
  await testAPI.testChat('你好')

  // 完整流程测试
  await testAPI.testCompleteFlow()
    `);
  }
};

// 在开发环境自动挂载到 window
if (import.meta.env.DEV) {
  window.testAPI = testAPI;
  console.log('✅ API 测试工具已加载，输入 testAPI.help() 查看帮助');
}

export default testAPI;
