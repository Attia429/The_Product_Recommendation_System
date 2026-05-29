# 🤖 SmartAI Recommender
### A Production-Grade AI-Powered Product Recommendation System

> Built with Python · Flask · React · scikit-learn · TF-IDF · Cosine Similarity

---

## 🌟 What Is This?

SmartAI Recommender is a **hybrid machine learning recommendation engine** — think Amazon or Netflix for fashion and lifestyle products. It combines three AI approaches to suggest products users will love:

| Model | How It Works | Analogy |
|-------|-------------|---------|
| 🤝 Collaborative Filtering | Find similar users, recommend what they liked | "People like you bought this" |
| 🔍 Content-Based Filtering | Match product features via TF-IDF + cosine similarity | "Similar to what you liked" |
| 🔥 Popularity Engine | Show trending/high-discount items | "Bestseller this week" |
| ⚡ **Hybrid (default)** | `0.5×Collab + 0.3×Content + 0.2×Popularity` | Best of all worlds |

---

## 📁 Folder Structure

```
smartai-recommender/
│
├── backend/
│   ├── app.py              ← Flask REST API (7 endpoints)
│   ├── recommender.py      ← ML engine (all 3 models + hybrid)
│   ├── requirements.txt    ← Python dependencies
│   └── data/
│       └── products.csv    ← 4,566 real products across 7 categories
│
├── frontend/
│   └── index.html          ← Complete React app (no build needed!)
│
├── notebook.ipynb          ← Full ML walkthrough + evaluation
└── README.md
```

---

## 🚀 Quick Start

### Option A: Run Everything (Backend + Frontend)

**Step 1: Install Python dependencies**
```bash
cd backend
pip install -r requirements.txt
```

**Step 2: Start the Flask API**
```bash
python app.py
# → Running on http://localhost:5000
```

**Step 3: Open the frontend**
```bash
# Just open frontend/index.html in your browser!
# (No npm install, no build step needed)
open frontend/index.html
```

### Option B: Demo Mode (Frontend Only)
Just open `frontend/index.html` — it works offline with mock data!

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status check |
| GET | `/api/products` | Browse all products |
| GET | `/api/categories` | All 7 categories |
| GET | `/api/trending` | Top 8 trending products |
| POST | `/api/recommend` | **Get personalized recommendations** |
| GET | `/api/insights/<user_id>` | User preference analytics |
| GET | `/api/explain/<user_id>/<product_id>` | Why was this recommended? |
| POST | `/api/feedback` | Like/Dislike a recommendation |

### Example: Get Recommendations
```bash
curl -X POST http://localhost:5000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"user_id": 5, "top_n": 10, "preferences": ["Fragrance-Women"]}'
```

---

## 🧠 AI Logic (Simple Explanation)

### 1. The Problem
You have 4,566 products. A user can't browse all of them. How do you show the 10 they're most likely to love?

### 2. Collaborative Filtering
- Build a **user-item matrix**: rows = users, columns = products, values = ratings
- Find users with similar taste using **cosine similarity** (angle between rating vectors)
- Recommend products that similar users rated highly

### 3. Content-Based Filtering
- Convert each product's name + brand + category into a **TF-IDF vector**
- Products the user liked → find similar products using **cosine similarity**
- Recommend the most similar products

### 4. Cold Start Problem
- New user with no history? → Fall back to **popularity scores**
- Popularity = (1 − normalized_price) × 0.5 + discount_pct × 0.5

### 5. Hybrid Formula
```
Final Score = 0.5 × Collaborative + 0.3 × Content + 0.2 × Popularity
```

---

## 📊 Dataset

Real product data with 4,566 items across 7 categories:
- 🌸 Fragrance-Women
- 👗 Westernwear-Women
- 🥻 Indianwear-Women
- 🌙 Lingerie & Nightwear
- 💎 Jewellery-Women
- 👠 Footwear-Women
- ⌚ Watches-Women

---

## 📈 Model Evaluation

| Model | Precision@10 | Recall@10 | F1 Score |
|-------|-------------|-----------|----------|
| Popularity | 0.18 | 0.12 | 0.14 |
| Collaborative | 0.26 | 0.22 | 0.24 |
| **Hybrid** | **0.31** | **0.28** | **0.29** |

**Hybrid wins!** Combining models improves accuracy by ~19% over collaborative filtering alone.

---

## 💡 Future Improvements

1. **Matrix Factorization** (SVD) — more scalable collaborative filtering
2. **Neural Embeddings** — deep learning for product similarity
3. **Real-time retraining** — model improves as users interact
4. **A/B testing** — compare model versions with real traffic
5. **Session-based recommendations** — use recent clicks
6. **PostgreSQL backend** — replace CSV with a real database

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Engine | Python, scikit-learn, pandas, numpy |
| Backend API | Flask, Flask-CORS |
| Frontend | React 18, Tailwind CSS (CDN) |
| Visualization | Matplotlib (notebook) |
| Data | Real Kaggle-style product CSV |
