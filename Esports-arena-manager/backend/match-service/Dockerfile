# Imagen del microservicio match-service (patrón de la sesión 3: dos etapas)
# 1 · Etapa de compilación: Maven + JDK 21
FROM maven:3-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
# Las pruebas se corren en el computador: aquí no hay base de datos
RUN mvn -q -B -DskipTests package

# 2 · Etapa de ejecución: solo el JRE 21 y el .jar
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/match-service.jar app.jar
# Java usa hasta el 70 % de la memoria (plan gratuito de Render: 512 MB)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70"
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
