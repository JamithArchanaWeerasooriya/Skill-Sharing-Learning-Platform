package backend.repository;

import backend.model.LearningProgressModel;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LearningProgressRepository extends MongoRepository<LearningProgressModel,String> {
}

