package com.lrplatform.service;

import com.lrplatform.config.RequestMetricsInterceptor;
import com.lrplatform.dto.response.SystemHealthResponse;
import com.lrplatform.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.lang.management.RuntimeMXBean;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Slf4j
public class SystemMonitorService {

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final RequestMetricsInterceptor requestMetricsInterceptor;

    @Autowired(required = false)
    private StringRedisTemplate stringRedisTemplate;

    public SystemMonitorService(JdbcTemplate jdbcTemplate, UserRepository userRepository,
                                 BookingRepository bookingRepository,
                                 EquipmentRepository equipmentRepository,
                                 LaboratoryRepository laboratoryRepository,
                                 RequestMetricsInterceptor requestMetricsInterceptor) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.requestMetricsInterceptor = requestMetricsInterceptor;
    }

    public SystemHealthResponse getSystemHealth() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        Runtime runtime = Runtime.getRuntime();

        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;

        if (totalMemory == 0) {
            long heapUsed = memoryBean.getHeapMemoryUsage().getUsed() / (1024 * 1024);
            long heapMax = memoryBean.getHeapMemoryUsage().getMax() / (1024 * 1024);
            totalMemory = heapMax > 0 ? heapMax : heapUsed;
            usedMemory = heapUsed;
            freeMemory = totalMemory - usedMemory;
        }

        boolean dbConnected = false;
        try {
            jdbcTemplate.execute("SELECT 1");
            dbConnected = true;
        } catch (Exception e) {
            log.warn("Database connection check failed: {}", e.getMessage());
        }

        boolean redisConnected = false;
        try {
            var factory = stringRedisTemplate != null ? stringRedisTemplate.getConnectionFactory() : null;
            if (factory != null) {
                String pong = factory.getConnection().ping();
                redisConnected = "PONG".equals(pong);
            }
        } catch (Exception e) {
            log.warn("Redis connection check failed: {}", e.getMessage());
        }

        Map<String, String> services = new LinkedHashMap<>();
        services.put("PostgreSQL", dbConnected ? "UP" : "DOWN");
        services.put("Redis", redisConnected ? "UP" : "DOWN");
        services.put("Application", "UP");
        services.put("JWT Auth", "UP");

        String overallStatus = dbConnected ? "UP" : "DEGRADED";

        // JVM details
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        MemoryUsage nonHeapUsage = memoryBean.getNonHeapMemoryUsage();

        // Disk usage
        File root = new File("/");
        long diskTotal = root.getTotalSpace() / (1024 * 1024 * 1024);
        long diskFree = root.getFreeSpace() / (1024 * 1024 * 1024);
        long diskUsed = diskTotal - diskFree;

        // Entity counts
        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        long totalEquipment = equipmentRepository.count();
        long totalLabs = laboratoryRepository.count();

        long activeBookings = bookingRepository.countByStatusIn(
                java.util.List.of(
                        com.lrplatform.model.enums.BookingStatus.APPROVED,
                        com.lrplatform.model.enums.BookingStatus.CONFIRMED,
                        com.lrplatform.model.enums.BookingStatus.IN_USE
                )
        );

        long activeUsers = userRepository.countByStatus(true);

        return SystemHealthResponse.builder()
                .status(overallStatus)
                .databaseConnected(dbConnected)
                .redisConnected(redisConnected)
                .totalMemoryMB(totalMemory)
                .usedMemoryMB(usedMemory)
                .freeMemoryMB(freeMemory)
                .availableProcessors(runtime.availableProcessors())
                .uptimeMs(runtimeBean.getUptime())
                .services(services)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalBookings(totalBookings)
                .activeBookings(activeBookings)
                .totalEquipment(totalEquipment)
                .totalLabs(totalLabs)
                .diskTotalGB(diskTotal)
                .diskUsedGB(diskUsed)
                .diskFreeGB(diskFree)
                .jvmHeapUsedMB(heapUsage.getUsed() / (1024.0 * 1024.0))
                .jvmHeapMaxMB(heapUsage.getMax() / (1024.0 * 1024.0))
                .jvmNonHeapUsedMB(nonHeapUsage.getUsed() / (1024.0 * 1024.0))
                .totalApiRequests(requestMetricsInterceptor.getTotalRequests())
                .avgResponseTimeMs(requestMetricsInterceptor.getAvgLatencyMs())
                .apiErrorCount(requestMetricsInterceptor.getErrorCount())
                .apiErrorRate(requestMetricsInterceptor.getErrorRate())
                .build();
    }
}
