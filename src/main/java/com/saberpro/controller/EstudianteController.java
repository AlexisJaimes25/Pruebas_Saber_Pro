package com.saberpro.controller;

import com.saberpro.model.Usuario;
import com.saberpro.repository.UsuarioRepository;
import com.saberpro.model.Usuario;
import com.saberpro.repository.UsuarioRepository;
import com.saberpro.model.EstudianteResultado;
import com.saberpro.repository.EstudianteResultadoRepository;
import com.saberpro.service.EstudianteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.io.InputStream;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class EstudianteController {
    @Autowired
    private UsuarioRepository usuarioRepo;
    
    @Autowired
    private EstudianteResultadoRepository estudianteRepo;
    
    @Autowired
    private EstudianteService estudianteService;
    // Eliminar estudiante
    @DeleteMapping("/resultados/{documento}")
    public void eliminarEstudiante(@PathVariable String documento) {
        EstudianteResultado estudiante = estudianteRepo.findByDocumento(documento);
        if (estudiante != null) {
            estudianteRepo.delete(estudiante);
        }
    }
    // Eliminar materia de un estudiante
    @DeleteMapping("/resultados/{documento}/notas/{materia}")
    public EstudianteResultado eliminarNota(@PathVariable String documento, @PathVariable String materia) {
        EstudianteResultado estudiante = estudianteRepo.findByDocumento(documento);
        if (estudiante == null) throw new RuntimeException("Estudiante no encontrado");
        if (estudiante.getNotas() != null) {
            String materiaNormalizada = normalizar(materia);
            estudiante.getNotas().removeIf(n -> normalizar(n.getMateria()).equals(materiaNormalizada));
        }
        return estudianteRepo.save(estudiante);

    }

    // Normaliza cadenas quitando tildes y pasando a minúsculas
    private String normalizar(String s) {
        if (s == null) return "";
        return java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
            .toLowerCase();
    }
    // Agregar materia a un estudiante
    @PatchMapping("/resultados/{documento}/notas")
    public EstudianteResultado actualizarNotas(@PathVariable String documento, @RequestBody java.util.Map<String, Object> payload) {
        EstudianteResultado estudiante = estudianteRepo.findByDocumento(documento);
        if (estudiante == null) throw new RuntimeException("Estudiante no encontrado");
        Object notasObj = payload.get("notas");
        if (!(notasObj instanceof java.util.List)) throw new RuntimeException("Notas inválidas");
        java.util.List<?> notasList = (java.util.List<?>) notasObj;
        java.util.List<com.saberpro.model.Nota> nuevasNotas = new java.util.ArrayList<>();
        for (Object n : notasList) {
            if (n instanceof java.util.Map) {
                java.util.Map<?,?> map = (java.util.Map<?,?>) n;
                String materia = map.get("materia") != null ? map.get("materia").toString() : null;
                Integer puntaje = null;
                try { puntaje = Integer.parseInt(map.get("puntaje").toString()); } catch (Exception ignored) {}
                String nivel = map.get("nivel") != null ? map.get("nivel").toString() : "";
                if (materia != null && puntaje != null) {
                    nuevasNotas.add(new com.saberpro.model.Nota(materia, puntaje, nivel));
                }
            }
        }
        estudiante.setNotas(nuevasNotas);
        return estudianteRepo.save(estudiante);
    }
    // Listar todos los estudiantes
    @GetMapping("/resultados")
    public java.util.List<EstudianteResultado> listarEstudiantes() {
        return estudianteRepo.findAll();
    }

    @GetMapping("/resultados/{documento}")
    public EstudianteResultado getResultado(@PathVariable String documento) {
        return estudianteRepo.findByDocumento(documento);
    }

    // Endpoint específico para reporte individual - coincide con la ruta del frontend
    @GetMapping("/estudiantes/resultado/{documento}")
    public ResponseEntity<EstudianteResultado> getEstudianteParaReporte(@PathVariable String documento) {
        System.out.println("🚨 ==========================================");
        System.out.println("🚨 === ENDPOINT REPORTE INDIVIDUAL LLAMADO ===");
        System.out.println("🚨 ==========================================");
        System.out.println("📋 URL completa: /api/estudiantes/resultado/" + documento);
        System.out.println("📋 Documento solicitado: '" + documento + "'");
        System.out.println("📋 Tipo de documento: " + documento.getClass().getSimpleName());
        System.out.println("📋 Longitud del documento: " + documento.length());
        System.out.println("📋 Timestamp: " + java.time.LocalDateTime.now());
        
        try {
            System.out.println("🔍 === INICIANDO BÚSQUEDA EN BASE DE DATOS ===");
            System.out.println("🔍 Usando servicio con logs detallados...");
            
            // Usar el servicio con logs detallados
            EstudianteResultado estudiante = estudianteService.findByDocumentoConLogs(documento);
            
            if (estudiante == null) {
                System.out.println("❌ === ESTUDIANTE DEFINITIVAMENTE NO ENCONTRADO ===");
                System.out.println("❌ El documento '" + documento + "' no existe en la base de datos");
                System.out.println("❌ Enviando respuesta 404...");
                return ResponseEntity.notFound().build();
            }
            
            // Si llegamos aquí, el estudiante fue encontrado
            System.out.println("✅ === ESTUDIANTE ENCONTRADO - PROCESANDO DATOS ===");
            System.out.println("✅ Documento: " + estudiante.getDocumento());
            System.out.println("✅ Nombre completo: " + estudiante.getNombreCompleto());
            System.out.println("✅ Correo: " + estudiante.getCorreoElectronico());
            System.out.println("✅ Teléfono: " + estudiante.getNumeroTelefono());
            System.out.println("✅ Programa: " + estudiante.getProgramaAcademico());
            System.out.println("✅ Tipo documento: " + estudiante.getTipoDocumento());
            System.out.println("✅ Puntaje Global: " + estudiante.getPuntajeGlobal());
            System.out.println("✅ Nivel ICFES: " + estudiante.getNivelIcfes());
            System.out.println("✅ Percentil: " + estudiante.getPercentil());
            
            // Análisis detallado de notas
            if (estudiante.getNotas() != null && !estudiante.getNotas().isEmpty()) {
                System.out.println("📊 === ANÁLISIS DE NOTAS PARA REPORTE ===");
                System.out.println("📊 Total de notas: " + estudiante.getNotas().size());
                
                for (int i = 0; i < estudiante.getNotas().size(); i++) {
                    var nota = estudiante.getNotas().get(i);
                    System.out.println("📊 Nota " + (i+1) + ":");
                    System.out.println("    - Materia: '" + nota.getMateria() + "'");
                    System.out.println("    - Puntaje: " + nota.getPuntaje());
                    System.out.println("    - Nivel: '" + nota.getNivel() + "'");
                }
                
                System.out.println("📊 Estructura JSON de notas: " + estudiante.getNotas().toString());
            } else {
                System.out.println("⚠️ === SIN NOTAS DISPONIBLES ===");
                System.out.println("⚠️ El estudiante no tiene notas registradas");
                System.out.println("⚠️ El reporte estará incompleto");
            }
            
            // Cálculo de incentivo
            String incentivo = calcularIncentivo(estudiante.getPuntajeGlobal());
            System.out.println("💰 Incentivo calculado: " + incentivo);
            
            System.out.println("🌐 === ENVIANDO RESPUESTA AL FRONTEND ===");
            System.out.println("🌐 Status: 200 OK");
            System.out.println("🌐 Content-Type: application/json");
            System.out.println("🌐 Datos del estudiante serializados exitosamente");
            System.out.println("🚨 ==========================================");
            System.out.println("🚨 === FIN ENDPOINT REPORTE INDIVIDUAL ===");
            System.out.println("🚨 ==========================================");
            
            return ResponseEntity.ok(estudiante);
            
        } catch (Exception e) {
            System.err.println("💥 === ERROR CRÍTICO EN ENDPOINT REPORTE ===");
            System.err.println("💥 Excepción: " + e.getClass().getSimpleName());
            System.err.println("💥 Mensaje: " + e.getMessage());
            System.err.println("💥 Stack trace:");
            e.printStackTrace();
            System.err.println("💥 Enviando respuesta 500...");
            
            return ResponseEntity.status(500).build();
        }
    }

    // Crear estudiante
    @PostMapping("/resultados")
    public EstudianteResultado crearEstudiante(@RequestBody EstudianteResultado estudiante) {
        System.out.println("🆕 [CREAR ESTUDIANTE] Iniciando creación de estudiante");
        System.out.println("🆕 [CREAR ESTUDIANTE] Documento: " + estudiante.getDocumento());
        System.out.println("🆕 [CREAR ESTUDIANTE] Nombre: " + estudiante.getNombreCompleto());
        
        // Mapear campos del frontend a los del modelo
        if (estudiante.getNombreCompleto() == null || estudiante.getNombreCompleto().isEmpty()) {
            // Si viene como "nombre", mapearlo
            try {
                java.lang.reflect.Field f = estudiante.getClass().getDeclaredField("nombre");
                f.setAccessible(true);
                Object nombre = f.get(estudiante);
                if (nombre != null) estudiante.setNombreCompleto(nombre.toString());
            } catch (Exception ignored) {}
        }
        // Si no viene programaAcademico, poner uno por defecto
        if (estudiante.getProgramaAcademico() == null) {
            estudiante.setProgramaAcademico("");
        }
        
        System.out.println("🆕 [CREAR ESTUDIANTE] Llamando a crearUsuarioAutomatico...");
        // Crear usuario automáticamente si no existe
        crearUsuarioAutomatico(estudiante.getDocumento());
        
        System.out.println("🆕 [CREAR ESTUDIANTE] Guardando estudiante en BD...");
        EstudianteResultado estudianteGuardado = estudianteRepo.save(estudiante);
        System.out.println("✅ [CREAR ESTUDIANTE] Estudiante guardado exitosamente");
        
        return estudianteGuardado;
    }

    // Actualizar estudiante
    @PutMapping("/resultados/{documento}")
    public EstudianteResultado actualizarEstudiante(@PathVariable String documento, @RequestBody EstudianteResultado estudiante) {
        System.out.println("=== ACTUALIZANDO ESTUDIANTE ===");
        System.out.println("Documento: " + documento);
        System.out.println("Datos recibidos:");
        System.out.println("  - Nombre: " + estudiante.getNombreCompleto());
        System.out.println("  - Programa: " + estudiante.getProgramaAcademico());
        System.out.println("  - Puntaje Global: " + estudiante.getPuntajeGlobal());
        
        if (estudiante.getNotas() != null) {
            System.out.println("  - Notas recibidas (" + estudiante.getNotas().size() + "):");
            for (int i = 0; i < estudiante.getNotas().size(); i++) {
                var nota = estudiante.getNotas().get(i);
                System.out.println("    Nota " + (i+1) + ": [" + nota.getMateria() + "] = " + nota.getPuntaje());
            }
        } else {
            System.out.println("  - ⚠️ NO SE RECIBIERON NOTAS");
        }
        
        EstudianteResultado existente = estudianteRepo.findByDocumento(documento);
        if (existente != null) {
            System.out.println("Estudiante existente encontrado, actualizando...");
            // Mapear campos del frontend a los del modelo
            if (estudiante.getNombreCompleto() == null || estudiante.getNombreCompleto().isEmpty()) {
                try {
                    java.lang.reflect.Field f = estudiante.getClass().getDeclaredField("nombre");
                    f.setAccessible(true);
                    Object nombre = f.get(estudiante);
                    if (nombre != null) existente.setNombreCompleto(nombre.toString());
                } catch (Exception ignored) {}
            } else {
                existente.setNombreCompleto(estudiante.getNombreCompleto());
            }
            if (estudiante.getProgramaAcademico() != null) {
                existente.setProgramaAcademico(estudiante.getProgramaAcademico());
            }
            existente.setPuntajeGlobal(estudiante.getPuntajeGlobal());
            existente.setNotas(estudiante.getNotas());
            
            EstudianteResultado resultado = estudianteRepo.save(existente);
            System.out.println("✅ Estudiante actualizado exitosamente");
            System.out.println("=== FIN ACTUALIZAR ESTUDIANTE ===");
            return resultado;
        } else {
            System.out.println("Estudiante no existe, creando nuevo...");
            
            // 🆕 Crear usuario automáticamente si no existe
            crearUsuarioAutomatico(estudiante.getDocumento());
            
            EstudianteResultado resultado = estudianteRepo.save(estudiante);
            System.out.println("✅ Nuevo estudiante creado");
            System.out.println("=== FIN ACTUALIZAR ESTUDIANTE ===");
            return resultado;
        }
    }

    private String calcularIncentivo(Integer puntaje) {
        if (puntaje == null) return "Sin Incentivo";
        if (puntaje > 241) return "Incentivo Máximo";
        if (puntaje >= 211) return "Incentivo Medio";
        if (puntaje >= 180) return "Incentivo Bajo";
        return "Sin Incentivo";
    }

    // 🆕 Método auxiliar para crear usuarios automáticamente
    private void crearUsuarioAutomatico(String documento) {
        System.out.println("🔍 [USUARIO AUTO] Iniciando verificación para documento: " + documento);
        
        try {
            if (documento == null || documento.trim().isEmpty()) {
                System.out.println("❌ [USUARIO AUTO] Documento es null o vacío");
                return;
            }
            
            documento = documento.trim(); // Limpiar espacios
            System.out.println("🔍 [USUARIO AUTO] Verificando si existe usuario con documento: " + documento);
            
            Optional<Usuario> usuarioExistente = usuarioRepo.findByDocumento(documento);
            if (usuarioExistente.isPresent()) {
                System.out.println("ℹ️ [USUARIO AUTO] Usuario ya existe para documento: " + documento);
                System.out.println("ℹ️ [USUARIO AUTO] Usuario existente - Rol: " + usuarioExistente.get().getRol());
                return;
            }
            
            System.out.println("📝 [USUARIO AUTO] Creando nuevo usuario para documento: " + documento);
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setDocumento(documento);
            nuevoUsuario.setRol("ESTUDIANTE");
            nuevoUsuario.setPassword(documento); // Contraseña igual al documento
            
            Usuario usuarioGuardado = usuarioRepo.save(nuevoUsuario);
            System.out.println("✅ [USUARIO AUTO] Usuario creado exitosamente:");
            System.out.println("   - Documento: " + usuarioGuardado.getDocumento());
            System.out.println("   - Rol: " + usuarioGuardado.getRol());
            
        } catch (Exception e) {
            System.err.println("❌ [USUARIO AUTO] Error al crear usuario automático:");
            System.err.println("   - Documento: " + documento);
            System.err.println("   - Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Endpoint para importar estudiantes desde archivo Excel
    @PostMapping("/resultados/importar")
    public ResponseEntity<Map<String, Object>> importarEstudiantes(@RequestParam("archivo") MultipartFile archivo) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (archivo.isEmpty()) {
                response.put("error", "El archivo está vacío");
                return ResponseEntity.badRequest().body(response);
            }
            
            List<EstudianteResultado> estudiantesImportados = procesarArchivoExcel(archivo);
            
            // Guardar estudiantes en la base de datos
            int importados = 0;
            for (EstudianteResultado estudiante : estudiantesImportados) {
                try {
                    // Crear usuario automáticamente si no existe
                    crearUsuarioAutomatico(estudiante.getDocumento());
                    
                    // Verificar si el estudiante ya existe
                    EstudianteResultado existente = estudianteRepo.findByDocumento(estudiante.getDocumento());
                    if (existente != null) {
                        // Actualizar datos existentes
                        actualizarDatosEstudiante(existente, estudiante);
                        estudianteRepo.save(existente);
                    } else {
                        // Crear nuevo estudiante
                        estudianteRepo.save(estudiante);
                    }
                    importados++;
                } catch (Exception e) {
                    System.err.println("Error al guardar estudiante " + estudiante.getDocumento() + ": " + e.getMessage());
                }
            }
            
            response.put("mensaje", "Importación completada exitosamente");
            response.put("importados", importados);
            response.put("total", estudiantesImportados.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", "Error al procesar el archivo: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    private List<EstudianteResultado> procesarArchivoExcel(MultipartFile archivo) throws Exception {
        List<EstudianteResultado> estudiantes = new ArrayList<>();
        
        try (InputStream inputStream = archivo.getInputStream()) {
            Workbook workbook;
            
            // Determinar el tipo de archivo Excel
            if (archivo.getOriginalFilename().endsWith(".xlsx")) {
                workbook = new XSSFWorkbook(inputStream);
            } else if (archivo.getOriginalFilename().endsWith(".xls")) {
                workbook = new HSSFWorkbook(inputStream);
            } else {
                throw new IllegalArgumentException("Formato de archivo no soportado");
            }
            
            Sheet sheet = workbook.getSheetAt(0); // Tomar la primera hoja
            
            // Saltar la primera fila (encabezados)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    EstudianteResultado estudiante = procesarFilaExcel(row);
                    if (estudiante != null) {
                        estudiantes.add(estudiante);
                    }
                }
            }
            
            workbook.close();
        }
        
        return estudiantes;
    }
    
    private EstudianteResultado procesarFilaExcel(Row row) {
        try {
            EstudianteResultado estudiante = new EstudianteResultado();
            
            // Leer campos según el orden de la plantilla
            estudiante.setDocumento(getCellValueAsString(row.getCell(0))); // documento
            // tipoDocumento en columna 1 - no lo usamos en el modelo actual
            String primerApellido = getCellValueAsString(row.getCell(2));
            String segundoApellido = getCellValueAsString(row.getCell(3));
            String primerNombre = getCellValueAsString(row.getCell(4));
            String segundoNombre = getCellValueAsString(row.getCell(5));
            
            // Construir nombre completo
            StringBuilder nombreCompleto = new StringBuilder();
            if (primerNombre != null && !primerNombre.isEmpty()) nombreCompleto.append(primerNombre);
            if (segundoNombre != null && !segundoNombre.isEmpty()) nombreCompleto.append(" ").append(segundoNombre);
            if (primerApellido != null && !primerApellido.isEmpty()) nombreCompleto.append(" ").append(primerApellido);
            if (segundoApellido != null && !segundoApellido.isEmpty()) nombreCompleto.append(" ").append(segundoApellido);
            
            estudiante.setNombreCompleto(nombreCompleto.toString().trim());
            
            // Otros campos
            // correoElectronico en columna 6 - no lo usamos en el modelo actual
            // numeroTelefono en columna 7 - no lo usamos en el modelo actual
            estudiante.setProgramaAcademico(getCellValueAsString(row.getCell(8))); // programaAcademico
            estudiante.setPuntajeGlobal(getCellValueAsInteger(row.getCell(9))); // puntajeGlobal
            
            // Crear lista de notas con las competencias
            List<com.saberpro.model.Nota> notas = new ArrayList<>();
            
            // Competencias genéricas
            Integer comunicacionEscrita = getCellValueAsInteger(row.getCell(10));
            if (comunicacionEscrita != null) notas.add(new com.saberpro.model.Nota("Comunicación Escrita", comunicacionEscrita, calcularNivel(comunicacionEscrita)));
            
            Integer razonamientoCuantitativo = getCellValueAsInteger(row.getCell(11));
            if (razonamientoCuantitativo != null) notas.add(new com.saberpro.model.Nota("Razonamiento Cuantitativo", razonamientoCuantitativo, calcularNivel(razonamientoCuantitativo)));
            
            Integer lecturaCritica = getCellValueAsInteger(row.getCell(12));
            if (lecturaCritica != null) notas.add(new com.saberpro.model.Nota("Lectura Crítica", lecturaCritica, calcularNivel(lecturaCritica)));
            
            Integer competenciasCiudadanas = getCellValueAsInteger(row.getCell(13));
            if (competenciasCiudadanas != null) notas.add(new com.saberpro.model.Nota("Competencias Ciudadanas", competenciasCiudadanas, calcularNivel(competenciasCiudadanas)));
            
            Integer ingles = getCellValueAsInteger(row.getCell(14));
            if (ingles != null) notas.add(new com.saberpro.model.Nota("Inglés", ingles, calcularNivel(ingles)));
            
            // Competencias específicas
            Integer formulacionProyectos = getCellValueAsInteger(row.getCell(15));
            if (formulacionProyectos != null) notas.add(new com.saberpro.model.Nota("Formulación de Proyectos de Ingeniería", formulacionProyectos, calcularNivel(formulacionProyectos)));
            
            Integer disenoSoftware = getCellValueAsInteger(row.getCell(16));
            if (disenoSoftware != null) notas.add(new com.saberpro.model.Nota("Diseño de Software", disenoSoftware, calcularNivel(disenoSoftware)));
            
            estudiante.setNotas(notas);
            
            // Calcular estado de incentivos
            estudiante.setEstadoIncentivos(calcularIncentivo(estudiante.getPuntajeGlobal()));
            
            return estudiante;
            
        } catch (Exception e) {
            System.err.println("Error al procesar fila: " + e.getMessage());
            return null;
        }
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }
    
    private Integer getCellValueAsInteger(Cell cell) {
        if (cell == null) return null;
        
        try {
            switch (cell.getCellType()) {
                case STRING:
                    String stringValue = cell.getStringCellValue().trim();
                    return stringValue.isEmpty() ? null : Integer.parseInt(stringValue);
                case NUMERIC:
                    return (int) cell.getNumericCellValue();
                case FORMULA:
                    return (int) cell.getNumericCellValue();
                default:
                    return null;
            }
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private String calcularNivel(Integer puntaje) {
        if (puntaje == null) return "Sin Evaluar";
        if (puntaje >= 241) return "Excelente";
        if (puntaje >= 211) return "Muy Bueno";
        if (puntaje >= 180) return "Bueno";
        if (puntaje >= 150) return "Regular";
        return "Deficiente";
    }
    
    private void actualizarDatosEstudiante(EstudianteResultado existente, EstudianteResultado nuevo) {
        if (nuevo.getNombreCompleto() != null && !nuevo.getNombreCompleto().isEmpty()) {
            existente.setNombreCompleto(nuevo.getNombreCompleto());
        }
        if (nuevo.getProgramaAcademico() != null && !nuevo.getProgramaAcademico().isEmpty()) {
            existente.setProgramaAcademico(nuevo.getProgramaAcademico());
        }
        if (nuevo.getPuntajeGlobal() != null) {
            existente.setPuntajeGlobal(nuevo.getPuntajeGlobal());
        }
        if (nuevo.getNotas() != null && !nuevo.getNotas().isEmpty()) {
            existente.setNotas(nuevo.getNotas());
        }
        if (nuevo.getEstadoIncentivos() != null) {
            existente.setEstadoIncentivos(nuevo.getEstadoIncentivos());
        }
    }

    // Endpoint temporal para corregir datos del estudiante 1097302429
    @PostMapping("/estudiantes/corregir/{documento}")
    public ResponseEntity<String> corregirEstudianteDatos(@PathVariable String documento) {
        System.out.println("🔧 === CORRIGIENDO DATOS DEL ESTUDIANTE ===");
        System.out.println("🔧 Documento: " + documento);
        
        try {
            EstudianteResultado estudiante = estudianteRepo.findByDocumento(documento);
            
            if (estudiante == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Corregir datos específicos para el estudiante 1097302429
            if ("1097302429".equals(documento)) {
                System.out.println("🔧 Aplicando correcciones específicas...");
                
                // Corregir nombre
                estudiante.setNombreCompleto("Alexis Fabians Jaimes Vergels");
                
                // Crear notas más realistas con niveles calculados
                List<com.saberpro.model.Nota> notasCorregidas = new ArrayList<>();
                notasCorregidas.add(new com.saberpro.model.Nota("Comunicación Escrita", 180, "Bueno"));
                notasCorregidas.add(new com.saberpro.model.Nota("Razonamiento Cuantitativo", 175, "Regular"));
                notasCorregidas.add(new com.saberpro.model.Nota("Lectura Crítica", 165, "Regular"));
                notasCorregidas.add(new com.saberpro.model.Nota("Competencias Ciudadanas", 170, "Regular"));
                notasCorregidas.add(new com.saberpro.model.Nota("Inglés", 185, "B1"));
                notasCorregidas.add(new com.saberpro.model.Nota("Formulación de Proyectos de Ingeniería", 160, "Nivel 2"));
                notasCorregidas.add(new com.saberpro.model.Nota("Diseño de Software", 172, "Nivel 2"));
                
                estudiante.setNotas(notasCorregidas);
                
                // Calcular puntaje global realista (promedio)
                int sumaPuntajes = notasCorregidas.stream()
                    .mapToInt(com.saberpro.model.Nota::getPuntaje)
                    .sum();
                int puntajeGlobal = sumaPuntajes / notasCorregidas.size();
                estudiante.setPuntajeGlobal(puntajeGlobal);
                
                // Establecer otros campos
                estudiante.setNivelIcfes("Bueno");
                estudiante.setPercentil(75);
                
                // Guardar cambios
                estudianteRepo.save(estudiante);
                
                System.out.println("✅ Datos corregidos exitosamente:");
                System.out.println("✅ Nombre: " + estudiante.getNombreCompleto());
                System.out.println("✅ Puntaje Global: " + estudiante.getPuntajeGlobal());
                System.out.println("✅ Nivel ICFES: " + estudiante.getNivelIcfes());
                System.out.println("✅ Percentil: " + estudiante.getPercentil());
                System.out.println("✅ Total de notas: " + estudiante.getNotas().size());
                
                return ResponseEntity.ok("Datos corregidos exitosamente");
            }
            
            return ResponseEntity.badRequest().body("No hay correcciones definidas para este estudiante");
            
        } catch (Exception e) {
            System.err.println("💥 Error al corregir datos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error interno: " + e.getMessage());
        }
    }

    // 🆕 Endpoint para obtener perfil completo del estudiante logueado
    @GetMapping("/estudiante/perfil/{documento}")
    public ResponseEntity<Map<String, Object>> getPerfilEstudiante(@PathVariable String documento) {
        System.out.println("👤 === OBTENIENDO PERFIL ESTUDIANTE ===");
        System.out.println("👤 Documento: " + documento);
        
        try {
            // Obtener datos del estudiante
            EstudianteResultado estudiante = estudianteRepo.findByDocumento(documento);
            if (estudiante == null) {
                System.out.println("❌ Estudiante no encontrado: " + documento);
                return ResponseEntity.notFound().build();
            }
            
            // Obtener incentivos del estudiante (usando el controlador de incentivos)
            // Por ahora retornamos solo los datos básicos, luego integraremos incentivos
            Map<String, Object> perfil = new HashMap<>();
            perfil.put("estudiante", estudiante);
            perfil.put("documento", documento);
            perfil.put("nombreCompleto", estudiante.getPrimerNombre() + " " + estudiante.getPrimerApellido());
            perfil.put("programa", estudiante.getProgramaAcademico());
            perfil.put("puntajeGlobal", estudiante.getPuntajeGlobal());
            perfil.put("correo", estudiante.getCorreoElectronico());
            perfil.put("telefono", estudiante.getNumeroTelefono());
            
            System.out.println("✅ Perfil obtenido para: " + estudiante.getPrimerNombre() + " " + estudiante.getPrimerApellido());
            return ResponseEntity.ok(perfil);
            
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo perfil: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
