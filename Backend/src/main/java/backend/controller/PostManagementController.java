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
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
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

        if (mediaFiles.size() < 1 || mediaFiles.size() > 3) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You must upload between 1 and 3 media files.");
        }

        // Resolve the upload directory as an absolute path
        final File uploadDirectory = new File(uploadDir.isBlank() ? uploadDir : System.getProperty("user.dir"), uploadDir);

        // Ensure the upload directory exists
        if (!uploadDirectory.exists()) {
            boolean created = uploadDirectory.mkdirs();
            if (!created) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create upload directory.");
            }
        }

        List<String> mediaUrls = mediaFiles.stream()
                .filter(file -> file.getContentType().matches("image/(jpeg|png|jpg)|video/mp4"))
                .map(file -> {
                    try {
                        // Generate a unique filename
                        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
                        String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + "." + extension;

                        Path filePath = uploadDirectory.toPath().resolve(uniqueFileName);
                        file.transferTo(filePath.toFile());
                        return "/media/" + uniqueFileName; // URL to access the file
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
                    }
                })
                .collect(Collectors.toList());

        PostManagementModel post = new PostManagementModel();
        post.setUserID(userID);
        post.setTitle(title);
        post.setDescription(description);
        post.setMedia(mediaUrls);

        PostManagementModel savedPost = postRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
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
