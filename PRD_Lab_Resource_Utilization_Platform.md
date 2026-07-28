# Product Requirements Document (PRD)

---

## 1. Cover Page

| Field | Detail |
|-------|--------|
| **Product Name** | Lab Resource Utilization Platform (LRUP) |
| **Document Type** | Enterprise Product Requirements Document (PRD) |
| **Version** | 1.0 |
| **Date** | July 24, 2026 |
| **Prepared By** | Senior Product Manager |
| **Classification** | Confidential — Internal Use Only |

---

## 2. Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | July 24, 2026 | Senior Product Manager | Initial baseline PRD derived strictly from the "JAVA_Lab Resource Utilization Platform.pdf" architecture and requirements document. |

---

## 3. Table of Contents

1. Cover Page
2. Version History
3. Table of Contents
4. Executive Summary
5. Business Objective
6. Problem Statement
7. Project Vision
8. Project Scope
9. Stakeholders
10. User Roles and Responsibilities (Detailed)
11. Functional Requirements (Module-by-Module Breakdown)
    - Module 1: User Authentication & Role-Based Access
    - Module 2: Equipment Inventory Management
    - Module 3: Booking & Scheduling
    - Module 4: Utilization Monitoring
    - Module 5: Inter-Institution Resource Sharing
    - Module 6: Maintenance & Calibration
    - Module 7: Notification & Alert
    - Module 8: Analytics Dashboard
    - Module 9: Cost & Billing Management
    - Module 10: Reports & Export
12. Non-Functional Requirements
13. Business Rules
14. User Stories
15. Acceptance Criteria
16. System Workflow
17. Role-wise Workflow
18. Module-wise Workflow
19. Screen Flow
20. Screen Inventory
21. Navigation Flow
22. UI Requirements
23. Database Entities
24. API Requirements
25. System Architecture Explanation
26. Equipment Lifecycle
27. Booking Lifecycle
28. Maintenance Workflow
29. Resource Sharing Workflow
30. Notification Workflow
31. Analytics Workflow
32. Reports & Export Workflow
33. Security Requirements
34. Deployment Requirements
35. Testing Requirements
36. Risks & Assumptions
37. Success Metrics
38. Glossary
39. Appendix

---

## 4. Executive Summary

The Lab Resource Utilization Platform (LRUP) is a full-stack web application (React.js frontend + Spring Boot backend) designed to allow research institutions, lab administrators, and faculty members to centrally manage laboratory equipment. The platform facilitates cross-department and inter-institution sharing of expensive resources, tracks real-time equipment utilization, and handles maintenance and calibration workflows. By integrating these features into a centralized intelligence dashboard, the platform enables data-driven decisions regarding equipment procurement, sharing, and operational efficiency.

---

## 5. Business Objective

The primary objective is to allow institutions to share expensive laboratory equipment and optimize their utilization rates. The platform aims to provide real-time availability tracking, rule-based scheduling optimization, and inter-institution resource sharing workflows to drive data-driven procurement and sharing decisions.

---

## 6. Problem Statement

Not explicitly specified in the source document. However, based on the objectives, it is implied that research institutions struggle with suboptimal utilization of expensive laboratory equipment, lack centralized tracking for scheduling and maintenance, and face barriers in sharing resources across departments or between different institutions.

---

## 7. Project Vision

To create a centralized intelligence dashboard and full-stack lab resource utilization platform that empowers research institutions, universities, and laboratories to manage equipment inventory, schedule shared access, monitor real-time utilization, track maintenance, and seamlessly analyze resource efficiency.

---

## 8. Project Scope

The scope of the project includes the design, development, testing, and deployment of a full-stack platform utilizing a React.js client layer and a Spring Boot Modular Monolith backend.

### In-Scope Modules

1. User Authentication & Role-Based Access (JWT/OAuth2)
2. Equipment Inventory Management
3. Booking & Scheduling
4. Utilization Monitoring (including real-time IoT sensor API integration)
5. Inter-Institution Resource Sharing
6. Maintenance & Calibration
7. Cost & Billing Management
8. Notification & Alerts (Email, SMS, Push)
9. Analytics Dashboard & Reporting

### Out-of-Scope

Not specified in the source document.

---

## 9. Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| Research Institutions | Platform adoption, equipment sharing agreements, ROI |
| Universities | Departmental resource optimization, procurement decisions |
| Laboratories | Equipment uptime, maintenance compliance, utilization tracking |
| Faculty Members | Easy booking access, equipment availability visibility |
| Lab Administrators | Operational efficiency, cost recovery, cross-department coordination |

---

## 10. User Roles and Responsibilities

The system employs secure JWT and OAuth2 authentication with Role-Based Access Control (RBAC). Below is the detailed breakdown for each of the six identified roles.

### 10.1 System Administrator

**Responsibilities:** Oversee overarching platform architecture, system monitoring, and user management.

**Dashboard Features:** While a specific "System Admin Dashboard" feature list is not exclusively segregated from the Institution Admin in the text, it is implied they share access to System Monitoring, User Management, and overarching system health tools.

**Complete Login-to-Logout Workflow:** Not explicitly detailed in the source document. Implied flow: Authenticate via JWT/OAuth2 → Access Admin Console → Perform role/user management or system monitoring → Logout.

**Permissions:** Highest level of access, including User & Role Management, Password Resets, and Profile Management.

**Actions Allowed:** Manage roles, monitor system, manage users.

**Actions Not Allowed:** TBD — Not specified in the source document.

---

### 10.2 Institution Administrator

**Responsibilities:** Drive data-driven decisions on equipment procurement, organization-wide sharing, and ROI evaluations.

**Dashboard Features:**
- Organization-wide equipment utilization intelligence
- Cross-department resource sharing overview
- Procurement recommendations and cost analysis
- Equipment lifecycle and ROI metrics
- System monitoring and user management
- Reports management

**Complete Login-to-Logout Workflow:** Not explicitly detailed. Implied flow: Login via Institution Admin Console → View organization-wide utilization and ROI metrics → Generate cost analysis reports → Logout.

**Permissions:** Access to organization-wide data, cross-department analytics, and procurement reporting.

**Actions Allowed:** View cross-department sharing overviews, generate utilization/cost reports, monitor equipment lifecycle.

**Actions Not Allowed:** TBD — Not specified in the source document.

---

### 10.3 Department Head

**Responsibilities:** Oversee department-level equipment utilization, approve sharing requests, and monitor department usage.

**Dashboard Features:**
- Department equipment utilization heatmap
- Booking adoption and no-show rates
- Maintenance schedule overview
- High-demand equipment alerts
- Sharing requests and approvals

**Complete Login-to-Logout Workflow:** Not explicitly detailed. Implied flow: Login to Lab Admin Dashboard → Review utilization heatmap and booking adoption → Approve/reject inter-institution sharing requests → Logout.

**Permissions:** Department-level reporting, sharing request approvals.

**Actions Allowed:** View department utilization, approve sharing requests, track no-show rates.

**Actions Not Allowed:** TBD — Not specified in the source document.

---

### 10.4 Lab Manager

**Responsibilities:** Manage daily laboratory operations, handle high-demand equipment, monitor idle equipment alerts, and oversee maintenance schedules.

**Dashboard Features:** Shares the same dashboard features as the Department Head, focusing on:
- Department equipment utilization heatmap
- Booking adoption and no-show rates
- Maintenance schedule overview
- High-demand equipment alerts
- Sharing requests and approvals

**Complete Login-to-Logout Workflow:** Not explicitly detailed. Implied flow: Login to Lab Admin Dashboard → Check high-demand/idle alerts → Review maintenance schedule → Manage waitlists → Logout.

**Permissions:** Booking approval/rejection workflows, waitlist management.

**Actions Allowed:** Receive idle equipment alerts, approve bookings, oversee maintenance tasks.

**Actions Not Allowed:** TBD — Not specified in the source document.

---

### 10.5 Lab Technician

**Responsibilities:** Execute maintenance workflows, manage calibration, and update equipment service logs.

**Dashboard Features:** Not specified as a standalone analytical dashboard in the source document, but they utilize the Maintenance & Calibration Service and potentially a mobile task receiver.

**Complete Login-to-Logout Workflow:** Not explicitly detailed. Implied flow: Login → Receive task/work order → Perform maintenance/calibration → Update service log and certification records → Logout.

**Permissions:** Access to maintenance requests, work order management, and certification uploads.

**Actions Allowed:** Schedule preventive maintenance, track equipment downtime, manage calibration renewals, update equipment status to "Under Maintenance" or "Out of Service".

**Actions Not Allowed:** TBD — (Implied: Cannot approve booking requests or manage cross-department sharing).

---

### 10.6 Researcher / Student

**Responsibilities:** Discover available equipment, schedule access, and manage personal bookings and waitlists.

**Dashboard Features:**
- My bookings and upcoming reservations
- Equipment availability overview
- Booking history and usage summary
- Waitlist status and notifications
- Equipment recommendations based on booking history

**Complete Login-to-Logout Workflow:** Not explicitly detailed. Implied flow: Login to Researcher Portal → View equipment availability calendar → Create reservation → View booking status on dashboard → Logout.

**Permissions:** End-user access to booking workflows, calendar views, and personal history.

**Actions Allowed:** Reserve equipment, join waitlists, manage recurring bookings, view equipment specifications.

**Actions Not Allowed:** TBD — (Implied: Cannot approve bookings, manage inventory, or view cross-department cost analytics).

---

## 11. Functional Requirements (Module-by-Module Breakdown)

### Module 1: User Authentication & Role-Based Access

**Purpose:** To securely manage user identities, authenticate system access, and enforce strict permissions based on defined roles.

**Objectives:** Implement secure login workflows, support single sign-on (SSO), and manage user profiles and roles.

**Actors:** All System Users (System Administrator, Institution Administrator, Department Head, Lab Manager, Lab Technician, Researcher/Student).

**Preconditions:** Users must be provisioned in the system or possess a valid Google Workspace/OAuth account.

**Workflow:**
1. User accesses the login portal.
2. Chooses standard login (email/password) or Google OAuth.
3. API Gateway validates credentials/token.
4. JWT token is issued.
5. User is redirected to their role-specific dashboard.

**Business Rules:**
1. Strict Role-Based Access Control (RBAC) must be enforced via the API Gateway & Security Layer.
2. All API requests must pass through rate limiting and request validation.

**Validation Rules:**
1. Standard email/password validation.
2. Active status check on user profile.

**Functional Requirements:**
1. Implement JWT Authentication for session management.
2. Provide OAuth2 Login (Google OAuth) integration.
3. Provide Password Reset functionality.
4. Enable Profile Management for users to update their details.
5. Provide Role Management capabilities for System Administrators.

**Non-functional Requirements:** Low latency authentication; high security (Spring Security); CORS configuration; comprehensive request logging.

**User Stories:**
1. As a user, I want to log in using Google OAuth so that I can access the platform without remembering a new password.
2. As a System Admin, I want to assign roles to new users so that they receive the correct permissions.

