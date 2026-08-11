package com.labplatform.labresourceplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableScheduling powers the alert system's background checks (idle
// equipment, maintenance/calibration due dates) - see AlertGenerationJob.
@SpringBootApplication
@EnableScheduling
public class LabResourcePlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(LabResourcePlatformApplication.class, args);
    }

}
