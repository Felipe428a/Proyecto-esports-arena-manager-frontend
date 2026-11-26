# Imagen del microservicio ranking-service (patrón de la sesión 3: dos etapas)
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
COPY --from=build /app/target/ranking-service.jar app.jar
# Java usa hasta el 70 % de la memoria (plan gratuito de Render: 512 MB)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70"
EXPOSE 8089
# Render.com entrega DATABASE_URL (postgresql://usuario:clave@host/base): si existe, se convierte a JDBC.
# En local y en docker-compose no existe y se usa DB_URL tal cual.
ENTRYPOINT ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then export DB_URL=\"jdbc:postgresql://${DATABASE_URL##*@}\"; fi; exec java -jar app.jar"]
