from flask import Blueprint, jsonify, request
from app.services.alert_processing import get_nutanix_alerts, process_alert
from app.services.gemini_service import gemini_recommendation

bp = Blueprint("nutanix", __name__, url_prefix="/api/nutanix")


@bp.route("/alerts", methods=["POST"])
def get_alerts():
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
def nutanix_gemini():
    data = request.get_json()
    alert = data.get("alert")

    if alert:
        try:
            recommendation = gemini_recommendation(alert)
            return jsonify({"recommendation": recommendation})
        except Exception as e:
            return jsonify({"error": f"Ошибка обработки алерта: {str(e)}"}), 500
    else:
        return jsonify({"error": "Alert not found in request"}), 400
