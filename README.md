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

## Деплой на GitHub Pages (автоматически)

После push в `main` срабатывает GitHub Actions. **Один раз** добавьте секрет:

1. [Sweet-mood-app → Settings → Secrets → Actions](https://github.com/Nik4Low/Sweet-mood-app/settings/secrets/actions)
2. **New repository secret**
   - Name: `VITE_GROQ_API_KEY`
   - Value: ваш ключ с [console.groq.com](https://console.groq.com)
3. [Settings → Pages](https://github.com/Nik4Low/Sweet-mood-app/settings/pages) → **Source: GitHub Actions**
4. **Actions** → workflow **Deploy to GitHub Pages** → **Run workflow**

URL приложения: **https://nik4low.github.io/Sweet-mood-app/**

> GitHub блокирует push, если ключ попадает в git напрямую. Секрет Actions безопаснее: ключ вшивается только при сборке на серверах GitHub.

### Cloudflare Worker (опционально)

Если подтвердите email в Cloudflare, можно спрятать ключ в Worker:

```powershell
cd worker
wrangler secret put GROQ_API_KEY
wrangler deploy
```

Тогда в Secrets Actions добавьте Variable `VITE_WORKER_URL` вместо ключа Groq.

## Inline-режим (@бот в любом чате)

Пишите в **любом чате** (с другом, в группе):

```text
@SM4LVBot устал, хочу сладкое
```

или просто:

```text
@SM4LVBot mood
```

Выберите карточку → в чат отправится сообщение с кнопкой **«Открыть приложение»**.

### Настройка (один раз)

1. **BotFather** → ваш бот → `/setinline` → включить inline  
   Placeholder: `mood, устал, сладость...`

2. **Cloudflare Worker** — секреты и деплoy:

```powershell
cd worker
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put GROQ_API_KEY
wrangler deploy
```

3. **Webhook** (подставьте URL после deploy):

```powershell
$env:TELEGRAM_BOT_TOKEN="ваш_токен"
node scripts/set-webhook.mjs https://sweet-mood-proxy.<account>.workers.dev/telegram-webhook
```

4. Проверка: в любом чате `@ВАШ_БОТ test` — должна появиться карточка.

Текст после `@бота` передаётся в Mini App на вкладку «Настроение».

#### Вариант A: Cloudflare Worker (если email подтверждён)

См. команды выше (`wrangler deploy`).

#### Вариант B: Vercel (если Cloudflare не пускает)

1. Зарегистрируйтесь на [vercel.com](https://vercel.com), импортируйте репозиторий `Sweet-mood-app`
2. **Settings → Environment Variables**:
   - `TELEGRAM_BOT_TOKEN` — токен бота
   - `MINI_APP_URL` — `https://nik4low.github.io/Sweet-mood-app/`
3. Deploy → URL будет `https://your-project.vercel.app`
4. Webhook:

```powershell
$env:TELEGRAM_BOT_TOKEN="ваш_токен"
node worker/scripts/set-webhook.mjs https://your-project.vercel.app/api/telegram-webhook
```

---

### 4. Telegram Bot (BotFather)

1. Откройте [@BotFather](https://t.me/BotFather)
2. Выберите бота → **Bot Settings** → **Menu Button** → **Configure menu button**
3. Укажите URL: `https://<username>.github.io/<repo-name>/`
4. Или: `/newapp` → привязать Mini App к боту

Откройте бота в Telegram → кнопка меню (☰) → Mini App.

## Структура

```
src/           — Vue Mini App
worker/        — Cloudflare Worker (Groq + Telegram inline webhook)
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
| Cloudflare Secret | `TELEGRAM_BOT_TOKEN` | Токен бота для inline webhook |
| Cloudflare Var | `MINI_APP_URL` | URL Mini App (в wrangler.toml) |

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
| Inline @бот не отвечает | `/setinline` в BotFather + webhook + `TELEGRAM_BOT_TOKEN` в Worker |

## Лицензия

Личный проект — используйте свободно.
