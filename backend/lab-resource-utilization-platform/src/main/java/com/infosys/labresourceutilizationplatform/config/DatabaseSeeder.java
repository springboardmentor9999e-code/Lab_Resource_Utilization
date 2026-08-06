package com.infosys.labresourceutilizationplatform.config;

import com.infosys.labresourceutilizationplatform.entity.*;
import com.infosys.labresourceutilizationplatform.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationRepository notificationRepository;

    public DatabaseSeeder(RoleRepository roleRepository,
                          InstitutionRepository institutionRepository,
                          DepartmentRepository departmentRepository,
                          LaboratoryRepository laboratoryRepository,
                          EquipmentRepository equipmentRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          NotificationRepository notificationRepository) {
        this.roleRepository = roleRepository;
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        // 1. Seed Roles
        if (roleRepository.count() == 0) {
            System.out.println("Seeding Roles...");
            List<Role> roles = new ArrayList<>();
            roles.add(createRole("STUDENT", "Student"));
            roles.add(createRole("RESEARCHER", "Researcher or Student"));
            roles.add(createRole("LAB_TECHNICIAN", "Lab Technician"));
            roles.add(createRole("LAB_MANAGER", "Lab Manager"));
            roles.add(createRole("DEPARTMENT_HEAD", "Department Head"));
            roles.add(createRole("INSTITUTION_ADMIN", "Institution Administrator"));
            roles.add(createRole("SYSTEM_ADMIN", "System Administrator"));
            roleRepository.saveAll(roles);
        }

        // 2. Seed Institutions
        Institution infosysUniv = null;
        Institution mitCollege = null;
        Institution stanfordTech = null;

        if (institutionRepository.count() == 0) {
            System.out.println("Seeding Institutions...");
            infosysUniv = new Institution();
            infosysUniv.setInstitutionName("Infosys Virtual University");
            infosysUniv.setInstitutionCode("INFOSYS_UNIV");
            infosysUniv.setAddress("Electronic City Phase 1");
            infosysUniv.setCity("Bengaluru");
            infosysUniv.setState("Karnataka");
            infosysUniv.setPincode("560100");
            infosysUniv.setContactEmail("admin@infosys.edu");
            infosysUniv.setContactPhone("9886098860");
            infosysUniv.setWebsite("www.infosysvirtualuniv.edu");
            infosysUniv.setStatus("ACTIVE");
            infosysUniv = institutionRepository.save(infosysUniv);

            mitCollege = new Institution();
            mitCollege.setInstitutionName("MIT Engineering College");
            mitCollege.setInstitutionCode("MIT_EC");
            mitCollege.setAddress("Vasco Da Gama");
            mitCollege.setCity("Panaji");
            mitCollege.setState("Goa");
            mitCollege.setPincode("403001");
            mitCollege.setContactEmail("contact@mitgoa.edu");
            mitCollege.setContactPhone("8322446688");
            mitCollege.setWebsite("www.mitgoa.edu");
            mitCollege.setStatus("ACTIVE");
            mitCollege = institutionRepository.save(mitCollege);

            stanfordTech = new Institution();
            stanfordTech.setInstitutionName("Stanford Tech Institute");
            stanfordTech.setInstitutionCode("STANFORD_TECH");
            stanfordTech.setAddress("Palo Alto Road");
            stanfordTech.setCity("Pune");
            stanfordTech.setState("Maharashtra");
            stanfordTech.setPincode("411001");
            stanfordTech.setContactEmail("info@stanfordtech.edu");
            stanfordTech.setContactPhone("2025550199");
            stanfordTech.setWebsite("www.stanfordtech.edu");
            stanfordTech.setStatus("ACTIVE");
            stanfordTech = institutionRepository.save(stanfordTech);
        } else {
            List<Institution> insts = institutionRepository.findAll();
            infosysUniv = insts.get(0);
            if (insts.size() > 1) mitCollege = insts.get(1);
            if (insts.size() > 2) stanfordTech = insts.get(2);
        }

        // 3. Seed Departments
        Department cseDept = null;
        Department eceDept = null;
        Department mechDept = null;
        Department itDept = null;
        Department stanfordCseDept = null;

        if (departmentRepository.count() == 0 && infosysUniv != null) {
            System.out.println("Seeding Departments...");
            
            // Infosys Univ Depts
            cseDept = new Department();
            cseDept.setDepartmentName("Computer Science & Engineering");
            cseDept.setDepartmentCode("CSE");
            cseDept.setInstitution(infosysUniv);
            cseDept.setHodName("Dr. Ramesh Kumar");
            cseDept.setContactEmail("cse.hod@infosys.edu");
            cseDept.setContactPhone("9876543210");
            cseDept.setStatus("ACTIVE");
            cseDept = departmentRepository.save(cseDept);

            eceDept = new Department();
            eceDept.setDepartmentName("Electronics & Communication Engineering");
            eceDept.setDepartmentCode("ECE");
            eceDept.setInstitution(infosysUniv);
            eceDept.setHodName("Dr. Anita Sen");
            eceDept.setContactEmail("ece.hod@infosys.edu");
            eceDept.setContactPhone("9876543211");
            eceDept.setStatus("ACTIVE");
            eceDept = departmentRepository.save(eceDept);

            mechDept = new Department();
            mechDept.setDepartmentName("Mechanical Engineering");
            mechDept.setDepartmentCode("MECH");
            mechDept.setInstitution(infosysUniv);
            mechDept.setHodName("Dr. Vijay Kulkarni");
            mechDept.setContactEmail("mech.hod@infosys.edu");
            mechDept.setContactPhone("9876543212");
            mechDept.setStatus("ACTIVE");
            mechDept = departmentRepository.save(mechDept);

            // MIT College Depts
            if (mitCollege != null) {
                itDept = new Department();
                itDept.setDepartmentName("Information Technology");
                itDept.setDepartmentCode("IT");
                itDept.setInstitution(mitCollege);
                itDept.setHodName("Dr. Sunita Rao");
                itDept.setContactEmail("it.hod@mitgoa.edu");
                itDept.setContactPhone("8322441122");
                itDept.setStatus("ACTIVE");
                itDept = departmentRepository.save(itDept);
            }

            // Stanford Tech Depts
            if (stanfordTech != null) {
                stanfordCseDept = new Department();
                stanfordCseDept.setDepartmentName("Computer Science Department");
                stanfordCseDept.setDepartmentCode("STANFORD_CSE");
                stanfordCseDept.setInstitution(stanfordTech);
                stanfordCseDept.setHodName("Dr. John Hennessy");
                stanfordCseDept.setContactEmail("cse.hod@stanfordtech.edu");
                stanfordCseDept.setContactPhone("2025550198");
                stanfordCseDept.setStatus("ACTIVE");
                stanfordCseDept = departmentRepository.save(stanfordCseDept);
            }
        } else if (departmentRepository.count() > 0) {
            List<Department> depts = departmentRepository.findAll();
            cseDept = depts.get(0);
            if (depts.size() > 1) eceDept = depts.get(1);
            if (depts.size() > 2) mechDept = depts.get(2);
            if (depts.size() > 3) itDept = depts.get(3);
            if (depts.size() > 4) stanfordCseDept = depts.get(4);
        }

        // 4. Seed Laboratories
        Laboratory aiLab = null;
        Laboratory iotLab = null;
        Laboratory roboticsLab = null;
        Laboratory vlsiLab = null;
        Laboratory dspLab = null;
        Laboratory fluidLab = null;
        Laboratory cadLab = null;
        Laboratory mitSoftLab = null;
        Laboratory stanfordAiLab = null;

        if (laboratoryRepository.count() == 0) {
            System.out.println("Seeding Laboratories...");
            
            // CSE Labs (Infosys Univ)
            if (cseDept != null) {
                aiLab = new Laboratory();
                aiLab.setLabName("Advanced AI Lab");
                aiLab.setDepartment(cseDept);
                aiLab.setDescription("Research facility for artificial intelligence and machine learning architectures.");
                aiLab = laboratoryRepository.save(aiLab);

                iotLab = new Laboratory();
                iotLab.setLabName("Internet of Things (IoT) Lab");
                iotLab.setDepartment(cseDept);
                iotLab.setDescription("Equipped with sensors and gateways for distributed smart IoT environments.");
                iotLab = laboratoryRepository.save(iotLab);

                roboticsLab = new Laboratory();
                roboticsLab.setLabName("Robotics & Automation Lab");
                roboticsLab.setDepartment(cseDept);
                roboticsLab.setDescription("Robotic arm design and industrial automation testing setups.");
                roboticsLab = laboratoryRepository.save(roboticsLab);
            }

            // ECE Labs (Infosys Univ)
            if (eceDept != null) {
                vlsiLab = new Laboratory();
                vlsiLab.setLabName("VLSI & Embedded Systems Lab");
                vlsiLab.setDepartment(eceDept);
                vlsiLab.setDescription("Microchip development and hardware programming boards.");
                vlsiLab = laboratoryRepository.save(vlsiLab);

                dspLab = new Laboratory();
                dspLab.setLabName("Digital Signal Processing Lab");
                dspLab.setDepartment(eceDept);
                dspLab.setDescription("High-speed analysis of signals, spectrum tracking, and waveform synthesis.");
                dspLab = laboratoryRepository.save(dspLab);
            }

            // MECH Labs (Infosys Univ)
            if (mechDept != null) {
                fluidLab = new Laboratory();
                fluidLab.setLabName("Fluid Mechanics Lab");
                fluidLab.setDepartment(mechDept);
                fluidLab.setDescription("Experimenting with fluid motion, velocities, and Bernoulli theories.");
                fluidLab = laboratoryRepository.save(fluidLab);

                cadLab = new Laboratory();
                cadLab.setLabName("CAD/CAM Modeling Lab");
                cadLab.setDepartment(mechDept);
                cadLab.setDescription("High-end workstation systems for engineering designs and 3D printing.");
                cadLab = laboratoryRepository.save(cadLab);
            }

            // MIT IT Labs
            if (itDept != null) {
                mitSoftLab = new Laboratory();
                mitSoftLab.setLabName("IT Software Development Lab");
                mitSoftLab.setDepartment(itDept);
                mitSoftLab.setDescription("Equipped with modern software dev tools and database environments.");
                mitSoftLab = laboratoryRepository.save(mitSoftLab);
            }

            // Stanford CSE Labs
            if (stanfordCseDept != null) {
                stanfordAiLab = new Laboratory();
                stanfordAiLab.setLabName("Stanford AI & Robotics Lab");
                stanfordAiLab.setDepartment(stanfordCseDept);
                stanfordAiLab.setDescription("Pioneering research center for human-robot interactions.");
                stanfordAiLab = laboratoryRepository.save(stanfordAiLab);
            }
        } else {
            List<Laboratory> labs = laboratoryRepository.findAll();
            if (labs.size() > 0) aiLab = labs.get(0);
            if (labs.size() > 1) iotLab = labs.get(1);
            if (labs.size() > 2) roboticsLab = labs.get(2);
            if (labs.size() > 3) vlsiLab = labs.get(3);
            if (labs.size() > 4) dspLab = labs.get(4);
            if (labs.size() > 5) fluidLab = labs.get(5);
            if (labs.size() > 6) cadLab = labs.get(6);
            if (labs.size() > 7) mitSoftLab = labs.get(7);
            if (labs.size() > 8) stanfordAiLab = labs.get(8);
        }

        // 5. Seed Equipment (Exactly 3 in each Laboratory)
        if (equipmentRepository.count() == 0) {
            System.out.println("Seeding Equipment Catalog...");

            // 1. Advanced AI Lab
            if (aiLab != null) {
                createEquipment("NVIDIA Jetson AGX Xavier", "AI/ML Hardware", "High-performance edge computing module for AI-driven applications and model deployment.", "NVIDIA", "AGX-XAVIER-32GB", "NV-AGX-8762341", 5, "https://images.nvidia.com/prod/ethernet/agx-xavier.jpg", "https://developer.nvidia.com/embedded/downloads", aiLab);
                createEquipment("GPU Server RTX 4090", "Computing Server", "Server containing dual RTX 4090 GPUs for training large deep learning architectures.", "ASUS / NVIDIA", "ESC8000-G4-4090", "AS-RTX-9080765", 2, "https://images.nvidia.com/prod/rtx-4090.jpg", "https://dlcdnets.asus.com/pub/ASUS/Server/ESC8000-G4/Manual/E14819_ESC8000_G4_UM_V2_WEB.pdf", aiLab);
                createEquipment("Google Coral TPU Pro", "AI Accelerator", "USB accelerator providing hardware acceleration for machine learning models at the edge.", "Google", "Coral-TPU-V2", "GC-TPU-1289382", 8, "/images/equipment/google-coral-tpu-pro.jpg", "https://coral.ai/docs/accelerator/datasheet", aiLab);
            }

            // 2. Internet of Things Lab
            if (iotLab != null) {
                createEquipment("Arduino Mega Starter Kit", "IoT Development", "Starter kit containing Arduino Mega board, sensors, breadboard, resistors, and connecting wires.", "Arduino", "MEGA-STARTER-K1", "ARD-MEG-4536271", 15, "https://store.arduino.cc/mega-starter-kit.jpg", "https://docs.arduino.cc/hardware/mega-2560", iotLab);
                createEquipment("Raspberry Pi 4 Model B", "Single Board Computer", "Raspberry Pi 4 single board computer with 8GB RAM for edge computing and programming.", "Raspberry Pi Foundation", "RPI4-8GB", "RPI-4B-1029384", 10, "https://www.raspberrypi.com/pi4.jpg", "https://datasheets.raspberrypi.com/rpi4/raspberry-pi-4-datasheet.pdf", iotLab);
                createEquipment("ESP32 LoRa Gateway Kit", "Lora Transceiver", "Wireless RF node module matching LoRa communication frequencies for IoT smart agriculture projects.", "Espressif", "ESP32-LORA-V3", "ESP-RF-2093842", 12, "https://www.espressif.com/esp32.jpg", "https://www.espressif.com/en/products/socs/esp32/resources", iotLab);
            }

            // 3. Robotics & Automation Lab
            if (roboticsLab != null) {
                createEquipment("Dobot Magician Robotic Arm", "Robotic Manipulator", "Precision desktop robotic arm supporting 3D printing, laser engraving, and writing.", "Dobot", "DOBOT-MAG-01", "DB-ARM-7762341", 3, "https://www.dobot.cc/dobot-magician.jpg", "https://www.dobot-robots.com/products/dobot-magician.html", roboticsLab);
                createEquipment("TurtleBot 4 Mobile Robot", "Research Mobile Robot", "Next-generation open-source mobile robot platform built on iRobot Create 3 and ROS 2.", "Clearpath Robotics", "TURTLEBOT4-PRO", "TB-PRO-9872341", 2, "https://clearpathrobotics.com/turtlebot-4.jpg", "https://clearpathrobotics.com/turtlebot-4-manual", roboticsLab);
                createEquipment("Lidar Scanner LD19", "Lidar Sensor", "Time-of-flight LiDAR sensor module providing 360 degree laser scanning for mapping and localization.", "LDRobot", "LD19-TOF", "LD-TOF-3467231", 6, "https://www.ldrobot.com/ld19.jpg", "https://www.ldrobot.com/ld19-datasheet", roboticsLab);
            }

            // 4. VLSI & Embedded Systems Lab
            if (vlsiLab != null) {
                createEquipment("Xilinx Artix-7 FPGA Board", "FPGA Dev Kit", "Development platform configured with Xilinx XC7A35T FPGA chip for VLSI logic verification.", "Digilent", "Basys 3", "XIL-ART-9834712", 8, "https://www.xilinx.com/artix7.jpg", "https://digilent.com/reference/programmable-logic/basys-3/reference-manual", vlsiLab);
                createEquipment("STM32 Discovery Kit", "MCU Board", "Evaluation board with STM32F407VG microcontroller containing digital sensors and converters.", "STMicroelectronics", "STM32F4DISCOVERY", "ST-MCU-5462719", 15, "https://www.st.com/cortex-m4.jpg", "https://www.st.com/en/evaluation-tools/stm32f4discovery.html", vlsiLab);
                createEquipment("Keysight DSO 4-Channel", "Measurement Instrument", "Digital storage oscilloscope offering 100MHz bandwidth and 2GS/s sample rate for signals inspection.", "Keysight", "DSOX1204G", "KS-DSO-8876234", 4, "https://www.keysight.com/osc.jpg", "https://www.keysight.com/en/pc-2814035/infiniivision-1000-x-series-oscilloscopes", vlsiLab);
            }

            // 5. Digital Signal Processing Lab
            if (dspLab != null) {
                createEquipment("TI TMS320C6713 DSP Starter", "DSP Board", "Standalone DSP development board for float math calculations and audio filtering algorithms.", "Texas Instruments", "TMS320C6713", "TI-DSP-671384", 6, "https://www.ti.com/dsp-kit.jpg", "https://www.ti.com/tool/TMDSEVM6713", dspLab);
                createEquipment("Rigol Function Generator", "Signal Generator", "Arbitrary waveform function generator offering dual channels and 25MHz frequency output.", "Rigol", "DG1022Z", "RG-GEN-102938", 5, "https://www.rigol.com/generator.jpg", "https://www.rigol.com/products/signal-generators/dg1000z.html", dspLab);
                createEquipment("RF Spectrum Analyzer 3GHz", "Measurement Instrument", "Spectrum analyzer module for measuring electrical signals frequency, harmonics, and noise.", "Keysight", "N9000B", "KS-SPEC-382940", 3, "https://www.keysight.com/analyzer.jpg", "https://www.keysight.com/en/pd-2748364/csa-spectrum-analyzer-3ghz", dspLab);
            }

            // 6. Fluid Mechanics Lab
            if (fluidLab != null) {
                createEquipment("Bernoulli's Theorem Apparatus", "Hydrodynamics Rig", "Acrylic test section with venture meter tube for proving Bernoulli pressure flow equations.", "TecQuipment", "H5-BERNOULLI", "TQ-FL-883471", 2, "https://www.fluidmech.com/bernoulli.jpg", "https://www.tecquipment.com/bernoullis-theorem-apparatus", fluidLab);
                createEquipment("Venturi Tube Flow Meter", "Hydrodynamics Rig", "Flow meter rig for testing water flow velocities across constricted pipeline entries.", "TecQuipment", "H10-VENTURI", "TQ-FL-998234", 2, "https://www.fluidmech.com/venturi.jpg", "https://www.tecquipment.com/venturi-meter", fluidLab);
                createEquipment("Orifice Discharge Apparatus", "Hydrodynamics Rig", "Apparatus for finding the discharge coefficient of water passing through sharp-edged ports.", "TecQuipment", "H4-ORIFICE", "TQ-FL-776231", 2, "https://www.fluidmech.com/orifice.jpg", "https://www.tecquipment.com/orifice-discharge", fluidLab);
            }

            // 7. CAD/CAM Modeling Lab
            if (cadLab != null) {
                createEquipment("Dell Precision 7920 Workstation", "Engineering Workstation", "High-performance Intel Xeon desktop workstation configured for AutoCAD and SolidWorks.", "Dell", "Precision 7920 Tower", "DL-PC-9872349", 12, "https://images.dell.com/precision.jpg", "https://www.dell.com/en-us/work/shop/workstations/precision-7920", cadLab);
                createEquipment("Ultimaker S5 3D Printer", "3D Fabrication", "Dual extrusion industrial FDM 3D printer for creating functional polymer prototype structures.", "Ultimaker", "Ultimaker S5", "UM-3D-8823471", 3, "https://ultimaker.com/s5.jpg", "https://ultimaker.com/3d-printers/ultimaker-s5", cadLab);
                createEquipment("Creality CR-Scan 3D Scanner", "Digital Scanner", "Portable structured light optical scanner for transforming raw models into CAD files.", "Creality", "CR-Scan 01", "CR-SC-2093847", 4, "https://www.creality.com/scanner.jpg", "https://www.creality.com/products/creality-cr-scan-01-3d-scanner", cadLab);
            }

            // 8. MIT IT Software Lab
            if (mitSoftLab != null) {
                createEquipment("Dell OptiPlex 7090 Desktop", "Software Desktop", "Intel Core i7 work systems configured with Visual Studio Code, Docker and PostgreSQL.", "Dell", "OptiPlex 7090", "DL-IT-1029381", 10, "https://images.dell.com/optiplex.jpg", "https://www.dell.com/en-us/work/shop/desktops-n-workstations/optiplex-7090", mitSoftLab);
                createEquipment("Raspberry Pi 400 Keyboard Kit", "SBC Keyboard", "Raspberry Pi computer built directly inside an official US keyboard layout shell.", "Raspberry Pi Foundation", "RPI-400-US", "RPI-KBD-442938", 8, "https://www.raspberrypi.com/pi400.jpg", "https://datasheets.raspberrypi.com/pipr/pi-400-datasheet.pdf", mitSoftLab);
                createEquipment("Cisco 24-Port Gigabit Switch", "Networking Switch", "Smart managed ethernet switch configured for local software and server linkages.", "Cisco", "SG250-26-K9", "CS-SW-9023847", 4, "https://www.cisco.com/switch.jpg", "https://www.cisco.com/c/en/us/products/switches", mitSoftLab);
            }

            // 9. Stanford AI & Robotics Lab
            if (stanfordAiLab != null) {
                createEquipment("Boston Dynamics Spot Robot", "Mobile Quadruped", "Advanced agile quadruped mobile robot for autonomous navigation and terrain mapping research.", "Boston Dynamics", "SPOT-EXPLORER", "BD-SPOT-01", 1, "https://www.bostondynamics.com/spot.jpg", "https://www.bostondynamics.com/products/spot", stanfordAiLab);
                createEquipment("KUKA KR 6 Industrial Robot", "Manipulator Arm", "Industrial-grade articulated robotic arm supporting high payload operations and ROS 2 control.", "KUKA", "KR 6 R900", "KK-ARM-902341", 1, "https://www.kuka.com/kr6.jpg", "https://www.kuka.com/en-us/products/robotics-systems", stanfordAiLab);
                createEquipment("Velodyne Puck Lidar VLP-16", "Lidar Sensor", "Real-time 3D LiDAR sensor tracking surrounding points in 16 lines across a 100 meter range.", "Velodyne Lidar", "VLP-16", "VD-LID-883492", 3, "https://velodynelidar.com/vlp16.jpg", "https://velodynelidar.com/products/puck", stanfordAiLab);
            }
        }

        // 6. Seed Users
        if (userRepository.count() == 0) {
            System.out.println("Seeding Default Users...");

            Role studentRole = roleRepository.findByRoleName("STUDENT").orElse(null);
            Role researcherRole = roleRepository.findByRoleName("RESEARCHER").orElse(null);
            Role managerRole = roleRepository.findByRoleName("LAB_MANAGER").orElse(null);
            Role technicianRole = roleRepository.findByRoleName("LAB_TECHNICIAN").orElse(null);
            Role hodRole = roleRepository.findByRoleName("DEPARTMENT_HEAD").orElse(null);
            Role instAdminRole = roleRepository.findByRoleName("INSTITUTION_ADMIN").orElse(null);
            Role sysAdminRole = roleRepository.findByRoleName("SYSTEM_ADMIN").orElse(null);

            Integer cseId = cseDept != null ? cseDept.getDepartmentId().intValue() : null;
            Integer instId = infosysUniv != null ? infosysUniv.getInstitutionId().intValue() : null;

            createUser("student@infosys.com", "student", "Student User", studentRole, cseId, instId, "ACTIVE");
            createUser("researcher@infosys.com", "researcher", "Researcher User", researcherRole, cseId, instId, "ACTIVE");
            createUser("manager@infosys.com", "manager", "Lab Manager User", managerRole, cseId, instId, "ACTIVE");
            createUser("tech@infosys.com", "tech", "Lab Tech User", technicianRole, cseId, instId, "ACTIVE");
            createUser("hod@infosys.com", "hod", "HOD User", hodRole, cseId, instId, "ACTIVE");
            createUser("admin@infosys.com", "admin", "Institution Admin User", instAdminRole, cseId, instId, "ACTIVE");
            createUser("admin@system.com", "admin", "System Admin User", sysAdminRole, null, null, "ACTIVE");
            createUser("pending@infosys.com", "pending", "Pending Registration User", studentRole, cseId, instId, "PENDING");
        }
        updateExistingEquipmentUrls();

        // Seed Geotechnical & Surveying Lab and Equipment
        boolean hasCivilLab = laboratoryRepository.findAll().stream().anyMatch(l -> "Geotechnical & Surveying Lab".equalsIgnoreCase(l.getLabName()));
        if (!hasCivilLab && mechDept != null) {
            System.out.println("Seeding Geotechnical & Surveying Lab and Equipment...");
            Laboratory geoLab = new Laboratory();
            geoLab.setLabName("Geotechnical & Surveying Lab");
            geoLab.setDepartment(mechDept);
            geoLab.setDescription("Testing and analysis of soil, structures, concrete, and advanced surveying methods.");
            geoLab = laboratoryRepository.save(geoLab);

            createEquipment("Total Station", "Surveying", "Precision electronic/optical instrument used in modern surveying and building construction.", "Leica", "TS16", "LC-TS-7762391", 3, "/images/equipment/total-station.jpg", "https://leica-geosystems.com/products/total-stations", geoLab);
            createEquipment("Universal Testing Machine", "Structural Testing", "High-capacity load frame used to test the tensile strength and compressive strength of materials.", "Instron", "UTM-5960", "IS-UTM-9834710", 2, "/images/equipment/universal-testing-machine.jpg", "https://www.instron.com/products/testing-systems", geoLab);
            createEquipment("Auto Level", "Surveying", "Professional optical instrument used by contractors, builders and land surveying professionals.", "Topcon", "AT-B4A", "TC-AL-5462711", 5, "/images/equipment/auto-level.jpg", "https://www.topconpositioning.com/optical-instruments/auto-levels", geoLab);
            createEquipment("Compression Testing Machine", "Concrete Testing", "Rigid compression frame designed for testing concrete cubes, cylinders and blocks.", "Heico", "CTM-2000", "HC-CTM-8876230", 2, "/images/equipment/compression-testing-machine.jpg", "https://www.heicoin.com/concrete-testing", geoLab);
            createEquipment("GPS Survey Receiver", "Surveying", "Multi-frequency GNSS receiver for high accuracy surveying and geodetic measurements.", "Trimble", "R12i", "TB-GPS-671380", 4, "/images/equipment/gps-survey-receiver.jpg", "https://geospatial.trimble.com/products-and-solutions/gnss-systems", geoLab);
        }

        // Setup custom dates for specific demo equipment
        List<Equipment> allEquip = equipmentRepository.findAll();
        for (Equipment e : allEquip) {
            if ("Total Station".equalsIgnoreCase(e.getEquipmentName())) {
                e.setNextCalibrationDate(LocalDate.now().plusDays(1));
                e.setCalibrationStatus("Due Soon");
                equipmentRepository.save(e);
            } else if ("Universal Testing Machine".equalsIgnoreCase(e.getEquipmentName())) {
                e.setNextCalibrationDate(LocalDate.now().minusDays(5));
                e.setCalibrationStatus("Overdue");
                equipmentRepository.save(e);
            } else if ("Auto Level".equalsIgnoreCase(e.getEquipmentName())) {
                e.setLicenseExpiryDate(LocalDate.now().plusDays(2));
                e.setLicenseRenewalDate(LocalDate.now().plusDays(2));
                equipmentRepository.save(e);
            } else if ("Compression Testing Machine".equalsIgnoreCase(e.getEquipmentName())) {
                e.setCertificateExpiryDate(LocalDate.now().plusDays(1));
                e.setCertificateRenewalDate(LocalDate.now().plusDays(1));
                equipmentRepository.save(e);
            }
        }

        // Seed realistic notifications for demo
        System.out.println("Seeding Demo Notifications...");
        notificationRepository.deleteAll();

        User student = userRepository.findByEmail("student@infosys.com").orElse(null);
        Long studentId = (student != null && student.getUserId() != null) ? Long.valueOf(student.getUserId()) : null;
        Long instId = (student != null && student.getInstitutionId() != null) ? Long.valueOf(student.getInstitutionId()) : null;

        User researcher = userRepository.findByEmail("researcher@infosys.com").orElse(null);
        Long researcherId = (researcher != null && researcher.getUserId() != null) ? Long.valueOf(researcher.getUserId()) : null;

        User manager = userRepository.findByEmail("manager@infosys.com").orElse(null);
        Long managerId = (manager != null && manager.getUserId() != null) ? Long.valueOf(manager.getUserId()) : null;

        User tech = userRepository.findByEmail("tech@infosys.com").orElse(null);
        Long techId = (tech != null && tech.getUserId() != null) ? Long.valueOf(tech.getUserId()) : null;

        User hod = userRepository.findByEmail("hod@infosys.com").orElse(null);
        Long hodId = (hod != null && hod.getUserId() != null) ? Long.valueOf(hod.getUserId()) : null;

        User admin = userRepository.findByEmail("admin@infosys.com").orElse(null);
        Long adminId = (admin != null && admin.getUserId() != null) ? Long.valueOf(admin.getUserId()) : null;

        User sys = userRepository.findByEmail("admin@system.com").orElse(null);
        Long sysId = (sys != null && sys.getUserId() != null) ? Long.valueOf(sys.getUserId()) : null;

        // 1. STUDENT / RESEARCHER
        createNotification(studentId, "STUDENT", instId, "[DEMO] Booking Approved", "Your booking request for NVIDIA Jetson AGX Xavier has been approved.", "BOOKING", "High");
        createNotification(studentId, "STUDENT", instId, "[DEMO] Booking Rejected", "Your booking request for GPU Server RTX 4090 was rejected due to high utilization demand.", "BOOKING", "Medium");
        createNotification(studentId, "STUDENT", instId, "[DEMO] Booking Completed", "Your booking for Stanford High-Performance Server has been completed.", "BOOKING", "Low");
        createNotification(studentId, "STUDENT", instId, "[DEMO] Equipment Returned", "Equipment returned successfully: NVIDIA Jetson AGX Xavier.", "BOOKING", "Low");

        createNotification(researcherId, "RESEARCHER", instId, "[DEMO] Booking Approved", "Your booking request for NVIDIA Jetson AGX Xavier has been approved.", "BOOKING", "High");
        createNotification(researcherId, "RESEARCHER", instId, "[DEMO] Booking Completed", "Your booking for GPU Server RTX 4090 has been completed.", "BOOKING", "Low");

        // 2. LAB TECHNICIAN
        createNotification(techId, "LAB_TECHNICIAN", instId, "[DEMO] New Issue Reported", "New issue reported: Lens alignment error on Auto Level.", "MAINTENANCE", "Medium");
        createNotification(techId, "LAB_TECHNICIAN", instId, "[DEMO] Maintenance Assigned", "Preventive maintenance assigned: Inspect Dobot Magician Robotic Arm.", "MAINTENANCE", "High");
        createNotification(techId, "LAB_TECHNICIAN", instId, "[DEMO] Maintenance Completed", "Recalibration task on Universal Testing Machine completed successfully.", "MAINTENANCE", "Low");
        createNotification(techId, "LAB_TECHNICIAN", instId, "[DEMO] Calibration Due", "Total Station calibration is due tomorrow.", "CALIBRATION", "High");
        createNotification(techId, "LAB_TECHNICIAN", instId, "[DEMO] Calibration Overdue", "Universal Testing Machine calibration is overdue!", "CALIBRATION", "High");
        createNotification(techId, "LAB_TECHNICIAN", instId, "[DEMO] License Renewal Due", "Auto Level license renewal due in 2 days.", "LICENSE_RENEWAL", "Medium");
        createNotification(techId, "LAB_TECHNICIAN", instId, "[DEMO] Certificate Renewal Due", "Compression Testing Machine certificate renewal due tomorrow.", "CERTIFICATE_RENEWAL", "High");

        // 3. LAB MANAGER
        createNotification(managerId, "LAB_MANAGER", instId, "[DEMO] Maintenance Requests", "New preventive maintenance request submitted for Rigol Function Generator.", "MAINTENANCE", "Medium");
        createNotification(managerId, "LAB_MANAGER", instId, "[DEMO] Maintenance Status", "Dobot Magician Robotic Arm maintenance status changed to In Progress.", "MAINTENANCE", "Low");
        createNotification(managerId, "LAB_MANAGER", instId, "[DEMO] Calibration Due", "Total Station calibration is due tomorrow.", "CALIBRATION", "High");
        createNotification(managerId, "LAB_MANAGER", instId, "[DEMO] License Renewal Due", "Auto Level license renewal due in 2 days.", "LICENSE_RENEWAL", "Medium");
        createNotification(managerId, "LAB_MANAGER", instId, "[DEMO] Equipment Under Maintenance", "Dobot Magician Robotic Arm status changed to Under Maintenance.", "MAINTENANCE", "Medium");
        createNotification(managerId, "LAB_MANAGER", instId, "[DEMO] Laboratory Notification", "Lab-03 monthly checkup scheduled.", "SYSTEM", "Low");

        // 4. DEPARTMENT HEAD
        createNotification(hodId, "DEPARTMENT_HEAD", instId, "[DEMO] Department Maintenance", "Monthly preventive maintenance summary: 2 resolved, 1 pending.", "MAINTENANCE", "Low");
        createNotification(hodId, "DEPARTMENT_HEAD", instId, "[DEMO] Calibration Due", "Total Station calibration is due tomorrow.", "CALIBRATION", "Medium");
        createNotification(hodId, "DEPARTMENT_HEAD", instId, "[DEMO] License Renewal Due", "Auto Level license renewal due in 2 days.", "LICENSE_RENEWAL", "Medium");
        createNotification(hodId, "DEPARTMENT_HEAD", instId, "[DEMO] Equipment Health", "NVIDIA Jetson AGX Xavier reported under critical warning.", "EQUIPMENT", "High");
        createNotification(hodId, "DEPARTMENT_HEAD", instId, "[DEMO] Department Alert", "Department Lab access policy updated.", "SYSTEM", "Low");

        // 5. INSTITUTION ADMINISTRATOR
        createNotification(adminId, "INSTITUTION_ADMIN", instId, "[DEMO] Pending User Approvals", "There are pending user registration requests waiting for your approval.", "SYSTEM", "High");
        createNotification(adminId, "INSTITUTION_ADMIN", instId, "[DEMO] Booking Approval Request", "Inter-institute booking request pending approval for Stanford Tech.", "BOOKING", "Medium");
        createNotification(adminId, "INSTITUTION_ADMIN", instId, "[DEMO] Maintenance Summary", "Weekly overview: 15 active maintenance schedules across all colleges.", "MAINTENANCE", "Low");
        createNotification(adminId, "INSTITUTION_ADMIN", instId, "[DEMO] Calibration Due", "Total Station calibration is due tomorrow.", "CALIBRATION", "Medium");
        createNotification(adminId, "INSTITUTION_ADMIN", instId, "[DEMO] License Renewal Due", "Auto Level license renewal due in 2 days.", "LICENSE_RENEWAL", "Medium");
        createNotification(adminId, "INSTITUTION_ADMIN", instId, "[DEMO] Certificate Renewal Due", "Compression Testing Machine certificate renewal due tomorrow.", "CERTIFICATE_RENEWAL", "High");
        createNotification(adminId, "INSTITUTION_ADMIN", instId, "[DEMO] Institution Alert", "Boston Dynamics Spot Robot requires warranty inspection soon.", "SYSTEM", "Low");

        // 6. SYSTEM ADMINISTRATOR
        createNotification(sysId, "SYSTEM_ADMIN", null, "[DEMO] Institution-wide Alerts", "Weekly overview: 15 active maintenance schedules across all colleges.", "SYSTEM", "Low");
        createNotification(sysId, "SYSTEM_ADMIN", null, "[DEMO] Pending User Approvals", "There are pending user registration requests waiting for your approval.", "SYSTEM", "High");
        createNotification(sysId, "SYSTEM_ADMIN", null, "[DEMO] Cross-Institute Resource Sharing", "Inter-institute booking request pending approval for Stanford Tech.", "BOOKING", "Medium");
        createNotification(sysId, "SYSTEM_ADMIN", null, "[DEMO] Booking Approval Request", "Inter-institute booking request pending approval for Stanford Tech.", "BOOKING", "Medium");
        createNotification(sysId, "SYSTEM_ADMIN", null, "[DEMO] Maintenance Summary", "Weekly overview: 15 active maintenance schedules across all colleges.", "MAINTENANCE", "Low");
        createNotification(sysId, "SYSTEM_ADMIN", null, "[DEMO] Calibration Due", "Total Station calibration is due tomorrow.", "CALIBRATION", "Medium");
        createNotification(sysId, "SYSTEM_ADMIN", null, "[DEMO] License Renewal Due", "Auto Level license renewal due in 2 days.", "LICENSE_RENEWAL", "Medium");
        createNotification(sysId, "SYSTEM_ADMIN", null, "[DEMO] Certificate Renewal Due", "Compression Testing Machine certificate renewal due tomorrow.", "CERTIFICATE_RENEWAL", "High");
        createNotification(sysId, "SYSTEM_ADMIN", null, "[DEMO] Overall System Alerts", "Overall System Database maintenance scheduled for Sunday at 02:00 AM.", "SYSTEM", "Low");
    }

    private void createNotification(Long userId, String roleName, Long institutionId, String title, String message, String category, String priority) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setRoleName(roleName);
        n.setInstitutionId(institutionId);
        n.setTitle(title);
        n.setMessage(message);
        n.setCategory(category);
        n.setPriority(priority);
        n.setRead(false);
        n.setCreatedAt(java.time.LocalDateTime.now());
        notificationRepository.save(n);
    }

    private Role createRole(String name, String desc) {
        Role role = new Role();
        role.setRoleName(name);
        role.setDescription(desc);
        return role;
    }

    private void createEquipment(String name, String category, String description, String manufacturer, 
                                 String model, String serial, int quantity, String imageUrl, 
                                 String docUrl, Laboratory lab) {
        Equipment eq = new Equipment();
        eq.setEquipmentName(name);
        eq.setCategory(category);
        eq.setDescription(description);
        eq.setManufacturer(manufacturer);
        eq.setModel(model);
        eq.setSerialNumber(serial);
        eq.setPurchaseDate(LocalDate.now().minusMonths(6));
        eq.setWarrantyExpiryDate(LocalDate.now().plusYears(2));
        eq.setTotalQuantity(1);
        eq.setAvailableQuantity(1);
        eq.setStatus("Available");
        eq.setImageUrl(imageUrl);
        eq.setDocumentUrl(docUrl);
        eq.setLaboratory(lab);
        
        Double costPerHour = 25.0; // Default cost per hour
        if ("Computing".equalsIgnoreCase(category) || "Server".equalsIgnoreCase(category) || name.toLowerCase().contains("gpu") || name.toLowerCase().contains("cluster")) {
            costPerHour = 75.0;
        } else if ("Imaging".equalsIgnoreCase(category) || "Microscopy".equalsIgnoreCase(category) || name.toLowerCase().contains("microscope")) {
            costPerHour = 50.0;
        } else if ("Spectroscopy".equalsIgnoreCase(category) || name.toLowerCase().contains("spectrometer")) {
            costPerHour = 100.0;
        } else if ("Electronics".equalsIgnoreCase(category) || name.toLowerCase().contains("oscilloscope")) {
            costPerHour = 15.0;
        }
        eq.setCostPerHour(costPerHour);
        
        equipmentRepository.save(eq);
    }

    private void createUser(String email, String password, String name, Role role, Integer deptId, Integer instId, String status) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(name);
        user.setRole(role);
        user.setPhone("9988776655");
        user.setDepartmentId(deptId);
        user.setInstitutionId(instId);
        user.setStatus(status);
        userRepository.save(user);
    }

    private void updateExistingEquipmentUrls() {
        System.out.println("Updating existing equipment image URLs to reliable sources...");
        List<Equipment> list = equipmentRepository.findAll();
        for (Equipment eq : list) {
            String name = eq.getEquipmentName();
            String newUrl = getReliableImageUrl(name);
            if (newUrl != null) {
                eq.setImageUrl(newUrl);
                equipmentRepository.save(eq);
            }
        }
    }

    private String getReliableImageUrl(String name) {
        if (name == null) return "/images/equipment/placeholder.jpg";
        switch (name) {
            case "NVIDIA Jetson AGX Xavier":
                return "/images/equipment/nvidia-jetson-agx-xavier.jpg";
            case "GPU Server RTX 4090":
                return "/images/equipment/gpu-server-rtx-4090.jpg";
            case "Google Coral TPU Pro":
                return "/images/equipment/google-coral-tpu-pro.jpg";
            case "Arduino Mega Starter Kit":
                return "/images/equipment/arduino-mega-starter-kit.jpg";
            case "Raspberry Pi 4 Model B":
                return "/images/equipment/raspberry-pi-4-model-b.jpg";
            case "ESP32 LoRa Gateway Kit":
                return "/images/equipment/esp32-lora-gateway-kit.jpg";
            case "Dobot Magician Robotic Arm":
                return "/images/equipment/dobot-magician-robotic-arm.jpg";
            case "TurtleBot 4 Mobile Robot":
                return "/images/equipment/turtlebot-4-mobile-robot.jpg";
            case "Lidar Scanner LD19":
                return "/images/equipment/lidar-scanner-ld19.jpg";
            case "Xilinx Artix-7 FPGA Board":
                return "/images/equipment/xilinx-artix-7-fpga-board.jpg";
            case "STM32 Discovery Kit":
                return "/images/equipment/stm32-discovery-kit.jpg";
            case "Keysight DSO 4-Channel":
                return "/images/equipment/keysight-dso-4-channel.jpg";
            case "TI TMS320C6713 DSP Starter":
                return "/images/equipment/ti-tms320c6713-dsp-starter.jpg";
            case "Rigol Function Generator":
                return "/images/equipment/rigol-function-generator.jpg";
            case "RF Spectrum Analyzer 3GHz":
                return "/images/equipment/rf-spectrum-analyzer-3ghz.jpg";
            case "Bernoulli's Theorem Apparatus":
                return "/images/equipment/bernoullis-theorem-apparatus.jpg";
            case "Venturi Tube Flow Meter":
                return "/images/equipment/venturi-tube-flow-meter.jpg";
            case "Orifice Discharge Apparatus":
                return "/images/equipment/orifice-discharge-apparatus.jpg";
            case "Dell Precision 7920 Workstation":
                return "/images/equipment/dell-precision-7920-workstation.jpg";
            case "Ultimaker S5 3D Printer":
                return "/images/equipment/ultimaker-s5-3d-printer.jpg";
            case "Creality CR-Scan 3D Scanner":
                return "/images/equipment/creality-cr-scan-3d-scanner.jpg";
            case "Dell OptiPlex 7090 Desktop":
                return "/images/equipment/dell-optiplex-7090-desktop.jpg";
            case "Raspberry Pi 400 Keyboard Kit":
                return "/images/equipment/raspberry-pi-400-keyboard-kit.jpg";
            case "Cisco 24-Port Gigabit Switch":
                return "/images/equipment/cisco-24-port-gigabit-switch.jpg";
            case "Boston Dynamics Spot Robot":
                return "/images/equipment/boston-dynamics-spot-robot.jpg";
            case "KUKA KR 6 Industrial Robot":
                return "/images/equipment/kuka-kr-6-industrial-robot.jpg";
            case "Velodyne Puck Lidar VLP-16":
                return "/images/equipment/velodyne-puck-lidar-vlp-16.jpg";
                
            // Civil Engineering mappings
            case "Total Station":
                return "/images/equipment/total-station.jpg";
            case "Auto Level":
                return "/images/equipment/auto-level.jpg";
            case "GPS Survey Receiver":
                return "/images/equipment/gps-survey-receiver.jpg";
            case "Universal Testing Machine":
                return "/images/equipment/universal-testing-machine.jpg";
            case "Compression Testing Machine":
                return "/images/equipment/compression-testing-machine.jpg";
            case "Slump Test Apparatus":
                return "/images/equipment/slump-test-apparatus.jpg";

            default:
                String[] uniqueBackups = {
                    "total-station.jpg",
                    "auto-level.jpg",
                    "gps-survey-receiver.jpg",
                    "universal-testing-machine.jpg",
                    "compression-testing-machine.jpg",
                    "slump-test-apparatus.jpg"
                };
                int index = Math.abs(name.hashCode()) % uniqueBackups.length;
                return "/images/equipment/" + uniqueBackups[index];
        }
    }
}
