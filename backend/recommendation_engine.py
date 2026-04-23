"""
Recommendation Engine: Core recommendation systems
- Content-Based Filtering
- Collaborative Filtering
- Hybrid Approach
"""
import pandas as pd
import numpy as np
import logging
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
import joblib
from pathlib import Path
from config import MODEL_CACHE_DIR, ENABLE_MODEL_CACHING

logger = logging.getLogger(__name__)

# Create cache directory if it doesn't exist
MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)


class RecommendationEngine:
    """Unified recommendation engine with multiple strategies"""
    
    _instance = None
    _initialized = False
    
    def __new__(cls, data_manager=None):
        """Singleton pattern"""
        if cls._instance is None:
            cls._instance = super(RecommendationEngine, cls).__new__(cls)
        return cls._instance
    
    def __init__(self, data_manager):
        """Initialize recommendation engine"""
        if not RecommendationEngine._initialized:
            self.data_manager = data_manager
            self.df = data_manager.data.copy()
            self._initialize_models()
            RecommendationEngine._initialized = True
    
    def _initialize_models(self):
        """Initialize all recommendation models"""
        try:
            logger.info("Initializing recommendation models...")
            
            # Clean and prepare content
            self._prepare_content()
            
            # Initialize Content-Based model
            self._initialize_content_based()
            
            # Initialize Collaborative Filtering model
            self._initialize_collaborative()
            
            logger.info("All models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing models: {str(e)}")
            raise
    
    def _prepare_content(self):
        """Prepare content for content-based filtering"""
        try:
            # Load spaCy model for NLP
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("SpaCy model not found. Using basic text processing.")
                self.nlp = None
            
            # Create combined content field
            self.df['Content'] = (
                self.df['Name'].fillna('') + ' ' +
                self.df['Category'].fillna('') + ' ' +
                self.df['Brand'].fillna('') + ' ' +
                self.df['Description'].fillna('') + ' ' +
                self.df['Tags'].fillna('')
            )
            
            logger.info("Content prepared successfully")
            
        except Exception as e:
            logger.error(f"Error preparing content: {str(e)}")
            raise
    
    def _initialize_content_based(self):
        """Initialize content-based filtering models"""
        try:
            cache_file = MODEL_CACHE_DIR / 'tfidf_model.pkl'
            sim_cache_file = MODEL_CACHE_DIR / 'cosine_sim.pkl'
            
            # Try to load from cache
            if ENABLE_MODEL_CACHING and cache_file.exists() and sim_cache_file.exists():
                logger.info("Loading content-based model from cache...")
                self.tfidf_vectorizer = joblib.load(cache_file)
                self.tfidf_cosine_sim = joblib.load(sim_cache_file)
            else:
                logger.info("Building content-based model...")
                self.tfidf_vectorizer = TfidfVectorizer(
                    stop_words='english',
                    max_features=500,
                    min_df=2
                )
                
                tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.df['Content'])
                self.tfidf_cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
                
                # Cache models
                if ENABLE_MODEL_CACHING:
                    joblib.dump(self.tfidf_vectorizer, cache_file)
                    joblib.dump(self.tfidf_cosine_sim, sim_cache_file)
                    logger.info("Models cached successfully")
            
            logger.info("Content-based model initialized")
            
        except Exception as e:
            logger.error(f"Error initializing content-based model: {str(e)}")
            raise
    
    def _initialize_collaborative(self):
        """Initialize collaborative filtering models"""
        try:
            cache_file = MODEL_CACHE_DIR / 'user_sim.pkl'
            rating_matrix_file = MODEL_CACHE_DIR / 'rating_matrix.pkl'
            
            if ENABLE_MODEL_CACHING and cache_file.exists() and rating_matrix_file.exists():
                logger.info("Loading collaborative model from cache...")
                self.user_similarity_df = joblib.load(cache_file)
                self.rating_matrix = joblib.load(rating_matrix_file)
            else:
                logger.info("Building collaborative model...")
                
                # Create user-product rating matrix
                self.rating_matrix = self.df.pivot_table(
                    index='ID',
                    columns='ProdID',
                    values='Rating',
                    fill_value=0
                )
                
                # Compute user similarity
                user_similarity = cosine_similarity(self.rating_matrix)
                self.user_similarity_df = pd.DataFrame(
                    user_similarity,
                    index=self.rating_matrix.index,
                    columns=self.rating_matrix.index
                )
                
                # Cache models
                if ENABLE_MODEL_CACHING:
                    joblib.dump(self.user_similarity_df, cache_file)
                    joblib.dump(self.rating_matrix, rating_matrix_file)
                    logger.info("Models cached successfully")
            
            logger.info("Collaborative model initialized")
            
        except Exception as e:
            logger.error(f"Error initializing collaborative model: {str(e)}")
            raise
    
    def get_content_based_recommendations(self, product_name, n_recommendations=10):
        """Get content-based recommendations"""
        try:
            if product_name not in self.df['Name'].values:
                logger.warning(f"Product '{product_name}' not found")
                return []
            
            idx = self.df[self.df['Name'] == product_name].index[0]
            sim_scores = list(enumerate(self.tfidf_cosine_sim[idx]))
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:n_recommendations+1]
            
            product_indices = [i[0] for i in sim_scores]
            recommendations = self.df.iloc[product_indices][
                ['ProdID', 'Name', 'Brand', 'Category', 'Rating', 'ImageURL']
            ].copy()
            
            # Add similarity scores
            recommendations['Score'] = [score for _, score in sim_scores]
            
            return recommendations.to_dict('records')
            
        except Exception as e:
            logger.error(f"Error in content-based recommendations: {str(e)}")
            return []
    
    def get_collaborative_recommendations(self, user_id, n_recommendations=10):
        """Get collaborative filtering recommendations"""
        try:
            user_id = float(user_id)
            
            if user_id not in self.rating_matrix.index:
                logger.warning(f"User ID {user_id} not found")
                return []
            
            # Get similar users
            similar_users = self.user_similarity_df[user_id].sort_values(ascending=False)[1:15]
            
            if len(similar_users) == 0:
                return []
            
            # Get products rated by similar users
            user_rated_products = set(
                self.rating_matrix.loc[user_id][self.rating_matrix.loc[user_id] > 0].index
            )
            
            recommendations = {}
            for similar_user, similarity_score in similar_users.items():
                similar_user_ratings = self.rating_matrix.loc[similar_user]
                for prod_id, rating in similar_user_ratings.items():
                    if rating > 0 and prod_id not in user_rated_products:
                        if prod_id not in recommendations:
                            recommendations[prod_id] = []
                        recommendations[prod_id].append(rating * similarity_score)
            
            # Calculate weighted scores
            product_scores = {prod_id: np.mean(scores) for prod_id, scores in recommendations.items()}
            
            if not product_scores:
                return []
            
            # Normalize scores
            max_score = max(product_scores.values())
            min_score = min(product_scores.values())
            
            if max_score > min_score:
                product_scores = {k: (v - min_score) / (max_score - min_score) for k, v in product_scores.items()}
            
            # Get top N
            top_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)[:n_recommendations]
            top_product_ids = [prod_id for prod_id, _ in top_products]
            
            recommendations_df = self.df[self.df['ProdID'].isin(top_product_ids)].drop_duplicates(subset=['ProdID']).copy()
            recommendations_df['Score'] = recommendations_df['ProdID'].map(dict(top_products))
            
            return recommendations_df[['ProdID', 'Name', 'Brand', 'Category', 'Rating', 'ImageURL', 'Score']].to_dict('records')
            
        except Exception as e:
            logger.error(f"Error in collaborative recommendations: {str(e)}")
            return []
    
    def get_hybrid_recommendations(self, user_id=None, product_name=None, n_recommendations=10,
                                  content_weight=0.4, collab_weight=0.6):
        """Get hybrid recommendations combining both approaches"""
        try:
            content_scores = {}
            collab_scores = {}
            
            # Get content-based scores
            if product_name:
                try:
                    if product_name in self.df['Name'].values:
                        idx = self.df[self.df['Name'] == product_name].index[0]
                        sim_scores = list(enumerate(self.tfidf_cosine_sim[idx]))
                        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:n_recommendations+20]
                        
                        for i, score in sim_scores:
                            product_id = self.df.iloc[i]['ProdID']
                            content_scores[product_id] = score
                except Exception as e:
                    logger.warning(f"Content-based error: {str(e)}")
            
            # Get collaborative scores
            if user_id is not None:
                try:
                    user_id = float(user_id)
                    collab_recs = self.get_collaborative_recommendations(user_id, n_recommendations+10)
                    for rec in collab_recs:
                        collab_scores[rec['ProdID']] = rec['Score']
                except Exception as e:
                    logger.warning(f"Collaborative error: {str(e)}")
            
            # Combine scores
            all_products = set(content_scores.keys()) | set(collab_scores.keys())
            
            if not all_products:
                return []
            
            # Normalize content scores
            if content_scores:
                max_content = max(content_scores.values())
                if max_content > 0:
                    content_scores = {k: v / max_content for k, v in content_scores.items()}
            
            # Calculate hybrid scores
            hybrid_scores = {}
            for prod_id in all_products:
                content_score = content_scores.get(prod_id, 0) * content_weight if product_name else 0
                collab_score = collab_scores.get(prod_id, 0) * collab_weight if user_id is not None else 0
                
                if content_score > 0 or collab_score > 0:
                    hybrid_scores[prod_id] = {
                        'hybrid': content_score + collab_score,
                        'content': content_scores.get(prod_id, 0),
                        'collab': collab_scores.get(prod_id, 0)
                    }
            
            if not hybrid_scores:
                return []
            
            # Get top N
            sorted_recs = sorted(hybrid_scores.items(), key=lambda x: x[1]['hybrid'], reverse=True)[:n_recommendations]
            top_product_ids = [prod_id for prod_id, _ in sorted_recs]
            
            recommendations_df = self.df[self.df['ProdID'].isin(top_product_ids)].drop_duplicates(subset=['ProdID']).copy()
            
            # Add scores
            for col in ['hybrid', 'content', 'collab']:
                recommendations_df[f'{col}_score'] = recommendations_df['ProdID'].map(
                    lambda x: hybrid_scores.get(x, {}).get(col, 0)
                )
            
            recommendations_df = recommendations_df.sort_values('hybrid_score', ascending=False)
            
            return recommendations_df[['ProdID', 'Name', 'Brand', 'Category', 'Rating', 'ImageURL',
                                      'hybrid_score', 'content_score', 'collab_score']].to_dict('records')
            
        except Exception as e:
            logger.error(f"Error in hybrid recommendations: {str(e)}")
            return []


# Singleton instance
recommendation_engine = None


def initialize_recommendation_engine(data_manager):
    """Initialize the recommendation engine"""
    global recommendation_engine
    recommendation_engine = RecommendationEngine(data_manager)
    return recommendation_engine


def get_recommendation_engine():
    """Get the recommendation engine instance"""
    return recommendation_engine
