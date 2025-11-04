async function analyzeImage(base64Image, petType) {
    try {
      const response = await fetch('https://chat-gpt-4-turbo1.p.rapidapi.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': '031b5df5d1mshe7a3df6102728cep144387jsnc2ed3ac026e6',
          'x-rapidapi-host': 'chat-gpt-4-turbo1.p.rapidapi.com',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `As a ${petType} virtual pet, I will analyze the image and return the required fields in JSON format based on the information you need. Translate into English and respond entirely in English：1.The content of the image 2.Whether the pet likes it 3.The specific reason for liking or not liking it (give a witty and humorous reason in 10 words) 4.The impact of this item on the pet mood (positive or negative number) 5.The impact of this item on the pet health (positive or negative number). The specific format is as follows：{result: true, name: The content of the recognized image, isLike: Whether it is liked, reason: The reason for liking or disliking (brief), moodEffect: Happiness impact, healthEffect: Health impact}`
                },
                {
                  type: 'image_url',
                  image_url: base64Image
                }
              ]
            }
          ]
        })
      });
  
      const data = await response.json();
      let content = data.choices[0].message.content;
      // 移除 ```json 和 ``` 标记
      content = content.replace(/```json\s*/, '').replace(/```\s*$/, '');
  
      // 解析清理后的 JSON
      const parsedContent = JSON.parse(content);
      
      // 如果包含情绪识别结果，添加到返回对象中
      if (parsedContent.detected_emotion) {
        parsedContent.emotion = {
          detected_emotion: parsedContent.detected_emotion,
          confidence: parsedContent.confidence,
          analysis: parsedContent.analysis,
        };
      }
      
      return parsedContent;
    } catch (error) {
      console.error('图片分析失败:', error);
      return null;
    }
  }
  
  export default analyzeImage;
  