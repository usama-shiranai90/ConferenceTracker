from services.topic_service import TopicModelingService

def test_topic_modeling_initialization():
    service = TopicModelingService()
    assert service.is_trained == False
    assert service.topic_model is not None
