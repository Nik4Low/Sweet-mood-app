# Сладость по настроению

Telegram Mini App: каталог сладостей + анализ настроения через Groq (llama-3.1-8b-instant) + рекомендации.

## Стек

- Vue 3 + Vite
- Telegram Web App SDK + CloudStorage
- Cloudflare Worker (прокси к Groq)
- GitHub Pages

## Быстрый старт (разработка на Windows)

### 1. Frontend

```powershell
cd PhoneProg
npm install
copy .env.example .env
# Отредактируйте .env — укажите VITE_WORKER_URL после деплоя Worker
npm run dev
```

Откройте http://localhost:5173 (вне Telegram UI будет работать, CloudStorage — fallback на localStorage).

### 2. Cloudflare Worker

```powershell
cd worker
wrangler secret put GROQ_API_KEY
# Вставьте ключ из https://console.groq.com
wrangler deploy
```

После деплоя скопируйте URL вида `https://sweet-mood-proxy.<account>.workers.dev/mood` в `.env`:

```
VITE_WORKER_URL=https://sweet-mood-proxy.<account>.workers.dev/mood
```

### 3. GitHub Pages

1. Создайте репозиторий и запушьте код.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. **Settings → Secrets and variables → Actions → Variables**:
   - `VITE_WORKER_URL` = URL Worker из шага 2
4. Push в `main` — workflow соберёт и задеплоит сайт.

URL приложения: `https://<username>.github.io/<repo-name>/`

### 4. Telegram Bot (BotFather)

1. Откройте [@BotFather](https://t.me/BotFather)
2. Выберите бота → **Bot Settings** → **Menu Button** → **Configure menu button**
3. Укажите URL: `https://<username>.github.io/<repo-name>/`
4. Или: `/newapp` → привязать Mini App к боту

Откройте бота в Telegram → кнопка меню (☰) → Mini App.

## Структура

```
src/           — Vue Mini App
worker/        — Cloudflare Worker (Groq proxy)
.github/       — GitHub Actions deploy
```

## Экраны

1. **Сладости** — CRUD каталога (название, описание, теги)
2. **Настроение** — текст → Groq → mood + tags
3. **Итог** — топ-3 рекомендации

## Переменные окружения

| Файл / место | Переменная | Описание |
|--------------|------------|----------|
| `.env` | `VITE_WORKER_URL` | URL Worker endpoint `/mood` |
| Cloudflare Secret | `GROQ_API_KEY` | Ключ Groq API |
| GitHub Actions Variable | `VITE_WORKER_URL` | То же для CI-сборки |

## Локальная проверка Worker

```powershell
cd worker
wrangler dev
# VITE_WORKER_URL=http://127.0.0.1:8787/mood
```

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| CORS error | Worker не задеплоен или неверный `VITE_WORKER_URL` |
| 429 от Groq | Подождите минуту (free tier limit) |
| Пустой каталог после перезапуска | Открывайте через Telegram (CloudStorage) |
| Mini App не открывается | URL должен быть HTTPS; проверьте Menu Button в BotFather |

## Лицензия

Личный проект — используйте свободно.
