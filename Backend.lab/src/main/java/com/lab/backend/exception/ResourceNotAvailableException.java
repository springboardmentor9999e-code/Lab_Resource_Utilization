package com.lab.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ResourceNotAvailableException extends RuntimeException {
    public ResourceNotAvailableException(String message) {
        super(message);
    }
}