**Acceptance Criteria:**
- [ ] Successful Google OAuth login issues a valid JWT token.
- [ ] System Admin can successfully alter a user's role, and the changes reflect on the user's next login.

**UI Screens:** Login Screen, Forgot Password Screen, Profile Management Screen, Admin Role Management Console.

**Database Tables:** User & Auth Tables (PostgreSQL).

**APIs:** Authentication Service APIs (Login, OAuth2 callback, Password Reset, Profile Update).

**Future Enhancements:** Not specified in the source document.

**PRD Compliance Gap:**

| PRD Requirement | Implementation Status | Gap Detail |
|----------------|----------------------|------------|
| JWT Authentication | Implemented | Full JWT with access + refresh tokens |
| OAuth2 Google Login | Implemented | Spring Security OAuth2 with custom success handler |
| Password Reset | Implemented | Token-based with email delivery |
| Profile Management | Implemented | ProfilePage component |
| Role Management | Implemented | RoleManagement admin page with @PreAuthorize |
| API Gateway (Spring Cloud Gateway) | **NOT IMPLEMENTED** | Monolithic Spring Boot; no gateway layer |
| Rate Limiting | **NOT IMPLEMENTED** | No rate limiting middleware |
| Request Validation at Gateway | **NOT IMPLEMENTED** | Validation via @Valid on controllers only |

---

### Module 2: Equipment Inventory Management

**Purpose:** To serve as the centralized repository for registering, cataloging, and tracking the status of all laboratory equipment.

**Objectives:** Digitally manage equipment specifications, manuals, calibration records, and map them to specific institutions and departments.

**Actors:** System Administrator, Institution Administrator, Department Head, Lab Manager.

**Preconditions:** System must have departments and institutions pre-configured.

**Workflow:**
1. Admin accesses the Inventory Module.
2. Registers new equipment.
3. Uploads specs/manuals.
4. Assigns tags and department mapping.
5. Sets status.
6. System updates Elasticsearch index for discoverability.

**Business Rules:**
1. Equipment must hold one of the following statuses at all times: Available, Booked, Under Maintenance, Out of Service, Retired.
2. Equipment must be mapped to a valid department and institution.
3. Required fields (name, category, department mapping) must be filled out before saving.

**Validation Rules:**
1. Equipment name is required and must be unique within a department.
2. Category must be from a predefined list.
3. Department and institution references must exist in the system.

**Functional Requirements:**
1. Equipment registration and cataloging.
2. Equipment specifications and documentation management (uploading manuals to AWS S3/Cloudinary).
3. Equipment categorization and tagging.
4. Equipment availability status tracking.
5. Calibration and certification record management.
6. Department and institution mapping.

**Non-functional Requirements:** High-performance search indexing via Elasticsearch; secure and reliable document storage via AWS S3/Cloudinary.

**User Stories:**
1. As a Lab Manager, I want to upload a calibration certificate so that the compliance record is attached to the specific equipment.
2. As a Researcher, I want to search for equipment by category and specification so that I can find the right tool for my experiment.
3. As an Institution Admin, I want to view equipment lifecycle status across departments so that I can plan procurement.

**Acceptance Criteria:**
- [ ] Documents uploaded are securely stored in AWS S3/Cloudinary and successfully linked to the equipment's database profile.
- [ ] Equipment status updates accurately reflect in real-time across the platform.
- [ ] Equipment can be filtered by category, department, institution, and status.
- [ ] Calibration records are linked to equipment with next-due-date tracking.

**UI Screens:** Equipment Catalog, Add/Edit Equipment Modal, Equipment Specifications Detail View, Document Upload Interface.

**Database Tables:** Equipment & Inventory Tables (PostgreSQL) — Equipment, Equipment Categories, Equipment Documents, Calibration Records.

**APIs:** Equipment Inventory Service APIs (CRUD, Search, Status Update, Document Upload).

**Future Enhancements:** Not specified in the source document.

**PRD Compliance Gap:**

