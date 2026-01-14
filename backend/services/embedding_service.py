import numpy as np
from sentence_transformers import SentenceTransformer
import logging
from typing import List
import os

# Initialize logging
logger = logging.getLogger(__name__)

# FR-2.1.1: Embedding Generation
# Use a lightweight but effective model for embeddings
# 'all-MiniLM-L6-v2' is standard for speed/performance trade-off (384 dimensions)
MODEL_NAME = 'all-MiniLM-L6-v2'

class EmbeddingService:
    def __init__(self):
        logger.info(f"Loading SentenceTransformer model: {MODEL_NAME}")
        # In a real production environment, we might host this separately or use an API
        # For this setup, we load it in-memory.
        self.model = SentenceTransformer(MODEL_NAME)
        
    def generate_embeddings(self, texts: List[str], batch_size: int = 100) -> np.ndarray:
        """
        Generate 384-dimensional embeddings for a list of texts (abstracts).
        FR-2.1.1: Batch process embeddings (100 papers/batch)
        """
        logger.info(f"Generating embeddings for {len(texts)} texts with batch size {batch_size}")
        try:
            embeddings = self.model.encode(texts, batch_size=batch_size, show_progress_bar=True)
            return embeddings
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise e

# Validating the service
if __name__ == "__main__":
    service = EmbeddingService()
    test_texts = ["This is a paper about transformers.", "Deep learning in medical imaging."]
    emb = service.generate_embeddings(test_texts)
    print(f"Generated embeddings shape: {emb.shape}")
