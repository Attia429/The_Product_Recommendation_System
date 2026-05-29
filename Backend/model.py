import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors
from preprocess import load_and_clean

df, tfidf_matrix, tfidf = load_and_clean()

# === A. Content-Based Filtering ===
content_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

def content_recommend(product_id, top_n=5):
    idx = df[df["product_id"] == product_id].index[0]
    scores = list(enumerate(content_sim[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    top = [i for i, _ in scores[1:top_n+1]]
    return df.iloc[top]["product_id"].tolist()

# === B. Collaborative Filtering (User-Item Matrix) ===
def build_user_item_matrix(ratings_df):
    matrix = ratings_df.pivot_table(
        index="user_id", columns="product_id", values="rating"
    ).fillna(0)
    return matrix

def collab_recommend(user_id, ratings_df, top_n=5):
    matrix = build_user_item_matrix(ratings_df)
    if user_id not in matrix.index:
        return []  # cold start — fallback to content-based
    knn = NearestNeighbors(n_neighbors=5, metric="cosine")
    knn.fit(matrix)
    user_vec = matrix.loc[[user_id]]
    distances, indices = knn.kneighbors(user_vec, n_neighbors=6)
    similar_users = matrix.iloc[indices[0][1:]]
    scores = similar_users.mean(axis=0)
    already_rated = matrix.loc[user_id][matrix.loc[user_id] > 0].index.tolist()
    scores = scores.drop(labels=already_rated, errors="ignore")
    return scores.nlargest(top_n).index.tolist()

# === C. Hybrid Model ===
def hybrid_recommend(user_id, last_product_id, ratings_df, top_n=5):
    content_scores = content_recommend(last_product_id, top_n=20)
    collab_scores  = collab_recommend(user_id, ratings_df, top_n=20)

    score_map = {}
    for pid in content_scores:
        score_map[pid] = score_map.get(pid, 0) + 0.5
    for pid in collab_scores:
        score_map[pid] = score_map.get(pid, 0) + 0.5

    ranked = sorted(score_map, key=score_map.get, reverse=True)
    return ranked[:top_n]