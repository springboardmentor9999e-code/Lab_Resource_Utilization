package com.lrplatform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/oauth2")
public class OAuth2Controller {

    @GetMapping("/status")
    public ResponseEntity<String> oauth2Status() {
        return ResponseEntity.ok("OAuth2 endpoint is active. Use /api/oauth2/authorization/google for login.");
    }
}
