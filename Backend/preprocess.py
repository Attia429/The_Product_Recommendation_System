import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder

def load_and_clean(path="products.csv"):
    df = pd.read_csv(path)

    # Handle missing data
    df.dropna(subset=["product_id"], inplace=True)
    df["description"].fillna("", inplace=True)
    df.drop_duplicates(inplace=True)

    # Feature engineering
    le = LabelEncoder()
    df["category_encoded"] = le.fit_transform(df["category"])

    # Text processing: lowercase + TF-IDF
    df["clean_desc"] = df["description"].str.lower()
    tfidf = TfidfVectorizer(stop_words="english", max_features=500)
    tfidf_matrix = tfidf.fit_transform(df["clean_desc"])

    return df, tfidf_matrix, tfidf