
# 🛎️ Alert Manager

Система для сбора, классификации и обработки уведомлений (алертов) с платформ VMware, Nutanix и XClarity.  
Генерирует AI-рекомендации (Google Gemini) и защищена через JWT.

---

## 📌 Основное

- **Мониторинг** → сбор событий с разных платформ  
- **Классификация**: Info / Warning / Error  
- **Рекомендации** через AI: `/gemini` endpoint  
- **JWT‑авторизация** на всех endpoints  
- Backend на Flask, frontend на React + MUI  
- Всё собрано и развёрнуто в Docker через один `docker-compose.yml`

---

## 🚀 Быстрый старт

```bash
git clone <repo-url>
```
```bash
cd <project-root>
```
```bash
docker-compose build
```
```bash
docker-compose up -d
