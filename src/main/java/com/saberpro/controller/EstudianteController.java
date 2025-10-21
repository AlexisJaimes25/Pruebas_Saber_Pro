package com.saberpro.controller;

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
        eliminarUsuarioAsociado(documento);
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
                if (materia != null && puntaje != null) {
                    nuevasNotas.add(new com.saberpro.model.Nota(materia, puntaje, calcularNivelMateria(materia, puntaje)));
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
        try {
            EstudianteResultado estudiante = estudianteService.findByDocumentoConLogs(documento);
            
            if (estudiante == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(estudiante);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Crear estudiante
    @PostMapping("/resultados")
    public EstudianteResultado crearEstudiante(@RequestBody EstudianteResultado estudiante) {
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
        estudiante.setNotas(recalcularNivelesNotas(estudiante.getNotas()));
        // Crear usuario automáticamente si no existe
        crearUsuarioAutomatico(estudiante.getDocumento());
        return estudianteRepo.save(estudiante);
    }

    // Actualizar estudiante
    @PutMapping("/resultados/{documento}")
    public EstudianteResultado actualizarEstudiante(@PathVariable String documento, @RequestBody EstudianteResultado estudiante) {
        EstudianteResultado existente = estudianteRepo.findByDocumento(documento);
        if (existente != null) {
            // Mapear campos del frontend a los del modelo
            if (estudiante.getTipoDocumento() != null) existente.setTipoDocumento(estudiante.getTipoDocumento());
            if (estudiante.getPrimerNombre() != null) existente.setPrimerNombre(estudiante.getPrimerNombre());
            if (estudiante.getSegundoNombre() != null) existente.setSegundoNombre(estudiante.getSegundoNombre());
            if (estudiante.getPrimerApellido() != null) existente.setPrimerApellido(estudiante.getPrimerApellido());
            if (estudiante.getSegundoApellido() != null) existente.setSegundoApellido(estudiante.getSegundoApellido());
            if (estudiante.getCorreoElectronico() != null) existente.setCorreoElectronico(estudiante.getCorreoElectronico());
            if (estudiante.getNumeroTelefono() != null) existente.setNumeroTelefono(estudiante.getNumeroTelefono());

            // Reconstruir nombre completo con los campos individuales recibidos
            existente.setNombreCompleto(construirNombreCompleto(existente));
            if (estudiante.getProgramaAcademico() != null) {
                existente.setProgramaAcademico(estudiante.getProgramaAcademico());
            }
            existente.setPuntajeGlobal(estudiante.getPuntajeGlobal());
                existente.setNotas(recalcularNivelesNotas(estudiante.getNotas()));
            
            return estudianteRepo.save(existente);
        } else {
            // 🆕 Crear usuario automáticamente si no existe
            crearUsuarioAutomatico(estudiante.getDocumento());
            
            estudiante.setNombreCompleto(construirNombreCompleto(estudiante));
            return estudianteRepo.save(estudiante);
        }
    }

    private String construirNombreCompleto(EstudianteResultado estudiante) {
        StringBuilder nombre = new StringBuilder();
        if (estudiante.getPrimerNombre() != null && !estudiante.getPrimerNombre().isBlank()) {
            nombre.append(estudiante.getPrimerNombre().trim()).append(" ");
        }
        if (estudiante.getSegundoNombre() != null && !estudiante.getSegundoNombre().isBlank()) {
            nombre.append(estudiante.getSegundoNombre().trim()).append(" ");
        }
        if (estudiante.getPrimerApellido() != null && !estudiante.getPrimerApellido().isBlank()) {
            nombre.append(estudiante.getPrimerApellido().trim()).append(" ");
        }
        if (estudiante.getSegundoApellido() != null && !estudiante.getSegundoApellido().isBlank()) {
            nombre.append(estudiante.getSegundoApellido().trim());
        }
        return nombre.toString().trim();
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
        try {
            if (documento == null || documento.trim().isEmpty()) {
                return;
            }
            
            documento = documento.trim();

            Optional<Usuario> usuarioExistente = usuarioRepo.findByDocumento(documento);
            if (usuarioExistente.isPresent()) {
                return;
            }
            
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setDocumento(documento);
            nuevoUsuario.setRol("ESTUDIANTE");
            nuevoUsuario.setPassword(documento); // Contraseña igual al documento
            
            usuarioRepo.save(nuevoUsuario);
        } catch (Exception e) {
            // Ignorar creación automática fallida, ya que no debe bloquear el flujo principal
        }
    }

    private void eliminarUsuarioAsociado(String documento) {
        try {
            if (documento == null || documento.trim().isEmpty()) {
                return;
            }

            String docNormalizado = documento.trim();
            usuarioRepo.findByDocumento(docNormalizado)
                .filter(usuario -> usuario.getRol() == null || !"COORDINADOR".equalsIgnoreCase(usuario.getRol()))
                .ifPresent(usuarioRepo::delete);
        } catch (Exception ignored) {
            // No bloquear la eliminación de estudiantes si no se puede eliminar el usuario asociado
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

            String nombreArchivo = archivo.getOriginalFilename();
            if (nombreArchivo == null) {
                response.put("error", "El archivo no tiene un nombre válido");
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
                    // Ignora el error para continuar con el resto de estudiantes
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
            String nombreArchivo = archivo.getOriginalFilename();
            if (nombreArchivo == null) {
                throw new IllegalArgumentException("El archivo no tiene un nombre válido");
            }

            if (nombreArchivo.endsWith(".xlsx")) {
                workbook = new XSSFWorkbook(inputStream);
            } else if (nombreArchivo.endsWith(".xls")) {
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

            // Leer campos según el orden de la plantilla y mapearlos al modelo
            estudiante.setDocumento(getCellValueAsString(row.getCell(0))); // documento
            estudiante.setTipoDocumento(getCellValueAsString(row.getCell(1))); // tipoDocumento

            String primerApellido = getCellValueAsString(row.getCell(2));
            String segundoApellido = getCellValueAsString(row.getCell(3));
            String primerNombre = getCellValueAsString(row.getCell(4));
            String segundoNombre = getCellValueAsString(row.getCell(5));

            estudiante.setPrimerApellido(primerApellido);
            estudiante.setSegundoApellido(segundoApellido);
            estudiante.setPrimerNombre(primerNombre);
            estudiante.setSegundoNombre(segundoNombre);

            estudiante.setCorreoElectronico(getCellValueAsString(row.getCell(6)));
            estudiante.setNumeroTelefono(getCellValueAsString(row.getCell(7)));

            // Construir nombre completo a partir de los campos individuales
            estudiante.setNombreCompleto(construirNombreCompleto(estudiante));

            estudiante.setProgramaAcademico(getCellValueAsString(row.getCell(8))); // programaAcademico
            Integer puntajeGlobal = getCellValueAsInteger(row.getCell(9));
            estudiante.setPuntajeGlobal(puntajeGlobal != null ? puntajeGlobal : 0); // puntajeGlobal

            // Crear lista de notas con las competencias en el mismo orden que el frontend
            List<com.saberpro.model.Nota> notas = new ArrayList<>();

            agregarNota(notas, "Comunicación Escrita", getCellValueAsInteger(row.getCell(10)));
            agregarNota(notas, "Razonamiento Cuantitativo", getCellValueAsInteger(row.getCell(11)));
            agregarNota(notas, "Lectura Crítica", getCellValueAsInteger(row.getCell(12)));
            agregarNota(notas, "Competencias Ciudadanas", getCellValueAsInteger(row.getCell(13)));
            agregarNota(notas, "Inglés", getCellValueAsInteger(row.getCell(14)));
            agregarNota(notas, "Formulación de Proyectos de Ingeniería", getCellValueAsInteger(row.getCell(15)));
            agregarNota(notas, "Diseño de Software", getCellValueAsInteger(row.getCell(16)));
            agregarNota(notas, "Pensamiento Científico, Matemáticas y Estadística", getCellValueAsInteger(row.getCell(17)));

            estudiante.setNotas(notas);
            
            // Calcular estado de incentivos
            estudiante.setEstadoIncentivos(calcularIncentivo(estudiante.getPuntajeGlobal()));
            
            return estudiante;
            
        } catch (Exception e) {
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
    
    private void agregarNota(List<com.saberpro.model.Nota> notas, String materia, Integer puntaje) {
        int valor = puntaje != null ? puntaje : 0;
        notas.add(new com.saberpro.model.Nota(materia, valor, calcularNivelMateria(materia, valor)));
    }

    private List<com.saberpro.model.Nota> recalcularNivelesNotas(List<com.saberpro.model.Nota> notas) {
        if (notas == null) {
            return null;
        }
        List<com.saberpro.model.Nota> resultado = new ArrayList<>();
        for (com.saberpro.model.Nota nota : notas) {
            if (nota == null) {
                continue;
            }
            String materia = nota.getMateria();
            Integer puntaje = nota.getPuntaje() != null ? nota.getPuntaje() : 0;
            resultado.add(new com.saberpro.model.Nota(materia, puntaje, calcularNivelMateria(materia, puntaje)));
        }
        return resultado;
    }

    private String calcularNivelMateria(String materia, Integer puntaje) {
        if (puntaje == null) {
            return "Sin información";
        }
        String nombreNormalizado = materia != null ? normalizar(materia) : "";
        if (nombreNormalizado.contains("ingles")) {
            return calcularNivelIngles(puntaje);
        }
        return calcularNivelGeneral(puntaje);
    }

    private String calcularNivelGeneral(int puntaje) {
        if (puntaje >= 180) return "Nivel 4";
        if (puntaje >= 150) return "Nivel 3";
        if (puntaje >= 120) return "Nivel 2";
        return "Nivel 1";
    }

    private String calcularNivelIngles(int puntaje) {
        if (puntaje >= 190) return "B2";
        if (puntaje >= 160) return "B1";
        if (puntaje >= 135) return "A2";
        if (puntaje >= 110) return "A1";
        return "A0";
    }
    
    private void actualizarDatosEstudiante(EstudianteResultado existente, EstudianteResultado nuevo) {
        if (nuevo.getTipoDocumento() != null && !nuevo.getTipoDocumento().isBlank()) {
            existente.setTipoDocumento(nuevo.getTipoDocumento());
        }

        boolean nombresActualizados = false;
        if (nuevo.getPrimerNombre() != null && !nuevo.getPrimerNombre().isBlank()) {
            existente.setPrimerNombre(nuevo.getPrimerNombre());
            nombresActualizados = true;
        }
        if (nuevo.getSegundoNombre() != null && !nuevo.getSegundoNombre().isBlank()) {
            existente.setSegundoNombre(nuevo.getSegundoNombre());
            nombresActualizados = true;
        }
        if (nuevo.getPrimerApellido() != null && !nuevo.getPrimerApellido().isBlank()) {
            existente.setPrimerApellido(nuevo.getPrimerApellido());
            nombresActualizados = true;
        }
        if (nuevo.getSegundoApellido() != null && !nuevo.getSegundoApellido().isBlank()) {
            existente.setSegundoApellido(nuevo.getSegundoApellido());
            nombresActualizados = true;
        }

        if (nuevo.getCorreoElectronico() != null && !nuevo.getCorreoElectronico().isBlank()) {
            existente.setCorreoElectronico(nuevo.getCorreoElectronico());
        }
        if (nuevo.getNumeroTelefono() != null && !nuevo.getNumeroTelefono().isBlank()) {
            existente.setNumeroTelefono(nuevo.getNumeroTelefono());
        }

        if (nombresActualizados) {
            existente.setNombreCompleto(construirNombreCompleto(existente));
        } else if (nuevo.getNombreCompleto() != null && !nuevo.getNombreCompleto().isEmpty()) {
            existente.setNombreCompleto(nuevo.getNombreCompleto());
        }

        if (nuevo.getProgramaAcademico() != null && !nuevo.getProgramaAcademico().isEmpty()) {
            existente.setProgramaAcademico(nuevo.getProgramaAcademico());
        }
        if (nuevo.getPuntajeGlobal() != null) {
            existente.setPuntajeGlobal(nuevo.getPuntajeGlobal());
        }
        if (nuevo.getNotas() != null && !nuevo.getNotas().isEmpty()) {
            existente.setNotas(recalcularNivelesNotas(nuevo.getNotas()));
        }
        if (nuevo.getEstadoIncentivos() != null) {
            existente.setEstadoIncentivos(nuevo.getEstadoIncentivos());
        }
    }

    // Endpoint temporal para corregir datos del estudiante 1097302429
    @PostMapping("/estudiantes/corregir/{documento}")
    public ResponseEntity<String> corregirEstudianteDatos(@PathVariable String documento) {
        try {
            EstudianteResultado estudiante = estudianteRepo.findByDocumento(documento);
            
            if (estudiante == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Corregir datos específicos para el estudiante 1097302429
            if ("1097302429".equals(documento)) {
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
                return ResponseEntity.ok("Datos corregidos exitosamente");
            }
            
            return ResponseEntity.badRequest().body("No hay correcciones definidas para este estudiante");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error interno: " + e.getMessage());
        }
    }

    // 🆕 Endpoint para obtener perfil completo del estudiante logueado
    @GetMapping("/estudiante/perfil/{documento}")
    public ResponseEntity<Map<String, Object>> getPerfilEstudiante(@PathVariable String documento) {
        try {
            // Obtener datos del estudiante
            EstudianteResultado estudiante = estudianteRepo.findByDocumento(documento);
            if (estudiante == null) {
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
            return ResponseEntity.ok(perfil);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
