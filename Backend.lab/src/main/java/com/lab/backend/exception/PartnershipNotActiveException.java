package com.lab.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PartnershipNotActiveException extends RuntimeException {
    public PartnershipNotActiveException(String message) {
        super(message);
    }
}
