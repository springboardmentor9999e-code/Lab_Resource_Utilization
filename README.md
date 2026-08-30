# 🧪 Lab Resource Management System

A full-stack web application designed to simplify the management and utilization of laboratory resources. The system provides role-based access, equipment management, laboratory resource booking, maintenance tracking, and notification management through a centralized platform.

---

## 📌 Project Overview

The **Lab Resource Management System** helps institutions manage laboratory resources efficiently through a centralized web application.

The platform provides separate dashboards and functionalities for different users and supports the management of equipment, bookings, maintenance activities, and system notifications.

The application follows a full-stack architecture with a **React frontend**, **Spring Boot backend**, REST APIs, JWT-based authentication, and a relational database.

---

# 🚀 Key Features

## 🔐 Authentication & Security

* Secure user login
* JWT-based authentication
* Protected backend APIs
* Spring Security configuration
* Role-based access to application features
* Secure request filtering using JWT

---

## 👥 Role-Based Dashboards

The system provides separate dashboards for different types of users.

Supported dashboards include:

* 👨‍💼 Administrator Dashboard
* 👨‍🏫 Department Head Dashboard
* 🔧 Lab Technician Dashboard
* 🔬 Researcher Dashboard
* 🧑‍🔬 Scientist Dashboard
* 🎓 Student Dashboard

Each dashboard provides access to functionalities based on the user's role.

---

## 🏢 Institution Management

The administrator can manage institution-related information through the administration module.

The system includes functionality for:

* Viewing institution information
* Managing institution records
* Organizing laboratory resources under institutions

---

## 🏬 Department Management

The platform supports department-level management.

Features include:

* Department information management
* Organizing departments within the system
* Department-level access through role-based dashboards

---

## 🧪 Laboratory Management

The system supports laboratory management for organizing laboratory resources.

Features include:

* Laboratory information management
* Laboratory organization
* Managing resources associated with laboratories

---

## 🔬 Equipment Management

The application provides functionality for managing laboratory equipment.

Features include:

* Equipment information management
* Viewing available equipment
* Updating equipment details
* Equipment status management
* Equipment access through the administration module

---

## 📅 Booking Management

The system allows users to manage laboratory equipment bookings.

Features include:

* Equipment booking
* Booking information management
* Viewing booking details
* Booking-related access based on user roles
* Backend booking service and controller integration

---

## 🔧 Maintenance Management

The project includes a dedicated maintenance management module.

The maintenance module contains:

* Maintenance records
* Maintenance service layer
* Maintenance repository
* Maintenance controller
* Maintenance-related application functionality

This helps organize and manage maintenance activities related to laboratory equipment.

---

## 🔔 Notification System

The application includes a notification system for communicating important information to users.

The notification module includes:

* Notification management
* Notification service
* Notification repository
* Notification controller
* Notification bell component
* Maintenance notification component

The frontend notification components provide users with a convenient way to view important system updates.

---

# 🛠 Technology Stack

| Layer                    | Technologies                    |
| ------------------------ | ------------------------------- |
| **Frontend**             | React, JavaScript, HTML, CSS    |
| **Backend**              | Java, Spring Boot               |
| **Security**             | Spring Security, JWT            |
| **API Communication**    | REST APIs                       |
| **Backend Architecture** | Controller, Service, Repository |
| **Database Access**      | Spring Data JPA / JPA           |
| **Build Tools**          | Maven, npm                      |

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────────┐
                    │      React Frontend      │
                    │                          │
                    │  Login                   │
                    │  Role Dashboards         │
                    │  Admin Pages             │
                    │  Notifications           │
                    └────────────┬─────────────┘
                                 │
                                 │ REST API
                                 ▼
                    ┌──────────────────────────┐
                    │    Spring Boot Backend   │
                    │                          │
                    │  Controllers             │
                    │  Services                │
                    │  Security / JWT          │
                    │  Business Logic          │
                    └────────────┬─────────────┘
                                 │
                                 │ JPA
                                 ▼
                    ┌──────────────────────────┐
                    │        Database          │
                    │                          │
                    │ Users                    │
                    │ Equipment                │
                    │ Bookings                 │
                    │ Maintenance              │
                    │ Notifications            │
                    └──────────────────────────┘
