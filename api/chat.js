// api/chat.js
// Использует OpenRouter — работает из России без VPN.
// Бесплатные модели: НЕ нужна кредитная карта.
// Модель meta-llama/llama-4-maverick:free — поддерживает текст + изображения (vision)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, system, hasImage } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  // Выбор модели:
  // Если в сообщении есть изображение — используем vision-модель (Llama 4 Maverick поддерживает vision)
  // Если только текст — используем Llama 4 Maverick (бесплатно, мощно)
  // Все модели ниже бесплатны и не требуют пополнения баланса
  const model = hasImage
    ? 'meta-llama/llama-4-maverick:free'   // vision + text, бесплатно
    : 'meta-llama/llama-4-maverick:free';  // текст, бесплатно

  // Если llama-4-maverick вдруг недоступна — запасные варианты:
  // 'deepseek/deepseek-chat-v3.1:free'         — мощный текстовый
  // 'qwen/qwen3-235b-a22b:free'                — отличное качество
  // 'meta-llama/llama-3.3-70b-instruct:free'   — стабильный

  const body = {
    model,
    max_tokens: 1200,
    temperature: 0.8,
    messages: [
      { role: 'system', content: system || 'You are a helpful assistant.' },
      ...messages
    ]
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nia-ai.vercel.app',  // замените на ваш домен
        'X-Title': 'Ниа AI'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter error:', JSON.stringify(data));

      // Если модель недоступна — пробуем запасную
      if (data.error?.code === 'model_not_available' || response.status === 429) {
        return res.status(503).json({ error: 'Модель временно перегружена, попробуй снова через секунду.' });
      }

      return res.status(500).json({ error: data.error?.message || 'Ошибка AI-сервиса' });
    }

    const text = data.choices?.[0]?.message?.content || 'Не удалось получить ответ.';
    return res.status(200).json({ text });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
