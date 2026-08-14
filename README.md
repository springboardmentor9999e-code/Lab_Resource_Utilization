# Lab Resource Utilization Platform

A full-stack web application for managing laboratory resources, equipment bookings, maintenance workflows, user roles, billing, notifications, and utilization analytics for educational and research institutions.

The platform helps institutions manage laboratory equipment, schedule shared resources, monitor equipment utilization, handle maintenance and calibration workflows, manage booking and approval processes, and generate data-driven resource utilization insights through a centralized dashboard.

---

## Features

### Authentication & Authorization

- JWT-based Authentication
- Google OAuth2 Login
- Role-Based Access Control (RBAC)
- Secure Login & Registration
- BCrypt Password Encryption
- Protected REST APIs
- Method-Level Authorization
- User Profile Management

### User & Institution Management

- Student Management
- Researcher Management
- Lab Technician Management
- Lab Manager Management
- Department Head Management
- Institution Administrator Management
- System Administrator Management
- Department Management
- Institution Management
- Role-Based Permissions

### Equipment Management

- Add Equipment
- Update Equipment
- Delete Equipment
- Equipment Categories
- Equipment Availability Tracking
- Equipment Status Management
- Equipment Details
- Hourly Equipment Rental Rate
- Equipment Utilization Tracking
- Maintenance & Calibration Information

### Booking Management

- Equipment Booking
- Booking Approval
- Booking Rejection
- Booking Cancellation
- Mark Equipment In Use
- Complete Booking
- No-Show Management
- Booking History
- Booking Status Tracking
- Booking Cost Estimation
- Equipment Availability Checking

### Maintenance & Calibration

- Maintenance Request Management
- Work Order Management
- Preventive Maintenance
- Corrective Maintenance
- Emergency Maintenance
- Calibration Tracking
- Calibration Due Notifications
- Calibration Overdue Notifications
- Maintenance Due Notifications
- Maintenance Overdue Notifications
- Technician Assignment
- Equipment Downtime Tracking
- Maintenance History

### Billing & Cost Allocation

- Booking-Based Billing
- Equipment Hourly Rate Calculation
- Invoice Generation
- Billing Status Management
- Payment Status Tracking
- Cost Allocation
- Department-wise Cost Allocation
- Bill Splitting
- Allocation Approval
- Allocation Payment
- Cost Recovery Workflow

### Notifications

- Real-Time Notifications
- Booking Notifications
- Maintenance Notifications
- Calibration Notifications
- Notification Bell
- Unread Notification Count
- Notification Dropdown
- Notification History
- Mark Notification as Read
- Delete Notification
- Real-Time Toast Notifications
- Email Notifications

### Analytics & Dashboard

- Equipment Utilization Dashboard
- Department Statistics
- Institution Statistics
- Booking Analytics
- Booking Density
- Monthly Heatmaps
- Utilization Analytics
- Equipment Usage Analysis
- Demand Analysis
- Cost Analysis
- Maintenance Analytics
- Weekly Utilization Reports
- Live Equipment Status

### Reports & Audit

- Audit Logs
- Equipment Utilization Reports
- Booking Reports
- Maintenance Reports
- Cost Reports
- Department Resource Usage Reports
- Analytics Reports
- CSV / Export Support

---

# Development Milestones

The project was developed incrementally over an 8-week implementation plan. Each milestone focused on completing a major group of platform capabilities before moving to the next stage.

## Week 1 — Project Initialization & Architecture

### Completed

- Defined project objectives and laboratory resource workflows.
- Designed the overall system architecture.
- Designed PostgreSQL database structure.
- Created Spring Boot backend structure.
- Initialized React + Vite frontend.
- Configured frontend-backend communication.
- Established Git/GitHub project structure.
- Created initial entities, repositories, services and controllers.
- Designed role-based application structure.

### Milestone Result

Core project architecture and development environment successfully established.

---

## Week 2 — Authentication, RBAC & Core Equipment

### Completed

