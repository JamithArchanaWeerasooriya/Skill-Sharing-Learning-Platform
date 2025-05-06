package backend.repository;

import backend.model.LearningSystemModel;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LearningSystemRepository extends MongoRepository<LearningSystemModel,String> {
}
