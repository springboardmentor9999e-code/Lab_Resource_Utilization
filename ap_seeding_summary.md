# Andhra Pradesh Institutions Seeding Summary

The Lab Resource Utilization Platform has been seeded with **15 Andhra Pradesh institutions**, their Institution Administrators, 75 departments, 675 mapped users, 150 laboratory equipment items, inter-institution partnerships, equipment sharing agreements, waitlist entries, sample bookings, notifications, and audit logs.

---

## 🏢 Seeded Institutions & Administrator Login Credentials

| # | Institution Name | Code | Type | City / District | Admin Email | Default Password | Status |
|---|---|---|---|---|---|---|---|
| 1 | **Andhra University** | `AU-VSP` | University | Visakhapatnam | `admin@au.edu.in` | `Password@123` | APPROVED |
| 2 | **JNTU Anantapur** | `JNTUA-ATP` | University | Anantapur | `admin@jntua.ac.in` | `Password@123` | APPROVED |
| 3 | **JNTU Gurajada** | `JNTUGV-VZM` | University | Vizianagaram | `admin@jntugv.edu.in` | `Password@123` | APPROVED |
| 4 | **Sri Venkateswara University** | `SVU-TPT` | University | Tirupati | `admin@svuniversity.edu.in` | `Password@123` | APPROVED |
| 5 | **Acharya Nagarjuna University** | `ANU-GNT` | University | Guntur | `admin@nagarjunauniversity.ac.in` | `Password@123` | APPROVED |
| 6 | **G. Pullaiah College of Eng & Tech** | `GPCET-KNL` | Engg College | Kurnool | `admin@gpcet.ac.in` | `Password@123` | APPROVED |
| 7 | **Rajeev Gandhi Memorial College (RGMCET)** | `RGMCET-NDL` | Engg College | Nandyal | `admin@rgmcet.edu.in` | `Password@123` | APPROVED |
| 8 | **G. Pulla Reddy Engineering College** | `GPREC-KNL` | Engg College | Kurnool | `admin@gprec.ac.in` | `Password@123` | APPROVED |
| 9 | **GMR Institute of Technology** | `GMRIT-RJM` | Engg College | Rajam, Srikakulam | `admin@gmrit.edu.in` | `Password@123` | APPROVED |
| 10 | **Vignan's Foundation (VFSTR)** | `VFSTR-GNT` | University | Vadlamudi, Guntur | `admin@vignan.ac.in` | `Password@123` | APPROVED |
| 11 | **K L University** | `KLU-GNT` | University | Guntur | `admin@kluniversity.in` | `Password@123` | APPROVED |
| 12 | **SRM University AP** | `SRMAP-AMR` | University | Amaravati, Guntur | `admin@srmap.edu.in` | `Password@123` | APPROVED |
| 13 | **Aditya Engineering College** | `AEC-SRP` | Engg College | Surampalem | `admin@aditya.ac.in` | `Password@123` | APPROVED |
| 14 | **Gayatri Vidya Parishad College (GVPCE)** | `GVPCE-VSP` | Engg College | Visakhapatnam | `admin@gvpce.ac.in` | `Password@123` | APPROVED |
| 15 | **Raghu Engineering College** | `REC-VSP` | Engg College | Visakhapatnam | `admin@raghuenggcollege.in` | `Password@123` | APPROVED |

---

## 👥 Role Hierarchy & Department Users Pattern

For **each** of the 15 institutions, 5 departments were seeded:
1. **Computer Science & Engineering (CSE)**
2. **Electronics & Communication Engineering (ECE)**
3. **Electrical & Electronics Engineering (EEE)**
4. **Mechanical Engineering (ME)**
5. **Biotechnology & Life Sciences (BIO)**

For **each** department, sample credentials were created:
- **Department Head**: `head.<inst_code>.<dept>@<inst_code>.edu.in` (Password: `Password@123`)
- **Lab Manager**: `manager.<inst_code>.<dept>@<inst_code>.edu.in` (Password: `Password@123`)
- **Lab Technicians**: `tech1.<inst_code>.<dept>@<inst_code>.edu.in` (Password: `Password@123`)
- **Researchers**: `researcher1.<inst_code>.<dept>@<inst_code>.edu.in` through `researcher5...` (Password: `Password@123`)

*System Admin Login*: `admin@labhub.com` / `Admin@12345`

---

## 🔬 Seeded Laboratory Equipment

150 equipment items populated across all AP institutions, including:
- Dell PowerEdge Dual Xeon HPC Server
- Supermicro 4x NVIDIA A100 GPU AI Workstation
- Ultimaker S5 Pro Bundle Industrial 3D Printer
- Haas UMC-550SS 5-Axis CNC Milling Machine
- Tektronix TBS2204B Digital Storage Oscilloscope (200MHz)
- Keysight N5182B MXG RF Vector Signal Generator (6GHz)
- Anritsu MS2830A Spectrum Analyzer (13.5GHz)
- Applied Biosystems QuantStudio 5 qPCR Machine
- ZEISS Sigma 300 Field Emission SEM (FESEM)
- Instron 5982 Universal Testing Machine (100kN Tensile Tester)
- Xilinx Zynq UltraScale+ ZCU102 FPGA Evaluation Board
- Keysight 34465A Truevolt 6.5 Digit Precision Multimeter
- Keysight E5080B ENA 2-Port Vector Network Analyzer (20GHz)
- NI Quanser QNET Mechatronics & Robotics Kit

---

## 🤝 Seeded Workflows & Milestone 2 Test Data

1. **Active Inter-Institution Partnerships**:
   - Andhra University (`AU-VSP`) ↔ JNTU Anantapur (`JNTUA-ATP`)
   - SRM University AP (`SRMAP-AMR`) ↔ KL University (`KLU-GNT`)
2. **Approved Equipment Sharing Agreements**:
   - AU's FESEM Microscope shared with JNTU Anantapur researchers.
3. **Sample Bookings**: 15 pre-seeded bookings across `PENDING`, `CONFIRMED`, `IN_USE`, and `COMPLETED` statuses.
4. **Waitlist Queue**: Pre-seeded waitlist entry for high-demand equipment.
5. **Notifications & Audit Logs**: System alerts and audit logs pre-populated for System Admin testing.
