package com.lab.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootTest
class BackendApplicationTests {

    @Test
    void contextLoads() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("HASH FOR Velavan@@2007: " + encoder.encode("Velavan@@2007"));
        System.out.println("HASH FOR Velavan@2007: " + encoder.encode("Velavan@2007"));
    }

}
