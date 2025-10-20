# Dockerfile para el proyecto Spring Boot
FROM openjdk:17-jdk-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo pom.xml y descargar dependencias
COPY pom.xml .
COPY src src

# Instalar Maven
RUN apt-get update && apt-get install -y maven

# Construir la aplicación
RUN mvn clean package -DskipTests

# Exponer el puerto
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["java", "-jar", "target/saber-pro-app-0.0.1-SNAPSHOT.jar"]