package com.saberpro.controller;

import com.saberpro.model.ResultadoSaberPro;
import com.saberpro.repository.ResultadoSaberProRepository;
import com.saberpro.service.IncentivoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/saber-pro")
@CrossOrigin(origins = "*")
public class SaberProController {

    @Autowired
    private ResultadoSaberProRepository resultadoRepository;
    
    @Autowired
    private IncentivoService incentivoService;

    // Obtener resultado por documento
    @GetMapping("/resultado/{documento}")
    public ResponseEntity<?> obtenerResultadoPorDocumento(@PathVariable String documento) {
        try {
            Optional<ResultadoSaberPro> resultado = resultadoRepository.findByDocumento(documento);
            
            if (resultado.isPresent()) {
                ResultadoSaberPro res = resultado.get();
                
                // Calcular incentivos automáticamente
                incentivoService.calcularIncentivos(res);
                
                // Preparar respuesta enriquecida
                Map<String, Object> response = new HashMap<>();
                response.put("resultado", res);
                response.put("nivelGlobal", incentivoService.calcularNivelGlobal(res.getPuntajeGlobal()));
                response.put("puedeGraduarse", incentivoService.puedeGraduarse(res.getPuntajeGlobal()));
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(404)
                    .body(Map.of("error", "No se encontraron resultados para el documento: " + documento));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error interno del servidor: " + e.getMessage()));
        }
    }

    // Obtener todos los resultados
    @GetMapping("/resultados")
    public ResponseEntity<List<ResultadoSaberPro>> obtenerTodosLosResultados() {
        try {
            List<ResultadoSaberPro> resultados = resultadoRepository.findAll();
            return ResponseEntity.ok(resultados);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Crear o actualizar resultado
    @PostMapping("/resultado")
    public ResponseEntity<?> guardarResultado(@RequestBody ResultadoSaberPro resultado) {
        try {
            // Calcular incentivos antes de guardar
            incentivoService.calcularIncentivos(resultado);
            
            // Calcular niveles de competencias
            resultado.setComunicacionEscritaNivel(
                incentivoService.calcularNivelCompetencia(resultado.getComunicacionEscrita(), "COMUNICACION_ESCRITA"));
            resultado.setRazonamientoCuantitativoNivel(
                incentivoService.calcularNivelCompetencia(resultado.getRazonamientoCuantitativo(), "RAZONAMIENTO_CUANTITATIVO"));
            resultado.setLecturaCriticaNivel(
                incentivoService.calcularNivelCompetencia(resultado.getLecturaCritica(), "LECTURA_CRITICA"));
            resultado.setCompetenciasCiudadanasNivel(
                incentivoService.calcularNivelCompetencia(resultado.getCompetenciasCiudadanas(), "COMPETENCIAS_CIUDADANAS"));
            resultado.setInglesNivel(
                incentivoService.calcularNivelCompetencia(resultado.getIngles(), "INGLES"));
            resultado.setDisenoSoftwareNivel(
                incentivoService.calcularNivelCompetencia(resultado.getDisenoSoftware(), "DISEÑO_SOFTWARE"));

            ResultadoSaberPro guardado = resultadoRepository.save(resultado);
            return ResponseEntity.ok(Map.of("success", true, "resultado", guardado));
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error al guardar resultado: " + e.getMessage()));
        }
    }

    // Estadísticas generales
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        try {
            Map<String, Object> estadisticas = new HashMap<>();
            
            // Contadores básicos
            long totalEstudiantes = resultadoRepository.count();
            long puedenGraduar = resultadoRepository.countByEstadoGraduacion("PUEDE_GRADUAR");
            long noPuedenGraduar = resultadoRepository.countByEstadoGraduacion("NO_PUEDE_GRADUAR");
            long conIncentivos = resultadoRepository.countByPuntajeRange(180, 300);

            estadisticas.put("totalEstudiantes", totalEstudiantes);
            estadisticas.put("puedenGraduar", puedenGraduar);
            estadisticas.put("noPuedenGraduar", noPuedenGraduar);
            estadisticas.put("conIncentivos", conIncentivos);

            // Distribución por rangos de puntaje
            Map<String, Long> distribucionPuntajes = new HashMap<>();
            distribucionPuntajes.put("sobresaliente", resultadoRepository.countByPuntajeRange(241, 300));
            distribucionPuntajes.put("destacado", resultadoRepository.countByPuntajeRange(211, 240));
            distribucionPuntajes.put("bueno", resultadoRepository.countByPuntajeRange(180, 210));
            distribucionPuntajes.put("satisfactorio", resultadoRepository.countByPuntajeRange(120, 179));
            distribucionPuntajes.put("minimo", resultadoRepository.countByPuntajeRange(80, 119));
            distribucionPuntajes.put("insuficiente", resultadoRepository.countByPuntajeRange(0, 79));

            estadisticas.put("distribucionPuntajes", distribucionPuntajes);

            // Promedios por competencia (se calcularía con agregación en MongoDB)
            Map<String, Double> promediosCompetencias = new HashMap<>();
            promediosCompetencias.put("comunicacionEscrita", 0.0);
            promediosCompetencias.put("razonamientoCuantitativo", 0.0);
            promediosCompetencias.put("lecturaCritica", 0.0);
            promediosCompetencias.put("competenciasCiudadanas", 0.0);
            promediosCompetencias.put("ingles", 0.0);
            promediosCompetencias.put("disenoSoftware", 0.0);

            estadisticas.put("promediosCompetencias", promediosCompetencias);

            return ResponseEntity.ok(estadisticas);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error al obtener estadísticas: " + e.getMessage()));
        }
    }

    // Buscar estudiantes
    @GetMapping("/buscar")
    public ResponseEntity<List<ResultadoSaberPro>> buscarEstudiantes(
            @RequestParam(required = false) String termino,
            @RequestParam(required = false) String programa,
            @RequestParam(required = false) Integer puntajeMin,
            @RequestParam(required = false) String estado) {
        
        try {
            List<ResultadoSaberPro> resultados;

            if (termino != null && !termino.isEmpty()) {
                resultados = resultadoRepository.buscarPorNombreODocumento(termino);
            } else if (programa != null && !programa.isEmpty()) {
                resultados = resultadoRepository.findByProgramaAcademicoContainingIgnoreCase(programa);
            } else if (puntajeMin != null) {
                resultados = resultadoRepository.findByPuntajeGlobalGreaterThanEqual(puntajeMin);
            } else if (estado != null && !estado.isEmpty()) {
                resultados = resultadoRepository.findByEstadoGraduacion(estado);
            } else {
                resultados = resultadoRepository.findAll();
            }

            return ResponseEntity.ok(resultados);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Obtener estudiantes con incentivos
    @GetMapping("/incentivos")
    public ResponseEntity<List<ResultadoSaberPro>> obtenerEstudiantesConIncentivos() {
        try {
            List<ResultadoSaberPro> estudiantes = resultadoRepository.findEstudiantesConIncentivos(180);
            return ResponseEntity.ok(estudiantes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Obtener estudiantes que no pueden graduarse
    @GetMapping("/no-graduables")
    public ResponseEntity<List<ResultadoSaberPro>> obtenerEstudiantesNoGraduables() {
        try {
            List<ResultadoSaberPro> estudiantes = resultadoRepository.findEstudiantesNoGraduables();
            return ResponseEntity.ok(estudiantes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Eliminar resultado
    @DeleteMapping("/resultado/{id}")
    public ResponseEntity<?> eliminarResultado(@PathVariable String id) {
        try {
            if (resultadoRepository.existsById(id)) {
                resultadoRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("success", true, "message", "Resultado eliminado correctamente"));
            } else {
                return ResponseEntity.status(404)
                    .body(Map.of("error", "Resultado no encontrado"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error al eliminar resultado: " + e.getMessage()));
        }
    }

    // Endpoint para importar datos masivamente
    @PostMapping("/importar")
    public ResponseEntity<?> importarResultados(@RequestBody List<ResultadoSaberPro> resultados) {
        try {
            int procesados = 0;
            int errores = 0;
            
            for (ResultadoSaberPro resultado : resultados) {
                try {
                    // Calcular incentivos para cada resultado
                    incentivoService.calcularIncentivos(resultado);
                    resultadoRepository.save(resultado);
                    procesados++;
                } catch (Exception e) {
                    errores++;
                    System.err.println("Error procesando resultado " + resultado.getDocumento() + ": " + e.getMessage());
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("procesados", procesados);
            response.put("errores", errores);
            response.put("total", resultados.size());

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error en importación masiva: " + e.getMessage()));
        }
    }

    // Recalcular incentivos para todos los estudiantes
    @PostMapping("/recalcular-incentivos")
    public ResponseEntity<?> recalcularIncentivos() {
        try {
            List<ResultadoSaberPro> resultados = resultadoRepository.findAll();
            int actualizados = 0;

            for (ResultadoSaberPro resultado : resultados) {
                incentivoService.calcularIncentivos(resultado);
                resultadoRepository.save(resultado);
                actualizados++;
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Incentivos recalculados para " + actualizados + " estudiantes"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error al recalcular incentivos: " + e.getMessage()));
        }
    }
}