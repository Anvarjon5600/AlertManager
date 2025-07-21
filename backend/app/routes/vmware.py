from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.services.vmware_service import get_last_events
from app.services.gemini_service import gemini_recommendation

bp = Blueprint("vmware", __name__, url_prefix="/api/vmware")


@bp.route("/events", methods=["POST"])
@jwt_required()
def vmware_events():
    data = request.get_json()
    host = data.get("host")
    user = data.get("user")
    pwd = data.get("password")

    if not host or not user or not pwd:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        events = get_last_events(host, user, pwd, limit=100)
        return jsonify(events)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/gemini", methods=["POST"])
@jwt_required()
def vmware_gemini():
    try:
        data = request.get_json()
        alert = data.get("alert")
        if not alert:
            return jsonify({"error": "Alert not found"}), 400

        recommendation = gemini_recommendation(
            {
                "message": alert.get("msg", ""),
                "categories": alert.get("categories", []),
                "severity": alert.get("type", ""),
            }
        )
        return jsonify({"recommendation": recommendation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
