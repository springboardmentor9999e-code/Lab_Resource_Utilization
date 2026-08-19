# 🔬 Lab Resource & Equipment Utilization Management System (REMS)

A state-of-the-art, full-stack enterprise web application for managing high-value laboratory equipment, inter-institution resource sharing, automated reservation waitlists, maintenance scheduling, and real-time utilization analytics.

---

## 📋 Table of Contents
1. [Tech Stack & Architecture](#-tech-stack--architecture)
2. [Role Hierarchy & Target Users](#-role-hierarchy--target-users)
3. [Core Services & Capabilities](#-core-services--capabilities)
4. [Project Structure](#-project-structure)
5. [Key Features & Workflows](#-key-features--workflows)
6. [REST API Endpoints Reference](#-rest-api-endpoints-reference)
7. [Installation & Local Setup](#-installation--local-setup)

---

## 🛠 Tech Stack & Architecture

### **Backend Framework & Logic**
* **Java 17 / 21**: Core programming language delivering high-performance, object-oriented business logic.
* **Spring Boot 3.3+**: Production-grade framework providing dependency injection, REST controllers, and rapid application lifecycle management.
* **Spring Security & JWT**: Stateless authentication and fine-grained authority authorization using JSON Web Tokens (JWT) with method-level `@PreAuthorize` guards.
* **Spring Data JPA / Hibernate**: Object-Relational Mapping (ORM) layer with automated entity mapping, custom repository queries, and transaction management (`@Transactional`).
* **PostgreSQL / H2 Database**: Relational database storage with custom table constraints, cascade triggers, and index optimizations.
* **JavaMailSender & Twilio API**: Asynchronous email (`@Async`) and SMS dispatches for critical alerts, booking confirmations, and approval requests.
* **Lombok**: Annotation processor for boilerplate reduction (`@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`).

### **Frontend Interface & Aesthetics**
* **React 18 & Vite**: Modern component-based single-page application (SPA) with ultra-fast hot module replacement (HMR) and optimized build bundling.
* **TailwindCSS & Custom Design Tokens**: Harmonious palette featuring vibrant gradients, sleek glassmorphism, responsive grids, dark mode support, and micro-animations.
* **Lucide React Icons**: Premium vector iconography for intuitive action recognition.
* **Custom Fetch Interceptors**: Centralized token management with `getAuthHeaders()` and automatic fallback handling for mock/demo modes.

---

## 👥 Role Hierarchy & Target Users

REMS supports a 6-tier hierarchical access model to govern administrative authorization, booking workflows, and equipment oversight across departments and institutions:

```
                  ┌────────────────────────────────────────┐
                  │ 👑 1. System Administrator (Role 6)     │
                  │    - Global Portal Governance          │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │ 🏛 2. Institution Admin (Role 5)       │
                  │    - Institution & Dept Management     │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │ 🏢 3. Department Head (Role 4)         │
                  │    - Budget, Sharing & Approvals       │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │ 🔬 4. Lab Manager (Role 3)              │
                  │    - Inventory, Bookings & Downtime    │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │ 🔧 5. Lab Technician (Role 2)           │
                  │    - Equipment Maintenance & Support   │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │ 🎓 6. Student / Researcher (Role 1)    │
                  │    - Catalog, Bookings & Waitlist      │
                  └────────────────────────────────────────┘
```

### **Target Users & Permissions Summary**

| Role | Title | Primary Responsibilities & Key Permissions |
| :--- | :--- | :--- |
| **Role 6** | **System Administrator** | Global governance, approves new partner institutions, manages cross-system sharing policies (`manage_all_institutions`, `manage_system_settings`). |
| **Role 5** | **Institution Admin** | Approves Department Heads and Lab Managers within their institution, manages institution departments, monitors global metrics. |
| **Role 4** | **Department Head** | Approves department-level resource sharing agreements, oversees department equipment budgets, approves lab manager registrations (`approve_sharing_requests`). |
| **Role 3** | **Lab Manager** | Approves/rejects student equipment bookings and return requests, places assets under maintenance, monitors expiring renewals (`approve_bookings`, `manage_equipment`). |
| **Role 2** | **Lab Technician** | Inspects equipment status, completes downtime records, logs calibration and maintenance logs (`update_equipment_status`). |
| **Role 1** | **Student / Researcher** | Explores inter-institution equipment catalog, submits reservation requests, joins priority waitlists, manages personal booking history (`create_booking`). |

---

## ⚙️ Core Services & Capabilities

The backend architecture is structured around specialized modular services:

### 1. **`AuthService`**
* Handles user registration, Google OAuth integration, role validation, and JWT token issuance.
* Manages multi-step user approval queues based on institution and role hierarchy.

### 2. **`BookingService`**
* Coordinates equipment reservations, checking real-time asset availability and blackout date conflicts.
* Manages multi-stage booking lifecycle: `PENDING_APPROVAL` ➔ `IN_USE` / `CONFIRMED` ➔ `PENDING_RETURN` ➔ `COMPLETED` / `CANCELLED`.

### 3. **`WaitlistService`**
* Manages automated waitlist queues when equipment is out of stock or booked.
* Implements an **Automated 10-Minute Priority Window**: when equipment is returned or made available, the top waitlisted user is notified and given 10 minutes to claim the reservation before auto-advancing to the next user.

### 4. **`MaintenanceService`**
* Tracks equipment downtime, maintenance reasons (`Breakdown`, `Scheduled Calibration`, `Upgrades`), and technician logs.
* Toggles asset status between `Under Maintenance` and `Operational` with instant database updates.

### 5. **`EquipmentService`**
* Handles inventory CRUD, category classification, laboratory assignment, and 30-day renewal alerts.
* Enforces strict role-scoped filtering (Lab Managers view lab assets; Department Heads view department assets).

### 6. **`InstitutionSharingService`**
* Facilitates reciprocal equipment-sharing tie-ups between registered research institutions.
* Manages sharing agreements across status phases (`PENDING`, `APPROVED`, `REJECTED`).

### 7. **`InAppNotificationService`**
* Dispatches in-app notification alerts across types: `WAITLIST`, `BOOKING`, `APPROVAL`, `MAINTENANCE`, `SHARING_REQUEST`, `SYSTEM`.
* Supports unread badge tracking, mark-as-read filtering, and safe fallback handling for SQL constraints.

### 8. **`NotificationService` & `EmailService` / `SmsService`**
* Asynchronous dispatch engine (`@Async`) delivering rich HTML email templates (`JavaMailSender`) and SMS notifications (`Twilio`).

### 9. **`EquipmentRenewalScheduler`**
* Background cron task (`@Scheduled`) evaluating expiring equipment daily and alerting lab managers/technicians.

---

## 📁 Project Structure

```
web_dev/
├── Backend/                                # Spring Boot Java Backend
│   ├── src/main/java/com/rems/
│   │   ├── controller/                     # REST API Controllers
│   │   │   ├── AuthController.java
│   │   │   ├── BookingController.java
│   │   │   ├── EquipmentController.java
│   │   │   ├── InstitutionController.java
│   │   │   ├── InstitutionSharingController.java
│   │   │   ├── MaintenanceController.java
│   │   │   ├── UserController.java
│   │   │   └── WaitlistController.java
│   │   ├── dto/                            # Request & Response Data Transfer Objects
│   │   ├── entity/                         # JPA Entities (User, Equipment, Booking, Waitlist, etc.)
│   │   ├── enums/                          # System Enums (BookingStatus, EquipmentStatus, Role, etc.)
│   │   ├── exception/                      # Global & API Exception Handling
│   │   ├── repository/                     # Spring Data JPA Repositories
│   │   ├── security/                       # SecurityConfig & JWT Authentication Filters
│   │   └── service/                        # Business Logic Services & Schedulers
│   └── pom.xml                             # Maven Dependencies & Configuration
│
└── Frontend/                               # React + Vite Frontend
    ├── src/
    │   ├── assets/                         # Static Images & Vector Graphics
    │   ├── components/                     # Core React Dashboard Components
    │   │   ├── AdminDashboard.jsx          # System & Institution Admin Portal
    │   │   ├── Dashboard.jsx               # Manager & Dept Head Operation Hub
    │   │   ├── Home.jsx                    # Landing Page & Partner Institution Directory
    │   │   ├── LoginModal.jsx              # Authentication Modal
    │   │   └── StudentDashboard.jsx        # Researcher & Student Workspace
    │   ├── App.jsx                         # Main Router & Global Error Boundary
    │   ├── index.css                       # Vanilla CSS Design System & Utilities
    │   └── main.jsx                        # React Root Mount Entry
    ├── package.json                        # Node.js Dependencies & Scripts
    └── vite.config.js                      # Vite Bundler Settings
```

---

## 🌟 Key Features & Workflows

### 🔄 **1. Equipment Reservation & Approval Flow**
1. Student browses available equipment across department labs.
2. Selects booking date/time slot and submits reservation request.
3. Department Lab Manager receives real-time approval notification.
4. Upon approval, asset inventory is updated, and student receives confirmation.
5. Upon usage completion, student requests equipment return for technician inspection.

### ⏱ **2. Priority Waitlist & 10-Minute Auto Sequence**
1. If equipment is unavailable, student joins the priority waitlist queue.
2. If a waitlist request expires without booking, the student can re-join the waitlist queue directly from the equipment card.
3. When equipment becomes available, `WaitlistService` automatically notifies position #1 and starts a 10-minute exclusive reservation window.
4. If unclaimed after 10 minutes, the slot auto-expires and notifies position #2.

### 🛠 **3. Downtime & Maintenance Management**
1. Technicians or Lab Managers mark faulty equipment as `Under Maintenance`.
2. Active bookings are held, and equipment is locked from new reservations.
3. Once repairs are completed, clicking **"Make Available"** completes the downtime log and restores equipment status to `Operational` in PostgreSQL.

### 🤝 **4. Cross-Institution Resource Sharing**
1. Institution Administrators establish reciprocal resource-sharing tie-ups.
2. Approved sharing agreements unlock cross-institution asset browsing for researchers while maintaining department security boundaries.

---

## 🔌 REST API Endpoints Reference

### **Authentication & Users**
* `POST /api/auth/login` ➔ Authenticate user & return JWT token.
* `POST /api/auth/register` ➔ Register new account.
* `GET /api/users/pending-approvals` ➔ Fetch registration approval requests (Admin/Manager only).
* `PATCH /api/users/{id}/approve-lab-manager` ➔ Approve Lab Manager account.

### **Equipment & Maintenance**
* `GET /api/equipment/all` ➔ List all equipment items with filters.
* `POST /api/equipment` ➔ Create new equipment asset (Lab Manager/Admin).
* `POST /api/maintenance/put-in-maintenance` ➔ Place equipment under maintenance.
* `POST /api/maintenance/{recordId}/make-available` ➔ Restore equipment status to Available.

### **Bookings & Waitlist**
* `POST /api/bookings` ➔ Submit equipment booking request.
* `PATCH /api/bookings/{id}/approve` ➔ Approve booking request.
* `PATCH /api/bookings/{id}/reject` ➔ Reject booking request.
* `POST /api/waitlist/join?equipmentId={id}` ➔ Join priority waitlist queue.
* `POST /api/waitlist/{id}/cancel` ➔ Cancel waitlist queue entry.

---

## 🚀 Installation & Local Setup

### **Prerequisites**
* **Java**: JDK 17 or higher
* **Node.js**: v18.0.0 or higher
* **Database**: PostgreSQL 14+ (or embedded H2 for quick start)
* **Build Tools**: Maven 3.8+, npm 9+

### **1. Backend Setup**
```bash
cd Backend

# Compile & verify Spring Boot application
mvn clean compile

# Run Spring Boot server (Default: http://localhost:8080)
mvn spring-boot:run
```

### **2. Frontend Setup**
```bash
cd Frontend

# Install Node.js dependencies
npm install

# Start Vite Development Server (Default: http://localhost:5173)
npm run dev
```

---

### 📄 License
Distributed under the MIT License. See `LICENSE` for more information.