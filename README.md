# 🎓 Sistema de Gestión Saber Pro - UTS

## 📋 Descripción del Proyecto

Sistema web desarrollado con **Spring Boot** y **MongoDB** para la gestión y seguimiento de los resultados de las pruebas **Saber Pro** de estudiantes universitarios. El sistema implementa automáticamente el cálculo de incentivos académicos según los puntajes obtenidos y proporciona herramientas de análisis para coordinadores académicos.

## 🎯 Objetivos

### Objetivos Específicos Implementados:

✅ **Levantar requerimientos funcionales y no funcionales**
✅ **Diseñar historias de usuarios y plan de trabajo**  
✅ **Desarrollar sistema web que solucione los resultados de las pruebas Saber Pro**
✅ **Realizar pruebas del software desarrollado**

## 👥 Roles del Sistema

### 🎓 **Estudiante**
- **Identificación**: Consulta personal de resultados
- **Resultado Único**: Visualización detallada de puntajes por competencia
- **Resultados Total**: Análisis completo con gráficos interactivos
- **Estado de Graduación**: Verificación automática de elegibilidad
- **Incentivos**: Visualización de beneficios obtenidos

### 👨‍💼 **Coordinador** 
- **CRUD Completo**: Gestión integral de estudiantes y resultados
- **Dashboard**: Panel de control con estadísticas en tiempo real
- **Reportes**: Informes detallados y exportables
- **Análisis**: Herramientas de filtrado y búsqueda avanzada

## 🏆 Sistema de Incentivos Implementado

### Para Pruebas Saber PRO (0-300 puntos):

#### 🥉 **Puntaje 180-210**
- Exoneración del informe final de trabajo de grado
- Seminario de grado IV con nota 4.5

#### 🥈 **Puntaje 211-240** 
- Exoneración del informe final de trabajo de grado  
- Seminario de grado IV con nota 4.7
- **Beca del 50%** del valor de derechos de grado

#### 🥇 **Puntaje 241+**
- Exoneración del informe final de trabajo de grado
- Seminario de grado IV con nota 5.0
- **Beca del 100%** del valor de derechos de grado
- **Ceremonia especial** - Noche de los mejores

### 🎯 **Incentivos Generales Adicionales**
- 📚 Ayuda para estudios de posgrado mediante becas
- 💼 Mejores oportunidades laborales en grandes empresas  
- 💰 Condonación de deudas para estudiantes con créditos Icetex

## ⚠️ **Requisitos Críticos**

### 🚫 **Restricción de Graduación**
**Los estudiantes con puntaje inferior a 80 puntos NO pueden graduarse**, según normativas institucionales.

### 📋 **Requisitos para Incentivos**
- Haber presentado y aprobado propuesta de trabajo de grado
- Estar matriculado en Seminario II o IV según corresponda
- Realizar los pagos correspondientes

## 🛠️ Tecnologías Utilizadas

### Backend
- **Spring Boot 3.x** - Framework principal
- **Spring Data MongoDB** - Persistencia de datos  
- **Spring Web** - APIs REST
- **Maven** - Gestión de dependencias

### Frontend  
- **HTML5 + CSS3** - Estructura y estilos
- **Bootstrap 5.3** - Framework UI responsivo
- **JavaScript ES6+** - Lógica del cliente
- **Font Awesome 6** - Iconografía
- **Chart.js** - Gráficos interactivos

### Base de Datos
- **MongoDB** - Base de datos NoSQL
- **MongoDB Compass** - Herramienta de administración

## 🚀 Estructura del Proyecto Mejorada

```
src/
├── main/
│   ├── java/com/saberpro/
│   │   ├── config/
│   │   │   └── DataInitializer.java          # Inicialización de datos
│   │   ├── controller/
│   │   │   ├── AuthController.java           # Autenticación
│   │   │   ├── CoordinadorController.java    # APIs coordinador
│   │   │   ├── EstudianteController.java     # APIs estudiante
│   │   │   └── SaberProController.java       # APIs principales (NUEVO)
│   │   ├── model/
│   │   │   ├── Usuario.java                  # Modelo usuarios
│   │   │   ├── ResultadoSaberPro.java        # Modelo resultados (MEJORADO)
│   │   │   └── IncentivoSaberPro.java        # Modelo incentivos (NUEVO)
│   │   ├── repository/
│   │   │   ├── UsuarioRepository.java        # Repositorio usuarios
│   │   │   └── ResultadoSaberProRepository.java # Repositorio resultados (MEJORADO)
│   │   ├── service/
│   │   │   └── IncentivoService.java         # Lógica incentivos (NUEVO)
│   │   └── SaberProApplication.java          # Clase principal
│   └── resources/
│       ├── application.properties            # Configuración
│       └── static/
│           ├── index.html                    # Login mejorado
│           ├── estudiante.html               # Dashboard estudiante (REDISEÑADO)
│           ├── coordinador.html              # Dashboard coordinador (REDISEÑADO)
│           ├── app.js                        # JavaScript original
│           └── app-enhanced.js               # JavaScript mejorado (NUEVO)
```

