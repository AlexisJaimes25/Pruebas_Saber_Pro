// Script para crear archivo Excel con datos completos de estudiantes
// Ejecutar en Node.js con: node crear_excel_estudiantes.js

const XLSX = require('xlsx');

const registros = [
    { documento: "EK20183301001", tipoDocumento: "CC", primerApellido: "MARTINEZ", segundoApellido: "LOPEZ", primerNombre: "ALEJANDRA", segundoNombre: "SOFIA", correoElectronico: "alejandra.martinez@uts.edu.co", numeroTelefono: "3201234567", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 185, comunicacionEscrita: 156, razonamientoCuantitativo: 178, lecturaCritica: 192, competenciasCiudadanas: 167, ingles: 188, formulacionProyectos: 175, disenoSoftware: 162 },
    { documento: "EK20183301002", tipoDocumento: "CC", primerApellido: "RODRIGUEZ", segundoApellido: "GARCIA", primerNombre: "CARLOS", segundoNombre: "ANDRES", correoElectronico: "carlos.rodriguez@uts.edu.co", numeroTelefono: "3109876543", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 220, comunicacionEscrita: 198, razonamientoCuantitativo: 205, lecturaCritica: 210, competenciasCiudadanas: 195, ingles: 225, formulacionProyectos: 180, disenoSoftware: 195 },
    { documento: "EK20183301003", tipoDocumento: "CC", primerApellido: "GONZALEZ", segundoApellido: "PEREZ", primerNombre: "MARIA", segundoNombre: "FERNANDA", correoElectronico: "maria.gonzalez@uts.edu.co", numeroTelefono: "3156789012", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 245, comunicacionEscrita: 230, razonamientoCuantitativo: 240, lecturaCritica: 235, competenciasCiudadanas: 225, ingles: 250, formulacionProyectos: 210, disenoSoftware: 220 },
    { documento: "EK20183301004", tipoDocumento: "CC", primerApellido: "HERNANDEZ", segundoApellido: "SANCHEZ", primerNombre: "JUAN", segundoNombre: "DAVID", correoElectronico: "juan.hernandez@uts.edu.co", numeroTelefono: "3187654321", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 165, comunicacionEscrita: 145, razonamientoCuantitativo: 170, lecturaCritica: 160, competenciasCiudadanas: 155, ingles: 165, formulacionProyectos: 150, disenoSoftware: 148 },
    { documento: "EK20183301005", tipoDocumento: "CC", primerApellido: "VALENCIA", segundoApellido: "TORRES", primerNombre: "ANA", segundoNombre: "LUCIA", correoElectronico: "ana.valencia@uts.edu.co", numeroTelefono: "3145678901", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 195, comunicacionEscrita: 175, razonamientoCuantitativo: 185, lecturaCritica: 190, competenciasCiudadanas: 180, ingles: 200, formulacionProyectos: 185, disenoSoftware: 175 },
    { documento: "EK20183301006", tipoDocumento: "CC", primerApellido: "MORALES", segundoApellido: "CASTILLO", primerNombre: "DIEGO", segundoNombre: "FERNANDO", correoElectronico: "diego.morales@uts.edu.co", numeroTelefono: "3123456789", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 142, comunicacionEscrita: 125, razonamientoCuantitativo: 135, lecturaCritica: 145, competenciasCiudadanas: 140, ingles: 150, formulacionProyectos: 138, disenoSoftware: 142 },
    { documento: "EK20183301007", tipoDocumento: "CC", primerApellido: "JIMENEZ", segundoApellido: "RIVERA", primerNombre: "NATALIA", segundoNombre: "ALEJANDRA", correoElectronico: "natalia.jimenez@uts.edu.co", numeroTelefono: "3112345678", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 205, comunicacionEscrita: 190, razonamientoCuantitativo: 200, lecturaCritica: 195, competenciasCiudadanas: 185, ingles: 210, formulacionProyectos: 195, disenoSoftware: 185 },
    { documento: "EK20183301008", tipoDocumento: "CC", primerApellido: "VARGAS", segundoApellido: "MENDOZA", primerNombre: "SEBASTIAN", segundoNombre: "CAMILO", correoElectronico: "sebastian.vargas@uts.edu.co", numeroTelefono: "3198765432", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 75, comunicacionEscrita: 85, razonamientoCuantitativo: 70, lecturaCritica: 80, competenciasCiudadanas: 75, ingles: 65, formulacionProyectos: 78, disenoSoftware: 82 },
    { documento: "EK20183301009", tipoDocumento: "CC", primerApellido: "CASTRO", segundoApellido: "FLORES", primerNombre: "DANIELA", segundoNombre: "PATRICIA", correoElectronico: "daniela.castro@uts.edu.co", numeroTelefono: "3176543210", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 158, comunicacionEscrita: 142, razonamientoCuantitativo: 155, lecturaCritica: 160, competenciasCiudadanas: 148, ingles: 162, formulacionProyectos: 145, disenoSoftware: 150 },
    { documento: "EK20183301010", tipoDocumento: "CC", primerApellido: "RAMOS", segundoApellido: "GUTIERREZ", primerNombre: "ANDRES", segundoNombre: "FELIPE", correoElectronico: "andres.ramos@uts.edu.co", numeroTelefono: "3165432109", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 178, comunicacionEscrita: 165, razonamientoCuantitativo: 172, lecturaCritica: 180, competenciasCiudadanas: 170, ingles: 175, formulacionProyectos: 168, disenoSoftware: 172 },
    { documento: "EK20183301011", tipoDocumento: "CC", primerApellido: "PATIÑO", segundoApellido: "QUINTERO", primerNombre: "LAURA", segundoNombre: "ISABEL", correoElectronico: "laura.patino@uts.edu.co", numeroTelefono: "3211230011", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 188, comunicacionEscrita: 170, razonamientoCuantitativo: 182, lecturaCritica: 176, competenciasCiudadanas: 168, ingles: 198, formulacionProyectos: 172, disenoSoftware: 165 },
    { documento: "EK20183301012", tipoDocumento: "CC", primerApellido: "MEJIA", segundoApellido: "SALAZAR", primerNombre: "JULIAN", segundoNombre: "ESTEBAN", correoElectronico: "julian.mejia@uts.edu.co", numeroTelefono: "3204560012", programaAcademico: "Ingeniería de Software", puntajeGlobal: 210, comunicacionEscrita: 185, razonamientoCuantitativo: 215, lecturaCritica: 205, competenciasCiudadanas: 190, ingles: 232, formulacionProyectos: 200, disenoSoftware: 208 },
    { documento: "EK20183301013", tipoDocumento: "CC", primerApellido: "ORTEGA", segundoApellido: "VELASQUEZ", primerNombre: "SOFIA", segundoNombre: "PAOLA", correoElectronico: "sofia.ortega@uts.edu.co", numeroTelefono: "3189000013", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 172, comunicacionEscrita: 150, razonamientoCuantitativo: 165, lecturaCritica: 170, competenciasCiudadanas: 160, ingles: 178, formulacionProyectos: 160, disenoSoftware: 158 },
    { documento: "EK20183301014", tipoDocumento: "CC", primerApellido: "BARRERA", segundoApellido: "MENDEZ", primerNombre: "ANDRES", segundoNombre: "MAURICIO", correoElectronico: "andres.barrera@uts.edu.co", numeroTelefono: "3152200014", programaAcademico: "Ingeniería en Telecomunicaciones", puntajeGlobal: 235, comunicacionEscrita: 220, razonamientoCuantitativo: 245, lecturaCritica: 238, competenciasCiudadanas: 222, ingles: 240, formulacionProyectos: 230, disenoSoftware: 226 },
    { documento: "EK20183301015", tipoDocumento: "CC", primerApellido: "PINZON", segundoApellido: "HERRERA", primerNombre: "MELISSA", segundoNombre: "JULIANA", correoElectronico: "melissa.pinzon@uts.edu.co", numeroTelefono: "3127890015", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 132, comunicacionEscrita: 118, razonamientoCuantitativo: 128, lecturaCritica: 130, competenciasCiudadanas: 125, ingles: 140, formulacionProyectos: 135, disenoSoftware: 130 },
    { documento: "EK20183301016", tipoDocumento: "CC", primerApellido: "ROJAS", segundoApellido: "AVILA", primerNombre: "CARLOTA", segundoNombre: "NATALIA", correoElectronico: "carlota.rojas@uts.edu.co", numeroTelefono: "3146670016", programaAcademico: "Ingeniería Industrial", puntajeGlobal: 165, comunicacionEscrita: 148, razonamientoCuantitativo: 170, lecturaCritica: 160, competenciasCiudadanas: 155, ingles: 172, formulacionProyectos: 158, disenoSoftware: 150 },
    { documento: "EK20183301017", tipoDocumento: "CC", primerApellido: "ARIZA", segundoApellido: "COTES", primerNombre: "LUIS", segundoNombre: "ALFONSO", correoElectronico: "luis.ariza@uts.edu.co", numeroTelefono: "3165540017", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 205, comunicacionEscrita: 192, razonamientoCuantitativo: 210, lecturaCritica: 200, competenciasCiudadanas: 188, ingles: 220, formulacionProyectos: 205, disenoSoftware: 210 },
    { documento: "EK20183301018", tipoDocumento: "CC", primerApellido: "MURCIA", segundoApellido: "GUZMAN", primerNombre: "VALENTINA", segundoNombre: "SOLEDAD", correoElectronico: "valentina.murcia@uts.edu.co", numeroTelefono: "3174430018", programaAcademico: "Ingeniería Ambiental", puntajeGlobal: 148, comunicacionEscrita: 130, razonamientoCuantitativo: 140, lecturaCritica: 150, competenciasCiudadanas: 142, ingles: 155, formulacionProyectos: 145, disenoSoftware: 140 },
    { documento: "EK20183301019", tipoDocumento: "CC", primerApellido: "NAVARRO", segundoApellido: "DIAZ", primerNombre: "JHON", segundoNombre: "FREDDY", correoElectronico: "jhon.navarro@uts.edu.co", numeroTelefono: "3108820019", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 180, comunicacionEscrita: 165, razonamientoCuantitativo: 182, lecturaCritica: 178, competenciasCiudadanas: 172, ingles: 188, formulacionProyectos: 180, disenoSoftware: 176 },
    { documento: "EK20183301020", tipoDocumento: "CC", primerApellido: "SALGADO", segundoApellido: "IBAÑEZ", primerNombre: "ANGELA", segundoNombre: "MARIA", correoElectronico: "angela.salgado@uts.edu.co", numeroTelefono: "3007710020", programaAcademico: "Ingeniería Electrónica", puntajeGlobal: 228, comunicacionEscrita: 210, razonamientoCuantitativo: 235, lecturaCritica: 226, competenciasCiudadanas: 214, ingles: 238, formulacionProyectos: 225, disenoSoftware: 222 },
    { documento: "EK20183301021", tipoDocumento: "CC", primerApellido: "GUERRERO", segundoApellido: "PAREDES", primerNombre: "MATEO", segundoNombre: "ADRIAN", correoElectronico: "mateo.guerrero@uts.edu.co", numeroTelefono: "3119930021", programaAcademico: "Ingeniería de Software", puntajeGlobal: 190, comunicacionEscrita: 172, razonamientoCuantitativo: 188, lecturaCritica: 185, competenciasCiudadanas: 176, ingles: 210, formulacionProyectos: 190, disenoSoftware: 198 },
    { documento: "EK20183301022", tipoDocumento: "CC", primerApellido: "SUAREZ", segundoApellido: "BOLIVAR", primerNombre: "DAYANA", segundoNombre: "CAROLINA", correoElectronico: "dayana.suarez@uts.edu.co", numeroTelefono: "3124560022", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 112, comunicacionEscrita: 100, razonamientoCuantitativo: 110, lecturaCritica: 108, competenciasCiudadanas: 104, ingles: 118, formulacionProyectos: 112, disenoSoftware: 108 },
    { documento: "EK20183301023", tipoDocumento: "CC", primerApellido: "CASTIBLANCO", segundoApellido: "MALDONADO", primerNombre: "SERGIO", segundoNombre: "ALEXANDER", correoElectronico: "sergio.castiblanco@uts.edu.co", numeroTelefono: "3138890023", programaAcademico: "Tecnología en Sistemas", puntajeGlobal: 152, comunicacionEscrita: 140, razonamientoCuantitativo: 150, lecturaCritica: 148, competenciasCiudadanas: 146, ingles: 160, formulacionProyectos: 150, disenoSoftware: 148 },
    { documento: "EK20183301024", tipoDocumento: "CC", primerApellido: "AVENDAÑO", segundoApellido: "RICO", primerNombre: "KAREN", segundoNombre: "LILIANA", correoElectronico: "karen.avendano@uts.edu.co", numeroTelefono: "3147760024", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 262, comunicacionEscrita: 240, razonamientoCuantitativo: 270, lecturaCritica: 260, competenciasCiudadanas: 250, ingles: 268, formulacionProyectos: 255, disenoSoftware: 262 },
    { documento: "EK20183301025", tipoDocumento: "CC", primerApellido: "TORO", segundoApellido: "SANDOVAL", primerNombre: "LEONARDO", segundoNombre: "DANIEL", correoElectronico: "leonardo.toro@uts.edu.co", numeroTelefono: "3156650025", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 174, comunicacionEscrita: 160, razonamientoCuantitativo: 178, lecturaCritica: 170, competenciasCiudadanas: 168, ingles: 182, formulacionProyectos: 174, disenoSoftware: 172 },
    { documento: "EK20183301026", tipoDocumento: "CC", primerApellido: "CELY", segundoApellido: "MARTINS", primerNombre: "GABRIELA", segundoNombre: "ANDREA", correoElectronico: "gabriela.cely@uts.edu.co", numeroTelefono: "3195540026", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 196, comunicacionEscrita: 182, razonamientoCuantitativo: 195, lecturaCritica: 190, competenciasCiudadanas: 186, ingles: 212, formulacionProyectos: 198, disenoSoftware: 194 },
    { documento: "EK20183301027", tipoDocumento: "CC", primerApellido: "FONSECA", segundoApellido: "PULIDO", primerNombre: "NICOLAS", segundoNombre: "SEBASTIAN", correoElectronico: "nicolas.fonseca@uts.edu.co", numeroTelefono: "3008820027", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 162, comunicacionEscrita: 150, razonamientoCuantitativo: 160, lecturaCritica: 158, competenciasCiudadanas: 152, ingles: 168, formulacionProyectos: 162, disenoSoftware: 160 },
    { documento: "EK20183301028", tipoDocumento: "CC", primerApellido: "CORREA", segundoApellido: "PEÑA", primerNombre: "YULIANA", segundoNombre: "ANDREA", correoElectronico: "yuliana.correa@uts.edu.co", numeroTelefono: "3019900028", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 0, comunicacionEscrita: 0, razonamientoCuantitativo: 0, lecturaCritica: 0, competenciasCiudadanas: 0, ingles: 0, formulacionProyectos: 0, disenoSoftware: 0 },
    { documento: "EK20183301029", tipoDocumento: "CC", primerApellido: "LOPEZ", segundoApellido: "ACOSTA", primerNombre: "CARLOS", segundoNombre: "MIGUEL", correoElectronico: "carlos.lopez@uts.edu.co", numeroTelefono: "3028810029", programaAcademico: "Ingeniería de Sistemas", puntajeGlobal: 0, comunicacionEscrita: 0, razonamientoCuantitativo: 0, lecturaCritica: 0, competenciasCiudadanas: 0, ingles: 0, formulacionProyectos: 0, disenoSoftware: 0 },
    { documento: "EK20183301030", tipoDocumento: "CC", primerApellido: "MARTINEZ", segundoApellido: "SUAREZ", primerNombre: "JESSICA", segundoNombre: "PAULA", correoElectronico: "jessica.martinez@uts.edu.co", numeroTelefono: "3037720030", programaAcademico: "Tecnología en Sistemas", puntajeGlobal: 0, comunicacionEscrita: 0, razonamientoCuantitativo: 0, lecturaCritica: 0, competenciasCiudadanas: 0, ingles: 0, formulacionProyectos: 0, disenoSoftware: 0 }
];

