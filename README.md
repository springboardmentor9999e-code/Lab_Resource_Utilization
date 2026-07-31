# Lab Resource Utilization Platform

A full-stack web application for managing laboratory resources, equipment bookings, user roles, and analytics in educational and research institutions.

The platform provides secure authentication, role-based access control, equipment management, booking workflows, utilization analytics, and real-time dashboards to improve laboratory resource allocation and monitoring.

---

## Features

### Authentication & Authorization
- JWT-based Authentication
- Role-Based Access Control (RBAC)
- Secure Login & Registration
- Password Encryption using BCrypt

### User Management
- Student Management
- Researcher Management
- Lab Technician Management
- Lab Manager Management
- Department Head
- Institution Administrator
- System Administrator

### Equipment Management
- Add Equipment
- Update Equipment
- Delete Equipment
- Equipment Categories
- Equipment Availability Tracking
- Equipment Dashboard

### Booking Management
- Equipment Booking
- Booking Approval
- Booking Rejection
- Cancel Booking
- Mark Equipment In Use
- Complete Booking
- No Show Management

### Dashboard & Analytics
- Equipment Utilization Dashboard
- Department Statistics
- Heatmaps
- Booking Density Analytics
- Weekly Utilization Reports
- Live Equipment Status

### Institution Management
- Institution Registration
- Department Management
- Role Management

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Router
- Axios
- Recharts

### Backend
- Java 21
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate

### Database
- PostgreSQL

### Tools
- Maven
- Git
- GitHub
- Postman

---

## Project Structure

```
Lab-Resource-Utilization-Platform
│
├── backend
│   ├── Controllers
│   ├── Services
│   ├── Repositories
│   ├── Entities
│   ├── Security
│   └── Configuration
│
├── frontend
│   ├── Components
│   ├── Pages
│   ├── Services
│   ├── Routes
│   ├── Context
│   └── Assets
│
└── Database
    └── PostgreSQL
```

---

## User Roles

- Student
- Researcher
- Lab Technician
- Lab Manager
- Department Head
- Institution Administrator
- System Administrator

Each role has dedicated permissions enforced using Spring Security Role-Based Authorization.

---

## Booking Workflow

```
Student / Researcher
        │
        ▼
Create Booking
        │
        ▼
Pending
        │
        ▼
Approved / Rejected
        │
        ▼
In Use
        │
        ▼
Completed
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/Lab-Resource-Utilization-Platform.git
```

---

### Backend

```bash
cd backend
```

Configure PostgreSQL database in

```
application.properties
```

Run

```bash
mvn spring-boot:run
```

Backend runs on

```
http://localhost:8080
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

## API Modules

- Authentication
- User Management
- Institution Management
- Equipment Management
- Booking Management
- Dashboard Analytics

---

## Security

- JWT Authentication
- Role-Based Access Control
- BCrypt Password Encoding
- Protected REST APIs
- Method-Level Authorization

---

## Future Enhancements

- Email Notifications
- QR Code Based Equipment Checkout
- Equipment Maintenance Scheduler
- Calendar Integration
- Report Export (PDF / Excel)
- AI-Based Resource Utilization Prediction
- Real-Time Notifications

---

## Screenshots

Add project screenshots here.

Example:

```
screenshots/
├── login.png
├── dashboard.png
├── equipment.png
├── booking.png
├── analytics.png
```

---

## Author

**Rohit Mali**

Bachelor of Engineering (Electronics & Telecommunication)

Mumbai University

GitHub: https://github.com/RohitMali1314

LinkedIn: *(Add your LinkedIn profile)*

---

## License

This project is developed for educational and academic purposes.
