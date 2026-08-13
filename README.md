# Lab Resource Utilization Platform

## 1. Project Overview
The Lab Resource Utilization Platform is a full-stack platform that helps institutions manage laboratory equipment, schedule resource access, share expensive equipment between institutions, monitor utilization, manage maintenance/calibration, and analyze resource efficiency. It streamlines booking workflows, tracks equipment health, and enables cross-institutional resource sharing while providing deep analytics on resource demand and utilization costs.

## 2. Objectives
* **Laboratory Equipment Management**: Maintain a central digital repository of equipment specifications, manufacturers, documentation, and live status.
* **Equipment Availability and Scheduling**: Implement conflict-free booking and scheduling pipelines to maximize equipment availability.
* **Inter-Institution Resource Sharing**: Enable cross-institutional access to specialized resources with custom workflow approvals and cost configurations.
* **Real-Time Utilization Monitoring**: Track equipment utilization rates, active hours, and booking distributions dynamically.
* **Maintenance and Calibration Management**: Track reported equipment issues, technician assignments, calibration due dates, and license renewals.
* **Booking and Scheduling**: Enable flexible time-slot booking with waitlist support and status management.
* **Analytics and Resource Efficiency**: Assist administrators and department heads in capacity planning and demand analysis.
* **Centralized Dashboard**: Provide custom, role-based dashboards to consolidate actions and insights based on user permissions.

## 3. Technologies Used
* **Frontend**: React.js, React Router, Axios, Bootstrap 5, Vanilla CSS
* **Backend**: Spring Boot, Spring Security, Hibernate ORM, Java Mail Sender
* **Database**: PostgreSQL
* **Authentication**: Stateless JSON Web Tokens (JWT), Google Identity Services (GIS) OAuth 2.0
* **Notifications**: Multi-channel system supporting In-App alerts, SMTP Email, and simulated SMS
* **Version Control**: Git / GitHub

## 4. Development Progress

### Milestone 1 – Week 1 & 2
*Project Initialization, Design Process & Core Setup*
* **Project Planning & Requirements**: Outlined functional requirements, core entities, and permission matrix mappings.
* **System Architecture & Database Design**: Modeled PostgreSQL tables for Users, Roles, Institutions, Departments, Laboratories, Equipment, and Bookings.
* **React Frontend & Spring Boot Backend Setup**: Initialized React components and Spring Boot REST controllers with standard project structure.
* **JWT & Role-Based Access**: Integrated Spring Security filter chain with JWT-based session security.
* **Equipment Inventory**: Built core CRUD APIs for equipment tracking and categorized search filters.
* **Core Booking & Scheduling**: Implemented reservation scheduling validation to prevent time-slot overlaps.

### Milestone 2 – Week 3 & 4
*Utilization Monitoring & Inter-Institution Sharing*
* **Equipment Utilization Monitoring**: Developed tracking metrics to measure daily, weekly, and total equipment active hours.
* **Utilization Calculations**: Implemented calculations on duration, usage ratios, and institutional cost allocations.
* **Utilization Heat Maps**: Designed interactive time-slot heat maps indicating peak usage hours.
* **Inter-Institution Resource Sharing**: Built the sharing relation entity and cost mapping systems.
* **Sharing/Access Request Workflow**: Developed Request, Cancel, Approve, and Reject states for administrators.
* **Shared Equipment Booking**: Integrated external shared equipment directly into user search results for bookability.
* **Utilization/Demand Analysis**: Created analytics charts demonstrating booking distributions by category and lab.

### Milestone 3 – Week 5 & 6
*Maintenance, Cost Management & Analytics*
* **Maintenance Scheduling & Issue Management**: Enabled reporting of issues, transitioning equipment to maintenance status, and resolving reports.
* **Calibration Tracking**: Created tracking for calibration due dates and scheduled frequencies.
* **Certification/License Renewal**: Developed actions to complete calibration and renew equipment safety certificates or licenses.
* **Utilization Cost Tracking**: Implemented dynamic billing algorithms to charge hourly rates for external institutional bookings.
* **Inter-Institution Cost/Sharing Calculations**: Designed financial metrics to report total savings and external utilization expenditures.
* **Role-Based Analytics Dashboards**: Customized dashboard metrics for all user roles (Students, Researchers, Techs, Managers, Dept Heads, Admins).
* **Notification & Alert System**: Enabled background notification triggers for booking approvals, maintenance assignments, and calibration dues.

### Milestone 4 – Week 7 & 8
*Testing, Deployment & Documentation*
* **Application Testing**: Executed comprehensive unit and integration tests across controllers and services.
* **Workflow Validation**: Verified end-to-end user flows including OTP password resets, welcome-back notifications, and Google OAuth 2.0.
* **Performance & UI Improvements**: Resolved infinite loops in dashboard metrics and optimized startup parameters.
* **Deployment**: Validated production bundles using npm and Maven build processes.
* **Final Documentation**: Updated user guides, implementation plans, and deployment specifications.
* **Final Presentation & Demonstration**: Set up verification scripts to run full-flow integration testing.

## 5. Major Features
* **User Authentication**: Secure credentials login alongside Google Identity Services OAuth 2.0 token verification.
* **Role-Based Dashboards**: 7 custom dashboards configured with tailored metrics and actions.
* **Conflict-Free Booking**: Automated scheduling engine with overlap validation and waitlist auto-promotion.
* **Inter-Institute Resource Sharing**: Workflow-controlled request system for institutional equipment exchange.
* **Maintenance & Calibration Tracking**: Complete issue logs, technician assignments, and renewal indicators.
* **Multi-Channel Notification Center**: Dynamic dispatch of In-App, Email, and SMS notifications.
* **Interactive Heat Maps**: Slot occupancy charts depicting lab utilization patterns.
* **Utilization Analytics**: Graphical reports on cost distributions and resource capacity.

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

## 7. Current Status
All milestones, functional modules, and integration endpoints are **100% complete**. The project is currently in the final Milestone 4 phase, with all automated test suites passing and ready for final evaluation.