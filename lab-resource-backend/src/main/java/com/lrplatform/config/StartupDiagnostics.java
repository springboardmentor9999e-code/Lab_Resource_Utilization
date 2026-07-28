package com.lrplatform.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

@Component
@Slf4j
public class StartupDiagnostics implements ApplicationRunner {

    private final ApplicationContext applicationContext;

    public StartupDiagnostics(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(ApplicationArguments args) {
        Map<String, HandlerMapping> mappings = applicationContext.getBeansOfType(HandlerMapping.class);
        log.info("=== Registered Handler Mappings ===");
        mappings.forEach((name, mapping) -> log.info("  {} : {}", name, mapping.getClass().getSimpleName()));
        log.info("=== Total HandlerMapping beans: {} ===", mappings.size());

        log.info("Admin Dashboard bean present: {}", applicationContext.containsBean("adminDashboardController"));
    }
}
