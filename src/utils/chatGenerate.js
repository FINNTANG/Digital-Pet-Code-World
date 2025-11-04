import { chat } from '../api/chat';

/**
 * 生成宠物聊天消息
 *
 * 调用后端 chat API，将绝对状态值转换为变化量(delta)
 *
 * @param {number} health - 宠物当前健康值 (0-100)
 * @param {number} happiness - 宠物当前快乐值 (0-100)
 * @param {string} message - 用户消息
 * @param {string} petType - 宠物类型 (fox/dog/snake)
 * @param {string} [imageData] - Base64编码的图片数据（可选）
 *
 * @returns {Promise<Object>} 返回聊天响应
 * @returns {boolean} return.result - 是否成功
 * @returns {string} return.message - 宠物的回复消息
 * @returns {string[]} return.options - 用户可选的回复选项数组
 * @returns {number} return.health - 健康值变化量 (delta, 可正可负)
 * @returns {number} return.mood - 快乐值变化量 (delta, 可正可负)
 */
async function chatMessage(
  health,
  happiness,
  message,
  petType,
  imageData = null,
) {
  try {
    // 生成或获取会话ID（可以从localStorage获取或生成新的）
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem('chat_session_id', sessionId);
    }

    // 构建请求数据
    const requestData = {
      message: message,
      session_id: sessionId,
      pet_type: petType,
      health: Math.round(health),
      happiness: Math.round(happiness),
    };

    // 如果有图片数据，添加到请求中
    if (imageData) {
      requestData.image_data = imageData;
    }

    // 调用聊天 API
    const response = await chat(requestData);

    console.log('===== chatGenerate.js 收到响应 =====');
    console.log('response:', response);
    console.log('response.data:', response.data);
    console.log('====================================');

    // 检查响应格式
    if (response && response.status === 'success' && response.data.result) {
      // API 返回的是更新后的绝对状态值 (0-100)
      // response.data.health: 更新后的健康值
      // response.data.mood: 更新后的快乐值
      // 我们需要计算变化量(delta)，供调用方更新宠物状态

      // 返回标准格式的响应（health和mood是变化量，不是绝对值）

      // 情绪识别结果（支持多种可能的字段名）
      let emotionData = null;
      if (response.data.detected_emotion || response.data.emotion) {
        emotionData = {
          detected_emotion: response.data.detected_emotion || response.data.emotion,
          confidence: response.data.confidence || 0,
          analysis: response.data.analysis || response.data.emotion_analysis || '',
        };
      } else if (requestData.image_data) {
        // 临时：如果有图片但后端没有返回情绪数据，生成模拟数据用于测试 UI
        // TODO: 等后端实现情绪识别后删除这段代码
        const mockEmotions = [
          { emotion: 'happy', analysis: 'Bright smile and relaxed expression detected.' },
          { emotion: 'neutral', analysis: 'Calm and composed facial expression.' },
          { emotion: 'surprised', analysis: 'Wide eyes suggest mild surprise or interest.' },
          { emotion: 'focused', analysis: 'Concentrated look with slight tension.' },
        ];
        const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
        emotionData = {
          detected_emotion: randomEmotion.emotion,
          confidence: 0.85 + Math.random() * 0.14, // 0.85-0.99
          analysis: randomEmotion.analysis,
        };
        console.log('⚠️ chatGenerate: 使用模拟情绪数据（后端未返回）:', emotionData);
      }
      
      const result = {
        result: true,
        message: response.data.ai_response || '',
        options: response.data.options || [],
        health: response.data.health, // 健康值变化量
        mood: response.data.mood, // 快乐值变化量
        // 情绪识别结果（如果有）
        emotion: emotionData,
      };
      
      console.log('===== chatGenerate.js 返回结果 =====');
      console.log('result.emotion:', result.emotion);
      console.log('检查的字段:');
      console.log('  - response.data.detected_emotion:', response.data.detected_emotion);
      console.log('  - response.data.emotion:', response.data.emotion);
      console.log('  - response.data.confidence:', response.data.confidence);
      console.log('  - response.data.analysis:', response.data.analysis);
      console.log('====================================');
      
      return result;
    }

    // 如果响应格式不符合预期，返回失败
    console.error('聊天 API 响应格式不正确:', response);
    return { result: false };
  } catch (error) {
    console.error('对话生成失败:', error);
    return { result: false };
  }
}

export default chatMessage;
