package com.rems;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
@org.springframework.scheduling.annotation.EnableAsync
public class InfosysBackend {

    public static void main(String[] args) {
        SpringApplication.run(InfosysBackend.class, args);
    }
}
