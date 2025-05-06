package backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;

@Document(collection = "posts")
public class PostManagementModel {
    @Id
    private String id;
    private String userID;
    private String title;
    private String description;
    private List<String> media;
    private Map<String, Boolean> likes = new HashMap<>(); // Map to store user likes
    private List<Comment> comments = new ArrayList<>(); // List to store comments

    public PostManagementModel(String id, String userID, String title, String description, List<String> media) {
        this.id = id;
        this.userID = userID;
        this.title = title;
        this.description = description;
        this.media = media;
    }

    public PostManagementModel() {

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getMedia() {
        return media;
    }

    public void setMedia(List<String> media) {
        this.media = media;
    }

    public Map<String, Boolean> getLikes() {
        return likes;
    }

    public void setLikes(Map<String, Boolean> likes) {
        this.likes = likes;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }
}
