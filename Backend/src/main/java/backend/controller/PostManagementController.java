package backend.controller;

import backend.exception.PostManagementNotFoundException;
import backend.model.Comment;
import backend.model.NotificationModel;
import backend.model.PostManagementModel;
import backend.repository.NotificationRepository;
import backend.repository.PostManagementRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/posts")
public class PostManagementController {
    @Autowired
    private PostManagementRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Value("${media.upload.dir}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam String userID,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam List<MultipartFile> mediaFiles) {

        try {
            // Step 1: Validate media file count
            if (mediaFiles.size() < 1 || mediaFiles.size() > 3) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("You must upload between 1 and 3 media files.");
            }

            // Step 2: Resolve and ensure the upload directory exists
            final File uploadDirectory = new File(
                    uploadDir.isBlank() ? uploadDir : System.getProperty("user.dir"),
                    uploadDir
            );

            if (!uploadDirectory.exists()) {
                boolean created = uploadDirectory.mkdirs();
                if (!created) {
                    return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Failed to create upload directory.");
                }
            }

            // Step 3: Handle media file saving
            List<String> mediaUrls = new ArrayList<>();
            for (MultipartFile file : mediaFiles) {
                String contentType = file.getContentType();
                if (contentType == null ||
                        !(contentType.matches("image/(jpeg|png|jpg)") || contentType.equals("video/mp4"))) {
                    return ResponseEntity
                            .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                            .body("Only JPEG, PNG, JPG images or MP4 videos are supported.");
                }

                try {
                    String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
                    String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + "." + extension;

                    Path filePath = uploadDirectory.toPath().resolve(uniqueFileName);
                    file.transferTo(filePath.toFile());

                    mediaUrls.add("/media/" + uniqueFileName);
                } catch (IOException e) {
                    return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Error saving file: " + file.getOriginalFilename());
                }
            }

            // Step 4: Create and save the post
            PostManagementModel post = new PostManagementModel();
            post.setUserID(userID);
            post.setTitle(title);
            post.setDescription(description);
            post.setMedia(mediaUrls);

            PostManagementModel savedPost;
            try {
                savedPost = postRepository.save(post);
            } catch (Exception e) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to save post to the database.");
            }

            // Step 5: Return success response
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedPost);

        } catch (Exception ex) {
            // Global fallback error handler
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected server error: " + ex.getMessage());
        }
    }


    @GetMapping
    public List<PostManagementModel> getAllPosts() {
        return postRepository.findAll();
    }

    @GetMapping("/user/{userID}")
    public List<PostManagementModel> getPostsByUser(@PathVariable String userID) {
        return postRepository.findAll().stream()
                .filter(post -> post.getUserID().equals(userID))
                .collect(Collectors.toList());
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable String postId) {
        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new PostManagementNotFoundException("Post not found: " + postId));
        return ResponseEntity.ok(post);
    }


    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new PostManagementNotFoundException("Post not found: " + postId));

        // Delete associated media files
        for (String mediaUrl : post.getMedia()) {
            try {
                // Resolve the full file path
                Path filePath = Paths.get(uploadDir, mediaUrl.replace("/media/", ""));
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to delete media file: " + mediaUrl);
            }
        }

        // Delete the post from the database
        postRepository.deleteById(postId);
        return ResponseEntity.ok("Post deleted successfully!");
    }


    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable String postId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) List<MultipartFile> newMediaFiles) {

        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new PostManagementNotFoundException("Post not found: " + postId));

        post.setTitle(title);
        post.setDescription(description);

        if (newMediaFiles != null && !newMediaFiles.isEmpty()) {
            // Ensure the upload directory exists
            final File uploadDirectory = new File(uploadDir.isBlank() ? uploadDir : System.getProperty("user.dir"), uploadDir);
            if (!uploadDirectory.exists()) {
                boolean created = uploadDirectory.mkdirs();
                if (!created) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create upload directory.");
                }
            }

            List<String> newMediaUrls = newMediaFiles.stream()
                    .map(file -> {
                        try {
                            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
                            String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + "." + extension;
                            Path filePath = uploadDirectory.toPath().resolve(uniqueFileName);
                            file.transferTo(filePath.toFile());
                            return "/media/" + uniqueFileName;
                        } catch (IOException e) {
                            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
                        }
                    })
                    .collect(Collectors.toList());
            post.getMedia().addAll(newMediaUrls);
        }

        postRepository.save(post);
        return ResponseEntity.ok("Post updated successfully!");
    }

    @DeleteMapping("/{postId}/media")
    public ResponseEntity<?> deleteMedia(@PathVariable String postId, @RequestBody Map<String, String> request) {
        String mediaUrl = request.get("mediaUrl");

        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new PostManagementNotFoundException("Post not found: " + postId));

        if (!post.getMedia().remove(mediaUrl)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Media file not found in post.");
        }

        try {
            Path filePath = Paths.get(uploadDir, mediaUrl.replace("/media/", ""));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete media file.");
        }

        postRepository.save(post);
        return ResponseEntity.ok("Media file deleted successfully!");
    }

    @PutMapping("/{postId}/like")
    public ResponseEntity<PostManagementModel> likePost(@PathVariable String postId, @RequestParam String userID) {
        return postRepository.findById(postId)
                .map(post -> {
                    post.getLikes().put(userID, !post.getLikes().getOrDefault(userID, false));
                    postRepository.save(post);

                    // Create a notification for the post owner
                    if (!userID.equals(post.getUserID())) {
                        String userFullName = userRepository.findById(userID)
                                .map(user -> user.getFullname())
                                .orElse("Someone");
                        String message = String.format("%s liked your %s post", userFullName, post.getTitle());
                        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        NotificationModel notification = new NotificationModel(post.getUserID(), message, false, currentDateTime);
                        notificationRepository.save(notification);
                    }

                    return ResponseEntity.ok(post);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<PostManagementModel> addComment(@PathVariable String postId, @RequestBody Map<String, String> request) {
        String userID = request.get("userID");
        String content = request.get("content");

        return postRepository.findById(postId)
                .map(post -> {
                    Comment comment = new Comment();
                    comment.setId(UUID.randomUUID().toString());
                    comment.setUserID(userID);
                    comment.setContent(content);

                    // Fetch user's full name
                    String userFullName = userRepository.findById(userID)
                            .map(user -> user.getFullname())
                            .orElse("Anonymous");
                    comment.setUserFullName(userFullName);

                    post.getComments().add(comment);
                    postRepository.save(post);

                    // Create a notification for the post owner
                    if (!userID.equals(post.getUserID())) {
                        String message = String.format("%s commented on your post: %s", userFullName, post.getTitle());
                        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        NotificationModel notification = new NotificationModel(post.getUserID(), message, false, currentDateTime);
                        notificationRepository.save(notification);
                    }

                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }


    @PutMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<PostManagementModel> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> request) {
        String userID = request.get("userID");
        String content = request.get("content");

        return postRepository.findById(postId)
                .map(post -> {
                    post.getComments().stream()
                            .filter(comment -> comment.getId().equals(commentId) && comment.getUserID().equals(userID))
                            .findFirst()
                            .ifPresent(comment -> comment.setContent(content));
                    postRepository.save(post);
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<PostManagementModel> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestParam String userID) {
        return postRepository.findById(postId)
                .map(post -> {
                    post.getComments().removeIf(comment ->
                            comment.getId().equals(commentId) &&
                                    (comment.getUserID().equals(userID) || post.getUserID().equals(userID)));
                    postRepository.save(post);
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body("File size exceeds the maximum limit!");
    }



}

