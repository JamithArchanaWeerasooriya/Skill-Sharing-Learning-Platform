package backend.exception;

public class LearningProgressNotFoundException extends RuntimeException{
    public LearningProgressNotFoundException(String id){
        super("Could not found with id"+id);
    }
}