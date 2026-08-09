package com.labresource.platform.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

class ControllerAuthorizationMatrixTest {

    @Test
    void bookingControllerUsesAcademicPermissionMatrix() {
        assertMethodRule(
                BookingController.class,
                "createBooking",
                "hasAnyAuthority('ROLE_STUDENT', 'ROLE_ASSISTANT_PROFESSOR', 'ROLE_PROFESSOR', 'ROLE_SYSTEM_ADMIN')"
        );
        assertMethodRule(
                BookingController.class,
                "getAllBookings",
                "hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_HOD', 'ROLE_SYSTEM_ADMIN')"
        );
        assertMethodRule(
                BookingController.class,
                "approveBooking",
                "hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_SYSTEM_ADMIN')"
        );
        assertMethodRule(
                BookingController.class,
                "cancelBooking",
                "hasAnyAuthority('ROLE_STUDENT', 'ROLE_LAB_ASSISTANT', 'ROLE_ASSISTANT_PROFESSOR', 'ROLE_PROFESSOR', 'ROLE_SYSTEM_ADMIN')"
        );
    }

    @Test
    void maintenanceControllerUsesOperationalAndReadOnlyMatrix() {
        assertMethodRule(
                MaintenanceController.class,
                "createMaintenance",
                "hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_SYSTEM_ADMIN')"
        );
        assertMethodRule(
                MaintenanceController.class,
                "getAllMaintenance",
                "hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_HOD', 'ROLE_SYSTEM_ADMIN')"
        );
        assertMethodRule(
                MaintenanceController.class,
                "updateMaintenance",
                "hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_SYSTEM_ADMIN')"
        );
    }

    @Test
    void analyticsAndUserControllersUseOversightAndAdminRules() {
        assertMethodRule(
                AnalyticsController.class,
                "getAnalyticsOverview",
                "hasAnyAuthority('ROLE_HOD', 'ROLE_SYSTEM_ADMIN')"
        );

        PreAuthorize userControllerRule = UserController.class.getAnnotation(PreAuthorize.class);
        assertThat(userControllerRule).isNotNull();
        assertThat(userControllerRule.value()).isEqualTo("hasAuthority('ROLE_SYSTEM_ADMIN')");
    }

    private void assertMethodRule(Class<?> controllerClass, String methodName, String expectedRule) {
        PreAuthorize annotation = Arrays.stream(controllerClass.getDeclaredMethods())
                .filter(method -> method.getName().equals(methodName))
                .findFirst()
                .orElseThrow()
                .getAnnotation(PreAuthorize.class);

        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo(expectedRule);
    }
}
