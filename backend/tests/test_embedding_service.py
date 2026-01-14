import pytest
from services.embedding_service import EmbeddingService

def test_embedding_generation():
    service = EmbeddingService()
    texts = ["This is a test abstract.", "Another paper regarding deep learning."]
    embeddings = service.generate_embeddings(texts, batch_size=2)
    
    assert embeddings is not None
    assert embeddings.shape == (2, 384) # 2 texts, 384 dimensions
