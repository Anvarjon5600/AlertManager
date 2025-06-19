import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
from app.utils.safe_dict import SafeDict

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


def get_nutanix_alerts(vip, username, password):
    url = f"https://{vip}:9440/PrismGateway/services/rest/v1/alerts"
    response = requests.get(url, auth=(username, password), verify=False)
    print(f"[INFO] Запрос алертов с Nutanix {vip}...", response.status_code)
    if response.status_code != 200:
        raise Exception(f"Ошибка: {response.status_code} {response.text}")
    return response.json().get("entities", [])


def process_alert(alert):
    try:
        message_template = alert.get("message", "No message")
        context = dict(
            zip(alert.get("contextTypes", []), alert.get("contextValues", []))
        )
        message = message_template.format_map(SafeDict(context))
        categories = alert.get("categories", [])
        first_category = categories[0] if categories else ""
        severity = alert.get("severity", "").lstrip("k")
        id = alert.get("id", "")
        return {
            "message": message,
            "time": alert.get("createdTimeStampInUsecs", 0),
            "categories": first_category,
            "severity": severity,
            "id": id,
        }
    except Exception as e:
        print(f"Ошибка обработки алерта: {str(e)}")
        return {"message": "Ошибка", "time": 0, "categories": "", "severity": ""}
