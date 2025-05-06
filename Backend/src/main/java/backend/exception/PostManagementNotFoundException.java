package backend.exception;

public class PostManagementNotFoundException extends RuntimeException {
    public PostManagementNotFoundException(String message) {
        super(message);
    }
}
