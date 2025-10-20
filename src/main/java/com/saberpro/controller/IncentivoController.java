package com.saberpro.controller;

import com.saberpro.model.AsignacionIncentivo;
import com.saberpro.model.EstudianteResultado;
import com.saberpro.model.ResultadoSaberPro;
import com.saberpro.model.TipoIncentivo;
import com.saberpro.service.AsignacionIncentivoService;
import com.saberpro.service.IncentivoEvaluacionService;
import com.saberpro.repository.EstudianteResultadoRepository;
import com.saberpro.repository.TipoIncentivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/incentivos")
@CrossOrigin(origins = "*")
public class IncentivoController {

    @Autowired
    private AsignacionIncentivoService asignacionIncentivoService;
    
    @Autowired
    private IncentivoEvaluacionService evaluacionService;
    
    @Autowired
    private TipoIncentivoRepository tipoIncentivoRepository;
    
    @Autowired
    private EstudianteResultadoRepository estudianteResultadoRepository;

    // Obtener todos los incentivos
    @GetMapping
    public ResponseEntity<List<AsignacionIncentivo>> obtenerTodos() {
        System.out.println("🎁 [ASIGNACIONES] GET /api/incentivos - Obteniendo todas las asignaciones");
        try {
            List<AsignacionIncentivo> incentivos = asignacionIncentivoService.obtenerTodos();
            System.out.println("🎁 [ASIGNACIONES] ✅ Encontradas " + incentivos.size() + " asignaciones");
            for (AsignacionIncentivo incentivo : incentivos) {
                String tipoNombre = incentivo.getTipoIncentivo() != null ? 
                    incentivo.getTipoIncentivo().getNombre() : "Sin tipo";
                System.out.println("🎁 [ASIGNACIONES]   - " + incentivo.getNombreCompleto() + 
                    " (" + incentivo.getDocumentoEstudiante() + ") → " + tipoNombre + 
                    " [" + incentivo.getEstado() + "]");
            }
            return ResponseEntity.ok(incentivos);
        } catch (Exception e) {
            System.err.println("🎁 [ASIGNACIONES] ❌ Error obteniendo asignaciones: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener todas las asignaciones automáticas (endpoint específico)
    @GetMapping("/asignaciones")
    public ResponseEntity<List<AsignacionIncentivo>> obtenerAsignacionesAutomaticas() {
        System.out.println("=== [BACKEND] INICIO GET /api/incentivos/asignaciones ===");
        System.out.println("🎁 [ASIGNACIONES] Timestamp: " + java.time.LocalDateTime.now());
        System.out.println("🎁 [ASIGNACIONES] Thread: " + Thread.currentThread().getName());
        
        try {
            System.out.println("🎁 [ASIGNACIONES] Llamando a asignacionIncentivoService.obtenerTodos()...");
            List<AsignacionIncentivo> incentivos = asignacionIncentivoService.obtenerTodos();
            System.out.println("🎁 [ASIGNACIONES] ✅ Servicio respondió con " + incentivos.size() + " asignaciones totales");
            
            if (incentivos.isEmpty()) {
                System.out.println("⚠️ [ASIGNACIONES] WARNING: No se encontraron asignaciones en la base de datos");
                return ResponseEntity.ok(new ArrayList<>());
            }
            
            // Mostrar información detallada de todas las asignaciones
            System.out.println("🎁 [ASIGNACIONES] Detalle de todas las asignaciones:");
            for (int i = 0; i < incentivos.size(); i++) {
                AsignacionIncentivo incentivo = incentivos.get(i);
                System.out.println("🎁 [ASIGNACIONES]   [" + (i+1) + "] ID: " + incentivo.getId() + 
                    ", Estudiante: " + incentivo.getNombreCompleto() + 
                    ", Documento: " + incentivo.getDocumentoEstudiante() + 
                    ", Automático: " + incentivo.isEvaluacionAutomatica() +
                    ", Estado: " + incentivo.getEstado());
            }
            
            // Filtrar solo las automáticas
            System.out.println("🎁 [ASIGNACIONES] Filtrando asignaciones automáticas...");
            List<AsignacionIncentivo> automaticas = incentivos.stream()
                .filter(AsignacionIncentivo::isEvaluacionAutomatica)
                .toList();
                
            System.out.println("🎁 [ASIGNACIONES] ✅ Asignaciones automáticas filtradas: " + automaticas.size());
            
            if (automaticas.isEmpty()) {
                System.out.println("⚠️ [ASIGNACIONES] WARNING: No hay asignaciones marcadas como automáticas");
            } else {
                System.out.println("🎁 [ASIGNACIONES] Detalle de asignaciones automáticas:");
                for (AsignacionIncentivo incentivo : automaticas) {
                    String tipoNombre = incentivo.getTipoIncentivo() != null ? 
                        incentivo.getTipoIncentivo().getNombre() : "Sin tipo";
                    System.out.println("🎁 [ASIGNACIONES]   - " + incentivo.getNombreCompleto() + 
                        " (" + incentivo.getDocumentoEstudiante() + ") → " + tipoNombre + 
                        " [" + incentivo.getEstado() + "] AUTOMÁTICO");
                }
            }
            
            System.out.println("🎁 [ASIGNACIONES] Retornando ResponseEntity.ok() con " + automaticas.size() + " elementos");
            System.out.println("=== [BACKEND] FIN GET /api/incentivos/asignaciones ===");
            return ResponseEntity.ok(automaticas);
            
        } catch (Exception e) {
            System.err.println("🎁 [ASIGNACIONES] ❌ ERROR CRÍTICO en endpoint /asignaciones:");
            System.err.println("🎁 [ASIGNACIONES] ❌ Mensaje: " + e.getMessage());
            System.err.println("🎁 [ASIGNACIONES] ❌ Clase: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.out.println("=== [BACKEND] FIN CON ERROR GET /api/incentivos/asignaciones ===");
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incentivo por ID
    @GetMapping("/{id}")
    public ResponseEntity<AsignacionIncentivo> obtenerPorId(@PathVariable String id) {
        System.out.println("🎁 [ASIGNACIONES] GET /api/incentivos/" + id + " - Obteniendo asignación por ID");
        try {
            Optional<AsignacionIncentivo> incentivo = asignacionIncentivoService.obtenerPorId(id);
            if (incentivo.isPresent()) {
                System.out.println("🎁 [ASIGNACIONES] ✅ Asignación encontrada: " + incentivo.get().getNombreCompleto());
                return ResponseEntity.ok(incentivo.get());
            } else {
                System.out.println("🎁 [ASIGNACIONES] ⚠️ Asignación no encontrada: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("🎁 [ASIGNACIONES] ❌ Error obteniendo asignación por ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Crear nuevo incentivo
    @PostMapping
    public ResponseEntity<AsignacionIncentivo> crear(@RequestBody Map<String, Object> requestData) {
        try {
            String documentoEstudiante = (String) requestData.get("documentoEstudiante");
            String tipoIncentivo = (String) requestData.get("tipoIncentivo");
            String descripcion = (String) requestData.get("descripcion");
            Double monto = requestData.get("monto") != null ? 
                Double.valueOf(requestData.get("monto").toString()) : 0.0;
            String asignadoPor = (String) requestData.get("asignadoPor");

            AsignacionIncentivo incentivo = asignacionIncentivoService.asignarIncentivo(
                documentoEstudiante, tipoIncentivo, descripcion, monto, asignadoPor);
            
            return ResponseEntity.ok(incentivo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Actualizar incentivo
    @PutMapping("/{id}")
    public ResponseEntity<AsignacionIncentivo> actualizar(@PathVariable String id, 
                                                         @RequestBody AsignacionIncentivo incentivo) {
        try {
            if (!asignacionIncentivoService.obtenerPorId(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            incentivo.setId(id);
            AsignacionIncentivo actualizado = asignacionIncentivoService.guardar(incentivo);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Eliminar incentivo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        System.out.println("🗑️ [DELETE] DELETE /api/incentivos/" + id + " - Iniciando eliminación de incentivo");
        try {
            if (!asignacionIncentivoService.obtenerPorId(id).isPresent()) {
                System.out.println("🗑️ [DELETE] ❌ Incentivo no encontrado con id: " + id);
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("🗑️ [DELETE] ✅ Incentivo encontrado, procediendo a eliminar...");
            asignacionIncentivoService.eliminar(id);
            System.out.println("🗑️ [DELETE] ✅ Incentivo eliminado exitosamente con id: " + id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("🗑️ [DELETE] ❌ Error eliminando incentivo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Aprobar incentivo
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<AsignacionIncentivo> aprobar(@PathVariable String id, 
                                                      @RequestBody Map<String, String> requestData) {
        try {
            String aprobadoPor = requestData.get("aprobadoPor");
            String observaciones = requestData.get("observaciones");
            
            AsignacionIncentivo incentivo = asignacionIncentivoService.aprobarIncentivo(id, aprobadoPor, observaciones);
            return ResponseEntity.ok(incentivo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Entregar incentivo
    @PutMapping("/{id}/entregar")
    public ResponseEntity<AsignacionIncentivo> entregar(@PathVariable String id, 
                                                       @RequestBody Map<String, String> requestData) {
        try {
            String observaciones = requestData.get("observaciones");
            
            AsignacionIncentivo incentivo = asignacionIncentivoService.entregarIncentivo(id, observaciones);
            return ResponseEntity.ok(incentivo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Rechazar incentivo
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<AsignacionIncentivo> rechazar(@PathVariable String id, 
                                                       @RequestBody Map<String, String> requestData) {
        try {
            String motivoRechazo = requestData.get("motivoRechazo");
            
            AsignacionIncentivo incentivo = asignacionIncentivoService.rechazarIncentivo(id, motivoRechazo);
            return ResponseEntity.ok(incentivo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener estudiantes elegibles
    @GetMapping("/estudiantes-elegibles")
    public ResponseEntity<List<EstudianteResultado>> obtenerEstudiantesElegibles() {
        try {
            List<EstudianteResultado> elegibles = asignacionIncentivoService.obtenerEstudiantesElegibles();
            return ResponseEntity.ok(elegibles);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incentivos por estudiante
    @GetMapping("/estudiante/{documento}")
    public ResponseEntity<List<AsignacionIncentivo>> obtenerPorEstudiante(@PathVariable String documento) {
        try {
            List<AsignacionIncentivo> incentivos = asignacionIncentivoService.obtenerPorEstudiante(documento);
            return ResponseEntity.ok(incentivos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incentivos por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<AsignacionIncentivo>> obtenerPorEstado(@PathVariable String estado) {
        try {
            List<AsignacionIncentivo> incentivos = asignacionIncentivoService.obtenerPorEstado(estado);
            return ResponseEntity.ok(incentivos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incentivos por programa
    @GetMapping("/programa/{programa}")
    public ResponseEntity<List<AsignacionIncentivo>> obtenerPorPrograma(@PathVariable String programa) {
        try {
            List<AsignacionIncentivo> incentivos = asignacionIncentivoService.obtenerPorPrograma(programa);
            return ResponseEntity.ok(incentivos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incentivos recientes
    @GetMapping("/recientes")
    public ResponseEntity<List<AsignacionIncentivo>> obtenerRecientes() {
        try {
            List<AsignacionIncentivo> recientes = asignacionIncentivoService.obtenerRecientes();
            return ResponseEntity.ok(recientes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Verificar elegibilidad de estudiante
    @GetMapping("/elegibilidad/{documento}")
    public ResponseEntity<Map<String, Object>> verificarElegibilidad(@PathVariable String documento) {
        try {
            boolean esElegible = asignacionIncentivoService.estudianteEsElegible(documento);
            boolean tieneIncentivoActivo = asignacionIncentivoService.estudianteTieneIncentivoActivo(documento);
            
            Map<String, Object> resultado = Map.of(
                "documento", documento,
                "esElegible", esElegible,
                "tieneIncentivoActivo", tieneIncentivoActivo,
                "puedeAsignar", esElegible && !tieneIncentivoActivo
            );
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener tipos de incentivos disponibles
    @GetMapping("/tipos")
    public ResponseEntity<List<Map<String, Object>>> obtenerTiposIncentivos() {
        try {
            List<Map<String, Object>> tipos = asignacionIncentivoService.obtenerTiposIncentivos();
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Generar reporte de incentivos
    @GetMapping("/reporte")
    public ResponseEntity<List<Map<String, Object>>> generarReporte() {
        try {
            List<Map<String, Object>> reporte = asignacionIncentivoService.generarReporteIncentivos();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // NUEVOS ENDPOINTS PARA ARQUITECTURA MEJORADA
    
    // Evaluar incentivos automáticamente para un estudiante
    @PostMapping("/evaluar-estudiante")
    public ResponseEntity<?> evaluarEstudiante(@RequestBody Map<String, Object> requestData) {
        try {
            String documento = (String) requestData.get("documento");
            // En una implementación real, buscarías el estudiante por documento
            // Por ahora, simplemente informamos sobre los tipos disponibles
            
            Integer puntaje = (Integer) requestData.get("puntaje");
            if (puntaje == null) {
                return ResponseEntity.badRequest().body("Puntaje requerido");
            }
            
            List<TipoIncentivo> incentivosAplicables = tipoIncentivoRepository.findIncentivosPorPuntaje(puntaje);
            
            return ResponseEntity.ok(Map.of(
                "documento", documento,
                "puntaje", puntaje,
                "incentivosAplicables", incentivosAplicables,
                "esElegible", puntaje >= 180
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error evaluando estudiante: " + e.getMessage());
        }
    }
    
    // Obtener estadísticas generales de incentivos
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasGenerales() {
        System.out.println("📊 [ESTADISTICAS] GET /api/incentivos/estadisticas - Obteniendo estadísticas generales");
        try {
            List<AsignacionIncentivo> todasAsignaciones = asignacionIncentivoService.obtenerTodos();
            
            // Contar por estados
            long pendientes = todasAsignaciones.stream().filter(a -> "PENDIENTE".equals(a.getEstado())).count();
            long aprobados = todasAsignaciones.stream().filter(a -> "APROBADO".equals(a.getEstado())).count();
            long entregados = todasAsignaciones.stream().filter(a -> "ENTREGADO".equals(a.getEstado())).count();
            long rechazados = todasAsignaciones.stream().filter(a -> "RECHAZADO".equals(a.getEstado())).count();
            
            // Contar por tipo de evaluación
            long automaticos = todasAsignaciones.stream().filter(AsignacionIncentivo::isEvaluacionAutomatica).count();
            long manuales = todasAsignaciones.size() - automaticos;
            
            // Calcular montos
            double montoTotal = todasAsignaciones.stream()
                .filter(a -> a.getTipoIncentivo() != null)
                .mapToDouble(a -> a.getTipoIncentivo().getMonto())
                .sum();
                
            double montoEntregado = todasAsignaciones.stream()
                .filter(a -> "ENTREGADO".equals(a.getEstado()) && a.getTipoIncentivo() != null)
                .mapToDouble(a -> a.getTipoIncentivo().getMonto())
                .sum();

            Map<String, Object> estadisticas = Map.of(
                "total", todasAsignaciones.size(),
                "porEstado", Map.of(
                    "pendientes", pendientes,
                    "aprobados", aprobados,
                    "entregados", entregados,
                    "rechazados", rechazados
                ),
                "porTipo", Map.of(
                    "automaticos", automaticos,
                    "manuales", manuales
                ),
                "montos", Map.of(
                    "total", montoTotal,
                    "entregado", montoEntregado,
                    "pendiente", montoTotal - montoEntregado
                )
            );
            
            System.out.println("📊 [ESTADISTICAS] ✅ Estadísticas calculadas: " +
                "Total=" + todasAsignaciones.size() + 
                ", Pendientes=" + pendientes + 
                ", Aprobados=" + aprobados + 
                ", Entregados=" + entregados);
            
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            System.err.println("📊 [ESTADISTICAS] ❌ Error calculando estadísticas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener distribución por tipo de incentivo
    @GetMapping("/distribucion-tipos")
    public ResponseEntity<Map<String, Object>> obtenerDistribucionTipos() {
        System.out.println("📊 [ESTADISTICAS] GET /api/incentivos/distribucion-tipos - Obteniendo distribución por tipos");
        try {
            List<AsignacionIncentivo> asignaciones = asignacionIncentivoService.obtenerTodos();
            List<TipoIncentivo> tipos = tipoIncentivoRepository.findAll();
            
            Map<String, Long> distribucion = asignaciones.stream()
                .filter(a -> a.getTipoIncentivo() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                    a -> a.getTipoIncentivo().getNombre(),
                    java.util.stream.Collectors.counting()
                ));
                
            Map<String, Object> resultado = Map.of(
                "distribucion", distribucion,
                "totalTipos", tipos.size(),
                "totalAsignaciones", asignaciones.size()
            );
            
            System.out.println("📊 [ESTADISTICAS] ✅ Distribución calculada: " + distribucion);
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            System.err.println("📊 [ESTADISTICAS] ❌ Error calculando distribución: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Obtener estadísticas de evaluación automática
    @GetMapping("/estadisticas-evaluacion")
    public ResponseEntity<IncentivoEvaluacionService.EstatisticasIncentivos> obtenerEstadisticasEvaluacion() {
        System.out.println("📊 [ESTADISTICAS] GET /api/incentivos/estadisticas-evaluacion - Obteniendo estadísticas de evaluación");
        try {
            IncentivoEvaluacionService.EstatisticasIncentivos stats = evaluacionService.obtenerEstadisticasEvaluacion();
            System.out.println("📊 [ESTADISTICAS] ✅ Estadísticas de evaluación: " +
                "Total=" + stats.getTotal() + 
                ", Automáticos=" + stats.getAutomaticos() + 
                ", Manuales=" + stats.getManuales());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("📊 [ESTADISTICAS] ❌ Error obteniendo estadísticas de evaluación: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Reevaluar todos los estudiantes con incentivos automáticos
    @PostMapping("/reevaluar-todos")
    public ResponseEntity<?> reevaluarTodosLosEstudiantes() {
        System.out.println("🔄 [REEVALUACION] POST /api/incentivos/reevaluar-todos - Iniciando reevaluación de todos los estudiantes");
        try {
            // Obtener todos los resultados de estudiantes para reevaluación
            List<EstudianteResultado> todosLosEstudiantes = estudianteResultadoRepository.findAll();
            
            System.out.println("🔄 [REEVALUACION] Encontrados " + todosLosEstudiantes.size() + " estudiantes para reevaluar");
            
            // Ejecutar reevaluación y obtener número de nuevas asignaciones
            int nuevasAsignaciones = evaluacionService.reevaluarTodosLosEstudiantes(todosLosEstudiantes);
            
            System.out.println("🔄 [REEVALUACION] ✅ Reevaluación completada exitosamente - " + nuevasAsignaciones + " nuevas asignaciones");
            
            return ResponseEntity.ok(Map.of(
                "mensaje", "Reevaluación completada exitosamente",
                "estudiantesReevaluados", todosLosEstudiantes.size(),
                "nuevasAsignaciones", nuevasAsignaciones,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            System.err.println("🔄 [REEVALUACION] ❌ Error durante la reevaluación: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Error durante la reevaluación: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @PostMapping("/reevaluar-estudiante/{documento}")
    public ResponseEntity<?> reevaluarEstudianteEspecifico(@PathVariable String documento) {
        System.out.println("🔄 [REEVALUACION-INDIVIDUAL] POST /api/incentivos/reevaluar-estudiante/" + documento + " - Iniciando reevaluación de estudiante específico");
        try {
            // Buscar el estudiante específico
            EstudianteResultado estudiante = estudianteResultadoRepository.findByDocumento(documento);
            
            if (estudiante == null) {
                System.out.println("🔄 [REEVALUACION-INDIVIDUAL] ❌ Estudiante no encontrado: " + documento);
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("🔄 [REEVALUACION-INDIVIDUAL] ✅ Estudiante encontrado: " + estudiante.getPrimerNombre() + " " + estudiante.getPrimerApellido() + " (Puntaje: " + estudiante.getPuntajeGlobal() + ")");
            
            // Ejecutar reevaluación para este estudiante específico
            int nuevasAsignaciones = evaluacionService.reevaluarEstudianteIndividual(estudiante);
            
            System.out.println("🔄 [REEVALUACION-INDIVIDUAL] ✅ Reevaluación completada para estudiante " + documento + " - " + nuevasAsignaciones + " nuevas asignaciones");
            
            return ResponseEntity.ok(Map.of(
                "mensaje", "Reevaluación completada exitosamente para estudiante " + documento,
                "documento", documento,
                "estudianteNombre", estudiante.getPrimerNombre() + " " + estudiante.getPrimerApellido(),
                "puntajeGlobal", estudiante.getPuntajeGlobal(),
                "nuevasAsignaciones", nuevasAsignaciones,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            System.err.println("🔄 [REEVALUACION-INDIVIDUAL] ❌ Error durante la reevaluación del estudiante " + documento + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Error durante la reevaluación del estudiante: " + e.getMessage(),
                "documento", documento,
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @PostMapping("/limpiar-y-regenerar")
    public ResponseEntity<?> limpiarYRegenerarAsignaciones() {
        System.out.println("🧹 [LIMPIAR-REGENERAR] 🚀 Iniciando limpieza y regeneración de asignaciones automáticas");
        
        try {
            // 1. Eliminar todas las asignaciones automáticas existentes
            System.out.println("🧹 [LIMPIAR-REGENERAR] 🗑️ Eliminando asignaciones automáticas existentes...");
            int eliminadas = evaluacionService.eliminarAsignacionesAutomaticas();
            System.out.println("🧹 [LIMPIAR-REGENERAR] ✅ Eliminadas " + eliminadas + " asignaciones automáticas");
            
            // 2. Regenerar asignaciones basadas en estudiantes_resultados actuales
            System.out.println("🧹 [LIMPIAR-REGENERAR] 🔄 Regenerando asignaciones desde estudiantes_resultados...");
            int regeneradas = evaluacionService.regenerarAsignacionesAutomaticas();
            System.out.println("🧹 [LIMPIAR-REGENERAR] ✅ Regeneradas " + regeneradas + " asignaciones automáticas");
            
            // 3. Obtener estadísticas actualizadas
            var stats = evaluacionService.obtenerEstadisticasEvaluacion();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "mensaje", "Asignaciones limpiadas y regeneradas exitosamente",
                "eliminadas", eliminadas,
                "regeneradas", regeneradas,
                "estadisticas", Map.of(
                    "total", stats.getTotal(),
                    "automaticos", stats.getAutomaticos(),
                    "manuales", stats.getManuales()
                ),
                "timestamp", System.currentTimeMillis()
            ));
            
        } catch (Exception e) {
            System.err.println("🧹 [LIMPIAR-REGENERAR] ❌ Error durante limpieza y regeneración: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Error durante la limpieza y regeneración: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @PostMapping("/test/actualizar-puntaje/{documento}/{nuevoPuntaje}")
    public ResponseEntity<?> actualizarPuntajePrueba(@PathVariable String documento, @PathVariable Integer nuevoPuntaje) {
        try {
            System.out.println("🔧 [TEST] Actualizando puntaje para documento: " + documento + " → " + nuevoPuntaje);
            
            // Buscar en estudiantes_resultados usando el repository inyectado
            var estudiantes = estudianteResultadoRepository.findAll();
            var estudianteOpt = estudiantes.stream()
                .filter(e -> documento.equals(e.getDocumento()))
                .findFirst();
            
            if (estudianteOpt.isPresent()) {
                var estudiante = estudianteOpt.get();
                Integer puntajeAnterior = estudiante.getPuntajeGlobal();
                estudiante.setPuntajeGlobal(nuevoPuntaje);
                estudianteResultadoRepository.save(estudiante);
                
                System.out.println("🔧 [TEST] Puntaje actualizado: " + puntajeAnterior + " → " + nuevoPuntaje);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "mensaje", "Puntaje actualizado exitosamente",
                    "documento", documento,
                    "puntajeAnterior", puntajeAnterior,
                    "puntajeNuevo", nuevoPuntaje
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            System.err.println("🔧 [TEST] Error actualizando puntaje: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}