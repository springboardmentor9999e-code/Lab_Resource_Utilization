# Lab Resource Utilization Platform

A full-stack web application designed to provide a centralized platform for managing laboratory equipment, institutions, departments, bookings, resource sharing, user access, and resource utilization analytics.

The platform helps laboratories and institutions organize their resources, manage equipment availability, handle bookings, and facilitate resource sharing between institutions through a secure role-based system.

---

## 📌 Project Overview

The **Lab Resource Utilization Platform** is a centralized web-based system developed using **React.js, Spring Boot, and PostgreSQL**.

The platform provides different users with role-specific access to laboratory resources and operations. It supports equipment management, institution and department management, equipment booking, resource sharing between institutions, and analytics for monitoring resource utilization.

The system is designed to reduce manual resource management and provide a structured way to manage laboratory equipment and shared resources.

---

## 🎯 Objectives

The main objectives of the project are:

* Develop a centralized platform for laboratory resource management.
* Manage laboratory equipment efficiently.
* Manage institutions and departments.
* Provide secure user authentication.
* Implement role-based access control.
* Provide equipment availability and booking management.
* Support scheduling of laboratory resources.
* Enable inter-institution resource sharing.
* Manage resource-sharing requests.
* Provide analytics for resource utilization and booking activities.
* Improve the overall efficiency of laboratory resource management.

---

# ✨ Key Features

## 1. User Authentication

The platform provides secure authentication for registered users.

### Features

* User login
* JWT-based authentication
* Secure password handling
* Authentication using Spring Security
* Token-based authorization
* Protected application routes
* Role-based access control

---

## 2. Role-Based Access Control

Different users receive access to features according to their assigned roles.

### Supported Roles

| User Role                     | Main Access                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| **Student / Researcher**      | View equipment, check availability, and make bookings        |
| **Lab Technician**            | Manage equipment and maintenance-related operations          |
| **Lab Manager**               | Manage equipment, bookings, and laboratory resources         |
| **Department Head**           | Monitor department resources, bookings, and utilization      |
| **Institution Administrator** | Manage institution resources, users, and sharing             |
| **System Administrator**      | Manage users, roles, institutions, and overall system access |

Role-based access ensures that users can perform only the operations permitted for their role.

---

# 3. Institution Management

The platform provides functionality for managing participating institutions.

### Features

* Add institution information
* View institution details
* Manage institution records
* Associate resources with institutions
* Support institution-to-institution resource sharing

---

# 4. Department Management

Departments can be associated with institutions and their laboratory resources.

### Features

* Manage department information
* Associate departments with institutions
* Associate laboratory equipment with departments
* Support department-level resource management
* Support department-level utilization analysis

---

# 5. Equipment Management

The Equipment Management module provides centralized management of laboratory equipment.

### Features

* Add laboratory equipment
* View equipment details
* Update equipment information
* Manage equipment records
* Associate equipment with institutions
* Associate equipment with departments
* Check equipment availability
* Manage equipment access according to user roles

### Equipment Availability

Equipment can be managed based on its current availability and booking status.

---

# 6. Equipment Booking & Scheduling

The platform provides a structured process for booking laboratory equipment.

### Features

* View available equipment
* Check equipment availability
* Create equipment bookings
* Manage booking information
* Schedule equipment usage
* Manage booking requests
* Prevent conflicts in resource usage
* Track booking information

### Booking Workflow

```text
User
  ↓
Select Equipment
  ↓
Check Availability
  ↓
Select Booking Details
  ↓
Submit Booking
  ↓
Booking Management / Approval
  ↓
Resource Usage
```

---

# 7. Inter-Institution Resource Sharing

One of the major features of the platform is the ability to share laboratory resources between institutions.

### Features

* Discover resources available for sharing
* Request access to resources from another institution
* Manage resource-sharing requests
* Approve or manage sharing requests according to permissions
* Support shared equipment booking
* Coordinate access to shared resources
* Maintain resource-sharing information

### Resource Sharing Workflow

```text
Institution A
     ↓
Shares Equipment
     ↓
Resource Available for Sharing
     ↓
Institution B
     ↓
Requests Access
     ↓
Request Management
     ↓
Access / Booking
     ↓
Shared Resource Usage
```

This functionality addresses the project's objective of enabling institutions to share expensive and limited laboratory resources efficiently.