```

---

# 📂 Project Structure

```text
LabResourcePlatform
│
├── src
│   └── main
│       └── java
│           ├── config
│           │   ├── JwtFilter.java
│           │   ├── JwtUtil.java
│           │   └── SecurityConfig.java
│           │
│           ├── controller
│           │   ├── AuthController.java
│           │   ├── BookingController.java
│           │   ├── MaintenanceController.java
│           │   └── NotificationController.java
│           │
│           ├── dto
│           │   └── LoginResponse.java
│           │
│           ├── entity
│           │   ├── Equipment.java
│           │   ├── Maintenance.java
│           │   └── Notification.java
│           │
│           ├── repository
│           │   ├── MaintenanceRepository.java
│           │   └── NotificationRepository.java
│           │
│           └── service
│               ├── BookingService.java
│               ├── MaintenanceService.java
│               └── NotificationService.java
│
├── lab-resource-frontend
│   │
│   ├── src
│   │   ├── admin
│   │   │   ├── BookingPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── DepartmentPage.js
│   │   │   ├── EquipmentPage.js
│   │   │   ├── InstitutionPage.js
│   │   │   ├── LaboratoryPage.js
│   │   │   └── Sidebar.js
│   │   │
│   │   ├── components
│   │   │   ├── MaintenanceNotifications.js
│   │   │   └── NotificationBell.js
│   │   │
│   │   ├── dashboards
│   │   │   ├── AdminDashboard.js
│   │   │   ├── DepartmentHeadDashboard.js
│   │   │   ├── LabTechnicianDashboard.js
│   │   │   ├── ResearcherDashboard.js
│   │   │   ├── ScientistDashboard.js
│   │   │   └── StudentDashboard.js
│   │   │
│   │   ├── services
│   │   │   ├── bookingService.js
│   │   │   ├── dashboardService.js
│   │   │   ├── departmentService.js
│   │   │   ├── equipmentService.js
│   │   │   ├── institutionService.js
│   │   │   ├── laboratoryService.js
│   │   │   └── notificationService.js
│   │   │
│   │   ├── App.js
│   │   └── Login.js
│   │
│   └── package.json
│
└── README.md
```

---

# 🔄 Application Workflow

The general workflow of the application is:

```text
User
  │
  ▼
Login
  │
  ▼
JWT Authentication
  │
  ▼
Role Identification
  │
  ▼
Role-Based Dashboard
  │
  ├── Equipment Management
  │
  ├── Booking Management
  │
  ├── Maintenance Management
  │
  └── Notifications
```

---

# 📱 User Interface Modules

The frontend includes the following major modules:

### 🔐 Login

Users authenticate through the login page.

### 📊 Dashboards

Different dashboards are provided according to user roles.

### 🛠️ Administration

The administration section includes pages for:

* Dashboard
* Institutions
* Departments
* Laboratories
* Equipment
* Bookings

### 🔔 Notifications

Users can receive and view notifications using the notification components.

---

# ⚙️ Installation and Setup

## Prerequisites

Make sure the following software is installed:

* Java
* Maven
* Node.js
* npm
* A compatible relational database

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/springboardmentor9999e-code/Lab_Resource_Utilization.git
```

Navigate to the project:

```bash
cd Lab_Resource_Utilization
```

---

## 2️⃣ Backend Setup

Configure the database settings in the Spring Boot application configuration file.

Then run the backend application using IntelliJ IDEA or Maven.

Example:

```bash
mvn spring-boot:run
```

---

## 3️⃣ Frontend Setup

Open a terminal inside:

```text
lab-resource-frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm start
```

If your project uses a different start command, use the command configured in your `package.json`.

---

# 🔐 Security Implementation

The application uses JWT-based authentication.

The authentication flow is:

```text
User Login
    │
    ▼
Authentication Request
    │
    ▼
Spring Security
    │
    ▼
JWT Token Generated
    │
    ▼
Token Sent to Frontend
    │
    ▼
Protected API Requests
    │
    ▼
JWT Validation
```

This helps protect backend endpoints and provides authenticated access to application features.

---

# 🔮 Future Enhancements

Possible future improvements include:

* Email notifications
* Advanced equipment availability tracking
* Equipment utilization analytics
* Report generation
* Mobile application support
* Advanced booking scheduling
* Equipment maintenance reminders
* Improved dashboard analytics

---

# 📸 Application Screenshots

Screenshots of the application can be added to this repository to demonstrate the major features.

Suggested screenshots:

* Login Page
* Administrator Dashboard
* Equipment Management
* Booking Management
* Maintenance Management
* Notification System
* Department Management
* Laboratory Management

---

# 👩‍💻 Project Contributor

**Swathi Tayaru**

This branch contains the implementation and updates developed for the Lab Resource Management System.

---

# ⭐ Conclusion

The **Lab Resource Management System** provides a centralized platform for managing laboratory resources, equipment, bookings, maintenance activities, and user notifications.

The system combines a React-based frontend with a Spring Boot backend and JWT security to provide a structured and role-based laboratory resource management solution.
