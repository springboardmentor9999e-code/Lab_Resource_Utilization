# Lab Resource Platform

A full-stack web application for managing laboratory resources, equipment, users, and equipment bookings.

## Features

- JWT-based authentication
- Role-based access control
- User management
- Equipment management
- Equipment availability tracking
- Equipment booking
- Equipment return management
- Waiting queue management
- Booking approval and rejection
- Role-specific dashboards
- Booking statistics
- Booking reports
- Search and filtering
- Secure password encryption using BCrypt

## User Roles

- Admin
- Lab Manager
- Lab Technician
- Researcher
- Student
- Department Head

## Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- Bootstrap
- Axios
- React Router
- SweetAlert2

### Backend

- Java 21
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT
- Hibernate
- Maven

### Database

- PostgreSQL

## Project Structure

```text
lab-resource-platform/
│
├── backend/
│   └── lab-resource-platform/
│       ├── src/
│       │   └── main/
│       │       ├── java/
│       │       │   └── com/lab/resource/
│       │       │       ├── controller/
│       │       │       ├── entity/
│       │       │       ├── repository/
│       │       │       ├── security/
│       │       │       └── service/
│       │       │
│       │       └── resources/
│       │           └── application.properties
│       │
│       ├── pom.xml
│       └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layout/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Authentication

The application uses JWT-based authentication with Spring Security.

```text
User
  ↓
Login
  ↓
Spring Security
  ↓
JWT Token
  ↓
Token stored in browser
  ↓
Axios sends Bearer Token
  ↓
JWT Authentication Filter
  ↓
Protected API
```

## Booking Workflow

```text
User selects equipment
        ↓
Check availability
        ↓
Available?
   ↓          ↓
  Yes         No
   ↓           ↓
 BOOKED     WAITING
              ↓
        Waiting Queue
              ↓
      Equipment Returned
              ↓
       Next User Promoted
              ↓
            BOOKED
```

## Booking Status

| Status | Description |
|---|---|
| BOOKED | Equipment is currently booked |
| WAITING | User is waiting for equipment |
| RETURNED | Equipment has been returned |
| REJECTED | Booking has been rejected |

## Backend Setup

### 1. Navigate to the backend

```bash
cd backend/lab-resource-platform
```

### 2. Configure PostgreSQL

Create a database named:

```text
lab_resource_db
```

Configure:

```text
src/main/resources/application.properties
```

Example:

```properties
spring.application.name=lab-resource-platform

spring.datasource.url=jdbc:postgresql://localhost:5432/lab_resource_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_DATABASE_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

server.port=8080
```

### 3. Build the backend

```bash
mvn clean package -DskipTests
```

### 4. Run the backend

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

## Frontend Setup

### 1. Navigate to frontend

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Users

```text
GET    /api/users
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

### Equipment

```text
GET    /api/equipment
GET    /api/equipment/{id}
POST   /api/equipment
PUT    /api/equipment/{id}
DELETE /api/equipment/{id}
```

### Bookings

```text
GET    /api/bookings
GET    /api/bookings/{id}
POST   /api/bookings
PUT    /api/bookings/{id}
DELETE /api/bookings/{id}

PUT    /api/bookings/{id}/return
PUT    /api/bookings/{id}/approve
PUT    /api/bookings/{id}/reject

GET    /api/bookings/queue/{equipmentId}
GET    /api/bookings/active
GET    /api/bookings/latest
```

### Booking Statistics

```text
GET /api/bookings/count
GET /api/bookings/count/booked
GET /api/bookings/count/returned
GET /api/bookings/count/waiting
GET /api/bookings/count/active
```

### Reports

```text
GET /api/bookings/status/{status}

GET /api/bookings/between?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

GET /api/bookings/returns?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

## Security

The application uses:

- Spring Security
- JWT authentication
- BCrypt password encryption
- Role-based authorisation
- Protected REST APIs

Protected requests use:

```text
Authorization: Bearer <JWT_TOKEN>
```

## Testing

The backend APIs can be tested using Postman.

Recommended testing flow:

```text
1. Register user
2. Login
3. Obtain JWT token
4. Authorise protected requests
5. Add equipment
6. Create booking
7. Check equipment availability
8. Test waiting queue
9. Return equipment
10. Verify booking status
```

## Future Enhancements

- Email notifications
- Equipment maintenance tracking
- Overdue booking notifications
- Calendar-based booking
- Advanced resource utilisation analytics
- PDF report generation
- Audit logs
- Real-time notifications

## Author

**Siva Koti Yarramsetty**

## License

This project is developed for educational and academic purposes.