---

# 8. Resource Availability Management

The platform allows users to check the availability of laboratory resources before making bookings.

### Features

* View available equipment
* Check current resource availability
* Identify booked resources
* Check resources before scheduling
* Support availability-based booking

This helps reduce conflicts and improves the utilization of available laboratory resources.

---

# 9. Analytics Dashboard

The Analytics module provides insights into laboratory resources and their usage.

### Features

* Equipment utilization overview
* Booking statistics
* Resource availability insights
* Department-wise analysis
* Institution-wise analysis
* Usage statistics
* Visual representation of resource information
* Dashboard-based resource monitoring

### Purpose

The analytics dashboard helps lab managers, department heads, and administrators understand resource usage and make better decisions regarding laboratory resources.

## The reference project specification also identifies equipment utilization, booking activity, department/institution-level analysis, and dashboards as important analytical capabilities.

# 10. User Interface

The platform provides a user-friendly web interface for interacting with the system.

### Interface Includes

* Login interface
* Role-based dashboards
* Equipment management screens
* Institution management screens
* Department management screens
* Booking interfaces
* Resource-sharing interfaces
* Analytics dashboards
* Navigation based on user role

The interface is designed so that users can easily access the operations relevant to their responsibilities.

---

# 🏗️ System Architecture

The application follows a full-stack architecture consisting of a frontend, backend, and database.

```text
                    USERS
                      │
                      ▼
        ┌─────────────────────────┐
        │      React.js           │
        │       Frontend          │
        │                         │
        │ • Login                 │
        │ • Dashboards            │
        │ • Equipment             │
        │ • Institutions          │
        │ • Departments           │
        │ • Bookings              │
        │ • Resource Sharing      │
        │ • Analytics             │
        └────────────┬────────────┘
                     │
                  REST APIs
                     │
                     ▼
        ┌─────────────────────────┐
        │      Spring Boot        │
        │        Backend          │
        │                         │
        │ • Authentication        │
        │ • Authorization         │
        │ • User Management       │
        │ • Role Management       │
        │ • Equipment Management  │
        │ • Institution Management│
        │ • Department Management │
        │ • Booking Management    │
        │ • Resource Sharing      │
        │ • Business Logic        │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │       PostgreSQL        │
        │        Database         │
        │                         │
        │ • Users                 │
        │ • Roles                 │
        │ • Institutions          │
        │ • Departments           │
        │ • Equipment             │
        │ • Bookings              │
        │ • Resource Sharing      │
        │ • Related Records       │
        └─────────────────────────┘
```

## The reference architecture describes React.js as the client layer, Spring Boot as the backend, and PostgreSQL as the primary database.

# 🛠️ Technology Stack

## Frontend

* React.js
* JavaScript
* CSS
* React Router
* Axios

## Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* Maven

## Database

* PostgreSQL

## Authentication & Security

* JWT
* Spring Security
* Role-Based Access Control

## API Testing

* Postman

## Development Tools

* IntelliJ IDEA
* Visual Studio Code

## Version Control

* Git
* GitHub

The project specification lists Java/Spring Boot, React.js/JavaScript, PostgreSQL, Spring Security, JWT, React Router, Axios, Maven, and related development/testing tools as part of the relevant technology stack.

---

# 🔐 Security

Security is implemented using Spring Security and JWT authentication.

### Security Features

* JWT-based authentication
* Password-based login
* Token-based authorization
* Role-based access control
* Protected backend APIs
* Role-specific application access
* CORS configuration for frontend-backend communication

The authentication mechanism ensures that only authenticated users can access protected resources and that access is controlled according to user roles.

---

# 🔄 Application Workflow

The overall application workflow is:

```text
                    LOGIN
                      │
                      ▼
             Authentication
                      │
                      ▼
             JWT Token Generated
                      │
                      ▼
            Role Verification
                      │
                      ▼
             Role-Based Dashboard
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   Equipment      Institution     Department
   Management     Management      Management
       │              │              │
       └──────────────┼──────────────┘
                      ▼
             Check Availability
                      │
                      ▼
              Booking / Sharing
                      │
                      ▼
          Resource Management
                      │
                      ▼
                 Analytics
```

---

# 📊 Analytics Workflow

