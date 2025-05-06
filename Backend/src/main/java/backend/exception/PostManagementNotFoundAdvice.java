package backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class PostManagementNotFoundAdvice {
    @ExceptionHandler(PostManagementNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String postNotFoundHandler(PostManagementNotFoundException ex) {
        return ex.getMessage();
    }
}
