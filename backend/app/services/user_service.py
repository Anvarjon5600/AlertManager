import json
import os
from werkzeug.security import generate_password_hash, check_password_hash
from config.config import Config


class UserService:
    @staticmethod
    def _read_users():
        """Чтение пользователей из файла"""
        if not os.path.exists(Config.USERS_FILE):
            return []

        try:
            with open(Config.USERS_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    @staticmethod
    def _write_users(users):
        """Запись пользователей в файл"""
        with open(Config.USERS_FILE, "w") as f:
            json.dump(users, f, indent=2)

    @staticmethod
    def get_all_users():
        """Получение всех пользователей (без паролей)"""
        users = UserService._read_users()
        return users

    @staticmethod
    def create_user(name, email, password):
        """Создание нового пользователя"""
        users = UserService._read_users()

        if any(u["email"] == email for u in users):
            raise ValueError("Email already exists")

        new_user = {
            "id": len(users) + 1,
            "name": name,
            "email": email,
            "password": generate_password_hash(password),
        }

        users.append(new_user)
        UserService._write_users(users)
        return new_user

    @staticmethod
    def authenticate(email, password):
        """Аутентификация пользователя"""
        users = UserService._read_users()
        user = next((u for u in users if u["email"] == email), None)

        if user and check_password_hash(user["password"], password):
            return user
        return None

    @staticmethod
    def get_user_by_id(user_id):
        """Получение пользователя по ID"""
        users = UserService._read_users()
        user = next((u for u in users if u["id"] == user_id), None)
        if user:
            return {k: v for k, v in user.items() if k != "password"}
        return None

    @staticmethod
    def update_user(user_id, **kwargs):
        """Обновление данных пользователя"""
        users = UserService._read_users()
        user_index = next((i for i, u in enumerate(users) if u["id"] == user_id), None)

        if user_index is None:
            raise ValueError("User not found")

        if "password" in kwargs:
            kwargs["password"] = generate_password_hash(kwargs["password"])

        users[user_index].update(kwargs)
        UserService._write_users(users)
        return {k: v for k, v in users[user_index].items() if k != "password"}

    @staticmethod
    def delete_user(user_id):
        """Удаление пользователя"""
        users = UserService._read_users()
        updated_users = [u for u in users if u["id"] != user_id]

        if len(updated_users) == len(users):
            raise ValueError("User not found")

        UserService._write_users(updated_users)
