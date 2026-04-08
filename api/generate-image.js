// api/generate-image.js
// Pollinations.ai — полностью бесплатная генерация изображений.
// НЕ нужен API-ключ вообще. Работает из России без VPN.
// Без лимитов. Качество — стабильный Flux/SDXL.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  try {
    const seed = Math.floor(Math.random() * 2147483647);
    // Усиливаем промпт для лучшего результата
    const enhanced = `${prompt}, high quality, detailed, artistic, beautiful lighting, 8k`;
    const encoded  = encodeURIComponent(enhanced);

    // Pollinations.ai генерирует изображение по URL — просто отдаём URL браузеру
    // Браузер пользователя сам загрузит картинку напрямую с Pollinations
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true&model=flux`;

    return res.status(200).json({ url });

  } catch (err) {
    console.error('Image gen error:', err);
    return res.status(500).json({ error: 'Ошибка генерации' });
  }
}
