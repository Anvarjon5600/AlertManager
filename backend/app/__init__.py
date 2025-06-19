from flask import Flask
from flask_cors import CORS
from config.config import Config


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)

    # Инициализация маршрутов
    from app.routes import users, nutanix, xclarity

    app.register_blueprint(users.bp)
    app.register_blueprint(nutanix.bp)
    app.register_blueprint(xclarity.bp)  # Добавлено

    return app
