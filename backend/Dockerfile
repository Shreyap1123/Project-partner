# Multi-stage build for ProjectPartner Spring Boot Backend
FROM maven:3-openjdk-8-slim AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Minimal runtime image
FROM openjdk:8-jre-slim
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=h2
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
