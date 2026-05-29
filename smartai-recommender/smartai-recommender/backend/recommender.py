"""
SmartAI Recommender - ML Engine
================================
This is the brain of the system. It implements:
1. Content-Based Filtering  → Find products similar to what you like
2. Collaborative Filtering  → Find products liked by similar users
3. Popularity-Based         → For new users (cold start)
4. Hybrid Scoring           → Combine all three intelligently

Think of it like Amazon's recommendation engine — simplified but real!
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import random
import warnings
warnings.filterwarnings("ignore")


class SmartRecommender:
    """
    The core AI recommendation engine.
    
    Real-life analogy:
    - Content-Based: "You liked a blue shirt, here are more blue shirts"
    - Collaborative: "People who bought what you bought also bought this"
    - Popularity:    "These are trending right now" (for new users)
    - Hybrid:        Mix all of the above for best results
    """

    def __init__(self, data_path: str):
        self.data_path = data_path
        self.products_df = None
        self.user_item_matrix = None
        self.content_sim_matrix = None
        self.tfidf_matrix = None
        self.scaler = MinMaxScaler()
        self._load_and_preprocess()
        self._build_models()

    # ─────────────────────────────────────────────
    # STEP 1: Load & preprocess data
    # ─────────────────────────────────────────────
    def _load_and_preprocess(self):
        """Load the real products CSV and clean it up."""
        df = pd.read_csv(self.data_path)

        # Rename columns for consistency
        df.columns = [c.strip() for c in df.columns]
        df = df.rename(columns={
            "Product ID": "product_id",
            "Product Name": "product_name",
            "BrandName": "brand",
            "Brand Desc": "brand_desc",
            "Category": "category",
            "SellPrice": "price",
            "MRP": "mrp",
            "Discount": "discount",
            "Product Size": "size",
        })

        # Drop duplicates and missing product names
        df = df.drop_duplicates(subset=["product_id"])
        df = df.dropna(subset=["product_name", "category"])

        # Clean discount column → extract numeric value
        df["discount_pct"] = df["discount"].str.extract(r"(\d+)").astype(float).fillna(0)

        # Create a combined text feature for TF-IDF
        df["features"] = (
            df["product_name"].fillna("") + " " +
            df["brand"].fillna("") + " " +
            df["category"].fillna("") + " " +
            df["brand_desc"].fillna("")
        ).str.lower()

        # Assign a popularity score: lower price rank + higher discount = more popular
        df["popularity_score"] = (
            (1 - self.scaler.fit_transform(df[["price"]])).flatten() * 0.5 +
            df["discount_pct"] / 100 * 0.5
        )

        self.products_df = df.reset_index(drop=True)
        print(f"[Recommender] Loaded {len(self.products_df)} products across {df['category'].nunique()} categories.")

        # ── Synthetic user interaction data ──────────────────────────────────
        # Since the dataset has no user data, we generate realistic interactions.
        # This simulates what would come from a real user database.
        self._generate_synthetic_users()

    def _generate_synthetic_users(self):
        """
        Create synthetic user-item interaction matrix.
        In a real system this comes from your database: clicks, purchases, ratings.
        """
        np.random.seed(42)
        n_users = 100
        n_products = len(self.products_df)
        product_ids = self.products_df["product_id"].tolist()

        # Each user interacts with 5–25 random products
        interactions = []
        for user_id in range(1, n_users + 1):
            n_interactions = random.randint(5, 25)
            chosen = np.random.choice(product_ids, n_interactions, replace=False)
            for pid in chosen:
                rating = round(random.uniform(2.5, 5.0), 1)
                interactions.append({"user_id": user_id, "product_id": pid, "rating": rating})

        self.interactions_df = pd.DataFrame(interactions)

        # Pivot to user-item matrix (rows = users, columns = products)
        self.user_item_matrix = self.interactions_df.pivot_table(
            index="user_id", columns="product_id", values="rating", fill_value=0
        )

    # ─────────────────────────────────────────────
    # STEP 2: Build ML models
    # ─────────────────────────────────────────────
    def _build_models(self):
        """Build TF-IDF content model and user similarity model."""
        # ── Content-Based: TF-IDF on product features ─────────────────────
        tfidf = TfidfVectorizer(stop_words="english", max_features=500)
        self.tfidf_matrix = tfidf.fit_transform(self.products_df["features"])
        self.content_sim_matrix = cosine_similarity(self.tfidf_matrix)
        print("[Recommender] Content-based similarity matrix built.")

        # ── Collaborative: User cosine similarity ─────────────────────────
        # Each user is a vector of their ratings. Similar vectors = similar taste.
        user_matrix = self.user_item_matrix.values
        self.user_sim_matrix = cosine_similarity(user_matrix)
        print("[Recommender] User similarity matrix built.")

    # ─────────────────────────────────────────────
    # STEP 3: Recommendation functions
    # ─────────────────────────────────────────────
    def _collaborative_scores(self, user_id: int) -> pd.Series:
        """
        Collaborative Filtering:
        Find users similar to this user, then look at what they rated highly.
        Like Netflix saying "users like you watched this".
        """
        if user_id not in self.user_item_matrix.index:
            return pd.Series(dtype=float)

        user_idx = self.user_item_matrix.index.get_loc(user_id)
        sim_scores = self.user_sim_matrix[user_idx]

        # Weighted average of ratings from similar users
        weighted_ratings = np.dot(sim_scores, self.user_item_matrix.values)
        sim_sum = np.abs(sim_scores).sum()
        if sim_sum == 0:
            return pd.Series(dtype=float)

        pred_ratings = pd.Series(
            weighted_ratings / (sim_sum + 1e-9),
            index=self.user_item_matrix.columns
        )

        # Exclude products the user already interacted with
        seen = self.user_item_matrix.loc[user_id]
        pred_ratings[seen[seen > 0].index] = 0
        return pred_ratings

    def _content_scores(self, user_id: int) -> pd.Series:
        """
        Content-Based Filtering:
        Look at products the user liked, find similar ones using TF-IDF + cosine similarity.
        Like Spotify saying "you liked this song, here's similar music".
        """
        if user_id not in self.user_item_matrix.index:
            return pd.Series(dtype=float)

        user_ratings = self.user_item_matrix.loc[user_id]
        liked_products = user_ratings[user_ratings > 3.5].index.tolist()

        if not liked_products:
            return pd.Series(dtype=float)

        score_dict = {}
        for pid in liked_products:
            if pid not in self.products_df["product_id"].values:
                continue
            idx = self.products_df[self.products_df["product_id"] == pid].index[0]
            sim_scores = self.content_sim_matrix[idx]
            for i, score in enumerate(sim_scores):
                prod_id = self.products_df.iloc[i]["product_id"]
                if prod_id not in liked_products:
                    score_dict[prod_id] = score_dict.get(prod_id, 0) + score

        if not score_dict:
            return pd.Series(dtype=float)

        content_series = pd.Series(score_dict)
        content_series = content_series / content_series.max()  # normalize
        return content_series

    def _popularity_scores(self) -> pd.Series:
        """
        Popularity-Based:
        Just return trending/popular products.
        Perfect for new users who have no history (cold start problem).
        """
        return pd.Series(
            self.products_df["popularity_score"].values,
            index=self.products_df["product_id"]
        )

    def recommend(
        self,
        user_id: int,
        top_n: int = 10,
        preferences: list = None
    ) -> list:
        """
        HYBRID RECOMMENDATION ENGINE
        
        Formula:
        Final Score = 0.5 × Collaborative + 0.3 × Content + 0.2 × Popularity
        
        For new users (cold start): fall back to popularity + preferences filter
        """
        collab = self._collaborative_scores(user_id)
        content = self._content_scores(user_id)
        popular = self._popularity_scores()

        is_new_user = user_id not in self.user_item_matrix.index

        if is_new_user:
            # Cold start: use popularity + preference filter
            scores = popular.copy()
            method = "popularity"
        else:
            # Align all series to same product index
            all_products = popular.index
            collab = collab.reindex(all_products, fill_value=0)
            content = content.reindex(all_products, fill_value=0)

            # Normalize each score to 0–1 range
            def safe_norm(s):
                mx = s.max()
                return s / mx if mx > 0 else s

            collab = safe_norm(collab)
            content = safe_norm(content)
            popular = safe_norm(popular)

            # Weighted hybrid formula
            scores = 0.5 * collab + 0.3 * content + 0.2 * popular
            method = "hybrid"

        # Filter by category preferences if provided
        if preferences:
            pref_lower = [p.lower() for p in preferences]
            mask = self.products_df["category"].str.lower().apply(
                lambda c: any(p in c for p in pref_lower)
            )
            valid_ids = self.products_df[mask]["product_id"].tolist()
            scores = scores[scores.index.isin(valid_ids)]

        top_ids = scores.nlargest(top_n).index.tolist()
        return self._format_results(top_ids, user_id, method, scores)

    def _format_results(self, product_ids: list, user_id: int, method: str, scores: pd.Series) -> list:
        """Package each recommendation with metadata and explanation."""
        results = []
        for pid in product_ids:
            row = self.products_df[self.products_df["product_id"] == pid]
            if row.empty:
                continue
            row = row.iloc[0]
            score = float(scores.get(pid, 0))

            explanation = self._explain(user_id, pid, method, score)

            results.append({
                "product_id": str(row["product_id"]),
                "product_name": str(row["product_name"]),
                "brand": str(row["brand"]),
                "category": str(row["category"]),
                "price": int(row["price"]),
                "mrp": int(row["mrp"]),
                "discount": str(row["discount"]),
                "score": round(score, 4),
                "explanation": explanation,
                "method": method,
                "recommendation_type": self._tag(score),
            })
        return results

    def _explain(self, user_id: int, product_id: str, method: str, score: float) -> str:
        """Generate a human-readable explanation for each recommendation."""
        row = self.products_df[self.products_df["product_id"] == product_id]
        if row.empty:
            return "Recommended for you."
        row = row.iloc[0]

        if method == "popularity":
            return f"🔥 Trending: This {row['category'].split('-')[0]} product is popular among shoppers with {row['discount']} off!"
        elif score > 0.7:
            return f"⭐ Top Pick: Users with similar taste to you highly rated products from {row['brand']}."
        elif score > 0.4:
            return f"💡 Smart Match: Based on products you've viewed, this {row['category'].split('-')[0]} item matches your style."
        else:
            return f"✨ You Might Like: Discover {row['brand']} — a popular brand in {row['category'].split('-')[0]}."

    def _tag(self, score: float) -> str:
        if score > 0.7:
            return "Top Pick"
        elif score > 0.4:
            return "Great Match"
        else:
            return "Explore"

    # ─────────────────────────────────────────────
    # STEP 4: Insights & explain endpoints
    # ─────────────────────────────────────────────
    def get_user_insights(self, user_id: int) -> dict:
        """Return analytics about this user's preferences."""
        if user_id not in self.user_item_matrix.index:
            return {"status": "new_user", "message": "No history yet. Showing popular products."}

        rated = self.user_item_matrix.loc[user_id]
        rated_ids = rated[rated > 0].index.tolist()
        rated_products = self.products_df[self.products_df["product_id"].isin(rated_ids)]

        category_dist = rated_products["category"].value_counts().to_dict()
        avg_price = int(rated_products["price"].mean()) if not rated_products.empty else 0
        top_brands = rated_products["brand"].value_counts().head(3).index.tolist()

        return {
            "user_id": user_id,
            "total_interactions": len(rated_ids),
            "category_distribution": category_dist,
            "average_price_range": avg_price,
            "top_brands": top_brands,
            "status": "active_user",
        }

    def get_trending(self, top_n: int = 8) -> list:
        """Return globally trending products by popularity score."""
        top = self.products_df.nlargest(top_n, "popularity_score")
        return [
            {
                "product_id": str(r["product_id"]),
                "product_name": str(r["product_name"]),
                "brand": str(r["brand"]),
                "category": str(r["category"]),
                "price": int(r["price"]),
                "mrp": int(r["mrp"]),
                "discount": str(r["discount"]),
                "score": round(float(r["popularity_score"]), 4),
                "explanation": f"🔥 Trending: {r['discount']} off — one of our most popular picks!",
                "method": "popularity",
                "recommendation_type": "Trending",
            }
            for _, r in top.iterrows()
        ]

    def get_all_products(self, limit: int = 50) -> list:
        df = self.products_df.head(limit)
        return df[["product_id", "product_name", "brand", "category", "price", "mrp", "discount"]].to_dict("records")

    def get_categories(self) -> list:
        return sorted(self.products_df["category"].unique().tolist())

    def get_valid_user_ids(self) -> list:
        return self.user_item_matrix.index.tolist()
