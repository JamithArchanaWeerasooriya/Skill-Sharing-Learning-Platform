package backend.repository;

import backend.model.PostManagementModel;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PostManagementRepository extends MongoRepository<PostManagementModel, String> {
    // Additional query methods if needed
}