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
        try {
            List<AsignacionIncentivo> incentivos = asignacionIncentivoService.obtenerTodos();
            return ResponseEntity.ok(incentivos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener todas las asignaciones automáticas (endpoint específico)
    @GetMapping("/asignaciones")
    public ResponseEntity<List<AsignacionIncentivo>> obtenerAsignacionesAutomaticas() {
        try {
            List<AsignacionIncentivo> incentivos = asignacionIncentivoService.obtenerTodos();
            if (incentivos.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            List<AsignacionIncentivo> automaticas = incentivos.stream()
                .filter(AsignacionIncentivo::isEvaluacionAutomatica)
                .toList();
            return ResponseEntity.ok(automaticas);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incentivo por ID
    @GetMapping("/{id}")
    public ResponseEntity<AsignacionIncentivo> obtenerPorId(@PathVariable String id) {
        try {
            Optional<AsignacionIncentivo> incentivo = asignacionIncentivoService.obtenerPorId(id);
            if (incentivo.isPresent()) {
                return ResponseEntity.ok(incentivo.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
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
        try {
            if (!asignacionIncentivoService.obtenerPorId(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            asignacionIncentivoService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
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
        try {
            long total = asignacionIncentivoService.contarTodos();
            long pendientes = asignacionIncentivoService.contarPorEstado("PENDIENTE");
            long aprobados = asignacionIncentivoService.contarPorEstado("APROBADO");
            long entregados = asignacionIncentivoService.contarPorEstado("ENTREGADO");
            long rechazados = asignacionIncentivoService.contarPorEstado("RECHAZADO");

            long automaticos = asignacionIncentivoService.contarAutomaticos();
            long manuales = total - automaticos;

            double montoTotal = asignacionIncentivoService.sumatoriaMontos(null);
            double montoEntregado = asignacionIncentivoService.sumatoriaMontos("ENTREGADO");

            Map<String, Object> estadisticas = Map.of(
                "total", total,
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
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener distribución por tipo de incentivo
    @GetMapping("/distribucion-tipos")
    public ResponseEntity<Map<String, Object>> obtenerDistribucionTipos() {
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
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Obtener estadísticas de evaluación automática
    @GetMapping("/estadisticas-evaluacion")
    public ResponseEntity<IncentivoEvaluacionService.EstatisticasIncentivos> obtenerEstadisticasEvaluacion() {
        try {
            IncentivoEvaluacionService.EstatisticasIncentivos stats = evaluacionService.obtenerEstadisticasEvaluacion();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Reevaluar todos los estudiantes con incentivos automáticos
    @PostMapping("/reevaluar-todos")
    public ResponseEntity<?> reevaluarTodosLosEstudiantes() {
        try {
            // Obtener todos los resultados de estudiantes para reevaluación
            List<EstudianteResultado> todosLosEstudiantes = estudianteResultadoRepository.findAll();
            // Ejecutar reevaluación y obtener número de nuevas asignaciones
            int nuevasAsignaciones = evaluacionService.reevaluarTodosLosEstudiantes(todosLosEstudiantes);
            return ResponseEntity.ok(Map.of(
                "mensaje", "Reevaluación completada exitosamente",
                "estudiantesReevaluados", todosLosEstudiantes.size(),
                "nuevasAsignaciones", nuevasAsignaciones,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Error durante la reevaluación: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @PostMapping("/reevaluar-estudiante/{documento}")
    public ResponseEntity<?> reevaluarEstudianteEspecifico(@PathVariable String documento) {
        try {
            // Buscar el estudiante específico
            EstudianteResultado estudiante = estudianteResultadoRepository.findByDocumento(documento);
            
            if (estudiante == null) {
                return ResponseEntity.notFound().build();
            }
            // Ejecutar reevaluación para este estudiante específico
            int nuevasAsignaciones = evaluacionService.reevaluarEstudianteIndividual(estudiante);
            return ResponseEntity.ok(Map.of(
                "mensaje", "Reevaluación completada exitosamente para estudiante " + documento,
                "documento", documento,
                "estudianteNombre", estudiante.getPrimerNombre() + " " + estudiante.getPrimerApellido(),
                "puntajeGlobal", estudiante.getPuntajeGlobal(),
                "nuevasAsignaciones", nuevasAsignaciones,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Error durante la reevaluación del estudiante: " + e.getMessage(),
                "documento", documento,
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @PostMapping("/limpiar-y-regenerar")
    public ResponseEntity<?> limpiarYRegenerarAsignaciones() {
        try {
            int eliminadas = evaluacionService.eliminarAsignacionesAutomaticas();
            int regeneradas = evaluacionService.regenerarAsignacionesAutomaticas();
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
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Error durante la limpieza y regeneración: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    @PostMapping("/test/actualizar-puntaje/{documento}/{nuevoPuntaje}")
    public ResponseEntity<?> actualizarPuntajePrueba(@PathVariable String documento, @PathVariable Integer nuevoPuntaje) {
        try {
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
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}