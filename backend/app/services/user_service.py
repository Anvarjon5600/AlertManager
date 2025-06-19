import json
import os
from config.config import Config


def load_users():
    if not os.path.exists(Config.USERS_FILE):
        return []

    try:
        with open(Config.USERS_FILE, "r") as f:
            content = f.read()
            if not content.strip():  # Если файл пустой
                return []
            return json.loads(content)
    except json.JSONDecodeError:
        return []  # Возвращаем пустой список при невалидном JSON
    except Exception as e:
        print(f"Error loading users: {str(e)}")
        return []


def save_users(users):
    with open(Config.USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)
