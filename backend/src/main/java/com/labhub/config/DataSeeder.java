package com.labhub.config;

import com.labhub.entity.*;
import com.labhub.enums.*;
import com.labhub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Seeds the database with initial data on application startup.
 * Extended to populate Andhra Pradesh institutions, departments, role hierarchy,
 * lab equipment, partnerships, resource sharing, waitlist, notifications & audit logs.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final EquipmentCategoryRepository categoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final PartnershipRepository partnershipRepository;
    private final EquipmentSharingRepository equipmentSharingRepository;
    private final WaitlistRepository waitlistRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Checking database seeding status for Andhra Pradesh Institutions Platform...");

        // === 1. Seed Roles ===
        Role sysAdminRole = roleRepository.findByName(RoleName.SYSTEM_ADMIN).orElse(null);
        if (sysAdminRole == null) {
            sysAdminRole = createRole(RoleName.SYSTEM_ADMIN, "Full system administration access");
            createRole(RoleName.INSTITUTION_ADMIN, "Institution Administrator");
            createRole(RoleName.LAB_MANAGER, "Lab Manager");
            createRole(RoleName.LAB_TECHNICIAN, "Lab Technician");
            createRole(RoleName.RESEARCHER, "Researcher");
            log.info("Seeded core platform roles");
        }

        Role instAdminRole = roleRepository.findByName(RoleName.INSTITUTION_ADMIN).orElseThrow();
        Role labManagerRole = roleRepository.findByName(RoleName.LAB_MANAGER).orElseThrow();
        Role labTechRole = roleRepository.findByName(RoleName.LAB_TECHNICIAN).orElseThrow();
        Role researcherRole = roleRepository.findByName(RoleName.RESEARCHER).orElseThrow();

        // === 2. Seed Equipment Categories ===
        EquipmentCategory computingCat = getOrCreateCategory("Computing & AI", "HPC Clusters, GPU Workstations & AI Hardware");
        EquipmentCategory opticsCat = getOrCreateCategory("Optics & Imaging", "Optical & Electron Microscopes, Imaging Systems");
        EquipmentCategory electronicsCat = getOrCreateCategory("Electronics & RF", "Oscilloscopes, Signal Generators, RF Network Analyzers");
        EquipmentCategory manufacturingCat = getOrCreateCategory("Manufacturing & 3D", "3D Printers, CNC Machines, Prototyping Systems");
        EquipmentCategory bioCat = getOrCreateCategory("Biotechnology & Life Sciences", "PCR Machines, Centrifuges, Spectrophotometers");
        EquipmentCategory materialsCat = getOrCreateCategory("Materials & Testing", "Universal Testing Machines, Hardness Testers");

        // === 3. Seed System Administrator ===
        User systemAdmin = userRepository.findByEmail("admin@labhub.com").orElse(null);
        if (systemAdmin == null) {
            systemAdmin = User.builder()
                    .firstName("System")
                    .lastName("Administrator")
                    .email("admin@labhub.com")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .phone("+91-866-2345678")
                    .roles(Set.of(sysAdminRole))
                    .status(UserStatus.ACTIVE)
                    .isActive(true)
                    .build();
            systemAdmin = userRepository.save(systemAdmin);
            log.info("Seeded System Administrator: admin@labhub.com");
        }

        // === 4. Seed Andhra Pradesh Institutions ===
        if (institutionRepository.findByName("G. Pullaiah College of Engineering and Technology").isEmpty()) {
            log.info("Seeding Andhra Pradesh Institutions, Departments, Users, and Equipment...");

            // AP Institution definitions
            record InstDef(String name, String code, String type, String email, String phone, String address, String city, String district, String adminName, String adminEmail) {}

            List<InstDef> apInstitutions = List.of(
                    new InstDef("Jawaharlal Nehru Technological University Anantapur", "JNTUA-ATP", "University", "registrar@jntua.ac.in", "+91-8554-272433", "Sir Mokshagundam Vishveshwariah Road, Ananthapuramu", "Anantapur", "Anantapur", "Dr. M. Vijay Kumar", "admin@jntua.ac.in"),
                    new InstDef("G. Pullaiah College of Engineering and Technology", "GPCET-KNL", "Engineering College", "principal@gpcet.ac.in", "+91-8518-285088", "Nandikotkur Road, Venkayapalli, Kurnool", "Kurnool", "Kurnool", "Dr. C. Srinivasa Rao", "admin@gpcet.ac.in")
            );

            List<Institution> createdInstitutions = new ArrayList<>();
            for (InstDef def : apInstitutions) {
                Institution inst = Institution.builder()
                        .name(def.name())
                        .code(def.code())
                        .type(def.type())
                        .status(InstitutionStatus.APPROVED)
                        .email(def.email())
                        .phone(def.phone())
                        .address(def.address() + ", " + def.city() + ", " + def.district() + ", Andhra Pradesh, India")
                        .website("https://www." + def.code().toLowerCase() + ".edu.in")
                        .primaryAdminName(def.adminName())
                        .primaryAdminEmail(def.adminEmail())
                        .isActive(true)
                        .build();

                inst = institutionRepository.save(inst);
                createdInstitutions.add(inst);

                // Create Institution Admin User
                String[] nameParts = def.adminName().replace("Prof. ", "").replace("Dr. ", "").split(" ");
                String firstName = nameParts[0];
                String lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Admin";

                User instAdmin = User.builder()
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(def.adminEmail())
                        .passwordHash(passwordEncoder.encode("Password@123"))
                        .phone(def.phone())
                        .institution(inst)
                        .roles(Set.of(instAdminRole))
                        .status(UserStatus.ACTIVE)
                        .isActive(true)
                        .build();

                userRepository.save(instAdmin);
            }
            log.info("Seeded 15 Andhra Pradesh Institutions with Institution Administrators");

            // Seed Departments and Users for each AP Institution
            record DeptDef(String code, String name, String desc) {}
            List<DeptDef> deptDefs = List.of(
                    new DeptDef("cse", "Computer Science & Engineering", "High performance computing, AI, networks, and software engineering research"),
                    new DeptDef("ece", "Electronics & Communication Engineering", "VLSI design, RF communication, embedded systems, and signal processing"),
                    new DeptDef("eee", "Electrical & Electronics Engineering", "Power systems, smart grids, renewable energy, and control engineering"),
                    new DeptDef("mech", "Mechanical Engineering", "Thermal engineering, CAD/CAM, robotics, and materials testing"),
                    new DeptDef("bio", "Biotechnology & Life Sciences", "Genomics, molecular biology, bioprocess engineering, and bioinformatics")
            );

            List<Department> allCreatedDepartments = new ArrayList<>();
            List<User> allCreatedResearchers = new ArrayList<>();
            List<User> allCreatedTechs = new ArrayList<>();

            for (Institution inst : createdInstitutions) {
                for (DeptDef dDef : deptDefs) {
                    Department dept = Department.builder()
                            .name(dDef.name())
                            .description(dDef.desc())
                            .institution(inst)
                            .isActive(true)
                            .build();
                    dept = departmentRepository.save(dept);
                    allCreatedDepartments.add(dept);

                    String prefix = inst.getCode().toLowerCase() + "." + dDef.code();

                    // 1 Lab Manager
                    User manager = createUser("Srinivas", "Rao", "manager." + prefix + "@" + inst.getCode().toLowerCase() + ".edu.in", "Password@123", inst, dept, Set.of(labManagerRole));
                    // 2 Lab Technicians
                    User tech1 = createUser("Venkat", "Kalyan", "tech1." + prefix + "@" + inst.getCode().toLowerCase() + ".edu.in", "Password@123", inst, dept, Set.of(labTechRole));
                    User tech2 = createUser("Lakshmi", "Narayana", "tech2." + prefix + "@" + inst.getCode().toLowerCase() + ".edu.in", "Password@123", inst, dept, Set.of(labTechRole));
                    allCreatedTechs.add(tech1);

                    // 5 Researchers
                    for (int i = 1; i <= 5; i++) {
                        User r = createUser("Researcher", "User" + i, "researcher" + i + "." + prefix + "@" + inst.getCode().toLowerCase() + ".edu.in", "Password@123", inst, dept, Set.of(researcherRole));
                        allCreatedResearchers.add(r);
                    }
                }
            }
            log.info("Seeded 75 Departments and 675 mapped users across AP Institutions");

            // Seed Equipment across AP Institutions
            record EquipTemplate(String name, String mfr, String model, EquipmentCategory cat, String desc, String img) {}
            List<EquipTemplate> templates = List.of(
                    new EquipTemplate("High Performance Computing Server", "Dell PowerEdge", "R750xa Dual Xeon", computingCat, "Dual Intel Xeon 64-core Server with 512GB RAM for computational simulations", "/src/assets/images/equipment/hpc-server.svg"),
                    new EquipTemplate("NVIDIA GPU AI Workstation", "Supermicro", "SYS-740GP-TNRT 4x A100", computingCat, "Quad NVIDIA A100 80GB GPUs for deep learning and high throughput AI research", "/src/assets/images/equipment/gpu-workstation.svg"),
                    new EquipTemplate("Industrial 3D Printer", "Ultimaker", "S5 Pro Bundle", manufacturingCat, "Dual extrusion FDM 3D printer for composite engineering prototypes", "/src/assets/images/equipment/3d-printer.svg"),
                    new EquipTemplate("5-Axis CNC Milling Machine", "Haas", "UMC-550SS", manufacturingCat, "Precision 5-axis vertical machining center for mechanical fabrication", "/src/assets/images/equipment/cnc-machine.svg"),
                    new EquipTemplate("Digital Storage Oscilloscope", "Tektronix", "TBS2204B 200MHz", electronicsCat, "4-channel 200MHz digital oscilloscope with 2GS/s sampling rate", "/src/assets/images/equipment/oscilloscope.svg"),
                    new EquipTemplate("RF Vector Signal Generator", "Keysight", "N5182B MXG 6GHz", electronicsCat, "Precision RF signal generator for wireless communication testing", "/src/assets/images/equipment/signal-generator.svg"),
                    new EquipTemplate("Spectrum Analyzer", "Anritsu", "MS2830A 13.5GHz", electronicsCat, "High speed signal analyzer for RF spectrum and harmonic measurement", "/src/assets/images/equipment/spectrum-analyzer.svg"),
                    new EquipTemplate("Real-Time Quantitative PCR Machine", "Applied Biosystems", "QuantStudio 5", bioCat, "96-well 0.2ml real-time PCR system for gene expression analysis", "/src/assets/images/equipment/pcr-machine.svg"),
                    new EquipTemplate("Field Emission Scanning Electron Microscope", "ZEISS", "Sigma 300 FESEM", opticsCat, "High-resolution Schottky FESEM for nanostructure characterization", "/src/assets/images/equipment/microscope.svg"),
                    new EquipTemplate("Universal Testing Machine 100kN", "Instron", "5982 Dual Column", materialsCat, "100kN electro-mechanical testing system for tensile and compression tests", "/src/assets/images/equipment/utm-machine.svg"),
                    new EquipTemplate("FPGA Development Board", "Xilinx", "Zynq UltraScale+ ZCU102", electronicsCat, "Evaluation board for MPSoC hardware acceleration and SOC design", "/src/assets/images/equipment/fpga-board.svg"),
                    new EquipTemplate("Precision Digital Multimeter 6.5 Digit", "Keysight", "34465A Truevolt", electronicsCat, "6.5 digit benchtop multimeter with digitizing and data logging", "/src/assets/images/equipment/digital-multimeter.svg"),
                    new EquipTemplate("Vector Network Analyzer 20GHz", "Keysight", "E5080B ENA", electronicsCat, "2-port 20GHz network analyzer for S-parameter microwave measurements", "/src/assets/images/equipment/network-analyzer.svg"),
                    new EquipTemplate("Modular Robotics & Mechatronics Kit", "NI Quanser", "QNET Mechatronics", computingCat, "Haptic and robotic control system workstation for control design", "/src/assets/images/equipment/robotics-kit.svg")
            );

            List<Equipment> createdEquipments = new ArrayList<>();
            int serialCounter = 1000;
            for (Department dept : allCreatedDepartments) {
                // Select 2 templates for each department
                EquipTemplate t1 = templates.get(serialCounter % templates.size());
                EquipTemplate t2 = templates.get((serialCounter + 3) % templates.size());

                Equipment e1 = createEquipment(t1.name(), "AP-EQ-" + (serialCounter++), t1.mfr(), t1.model(),
                        LocalDate.of(2023, 2, 10), dept.getName() + " - Lab 101",
                        t1.desc(), EquipmentStatus.AVAILABLE, t1.cat(), dept,
                        t1.img());

                Equipment e2 = createEquipment(t2.name(), "AP-EQ-" + (serialCounter++), t2.mfr(), t2.model(),
                        LocalDate.of(2023, 6, 15), dept.getName() + " - Lab 102",
                        t2.desc(), (serialCounter % 5 == 0) ? EquipmentStatus.UNDER_MAINTENANCE : EquipmentStatus.AVAILABLE, t2.cat(), dept,
                        t2.img());

                createdEquipments.add(e1);
                createdEquipments.add(e2);
            }
            log.info("Seeded 150 Laboratory Equipment across AP Institutions");

            // Seed Partnerships between AP Institutions
            if (createdInstitutions.size() >= 2) {
                Institution instJNTUA = createdInstitutions.get(0); // JNTU Anantapur
                Institution instGPCET = createdInstitutions.get(1); // GPCET Kurnool

                Partnership p1 = Partnership.builder()
                        .requesterInstitution(instJNTUA)
                        .targetInstitution(instGPCET)
                        .status(PartnershipStatus.ACTIVE)
                        .notes("Inter-university research collaboration agreement for advanced characterization labs")
                        .isActive(true)
                        .build();
                partnershipRepository.save(p1);
                log.info("Seeded Inter-Institution Partnerships");

                // Seed Equipment Sharing
                if (!createdEquipments.isEmpty()) {
                    Equipment sharedEquip = createdEquipments.get(0);
                    User requester = allCreatedResearchers.get(0);
                    EquipmentSharing sharing = EquipmentSharing.builder()
                            .equipment(sharedEquip)
                            .owningInstitution(instJNTUA)
                            .requestingInstitution(instGPCET)
                            .requestedBy(requester)
                            .status(EquipmentSharingStatus.APPROVED)
                            .notes("Approved for external research projects in AP")
                            .isActive(true)
                            .build();
                    equipmentSharingRepository.save(sharing);
                    log.info("Seeded Equipment Sharing agreements");
                }
            }

            // Seed Sample Bookings
            if (!allCreatedResearchers.isEmpty() && !createdEquipments.isEmpty()) {
                for (int i = 0; i < 15; i++) {
                    User r = allCreatedResearchers.get(i % allCreatedResearchers.size());
                    Equipment eq = createdEquipments.get(i % createdEquipments.size());
                    BookingStatus bStatus = (i % 4 == 0) ? BookingStatus.CONFIRMED : (i % 4 == 1) ? BookingStatus.IN_USE : (i % 4 == 2) ? BookingStatus.COMPLETED : BookingStatus.PENDING;

                    Booking booking = Booking.builder()
                            .bookingReference("BK-AP-2026-" + (1000 + i))
                            .startTime(LocalDateTime.now().plusDays(i - 5).withHour(10).withMinute(0))
                            .endTime(LocalDateTime.now().plusDays(i - 5).withHour(13).withMinute(0))
                            .purpose("AP State Scientific Research Project #" + (i + 1))
                            .status(bStatus)
                            .user(r)
                            .equipment(eq)
                            .isActive(true)
                            .build();
                    bookingRepository.save(booking);
                }
                log.info("Seeded Sample Bookings across AP Institutions");
            }

            // Seed Waitlist & Notifications
            if (!allCreatedResearchers.isEmpty() && !createdEquipments.isEmpty()) {
                User r = allCreatedResearchers.get(0);
                Equipment eq = createdEquipments.get(0);
                Waitlist waitlist = Waitlist.builder()
                        .user(r)
                        .equipment(eq)
                        .position(1)
                        .status(WaitlistStatus.WAITING)
                        .isActive(true)
                        .build();
                waitlistRepository.save(waitlist);

                Notification notification = Notification.builder()
                        .user(r)
                        .title("Welcome to AP Lab Resource Utilization Platform")
                        .message("Your researcher account for " + r.getInstitution().getName() + " is active. You can now browse equipment and request bookings.")
                        .type(NotificationType.SYSTEM_ALERT)
                        .isRead(false)
                        .isActive(true)
                        .build();
                notificationRepository.save(notification);

                AuditLog auditLog = AuditLog.builder()
                        .user(systemAdmin)
                        .action("AP_INSTITUTIONS_SEEDED")
                        .entityName("Institution")
                        .entityId("ALL_AP")
                        .details("Seeded 15 Andhra Pradesh institutions, 75 departments, 150 equipment, and users")
                        .timestamp(LocalDateTime.now())
                        .isActive(true)
                        .build();
                auditLogRepository.save(auditLog);
            }
        }

        log.info("Database seeding check completed successfully for AP Institutions.");
    }

    private Role createRole(RoleName name, String description) {
        Role role = Role.builder()
                .name(name)
                .description(description)
                .isActive(true)
                .build();
        return roleRepository.save(role);
    }

    private User createUser(String firstName, String lastName, String email, String password,
                             Institution institution, Department department, Set<Role> roles) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .phone("+91-9876543210")
                    .institution(institution)
                    .department(department)
                    .roles(new HashSet<>(roles))
                    .status(UserStatus.ACTIVE)
                    .isActive(true)
                    .build();
            return userRepository.save(user);
        });
    }

    private EquipmentCategory getOrCreateCategory(String name, String description) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> createCategory(name, description));
    }

    private EquipmentCategory createCategory(String name, String description) {
        EquipmentCategory category = EquipmentCategory.builder()
                .name(name)
                .description(description)
                .isActive(true)
                .build();
        return categoryRepository.save(category);
    }

    private Equipment createEquipment(String name, String serialNumber, String manufacturer,
                                       String model, LocalDate purchaseDate, String location,
                                       String description, EquipmentStatus status,
                                       EquipmentCategory category, Department department,
                                       String imageUrl) {
        Equipment equipment = Equipment.builder()
                .name(name)
                .serialNumber(serialNumber)
                .manufacturer(manufacturer)
                .model(model)
                .purchaseDate(purchaseDate)
                .location(location)
                .description(description)
                .status(status)
                .category(category)
                .department(department)
                .imageUrl(imageUrl)
                .isActive(true)
                .build();
        return equipmentRepository.save(equipment);
    }
}

