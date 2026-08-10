package com.example.backend;

import com.example.backend.dto.BillingDTO;
import com.example.backend.dto.UtilizationStatsDTO;
import com.example.backend.entity.Billing;
import com.example.backend.entity.Equipment;
import com.example.backend.repository.BillingRepository;
import com.example.backend.service.BillingService;
import com.example.backend.service.EquipmentService;
import com.example.backend.service.UtilizationService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

@SpringBootTest
class EquipmentWorkflowTest {

    @Autowired
    private EquipmentService equipmentService;

    @Autowired
    private UtilizationService utilizationService;

    @Autowired
    private BillingService billingService;

    @Autowired
    private BillingRepository billingRepository;

    @Test
    @DisplayName("Test Equipment Save and Retrieval Workflow")
    void testEquipmentWorkflow() {
        Equipment equipment = new Equipment();
        equipment.setEquipmentName("Test High-Resolution Electron Microscope");
        equipment.setCategory("Microscopy");
        equipment.setQuantity(2);
        equipment.setAvailableQuantity(2);
        equipment.setStatus("AVAILABLE");

        Equipment saved = equipmentService.saveEquipment(equipment);
        Assertions.assertNotNull(saved.getId());

        Equipment fetched = equipmentService.getEquipmentById(saved.getId());
        Assertions.assertEquals("Test High-Resolution Electron Microscope", fetched.getEquipmentName());

        // Cleanup
        equipmentService.deleteEquipment(saved.getId());
    }

    @Test
    @DisplayName("Test Utilization Statistics Calculation")
    void testUtilizationStats() {
        UtilizationStatsDTO stats = utilizationService.getUtilizationStats();
        Assertions.assertNotNull(stats);
        Assertions.assertTrue(stats.getOverallUtilizationRate() >= 0);
    }

    @Test
    @DisplayName("Test Inter-Institution Billing Creation and Payment Workflow")
    void testBillingWorkflow() {
        Billing billing = new Billing();
        billing.setBookingId(999L);
        billing.setEquipmentId(1L);
        billing.setUserId(1L);
        billing.setHoursUsed(new BigDecimal("4.0"));
        billing.setHourlyRate(new BigDecimal("75.00"));
        billing.setTotalCost(new BigDecimal("300.00"));
        billing.setStatus("UNPAID");

        Billing saved = billingRepository.save(billing);
        Assertions.assertNotNull(saved.getBillingId());

        BillingDTO updated = billingService.updatePaymentStatus(saved.getBillingId(), "PAID", "TXN_TEST_9999");
        Assertions.assertEquals("PAID", updated.getStatus());
        Assertions.assertEquals("TXN_TEST_9999", updated.getPaymentReference());

        // Cleanup
        billingRepository.deleteById(saved.getBillingId());
    }
}
