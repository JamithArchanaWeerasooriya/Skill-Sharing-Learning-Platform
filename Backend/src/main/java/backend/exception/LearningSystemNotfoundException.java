package backend.exception;

public class LearningSystemNotFoundException extends RuntimeException{
    public LearningSystemNotFoundException(String id){
        super("Could not found with id"+id);
    }
}
