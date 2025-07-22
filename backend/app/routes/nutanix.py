from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.services.alert_processing import get_nutanix_alerts, process_alert
from app.services.gemini_service import gemini_recommendation

bp = Blueprint("nutanix", __name__, url_prefix="/api/nutanix")


@bp.route("/alerts", methods=["POST"])
@jwt_required()
def get_alerts():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    data = request.get_json()
    vip = data.get("vip")
    username = data.get("username")
    password = data.get("password")

    try:
        alerts = get_nutanix_alerts(vip, username, password)
        unresolved_alerts = [
            process_alert(alert) for alert in alerts if not alert.get("resolved", False)
        ]
        return jsonify(unresolved_alerts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/gemini", methods=["POST"])
@jwt_required()
def nutanix_gemini():
    data = request.get_json()
    alert = data.get("alert")
    if not alert:
        return jsonify({"error": "Alert not found"}), 400

    try:
        recommendation = gemini_recommendation(
            {
                "message": alert.get("msg", alert.get("message", "")),
                "categories": alert.get("categories", []),
                "severity": alert.get("severity", alert.get("type", "")),
                "platform": "Nutanix",
            }
        )
        return jsonify({"recommendation": recommendation})  
    except Exception as e:
        return jsonify({"error": f"Ошибка обработки alert: {str(e)}"}), 500
