# 情绪识别功能 - 后端实现要求

## 📋 概述

前端已经完成了情绪识别结果的展示功能，现在需要后端在 `/llm/chat/` API 中返回情绪识别数据。

## 🔧 当前状态

- ✅ 前端已实现情绪识别 UI 展示（图片分析窗口和聊天窗口）
- ❌ 后端尚未返回情绪识别数据（所有字段都是 `undefined`）
- 🔄 前端临时使用模拟数据进行测试

## 📤 后端需要返回的数据结构

### API 端点
`POST /llm/chat/`

### 请求示例（带图片）
```json
{
  "message": "Analyze this image and tell me what you see",
  "session_id": "feed_session",
  "pet_type": "fox",
  "health": 87,
  "happiness": 91,
  "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### 响应结构要求

后端需要在 `data` 对象中添加以下字段：

```json
{
  "status": "success",
  "data": {
    "result": true,
    "ai_response": "Cool cardboard models! Your creativity shines.",
    "options": ["Thanks!", "Tell me more", "What else?"],
    "health": 87,
    "mood": 91,
    
    // ⭐ 新增：情绪识别字段
    "detected_emotion": "happy",      // 检测到的情绪（字符串）
    "confidence": 0.94,                // 置信度（0-1 之间的浮点数）
    "analysis": "Subtle smile suggests calm contentment."  // 情绪分析描述
  }
}
```

## 📊 字段说明

### 1. `detected_emotion` (必需)
- **类型**: `string`
- **说明**: 检测到的情绪类型
- **常见值**: 
  - `"happy"` - 快乐
  - `"sad"` - 悲伤
  - `"neutral"` - 中性
  - `"surprised"` - 惊讶
  - `"angry"` - 生气
  - `"focused"` - 专注
  - `"confused"` - 困惑
- **示例**: `"happy"`

### 2. `confidence` (必需)
- **类型**: `float`
- **范围**: `0.0` - `1.0`
- **说明**: 情绪识别的置信度
- **示例**: `0.94` (94% 的置信度)

### 3. `analysis` (必需)
- **类型**: `string`
- **说明**: 对情绪的简短分析描述（建议 10-30 个英文单词）
- **示例**: `"Subtle smile suggests calm contentment."`

## 🎯 触发条件

只有当请求中包含 `image_data` 字段（即用户上传了照片）时，才需要返回情绪识别数据。

- ✅ 有 `image_data` → 返回情绪识别字段
- ❌ 无 `image_data` → 不返回情绪识别字段（前端会自动处理）

## 🖼️ 前端展示效果

### 图片分析窗口 (ANALYSIS.EXE)
```
Content: Cardboard models scattered: Creative chaos or fox's hidden hunt?
Status: I don't like it...
━━━ Emotion Detected ━━━
Emotion: happy
Confidence: 94.0%
Subtle smile suggests calm contentment.
Effects:
Mood: -10
Health: 0
```

### 聊天窗口 (CHAT.EXE)
在 AI 回复下方显示带有紫色边框的情绪识别卡片：
```
━━━ 情绪识别 ━━━
情绪: happy
置信度: 94.0%
Subtle smile suggests calm contentment.
```

## 🔍 技术实现建议

### 推荐的情绪识别 API

1. **Azure Face API**
   - 支持情绪识别
   - 返回 8 种情绪及置信度
   
2. **Google Cloud Vision API**
   - Face Detection 功能
   - 支持 joy, sorrow, anger, surprise 等情绪
   
3. **DeepFace (Python 库)**
   ```python
   from deepface import DeepFace
   result = DeepFace.analyze(img_path, actions=['emotion'])
   ```

4. **OpenCV + 预训练模型**
   - 使用 Haar Cascade 检测人脸
   - 使用 CNN 模型识别情绪

### 示例实现 (Python + DeepFace)

```python
from deepface import DeepFace
import base64
import io
from PIL import Image

def analyze_emotion(image_data_base64):
    """
    分析 base64 图片中的情绪
    
    Args:
        image_data_base64: base64 编码的图片数据
        
    Returns:
        dict: 包含 detected_emotion, confidence, analysis
    """
    try:
        # 解码 base64 图片
        image_data = base64.b64decode(image_data_base64.split(',')[1])
        image = Image.open(io.BytesIO(image_data))
        
        # 使用 DeepFace 分析情绪
        result = DeepFace.analyze(image, actions=['emotion'], enforce_detection=False)
        
        # 获取主导情绪
        emotions = result[0]['emotion']
        dominant_emotion = result[0]['dominant_emotion']
        confidence = emotions[dominant_emotion] / 100.0
        
        # 生成分析描述
        analysis = generate_emotion_analysis(dominant_emotion, confidence)
        
        return {
            "detected_emotion": dominant_emotion,
            "confidence": confidence,
            "analysis": analysis
        }
    except Exception as e:
        print(f"情绪识别失败: {e}")
        return None

def generate_emotion_analysis(emotion, confidence):
    """根据情绪生成描述"""
    descriptions = {
        "happy": "Bright smile and relaxed expression detected.",
        "sad": "Downcast eyes and slight frown observed.",
        "neutral": "Calm and composed facial expression.",
        "angry": "Furrowed brows and tense jaw muscles.",
        "surprise": "Wide eyes and raised eyebrows detected.",
        "fear": "Widened eyes with tension in facial muscles.",
        "disgust": "Wrinkled nose and narrowed eyes observed."
    }
    return descriptions.get(emotion, "Facial expression analyzed.")
```

### 在 Django 视图中集成

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def chat_api(request):
    data = request.data
    image_data = data.get('image_data')
    
    # ... 其他处理逻辑 ...
    
    response_data = {
        "result": True,
        "ai_response": "...",
        "options": [...],
        "health": health_value,
        "mood": mood_value
    }
    
    # 如果有图片数据，进行情绪识别
    if image_data:
        emotion_result = analyze_emotion(image_data)
        if emotion_result:
            response_data.update({
                "detected_emotion": emotion_result["detected_emotion"],
                "confidence": emotion_result["confidence"],
                "analysis": emotion_result["analysis"]
            })
    
    return Response({
        "status": "success",
        "data": response_data
    })
```

## 🧪 测试步骤

1. **启动后端服务**
2. **在前端上传包含人脸的照片**
3. **检查浏览器控制台**，应该看到：
   ```
   ===== 图片分析完整响应 =====
   detected_emotion: "happy"
   confidence: 0.94
   analysis: "Subtle smile suggests calm contentment."
   ```
4. **检查前端 UI**，应该在 ANALYSIS.EXE 窗口中看到情绪识别信息

## ⚠️ 注意事项

1. **性能考虑**: 情绪识别可能需要 1-3 秒，确保设置合理的超时时间
2. **错误处理**: 如果图片中没有检测到人脸，可以不返回情绪字段或返回 null
3. **隐私保护**: 确保图片数据仅用于分析，不存储或传输到第三方（除非必要）
4. **成本控制**: 如果使用付费 API，注意调用频率限制

## 📝 当前临时方案

前端目前使用模拟数据来测试 UI，代码位于：
- `src/components/DigitalPet.jsx` (第 329-344 行)
- `src/utils/chatGenerate.js` (第 77-92 行)

⚠️ **一旦后端实现了情绪识别功能，这些模拟数据代码应该被删除。**

查找标记: `TODO: 等后端实现情绪识别后删除这段代码`

## 📞 联系方式

如有问题，请联系前端开发团队。

---

**最后更新**: 2025-11-04
**状态**: 等待后端实现

