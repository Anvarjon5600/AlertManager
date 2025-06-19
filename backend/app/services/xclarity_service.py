import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
from app.services.gemini_service import model

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


def get_xclarity_alerts(host, username, password):
    try:
        url = f"https://{host}/events/activeAlerts"
        response = requests.get(url, auth=(username, password), verify=False)
        response.raise_for_status()
        print(response.json())
        print("request")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"error:{str(e)}")
        return {"error": str(e)}


def get_gemini_recommendation(alert):
    prompt = (
        f"Ты опытный администратор по XClarity. Дай рекомендацию короткий и по официальной документацией по этой алерту: {alert['msg']}, "
        f"он в таком состоянии: {alert['severityText']}. Его серийный номер: {alert['systemSerialNumberText']}."
    )
    try:
        response = model.generate_content(prompt)
        print(f"Gemini response: {response.text}")
        return response.text
    except Exception as e:
        print(f"Error in get_gemini_recommendation: {str(e)}")
        return f"Ошибка при получении рекомендации Gemini: {str(e)}"
