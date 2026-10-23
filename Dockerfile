# Multi-stage build for ProjectPartner Spring Boot Backend (Repo Root)
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /workspace

# Copy backend pom and source files
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

# Build production executable JAR with TLSv1.2/TLSv1.3 support
RUN mvn clean package -DskipTests

# Minimal runtime image using modern Eclipse Temurin 17 JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=h2
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