const calcularNivelGeneral = (puntaje) => {
    if (!Number.isFinite(puntaje)) return '';
    if (puntaje >= 180) return 'Nivel 4';
    if (puntaje >= 150) return 'Nivel 3';
    if (puntaje >= 120) return 'Nivel 2';
    return 'Nivel 1';
};

const calcularNivelIngles = (puntaje) => {
    if (!Number.isFinite(puntaje)) return '';
    if (puntaje >= 190) return 'B2';
    if (puntaje >= 160) return 'B1';
    if (puntaje >= 135) return 'A2';
    if (puntaje >= 110) return 'A1';
    return 'A0';
};

// Crear libro de trabajo
const workbook = XLSX.utils.book_new();

// Crear hoja de trabajo con los datos
const enriched = registros.map(registro => {
    const pensamiento = Math.round((registro.formulacionProyectos + registro.disenoSoftware) / 2);
    return {
        ...registro,
        pensamientoCientificoMatematicas: pensamiento,
        nivelGlobal: calcularNivelGeneral(registro.puntajeGlobal),
        nivelIngles: calcularNivelIngles(registro.ingles)
    };
});

const worksheet = XLSX.utils.json_to_sheet(enriched);

// Agregar la hoja al libro
XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");

// Guardar el archivo
XLSX.writeFile(workbook, "plantilla_estudiantes_completa.xlsx");

console.log("✅ Archivo Excel creado exitosamente: plantilla_estudiantes_completa.xlsx");
console.log("📊 Datos incluidos:");
console.log(`- ${registros.length} estudiantes basados en la tabla EK2018330100X`);
console.log("- Incluye niveles generales y de inglés calculados automáticamente");
console.log("- Se agregaron casos de examen anulado con puntajes en cero");
console.log("- Campos alineados con la importación del sistema");