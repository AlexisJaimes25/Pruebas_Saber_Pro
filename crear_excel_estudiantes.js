// Script para crear archivo Excel con datos completos de estudiantes
// Ejecutar en Node.js con: node crear_excel_estudiantes.js

const XLSX = require('xlsx');

// Datos de estudiantes completos con variedad en puntajes para probar diferentes incentivos
const estudiantes = [
    {
        documento: "1234567890",
        tipoDocumento: "CC",
        primerApellido: "García",
        segundoApellido: "López",
        primerNombre: "María",
        segundoNombre: "Elena",
        correoElectronico: "maria.garcia@estudiante.edu.co",
        numeroTelefono: "3001234567",
        programaAcademico: "Ingeniería de Sistemas",
        puntajeGlobal: 280,
        comunicacionEscrita: 75,
        razonamientoCuantitativo: 85,
        lecturaCritica: 80,
        competenciasCiudadanas: 70,
        ingles: 90,
        formulacionProyectos: 88,
        disenoSoftware: 92
    },
    {
        documento: "9876543210",
        tipoDocumento: "CC",
        primerApellido: "Rodríguez",
        segundoApellido: "Martínez",
        primerNombre: "Carlos",
        segundoNombre: "Andrés",
        correoElectronico: "carlos.rodriguez@estudiante.edu.co",
        numeroTelefono: "3109876543",
        programaAcademico: "Ingeniería de Software",
        puntajeGlobal: 195,
        comunicacionEscrita: 60,
        razonamientoCuantitativo: 65,
        lecturaCritica: 58,
        competenciasCiudadanas: 62,
        ingles: 70,
        formulacionProyectos: 75,
        disenoSoftware: 78
    },
    {
        documento: "1122334455",
        tipoDocumento: "CC",
        primerApellido: "Pérez",
        segundoApellido: "Gómez",
        primerNombre: "Ana",
        segundoNombre: "Sofía",
        correoElectronico: "ana.perez@estudiante.edu.co",
        numeroTelefono: "3201122334",
        programaAcademico: "Tecnología en Sistemas",
        puntajeGlobal: 120,
        comunicacionEscrita: 45,
        razonamientoCuantitativo: 40,
        lecturaCritica: 42,
        competenciasCiudadanas: 38,
        ingles: 35,
        formulacionProyectos: 50,
        disenoSoftware: 55
    },
    {
        documento: "5566778899",
        tipoDocumento: "CC",
        primerApellido: "Torres",
        segundoApellido: "Silva",
        primerNombre: "Luis",
        segundoNombre: "Fernando",
        correoElectronico: "luis.torres@estudiante.edu.co",
        numeroTelefono: "3155566778",
        programaAcademico: "Ingeniería de Sistemas",
        puntajeGlobal: 260,
        comunicacionEscrita: 70,
        razonamientoCuantitativo: 80,
        lecturaCritica: 75,
        competenciasCiudadanas: 68,
        ingles: 85,
        formulacionProyectos: 82,
        disenoSoftware: 88
    },
    {
        documento: "7788990011",
        tipoDocumento: "TI",
        primerApellido: "Hernández",
        segundoApellido: "Ruiz",
        primerNombre: "Camila",
        segundoNombre: "",
        correoElectronico: "camila.hernandez@estudiante.edu.co",
        numeroTelefono: "3047788990",
        programaAcademico: "Tecnología en Desarrollo de Software",
        puntajeGlobal: 85,
        comunicacionEscrita: 30,
        razonamientoCuantitativo: 25,
        lecturaCritica: 28,
        competenciasCiudadanas: 22,
        ingles: 18,
        formulacionProyectos: 35,
        disenoSoftware: 40
    },
    {
        documento: "2233445566",
        tipoDocumento: "CC",
        primerApellido: "Vargas",
        segundoApellido: "Morales",
        primerNombre: "Diego",
        segundoNombre: "Alejandro",
        correoElectronico: "diego.vargas@estudiante.edu.co",
        numeroTelefono: "3162233445",
        programaAcademico: "Ingeniería de Software",
        puntajeGlobal: 225,
        comunicacionEscrita: 65,
        razonamientoCuantitativo: 70,
        lecturaCritica: 68,
        competenciasCiudadanas: 60,
        ingles: 75,
        formulacionProyectos: 78,
        disenoSoftware: 80
    },
    {
        documento: "3344556677",
        tipoDocumento: "CE",
        primerApellido: "Castro",
        segundoApellido: "Jiménez",
        primerNombre: "Isabella",
        segundoNombre: "Valentina",
        correoElectronico: "isabella.castro@estudiante.edu.co",
        numeroTelefono: "3173344556",
        programaAcademico: "Ingeniería de Sistemas",
        puntajeGlobal: 295,
        comunicacionEscrita: 85,
        razonamientoCuantitativo: 90,
        lecturaCritica: 88,
        competenciasCiudadanas: 82,
        ingles: 95,
        formulacionProyectos: 93,
        disenoSoftware: 98
    },
    {
        documento: "4455667788",
        tipoDocumento: "CC",
        primerApellido: "Mendoza",
        segundoApellido: "Romero",
        primerNombre: "Sebastián",
        segundoNombre: "David",
        correoElectronico: "sebastian.mendoza@estudiante.edu.co",
        numeroTelefono: "3084455667",
        programaAcademico: "Tecnología en Informática",
        puntajeGlobal: 155,
        comunicacionEscrita: 50,
        razonamientoCuantitativo: 55,
        lecturaCritica: 48,
        competenciasCiudadanas: 45,
        ingles: 52,
        formulacionProyectos: 60,
        disenoSoftware: 65
    }
];

// Crear libro de trabajo
const workbook = XLSX.utils.book_new();

// Crear hoja de trabajo con los datos
const worksheet = XLSX.utils.json_to_sheet(estudiantes);

// Agregar la hoja al libro
XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");

// Guardar el archivo
XLSX.writeFile(workbook, "plantilla_estudiantes_completa.xlsx");

console.log("✅ Archivo Excel creado exitosamente: plantilla_estudiantes_completa.xlsx");
console.log("📊 Datos incluidos:");
console.log("- 8 estudiantes con datos completos");
console.log("- Variedad en puntajes para probar diferentes incentivos");
console.log("- Todos los campos requeridos por el modal");
console.log("- Datos realistas y bien formateados");