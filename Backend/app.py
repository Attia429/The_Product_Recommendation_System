from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
from model import hybrid_recommend, content_recommend

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb+srv://<user>:<pass>@cluster.mongodb.net/")
db = client["recommendation_db"]

@app.route("/recommend/<int:user_id>")
def recommend(user_id):
    user = db.users.find_one({"user_id": user_id})
    if not user or not user.get("history"):
        # Cold start — return trending products
        products = list(db.products.find({}, {"_id": 0}).limit(5))
        return jsonify(products)

    last_product = user["history"][-1]
    ratings = list(db.ratings.find({}, {"_id": 0}))
    ratings_df = pd.DataFrame(ratings)

    product_ids = hybrid_recommend(user_id, last_product, ratings_df)
    products = list(db.products.find({"product_id": {"$in": product_ids}}, {"_id": 0}))
    return jsonify(products)

@app.route("/user", methods=["POST"])
def add_user():
    data = request.json
    db.users.insert_one(data)
    return jsonify({"message": "User added"}), 201

@app.route("/product", methods=["POST"])
def add_product():
    data = request.json
    db.products.insert_one(data)
    return jsonify({"message": "Product added"}), 201

@app.route("/rating", methods=["POST"])
def add_rating():
    data = request.json
    db.ratings.insert_one(data)
    # Update user history
    db.users.update_one(
        {"user_id": data["user_id"]},
        {"$push": {"history": data["product_id"]}}
    )
    return jsonify({"message": "Rating saved"}), 201

@app.route("/train", methods=["POST"])
def train():
    # Re-run preprocessing on fresh data
    from preprocess import load_and_clean
    load_and_clean()
    return jsonify({"message": "Model retrained"})

if __name__ == "__main__":
    app.run(debug=True)