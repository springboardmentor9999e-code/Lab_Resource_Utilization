package com.lrplatform.config;

import com.lrplatform.model.entity.*;
import com.lrplatform.model.enums.*;
import com.lrplatform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleConfigRepository roleConfigRepository;
    private final EquipmentCategoryRepository equipmentCategoryRepository;
    private final EquipmentTagRepository equipmentTagRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final AnnouncementRepository announcementRepository;
    private final BookingRepository bookingRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final DepartmentBudgetRepository departmentBudgetRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final NotificationRepository notificationRepository;
    private final SharedEquipmentRepository sharedEquipmentRepository;
    private final ExternalBookingRequestRepository externalBookingRequestRepository;
    private final InstitutionPartnershipRepository institutionPartnershipRepository;
    private final MaintenanceWorkOrderRepository maintenanceWorkOrderRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedRoleConfig();
        seedEquipmentCategories();
        seedEquipmentTags();
        Institution demoInst = seedInstitutions();
        List<Department> depts = seedDepartments(demoInst);
        Department mech = depts.get(0);
        Department cs = depts.get(1);
        Department ece = depts.get(2);
        List<User> users = seedUsers(demoInst, mech, cs);
        User admin = findUser(users, "admin@demouniversity.edu");
        User priya = findUser(users, "priya@demouniversity.edu");
        User arun = findUser(users, "arun@demouniversity.edu");
        User sneha = findUser(users, "sneha@demouniversity.edu");
        User selvakumar = findUser(users, "selvakumarkprof@gmail.com");
        User suresh = findUser(users, "suresh@demouniversity.edu");
        List<Laboratory> labs = seedLaboratories(mech, cs, ece);
        List<Equipment> equipmentList = seedEquipment(labs);
        Equipment cncMill = findByCode(equipmentList, "CNC-001");
        Equipment cncLathe = findByCode(equipmentList, "CNC-002");
        Equipment printer3d = findByCode(equipmentList, "3DP-001");
        Equipment electronMicro = findByCode(equipmentList, "MIC-001");
        seedMaintenanceWorkOrders(cncMill, cncLathe, printer3d, electronMicro, admin);
        seedAnnouncements(admin);
        seedInvoices(demoInst, List.of());
        seedPayments();
        seedDepartmentBudgets(mech, cs);
        seedNotificationPreferences(priya, admin);
        seedNotifications(admin, priya, arun, sneha, selvakumar);
        SharedEquipment sharedEquip = seedSharedEquipment(cncMill);
        seedExternalBookingRequests(sharedEquip, suresh, admin);
        seedInstitutionPartnerships();
        seedAuditLogs(admin, priya, arun, sneha, suresh);
        log.info("Data seeding completed");
    }

    private User findUser(List<User> users, String email) {
        return users.stream().filter(u -> u.getEmail().equals(email)).findFirst().orElse(null);
    }

    private Equipment findByCode(List<Equipment> list, String code) {
        return list.stream().filter(e -> e.getEquipmentCode().equals(code)).findFirst().orElse(null);
    }

    private Institution findInstByCode(String code) {
        return institutionRepository.findByInstitutionCode(code).orElse(null);
    }

    private void seedRoleConfig() {
        if (roleConfigRepository.count() > 0) return;
        for (UserRole role : UserRole.values()) {
            if (!roleConfigRepository.existsByRoleName(role.name())) {
                roleConfigRepository.save(RoleConfig.builder()
                        .roleName(role.name()).enabled(true).build());
            }
        }
        log.info("Seeded {} role configs", UserRole.values().length);
    }

    private void seedEquipmentCategories() {
        if (equipmentCategoryRepository.count() > 0) return;
        List.of(
                new Object[]{"Mechanical", "Mechanical engineering equipment including CNC machines, lathes, milling machines"},
                new Object[]{"Electrical", "Electrical engineering equipment including transformers, motors, generators"},
                new Object[]{"Electronics", "Electronics equipment including oscilloscopes, signal generators, multimeters"},
                new Object[]{"Computer Science", "Computing equipment including GPU servers, workstations, networking gear"},
                new Object[]{"Biomedical", "Biomedical engineering equipment including microscopes, centrifuges"},
                new Object[]{"Civil Engineering", "Civil engineering equipment including concrete testing, soil testing"},
                new Object[]{"Chemical Engineering", "Chemical engineering equipment including spectrometers, chromatographs"},
                new Object[]{"Physics", "Physics lab equipment including lasers, interferometers"},
                new Object[]{"Chemistry", "Chemistry lab equipment including analytical balances, fume hoods"},
                new Object[]{"Biology", "Biology lab equipment including PCR machines, incubators"}
        ).forEach(data -> equipmentCategoryRepository.save(
                EquipmentCategory.builder().categoryName((String) data[0]).description((String) data[1]).build()));
        log.info("Seeded 10 equipment categories");
    }

    private void seedEquipmentTags() {
        if (equipmentTagRepository.count() > 0) return;
        List.of("CNC", "5-Axis", "Precision", "High-Power", "Digital", "Analog", "Portable",
                "Desktop", "Industrial", "Research-Grade", "Automated", "Manual",
                "IoT-Enabled", "Networked", "Standalone").forEach(name ->
                equipmentTagRepository.save(EquipmentTag.builder().tagName(name).build()));
        log.info("Seeded 15 equipment tags");
    }

    private Institution seedInstitutions() {
        Institution demo = findInstByCode("DEMO001");
        if (demo != null) return demo;

        demo = institutionRepository.save(Institution.builder()
                .institutionCode("DEMO001").institutionName("Demo University")
                .email("admin@demouniversity.edu").phone("+91-1234567890")
                .website("https://demouniversity.edu").city("Bangalore")
                .state("Karnataka").country("India").status(true).build());

        if (findInstByCode("SIMATS") == null) {
            institutionRepository.save(Institution.builder()
                    .institutionCode("SIMATS").institutionName("SIMATS Engineering")
                    .email("simats.sse@saveetha.com").city("Chennai")
                    .state("Tamil Nadu").country("India").status(true).build());
        }
        if (findInstByCode("SEC") == null) {
            institutionRepository.save(Institution.builder()
                    .institutionCode("SEC").institutionName("SEC").status(true).build());
        }
        log.info("Seeded institutions");
        return demo;
    }

    private List<Department> seedDepartments(Institution demoInst) {
        Long demoId = demoInst.getId();
        Department mech = departmentRepository.findByDepartmentNameAndInstitutionId("Mechanical Engineering", demoId).orElse(null);
        if (mech != null) {
            Department cs = departmentRepository.findByDepartmentNameAndInstitutionId("Computer Science", demoId).orElseThrow();
            Department ece = departmentRepository.findByDepartmentNameAndInstitutionId("Electronics & Communication", demoId).orElseThrow();
            return List.of(mech, cs, ece);
        }

        mech = departmentRepository.save(Department.builder()
                .institution(demoInst).departmentName("Mechanical Engineering").status(true).build());
        Department cs = departmentRepository.save(Department.builder()
                .institution(demoInst).departmentName("Computer Science").status(true).build());
        Department ece = departmentRepository.save(Department.builder()
                .institution(demoInst).departmentName("Electronics & Communication").status(true).build());

        Institution simats = findInstByCode("SIMATS");
        if (simats != null) {
            Long simatsId = simats.getId();
            if (!departmentRepository.existsByDepartmentNameAndInstitutionId("CSE", simatsId)) {
                departmentRepository.save(Department.builder()
                        .institution(simats).departmentName("CSE").status(true).build());
            }
            if (!departmentRepository.existsByDepartmentNameAndInstitutionId("IT", simatsId)) {
                departmentRepository.save(Department.builder()
                        .institution(simats).departmentName("IT").status(true).build());
            }
        }
        log.info("Seeded departments");
        return List.of(mech, cs, ece);
    }

    private List<User> seedUsers(Institution demoInst, Department mech, Department cs) {
        User admin = userRepository.findByEmail("admin@demouniversity.edu").orElse(null);
        if (admin != null) return userRepository.findAll();

        String pw = passwordEncoder.encode("Password@123");

        admin = userRepository.save(User.builder()
                .firstName("Admin").lastName("System")
                .email("admin@demouniversity.edu").phone("+91-9999999999")
                .password(pw).institution(demoInst).role(UserRole.SYSTEM_ADMIN).status(true).build());

        User priya = userRepository.save(User.builder()
                .firstName("Priya").lastName("Sharma")
                .email("priya@demouniversity.edu").phone("+91-9876543210")
                .password(pw).institution(demoInst).department(mech).role(UserRole.LAB_MANAGER).status(true).build());

        userRepository.save(User.builder()
                .firstName("Rajesh").lastName("Kumar")
                .email("rajesh@demouniversity.edu").phone("+91-9876543211")
                .password(pw).institution(demoInst).department(mech).role(UserRole.LAB_TECHNICIAN).status(true).build());

        User arun = userRepository.save(User.builder()
                .firstName("Arun").lastName("Kumar")
                .email("arun@demouniversity.edu").phone("+91-9876543212")
                .password(pw).institution(demoInst).department(mech).role(UserRole.RESEARCHER).status(true).build());

        User sneha = userRepository.save(User.builder()
                .firstName("Sneha").lastName("Patel")
                .email("sneha@demouniversity.edu").phone("+91-9876543213")
                .password(pw).institution(demoInst).department(cs).role(UserRole.RESEARCHER).status(true).build());

        userRepository.save(User.builder()
                .firstName("Meena").lastName("Iyer")
                .email("meena@demouniversity.edu").phone("+91-9876543214")
                .password(pw).institution(demoInst).department(mech).role(UserRole.DEPARTMENT_HEAD).status(true).build());

        Institution simats = findInstByCode("SIMATS");
        Department simatsIT = simats != null
                ? departmentRepository.findByDepartmentNameAndInstitutionId("IT", simats.getId()).orElse(null)
                : null;

        userRepository.save(User.builder()
                .firstName("Selvakumar").lastName("K")
                .email("selvakumarkprof@gmail.com").phone("07639072595")
                .password(pw).institution(simats).department(simatsIT).role(UserRole.RESEARCHER).status(true).build());

        userRepository.save(User.builder()
                .firstName("Suresh").lastName("Nair")
                .email("suresh@demouniversity.edu").phone("+91-9876543215")
                .password(pw).institution(demoInst).role(UserRole.INSTITUTION_ADMIN).status(true).build());

        Institution secInst = findInstByCode("SEC");
        userRepository.save(User.builder()
                .firstName("SELVAKUMAR").lastName("K")
                .email("selvakumark1059.sse@saveetha.com")
                .password(pw).institution(secInst).role(UserRole.STUDENT).status(true).build());

        mech.setHod(priya);
        departmentRepository.save(mech);
        cs.setHod(priya);
        departmentRepository.save(cs);
        Department ece = departmentRepository.findByDepartmentNameAndInstitutionId("Electronics & Communication", demoInst.getId()).orElseThrow();
        ece.setHod(priya);
        departmentRepository.save(ece);

        log.info("Seeded 9 users");
        return userRepository.findAll();
    }

    private List<Laboratory> seedLaboratories(Department mech, Department cs, Department ece) {
        if (laboratoryRepository.count() > 0) return laboratoryRepository.findAll();

        laboratoryRepository.save(Laboratory.builder()
                .department(mech).laboratoryName("CNC Machining Lab")
                .location("Block A, Room 101").status(true).build());
        laboratoryRepository.save(Laboratory.builder()
                .department(mech).laboratoryName("Manufacturing Lab")
                .location("Block A, Room 102").status(true).build());
        laboratoryRepository.save(Laboratory.builder()
                .department(cs).laboratoryName("Programming Lab")
                .location("Block B, Room 201").status(true).build());
        laboratoryRepository.save(Laboratory.builder()
                .department(cs).laboratoryName("High Performance Computing Lab")
                .location("Block B, Room 202").status(true).build());
        laboratoryRepository.save(Laboratory.builder()
                .department(ece).laboratoryName("VLSI Design Lab")
                .location("Block C, Room 301").status(true).build());
        laboratoryRepository.save(Laboratory.builder()
                .department(ece).laboratoryName("Signal Processing Lab")
                .location("Block C, Room 302").status(true).build());

        log.info("Seeded 6 laboratories");
        return laboratoryRepository.findAll();
    }

    private List<Equipment> seedEquipment(List<Laboratory> labs) {
        if (equipmentRepository.count() > 0) return equipmentRepository.findAll();

        EquipmentCategory mechCat = equipmentCategoryRepository.findByCategoryName("Mechanical").orElseThrow();
        EquipmentCategory elecCat = equipmentCategoryRepository.findByCategoryName("Electronics").orElseThrow();
        EquipmentCategory csCat = equipmentCategoryRepository.findByCategoryName("Computer Science").orElseThrow();
        EquipmentCategory bioCat = equipmentCategoryRepository.findByCategoryName("Biomedical").orElseThrow();

        Laboratory cncLab = labs.get(0);
        Laboratory mfgLab = labs.get(1);
        Laboratory progLab = labs.get(2);
        Laboratory hpcLab = labs.get(3);
        Laboratory sigLab = labs.get(5);

        equipmentRepository.save(Equipment.builder()
                .equipmentCode("CNC-001").equipmentName("CNC Milling Machine")
                .category(mechCat).laboratory(cncLab)
                .manufacturer("Haas Automation").modelNumber("VF-2").serialNumber("SN-2024-001")
                .purchaseDate(LocalDate.of(2023, 1, 15)).purchaseCost(new BigDecimal("5000000.00"))
                .warrantyExpiry(LocalDate.of(2026, 1, 15)).status(EquipmentStatus.AVAILABLE)
                .maxBookingHours(8).description("3-axis CNC milling machine for precision machining")
                .hourlyRate(new BigDecimal("500.00")).build());

        equipmentRepository.save(Equipment.builder()
                .equipmentCode("CNC-002").equipmentName("CNC Lathe")
                .category(mechCat).laboratory(cncLab)
                .manufacturer("DMG Mori").modelNumber("CLX 350").serialNumber("SN-2024-002")
                .purchaseDate(LocalDate.of(2023, 3, 20)).purchaseCost(new BigDecimal("3500000.00"))
                .warrantyExpiry(LocalDate.of(2026, 3, 20)).status(EquipmentStatus.AVAILABLE)
                .maxBookingHours(8).description("CNC lathe for turning operations")
                .hourlyRate(new BigDecimal("350.00")).build());

        equipmentRepository.save(Equipment.builder()
                .equipmentCode("OSC-001").equipmentName("Digital Oscilloscope")
                .category(elecCat).laboratory(sigLab)
                .manufacturer("Tektronix").modelNumber("MDO3024").serialNumber("SN-2024-003")
                .purchaseDate(LocalDate.of(2023, 6, 10)).purchaseCost(new BigDecimal("250000.00"))
                .warrantyExpiry(LocalDate.of(2026, 6, 10)).status(EquipmentStatus.AVAILABLE)
                .maxBookingHours(6).description("200MHz 4-channel digital oscilloscope")
                .imageUrl("/uploads/equipment/equipment_3_99116aa3.webp")
                .hourlyRate(new BigDecimal("150.00")).build());

        equipmentRepository.save(Equipment.builder()
                .equipmentCode("GPU-001").equipmentName("GPU Server")
                .category(csCat).laboratory(hpcLab)
                .manufacturer("NVIDIA").modelNumber("DGX A100").serialNumber("SN-2024-004")
                .purchaseDate(LocalDate.of(2024, 1, 5)).purchaseCost(new BigDecimal("15000000.00"))
                .warrantyExpiry(LocalDate.of(2027, 1, 5)).status(EquipmentStatus.AVAILABLE)
                .maxBookingHours(24).description("High-performance GPU server for AI/ML workloads")
                .imageUrl("/uploads/equipment/equipment_4_0c719029.jpeg")
                .hourlyRate(new BigDecimal("2000.00")).build());

        equipmentRepository.save(Equipment.builder()
                .equipmentCode("3DP-001").equipmentName("3D Printer")
                .category(mechCat).laboratory(mfgLab)
                .manufacturer("Stratasys").modelNumber("F123").serialNumber("SN-2024-005")
                .purchaseDate(LocalDate.of(2023, 9, 1)).purchaseCost(new BigDecimal("1200000.00"))
                .warrantyExpiry(LocalDate.of(2025, 9, 1)).status(EquipmentStatus.AVAILABLE)
                .maxBookingHours(8).description("Industrial grade 3D printer for rapid prototyping")
                .hourlyRate(new BigDecimal("250.00")).build());

        equipmentRepository.save(Equipment.builder()
                .equipmentCode("MIC-001").equipmentName("Electron Microscope")
                .category(bioCat).laboratory(progLab)
                .manufacturer("JEOL").modelNumber("JSM-7600F").serialNumber("SN-2024-006")
                .purchaseDate(LocalDate.of(2022, 6, 15)).purchaseCost(new BigDecimal("25000000.00"))
                .warrantyExpiry(LocalDate.of(2025, 6, 15)).status(EquipmentStatus.UNDER_MAINTENANCE)
                .maxBookingHours(4).description("Field emission scanning electron microscope")
                .imageUrl("/uploads/equipment/equipment_6_8f236014.jpeg")
                .hourlyRate(new BigDecimal("1500.00")).build());

        log.info("Seeded 6 equipment");
        return equipmentRepository.findAll();
    }

    private void seedMaintenanceWorkOrders(Equipment cncMill, Equipment cncLathe,
                                           Equipment printer3d, Equipment electronMicro, User admin) {
        if (maintenanceWorkOrderRepository.count() > 0) return;

        maintenanceWorkOrderRepository.save(MaintenanceWorkOrder.builder()
                .equipment(printer3d).maintenanceType(MaintenanceType.PREVENTIVE)
                .priority("MEDIUM").createdBy(admin).status(WorkOrderStatus.COMPLETED)
                .completionDate(LocalDate.of(2026, 7, 22)).build());

        maintenanceWorkOrderRepository.save(MaintenanceWorkOrder.builder()
                .equipment(cncMill).maintenanceType(MaintenanceType.PREVENTIVE)
                .priority("MEDIUM").createdBy(admin).status(WorkOrderStatus.COMPLETED)
                .completionDate(LocalDate.of(2026, 7, 22)).build());

        maintenanceWorkOrderRepository.save(MaintenanceWorkOrder.builder()
                .equipment(cncMill).maintenanceType(MaintenanceType.PREVENTIVE)
                .priority("MEDIUM").createdBy(admin).status(WorkOrderStatus.COMPLETED)
                .completionDate(LocalDate.of(2026, 7, 23)).build());

        maintenanceWorkOrderRepository.save(MaintenanceWorkOrder.builder()
                .equipment(electronMicro).maintenanceType(MaintenanceType.PREVENTIVE)
                .priority("MEDIUM").createdBy(admin).status(WorkOrderStatus.CREATED)
                .scheduledDate(LocalDate.of(2026, 7, 24)).build());

        maintenanceWorkOrderRepository.save(MaintenanceWorkOrder.builder()
                .equipment(cncLathe).maintenanceType(MaintenanceType.PREVENTIVE)
                .priority("MEDIUM").createdBy(admin).status(WorkOrderStatus.COMPLETED)
                .completionDate(LocalDate.of(2026, 7, 24)).build());

        log.info("Seeded 5 maintenance work orders");
    }

    private void seedAnnouncements(User admin) {
        if (announcementRepository.count() > 0) return;
        announcementRepository.save(Announcement.builder()
                .title("Equipments").content("Can't book for 5 days")
                .announcementType("MAINTENANCE").priority("MEDIUM").targetAudience("ALL")
                .createdBy(admin).published(false).build());
        announcementRepository.save(Announcement.builder()
                .title("Equipments").content("All the equipments where scheduled for maintenance")
                .announcementType("GENERAL").priority("MEDIUM").targetAudience("ALL")
                .createdBy(admin).published(true)
                .publishedAt(LocalDateTime.of(2026, 7, 26, 9, 49, 48)).build());
        log.info("Seeded 2 announcements");
    }

    private void seedInvoices(Institution demo, List<Booking> e2eBookings) {
        if (invoiceRepository.count() > 0) return;

        invoiceRepository.save(Invoice.builder()
                .invoiceNumber("INV-2026-000001").institution(demo)
                .totalAmount(new BigDecimal("50000.00")).taxAmount(new BigDecimal("14.00"))
                .paymentStatus(PaymentStatus.PAID)
                .dueDate(LocalDate.of(2026, 7, 27)).build());

        if (e2eBookings.size() >= 2) {
            invoiceRepository.save(Invoice.builder()
                    .invoiceNumber("INV-2026-000002").institution(demo).booking(e2eBookings.get(0))
                    .totalAmount(new BigDecimal("10000000.00"))
                    .paymentStatus(PaymentStatus.PAID)
                    .dueDate(LocalDate.of(2026, 8, 26)).build());

            invoiceRepository.save(Invoice.builder()
                    .invoiceNumber("INV-2026-000003").institution(demo).booking(e2eBookings.get(1))
                    .totalAmount(new BigDecimal("4000.00"))
                    .paymentStatus(PaymentStatus.PENDING)
                    .dueDate(LocalDate.of(2026, 8, 26)).build());
        }

        log.info("Seeded {} invoice(s)", e2eBookings.size() >= 2 ? 3 : 1);
    }

    private void seedPayments() {
        if (paymentRepository.count() > 0) return;

        invoiceRepository.findByInvoiceNumber("INV-2026-000001").ifPresent(inv ->
                paymentRepository.save(Payment.builder()
                        .invoice(inv).paymentReference("PAY-20260727-XDC2")
                        .amountPaid(new BigDecimal("50014.00")).paymentMethod("BANK_TRANSFER")
                        .paymentDate(LocalDateTime.of(2026, 7, 27, 22, 2, 52))
                        .paymentStatus(PaymentStatus.PAID).build()));

        invoiceRepository.findByInvoiceNumber("INV-2026-000002").ifPresent(inv ->
                paymentRepository.save(Payment.builder()
                        .invoice(inv).paymentReference("MOCK-TXN-001")
                        .amountPaid(new BigDecimal("10000000.00")).paymentMethod("CREDIT_CARD")
                        .paymentDate(LocalDateTime.of(2026, 7, 27, 22, 20, 0))
                        .paymentStatus(PaymentStatus.PAID).build()));

        log.info("Seeded 2 payments");
    }

    private void seedDepartmentBudgets(Department mech, Department cs) {
        if (departmentBudgetRepository.count() > 0) return;

        departmentBudgetRepository.save(DepartmentBudget.builder()
                .department(mech).fiscalYear(2026)
                .budgetAmount(new BigDecimal("5000000.00"))
                .description("E2E test budget").build());

        departmentBudgetRepository.save(DepartmentBudget.builder()
                .department(cs).fiscalYear(2026)
                .budgetAmount(new BigDecimal("100000.00")).build());

        log.info("Seeded 2 department budgets");
    }

    private void seedNotificationPreferences(User priya, User admin) {
        if (notificationPreferenceRepository.count() > 0) return;

        List.of(priya, admin).forEach(user -> {
            for (String type : List.of("BOOKING_CREATED", "BOOKING_APPROVED", "BOOKING_REJECTED",
                    "BOOKING_CANCELLED", "BOOKING_REMINDER", "MAINTENANCE_SCHEDULED",
                    "MAINTENANCE_COMPLETED", "CALIBRATION_DUE", "EQUIPMENT_AVAILABLE",
                    "WAITLIST_PROMOTED", "PARTNERSHIP_INVITATION", "ANNOUNCEMENT",
                    "PASSWORD_RESET", "GENERAL")) {
                notificationPreferenceRepository.save(NotificationPreference.builder()
                        .user(user).notificationType(type)
                        .emailEnabled(true).inAppEnabled(true).smsEnabled(false).pushEnabled(true)
                        .build());
            }
        });

        log.info("Seeded 28 notification preferences");
    }

    private void seedNotifications(User admin, User priya, User arun, User sneha, User selvakumar) {
        if (notificationRepository.count() > 0) return;

        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #1 for CNC Milling Machine has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 22, 23, 45, 40)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #3 for 3D Printer has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 22, 23, 45, 40)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #2 for CNC Milling Machine has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 22, 23, 45, 40)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #4 for 3D Printer has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 22, 23, 45, 40)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #6 for 3D Printer has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 22, 23, 53, 32)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #7 for Electron Microscope has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 22, 23, 53, 32)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #5 for 3D Printer has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 22, 23, 53, 32)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #8 for Electron Microscope has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 22, 23, 53, 32)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #10 for CNC Lathe has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 22, 23, 53, 32)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #11 for 3D Printer has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 22, 23, 53, 32)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #13 for CNC Milling Machine has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 23, 0, 18, 29)).build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #13 for CNC Milling Machine has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 23, 0, 18, 29)).build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("Work Order Completed").message("Work order #9 for 3D Printer has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("READ").readAt(LocalDateTime.of(2026, 7, 23, 0, 22, 34)).build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Sneha Patel has requested to book Digital Oscilloscope on 2026-07-22")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book Digital Oscilloscope on 2026-07-23")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book 3D Printer on 2026-07-23")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(sneha)
                .title("Booking Approved").message("Your booking for Digital Oscilloscope on 2026-07-22 has been approved.")
                .notificationType(NotificationType.BOOKING_APPROVED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(arun)
                .title("Booking Rejected").message("Your booking for Digital Oscilloscope on 2026-07-23 has been rejected. Reason: Rejected")
                .notificationType(NotificationType.BOOKING_REJECTED).priority(NotificationPriority.HIGH)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Priya Sharma has requested to book Electron Microscope on 2026-07-23")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book GPU Server on 2026-07-23")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book Electron Microscope on 2026-07-23")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book CNC Milling Machine on 2026-07-25")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book Digital Oscilloscope on 2026-07-24")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(arun)
                .title("Booking Approved").message("Your booking for 3D Printer on 2026-07-23 has been approved.")
                .notificationType(NotificationType.BOOKING_APPROVED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(arun)
                .title("Booking Approved").message("Your booking for GPU Server on 2026-07-23 has been approved.")
                .notificationType(NotificationType.BOOKING_APPROVED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Selvakumar K has requested to book Digital Oscilloscope on 2026-07-24")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(selvakumar)
                .title("Booking Approved").message("Your booking for Digital Oscilloscope on 2026-07-24 has been approved.")
                .notificationType(NotificationType.BOOKING_APPROVED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book Digital Oscilloscope on 2026-07-25")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book Electron Microscope on 2026-07-24")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("Booking Approved").message("Your booking for Electron Microscope on 2026-07-23 has been approved.")
                .notificationType(NotificationType.BOOKING_APPROVED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(admin)
                .title("Work Order Completed").message("Work order #16 for CNC Lathe has been completed.")
                .notificationType(NotificationType.MAINTENANCE_COMPLETED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(arun)
                .title("Booking Approved").message("Your booking for Electron Microscope on 2026-07-23 has been approved.")
                .notificationType(NotificationType.BOOKING_APPROVED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book 3D Printer on 2026-07-25")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book CNC Milling Machine on 2026-07-28")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(arun)
                .title("Booking Approved").message("Your booking for CNC Milling Machine on 2026-07-28 has been approved.")
                .notificationType(NotificationType.BOOKING_APPROVED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(arun)
                .title("Booking Completed").message("Your booking for CNC Milling Machine on 2026-07-28 has been marked as completed.")
                .notificationType(NotificationType.BOOKING_APPROVED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(priya)
                .title("New Booking Request").message("Arun Kumar has requested to book GPU Server on 2026-07-29")
                .notificationType(NotificationType.BOOKING_CREATED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(arun)
                .title("Booking Approved").message("Your booking for GPU Server on 2026-07-29 has been approved.")
                .notificationType(NotificationType.BOOKING_APPROVED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());
        notificationRepository.save(Notification.builder().user(arun)
                .title("Booking Completed").message("Your booking for GPU Server on 2026-07-29 has been marked as completed.")
                .notificationType(NotificationType.BOOKING_APPROVED).priority(NotificationPriority.MEDIUM)
                .status("UNREAD").build());

        log.info("Seeded 40 notifications");
    }

    private SharedEquipment seedSharedEquipment(Equipment cncMill) {
        if (sharedEquipmentRepository.count() > 0) return sharedEquipmentRepository.findAll().get(0);

        SharedEquipment se = sharedEquipmentRepository.save(SharedEquipment.builder()
                .equipment(cncMill)
                .hourlyRate(new BigDecimal("500.00"))
                .dailyRate(new BigDecimal("1000.00"))
                .securityDeposit(new BigDecimal("250.00"))
                .sharingStatus("ACTIVE").build());
        log.info("Seeded shared equipment (CNC-001)");
        return se;
    }

    private void seedExternalBookingRequests(SharedEquipment sharedEquip, User suresh, User admin) {
        if (externalBookingRequestRepository.count() > 0) return;

        Institution simats = findInstByCode("SIMATS");
        if (simats == null || sharedEquip == null) return;

        externalBookingRequestRepository.save(ExternalBookingRequest.builder()
                .sharedEquipment(sharedEquip).requestingInstitution(simats).requestedBy(admin)
                .bookingDate(LocalDate.of(2026, 7, 27))
                .startTime(LocalTime.of(9, 6)).endTime(LocalTime.of(13, 6))
                .status("APPROVED").approvedBy(admin).build());

        externalBookingRequestRepository.save(ExternalBookingRequest.builder()
                .sharedEquipment(sharedEquip).requestingInstitution(simats).requestedBy(suresh)
                .bookingDate(LocalDate.of(2026, 7, 27))
                .startTime(LocalTime.of(14, 19)).endTime(LocalTime.of(15, 19))
                .status("PENDING").build());

        log.info("Seeded 2 external booking requests");
    }

    private void seedInstitutionPartnerships() {
        if (institutionPartnershipRepository.count() > 0) return;

        Institution demo = findInstByCode("DEMO001");
        Institution simats = findInstByCode("SIMATS");
        if (demo == null || simats == null) return;

        institutionPartnershipRepository.save(InstitutionPartnership.builder()
                .institutionA(demo).institutionB(simats)
                .agreementStart(LocalDate.of(2026, 7, 26))
                .agreementEnd(LocalDate.of(2026, 7, 27))
                .status("ACTIVE").build());
        log.info("Seeded institution partnership");
    }

    private void seedAuditLogs(User admin, User priya, User arun, User sneha, User suresh) {
        if (auditLogRepository.count() > 0) return;

        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("AUTH").action("LOGIN").entityType("User")
                .result("SUCCESS").ipAddress("192.168.1.100").build());
        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("AUTH").action("LOGIN").entityType("User")
                .result("SUCCESS").ipAddress("192.168.1.100").build());
        auditLogRepository.save(AuditLog.builder()
                .user(priya).module("AUTH").action("LOGIN").entityType("User")
                .result("SUCCESS").ipAddress("192.168.1.101").build());
        auditLogRepository.save(AuditLog.builder()
                .user(arun).module("AUTH").action("LOGIN").entityType("User")
                .result("SUCCESS").ipAddress("192.168.1.102").build());
        auditLogRepository.save(AuditLog.builder()
                .user(sneha).module("AUTH").action("LOGIN").entityType("User")
                .result("SUCCESS").ipAddress("192.168.1.103").build());
        auditLogRepository.save(AuditLog.builder()
                .user(suresh).module("AUTH").action("LOGIN").entityType("User")
                .result("SUCCESS").ipAddress("192.168.1.104").build());
        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("EQUIPMENT").action("CREATE").entityType("Equipment")
                .entityId(1L).newValue("CNC Milling Machine")
                .result("SUCCESS").ipAddress("192.168.1.100").build());
        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("EQUIPMENT").action("UPDATE").entityType("Equipment")
                .entityId(3L).newValue("Digital Oscilloscope")
                .result("SUCCESS").ipAddress("192.168.1.100").build());
        auditLogRepository.save(AuditLog.builder()
                .user(priya).module("BOOKING").action("APPROVE").entityType("Booking")
                .entityId(1L).newValue("Approved")
                .result("SUCCESS").ipAddress("192.168.1.101").build());
        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("BOOKING").action("APPROVE").entityType("Booking")
                .entityId(5L).newValue("Approved")
                .result("SUCCESS").ipAddress("192.168.1.100").build());
        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("BOOKING").action("REJECT").entityType("Booking")
                .entityId(2L).newValue("Rejected - Schedule conflict")
                .result("SUCCESS").ipAddress("192.168.1.100").build());
        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("MAINTENANCE").action("CREATE").entityType("MaintenanceWorkOrder")
                .entityId(1L).newValue("Preventive maintenance for 3D Printer")
                .result("SUCCESS").ipAddress("192.168.1.100").build());
        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("MAINTENANCE").action("UPDATE_STATUS").entityType("MaintenanceWorkOrder")
                .entityId(1L).newValue("COMPLETED")
                .result("SUCCESS").ipAddress("192.168.1.100").build());
        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("USER_MANAGEMENT").action("CREATE").entityType("User")
                .entityId(4L).newValue("sneha@demouniversity.edu")
                .result("SUCCESS").ipAddress("192.168.1.100").build());
        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("USER_MANAGEMENT").action("CHANGE_ROLE").entityType("User")
                .entityId(3L).oldValue("STUDENT").newValue("RESEARCHER")
                .result("SUCCESS").ipAddress("192.168.1.100").build());
        auditLogRepository.save(AuditLog.builder()
                .user(priya).module("INSTITUTION").action("UPDATE").entityType("Institution")
                .entityId(1L).newValue("Updated institution details")
                .result("SUCCESS").ipAddress("192.168.1.101").build());
        auditLogRepository.save(AuditLog.builder()
                .user(admin).module("ANNOUNCEMENT").action("PUBLISH").entityType("Announcement")
                .entityId(2L).newValue("Equipment maintenance announcement published")
                .result("SUCCESS").ipAddress("192.168.1.100").build());

        log.info("Seeded 18 audit logs");
    }
}
