package com.labplatform.labresourceplatform.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// Runs the same checks as AlertGenerationJob.runDailyChecks() once at
// application startup, in addition to the 7am daily schedule - otherwise a
// freshly started app (e.g. for testing/demo) wouldn't show any alerts until
// the next scheduled run, up to 24h later.
@Component
public class AlertStartupRunner implements CommandLineRunner {

    private final AlertGenerationJob alertGenerationJob;

    public AlertStartupRunner(AlertGenerationJob alertGenerationJob) {
        this.alertGenerationJob = alertGenerationJob;
    }

    @Override
    public void run(String... args) {
        alertGenerationJob.runDailyChecks();
    }
}