## ⚙️ Configuración y Ejecución

### 1. **Requisitos Previos**
```bash
- Java 17+
- Maven 3.6+
- MongoDB 6.0+
- Git
```

### 2. **Configuración de MongoDB**
```properties
# application.properties
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=saberpro_db
server.port=8081
```

### 3. **Instalación y Ejecución**
```bash
# Clonar y navegar al proyecto
git clone <repository-url>
cd ProyectoParcial2

# Instalar dependencias
mvn clean install

# Ejecutar aplicación
mvn spring-boot:run

# Acceder al sistema
http://localhost:8081
```

## 👤 Usuarios de Prueba

### 🔐 **Credenciales Predefinidas**

#### Coordinador
```
Usuario: admin
Contraseña: admin
```

#### Estudiantes de Ejemplo
```
Usuario: EK20183140703 | Contraseña: 123456 | Puntaje: 165
Usuario: EK20183030016 | Contraseña: 123456 | Puntaje: 245 (Con incentivos)
Usuario: EK20183047073 | Contraseña: 123456 | Puntaje: 220 (Con incentivos)
Usuario: EK20183236451 | Contraseña: 123456 | Puntaje: 75 (No puede graduarse)
```

## 🎨 Características Mejoradas de la Interfaz

### ✨ **Mejoras Visuales**
- **Diseño Moderno**: Gradientes y efectos visuales
- **Responsivo**: Adaptable a dispositivos móviles
- **Animaciones**: Transiciones suaves y efectos hover
- **Iconografía**: Font Awesome para mejor UX
- **Colores Semánticos**: Sistema de colores consistente

### 📊 **Dashboard Interactivo**
- **Gráficos en Tiempo Real**: Chart.js para visualizaciones
- **Estadísticas Dinámicas**: Métricas actualizadas automáticamente
- **Filtros Avanzados**: Búsqueda y filtrado inteligente
- **Alertas Contextuales**: Notificaciones informativas

### 🔍 **Funcionalidades Dinámicas**
- **Validación en Tiempo Real**: Formularios con feedback inmediato
- **Búsqueda Inteligente**: Filtros por nombre, documento, programa
- **Cálculo Automático**: Incentivos calculados dinámicamente
- **Estados Visuales**: Indicadores claros de graduabilidad

## 🧪 Datos de Prueba

El sistema incluye datos de ejemplo basados en el Excel proporcionado:
- **11 estudiantes** con diferentes puntajes
- **Variedad de casos**: Desde puntajes insuficientes hasta sobresalientes
- **Incentivos reales**: Ejemplos de cada categoría de beneficios
- **Programas académicos**: Enfocado en Ingeniería de Sistemas

## 📊 APIs Disponibles

### 🔑 **Autenticación**
```http
POST /auth/login
```

### 🎓 **Gestión de Resultados**
```http
GET /api/saber-pro/resultado/{documento}
POST /api/saber-pro/resultado
GET /api/saber-pro/estadisticas
GET /api/saber-pro/buscar?termino={valor}
GET /api/saber-pro/incentivos
GET /api/saber-pro/no-graduables
```

### 📈 **Análisis y Reportes**
```http
GET /api/saber-pro/estadisticas
POST /api/saber-pro/importar
POST /api/saber-pro/recalcular-incentivos
```

## 🔮 Funcionalidades Futuras

- 📤 **Exportación a Excel/PDF**
- 📧 **Notificaciones por email**  
- 📱 **Aplicación móvil**
- 🔐 **Autenticación avanzada (JWT)**
- 📊 **Reportes personalizables**
- 🌐 **Integración con sistemas institucionales**

## 👨‍💻 Desarrollado por

**Equipo de Desarrollo UTS**
- Análisis y diseño de arquitectura
- Implementación de funcionalidades core
- Diseño de interfaz de usuario
- Testing y documentación

## 📄 Licencia

Este proyecto es desarrollado para uso académico y institucional de las Unidades Tecnológicas de Santander (UTS).

---

### 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al área de desarrollo institucional.

**¡Sistema Saber Pro UTS - Transformando la gestión académica! 🚀**#   P r u e b a s _ S a b e r _ P r o  
 