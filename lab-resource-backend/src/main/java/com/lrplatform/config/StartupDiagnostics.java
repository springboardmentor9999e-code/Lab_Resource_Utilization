package com.lrplatform.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

@Component
@Slf4j
public class StartupDiagnostics implements ApplicationRunner {

    private static final String PLACEHOLDER_CLIENT_ID = "your-google-client-id";

    private final ApplicationContext applicationContext;
    private final String googleClientId;

    public StartupDiagnostics(ApplicationContext applicationContext,
                              @Value("${spring.security.oauth2.client.registration.google.client-id:your-google-client-id}") String googleClientId) {
        this.applicationContext = applicationContext;
        this.googleClientId = googleClientId;
    }

    @Override
    public void run(ApplicationArguments args) {
        Map<String, HandlerMapping> mappings = applicationContext.getBeansOfType(HandlerMapping.class);
        log.info("=== Registered Handler Mappings ===");
        mappings.forEach((name, mapping) -> log.info("  {} : {}", name, mapping.getClass().getSimpleName()));
        log.info("=== Total HandlerMapping beans: {} ===", mappings.size());

        log.info("Admin Dashboard bean present: {}", applicationContext.containsBean("adminDashboardController"));

        if (PLACEHOLDER_CLIENT_ID.equals(googleClientId)) {
            throw new IllegalStateException(
                "Google OAuth client is not configured. Create src/main/resources/application-dev.yml with the " +
                "spring.security.oauth2.client.registration.google.client-id/client-secret values, or set the " +
                "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
            );
        }
        log.info("Google OAuth client loaded: {}...", googleClientId.substring(0, Math.min(12, googleClientId.length())));
    }
}
