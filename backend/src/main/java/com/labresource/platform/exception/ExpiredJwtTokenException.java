package com.labresource.platform.exception;

public class ExpiredJwtTokenException extends RuntimeException {

    public ExpiredJwtTokenException(String message) {
        super(message);
    }
}
