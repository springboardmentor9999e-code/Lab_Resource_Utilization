# Lab Resource Utilization Platform

## 1. Project Overview
The Lab Resource Utilization Platform is a comprehensive web application designed to optimize the allocation, booking, maintenance, and sharing of laboratory equipment across departments and institutions. The platform solves the problem of underutilized laboratory equipment, coordination overheads, and unscheduled maintenance by introducing automated booking approvals, real-time availability tracking, role-based dashboards, and a secure inter-institute resource-sharing mechanism.

## 2. Objectives
* Introduce a centralized dashboard for real-time tracking of laboratory equipment availability.
* Enable automated booking workflows for Students and Researchers with built-in time conflict prevention.
* Standardize equipment maintenance, certificate renewals, and calibration schedules.
* Facilitate secure, cost-effective inter-institute resource sharing between approved academic partners.
* Expose interactive utilization analytics and booking heat maps to assist department heads in capacity planning.
* Implement robust role-based access control (RBAC) and secure authentication mechanisms.

## 3. Technologies Used
* **Frontend**: React.js, React Router, Axios, Bootstrap 5, React Icons, Vanilla CSS
* **Backend**: Spring Boot, Spring Security, Hibernate ORM, Java Mail Sender
* **Database**: PostgreSQL (Relational Database)
* **Authentication**: JSON Web Tokens (JWT) for session management, Google Identity Services (GIS) OAuth 2.0
* **Notifications**: Multi-channel system supporting In-App alerts, SMTP Email, and SMS (Gateway-simulated)
* **Version Control**: Git / GitHub

## 4. Development Progress

### Milestone 1
* Set up the initial repository structure and version control pipelines.
* Modeled the database schema for Core Entities including Institutions, Departments, Users, and Roles.
* Configured the Spring Boot backend skeleton with standard dependencies (Spring Data JPA, PostgreSQL Driver).
* Established the React frontend shell with layout components and base page routing.
* Seeded the initial database with institutions, department roles, and test users.

### Milestone 2
* Implemented the security filter chain using Spring Security and stateless JWT token authorization.
* Developed User Registration and normal credentials-based Login endpoints.
* Built the user registration approval workflow, allowing Institution Admins to approve/reject authority accounts.
* Created the Equipment Inventory endpoints for adding, updating, searching, and deleting equipment.
* Developed the interactive booking system with validation checks to prevent overlapping reservations.

### Milestone 3
* Designed custom, role-based dashboards for all 7 user roles (Student, Researcher, Lab Technician, Lab Manager, Department Head, Institution Admin, System Admin).
* Built the Maintenance and Calibration modules to track equipment status changes, assign technicians to issues, and complete calibrations.
* Created the Inter-Institute Resource Sharing module with Cost Configuration, Cancel, Approve, and Reject controls.
* Developed the Utilization Analytics view presenting booking counts, cost savings, and average usage durations.
* Designed dynamic time-slot heat maps in dashboards to visualize resource utilization patterns.

### Milestone 4
* Integrated real Google OAuth 2.0 authentication with backend token verification and strict registration enforcement.
* Developed a 3-step Password Reset wizard utilizing secure 6-digit One-Time Passwords (OTPs) dispatched via Email and SMS.
* Extended the Notification Service to dispatch multi-channel alerts (In-App, Email, SMS) for booking lifecycles, maintenance assignments, and calibration dues.
* Added mandatory welcome-back and registration confirmation emails across all roles.
* Completed full end-to-end regression testing and verified all modules (auth, bookings, sharing, notifications) function cleanly.

## 5. Major Features
* **User Registration & Login**: Credentials-based registration and secure JWT authentication.
* **Role-Based Access**: Role-based access control (RBAC) across 7 distinct platform roles.
* **Equipment Management**: Track categories, specifications, and live status of equipment.
* **Equipment Booking**: Reservation scheduler with overlap validation, waitlisting, and status tracking.
* **Maintenance Management**: Assign, track, and resolve equipment issues.
* **Calibration & License Tracking**: Log certification issue dates and get notification alerts for upcoming calibration/license expirations.
* **Notifications**: Real-time in-app notification center modal with unread counts and mark-all-as-read options.
* **Email/SMS Notifications**: Deliver transaction messages directly to user profiles.
* **Google Authentication**: Real Google OAuth 2.0 account chooser popup with backend signature verification.
* **Password Reset/OTP**: Secure password recovery via 10-minute time-limited OTPs.
* **Inter-Institute Resource Sharing**: Sharing requests, institutional cost handling, and workflow approvals.
* **Utilization Analytics**: Total usage hours, resource distribution charts, and cost savings tracking.
* **Utilization Heat Maps**: Weekly calendar heat maps indicating peak equipment booking slots.
* **Role-Based Dashboards**: Custom interfaces with tools specific to each role.

## 6. Project Structure
```text
frontend/
  ├── public/
  └── src/
      ├── assets/
      ├── components/
      └── services/
backend/
  └── lab-resource-utilization-platform/
      ├── src/
      │   ├── main/
      │   └── test/
      └── pom.xml
database/
README.md
```

## 7. Current Project Status
All functional requirements, integration services, analytics dashboards, and multi-channel notifications are **100% completed**. The platform has undergone thorough end-to-end regression testing and is in the final phase of documentation, deployment setup, and mentor evaluation.