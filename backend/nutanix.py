from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
import openpyxl
import google.generativeai as genai
import smtplib
import time
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime, timezone
from dotenv import load_dotenv
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

# Загрузка переменных окружения
load_dotenv()

# Устанавливаем API-ключ для Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise Exception("GEMINI_API_KEY не задан. Проверьте файл .env.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# Отключение предупреждений о сертификатах
from requests.packages.urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

class SafeDict(dict):
    def __missing__(self, key):
        return "{" + key + "}"

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех доменов (для разработки)

#! Users API
USERS_FILE = 'users.json'


def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

@app.route('/api/users', methods=['GET'])
def get_users():
    users = load_users()
    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()
    users = load_users()
    new_user = {
        'id': len(users) + 1,
        'name': data['name'],
        'email': data['email'],
        'password': data['password']
    }
    users.append(new_user)
    save_users(users)
    return jsonify(new_user), 201

@app.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.get_json()
    users = load_users()
    updated_users = [user if user['id'] != id else {
        'id': id,
        'name': data['name'],
        'email': data['email'],
        'password': data['password']
    } for user in users]
    save_users(updated_users)
    return jsonify({'message': 'User updated'})

@app.route('/api/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    users = load_users()
    updated_users = [user for user in users if user['id'] != id]
    save_users(updated_users)
    return jsonify({'message': 'User deleted'})    


#! Nutanix API
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
        context = dict(zip(alert.get("contextTypes", []), alert.get("contextValues", [])))
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

def gemini_recommendation(alert):
    print(alert["message"])
    if not alert["message"] or "{" in alert["message"]:
        print("[INFO] Недостаточно данных для анализа...👀")
        return "Недостаточно данных для анализа"
    prompt = (
        "Ты опытный администратор по Nutanix. Дай рекомендацию короткий и по официальной документацией по этой алерту:\n\n , и приведи официальную документацию по этому алерту."
        f"Сообщение: {alert['message']}\nКатегория: {alert['categories']}\n"
        f"Severity: {alert['severity']}\n\nРекомендация:"
    )
    try:
        print("[INFO] Отправляем запрос в Google Gemini...✨")
        print(GEMINI_API_KEY, "GEMINI_API_KEY")
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        return response.text.strip() if response and response.text else "Ошибка запроса к ИИ"
    except Exception as e:
        print(f"Ошибка Gemini: {str(e)}")
        return "Ошибка запроса к ИИ"



@app.route('/api/alerts', methods=['POST'])
def get_alerts():
    data = request.get_json()
    vip = data.get('vip')
    username = data.get('username')
    password = data.get('password')

    try:
        alerts = get_nutanix_alerts(vip, username, password)
        unresolved_alerts = [process_alert(alert) for alert in alerts if not alert.get("resolved", False)]
        return jsonify(unresolved_alerts)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/nutanix/gemini', methods=['POST'])  # Измененный маршрут
def nutanix_gemini():
    data = request.get_json()
    alert = data.get('alert')  # Получаем алерт из тела запроса

    if alert:
        try:
            print(f"Обработка алерта: {alert}")
            recommendation = gemini_recommendation(alert)
            return jsonify({'recommendation': recommendation})
        except Exception as e:
            return jsonify({'error': f'Ошибка обработки алерта: {str(e)}'}), 500
    else:
        return jsonify({'error': 'Alert not found in request'}), 400

#! XClarity API

def get_xclarity_alerts(host, username, password):
    try:
        url = f"https://{host}/events/activeAlerts"
        response = requests.get(url, auth=(username, password), verify=False)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {'error': str(e)}

# Функция для получения рекомендации Gemini
def get_gemini_recommendation(alert):
    prompt = f"Ты опытный администратор по XClarity. Дай рекомендацию короткий и по официальной документацией по этой алерту: {alert['msg']},он в таком состоянии: {alert['severityText']}. Его сирения номер: {alert['systemSerialNumberText']}."
    try:
        response = model.generate_content(prompt)
        print(f"Gemini response: {response.text}")
        return response.text
    except Exception as e:
        print(f"Error in get_gemini_recommendation: {str(e)}")
        return f"Ошибка при получении рекомендации Gemini: {str(e)}"

@app.route('/api/xclarity/alerts', methods=['POST'])
def xclarity_alerts():
    data = request.get_json()
    host = data.get('host')
    username = data.get('username')
    password = data.get('password')

    alerts = get_xclarity_alerts(host, username, password)
    return jsonify(alerts)

@app.route('/api/xclarity/gemini', methods=['POST'])
def xclarity_gemini():
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        alert = data.get('data').get('alert')

        if alert:
            recommendation = get_gemini_recommendation(alert)
            print(f"Recommendation: {recommendation}")
            return jsonify({'recommendation': recommendation})
        else:
            print("Alert not found in request")
            return jsonify({'error': 'Alert not found'}), 400
    except Exception as e:
        print(f"Error in xclarity_gemini: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) # Запускаем Flask на порту 5000