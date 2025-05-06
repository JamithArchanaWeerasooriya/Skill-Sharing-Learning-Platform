package backend.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "user")
public class UserModel {
    @Id
    @GeneratedValue
    private String id;
    private String fullname;
    private String email;
    private String password;
    private String phone;
    private List<String> skills;
    private Set<String> followedUsers = new HashSet<>();

    public UserModel() {

    }

    public UserModel(String id, String fullname, String email, String password, String phone, List<String> skills) {
        this.id = id;
        this.fullname = fullname;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.skills = skills;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public Set<String> getFollowedUsers() {
        return followedUsers;
    }

    public void setFollowedUsers(Set<String> followedUsers) {
        this.followedUsers = followedUsers;
    }
}
