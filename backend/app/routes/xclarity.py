from flask import Blueprint, jsonify, request
from app.services.xclarity_service import get_xclarity_alerts, get_gemini_recommendation

bp = Blueprint("xclarity", __name__, url_prefix="/api/xclarity")


@bp.route("/alerts", methods=["POST"])
def xclarity_alerts():
    data = request.get_json()
    host = data.get("host")
    username = data.get("username")
    password = data.get("password")

    alerts = get_xclarity_alerts(host, username, password)
    return jsonify(alerts)


@bp.route("/gemini", methods=["POST"])
def xclarity_gemini():
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        alert = data.get("data").get("alert")

        if alert:
            recommendation = get_gemini_recommendation(alert)
            print(f"Recommendation: {recommendation}")
            return jsonify({"recommendation": recommendation})
        else:
            print("Alert not found in request")
            return jsonify({"error": "Alert not found"}), 400
    except Exception as e:
        print(f"Error in xclarity_gemini: {str(e)}")
        return jsonify({"error": str(e)}), 500