| PRD Requirement | Implementation Status | Gap Detail |
|----------------|----------------------|------------|
| Equipment Registration | Implemented | Full CRUD with 7 statuses (enhanced from PRD's 5) |
| Document Upload (S3/Cloudinary) | **PARTIAL** | Local filesystem (`/uploads/`) only; no cloud storage |
| Elasticsearch Indexing | **NOT IMPLEMENTED** | JPA queries used instead; no full-text search |
| Equipment Categorization | Implemented | 10 seeded categories via Flyway |
| Calibration Records | Implemented | Table exists with next_due_date; no dedicated page |
| Equipment Tagging | **NOT IMPLEMENTED** | No tags table or many-to-many tagging |
| Equipment Specifications (JSON) | **NOT IMPLEMENTED** | No specifications column for technical specs |

---

### Module 3: Booking & Scheduling

**Purpose:** To facilitate and optimize the reservation of laboratory resources.

**Objectives:** Provide a real-time calendar, manage complex booking workflows (approvals, recurring, waitlists), and track booking audit trails.

**Actors:** Researcher/Student, Lab Manager, Department Head.

**Preconditions:** Target equipment must have a status of "Available".

**Workflow:**
1. Researcher views calendar.
2. Selects time slot.
3. Submits booking.
4. Lab Manager approves (if rule requires).
5. Status changes to 'Confirmed'.
6. If equipment is fully booked, user joins Waitlist.

**Business Rules:**
1. Bookings must track through the following statuses: Pending Approval, Confirmed, In Use, Completed, Cancelled, No Show.
2. System must apply rule-based scheduling optimization.
3. Equipment marked as "exclusive" cannot be double-booked for the same time slot.
4. Equipment with status "Under Maintenance" or "Out of Service" cannot accept new bookings.

**Validation Rules:**
1. System must prevent double-booking of exclusive-use equipment.
2. Booking start time must be in the future.
3. Booking end time must be after start time.
4. User must have an active account status.

**Functional Requirements:**
1. Provide a real-time equipment availability calendar.
2. Execute equipment reservation and booking workflows.
3. Manage recurring bookings.
4. Facilitate booking approval and rejection workflows for managers.
5. Manage waitlists for high-demand equipment.
6. Maintain a complete booking history and audit trail.

**Non-functional Requirements:** Frontend rendering using FullCalendar.js; real-time booking updates via WebSockets/Kafka.

**User Stories:**
1. As a Researcher, I want to view a real-time equipment availability calendar and reserve time slots so that I can secure access to necessary lab resources.
2. As a Researcher, I want to add myself to a waitlist for high-demand equipment so I can be notified if a slot opens up.
3. As a Lab Manager, I want to approve or reject booking requests so that I can control equipment access.
4. As a Researcher, I want to set up recurring bookings so that I have regular access to equipment I use frequently.

**Acceptance Criteria:**
- [ ] System successfully registers the user on the waitlist and triggers a notification if a cancellation occurs.
- [ ] Double-booking of exclusive equipment is prevented by the system.
- [ ] Booking status transitions are enforced and tracked in the audit trail.
- [ ] Real-time calendar updates reflect across all connected clients via WebSocket.

**UI Screens:** Equipment Availability Calendar View (React.js with FullCalendar), Booking Request Modal, Booking History Table, Approvals Dashboard (Admin), Waitlist Management Page.

**Database Tables:** Booking & Scheduling Tables (PostgreSQL) — Bookings, Waitlist Entries, Booking Audit Trail.

**APIs:** Booking & Scheduling Service APIs (Create, Approve, Reject, Cancel, Waitlist, History).

**Future Enhancements:** Not specified in the source document.

**PRD Compliance Gap:**

| PRD Requirement | Implementation Status | Gap Detail |
|----------------|----------------------|------------|
| Real-time Calendar | Implemented | FullCalendar.js with month/week/day views |
| Booking Workflow | Implemented | 10 statuses (enhanced from PRD's 6) |
| Waitlist Backend | Implemented | Auto-promotion on cancellation |
| Waitlist UI | **NOT IMPLEMENTED** | No dedicated Waitlist Management screen |
| Recurring Bookings | **NOT IMPLEMENTED** | No recurring booking support |
| FullCalendar.js | Implemented | Integrated in BookingCalendarPage |
| WebSocket Real-time | Implemented | STOMP over SockJS |
| Kafka/RabbitMQ | **NOT IMPLEMENTED** | WebSocket only; no message broker |
| Rule-based Scheduling Optimization | **NOT IMPLEMENTED** | No priority/optimization engine |

---

### Module 4: Utilization Monitoring

**Purpose:** To track, calculate, and visualize how effectively lab resources are being used in real-time.

**Objectives:** Detect idle time, identify peak usage patterns, and provide utilization rate calculations against capacity targets.

**Actors:** Department Head, Lab Manager, Institution Administrator.

**Preconditions:** Equipment must be registered, and IoT Sensor APIs must be transmitting usage data.

**Workflow:**
1. IoT sensors capture real-time usage data.
2. Send to IoT Sensor API.
3. Utilization Monitoring Service processes data.
4. Compares against benchmarks.
5. Generates Heatmap/Alerts.

**Business Rules:**
1. Utilization must be analyzed across four specific dimensions:
   - Individual Equipment vs. Capacity
   - Department vs. Institutional Targets
   - Current Utilization vs. Historical Benchmarks
   - Shared vs. Exclusive Usage Patterns

**Validation Rules:**
1. Data ingested from IoT sensors must be validated for accurate timestamping and equipment ID mapping.

**Functional Requirements:**
1. Track real-time equipment usage (via IoT Sensor APIs).
2. Calculate utilization rates per equipment.
3. Aggregate utilization at department and institutional levels.
4. Detect idle time and generate automated alerts.
5. Analyze peak usage patterns.
6. Provide utilization heatmap visualizations.

**Non-functional Requirements:** Handle high-throughput asynchronous real-time data using Apache Kafka / RabbitMQ and Redis caching. UI visualization utilizing D3.js, Chart.js, or Recharts.

**User Stories:**
1. As a Department Head, I want to view a utilization heatmap so that I can easily identify peak usage hours and idle periods.
2. As an Institution Admin, I want to compare utilization across departments so that I can allocate resources effectively.
3. As a Lab Manager, I want to receive idle equipment alerts so that I can optimize resource allocation.

**Acceptance Criteria:**
- [ ] Heatmap correctly renders active vs. idle times based on real-time and historical DB data.
- [ ] Utilization rates are calculated accurately per equipment, per department, and per institution.
- [ ] Idle equipment alerts are triggered when equipment remains unused beyond configurable thresholds.

**UI Screens:** Utilization Heatmap Visualization, Utilization Analytics Dashboard.

**Database Tables:** Utilization & Monitoring Tables (PostgreSQL) — Utilization Records, Usage Logs, Alert History.

**APIs:** Utilization Monitoring Service APIs, IoT Sensor APIs.

**Future Enhancements:** Not specified in the source document.

**PRD Compliance Gap:**

| PRD Requirement | Implementation Status | Gap Detail |
|----------------|----------------------|------------|
| Utilization Calculation | Implemented | Booking-based hour calculation with EXTRACT(EPOCH) |
| Department Aggregation | Implemented | Department-level rollup queries |
| Utilization Heatmap | Implemented | Frontend UtilizationMonitor page |
| IoT Sensor API Integration | **NOT IMPLEMENTED** | No sensor data ingestion; booking-based only |
| Kafka/RabbitMQ | **NOT IMPLEMENTED** | No message broker for async data |
| Redis Caching | **NOT IMPLEMENTED** | No caching layer |
| D3.js Heatmap | **NOT IMPLEMENTED** | Uses Recharts; no D3.js heatmap |
| Idle Equipment Alerts | **NOT IMPLEMENTED** | No automated idle detection |
| Peak Usage Pattern Analysis | **NOT IMPLEMENTED** | Basic stats only |
| Real-time Usage Tracking | **NOT IMPLEMENTED** | Relies on booking data, not live sensors |

---

### Module 5: Inter-Institution Resource Sharing

**Purpose:** To break down operational silos by allowing multiple institutions and departments to discover and share expensive laboratory resources.

**Objectives:** Coordinate external bookings, manage sharing agreements, and calculate cost-sharing fees.

**Actors:** Institution Administrator, Department Head, external Researchers/Students.

**Preconditions:** Sharing agreements must be configured and equipment must be flagged as eligible for inter-institution sharing.

**Workflow:**
1. External user searches for equipment (via Elasticsearch).
2. Submits access request.
3. Dept Head/Inst Admin approves sharing agreement.
4. Shared scheduling coordinates the booking.
5. Usage fee is calculated post-usage.

**Business Rules:**
1. Access rules and cost-sharing calculations must strictly adhere to the defined inter-institution sharing agreements.
2. External booking requests cannot bypass the access request workflow approval step.
3. Equipment must be flagged as eligible for inter-institution sharing before it appears in external search results.

**Validation Rules:**
1. External users must have a verified institutional affiliation.
2. Sharing agreements must be active and not expired.
3. Cost-sharing rates must be defined in the sharing agreement before external bookings are permitted.

**Functional Requirements:**
1. Provide cross-institution equipment listing and discovery.
2. Manage sharing agreements and access request workflows.
3. Handle external booking and access management.
4. Execute usage fee and cost-sharing calculations.
5. Coordinate shared equipment scheduling.
6. Generate sharing analytics and partnership reporting.

**Non-functional Requirements:** Cross-tenant data isolation logic within the PostgreSQL schema; fast cross-institution searching via Elasticsearch.

**User Stories:**
1. As an Institution Administrator, I want to review sharing analytics so that I can evaluate the ROI of our partnership agreements.
2. As an external Researcher, I want to discover and request access to equipment at partner institutions so that I can conduct experiments not possible at my home institution.
3. As a Department Head, I want to approve or reject sharing requests so that I can control access to my department's equipment.
4. As an Institution Admin, I want to define sharing agreements with partner institutions so that cost-sharing terms are clearly documented.

**Acceptance Criteria:**
- [ ] System accurately generates partnership reports detailing external usage hours and total cost-sharing fees calculated.
- [ ] External booking requests cannot proceed without approval from the appropriate Department Head or Institution Admin.
- [ ] Cross-tenant data isolation prevents unauthorized access to institution-specific data.
- [ ] Sharing agreements are enforced — expired agreements block new external bookings.

**UI Screens:** Cross-department Resource Sharing Overview, External Discovery Search Page, Access Request Approval Dashboard, Sharing Agreement Management Page.

**Database Tables:** Booking & Scheduling Tables, Equipment Tables, Institution Partnerships, Shared Equipment, External Booking Requests, Cost Sharing Records.

**APIs:** Resource Sharing Service APIs (Discovery, Agreement CRUD, Access Request, Cost Calculation).

**Future Enhancements:** Not specified in the source document.

**PRD Compliance Gap:**

| PRD Requirement | Implementation Status | Gap Detail |
|----------------|----------------------|------------|
| Cross-institution Discovery | Implemented | Elasticsearch-style search via JPA queries |
| Sharing Agreements | Implemented | `institution_partnerships` table with status workflow |
| External Booking Requests | Implemented | `external_booking_requests` table with approval flow |
| Shared Equipment Management | Implemented | `shared_equipment` table with hourly rates |
| Cost-sharing Calculations | Implemented | Calculated in ResourceSharingService |
| Sharing Analytics | Implemented | PartnershipAnalyticsResponse with hours/roi |
| Elasticsearch Cross-institution Search | **NOT IMPLEMENTED** | JPA queries used; no Elasticsearch |
| Cross-tenant Data Isolation | **PARTIAL** | Filtered by institution_id in queries; no schema-level isolation |

---

### Module 6: Maintenance & Calibration

**Purpose:** To manage the upkeep, repair, and compliance of laboratory equipment.

**Objectives:** Automate preventive maintenance scheduling, manage work orders, and track calibration certifications to minimize equipment downtime.

**Actors:** Lab Technician, Lab Manager, Department Head.

**Preconditions:** Equipment must exist in the Inventory Module.

**Workflow:**
1. Maintenance due date approaches.
2. Alert triggered.
3. Work order assigned to Lab Technician.
4. Technician performs maintenance.
5. Updates equipment service log.
6. Uploads new calibration certificate (if applicable).
7. Equipment status returns to "Available".

**Business Rules:**
1. Equipment with a status of "Under Maintenance" or "Out of Service" cannot be booked.
2. Maintenance work orders must follow a lifecycle: PENDING → ASSIGNED → IN_PROGRESS → ON_HOLD → COMPLETED → VERIFIED → CLOSED.
3. Calibration certificates must be uploaded in a valid document format (e.g., PDF) before certification status is updated.

**Validation Rules:**
1. Calibration certificates must be uploaded in a valid document format (e.g., PDF) before certification status is updated.
2. Work orders must be assigned to a user with the LAB_TECHNICIAN role.
3. Equipment status must be updated to "Under Maintenance" when a work order begins.

**Functional Requirements:**
1. Schedule preventive maintenance.
2. Manage maintenance requests and work orders.
3. Track calibration and send certification renewal reminders.
4. Maintain maintenance history and service logs.
5. Track equipment downtime.
6. Assign technicians and manage tasks.

**Non-functional Requirements:** Documents (reports/certificates) must be securely stored via AWS S3 / Cloudinary.

**User Stories:**
1. As a Lab Technician, I want to view my assigned maintenance tasks so that I know which equipment requires service today.
2. As a Lab Manager, I want to receive calibration expiry reminders so that I can schedule renewal before compliance is breached.
3. As a Department Head, I want to view equipment downtime reports so that I can assess impact on departmental productivity.
4. As a Lab Technician, I want to upload a calibration certificate directly from my mobile device so that I can update records on-site.

**Acceptance Criteria:**
- [ ] When a technician updates a task to "Completed", the system automatically logs the downtime and updates the equipment status.
- [ ] Calibration expiry alerts are triggered at configurable intervals before the due date.
- [ ] Equipment with "Under Maintenance" or "Out of Service" status cannot be booked.
- [ ] Maintenance history is fully auditable with timestamps and technician attribution.

**UI Screens:** Maintenance Task Dashboard (for Technicians), Work Order Details Modal, Calibration Tracking Page, Maintenance History View.

**Database Tables:** Maintenance Tables (PostgreSQL) — Maintenance Work Orders, Calibration Records, Maintenance History, Equipment Service Logs.

**APIs:** Maintenance & Calibration Service APIs (Work Order CRUD, Calibration CRUD, Status Update, History).

**Future Enhancements:** Not specified in the source document.

**PRD Compliance Gap:**

| PRD Requirement | Implementation Status | Gap Detail |
|----------------|----------------------|------------|
| Work Order Lifecycle | Implemented | 8-state enum (PENDING through CANCELLED) |
| Calibration Records | Implemented | Table with next_due_date, result, certificate_url |
| Maintenance History | Implemented | `maintenance_history` table with full audit |
| Preventive Maintenance Scheduling | Implemented | `preventive_maintenance_date` on equipment |
| Downtime Tracking | Implemented | `downtime_hours` calculation in queries |
| Document Upload (S3/Cloudinary) | **PARTIAL** | Local filesystem only; no cloud storage |
| Calibration Expiry Alerts (automated) | **NOT IMPLEMENTED** | No scheduled job for calibration reminders |
| Mobile Task Receiver | **NOT IMPLEMENTED** | Web only; no mobile app |
| Equipment Status Auto-update on Completion | Implemented | EquipmentLifecycleService handles transitions |

---

### Module 7: Notification & Alert

**Purpose:** To proactively inform users of system events, status changes, and required actions.

**Objectives:** Deliver timely multi-channel notifications (Email, SMS, Push) based on triggered events across all modules.

**Actors:** All System Users.

**Preconditions:** Users must have valid contact information (email, phone number) and device tokens (for push) registered in their profiles.

**Workflow:**
1. Event occurs (e.g., booking confirmed, equipment idle).
2. Event published to Message Broker (Kafka/RabbitMQ).
3. Notification Service consumes event.
4. Dispatches via Email (JavaMailSender), SMS (Twilio), or Push (Firebase).

**Business Rules:**
1. Users can receive notifications across three distinct channels depending on urgency and preference.
2. Notification preferences are configurable per user per channel.
3. High-priority notifications (maintenance alerts, booking confirmations) bypass user preference opt-outs.

**Validation Rules:**
1. Users must have valid contact information registered before notifications can be dispatched.
2. Email notifications require a valid email address; SMS requires a valid phone number; Push requires a device token.

**Functional Requirements:**
1. Send booking confirmation and reminder notifications.
2. Send equipment availability alerts for waitlisted users.
3. Send maintenance due and calibration expiry alerts.
4. Trigger idle equipment alerts for lab managers.
5. Send sharing request and approval notifications.
6. Support delivery via Email, SMS, and Push notifications.

**Non-functional Requirements:** High delivery reliability using real-time message brokers (Apache Kafka / RabbitMQ).

**User Stories:**
1. As a Lab Manager, I want to receive an SMS alert for idle high-demand equipment so I can open up availability.
2. As a Researcher, I want to receive a push notification when my waitlisted equipment becomes available so I can quickly claim the slot.
3. As a Lab Technician, I want to receive email reminders for upcoming calibration deadlines so I can plan my work schedule.
4. As a user, I want to configure my notification preferences so that I only receive alerts relevant to me.

**Acceptance Criteria:**
- [ ] The system successfully triggers a Twilio SMS and Firebase Push notification within seconds of an equipment waitlist slot opening.
- [ ] Notification preferences are respected — users do not receive channels they have opted out of.
- [ ] Notification history is stored and accessible in the user's Notification Center.
- [ ] Failed notification deliveries are logged and retry mechanism is attempted.

**UI Screens:** Notifications Center (User Inbox), Notification Preferences Page.

**Database Tables:** Notification Tables — Notifications, Notification Preferences, Notification Channels.

**APIs:** Notification Service APIs; External integrations (Twilio, Firebase FCM, JavaMailSender).

**Future Enhancements:** Not specified in the source document.

**PRD Compliance Gap:**

| PRD Requirement | Implementation Status | Gap Detail |
|----------------|----------------------|------------|
| Email Notifications (JavaMailSender) | Implemented | EmailService with MimeMessageHelper |
| In-App Notifications | Implemented | Notification entity with read/unread status |
| Notification Preferences | Implemented | Per-channel toggle (email/sms/push/inApp) |
| Notification Center UI | Implemented | NotificationCenter + NotificationPreferences pages |
| WebSocket Real-time Push | Implemented | STOMP messaging via NotificationService |
| SMS (Twilio) | **PARTIAL** | SmsNotificationService is a stub — logs only |
| Push Notifications (Firebase FCM) | **NOT IMPLEMENTED** | No FCM SDK integration |
| Kafka/RabbitMQ Message Broker | **NOT IMPLEMENTED** | Direct service calls; no async messaging |
| Scheduled Notification Jobs | Implemented | NotificationScheduler for maintenance reminders |
| Notification Retry Mechanism | **NOT IMPLEMENTED** | No retry on failed delivery |

---

### Module 8: Analytics Dashboard

**Purpose:** To provide role-specific, actionable intelligence and data visualization regarding lab resource utilization.

**Objectives:** Synthesize data from bookings, maintenance, and IoT sensors into visual dashboards (heatmaps, ROI metrics, charts).

**Actors:** Researcher/Student, Lab Manager, Department Head, Institution Administrator.

**Preconditions:** Data must be actively collected in the PostgreSQL databases and Redis cache.

**Workflow:**
1. User logs in.
2. Frontend requests analytics data.
3. Analytics Service aggregates data.
4. Data is rendered using Chart.js / Recharts / D3.js.

**Business Rules:**
1. Dashboards must be strictly isolated by Role-Based Access Control (RBAC).
2. Researcher dashboards show only personal data.
3. Department Head/Lab Manager dashboards show department-scoped data.
4. Institution Admin dashboards show organization-wide data.

**Validation Rules:**
1. Users must be authenticated and authorized for the requested dashboard level.

**Functional Requirements:**
1. **Researcher Dashboard:** Display upcoming bookings, equipment availability, booking history, waitlist status, and booking-based recommendations.
2. **Lab Manager/Dept Head Dashboard:** Display utilization heatmaps, booking adoption/no-show rates, maintenance overviews, high-demand alerts, and sharing requests.
3. **Institution Admin Dashboard:** Display organization-wide utilization intelligence, cross-department sharing overview, procurement recommendations, cost analysis, equipment lifecycle, ROI metrics, and system monitoring.

**Non-functional Requirements:** Fast data retrieval using Redis caching; rich UI rendering with charting libraries.

**User Stories:**
1. As an Institution Admin, I want to view ROI metrics for expensive equipment so that I can justify future procurement budgets.
2. As a Lab Manager, I want to view my department's utilization heatmap so that I can identify underused equipment.
3. As a Researcher, I want to see equipment recommendations based on my booking history so that I can discover relevant tools.
4. As a Department Head, I want to compare my department's utilization against institutional benchmarks so that I can set improvement targets.

**Acceptance Criteria:**
- [ ] The dashboard successfully loads role-specific widgets and prevents users from accessing higher-tier analytics.
- [ ] Utilization heatmaps render correctly with color-coded intensity based on usage data.
- [ ] ROI metrics are calculated from actual booking hours and equipment cost data.
- [ ] Dashboard loads within acceptable performance thresholds (< 3 seconds).

**UI Screens:** Researcher Portal (ResearcherDashboard), Lab Admin Dashboard (LabManagerDashboard), Institution Admin Console (AdminDashboard), Analytics Dashboard (AnalyticsDashboard).

**Database Tables:** Analytics Tables (PostgreSQL) — Aggregated utilization data, ROI calculations, procurement recommendations.

**APIs:** Analytics & Reporting Service APIs (Dashboard Data, Aggregation, ROI Calculation).

**Future Enhancements:** Not specified in the source document.

**PRD Compliance Gap:**

| PRD Requirement | Implementation Status | Gap Detail |
|----------------|----------------------|------------|
| Researcher Dashboard | Implemented | ResearcherDashboard with booking stats, categories, recent bookings |
| Lab Manager Dashboard | Implemented | LabManagerDashboard with department stats, utilization, alerts |
| Institution Admin Dashboard | Implemented | AdminDashboard with 6 widget cards, utilization intelligence |
| Analytics Dashboard | Implemented | AnalyticsDashboard with Recharts (bar, pie, line charts) |
| Utilization Heatmap | Implemented | UtilizationMonitor with day-of-week × hour heatmap |
| Role-based Widget Isolation | Implemented | DashboardRouter in App.jsx routes by role |
| D3.js Heatmap | **NOT IMPLEMENTED** | Uses Recharts; no D3.js |
| Redis Caching | **NOT IMPLEMENTED** | Direct DB queries; no caching |
| Booking-based Recommendations | **NOT IMPLEMENTED** | No recommendation engine |
| IoT Sensor Data Integration | **NOT IMPLEMENTED** | Booking-based analytics only |

---

### Module 9: Cost & Billing Management

**Purpose:** To track the financial aspects of equipment utilization and facilitate cost recovery.

**Objectives:** Calculate usage-based costs, allocate department budgets, and generate inter-institution billing.

**Actors:** Lab Manager, Department Head, Institution Administrator.

**Preconditions:** Cost parameters (hourly rates, sharing fees) must be defined in equipment profiles and sharing agreements.

**Workflow:**
1. Booking is completed.
2. System calculates duration.
3. Multiplies by equipment rate.
4. Allocates cost to department or external institution.
5. Generates invoice/report.

**Business Rules:**
1. Billing calculations must differentiate between internal department allocation and inter-institution chargebacks.
2. Cost calculations must strictly adhere to time logged in "In Use" status versus scheduled time.
3. Invoices must be generated for all completed inter-institution bookings.

**Validation Rules:**
1. Cost calculations must use accurate time tracking from booking start/end timestamps.
2. Equipment hourly rates must be defined before cost calculations can proceed.
3. Budget allocations must not exceed defined departmental budget limits.

**Functional Requirements:**
1. Track usage-based costs per equipment.
2. Allocate costs department-wise.
3. Execute inter-institution billing for shared equipment.
4. Manage cost recovery and chargeback workflows.
5. Track budget utilization.
6. Generate financial reports and invoices.

**Non-functional Requirements:** High arithmetic precision for financial data in PostgreSQL.

**User Stories:**
1. As a Department Head, I want to track budget utilization so I can ensure my department stays within its resource spending limits.
2. As an Institution Admin, I want to generate inter-institution invoices automatically so that billing is accurate and timely.
3. As a Lab Manager, I want to view cost-per-booking for each piece of equipment so that I can identify cost-efficient resources.
4. As a Department Head, I want to set departmental budgets so that spending can be controlled proactively.

**Acceptance Criteria:**
- [ ] System accurately generates an inter-institution invoice upon completion of an external booking.
- [ ] Cost calculations match (booking duration × equipment hourly rate) within acceptable precision.
- [ ] Department budget utilization is displayed as a percentage of allocated budget.
- [ ] Financial reports can be exported in PDF and Excel formats.

**UI Screens:** Budget & Cost Tracking Dashboard (CostDashboard), Invoice Generation Screen (InvoiceManagement), Payment Tracking (PaymentTracking).

**Database Tables:** Utilization & Monitoring Tables, Analytics Tables (implied), Invoices, Payments.

**APIs:** Analytics & Reporting Service APIs, Cost & Billing Service APIs.

**Future Enhancements:** Not specified in the source document.

**PRD Compliance Gap:**

| PRD Requirement | Implementation Status | Gap Detail |
|----------------|----------------------|------------|
| Usage-based Cost Tracking | Implemented | BookingResponse includes cost fields |
| Invoice Management | Implemented | InvoiceManagement page with CRUD |
| Payment Tracking | Implemented | PaymentTracking page with status workflow |
| Cost Dashboard | Implemented | CostDashboard with summary cards |
| Inter-institution Billing | Implemented | SharedEquipment has hourly_rate; invoices generated |
| Department Budget Tracking | **PARTIAL** | BudgetSummaryResponse exists but all values hardcoded to zero |
| Budgets Table | **NOT IMPLEMENTED** | No `budgets` table in database |
| Automated Invoice on Booking Complete | **NOT IMPLEMENTED** | InvoiceService exists but not auto-triggered |
| Cost-per-Booking Calculation | **PARTIAL** | InvoiceService hardcodes purchase_cost as hourly rate |
| Financial Report Export | **PARTIAL** | Excel export works; PDF is plain text |

---

### Module 10: Reports & Export

**Purpose:** To allow users to extract system data for offline analysis, auditing, and sharing.

**Objectives:** Generate structured reports across utilization, maintenance, and billing, and export them to standard formats (PDF, Excel).

**Actors:** Institution Administrator, Department Head, Lab Manager.

**Preconditions:** Sufficient historical data must exist in the system.

**Workflow:**
1. User navigates to Reports.
2. Selects report parameters (date range, type).
3. Generates report.
4. Clicks Export (PDF/Excel).
5. File downloads.

**Business Rules:**
1. Users can only generate reports for data within their permission scope.
2. Date ranges must be valid (start date before end date).

**Validation Rules:**
1. Date range parameters must be valid (start date before end date).
2. Report type must be from the predefined list.
3. Users must have appropriate role authorization for the requested report scope.

**Functional Requirements:**
1. Generate equipment utilization reports.
2. Generate department resource usage reports.
3. Generate maintenance and downtime reports.
4. Generate inter-institution sharing reports.
5. Generate procurement and cost analysis reports.
6. Support PDF export.
7. Support Excel export.

**Non-functional Requirements:** Efficient querying for large datasets; asynchronous generation for large reports (implied).

**User Stories:**
1. As a Lab Manager, I want to export a maintenance downtime report to Excel so I can present it in our monthly operational meeting.
2. As an Institution Admin, I want to generate a utilization report for the last quarter so that I can identify trends and plan procurement.
3. As a Department Head, I want to generate a cost analysis report so that I can present budget utilization to leadership.
4. As a Lab Manager, I want to generate an inter-institution sharing report so that I can review partnership activity.

**Acceptance Criteria:**
- [ ] Exported PDF and Excel files accurately reflect the data displayed on the UI and maintain formatting.
- [ ] Reports respect RBAC — users cannot access data outside their permission scope.
- [ ] Excel export generates valid .xlsx files with proper column headers and data types.
- [ ] Large report generation does not block the UI (async if necessary).

**UI Screens:** Reports Management Page (ReportsPage).

**Database Tables:** Analytics Tables.

**APIs:** Analytics & Reporting Service APIs (Report Generation, Export).

**Future Enhancements:** Not specified in the source document.

**PRD Compliance Gap:**

| PRD Requirement | Implementation Status | Gap Detail |
|----------------|----------------------|------------|
| Excel Export | Implemented | Apache POI with .xlsx generation; upgraded to 5.4.0 |
| PDF Export | **PARTIAL** | Generates file with .pdf extension but content is plain text; no iText/PDFBox |
| Utilization Reports | Implemented | UtilizationReportData with daily/hourly breakdown |
| Maintenance Reports | Implemented | MaintenanceReportData with downtime/cost |
| Sharing Reports | Implemented | SharingReportData with external hours/revenue |
| Report Parameters (date range, type) | Implemented | ReportParameterDTO with type enum |
| Report History | **PARTIAL** | In-memory ConcurrentHashMap; lost on restart |
| Report Metadata Persistence | **NOT IMPLEMENTED** | No `reports` table for storing report generation history |
| Async Report Generation | **NOT IMPLEMENTED** | Synchronous only |
| RBAC-scoped Reports | Implemented | Backend filters by user role and department |

---

## Role-Specific Detailed Sections

---

### R1: System Administrator

**Role Enum Value:** `SYSTEM_ADMIN`

**Responsibilities:**
- Oversee overarching platform architecture and system health.
- Manage all user accounts across all institutions.
- Configure system-wide roles and permissions.
- Monitor system performance, API metrics, and audit logs.
- Manage announcements broadcast to all users.
- Handle escalated maintenance and booking issues.

**Dashboard Features:**
- Platform-wide utilization intelligence across all institutions.
- System monitoring (JVM, memory, disk, database health).
- User management across all institutions.
- Role and permission configuration.
- Audit log viewer with full system activity trail.
- Announcement management for system-wide broadcasts.

**Complete Login-to-Logout Workflow:**
1. Navigate to `/login` and authenticate via email/password or Google OAuth.
2. JWT token issued; redirected to `/dashboard` → AdminDashboard renders.
3. Review system health widgets (CPU, memory, disk, DB status, active users).
4. Navigate to `/admin/users` to manage user accounts (create, edit, deactivate, change roles).
5. Navigate to `/admin/roles` to configure role permissions.
6. Navigate to `/admin/audit-logs` to review system activity.
7. Navigate to `/admin/system` for real-time system monitoring.
8. Navigate to `/admin/announcements` to create/manage platform-wide announcements.
9. Navigate to `/admin/utilization` to review cross-institution utilization.
10. Navigate to `/admin/costs` to review organization-wide cost analytics.
11. Navigate to `/admin/sharing` to review inter-institution sharing activity.
12. Click profile icon → Profile Management → update personal details or change password.
13. Click logout → refresh token revoked, session cleared, redirected to `/login`.

**Permissions:**
- Full CRUD access to all user accounts across all institutions.
- Role configuration and permission management.
- System monitoring and health checks.
- Audit log access (full system-wide visibility).
- Announcement creation and management.
- Access to all admin pages including Cost, Utilization, Sharing dashboards.

**Actions Allowed:**
- Create, read, update, delete any user account.
- Assign any role to any user.
- View all audit logs across all institutions.
- Create, publish, and manage announcements.
- Access system monitoring and health dashboards.
- View cross-institution utilization, cost, and sharing analytics.
- Configure system-wide settings.

**Actions Not Allowed:**
- TBD — Not specified in the source document. (Implied: Should not perform day-to-day booking operations or maintenance tasks.)

---

### R2: Institution Administrator

**Role Enum Value:** `INSTITUTION_ADMIN`

**Responsibilities:**
- Drive data-driven decisions on equipment procurement.
- Oversee organization-wide equipment utilization and ROI.
- Manage cross-department resource sharing.
- Coordinate inter-institution partnerships.
- Generate cost analysis and procurement reports.

**Dashboard Features:**
- Organization-wide equipment utilization intelligence.
- Cross-department resource sharing overview.
- Procurement recommendations and cost analysis.
- Equipment lifecycle and ROI metrics.
- System monitoring and user management (institution-scoped).
- Reports management.

**Complete Login-to-Logout Workflow:**
1. Navigate to `/login` and authenticate.
2. JWT token issued; redirected to `/dashboard` → LabManagerDashboard renders (org-wide view).
3. Review utilization metrics across all departments in the institution.
4. Navigate to `/admin/users` to manage users within the institution.
5. Navigate to `/admin/utilization` to view organization-wide utilization heatmap and analytics.
6. Navigate to `/admin/sharing` to review cross-department and inter-institution sharing agreements.
7. Navigate to `/admin/costs` to review cost allocations, invoices, and budget utilization.
8. Navigate to `/reports` to generate and export utilization, cost, and sharing reports.
9. Navigate to `/admin/invoices` to manage inter-institution billing.
10. Navigate to `/admin/announcements` to manage institution-wide announcements.
11. Click profile icon → update personal details.
12. Click logout.

**Permissions:**
- Full access to institution-scoped user management.
- Organization-wide utilization, cost, and sharing analytics.
- Inter-institution sharing agreement management.
- Invoice and payment management.
- Report generation and export.
- Announcement management (institution-scoped).

**Actions Allowed:**
- View and manage users within their institution.
- View cross-department utilization heatmaps and analytics.
- Approve/reject inter-institution sharing agreements.
- Generate and export cost, utilization, and sharing reports.
- Manage invoices and payment tracking.
- Create announcements for their institution.

**Actions Not Allowed:**
- Cannot manage roles (SYSTEM_ADMIN only).
- Cannot access system monitoring (SYSTEM_ADMIN only).
- Cannot view audit logs (SYSTEM_ADMIN only).
- Cannot manage users or data outside their institution.

---

### R3: Department Head

**Role Enum Value:** `DEPARTMENT_HEAD`

**Responsibilities:**
- Oversee department-level equipment utilization.
- Approve sharing requests for department equipment.
- Monitor department usage patterns and no-show rates.
- Review maintenance schedules for department equipment.
- Make procurement recommendations for the department.

**Dashboard Features:**
- Department equipment utilization heatmap.
- Booking adoption and no-show rates.
- Maintenance schedule overview.
- High-demand equipment alerts.
- Sharing requests and approvals.

**Complete Login-to-Logout Workflow:**
1. Navigate to `/login` and authenticate.
2. JWT token issued; redirected to `/dashboard` → LabManagerDashboard renders (dept-scoped).
3. Review department utilization heatmap showing peak hours and idle periods.
4. Check booking adoption rates and no-show statistics.
5. Navigate to `/bookings/approvals` to review pending booking requests for department equipment.
6. Approve or reject booking requests based on department policies.
7. Navigate to `/admin/utilization` to view detailed department utilization analytics.
8. Navigate to `/admin/sharing` to review and approve inter-institution sharing requests for department equipment.
9. Navigate to `/admin/costs` to review department cost allocations and budget status.
10. Navigate to `/maintenance` to review maintenance schedule for department equipment.
11. Click profile icon → update personal details.
12. Click logout.

**Permissions:**
- Department-scoped utilization analytics.
- Booking approval/rejection for department equipment.
- Sharing request approval for department equipment.
- Department cost tracking and budget visibility.
- Maintenance schedule overview.

**Actions Allowed:**
- View department utilization heatmap and analytics.
- Approve/reject booking requests for department equipment.
- Approve/reject sharing requests for department equipment.
- View department cost allocations and budget utilization.
- View maintenance schedule for department equipment.

**Actions Not Allowed:**
- Cannot view data from other departments.
- Cannot manage user accounts (INSTITUTION_ADMIN or SYSTEM_ADMIN only).
- Cannot configure roles (SYSTEM_ADMIN only).
- Cannot view system monitoring or audit logs.
- Cannot manage invoices or payments directly.

---

### R4: Lab Manager

**Role Enum Value:** `LAB_MANAGER`

**Responsibilities:**
- Manage daily laboratory operations.
- Handle high-demand equipment allocation.
- Monitor idle equipment alerts.
- Oversee maintenance schedules.
- Manage waitlists for popular equipment.
- Approve/reject booking requests.

**Dashboard Features:**
- Department equipment utilization heatmap.
- Booking adoption and no-show rates.
- Maintenance schedule overview.
- High-demand equipment alerts.
- Sharing requests and approvals.

**Complete Login-to-Logout Workflow:**
1. Navigate to `/login` and authenticate.
2. JWT token issued; redirected to `/dashboard` → LabManagerDashboard renders (lab-scoped).
3. Review utilization heatmap for managed laboratories.
4. Check high-demand alerts and idle equipment notifications.
5. Navigate to `/bookings/approvals` to review and process pending booking requests.
6. Approve bookings that meet lab policies; reject those that conflict.
7. Navigate to `/admin/utilization` to view detailed utilization analytics.
8. Navigate to `/maintenance` to review upcoming maintenance tasks and work orders.
9. Navigate to `/admin/sharing` to review sharing requests for lab equipment.
10. Review waitlist status for high-demand equipment.
11. Click profile icon → update personal details.
12. Click logout.

**Permissions:**
- Lab-scoped utilization analytics.
- Booking approval/rejection.
- Waitlist management.
- Maintenance schedule oversight.
- Sharing request approval (lab-level).

**Actions Allowed:**
- View utilization heatmap for managed labs.
- Approve/reject booking requests.
- Manage waitlists for high-demand equipment.
- View and manage maintenance schedules.
- Approve/reject sharing requests for lab equipment.

**Actions Not Allowed:**
- Cannot view data from other labs or departments.
- Cannot manage user accounts.
- Cannot configure roles.
- Cannot view system monitoring or audit logs.
- Cannot manage budgets or invoices.

---

### R5: Lab Technician

**Role Enum Value:** `LAB_TECHNICIAN`

**Responsibilities:**
- Execute maintenance workflows.
- Manage calibration and certification.
- Update equipment service logs.
- Track equipment downtime.
- Upload calibration certificates.

**Dashboard Features:**
- Not specified as a standalone analytical dashboard in the source document.
- Utilizes the Maintenance & Calibration Service.
- Mobile task receiver (implied).

**Complete Login-to-Logout Workflow:**
1. Navigate to `/login` and authenticate.
2. JWT token issued; redirected to `/dashboard` → ResearcherDashboard renders (technician view).
3. Navigate to `/maintenance` to view assigned maintenance tasks and work orders.
4. Review work order details (equipment, issue description, priority, assigned date).
5. Update work order status to IN_PROGRESS when starting work.
6. Perform maintenance or calibration task.
7. Log work performed, parts used, and time spent.
8. Upload calibration certificate (if applicable).
9. Update work order status to COMPLETED.
10. System automatically updates equipment status back to AVAILABLE.
11. Click profile icon → update personal details.
12. Click logout.

**Permissions:**
- Access to assigned maintenance work orders.
- Ability to update work order status.
- Calibration certificate upload.
- Equipment status updates (Under Maintenance → Available).
- Maintenance history logging.

**Actions Allowed:**
- View assigned maintenance tasks.
- Update work order status through lifecycle.
- Upload calibration certificates.
- Update equipment status to "Under Maintenance" or "Out of Service".
- Log maintenance history and downtime.
- Track equipment service history.

**Actions Not Allowed:**
- Cannot approve or create booking requests.
- Cannot manage user accounts or roles.
- Cannot view cost analytics or financial data.
- Cannot manage sharing agreements.
- Cannot view utilization heatmaps or cross-department data.

---

### R6: Researcher / Student

**Role Enum Values:** `RESEARCHER`, `STUDENT`

**Responsibilities:**
- Discover available equipment.
- Schedule access to laboratory resources.
- Manage personal bookings and waitlists.
- View booking history and usage summary.
- Receive equipment recommendations.

**Dashboard Features:**
- My bookings and upcoming reservations.
- Equipment availability overview.
- Booking history and usage summary.
- Waitlist status and notifications.
- Equipment recommendations based on booking history.

**Complete Login-to-Logout Workflow:**
1. Navigate to `/login` and authenticate.
2. JWT token issued; redirected to `/dashboard` → ResearcherDashboard renders.
3. Review upcoming bookings and recent activity on dashboard.
4. Navigate to `/equipment` to browse equipment catalog.
5. Filter by category, department, or status.
6. Click equipment card → view details, specifications, availability.
7. Navigate to `/bookings` → BookingCalendarPage to view real-time availability.
8. Select time slot → submit booking request.
9. If equipment is fully booked → join waitlist.
10. Navigate to `/bookings/my` → MyBookingsPage to view all personal bookings.
11. Receive notification when booking is approved/rejected or waitlist slot opens.
12. Navigate to `/notifications` → NotificationCenter to view notification history.
13. Navigate to `/notifications/preferences` to configure notification channels.
14. Click profile icon → update personal details.
15. Click logout.

**Permissions:**
- Equipment catalog browsing (all visible equipment).
- Booking creation and management (own bookings only).
- Waitlist enrollment.
- Personal booking history and usage summary.
- Notification preferences management.
- Profile management.

**Actions Allowed:**
- Browse and search equipment catalog.
- Create booking requests.
- Cancel own pending/confirmed bookings.
- Join waitlists for high-demand equipment.
- View personal booking history and usage statistics.
- Manage notification preferences.
- Update personal profile.

**Actions Not Allowed:**
- Cannot approve or reject booking requests.
- Cannot manage equipment inventory or status.
- Cannot view other users' bookings (except in shared calendar view).
- Cannot view cost analytics or financial data.
- Cannot manage maintenance or calibration.
- Cannot view cross-department or cross-institution data.

---

## 12. Non-Functional Requirements

| # | Category | Requirement |
|---|----------|-------------|
| NFR-01 | Security | System must enforce strict JWT Authentication and OAuth2 Login via the API Gateway & Security Layer. Role-Based Access Control (RBAC), CORS, and Request Validation must be applied to all endpoints. |
| NFR-02 | Performance & Caching | Redis must be utilized for session caching and real-time state caching to ensure high performance and low latency. |
| NFR-03 | Real-time Communication | Must utilize Apache Kafka or RabbitMQ as the message broker for asynchronous flows and Spring WebSockets for real-time UI updates (e.g., calendar availability). |
| NFR-04 | Search Optimization | Must use Elasticsearch for high-performance indexing and querying of equipment and institutions. |
| NFR-05 | Storage Scalability | AWS S3 or Cloudinary must be used for storing heavy documents (equipment manuals, maintenance reports, calibration certificates). |
| NFR-06 | Deployment & Containerization | The application must be deployable using Docker, Docker Compose, Nginx, and cloud environments (AWS/Azure) integrated with GitHub Actions for CI/CD. |
| NFR-07 | Database | PostgreSQL is the mandatory primary database for the production environment. |
| NFR-08 | Statelessness | Backend services must be stateless to support horizontal scaling. Session state must be externalized to Redis. |
| NFR-09 | Logging | Comprehensive API request logging must be implemented across all modules. |
| NFR-10 | Error Handling | Graceful error handling with standardized error response format across all APIs. |

---

## 13. Business Rules

| # | Rule | Source Module |
|---|------|---------------|
| BR-01 | All users must authenticate via JWT or OAuth2. Unauthenticated access is blocked at the API Gateway. | Authentication |
| BR-02 | An equipment's lifecycle status determines its availability. Statuses are strictly limited to: Available, Booked, Under Maintenance, Out of Service, Retired. | Equipment Inventory |
| BR-03 | A booking must follow a linear progression of statuses: Pending Approval → Confirmed → In Use → Completed, Cancelled, or No Show. | Booking & Scheduling |
| BR-04 | Equipment marked as "exclusive" cannot be double-booked for the same time slot. | Booking & Scheduling |
| BR-05 | Equipment flagged as Under Maintenance or Out of Service cannot accept new bookings. | Maintenance & Booking |
| BR-06 | External booking requests must pass through a sharing agreement and access request approval workflow before being confirmed. | Resource Sharing |
| BR-07 | Department Heads and Lab Managers can only view data relevant to their specific department, whereas Institution/System Admins possess overarching visibility. | RBAC |

---

## 14. User Stories

| # | Module | User Story |
|---|--------|------------|
| US-01 | Authentication | As a user, I want to log in securely using JWT or Google OAuth2 so that my data is protected. |
| US-02 | Equipment Inventory | As a System Administrator, I want to register equipment, upload manuals to AWS S3/Cloudinary, and tag them by category so that users can easily discover them via Elasticsearch. |
| US-03 | Booking & Scheduling | As a Researcher/Student, I want to view a real-time equipment availability calendar and reserve time slots so that I can secure access to necessary lab resources. |
| US-04 | Booking & Scheduling | As a Researcher/Student, I want to be added to a waitlist for high-demand equipment and receive alerts when slots open. |
| US-05 | Utilization Monitoring | As a Lab Manager, I want to view department utilization heatmaps and receive alerts for idle equipment so that I can optimize resource allocation. |
| US-06 | Resource Sharing | As an Institution Administrator, I want to approve sharing agreements and external access requests so that we can facilitate cross-institution equipment usage. |
| US-07 | Maintenance | As a Lab Technician, I want to manage my assigned maintenance work orders and track calibration renewals so that equipment downtime is minimized. |
| US-08 | Analytics | As an Institution Administrator, I want to view procurement recommendations, ROI metrics, and cost analysis on my dashboard to make data-driven purchasing decisions. |

---

## 15. Acceptance Criteria

The system's overarching acceptance criteria are tied directly to the defined project milestones:

### Milestone 1: Core Setup
- [ ] System successfully authenticates users via JWT/OAuth2.
- [ ] RBAC is enforced — users can only access role-appropriate features.
- [ ] Equipment inventory registration is functional.
- [ ] Basic booking workflow (create, approve, confirm) is operational.

### Milestone 2: Monitoring & Sharing
- [ ] System accurately tracks real-time utilization.
- [ ] Utilization data visualized via heatmaps.
- [ ] Inter-institution resource sharing workflows are successfully routed and processed.
- [ ] Waitlist functionality operates correctly with auto-promotion.

### Milestone 3: Maintenance & Analytics
- [ ] Maintenance scheduling alerts are triggered correctly.
- [ ] Cost tracking for billing is calculated accurately.
- [ ] Role-specific analytics dashboards render correctly with appropriate data scoping.

### Milestone 4: Deployment
- [ ] Frontend and backend are successfully deployed in a production environment using Docker.
- [ ] End-to-end workflows function without critical failures.
- [ ] Final project documentation and presentation are delivered.

---

## 16. System Workflow

The overarching system workflow operates as follows:

1. Users access the React.js client layer (Web or Mobile).
2. Requests pass through the API Gateway & Security Layer (Spring Cloud Gateway) which handles rate limiting, CORS, and request validation.
3. The Gateway routes the authenticated request to the appropriate Spring Boot Modular Monolith Backend Service.
4. The backend service interacts with PostgreSQL (primary data), Redis (caching), or Elasticsearch (search indexing) to process the request.
5. Asynchronous events (like notifications or utilization updates) are published to the Apache Kafka / RabbitMQ message broker.
6. External services (Twilio, Firebase, JavaMailSender) dispatch resulting alerts to the user.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────────────────────┐     │
│  │  React.js    │  │  Mobile (React Native)        │     │
│  │  Web App     │  │  App                           │     │
│  └──────┬───────┘  └──────────────┬───────────────┘     │
│         │                         │                      │
│         └────────────┬────────────┘                      │
│                      ▼                                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │  API Gateway & Security Layer                    │    │
│  │  (Spring Cloud Gateway)                          │    │
│  │  - JWT/OAuth2 Authentication                     │    │
│  │  - Rate Limiting                                 │    │
│  │  - CORS                                          │    │
│  │  - Request Validation                            │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Spring Boot Modular Monolith Backend            │    │
│  │  ┌─────┐ ┌────────┐ ┌───────┐ ┌──────────┐    │    │
│  │  │Auth │ │Equipment│ │Booking│ │Utilization│    │    │
│  │  └─────┘ └────────┘ └───────┘ └──────────┘    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │    │
│  │  │Maintenance│ │Sharing  │ │Notifications │   │    │
│  │  └──────────┘ └──────────┘ └──────────────┘   │    │
│  │  ┌──────────┐ ┌──────────┐                     │    │
│  │  │Analytics │ │Cost/Bill │                     │    │
│  │  └──────────┘ └──────────┘                     │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         ▼                                │
│  ┌──────────┐  ┌───────┐  ┌────────────┐               │
│  │PostgreSQL│  │ Redis │  │Elasticsearch│               │
│  │(Primary) │  │(Cache)│  │  (Search)   │               │
│  └──────────┘  └───────┘  └────────────┘               │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  Message Broker (Kafka / RabbitMQ)           │        │
│  └──────────────────────┬──────────────────────┘        │
│                         ▼                                │
│  ┌──────────┐  ┌────────┐  ┌─────────┐                 │
│  │ Twilio   │  │Firebase│  │JavaMail │                 │
│  │ (SMS)    │  │(Push)  │  │(Email)  │                 │
│  └──────────┘  └────────┘  └─────────┘                 │
└─────────────────────────────────────────────────────────┘
```

---

## 17. Role-wise Workflow

### Researcher/Student Workflow
```
Login → Access Researcher Portal → Search equipment (Elasticsearch)
→ View Equipment Availability Calendar → Submit booking
→ Wait for approval (if required) → Receive confirmation via Notification Center
→ Utilize equipment → Review Booking history
```

### Lab Manager/Department Head Workflow
```
Login → Access Lab Admin Dashboard → Review Department equipment utilization heatmap
→ Approve/Reject pending bookings → Manage waitlists
→ Review Maintenance schedules → Approve inter-institution sharing requests
```

### Lab Technician Workflow
```
Login → Access Mobile/Web App → View Maintenance Task Logs
→ Perform maintenance → Log downtime and upload calibration certificates to Cloud Storage
→ Mark equipment as 'Available'
```

### Institution Administrator Workflow
```
Login → Access Institution Admin Console
→ View Organization-wide Utilization Intelligence
→ Review cross-department resource sharing overview
→ Generate cost analysis and ROI metric reports
→ Export to PDF/Excel
```

---

## 18. Module-wise Workflow

Not explicitly specified in the source document as a unified module flow diagram, but derived from system architecture:

1. Data originates in the **Equipment Inventory Module**, which populates the **Booking & Scheduling Module**.
2. When equipment is in use, **IoT Sensor APIs** feed data to the **Utilization Monitoring Module**.
3. Utilization data, combined with cost rates, drives the **Cost & Billing Management Module**.
4. Concurrently, usage time dictates triggers in the **Maintenance & Calibration Module**.
5. All these modules feed data into PostgreSQL, which the **Analytics & Reporting Service** queries to populate the dashboards.
6. The **Notification & Alert Module** subscribes to events from all modules and dispatches multi-channel alerts.

```
Equipment Inventory ──→ Booking & Scheduling
        │                      │
        ▼                      ▼
  IoT Sensors ──→ Utilization Monitoring
        │                      │
        ▼                      ▼
  Maintenance &        Cost & Billing
  Calibration              │
        │                  ▼
        └──────→ Analytics & Reporting ──→ Dashboards
                         │
                         ▼
                  Notification Service ──→ Email/SMS/Push
```

---

## 19. Screen Flow

Not specified in the source document.

---

## 20. Screen Inventory

### Web Application (React.js)

| Screen | Target Role(s) | Description |
|--------|----------------|-------------|
| Login Screen | All Users | Email/password + Google OAuth login |
| Register Screen | Unauthenticated | New user registration |
| Forgot Password Screen | Unauthenticated | Password reset request |
| Reset Password Screen | Unauthenticated (via link) | Password reset form |
| OAuth2 Callback | Unauthenticated | Google OAuth redirect handler |
| Researcher Dashboard | Researcher, Student | Personal bookings, availability, recommendations |
| Lab Manager Dashboard | Lab Manager, Dept Head, Inst Admin | Department utilization, alerts, approvals |
| Admin Dashboard | System Admin, Institution Admin | Platform-wide analytics, system health |
| Equipment Catalog | All Authenticated | Browsable/filterable equipment list |
| Equipment Detail | All Authenticated | Equipment specs, availability, documents |
| Equipment Form | Admin, Manager | Add/edit equipment |
| Booking Calendar | All Authenticated | FullCalendar availability view |
| My Bookings | Researcher, Student | Personal booking list |
| Pending Approvals | Lab Manager, Dept Head | Booking approval queue |
| Maintenance Dashboard | Lab Technician, Manager | Work orders and tasks |
| User Management | System Admin, Institution Admin | User CRUD |
| Role Management | System Admin | Role configuration |
| Audit Log Viewer | System Admin | System activity logs |
| System Monitoring | System Admin | JVM, DB, API health |
| Institution Management | System Admin, Institution Admin | Institution CRUD |
| Laboratory Management | System Admin, Institution Admin | Lab CRUD |
| Announcement Management | System Admin, Institution Admin | Announcement CRUD |
| Invoice Management | System Admin, Institution Admin | Invoice CRUD |
| Payment Tracking | System Admin, Institution Admin | Payment status tracking |
| Cost Dashboard | Admin, Manager, Dept Head | Cost analytics |
| Resource Sharing Dashboard | Admin, Manager, Dept Head | Sharing agreements, analytics |
| Utilization Monitor | Admin, Manager, Dept Head | Utilization heatmap |
| Analytics Dashboard | All Authenticated (role-scoped) | Charts and visualizations |
| Reports Page | Admin, Manager | Report generation and export |
| Profile Page | All Authenticated | Personal profile management |
| Notification Center | All Authenticated | Notification inbox |
| Notification Preferences | All Authenticated | Channel preferences |

### Mobile Application (React Native/etc.)

| Screen | Target Role(s) | Description |
|--------|----------------|-------------|
| My Bookings & Reservations | Researcher, Student | View/manage bookings |
| Equipment Availability Status | All Users | Quick availability check |
| Waitlist & Alert Receiver | Researcher, Student | Waitlist status and push alerts |
| Maintenance Task Logs | Lab Technician | View/complete assigned tasks |

---

## 21. Navigation Flow

Not explicitly specified in the source document.

---

## 22. UI Requirements

The user interface must be developed using React.js for the web application and React Native (or similar) for mobile application components.

| Technology | Purpose |
|-----------|---------|
| React.js | Web application client framework |
| React Native | Mobile application framework |
| Tailwind CSS | Utility-first CSS styling |
| React Router | Client-side routing |
| Context API | State management |
| Chart.js / Recharts / D3.js | Data visualization (heatmaps, ROI metrics, charts) |
| FullCalendar.js | Equipment availability calendar |
| Axios | HTTP client for API communication |

---

## 23. Database Entities

The primary data storage layer utilizes PostgreSQL in production. The logical database entities map to the core tables defined in the architecture:

| Entity Group | Tables |
|-------------|--------|
| User & Auth Tables | users, refresh_tokens, password_reset_tokens, roles, permissions |
| Equipment & Inventory Tables | equipment, equipment_categories, equipment_documents, calibration_records |
| Booking & Scheduling Tables | bookings, waitlist_entries, booking_audit_trail |
| Utilization & Monitoring Tables | utilization_records, usage_logs, alert_history |
| Maintenance Tables | maintenance_work_orders, maintenance_history, equipment_service_logs |
| Notification Tables | notifications, notification_preferences, notification_channels |
| Analytics Tables | aggregated_utilization, roi_calculations, procurement_recommendations |
| Cost & Billing Tables | invoices, payments, budget_allocations |
| Resource Sharing Tables | institution_partnerships, shared_equipment, external_booking_requests, cost_sharing_records |

---

## 24. API Requirements

The backend must expose RESTful APIs managed by the Spring Cloud API Gateway.

### Required API Domain Services

| Service | Responsibility |
|---------|---------------|
| Authentication Service | Login, OAuth2 callback, Password Reset, Profile Update |
| User & Institution Management Service | User CRUD, Institution CRUD, Role Management |
| Equipment Inventory Service | Equipment CRUD, Document Upload, Status Management |
| Booking & Scheduling Service | Booking CRUD, Waitlist, Approval Workflows, Calendar |
| Utilization Monitoring Service | Usage Tracking, Heatmap Data, IoT Sensor Integration |
| Maintenance & Calibration Service | Work Order CRUD, Calibration Records, Downtime Tracking |
| Resource Sharing Service | Sharing Agreements, External Bookings, Cost Calculation |
| Notification Service | Multi-channel Notification Dispatch, Preference Management |
| Analytics & Reporting Service | Dashboard Data Aggregation, Report Generation, Export |

### External API Integrations

| External Service | Purpose |
|-----------------|---------|
| IoT Sensor APIs | Real-time equipment usage telemetry |
| Google OAuth2 | Single Sign-On authentication |
| JavaMailSender | Email notification delivery |
| Twilio SMS Gateway | SMS notification delivery |
| Firebase FCM | Push notification delivery |
| AWS S3 / Cloudinary | Document and file storage |

---

## 25. System Architecture Explanation

The Lab Resource Utilization Platform relies on a highly scalable, distributed architecture:

### Layer 1: Client Layer (Top)
Comprises a React.js Web Application and a Mobile Application serving distinct portals for researchers, lab admins, institution admins, and technicians.

### Layer 2: API Gateway & Security Layer
Built on Spring Cloud Gateway, this layer intercepts all client requests, enforcing JWT/OAuth2 authentication, Role-Based Access, rate limiting, and CORS validation.

### Layer 3: Backend Services
Operates as a Spring Boot Modular Monolith. Services (Auth, Inventory, Booking, Utilization, Maintenance, Sharing, Notifications, Analytics) operate as isolated modules within the monolith to ensure separation of concerns.

### Layer 4: Message Broker & Real-Time Communication
Apache Kafka or RabbitMQ handles asynchronous flow and event-driven architecture, enabling real-time utilization updates and notification triggers. Spring WebSocket is used for real-time frontend updates.

### Layer 5: Data Storage Layer
- **PostgreSQL:** Primary relational database.
- **Redis:** Session and real-time state caching for performance.
- **Elasticsearch:** High-performance search indexing for equipment and institution discovery.
- **AWS S3 / Cloudinary:** Cloud storage for heavy files (equipment manuals, calibration certificates).

### Layer 6: External Services
Integrates with Google OAuth for SSO, JavaMailSender for emails, Twilio for SMS, Firebase FCM for push notifications, and IoT Sensor APIs for real-time equipment telemetry.

---

## 26. Equipment Lifecycle

The equipment lifecycle dictates the operational availability of a resource within the system. State transitions occur manually (by admins/technicians) or automatically (via the Maintenance Module).

### Equipment Statuses

| Status | Description | Booking Allowed |
|--------|-------------|-----------------|
| **Available** | Equipment is active, functional, and ready for booking | Yes |
| **Reserved** | Equipment has an upcoming reservation | No (temporarily locked) |
| **In Use** | Equipment is currently being used per a confirmed booking | No |
| **Under Maintenance** | Equipment is currently undergoing scheduled preventive maintenance or repairs | No |
| **Calibration Due** | Equipment requires calibration before next use | No |
| **Out of Service** | Equipment is non-operational due to unexpected failure or missing calibration | No |
| **Retired** | Equipment has reached the end of its lifecycle and is permanently removed from active booking | No |

### State Transition Diagram

```
                    ┌──────────────┐
                    │   Retired    │
                    └──────▲───────┘
                           │
┌──────────┐    ┌──────────┴──────────┐    ┌──────────────┐
│Available │───▶│   Under Maintenance  │───▶│  Available   │
└────┬─────┘    └─────────────────────┘    └──────────────┘
     │
     │  Book/Reserve
     ▼
┌──────────┐    ┌──────────┐    ┌──────────────┐
│ Reserved │───▶│  In Use  │───▶│  Available   │
└──────────┘    └──────────┘    └──────────────┘
     │                │
     │                │ Failure/Calibration
     │                ▼
     │         ┌──────────────┐    ┌──────────────┐
     │         │Out of Service│───▶│   Retired     │
     │         └──────────────┘    └──────────────┘
     │
     │  Calibration Needed
     ▼
┌───────────────┐
│Calibration Due│───▶ (Calibration Complete) ───▶ Available
└───────────────┘
```

### Transition Rules
1. **Available → Reserved:** When a booking is confirmed for a future time slot.
2. **Reserved → In Use:** When the booking start time arrives and the user checks in.
3. **In Use → Available:** When the booking ends and equipment is returned.
4. **Available → Under Maintenance:** When a maintenance work order begins.
5. **Under Maintenance → Available:** When maintenance is completed and verified.
6. **Available → Calibration Due:** When calibration due date is reached.
7. **Calibration Due → Available:** When calibration is completed successfully.
8. **Any Status → Out of Service:** When equipment fails or fails calibration.
9. **Out of Service → Under Maintenance:** When repair work order is created.
10. **Any Status → Retired:** When equipment is decommissioned (admin action).

---

## 27. Booking Lifecycle

A reservation request passes through a defined lifecycle governed by the Booking & Scheduling Service.

### Booking Statuses

| Status | Description |
|--------|-------------|
| **Pending Approval** | A booking request has been submitted but requires Lab Manager/Department Head approval |
| **Confirmed** | The booking is approved and the time slot is locked |
| **In Use** | The current time matches the booking slot (verified via IoT utilization tracking) |
| **Completed** | The scheduled time has elapsed, and the equipment is returned to "Available" status |
| **Cancelled** | The booking was voided by the user or administrator prior to start time |
| **No Show** | The booking slot passed without the user claiming the equipment |

### State Transition Diagram

```
┌─────────────────┐
│ Pending Approval │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────────┐  ┌───────────┐
│Confirmed │  │ Cancelled │
└────┬─────┘  └───────────┘
     │
     ▼
┌──────────┐
│  In Use  │
└────┬─────┘
     │
  ┌──┴───┐
  │      │
  ▼      ▼
┌──────────┐  ┌───────────┐
│Completed │  │  No Show  │
└──────────┘  └───────────┘
```

### Transition Rules
1. **Pending Approval → Confirmed:** When Lab Manager/Dept Head approves the request.
2. **Pending Approval → Cancelled:** When user or admin cancels before approval.
3. **Confirmed → In Use:** When booking start time arrives and user checks in.
4. **Confirmed → Cancelled:** When user cancels before start time.
5. **Confirmed → No Show:** When booking start time passes without check-in.
6. **In Use → Completed:** When booking end time arrives and equipment is returned.
7. **Completed → (equipment returns to Available).**

---

## 28. Maintenance Workflow

Governed by the Maintenance & Calibration Service, this workflow ensures continuous equipment compliance and minimizes downtime.

### Workflow Steps

1. **Trigger:** Preventive maintenance schedule approaches or a calibration certification nears expiration.
2. **Alerting:** Maintenance due/calibration expiry alerts are triggered to Lab Managers and Technicians.
3. **Work Order:** A maintenance request is generated, and a technician is assigned.
4. **Execution:** Technician performs maintenance; equipment downtime is tracked.
5. **Completion:** Technician updates maintenance history, uploads new calibration certificates (to AWS S3/Cloudinary), and closes the service log.
6. **Status Return:** Equipment status returns to "Available".

### Work Order Lifecycle

| Status | Description |
|--------|-------------|
| PENDING | Work order created, awaiting assignment |
| ASSIGNED | Technician has been assigned |
| IN_PROGRESS | Technician is actively working |
| ON_HOLD | Work paused (waiting for parts, approval, etc.) |
| COMPLETED | Work finished, pending verification |
| VERIFIED | Work verified by Lab Manager |
| CLOSED | Work order fully closed |
| CANCELLED | Work order cancelled |

---

## 29. Resource Sharing Workflow

Facilitates cross-institution equipment usage and billing.

### Workflow Steps

1. **Discovery:** External users search for available equipment via Elasticsearch cross-institution listing.
2. **Request:** External user submits an access and booking request.
3. **Approval:** Department Head / Institution Admin reviews the sharing agreement and approves the access request.
4. **Coordination:** System executes shared equipment scheduling coordination.
5. **Post-Usage:** Upon completion, the system calculates usage fees and cost-sharing metrics, followed by inter-institution billing generation.

---

## 30. Notification Workflow

The Notification Service executes a multi-channel delivery approach to keep users informed.

### Triggers

| Event | Notification Type |
|-------|------------------|
| Booking confirmed | Booking Confirmation |
| Booking approval required | Booking Request |
| Booking cancelled | Booking Cancellation |
| Waitlist slot available | Waitlist Alert |
| Maintenance due | Maintenance Reminder |
| Calibration expiry approaching | Calibration Alert |
| Idle equipment detected | Idle Equipment Alert |
| Sharing request received | Sharing Request |
| Sharing request approved/rejected | Sharing Update |

### Delivery Channels

| Channel | Technology | Use Case |
|---------|-----------|----------|
| Email | JavaMailSender | Formal notifications, reports, password reset |
| SMS | Twilio SMS Gateway | Urgent alerts, time-sensitive notifications |
| Push | Firebase FCM | Mobile app real-time alerts |
| In-App | WebSocket (STOMP) | Real-time inbox notifications |

### Architecture Flow

```
Event Trigger → Message Broker (Kafka/RabbitMQ)
    → Notification Service
        → Email Dispatcher (JavaMailSender)
        → SMS Dispatcher (Twilio)
        → Push Dispatcher (Firebase FCM)
        → In-App Dispatcher (WebSocket)
```

---

## 31. Analytics Workflow

Data is continuously ingested via IoT Sensor APIs and relational database logs. The Analytics & Reporting Service aggregates this into role-specific dashboards:

### Role-Specific Analytics

| Role | Analytics Focus |
|------|----------------|
| **Researcher/Student** | User-specific booking history, equipment recommendations based on usage patterns |
| **Lab Manager/Dept Head** | Department utilization heatmaps (current vs. historical benchmarks), booking adoption/no-show rates, high-demand alerts |
| **Institution Admin** | Multi-department cost allocations, equipment lifecycle tracking, ROI metrics, procurement recommendations, organization-wide intelligence |

### Data Flow

```
IoT Sensors + Booking DB + Maintenance DB
    → Analytics & Reporting Service
        → Aggregation Engine
            → Researcher: Personal stats + recommendations
            → Lab Manager: Department heatmap + adoption rates
            → Institution Admin: Cross-dept ROI + procurement
```

---

## 32. Reports & Export Workflow

Authorized users (Admins, Managers) generate static data snapshots.

### Workflow Steps

1. User selects report type: Equipment utilization, department resource usage, maintenance/downtime, inter-institution sharing, or procurement/cost analysis.
2. Analytics & Reporting Service generates the dataset.
3. User selects output format: PDF or Excel export.
4. File is generated and downloaded.

### Supported Report Types

| Report Type | Data Source |
|------------|------------|
| Equipment Utilization | Booking hours, IoT usage data |
| Department Resource Usage | Department-scoped booking aggregation |
| Maintenance & Downtime | Work order history, downtime logs |
| Inter-Institution Sharing | External booking records, partnership data |
| Procurement & Cost Analysis | Equipment costs, budget allocations, ROI calculations |

---

## 33. Security Requirements

Security is enforced at the API Gateway & Security Layer (Spring Cloud Gateway).

| # | Requirement | Implementation |
|---|-------------|---------------|
| SEC-01 | JWT Authentication | Stateless token-based session management with access + refresh tokens |
| SEC-02 | OAuth2 Login | Google OAuth2 integration for Single Sign-On |
| SEC-03 | Role-Based Access Control (RBAC) | 6 roles with `@PreAuthorize` annotations on backend endpoints |
| SEC-04 | Rate Limiting | API Gateway rate limiting (Not yet implemented) |
| SEC-05 | CORS Configuration | Configured for frontend origin (localhost:3000) |
| SEC-06 | Request Validation | `@Valid` annotations on all request DTOs |
| SEC-07 | Comprehensive API Logging | Audit trail via `@Auditable` AOP annotation |
| SEC-08 | Password Security | BCrypt password hashing |
| SEC-09 | Session Management | Stateless (JWT); no server-side sessions |
| SEC-10 | Token Expiration | Access tokens and refresh tokens have configurable expiration |
| SEC-11 | Refresh Token Revocation | Logout revokes refresh tokens in database |

---

## 34. Deployment Requirements

| # | Requirement | Technology |
|---|-------------|-----------|
| DEP-01 | Infrastructure | Cloud environments (AWS / Azure) |
| DEP-02 | Containerization | Docker |
| DEP-03 | Orchestration | Docker Compose (local), Kubernetes (production) |
| DEP-04 | Web Server / Reverse Proxy | Nginx |
| DEP-05 | CI/CD | GitHub Actions |
| DEP-06 | Database | PostgreSQL |
| DEP-07 | Cache | Redis |
| DEP-08 | Search Engine | Elasticsearch |

---

## 35. Testing Requirements

To guarantee system stability and workflow validation prior to Milestone 4 deployment:

| # | Category | Tool |
|---|----------|------|
| TST-01 | Backend Unit Testing | JUnit 5 |
| TST-02 | Backend Mocking | Mockito |
| TST-03 | Backend Integration Testing | Spring Boot Test + @WebMvcTest |
| TST-04 | Frontend Unit Testing | React Testing Library |
| TST-05 | API Testing | Postman |
| TST-06 | Validation Goals | Platform performance, UI responsiveness, complete end-to-end laboratory workflows |

---

## 36. Risks & Assumptions

Not explicitly specified in the source document.

**Note:** As per instructions, no external assumptions have been fabricated here.

---

## 37. Success Metrics

Based on the explicit Evaluation Criteria and Milestones, success is measured by:

| Milestone | Success Criteria |
|-----------|-----------------|
| **Milestone 1: Core Setup** | Successful deployment of architecture, JWT/OAuth2 RBAC, and a functional equipment inventory/booking system. |
| **Milestone 2: Monitoring & Sharing** | Accurate rendering of real-time utilization heatmaps and successful execution of inter-institution resource sharing and waitlist workflows. |
| **Milestone 3: Maintenance & Analytics** | Functional maintenance workflows, accurate inter-institution billing generation, and successful deployment of role-based analytics dashboards. |
| **Milestone 4: Deployment** | Full production deployment (frontend and backend), successful completion of end-to-end testing, and delivery of final project documentation/presentation. |

---

## 38. Glossary

| Term | Definition |
|------|-----------|
| **API Gateway** | The single entry point for all client requests (Spring Cloud Gateway) |
| **FCM** | Firebase Cloud Messaging, used for Push Notifications |
| **IoT** | Internet of Things; sensors used to capture real-time equipment usage data |
| **JWT** | JSON Web Token, used for secure, stateless user authentication |
| **OAuth2** | An authorization framework utilized for third-party SSO (Google) |
| **RBAC** | Role-Based Access Control, ensuring users only see data and actions relevant to their role |
| **ROI** | Return on Investment, a metric tracked by Institution Admins to evaluate procurement |

---

## 39. Appendix

### Approved Technology Stack Reference

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, React Router, Tailwind CSS, Chart.js, Recharts, D3.js, FullCalendar.js, Axios, Context API |
| **Backend** | Java, Spring Boot, Spring Security, Spring Data JPA, Hibernate, Maven, Spring WebSocket |
| **Data & Storage** | PostgreSQL (Primary), Redis (Cache), Elasticsearch (Search), AWS S3 / Cloudinary (Document Storage) |
| **Messaging** | Apache Kafka / RabbitMQ |
| **Mobile** | React Native (or similar) |
| **DevOps** | Docker, Docker Compose, Nginx, GitHub Actions, AWS/Azure |
| **External Integrations** | Google OAuth, JavaMailSender, Twilio SMS, Firebase FCM, IoT Sensor APIs |

---

*End of Document*