- Implemented JWT authentication.
- Implemented BCrypt password encryption.
- Implemented Spring Security.
- Implemented role-based authorization.
- Added multiple user roles.
- Implemented login and registration.
- Integrated Google OAuth login.
- Developed equipment inventory management.
- Implemented equipment categories.
- Implemented equipment availability/status tracking.
- Started core booking workflow.

### Milestone Result

Authentication, authorization, equipment inventory and basic booking functionality became operational.

---

## Week 3 — Booking & Resource Utilization

### Completed

- Implemented complete equipment booking workflow.
- Added booking creation.
- Added booking approval/rejection.
- Added booking status management.
- Implemented equipment availability checking.
- Added booking history.
- Implemented booking-related role permissions.
- Added equipment utilization tracking.
- Started dashboard analytics.

### Milestone Result

The core resource reservation and utilization workflow became functional.

---

## Week 4 — Analytics, Heatmaps & Resource Sharing

### Completed

- Implemented utilization analytics.
- Added booking density analysis.
- Added department-level statistics.
- Implemented utilization heatmaps.
- Added monthly booking heatmap.
- Implemented demand analysis where backend support was available.
- Added equipment utilization insights.
- Improved dashboard visualizations.
- Implemented resource-sharing related workflows where supported.

### Milestone Result

The platform started providing meaningful utilization and resource-allocation insights.

---

## Week 5 — Maintenance & Calibration

### Completed

- Implemented maintenance management.
- Added maintenance requests.
- Added work order management.
- Added maintenance status tracking.
- Added preventive/corrective/emergency maintenance types.
- Added technician assignment.
- Added maintenance scheduling.
- Added equipment downtime tracking.
- Implemented calibration tracking.
- Added calibration due/overdue logic.

### Milestone Result

Equipment lifecycle, maintenance and calibration management became integrated into the platform.

---

## Week 6 — Billing, Cost Allocation & Notifications

### Completed

- Implemented equipment hourly-rate management.
- Added booking cost estimation.
- Implemented billing module.
- Implemented cost allocation.
- Added bill splitting and allocation workflows.
- Added payment/cancellation status handling.
- Implemented notification database storage.
- Implemented Kafka-based notification event processing.
- Added Spring WebSocket + STOMP communication.
- Added real-time booking notifications.
- Added maintenance notifications.
- Added calibration notifications.
- Integrated email notification support.

### Milestone Result

The platform achieved an end-to-end workflow connecting booking, cost calculation, billing, maintenance and real-time notifications.

---

## Week 7 — Integration & Testing

### Completed

- Integrated frontend and backend modules.
- Tested authentication and role-based access.
- Tested equipment management.
- Tested booking workflows.
- Tested maintenance workflows.
- Tested billing and cost allocation.
- Tested analytics APIs.
- Tested notification APIs.
- Tested Kafka notification processing.
- Tested WebSocket real-time notifications.
- Tested PostgreSQL database operations.
- Fixed API authorization issues.
- Fixed frontend/backend integration issues.
- Improved error handling and loading states.

### Milestone Result

Major platform modules were integrated and tested together as a single application.

---

## Week 8 — Final Testing, Optimization & Documentation

### Completed

- Performed end-to-end workflow testing.
- Verified role-wise access permissions.
- Fixed duplicate API calls and duplicate notification handling.
- Improved frontend UI responsiveness.
- Fixed analytics and heatmap issues.
- Verified real-time notification flow.
- Verified Kafka and Docker infrastructure.
- Performed application stability testing.
- Improved project documentation.
- Prepared README and project documentation.
- Prepared final project demonstration.

### Milestone Result

The Lab Resource Utilization Platform reached an integrated, tested and demonstration-ready stage.

---

# Complete System Workflow

```text
User Login
    │
    ▼
JWT / Google OAuth Authentication
    │
    ▼
Role-Based Dashboard
    │
    ├── Equipment Management
    │
    ├── Equipment Booking
    │        │
    │        ▼
    │   Approval Workflow
    │        │
    │        ▼
    │   Equipment Usage
    │
    ├── Maintenance
    │        │
    │        ▼
    │   Calibration
    │
    ├── Billing
    │        │
    │        ▼
    │   Cost Allocation
    │
    └── Analytics
             │
             ▼
       Utilization Insights
