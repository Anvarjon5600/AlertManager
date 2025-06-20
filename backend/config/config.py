import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()


class Config:
    # Безопасность
    # SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(32).hex())
    # JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", os.urandom(32).hex())

    SECRET_KEY = os.getenv("SECRET_KEY", "1ED4AB70E7E4FA5A1B5C88DF46FC66F2")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "6D84E68F0A918A551A55155FC1AFDC30")

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    USERS_FILE = "data/users.json"

    # Security Headers
    CSP = {
        "default-src": "'self'",
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
    }
