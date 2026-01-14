from bertopic import BERTopic
from sklearn.feature_extraction.text import CountVectorizer
from umap import UMAP
from hdbscan import HDBSCAN
import pandas as pd
import logging
from typing import List, Dict, Tuple

logger = logging.getLogger(__name__)

class TopicModelingService:
    def __init__(self):
        # FR-2.1.2: Topic Clustering configuration
        # UMAP for dimensionality reduction (5 components)
        self.umap_model = UMAP(
            n_neighbors=15, 
            n_components=5, 
            min_dist=0.0, 
            metric='cosine',
            random_state=42 # For reproducibility
        )
        
        # HDBSCAN for clustering (min cluster size 50)
        self.hdbscan_model = HDBSCAN(
            min_cluster_size=50, 
            metric='euclidean', 
            cluster_selection_method='eom', 
            prediction_data=True
        )
        
        # c-TF-IDF for keyword extraction (FR-2.1.3)
        self.vectorizer_model = CountVectorizer(stop_words="english")
        
        # Initialize BERTopic
        self.topic_model = BERTopic(
            umap_model=self.umap_model,
            hdbscan_model=self.hdbscan_model,
            vectorizer_model=self.vectorizer_model,
            calculate_probabilities=True, # FR-2.1.2: soft clustering probabilities
            verbose=True
        )
        
        self.is_trained = False

    def train_model(self, docs: List[str], embeddings=None):
        """
        Train the topic model on paper abstracts.
        FR-2.2.2: Retrain topic model on all papers.
        """
        logger.info(f"Training BERTopic model on {len(docs)} documents...")
        try:
            topics, probs = self.topic_model.fit_transform(docs, embeddings=embeddings)
            self.is_trained = True
            
            # FR-2.1.2: Outlier handling (Topic -1)
            # BERTopic handles this automatically with HDBSCAN
            
            logger.info("Training complete.")
            return topics, probs
        except Exception as e:
            logger.error(f"Error training topic model: {e}")
            raise e

    def get_topic_info(self) -> pd.DataFrame:
        if not self.is_trained:
            return pd.DataFrame()
        return self.topic_model.get_topic_info()

    def get_topic_keywords(self, topic_id: int) -> List[Tuple[str, float]]:
        """
        FR-2.1.3: Extract top 10 keywords per topic
        """
        if not self.is_trained:
            return []
        return self.topic_model.get_topic(topic_id)

    def generate_topic_names_llm(self, topic_info: pd.DataFrame):
        """
        FR-2.1.3: Generate human-readable topic names using LLM.
        Placeholder for OpenAI integration.
        """
        # Integration with OpenAI would go here
        # prompt = f"Name this topic described by keywords: {keywords}"
        pass

    def get_representative_docs(self, topic_id: int):
        """
        FR-2.1.3: Select 5 most representative papers per topic
        """
        if not self.is_trained:
            return []
        return self.topic_model.get_representative_docs(topic_id)
