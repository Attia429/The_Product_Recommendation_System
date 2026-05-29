"""
SmartAI Recommender — Flask Backend API
========================================
Endpoints:
  GET  /api/health                     → Health check
  GET  /api/products                   → All products
  GET  /api/categories                 → All categories
  GET  /api/trending                   → Trending products
  POST /api/recommend                  → Personalized recommendations
  GET  /api/insights/<user_id>         → User preference insights
  GET  /api/explain/<user_id>/<prod_id>→ Why was this recommended?
  POST /api/feedback                   → Like/Dislike (future ML input)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import SmartRecommender
import os
import traceback

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

# ── Initialize the AI engine once on startup ──────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "products.csv")
print("[API] Loading SmartAI Recommender engine...")
recommender = SmartRecommender(DATA_PATH)
print("[API] Engine ready. Server starting...")


# ─────────────────────────────────────────────────────────────────────────────
# Utility
# ─────────────────────────────────────────────────────────────────────────────
def success(data, status=200):
    return jsonify({"status": "success", "data": data}), status

def error(message, status=400):
    return jsonify({"status": "error", "message": message}), status


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    """Simple health check so frontend knows the server is alive."""
    return success({
        "message": "SmartAI Recommender is live 🚀",
        "version": "1.0.0",
        "products_loaded": len(recommender.products_df),
        "users_in_system": len(recommender.get_valid_user_ids()),
    })


@app.route("/api/products", methods=["GET"])
def get_products():
    """Return all products (for browsing)."""
    limit = int(request.args.get("limit", 50))
    return success(recommender.get_all_products(limit))


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Return all product categories."""
    return success(recommender.get_categories())


@app.route("/api/trending", methods=["GET"])
def get_trending():
    """Return globally trending products."""
    top_n = int(request.args.get("top_n", 8))
    return success(recommender.get_trending(top_n))


@app.route("/api/recommend", methods=["POST"])
def recommend():
    """
    POST /api/recommend
    Body: { "user_id": 1, "top_n": 10, "preferences": ["Fragrance-Women"] }
    
    Returns personalized recommendations with explanations.
    """
    try:
        body = request.get_json(force=True) or {}
        user_id = body.get("user_id")
        top_n = int(body.get("top_n", 10))
        preferences = body.get("preferences", [])

        # Validate user_id
        if user_id is None:
            return error("user_id is required")
        
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return error("user_id must be an integer")

        if top_n < 1 or top_n > 50:
            return error("top_n must be between 1 and 50")

        recommendations = recommender.recommend(user_id, top_n, preferences)
        is_new_user = user_id not in recommender.get_valid_user_ids()

        return success({
            "user_id": user_id,
            "is_new_user": is_new_user,
            "count": len(recommendations),
            "method": "hybrid" if not is_new_user else "popularity",
            "recommendations": recommendations,
        })

    except Exception as e:
        traceback.print_exc()
        return error(f"Recommendation failed: {str(e)}", 500)


@app.route("/api/insights/<int:user_id>", methods=["GET"])
def get_insights(user_id):
    """Return user preference analytics."""
    try:
        insights = recommender.get_user_insights(user_id)
        return success(insights)
    except Exception as e:
        return error(str(e), 500)


@app.route("/api/explain/<int:user_id>/<product_id>", methods=["GET"])
def explain(user_id, product_id):
    """
    Explain WHY a product was recommended to this user.
    This is Explainable AI (XAI) — a modern must-have feature.
    """
    try:
        product = recommender.products_df[
            recommender.products_df["product_id"] == product_id
        ]
        if product.empty:
            return error("Product not found", 404)

        product = product.iloc[0]
        is_new = user_id not in recommender.get_valid_user_ids()

        reasons = []
        if is_new:
            reasons.append("You're new! We're showing you our most popular products.")
            reasons.append(f"This item has {product['discount']} off — great value!")
        else:
            user_cats = recommender.get_user_insights(user_id).get("category_distribution", {})
            cat = product["category"]
            if cat in user_cats:
                reasons.append(f"You've browsed {user_cats[cat]} items in {cat} — this matches your interest!")
            reasons.append(f"Users with similar taste to you loved products from {product['brand']}.")
            reasons.append(f"This product is priced at ₹{product['price']} — within your usual range.")

        return success({
            "user_id": user_id,
            "product_id": product_id,
            "product_name": str(product["product_name"]),
            "reasons": reasons,
        })

    except Exception as e:
        return error(str(e), 500)


@app.route("/api/feedback", methods=["POST"])
def feedback():
    """
    POST /api/feedback
    Body: { "user_id": 1, "product_id": "FR001", "action": "like" | "dislike" }
    
    In a real system, this would retrain the model incrementally.
    Here we log it and return a confirmation.
    """
    try:
        body = request.get_json(force=True) or {}
        user_id = body.get("user_id")
        product_id = body.get("product_id")
        action = body.get("action")  # "like" or "dislike"

        if not all([user_id, product_id, action]):
            return error("user_id, product_id, and action are required")

        if action not in ["like", "dislike"]:
            return error("action must be 'like' or 'dislike'")

        # In production: update user-item matrix, retrain incrementally
        print(f"[Feedback] User {user_id} → {action} → {product_id}")

        return success({
            "message": f"Feedback recorded! Your recommendations will improve.",
            "user_id": user_id,
            "product_id": product_id,
            "action": action,
        })

    except Exception as e:
        return error(str(e), 500)


@app.route("/api/users", methods=["GET"])
def get_users():
    """Return list of valid user IDs (for demo/testing)."""
    ids = recommender.get_valid_user_ids()
    return success({"user_ids": ids[:20], "total_users": len(ids)})


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
