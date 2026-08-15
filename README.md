# Lab Resource Utilization Platform

A full-stack web application for managing laboratory equipment, institutions, bookings, and inter-institution resource sharing through a centralized platform.

## 📌 Project Overview

The **Lab Resource Utilization Platform** is designed to simplify the management and utilization of laboratory resources. It provides a centralized system where users can view and manage laboratory equipment, check availability, make bookings, and share resources between institutions.

The platform uses a **React.js frontend**, **Spring Boot backend**, and **PostgreSQL database** to provide a secure and structured resource management system.

## 🎯 Objectives

* Develop a centralized platform for laboratory resource management.
* Manage laboratory equipment and institution information efficiently.
* Provide secure user authentication and role-based access.
* Enable equipment booking and scheduling.
* Track equipment availability.
* Support inter-institution resource sharing.
* Provide analytics for monitoring resource usage and bookings.

## ✨ Key Features

### 1. User Authentication & Role-Based Access

* Secure user login using JWT authentication.
* Role-based access control.
* Different features and operations based on the user's role.

### 2. Equipment Management

* Add and manage laboratory equipment.
* View equipment information and details.
* Check equipment availability.
* Manage equipment according to user permissions.

### 3. Institution Management

* Manage institution information.
* Maintain institution-related resources.
* Support resource sharing between institutions.

### 4. Booking & Scheduling

* View equipment availability.
* Book laboratory equipment.
* Manage booking requests.
* Maintain booking information.

### 5. Inter-Institution Resource Sharing

* Support sharing of laboratory equipment between institutions.
* Allow users to request access to shared resources.
* Manage resource-sharing requests.

### 6. Analytics

* View equipment utilization information.
* Monitor booking and usage statistics.
* Provide resource availability insights.
* Present information through dashboards and visualizations.
* Support better decision-making for laboratory resource management.

## 👥 User Roles

The platform supports the following user roles:

| User Role                     | Main Access                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| **Student / Researcher**      | View equipment, check availability, make bookings            |
| **Lab Technician**            | Manage equipment and maintenance-related operations          |
| **Lab Manager**               | Manage equipment, bookings, and lab resources                |
| **Department Head**           | Monitor department resources, bookings, and utilization      |
| **Institution Administrator** | Manage institution resources, users, and sharing             |
| **System Administrator**      | Manage users, roles, institutions, and overall system access |

## 🏗️ System Architecture

The application follows a three-layer full-stack architecture:

```text
┌──────────────────────────────┐
│           Users              │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       React.js Frontend      │
│                              │
│ • User Interface             │
│ • Dashboards                 │
│ • Equipment Management       │
│ • Booking                    │
│ • Resource Sharing           │
└──────────────┬───────────────┘
               │
            REST APIs
               │
               ▼
┌──────────────────────────────┐
│      Spring Boot Backend     │
│                              │
│ • Authentication             │
│ • Role Management            │
│ • Equipment Management       │
│ • Institution Management     │
│ • Booking & Scheduling       │
│ • Resource Sharing           │
│ • Business Logic             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       PostgreSQL Database     │
│                              │
│ • Users & Roles              │
│ • Institutions               │
│ • Departments                │
│ • Equipment                  │
│ • Bookings                   │
│ • Resource Sharing Data      │
└──────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend

* React.js
* JavaScript
* CSS
* React Router
* Axios

### Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* Maven

### Database

* PostgreSQL

### Authentication

* JWT
* Spring Security

### Testing

* Postman

### Development Tools

* IntelliJ IDEA
* Visual Studio Code
* Git
* GitHub

## 🔐 Security

The application implements authentication and authorization using:

* **JWT-based authentication**
* **Spring Security**
* **Role-based access control**

Users are granted access to application features according to their assigned roles.

## 🧪 Testing

The application was tested during development to verify the major system workflows.

Testing includes:

* User login and authentication testing.
* JWT authorization testing.
* Role-based access testing.
* REST API testing using Postman.
* Equipment management testing.
* Institution management testing.
* Booking workflow testing.
* Resource-sharing workflow testing.
* Frontend and backend integration testing.
* PostgreSQL database operations testing.

## 📊 Analytics

The Analytics module provides visual insights into laboratory resource usage and booking activities.

It helps users with appropriate permissions to:

* Monitor equipment usage.
* View booking statistics.
* Analyze resource availability.
* Understand utilization patterns.
* Support resource management decisions.

## 🚀 Project Structure

A simplified project structure is:

```text
Lab-Resource-Utilization-Platform/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   └── pom.xml
│
└── README.md
```

> The exact folder structure may vary depending on the repository organization.

## ⚙️ Installation & Setup

### Prerequisites

Make sure the following are installed:

* Java
* Node.js and npm
* PostgreSQL
* Maven
* Git

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd Lab-Resource-Utilization-Platform
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Configure the PostgreSQL database connection in the Spring Boot application configuration.

Then run:

```bash
mvn spring-boot:run
```

The backend will start on the configured Spring Boot port.

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the required dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

The frontend will run on the configured React development port.

## 🔄 Application Workflow

```text
Login
   ↓
Authentication & Role Verification
   ↓
Role-Based Dashboard
   ↓
Equipment / Institution Management
   ↓
Check Equipment Availability
   ↓
Booking or Resource Sharing
   ↓
Manage Requests
   ↓
Analytics & Resource Monitoring
```

## 📈 Future Scope

The platform can be extended with additional capabilities such as:

* Online payment integration for resource booking and usage.
* Mobile application support.
* Advanced analytics and reporting.
* AI-based equipment recommendations.
* Enhanced automated notifications.

## 🎓 Project Purpose

This project demonstrates the development of a full-stack laboratory resource management system using modern web technologies. It integrates frontend development, backend services, database management, authentication, role-based authorization, booking workflows, and resource sharing into a single platform.

## 👨‍💻 Developed By

**Hinduja Adabala**

B.Tech – Computer Science and Engineering (AI & DS)
BVC Institute of Technology and Science
