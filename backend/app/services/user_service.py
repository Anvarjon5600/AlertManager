import json, os
from werkzeug.security import generate_password_hash, check_password_hash
from config.config import Config
import datetime


class UserService:
    @staticmethod
    def _read():
        if not os.path.exists(Config.USERS_FILE):
            return []
        try:
            return json.load(open(Config.USERS_FILE))
        except:
            return []

    @staticmethod
    def _write(u):
        json.dump(u, open(Config.USERS_FILE, "w"), indent=2)

    @classmethod
    def get_all_users(cls):
        return cls._read()

    @classmethod
    def create_user(cls, name, email, pwd, role="user"):
        if role not in ["user", "admin"]:  # Валидация роли
            raise ValueError("Invalid role")

        u = cls._read()
        if any(x["email"] == email for x in u):
            raise ValueError("Email exists")

        new = {
            "id": len(u) + 1,
            "name": name,
            "email": email,
            "password": generate_password_hash(pwd),
            "role": role,
            "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
        }
        u.append(new)
        cls._write(u)
        return new

    @classmethod
    def authenticate(cls, name, pwd):
        u = cls._read()
        user = next((x for x in u if x["name"] == name), None)
        if user and check_password_hash(user["password"], pwd):
            return user
        return None

    @classmethod
    def get_user_by_id(cls, uid):
        users = cls._read()
        user = next((x for x in users if x["id"] == int(uid)), None)  # Приводим к int
        return {k: v for k, v in user.items() if k != "password"} if user else None

    @classmethod
    def update_user(cls, uid, **kw):
        u = cls._read()
        idx = next((i for i, x in enumerate(u) if x["id"] == uid), None)
        if idx is None:
            raise ValueError("User not found")
        if "password" in kw:
            kw["password"] = generate_password_hash(kw["password"])
        u[idx].update(kw)
        cls._write(u)
        return {k: v for k, v in u[idx].items() if k != "password"}

    @classmethod
    def delete_user(cls, uid):
        u = cls._read()
        user_to_delete = next((x for x in u if x["id"] == int(uid)), None)

        if not user_to_delete:
            raise ValueError("User not found")

        # Не позволяем удалить последнего admin
        if user_to_delete.get("role") == "admin":
            admin_count = sum(1 for user in u if user.get("role") == "admin")
            if admin_count <= 1:
                raise ValueError("Cannot delete the last admin")

        cls._write([user for user in u if user["id"] != int(uid)])
