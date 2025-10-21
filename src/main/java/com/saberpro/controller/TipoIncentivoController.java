package com.saberpro.controller;

import com.saberpro.model.TipoIncentivo;
import com.saberpro.repository.AsignacionIncentivoRepository;
import com.saberpro.repository.TipoIncentivoRepository;
import com.saberpro.service.IncentivoEvaluacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tipos-incentivos")
public class TipoIncentivoController {
    
    @Autowired
    private TipoIncentivoRepository tipoIncentivoRepository;
    
    @Autowired
    private IncentivoEvaluacionService evaluacionService;

    @Autowired
    private AsignacionIncentivoRepository asignacionIncentivoRepository;
    
    // Obtener todos los tipos de incentivos
    @GetMapping
    public ResponseEntity<List<TipoIncentivo>> obtenerTodos() {
        try {
            List<TipoIncentivo> tipos = tipoIncentivoRepository.findAll();
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Obtener solo tipos activos
    @GetMapping("/activos")
    public ResponseEntity<List<TipoIncentivo>> obtenerActivos() {
        try {
            List<TipoIncentivo> tipos = tipoIncentivoRepository.findByActivoTrue();
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Obtener tipo por ID
    @GetMapping("/{id}")
    public ResponseEntity<TipoIncentivo> obtenerPorId(@PathVariable String id) {
        try {
            Optional<TipoIncentivo> tipo = tipoIncentivoRepository.findById(id);
            if (tipo.isPresent()) {
                return ResponseEntity.ok(tipo.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Crear nuevo tipo de incentivo
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody TipoIncentivo nuevoTipo) {
        try {
            // Validaciones básicas
            if (nuevoTipo.getNombre() == null || nuevoTipo.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre es requerido");
            }
            
            if (nuevoTipo.getPuntajeMinimo() < 0 || nuevoTipo.getPuntajeMinimo() > 300) {
                return ResponseEntity.badRequest().body("El puntaje mínimo debe estar entre 0 y 300");
            }
            
            if (nuevoTipo.getMonto() < 0) {
                return ResponseEntity.badRequest().body("El monto no puede ser negativo");
            }
            
            // Verificar si ya existe un incentivo con el mismo nombre
            boolean existe = tipoIncentivoRepository.existsByNombreAndActivoTrue(nuevoTipo.getNombre());
            if (existe) {
                return ResponseEntity.badRequest().body("Ya existe un incentivo activo con ese nombre");
            }
            
            // Establecer creador (en una implementación real vendría del usuario autenticado)
            if (nuevoTipo.getCreadoPor() == null) {
                nuevoTipo.setCreadoPor("Coordinador");
            }
            
            TipoIncentivo guardado = tipoIncentivoRepository.save(nuevoTipo);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error al crear tipo de incentivo: " + e.getMessage());
        }
    }
    
    // Actualizar tipo de incentivo
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody TipoIncentivo tipoActualizado) {
        try {
            Optional<TipoIncentivo> tipoExistente = tipoIncentivoRepository.findById(id);
            
            if (tipoExistente.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            TipoIncentivo tipo = tipoExistente.get();
            
            // Actualizar campos
            if (tipoActualizado.getNombre() != null) {
                tipo.setNombre(tipoActualizado.getNombre());
            }
            if (tipoActualizado.getDescripcion() != null) {
                tipo.setDescripcion(tipoActualizado.getDescripcion());
            }
            if (tipoActualizado.getPuntajeMinimo() > 0) {
                tipo.setPuntajeMinimo(tipoActualizado.getPuntajeMinimo());
            }
            if (tipoActualizado.getMonto() >= 0) {
                tipo.setMonto(tipoActualizado.getMonto());
            }
            if (tipoActualizado.getBeneficios() != null) {
                tipo.setBeneficios(tipoActualizado.getBeneficios());
            }
            
            TipoIncentivo guardado = tipoIncentivoRepository.save(tipo);
            return ResponseEntity.ok(guardado);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error al actualizar tipo de incentivo: " + e.getMessage());
        }
    }
    
    // Activar/Desactivar tipo de incentivo
    @PutMapping("/{id}/toggle-activo")
    public ResponseEntity<?> toggleActivo(@PathVariable String id) {
        try {
            Optional<TipoIncentivo> tipoOpt = tipoIncentivoRepository.findById(id);
            
            if (tipoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            TipoIncentivo tipo = tipoOpt.get();
            tipo.setActivo(!tipo.isActivo());
            
            TipoIncentivo guardado = tipoIncentivoRepository.save(tipo);
            return ResponseEntity.ok(guardado);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error al cambiar estado: " + e.getMessage());
        }
    }
    
    // Eliminar tipo de incentivo (solo si no tiene asignaciones)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            Optional<TipoIncentivo> tipo = tipoIncentivoRepository.findById(id);
            
            if (tipo.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Evitar eliminar tipos con asignaciones activas para no dejar referencias rotas
            if (asignacionIncentivoRepository.existsByTipoIncentivo_Id(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No se puede eliminar el tipo porque existen asignaciones asociadas.\n\nSigue estos pasos antes de eliminarlo:\n1. Desactiva el incentivo.\n2. Reevaluar estudiantes.\n3. Elimina el incentivo nuevamente.");
            }

            tipoIncentivoRepository.deleteById(id);
            return ResponseEntity.ok().body("Tipo de incentivo eliminado");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error al eliminar tipo de incentivo: " + e.getMessage());
        }
    }
    
    // Obtener incentivos aplicables para un puntaje
    @GetMapping("/aplicables/{puntaje}")
    public ResponseEntity<List<TipoIncentivo>> obtenerAplicables(@PathVariable int puntaje) {
        try {
            List<TipoIncentivo> aplicables = tipoIncentivoRepository.findIncentivosPorPuntaje(puntaje);
            return ResponseEntity.ok(aplicables);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Estadísticas de tipos de incentivos
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        try {
            Map<String, Object> estadisticas = new HashMap<>();
            
            long totalTipos = tipoIncentivoRepository.count();
            long tiposActivos = tipoIncentivoRepository.countByActivoTrue();
            
            IncentivoEvaluacionService.EstatisticasIncentivos stats = evaluacionService.obtenerEstadisticasEvaluacion();
            
            estadisticas.put("totalTipos", totalTipos);
            estadisticas.put("tiposActivos", tiposActivos);
            estadisticas.put("tiposInactivos", totalTipos - tiposActivos);
            estadisticas.put("totalAsignaciones", stats.getTotal());
            estadisticas.put("asignacionesAutomaticas", stats.getAutomaticos());
            estadisticas.put("asignacionesManuales", stats.getManuales());
            estadisticas.put("porcentajeAutomaticas", stats.getPorcentajeAutomaticos());
            
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Validar configuración de incentivo
    @PostMapping("/validar")
    public ResponseEntity<Map<String, Object>> validarConfiguracion(@RequestBody TipoIncentivo tipo) {
        Map<String, Object> resultado = new HashMap<>();
        List<String> errores = new java.util.ArrayList<>();
        List<String> advertencias = new java.util.ArrayList<>();
        
        // Validaciones
        if (tipo.getNombre() == null || tipo.getNombre().trim().isEmpty()) {
            errores.add("El nombre es requerido");
        }
        
        if (tipo.getPuntajeMinimo() < 180) {
            advertencias.add("El puntaje mínimo es menor a 180 (criterio general de elegibilidad)");
        }
        
        if (tipo.getPuntajeMinimo() > 300) {
            errores.add("El puntaje mínimo no puede ser mayor a 300");
        }
        
        if (tipo.getMonto() < 0) {
            errores.add("El monto no puede ser negativo");
        }
        
        if (tipo.getMonto() > 5000000) {
            advertencias.add("Monto muy alto, verifique si es correcto");
        }
        
        resultado.put("valido", errores.isEmpty());
        resultado.put("errores", errores);
        resultado.put("advertencias", advertencias);
        
        return ResponseEntity.ok(resultado);
    }
}