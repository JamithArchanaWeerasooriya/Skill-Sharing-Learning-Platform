package backend.controller;

import backend.exception.LearningProgressNotFoundException;
import backend.model.LearningProgressModel;
import backend.repository.LearningProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
public class LearningProgressController {
    @Autowired
    private LearningProgressRepository learningProgressRepository;

    //Insert
    @PostMapping("/learningProgress")
    public LearningProgressModel newLearningProgressModel(@RequestBody LearningProgressModel newLearningProgressModel) {
        return learningProgressRepository.save(newLearningProgressModel);
    }

    @GetMapping("/learningProgress")
    List<LearningProgressModel> getAll() {
        return learningProgressRepository.findAll();
    }

    @GetMapping("/learningProgress/{id}")
    LearningProgressModel getById(@PathVariable String id) {
        return learningProgressRepository.findById(id)
                .orElseThrow(() -> new LearningProgressNotFoundException(id));
    }

    @PutMapping("/learningProgress/{id}")
    LearningProgressModel update(@RequestBody LearningProgressModel newLearningProgressModel, @PathVariable String id) {
        return learningProgressRepository.findById(id)
                .map(learningProgressModel -> {
                    learningProgressModel.setSkillTitle(newLearningProgressModel.getSkillTitle());
                    learningProgressModel.setDescription(newLearningProgressModel.getDescription());
                    learningProgressModel.setPostOwnerID(newLearningProgressModel.getPostOwnerID());
                    learningProgressModel.setPostOwnerName(newLearningProgressModel.getPostOwnerName());
                    learningProgressModel.setField(newLearningProgressModel.getField());
                    learningProgressModel.setStartDate(newLearningProgressModel.getStartDate());
                    learningProgressModel.setEndDate(newLearningProgressModel.getEndDate());
                    learningProgressModel.setLevel(newLearningProgressModel.getLevel());
                    return learningProgressRepository.save(learningProgressModel);
                }).orElseThrow(() -> new LearningProgressNotFoundException(id));
    }

    @DeleteMapping("/learningProgress/{id}")
    public void delete(@PathVariable String id) {
        learningProgressRepository.deleteById(id);
    }

}
