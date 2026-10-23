# Multi-stage build for ProjectPartner Spring Boot Backend (Repo Root)
FROM maven:3-eclipse-temurin-8-alpine AS build
WORKDIR /workspace

# Copy backend dependencies definition
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B

# Copy backend source code
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Minimal runtime image (official Eclipse Temurin)
FROM eclipse-temurin:8-jre-alpine
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=h2
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
