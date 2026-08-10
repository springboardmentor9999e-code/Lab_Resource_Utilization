# Laboratory Resource Utilization & Equipment Sharing Platform

A multi-tenant, inter-institutional platform built with **Spring Boot 3**, **React 18**, **PostgreSQL**, **JWT Authentication**, and **Docker**. Designed for managing, scheduling, monitoring, and sharing high-precision laboratory resources across academic and research institutions.

---

## Key Architecture & Features

### 1. Equipment Inventory & Professional Catalog
- **Dynamic Equipment Cards**: View equipment images, name, category, status (`AVAILABLE`, `UNAVAILABLE`, `MAINTENANCE`, `IN_USE`), total quantity, and available count.
- **Image Resolution & Fallback Artwork**: Automatic resolution for uploaded images or category-matched HD laboratory placeholders.
- **Search & Filters**: Search equipment by keyword; filter by category and real-time availability status.
- **View Modes**: Interactive toggle between Card Grid View and Management Table View.

### 2. Booking & Priority Waitlist Workflows
- **Instant Booking Integration**: Clicking `[ BOOK NOW ]` pre-selects and populates equipment in the reservation workflow.
- **Automated Queueing**: Real-time waiting list queue management (`/api/waiting-list`) for high-demand resources.

### 3. Real-Time Utilization Monitoring & Analytics
- **Utilization Heatmap**: Weekly booking load matrix color-coded from low to peak intensity (`/heatmap`).
- **Idle Resource Detection**: Highlights unused equipment for inter-institution sharing recommendations.
- **Analytics Dashboard**: Real-time utilization rates, active resource metrics, and efficiency progress bars (`/analytics`).

### 4. Inter-Institution Sharing & Billing Chargeback
- **Cross-Institution Access Requests**: Research access request workflow between partner universities (`/request-access`).
- **Automated Billing & Invoicing**: Automated hourly chargeback calculation for approved inter-institution usage with payment status tracking (`/billing`).

### 5. Maintenance, Calibration & Alert System
- **Calibration Tracking**: Maintenance & renewal logs with automated 14-day renewal alerts (`/calibration`).
- **Notification Center**: Centralized alert management for lab administrators and researchers (`/notifications`).

---

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, React Icons, Custom Vanilla CSS Design System (`Plus Jakarta Sans` / `Inter`).
- **Backend**: Java 17, Spring Boot 3.x, Spring Data JPA, Spring Security with JWT.
- **Database**: PostgreSQL 15 (`lab_resource_db`).
- **Containerization**: Docker, Docker Compose, Nginx (Frontend Reverse Proxy).

---

## Environment Setup & Local Execution

### Prerequisites
- **JDK 17** or higher
- **Node.js 18+** & npm
- **PostgreSQL 15**
- **Docker & Docker Compose** (Optional for container deployment)

---

### Method 1: Running Locally (Development Mode)

#### 1. Database Setup
Create database in PostgreSQL:
```sql
CREATE DATABASE lab_resource_db;
```
*(The Spring Boot application automatically initializes schema tables using `src/main/resources/schema.sql`).*

#### 2. Start Backend (Spring Boot)
```bash
cd backend
./mvnw.cmd spring-boot:run
```
Backend runs at: `http://localhost:8080`

#### 3. Start Frontend (React)
```bash
cd frontend
npm install
npm start
```
Frontend runs at: `http://localhost:3000`

---

### Method 2: Docker Compose Deployment (Production Containerized)

To build and launch PostgreSQL, Spring Boot backend, and Nginx React frontend in isolated containers:

```bash
docker-compose up --build -d
```

- **React Web App (Nginx Proxy)**: `http://localhost:3000`
- **Spring Boot REST API**: `http://localhost:8080`
- **PostgreSQL Container**: `localhost:5432`

To stop containers:
```bash
docker-compose down
```

---

## Primary REST API Endpoints

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/users/register` | Register new user |
| | `POST` | `/api/users/login` | Authenticate and obtain JWT token |
| **Equipment** | `GET` | `/api/equipment` | Fetch all equipment records |
| | `GET` | `/api/equipment/{id}` | Fetch specific equipment details |
| | `POST` | `/api/equipment` | Create new equipment record |
| | `PUT` | `/api/equipment/{id}` | Update equipment record |
| | `DELETE` | `/api/equipment/{id}` | Remove equipment record |
| | `POST` | `/api/equipment/upload/{id}` | Upload image and manual document |
| **Booking** | `GET` | `/api/bookings` | List reservation history |
| | `POST` | `/api/bookings` | Submit new booking request |
| | `PUT` | `/api/bookings/{id}/approve` | Approve reservation |
| | `PUT` | `/api/bookings/{id}/cancel` | Cancel reservation |
| **Sharing** | `GET` | `/api/sharing-requests` | List access requests |
| | `POST` | `/api/sharing-requests` | Submit inter-institution request |
| **Utilization** | `GET` | `/api/utilization/stats` | Get overall platform utilization metrics |
| | `GET` | `/api/utilization/idle` | Detect idle equipment |
| **Billing** | `GET` | `/api/billing` | Fetch inter-institution invoices |
| | `POST` | `/api/billing/generate/{bookingId}` | Generate chargeback invoice |
| | `PUT` | `/api/billing/{id}/pay` | Process payment |

---

## Automated Verification Tests

To execute backend unit and integration test suites:

```bash
cd backend
./mvnw.cmd test
```
