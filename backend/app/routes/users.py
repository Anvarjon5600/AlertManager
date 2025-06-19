from flask import Blueprint, jsonify, request
from app.services.user_service import load_users, save_users

bp = Blueprint("users", __name__, url_prefix="/api/users")


@bp.route("/", methods=["GET"])
def get_users():
    users = load_users()
    return jsonify(users)


@bp.route("/", methods=["POST"])
def add_user():
    data = request.get_json()
    users = load_users()
    new_user = {
        "id": len(users) + 1,
        "name": data["name"],
        "email": data["email"],
        "password": data["password"],
    }
    users.append(new_user)
    save_users(users)
    return jsonify(new_user), 201


@bp.route("/<int:id>", methods=["PUT"])
def update_user(id):
    data = request.get_json()
    users = load_users()
    updated_users = [
        (
            user
            if user["id"] != id
            else {
                "id": id,
                "name": data["name"],
                "email": data["email"],
                "password": data["password"],
            }
        )
        for user in users
    ]
    save_users(updated_users)
    return jsonify({"message": "User updated"})


@bp.route("/<int:id>", methods=["DELETE"])
def delete_user(id):
    users = load_users()
    updated_users = [user for user in users if user["id"] != id]
    save_users(updated_users)
    return jsonify({"message": "User deleted"})
