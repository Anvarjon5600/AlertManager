from flask import Blueprint, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from app.services.user_service import UserService
from datetime import timedelta

bp = Blueprint("users", __name__, url_prefix="/api/users")
CORS(bp)


@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    required_fields = ["name", "email", "password"]
    if not all(k in data for k in required_fields):
        return jsonify({"error": "Missing fields"}), 400

    # По умолчанию создаем user
    role = data.get("role", "user")

    # Если пытаемся создать admin - проверяем права
    if role == "admin":
        # Проверяем наличие заголовка Authorization
        if "Authorization" not in request.headers:
            return jsonify({"error": "Authorization required to create admin"}), 401

        try:
            # Извлекаем токен из заголовка
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"error": "Invalid authorization header"}), 401

            # Вручную проверяем токен
            from flask_jwt_extended import decode_token

            try:
                decoded_token = decode_token(auth_header[7:])  # Убираем 'Bearer '
                current_user_id = decoded_token["sub"]
                current_user = UserService.get_user_by_id(current_user_id)
                if current_user.get("role") != "admin":
                    return jsonify({"error": "Only admin can create admin users"}), 403
            except Exception as e:
                return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            return jsonify({"error": "Authorization error"}), 401

    try:
        user = UserService.create_user(
            name=data["name"], email=data["email"], pwd=data["password"], role=role
        )
        return (
            jsonify(
                {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                }
            ),
            201,
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not all(k in data for k in ("name", "password")):
        return jsonify({"error": "Missing fields"}), 400

    user = UserService.authenticate(data["name"], data["password"])
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    access = create_access_token(
        identity=str(user["id"]),
        expires_delta=timedelta(minutes=30),
    )
    refresh = create_refresh_token(
        identity=str(user["id"]), expires_delta=timedelta(days=7)
    )

    return (
        jsonify(
            {
                "access_token": access,
                "refresh_token": refresh,
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "password": user.get("password", None),
                    "role": user.get("role", "user"),
                },
            }
        ),
        200,
    )


@bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    newtok = create_access_token(identity=str(get_jwt_identity()))
    return jsonify({"access_token": newtok}), 200


@bp.route("/me", methods=["GET", "PUT"])
@jwt_required()
def me():
    uid = get_jwt_identity()

    if request.method == "GET":
        u = UserService.get_user_by_id(uid)
        return (jsonify(u), 200) if u else (jsonify({"error": "Not found"}), 404)

    if request.method == "PUT":
        data = request.get_json()
        # Обычные пользователи могут менять только эти поля
        allowed_fields = ["name", "email", "password"]
        updates = {k: v for k, v in data.items() if k in allowed_fields}

        try:
            u = UserService.update_user(int(uid), **updates)
            return jsonify(u), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 404


@bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_users():
    users = UserService.get_all_users()
    print(users)
    return (
        jsonify(
            [
                {
                    "id": u["id"],
                    "name": u["name"],
                    "email": u["email"],
                    "role": u["role"],
                }
                for u in users
            ]
        ),
        200,
    )


# Админский роут для удаление пользователя по ID
@bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user_by_id(user_id):
    current_user_id = get_jwt_identity()
    current_user = UserService.get_user_by_id(current_user_id)

    # Проверяем что текущий пользователь - admin
    if current_user.get("role") != "admin":
        return jsonify({"error": "Forbidden"}), 403

    try:
        UserService.delete_user(user_id)
        return jsonify({"message": "Deleted"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


# Админский роут для изменения пользователя
@bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = UserService.get_user_by_id(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    # Админ может редактировать любого, обычные пользователи - только себя
    if current_user.get("role") != "admin" and current_user_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    allowed_fields = ["name", "email", "password"]

    # Только admin может менять роль
    if current_user.get("role") == "admin":
        allowed_fields.append("role")

    updates = {k: v for k, v in data.items() if k in allowed_fields}

    try:
        updated_user = UserService.update_user(user_id, **updates)
        return jsonify(updated_user), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
