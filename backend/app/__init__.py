from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from config.config import Config


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    # CORS (настройте под свои нужды)
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["*"],
                "methods": ["GET", "POST", "PUT", "DELETE"],
                "allow_headers": ["Authorization", "Content-Type"],
            }
        },
    )

    # JWT
    jwt = JWTManager(app)

    # Обработчики ошибок JWT
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Missing authorization header"}), 401


    # Инициализация маршрутов
    from app.routes import users, nutanix, xclarity

    app.register_blueprint(users.bp)
    app.register_blueprint(nutanix.bp)
    app.register_blueprint(xclarity.bp)  

    return app