```text
Equipment Data
      │
      ▼
Booking Data
      │
      ▼
Resource Usage
      │
      ▼
Data Processing
      │
      ▼
Analytics Dashboard
      │
      ▼
Resource Utilization Insights
```

Analytics helps administrators and managers understand how laboratory resources are being used.

---

# 🧪 Testing & Results

The application was tested throughout development to verify the functionality of the major modules.

### Testing Performed

* User login testing
* JWT authentication testing
* Role-based authorization testing
* REST API testing using Postman
* Equipment management testing
* Institution management testing
* Department management testing
* Booking workflow testing
* Resource-sharing workflow testing
* Frontend-backend integration testing
* PostgreSQL database testing

### Results

* User authentication works successfully.
* JWT-based authorization works correctly.
* Role-based access is functioning as expected.
* Equipment information can be managed successfully.
* Institution and department operations work correctly.
* Equipment booking workflows function correctly.
* Inter-institution resource-sharing workflows are supported.
* React frontend communicates successfully with the Spring Boot backend.
* Data is stored and retrieved through PostgreSQL successfully.
* Analytics information can be displayed through the dashboard.

---

# 📁 Project Structure

A simplified project structure is:

```text
Lab-Resource-Utilization-Platform/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── ...
│
└── README.md
```

> The exact folder and package structure may vary depending on the final repository organization.

---

# ⚙️ Installation & Setup

## Prerequisites

Install the following software before running the application:

* Java
* Node.js
* npm
* PostgreSQL
* Maven
* Git

---

## 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd Lab-Resource-Utilization-Platform
```

---

## 2. Database Setup

Create a PostgreSQL database for the application.

Example:

```sql
CREATE DATABASE labdb;
```

Configure the database connection in the Spring Boot application's configuration file.

Example configuration:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/labdb
spring.datasource.username=your_username
spring.datasource.password=your_password
```

> Replace the username and password with your local PostgreSQL credentials.

---

## 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Run the Spring Boot application using Maven:

```bash
mvn spring-boot:run
```

The backend will start on the configured Spring Boot port.

---

## 4. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

The frontend will run on the configured React development port.

---

# 🔗 Frontend–Backend Communication

The React frontend communicates with the Spring Boot backend through REST APIs.

```text
React.js
   │
   │ HTTP Requests
   ▼
Spring Boot REST APIs
   │
   ▼
PostgreSQL
```

JWT tokens are used to authenticate requests to protected backend endpoints.

---

# 📌 Main Functional Modules

The implemented platform can be summarized into the following major modules:

```text
┌──────────────────────────────────────┐
│    Lab Resource Utilization Platform │
├──────────────────────────────────────┤
│                                      │
│  • Authentication & Authorization    │
│  • User & Role Management            │
│  • Institution Management            │
│  • Department Management              │
│  • Equipment Management              │
│  • Booking & Scheduling              │
│  • Resource Sharing                  │
│  • Resource Availability              │
│  • Analytics Dashboard               │
│                                      │
└──────────────────────────────────────┘
```

---

# 🚀 Future Scope

The following features can be added in future versions:

### 💳 Online Payment Integration

Integrate secure online payment methods so that users can make payments when accessing or booking shared laboratory resources.

### 📱 Mobile Application

Develop a mobile application to allow users to manage laboratory resources, bookings, and requests from mobile devices.

### 📈 Advanced Analytics

Expand the analytics module with more advanced reports, resource demand analysis, and utilization insights.

### 🤖 AI-Based Recommendations

Introduce AI-based recommendations to suggest suitable laboratory equipment based on user requirements and previous usage patterns.

---

# 🎓 Project Outcome

The project demonstrates the development of a complete full-stack laboratory resource management platform integrating:

* Frontend development
* Backend REST APIs
* PostgreSQL database management
* JWT authentication
* Role-based authorization
* Equipment management
* Institution and department management
* Equipment booking and scheduling
* Inter-institution resource sharing
* Analytics and dashboards

The platform provides a centralized approach to laboratory resource management and creates a foundation for more advanced resource utilization and sharing capabilities.

---

# 👨‍💻 Project

**Lab Resource Utilization Platform**

**Developed By:**
Hinduja Adabala

**Degree:**
B.Tech – Computer Science and Engineering (AI & DS)

**Institution:**
BVC Institute of Technology and Science

---

## 📄 License

This project was developed as an academic project for educational and demonstration purposes.
