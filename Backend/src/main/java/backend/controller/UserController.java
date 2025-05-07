package backend.controller;

import backend.exception.UserNotFoundException;
import backend.model.NotificationModel;
import backend.model.UserModel;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    //Insert
    @PostMapping("/user")
    public ResponseEntity<?> newUserModel(@RequestBody UserModel newUserModel) {
        if (userRepository.existsByEmail(newUserModel.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists!"));
        }
        if (newUserModel.getSkills() == null) {
            newUserModel.setSkills(List.of());
        }
        UserModel savedUser = userRepository.save(newUserModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    //User Login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserModel loginDetails) {
        System.out.println("Login attempt for email: " + loginDetails.getEmail()); // Log email for debugging

        UserModel user = userRepository.findByEmail(loginDetails.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email not found: " + loginDetails.getEmail()));

        if (user.getPassword().equals(loginDetails.getPassword())) {
            System.out.println("Login successful for email: " + loginDetails.getEmail()); // Log success
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login Successful");
            response.put("id", user.getId());
            response.put("fullName", user.getFullname());
            return ResponseEntity.ok(response);
        } else {
            System.out.println("Invalid password for email: " + loginDetails.getEmail()); // Log invalid password
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials!"));
        }
    }

    //Display
    @GetMapping("/user")
    List<UserModel> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/user/{id}")
    UserModel getUserId(@PathVariable String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    //update
    @PutMapping("/user/{id}")
    UserModel updateProfile(@RequestBody UserModel newUserModel, @PathVariable String id) {
        return userRepository.findById(id)
                .map(userModel -> {
                    userModel.setFullname(newUserModel.getFullname());
                    userModel.setEmail(newUserModel.getEmail());
                    userModel.setPassword(newUserModel.getPassword());
                    userModel.setPhone(newUserModel.getPhone());
                    userModel.setSkills(newUserModel.getSkills());
                    return userRepository.save(userModel);
                }).orElseThrow(() -> new UserNotFoundException(id));
    }

    //delete
    @DeleteMapping("/user/{id}")
    String deleteProfile(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
        return "user account " + id + " deleted";
    }

    // check email
    @GetMapping("/checkEmail")
    public boolean checkEmailExists(@RequestParam String email) {
        return userRepository.existsByEmail(email);
    }

    @PutMapping("/user/{userID}/follow")
    public ResponseEntity<?> followUser(@PathVariable String userID, @RequestBody Map<String, String> request) {
        String followUserID = request.get("followUserID");
        return userRepository.findById(userID).map(user -> {
            user.getFollowedUsers().add(followUserID);
            userRepository.save(user);

            // Create a notification for the followed user
            String followerFullName = userRepository.findById(userID)
                    .map(follower -> follower.getFullname())
                    .orElse("Someone");
            String message = String.format("%s started following you.", followerFullName);
            String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            NotificationModel notification = new NotificationModel(followUserID, message, false, currentDateTime);
            notificationRepository.save(notification);

            return ResponseEntity.ok(Map.of("message", "User followed successfully"));
        }).orElseThrow(() -> new UserNotFoundException("User not found: " + userID));
    }

    @PutMapping("/user/{userID}/unfollow")
    public ResponseEntity<?> unfollowUser(@PathVariable String userID, @RequestBody Map<String, String> request) {
        String unfollowUserID = request.get("unfollowUserID");
        return userRepository.findById(userID).map(user -> {
            user.getFollowedUsers().remove(unfollowUserID);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User unfollowed successfully"));
        }).orElseThrow(() -> new UserNotFoundException("User not found: " + userID));
    }

    @GetMapping("/user/{userID}/followedUsers")
    public List<String> getFollowedUsers(@PathVariable String userID) {
        return userRepository.findById(userID)
                .map(user -> new ArrayList<>(user.getFollowedUsers())) // Convert Set to List
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userID));
    }
}