from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config.config import Config
from app.services.user_service import UserService


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.url_map.strict_slashes = False

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:3000", "*"],
                "supports_credentials": True,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Authorization", "Content-Type"],
                "max_age": 86400,
            }
        },
    )

    # Добавьте обработку OPTIONS для всех маршрутов
    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            return jsonify({"status": "ok"}), 200

    jwt = JWTManager(app)

    # ✅ Исправленный user_lookup_loader с обработкой отсутствия пользователя
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        try:
            identity = int(jwt_data["sub"])  # Преобразуем строку в число
            user = UserService.get_user_by_id(identity)
            if not user:
                app.logger.error(f"User {identity} not found")
                return None
            return user
        except (ValueError, TypeError) as e:
            app.logger.error(f"Invalid user ID format: {jwt_data['sub']}")
            return None

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(err):
        app.logger.error(f"Invalid token: {err}")
        return jsonify({"error": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(err):
        return jsonify({"error": "Missing authorization header"}), 401

    from app.routes.users import bp as users_bp

    app.register_blueprint(users_bp)
    from app.routes.nutanix import bp as nutanix_bp

    app.register_blueprint(nutanix_bp)
    from app.routes.xclarity import bp as xclarity_bp

    app.register_blueprint(xclarity_bp)
    from app.routes.vmware import bp as vmware_bp

    app.register_blueprint(vmware_bp)

    return app
