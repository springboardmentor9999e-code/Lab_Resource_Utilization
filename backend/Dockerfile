# ==============================
# Stage 1: Build Spring Boot JAR
# ==============================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests


# ==============================
# Stage 2: Run Spring Boot
# ==============================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

# Directories used for uploaded files
RUN mkdir -p uploads/images uploads/documents

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]