from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    current_user,
)
from app.services.user_service import UserService
from datetime import timedelta

bp = Blueprint("users", __name__, url_prefix="/api/users")


# Регистрация нового пользователя
@bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not all(k in data for k in ["name", "email", "password"]):
            return jsonify({"error": "Missing required fields"}), 400

        user = UserService.create_user(
            name=data["name"], email=data["email"], password=data["password"]
        )
        return (
            jsonify({"id": user["id"], "name": user["name"], "email": user["email"]}),
            201,
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Registration failed"}), 500


# Аутентификация
@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not all(k in data for k in ["name", "password"]):
        return jsonify({"error": "Missing name or password"}), 400

    user = UserService.authenticate(name=data["name"], password=data["password"])

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=user["id"],
        expires_delta=timedelta(minutes=15),
        additional_claims={"role": "user"},
    )
    refresh_token = create_refresh_token(
        identity=user["id"], expires_delta=timedelta(days=7)
    )

    return (
        jsonify(
            {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                },
            }
        ),
        200,
    )


# Обновление токена
@bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_token = create_access_token(identity=user_id)
    return jsonify(access_token=new_token), 200


# Получение текущего пользователя
@bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = UserService.get_user_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return (
        jsonify({"id": user["id"], "name": user["name"], "email": user["email"]}),
        200,
    )


# Обновление текущего пользователя
@bp.route("/me", methods=["PUT"])
@jwt_required()
def update_current_user():
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        # Разрешаем обновлять только определенные поля
        update_data = {
            k: v for k, v in data.items() if k in ["name", "email", "password"]
        }

        user = UserService.update_user(user_id, **update_data)
        return (
            jsonify({"id": user["id"], "name": user["name"], "email": user["email"]}),
            200,
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Update failed"}), 500


# Удаление текущего пользователя
@bp.route("/me", methods=["DELETE"])
@jwt_required()
def delete_current_user():
    user_id = get_jwt_identity()

    try:
        UserService.delete_user(user_id)
        return jsonify({"message": "User deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Deletion failed"}), 500


# Админские роуты (требуют проверки ролей)
@bp.route("/", methods=["GET"])
@jwt_required()
def get_all_users():
    try:
        # В реальном приложении нужно проверять роль пользователя
        users = UserService.get_all_users()
        return (
            jsonify(
                [{"id": u["id"], "name": u["name"], "email": u["email"]} for u in users]
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Failed to fetch users"}), 500


@bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    try:
        user = UserService.get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return (
            jsonify({"id": user["id"], "name": user["name"], "email": user["email"]}),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Failed to fetch user"}), 500
