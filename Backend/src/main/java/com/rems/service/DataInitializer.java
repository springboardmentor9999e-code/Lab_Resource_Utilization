package com.rems.service;

import com.rems.entity.Booking;
import com.rems.entity.DowntimeRecord;
import com.rems.entity.Equipment;
import com.rems.entity.EquipmentBlackoutDate;
import com.rems.entity.Institution;
import com.rems.entity.Lab;
import com.rems.entity.UsageLog;
import com.rems.entity.User;
import com.rems.entity.WaitlistEntry;
import com.rems.enums.BookingStatus;
import com.rems.enums.EquipmentStatus;
import com.rems.repository.BookingRepository;
import com.rems.repository.DepartmentDemandSummaryRepository;
import com.rems.repository.DepartmentRepository;
import com.rems.repository.DepartmentUtilizationSummaryRepository;
import com.rems.repository.DowntimeRecordRepository;
import com.rems.repository.EquipmentBlackoutDateRepository;
import com.rems.repository.EquipmentDemandMetricRepository;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.IdleAlertRepository;
import com.rems.repository.InstitutionDemandSummaryRepository;
import com.rems.repository.InstitutionRepository;
import com.rems.repository.InstitutionUtilizationSummaryRepository;
import com.rems.repository.LabRepository;
import com.rems.repository.UsageLogRepository;
import com.rems.repository.UserRepository;
import com.rems.repository.UtilizationMetricRepository;
import com.rems.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import com.rems.repository.RoleRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final InstitutionRepository institutionRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BookingRepository bookingRepository;
    private final UsageLogRepository usageLogRepository;
    private final WaitlistRepository waitlistRepository;
    private final EquipmentBlackoutDateRepository blackoutDateRepository;
    private final DowntimeRecordRepository downtimeRecordRepository;
    private final UtilizationMetricRepository utilizationMetricRepository;
    private final DepartmentUtilizationSummaryRepository departmentUtilizationSummaryRepository;
    private final InstitutionUtilizationSummaryRepository institutionUtilizationSummaryRepository;
    private final EquipmentDemandMetricRepository equipmentDemandMetricRepository;
    private final DepartmentDemandSummaryRepository departmentDemandSummaryRepository;
    private final InstitutionDemandSummaryRepository institutionDemandSummaryRepository;
    private final IdleAlertRepository idleAlertRepository;
    private final LabRepository labRepository;
    private final RollupJobService rollupJobService;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting REMS DataInitializer...");

        // Ensure Test User Akshay is registered & updated with testing contact info
        userRepository.findByEmail("as7708209@gmail.com").ifPresent(user -> {
            user.setPhone("+918252285165");
            user.setName("Akshay");
            userRepository.save(user);
        });

        userRepository.findByEmail("akshay7708209@gmail.com").ifPresentOrElse(
                user -> {
                    user.setPhone("+918252285165");
                    user.setName("Akshay");
                    if (user.getRoleIds() == null || user.getRoleIds().isEmpty()) {
                        user.setRoleIds(new java.util.ArrayList<>(java.util.List.of(6)));
                    }
                    roleRepository.findById(6).ifPresent(r -> user.getRoles().add(r));
                    userRepository.save(user);
                },
                () -> {
                    User newUser = User.builder()
                            .name("Akshay")
                            .email("akshay7708209@gmail.com")
                            .passwordHash("$2a$10$W4WUKweqGbLPehe3AfecDe1iNRL4SZWvsN8WMT8eT5HALYHDBtmgq")
                            .phone("+918252285165")
                            .roleIds(new java.util.ArrayList<>(java.util.List.of(6)))
                            .status(com.rems.enums.UserStatus.ACTIVE)
                            .build();
                    roleRepository.findById(6).ifPresent(r -> newUser.getRoles().add(r));
                    userRepository.save(newUser);
                }
        );

        // 1. Update operatingHoursPerDay and timezone for existing institutions
        List<Institution> institutions = institutionRepository.findAll();
        for (Institution inst : institutions) {
            boolean updated = false;
            if (inst.getOperatingHoursPerDay() == null) {
                inst.setOperatingHoursPerDay(24.0);
                updated = true;
            }
            if (inst.getTimezone() == null) {
                inst.setTimezone("UTC");
                updated = true;
            }
            if (updated) {
                institutionRepository.save(inst);
                log.info("Updated Institution {} with operatingHours=24.0 and timezone=UTC", inst.getName());
            }
        }

        List<Lab> labs = labRepository.findAll();
        List<User> users = userRepository.findAll();

        if (labs.isEmpty() || users.isEmpty()) {
            log.warn("Cannot seed metrics: Labs count = {}, User count = {}", labs.size(), users.size());
            return;
        }

        // Force check if we need to clean and seed exactly 3 equipment items per lab (total 12 * 3 = 36)
        long currentEqCount = equipmentRepository.count();
        if (currentEqCount != 36) {
            log.info("Current equipment count is {} (expected 36). Wiping dependent data and seeding exactly 3 equipment items per lab...", currentEqCount);

            // Wipe all dependent rollup and log tables to prevent foreign key issues
            idleAlertRepository.deleteAllInBatch();
            utilizationMetricRepository.deleteAllInBatch();
            departmentUtilizationSummaryRepository.deleteAllInBatch();
            institutionUtilizationSummaryRepository.deleteAllInBatch();
            equipmentDemandMetricRepository.deleteAllInBatch();
            departmentDemandSummaryRepository.deleteAllInBatch();
            institutionDemandSummaryRepository.deleteAllInBatch();
            usageLogRepository.deleteAllInBatch();
            waitlistRepository.deleteAllInBatch();
            blackoutDateRepository.deleteAllInBatch();
            downtimeRecordRepository.deleteAllInBatch();
            bookingRepository.deleteAllInBatch();
            equipmentRepository.deleteAllInBatch();

            User sampleUser = users.get(0);
            Random rand = new Random(42);
            LocalDate today = LocalDate.now();
            ZoneId zoneId = ZoneId.of("UTC");

            for (Lab lab : labs) {
                List<Equipment> labEqList = createEquipmentsForLab(lab);
                for (Equipment eq : labEqList) {
                    Equipment savedEq = equipmentRepository.save(eq);

                    // Seed 1 blackout date (10 days ago) for this equipment
                    LocalDate blackoutDate = today.minusDays(10);
                    blackoutDateRepository.save(EquipmentBlackoutDate.builder()
                            .equipment(savedEq)
                            .blackoutDate(blackoutDate)
                            .hours(8.0)
                            .build());

                    // Seed 1 maintenance downtime record (15 days ago for 12 hours)
                    Instant downtimeStart = today.minusDays(15).atStartOfDay(zoneId).toInstant().plus(8, ChronoUnit.HOURS);
                    Instant downtimeEnd = downtimeStart.plus(12, ChronoUnit.HOURS);
                    downtimeRecordRepository.save(DowntimeRecord.builder()
                            .equipment(savedEq)
                            .startTime(downtimeStart)
                            .endTime(downtimeEnd)
                            .status("Completed")
                            .build());

                    // Seed bookings & usage logs for past 30 days
                    for (int d = 30; d >= 0; d--) {
                        LocalDate day = today.minusDays(d);

                        if (day.equals(blackoutDate)) {
                            continue;
                        }

                        // 70% chance of booking/usage
                        if (rand.nextDouble() < 0.7) {
                            int numBookings = rand.nextInt(2) + 1; // 1 or 2
                            for (int bIdx = 0; bIdx < numBookings; bIdx++) {
                                int startHour = 8 + bIdx * 6;
                                int durationHrs = rand.nextInt(3) + 2; // 2 to 4 hours

                                Instant plannedStart = day.atStartOfDay(zoneId).toInstant().plus(startHour, ChronoUnit.HOURS);
                                Instant plannedEnd = plannedStart.plus(durationHrs, ChronoUnit.HOURS);

                                double r = rand.nextDouble();
                                BookingStatus status = BookingStatus.COMPLETED;
                                if (r < 0.15) {
                                    status = BookingStatus.CANCELLED;
                                } else if (r < 0.25 && d == 0) {
                                    status = BookingStatus.IN_USE;
                                }

                                Booking booking = Booking.builder()
                                        .equipment(savedEq)
                                        .user(sampleUser)
                                        .startTime(plannedStart)
                                        .endTime(plannedEnd)
                                        .purpose("Research Test Run")
                                        .status(status)
                                        .build();
                                bookingRepository.save(booking);

                                if (status == BookingStatus.COMPLETED || status == BookingStatus.IN_USE) {
                                    Instant actualStart = plannedStart.plus(rand.nextInt(10) - 5, ChronoUnit.MINUTES);
                                    Instant actualEnd = plannedEnd.plus(rand.nextInt(20) - 10, ChronoUnit.MINUTES);

                                    usageLogRepository.save(UsageLog.builder()
                                            .equipment(savedEq)
                                            .booking(booking)
                                            .actualStartTime(actualStart)
                                            .actualEndTime(actualEnd)
                                            .build());
                                }
                            }
                        }

                        // 15% chance of waitlist entry
                        if (rand.nextDouble() < 0.15) {
                            Instant waitlistCreated = day.atStartOfDay(zoneId).toInstant().plus(8, ChronoUnit.HOURS);
                            Instant waitlistNotified = rand.nextDouble() < 0.8 ? waitlistCreated.plus(rand.nextInt(5) + 1, ChronoUnit.HOURS) : null;

                            waitlistRepository.save(WaitlistEntry.builder()
                                    .equipment(savedEq)
                                    .user(sampleUser)
                                    .createdAt(waitlistCreated)
                                    .notifiedAt(waitlistNotified)
                                    .requestedStart(waitlistCreated.plus(24, ChronoUnit.HOURS))
                                    .requestedEnd(waitlistCreated.plus(26, ChronoUnit.HOURS))
                                    .status(waitlistNotified != null ? "Fulfilled" : "Waiting")
                                    .build());
                        }
                    }
                }
            }

            log.info("Seeding completed. Running chronological backfill pipeline...");
            LocalDate startBackfill = today.minusDays(30);
            LocalDate endBackfill = today;
            rollupJobService.backfillPipeline(startBackfill, endBackfill);
            log.info("Startup backfill pipeline complete!");
        } else {
            log.info("Exactly 36 equipments already exist in database. Skipping clean seed.");
        }

        // Ensure all equipment items have valid manual URLs and expiry dates
        List<Equipment> allEquipments = equipmentRepository.findAll();
        boolean updated = false;
        int idx = 0;
        for (Equipment eq : allEquipments) {
            boolean changed = false;
            if (eq.getManual() == null || eq.getManual().trim().isEmpty()) {
                eq.setManual(getManualUrlForEquipment(eq.getName(), eq.getModel()));
                changed = true;
            }
            if (eq.getExpiryDate() == null) {
                if (idx % 5 == 0) {
                    eq.setExpiryDate(LocalDate.now().plusDays(1)); // Expires tomorrow!
                } else if (idx % 5 == 1) {
                    eq.setExpiryDate(LocalDate.now().minusDays(1)); // Expired yesterday!
                } else if (idx % 5 == 2) {
                    eq.setExpiryDate(LocalDate.now().plusDays(7)); // Expires in 7 days
                } else if (idx % 5 == 3) {
                    eq.setExpiryDate(LocalDate.now().plusDays(20)); // Expires in 20 days
                } else {
                    eq.setExpiryDate(LocalDate.now().plusMonths(6)); // Expires in 6 months
                }
                changed = true;
            }
            if (changed) {
                equipmentRepository.save(eq);
                updated = true;
            }
            idx++;
        }
        if (updated) {
            log.info("Successfully updated manual URLs and expiry dates for equipment records in database.");
        }
        seedUtilizationMetrics(allEquipments);
    }

    private void seedUtilizationMetrics(List<Equipment> equipments) {
        if (utilizationMetricRepository.count() > 0) return;

        List<com.rems.entity.UtilizationMetric> metricsToSave = new ArrayList<>();
        LocalDate today = LocalDate.now();
        java.util.Random rand = new java.util.Random(42);

        for (Equipment eq : equipments) {
            for (int i = 29; i >= 0; i--) {
                LocalDate d = today.minusDays(i);
                double usedHours;
                if (eq.getStatus() == com.rems.enums.EquipmentStatus.MAINTENANCE) {
                    usedHours = 0.0;
                } else {
                    usedHours = Math.round((1.5 + rand.nextDouble() * 9.0) * 10.0) / 10.0;
                }
                double utilRate = Math.round((usedHours / 12.0) * 100.0) / 100.0;

                metricsToSave.add(com.rems.entity.UtilizationMetric.builder()
                        .equipment(eq)
                        .date(d)
                        .usedHours(usedHours)
                        .availableHours(12.0)
                        .utilizationRate(utilRate)
                        .build());
            }
        }
        utilizationMetricRepository.saveAll(metricsToSave);
        log.info("Successfully seeded " + metricsToSave.size() + " utilization metric entries for equipment analysis.");
    }

    private List<Equipment> createEquipmentsForLab(Lab lab) {
        String labName = lab.getName().toLowerCase();
        List<Equipment> list = new ArrayList<>();

        String name1, name2, name3;
        String cat1, cat2, cat3;
        String model1, model2, model3;
        double cost1, cost2, cost3;
        String img1, img2, img3;

        if (labName.contains("biotech research")) {
            name1 = "Confocal Microscope"; cat1 = "Microscope"; model1 = "LSM 980"; cost1 = 45; img1 = "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=300";
            name2 = "Biosafety Cabinet Class II"; cat2 = "Biotech"; model2 = "Purifier Logic+"; cost2 = 15; img2 = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300";
            name3 = "CO2 Incubator"; cat3 = "Biotech"; model3 = "Heracell 150i"; cost3 = 10; img3 = "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=300";
        } else if (labName.contains("bioinformatics")) {
            name1 = "Next-Generation Sequencer"; cat1 = "Microscope"; model1 = "Illumina NovaSeq"; cost1 = 80; img1 = "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=300";
            name2 = "HPC Compute Node"; cat2 = "Thermal Cycler"; model2 = "Dell PowerEdge"; cost2 = 20; img2 = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300";
            name3 = "Automated Liquid Handler"; cat3 = "Centrifuge"; model3 = "Biomek i7"; cost3 = 35; img3 = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300";
        } else if (labName.contains("optics")) {
            name1 = "Helium-Neon Laser System"; cat1 = "Spectrometer"; model1 = "HNL150R"; cost1 = 12; img1 = "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=300";
            name2 = "UV-Vis Spectrophotometer"; cat2 = "Spectrometer"; model2 = "Cary 60"; cost2 = 15; img2 = "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=300";
            name3 = "Optical Breadboard Setup"; cat3 = "Spectrometer"; model3 = "Nexus Series"; cost3 = 8; img3 = "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=300";
        } else if (labName.contains("condensed")) {
            name1 = "Cryogenic Probe Station"; cat1 = "Spectrometer"; model1 = "TTPX"; cost1 = 50; img1 = "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=300";
            name2 = "SQUID Magnetometer"; cat2 = "Centrifuge"; model2 = "MPMS3"; cost2 = 75; img2 = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300";
            name3 = "Thin Film Deposition System"; cat3 = "Thermal Cycler"; model3 = "Angstrom Evo"; cost3 = 40; img3 = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300";
        } else if (labName.contains("mri & ct")) {
            name1 = "MRI Scanner 3T"; cat1 = "Spectrometer"; model1 = "Siemens Magnetom"; cost1 = 150; img1 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
            name2 = "CT Scanner 128-Slice"; cat2 = "Spectrometer"; model2 = "GE Revolution"; cost2 = 120; img2 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
            name3 = "Ultrasound Diagnostic System"; cat3 = "Centrifuge"; model3 = "Philips Epiq"; cost3 = 30; img3 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
        } else if (labName.contains("nuclear")) {
            name1 = "SPECT-CT Scanner"; cat1 = "Spectrometer"; model1 = "Symbia Intevo"; cost1 = 130; img1 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
            name2 = "Gamma Camera"; cat2 = "Spectrometer"; model2 = "Discovery NM"; cost2 = 90; img2 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
            name3 = "Dose Calibrator"; cat3 = "Centrifuge"; model3 = "CRC-55tR"; cost3 = 15; img3 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
        } else if (labName.contains("electrocardiography")) {
            name1 = "ECG Analyzer 12-Lead"; cat1 = "Centrifuge"; model1 = "Welch Allyn ELI"; cost1 = 10; img1 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
            name2 = "Cardiac Stress Treadmill"; cat2 = "Centrifuge"; model2 = "Case System"; cost2 = 25; img2 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
            name3 = "Holter Monitor System"; cat3 = "Centrifuge"; model3 = "H3+"; cost3 = 8; img3 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
        } else if (labName.contains("catheterization")) {
            name1 = "Fluoroscopy C-Arm System"; cat1 = "Spectrometer"; model1 = "Philips Zenition"; cost1 = 110; img1 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
            name2 = "Intravascular Ultrasound"; cat2 = "Centrifuge"; model2 = "Boston Scientific"; cost2 = 45; img2 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
            name3 = "Cardiac Mapping System"; cat3 = "Thermal Cycler"; model3 = "Carto 3"; cost3 = 85; img3 = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300";
        } else if (labName.contains("fluid")) {
            name1 = "PIV Velocity System"; cat1 = "Spectrometer"; model1 = "FlowMaster"; cost1 = 55; img1 = "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=300";
            name2 = "Wind Tunnel Tester"; cat2 = "Centrifuge"; model2 = "WT-300"; cost2 = 35; img2 = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300";
            name3 = "High-Speed Rheometer"; cat3 = "Thermal Cycler"; model3 = "Anton Paar MCR"; cost3 = 25; img3 = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300";
        } else if (labName.contains("reaction")) {
            name1 = "Continuous Tank Reactor CSTR"; cat1 = "Centrifuge"; model1 = "CSTR-100"; cost1 = 30; img1 = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300";
            name2 = "Gas Chromatograph GC-MS"; cat2 = "Spectrometer"; model2 = "Agilent 5977B"; cost2 = 60; img2 = "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=300";
            name3 = "High-Pressure Autoclave"; cat3 = "Thermal Cycler"; model3 = "Parr 4560"; cost3 = 40; img3 = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300";
        } else if (labName.contains("vlsi")) {
            name1 = "FPGA Development Station"; cat1 = "Microscope"; model1 = "Xilinx GeneSys"; cost1 = 15; img1 = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300";
            name2 = "Logic Analyzer 16-Ch"; cat2 = "Thermal Cycler"; model2 = "Tektronix TLA"; cost2 = 25; img2 = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300";
            name3 = "Digital Storage Oscilloscope"; cat3 = "Centrifuge"; model3 = "Keysight 3000T"; cost3 = 20; img3 = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300";
        } else {
            name1 = "8086 Training Kit"; cat1 = "Microscope"; model1 = "Micro-86"; cost1 = 5; img1 = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300";
            name2 = "ARM Cortex-M4 Board"; cat2 = "Thermal Cycler"; model2 = "STM32F4 Discovery"; cost2 = 8; img2 = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300";
            name3 = "Universal Programmer"; cat3 = "Centrifuge"; model3 = "Elnec BeeHive"; cost3 = 12; img3 = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300";
        }

        list.add(Equipment.builder().name(name1).category(cat1).model(model1).cost(java.math.BigDecimal.valueOf(cost1)).imageUrl(img1).manual(getManualUrlForEquipment(name1, model1)).location("Zone A").amount(5).lab(lab).department(lab.getDepartment()).institution(lab.getDepartment().getInstitution()).status(com.rems.enums.EquipmentStatus.AVAILABLE).build());
        list.add(Equipment.builder().name(name2).category(cat2).model(model2).cost(java.math.BigDecimal.valueOf(cost2)).imageUrl(img2).manual(getManualUrlForEquipment(name2, model2)).location("Zone B").amount(5).lab(lab).department(lab.getDepartment()).institution(lab.getDepartment().getInstitution()).status(com.rems.enums.EquipmentStatus.AVAILABLE).build());
        list.add(Equipment.builder().name(name3).category(cat3).model(model3).cost(java.math.BigDecimal.valueOf(cost3)).imageUrl(img3).manual(getManualUrlForEquipment(name3, model3)).location("Zone C").amount(5).lab(lab).department(lab.getDepartment()).institution(lab.getDepartment().getInstitution()).status(com.rems.enums.EquipmentStatus.AVAILABLE).build());

        return list;
    }

    private String getManualUrlForEquipment(String name, String model) {
        if (name == null) return "https://www.manualslib.com";
        String n = name.toLowerCase();
        if (n.contains("confocal microscope")) {
            return "https://www.zeiss.com/content/dam/microscopy/us/downloads/pdf/user-manuals/lsm-980-user-guide.pdf";
        } else if (n.contains("biosafety cabinet")) {
            return "https://www.labconco.com/media/site/files/manuals/3811900.pdf";
        } else if (n.contains("co2 incubator")) {
            return "https://assets.thermofisher.com/TFS-Assets/LED/manuals/Heracell-150i-Manual.pdf";
        } else if (n.contains("sequencer")) {
            return "https://support.illumina.com/content/dam/illumina-support/documents/documentation/system_documentation/novaseq/novaseq-6000-system-guide-1000000019358-12.pdf";
        } else if (n.contains("hpc compute")) {
            return "https://dl.dell.com/topicset/poweredge-r740-owners-manual/en-us/owner_manual.pdf";
        } else if (n.contains("liquid handler")) {
            return "https://www.beckmancoulter.com/wsrportal/techdocs?docname=Biomek_i7_User_Manual.pdf";
        } else if (n.contains("laser")) {
            return "https://www.thorlabs.com/drawings/0a28f7bb9c0e3a47-3D3C9D55-0F06-44D1-A1E4A35BD80E53E5/HNL150R-Manual.pdf";
        } else if (n.contains("spectrophotometer") || n.contains("spec 2000")) {
            return "https://www.agilent.com/cs/library/usermanuals/public/Agilent_Cary60_User_Manual.pdf";
        } else if (n.contains("breadboard")) {
            return "https://www.thorlabs.com/drawings/0a28f7bb9c0e3a47-3D3C9D55-0F06-44D1-A1E4A35BD80E53E5/Breadboard-Guide.pdf";
        } else if (n.contains("probe station")) {
            return "https://www.lakeshore.com/docs/default-source/product-downloads/ttpx-manual.pdf";
        } else if (n.contains("magnetometer") || n.contains("squid")) {
            return "https://www.qdusa.com/sitedocs/manuals/1084-200.pdf";
        } else if (n.contains("thin film")) {
            return "https://www.angstromengineering.com/thin-film-deposition-manual.pdf";
        } else if (n.contains("mri")) {
            return "https://www.siemens-healthineers.com/en-us/magnetic-resonance-imaging/magnetom-user-manual.pdf";
        } else if (n.contains("ct scanner")) {
            return "https://www.gehealthcare.com/products/computed-tomography/revolution-ct-manual.pdf";
        } else if (n.contains("ultrasound")) {
            return "https://www.philips.com/healthcare/resources/epiq-user-manual.pdf";
        } else if (n.contains("spect-ct")) {
            return "https://www.siemens-healthineers.com/en-us/molecular-imaging/spect-ct/symbia-intevo-manual.pdf";
        } else if (n.contains("gamma camera")) {
            return "https://www.gehealthcare.com/products/nuclear-medicine/discovery-nm-manual.pdf";
        } else if (n.contains("dose calibrator")) {
            return "https://www.capintec.com/wp-content/uploads/2018/06/CRC-55tR-Manual.pdf";
        } else if (n.contains("ecg")) {
            return "https://www.welchallyn.com/content/dam/welchallyn/documents/upload-docs/ELI-230-Manual.pdf";
        } else if (n.contains("treadmill")) {
            return "https://www.gehealthcare.com/products/diagnostic-ecg/case-system-manual.pdf";
        } else if (n.contains("holter")) {
            return "https://www.welchallyn.com/content/dam/welchallyn/documents/upload-docs/H3-Plus-Manual.pdf";
        } else if (n.contains("c-arm") || n.contains("fluoroscopy")) {
            return "https://www.philips.com/healthcare/resources/zenition-manual.pdf";
        } else if (n.contains("cardiac mapping")) {
            return "https://www.jnjmedtech.com/en-US/products/carto-3-system-manual.pdf";
        } else if (n.contains("piv velocity")) {
            return "https://www.lavision.de/en/products/flowmaster-piv-manual.pdf";
        } else if (n.contains("wind tunnel")) {
            return "https://www.tecquipment.com/wind-tunnel-wt300-user-guide.pdf";
        } else if (n.contains("rheometer")) {
            return "https://www.anton-paar.com/corp-en/services/mcr-series-manual.pdf";
        } else if (n.contains("reactor") || n.contains("cstr")) {
            return "https://www.armfield.co.uk/manuals/cstr100-user-guide.pdf";
        } else if (n.contains("chromatograph") || n.contains("gc-ms")) {
            return "https://www.agilent.com/cs/library/usermanuals/public/5977B-GCMS-User-Manual.pdf";
        } else if (n.contains("autoclave")) {
            return "https://www.parrinst.com/wp-content/uploads/2019/04/4560-Reactor-Manual.pdf";
        } else if (n.contains("fpga")) {
            return "https://www.xilinx.com/support/documentation/user_guides/ug470_7Series_Config.pdf";
        } else if (n.contains("logic analyzer")) {
            return "https://www.tek.com/en/documents/manual/tla-logic-analyzer-user-manual.pdf";
        } else if (n.contains("oscilloscope")) {
            return "https://www.keysight.com/us/en/assets/9018-03822/user-manuals/9018-03822.pdf";
        } else if (n.contains("8086")) {
            return "https://www.intel.com/content/www/us/en/support/articles/000005714/8086-user-manual.pdf";
        } else if (n.contains("arm cortex")) {
            return "https://www.st.com/resource/en/user_manual/um1472-stm32f4-discovery-kit-stmicroelectronics.pdf";
        } else if (n.contains("programmer")) {
            return "https://www.elnec.com/en/products/universal-programmers/beehive204/beehive-manual.pdf";
        } else if (n.contains("zeiss") || n.contains("axiolab")) {
            return "https://www.zeiss.com/content/dam/microscopy/us/downloads/pdf/user-manuals/axiolab-5-user-guide.pdf";
        } else if (n.contains("centrifuge") || n.contains("sorvall")) {
            return "https://assets.thermofisher.com/TFS-Assets/LED/manuals/Sorvall-ST8-Centrifuge-Manual.pdf";
        } else if (n.contains("pcr")) {
            return "https://www.bio-rad.com/webroot/web/pdf/lsr/literature/10000067649.pdf";
        } else {
            return "https://www.manualslib.com/search.html?q=" + name.replace(" ", "+");
        }
    }
}
