from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.services.xclarity_service import get_xclarity_alerts
from app.services.gemini_service import gemini_recommendation

bp = Blueprint("xclarity", __name__, url_prefix="/api/xclarity")


@bp.route("/alerts", methods=["POST"])
@jwt_required()
def xclarity_alerts():
    data = request.get_json()
    host = data.get("host")
    username = data.get("username")
    password = data.get("password")

    alerts = get_xclarity_alerts(host, username, password)
    return jsonify(alerts)


@bp.route("/gemini", methods=["POST"])
@jwt_required()
def xclarity_gemini():
    data = request.get_json()
    alert = data.get("alert") or data.get("data", {}).get("alert")
    if not alert:
        return jsonify({"error": "Alert not found"}), 400

    recommendation = gemini_recommendation(
        {
            "message": alert.get("msg", alert.get("message", "")),
            "categories": alert.get("categories", []),
            "severity": alert.get("severity", alert.get("type", "")),
            "platform": "XClarity",
        }
    )
    return jsonify({"recommendation": recommendation})
