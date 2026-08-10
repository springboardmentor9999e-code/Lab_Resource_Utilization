# Multi-stage Dockerfile for Spring Boot Backend

# Stage 1: Build JAR using Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Production JRE Image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Create directory for file uploads
RUN mkdir -p uploads/images uploads/documents

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
