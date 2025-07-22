import google.generativeai as genai
from config.config import Config

genai.configure(api_key=Config.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")


def gemini_recommendation(alert):
    print(alert["message"])
    if not alert["message"] or "{" in alert["message"]:
        print("[INFO] Недостаточно данных для анализа...👀")
        return "Недостаточно данных для анализа"
    prompt = (
        f"Ты опытный администратор по {alert['platform']}. Дай рекомендацию короткий и по официальной документацией по этой алерту:\n\n , и приведи официальную документацию по этому алерту."
        f"Сообщение: {alert['message']}\nКатегория: {alert['categories']}\n"
        f"Severity: {alert['severity']}\n\nРекомендация:"
    )
    try:
        print("[INFO] Отправляем запрос в Google Gemini...✨")
        response = model.generate_content(prompt)
        return (
            response.text.strip()
            if response and response.text
            else "Ошибка запроса к ИИ"
        )
    except Exception as e:
        print(f"Ошибка Gemini: {str(e)}")
        return "Ошибка запроса к ИИ"
