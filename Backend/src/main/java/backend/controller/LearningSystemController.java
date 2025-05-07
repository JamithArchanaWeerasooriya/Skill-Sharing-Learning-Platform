package backend.controller;

import backend.exception.LearningSystemNotFoundException;
import backend.exception.UserNotFoundException;
import backend.model.Comment;
import backend.model.LearningSystemModel;
import backend.model.NotificationModel;
import backend.repository.LearningSystemRepository;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin("http://localhost:3000")
public class LearningSystemController {
    @Autowired
    private LearningSystemRepository learningSystemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    //Insert
    @PostMapping("/learningSystem")
    public LearningSystemModel newLearningSystemModel(@RequestBody LearningSystemModel newLearningSystemModel) {
        System.out.println("Received data: " + newLearningSystemModel); // Debugging line
        if (newLearningSystemModel.getPostOwnerID() == null || newLearningSystemModel.getPostOwnerID().isEmpty()) {
            throw new IllegalArgumentException("PostOwnerID is required."); // Ensure postOwnerID is provided
        }
        // Fetch user's full name from UserRepository
        String postOwnerName = userRepository.findById(newLearningSystemModel.getPostOwnerID())
                .map(user -> user.getFullname())
                .orElseThrow(() -> new UserNotFoundException("User not found for ID: " + newLearningSystemModel.getPostOwnerID()));
        newLearningSystemModel.setPostOwnerName(postOwnerName);

        // Set current date and time
        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        newLearningSystemModel.setCreatedAt(currentDateTime);

        return learningSystemRepository.save(newLearningSystemModel); // Save postOwnerID along with other fields
    }

    @GetMapping("/learningSystem")
    List<LearningSystemModel> getAll() {
        List<LearningSystemModel> posts = learningSystemRepository.findAll();
        posts.forEach(post -> System.out.println("Fetched post: " + post)); // Debugging line
        return posts; // Ensure postOwnerID is included in the response
    }

    @GetMapping("/learningSystem/{id}")
    LearningSystemModel getById(@PathVariable String id) {
        return learningSystemRepository.findById(id)
                .orElseThrow(() -> new LearningSystemNotFoundException(id));
    }

    @PutMapping("/learningSystem/{id}")
    LearningSystemModel update(@RequestBody LearningSystemModel newLearningSystemModel, @PathVariable String id) {
        return learningSystemRepository.findById(id)
                .map(learningSystemModel -> {
                    learningSystemModel.setTitle(newLearningSystemModel.getTitle());
                    learningSystemModel.setDescription(newLearningSystemModel.getDescription());
                    learningSystemModel.setContentURL(newLearningSystemModel.getContentURL());
                    learningSystemModel.setTags(newLearningSystemModel.getTags());
                    // Retain original postOwnerID if not explicitly provided
                    if (newLearningSystemModel.getPostOwnerID() != null && !newLearningSystemModel.getPostOwnerID().isEmpty()) {
                        learningSystemModel.setPostOwnerID(newLearningSystemModel.getPostOwnerID());
                    }
                    return learningSystemRepository.save(learningSystemModel);
                }).orElseThrow(() -> new LearningSystemNotFoundException(id));
    }

    @DeleteMapping("/learningSystem/{id}")
    public void delete(@PathVariable String id) {
        learningSystemRepository.deleteById(id);
    }

    @PutMapping("/learningSystem/{id}/like")
    public LearningSystemModel likePost(@PathVariable String id, @RequestParam String userID) {
        return learningSystemRepository.findById(id)
                .map(post -> {
                    post.getLikes().put(userID, !post.getLikes().getOrDefault(userID, false));
                    learningSystemRepository.save(post);

                    // Create a notification for the post owner
                    if (!userID.equals(post.getPostOwnerID())) {
                        String userFullName = userRepository.findById(userID)
                                .map(user -> user.getFullname())
                                .orElse("Someone");
                        String message = String.format("%s liked your %s post", userFullName, post.getTitle());
                        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        NotificationModel notification = new NotificationModel(post.getPostOwnerID(), message, false, currentDateTime);
                        notificationRepository.save(notification);
                    }

                    return post;
                }).orElseThrow(() -> new LearningSystemNotFoundException(id));
    }

    @PostMapping("/learningSystem/{id}/comment")
    public LearningSystemModel addComment(@PathVariable String id, @RequestBody Comment comment) {
        // Fetch user's full name from UserRepository
        String userFullName = userRepository.findById(comment.getUserID())
                .map(user -> user.getFullname())
                .orElseThrow(() -> new UserNotFoundException("User not found for ID: " + comment.getUserID()));
        comment.setUserFullName(userFullName); // Set the user's full name in the comment

        return learningSystemRepository.findById(id)
                .map(post -> {
                    comment.setId(UUID.randomUUID().toString()); // Generate unique ID for the comment
                    post.getComments().add(comment);
                    learningSystemRepository.save(post);

                    // Create a notification for the post owner
                    if (!comment.getUserID().equals(post.getPostOwnerID())) {
                        String message = String.format("%s commented on your  %s  post", userFullName, post.getTitle());
                        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        NotificationModel notification = new NotificationModel(post.getPostOwnerID(), message, false, currentDateTime);
                        notificationRepository.save(notification);
                    }

                    return post;
                }).orElseThrow(() -> new LearningSystemNotFoundException(id));
    }

    @PutMapping("/learningSystem/{id}/comment/{commentId}")
    public LearningSystemModel updateComment(@PathVariable String id, @PathVariable String commentId, @RequestBody Comment updatedComment) {
        return learningSystemRepository.findById(id)
                .map(post -> {
                    post.getComments().stream()
                            .filter(comment -> comment.getId().equals(commentId) && comment.getUserID().equals(updatedComment.getUserID()))
                            .findFirst()
                            .ifPresent(comment -> comment.setContent(updatedComment.getContent()));
                    return learningSystemRepository.save(post);
                }).orElseThrow(() -> new LearningSystemNotFoundException(id));
    }

    @DeleteMapping("/learningSystem/{id}/comment/{commentId}")
    public LearningSystemModel deleteComment(@PathVariable String id, @PathVariable String commentId, @RequestParam String userID) {
        return learningSystemRepository.findById(id)
                .map(post -> {
                    post.getComments().removeIf(comment -> comment.getId().equals(commentId) &&
                            (comment.getUserID().equals(userID) || post.getPostOwnerID().equals(userID)));
                    return learningSystemRepository.save(post);
                }).orElseThrow(() -> new LearningSystemNotFoundException(id));
    }
}
