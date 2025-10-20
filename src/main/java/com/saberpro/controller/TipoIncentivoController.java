package com.saberpro.controller;

import com.saberpro.model.TipoIncentivo;
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
    
    // Obtener todos los tipos de incentivos
    @GetMapping
    public ResponseEntity<List<TipoIncentivo>> obtenerTodos() {
        System.out.println("🎯 [INCENTIVOS] GET /api/tipos-incentivos - Obteniendo todos los tipos");
        try {
            List<TipoIncentivo> tipos = tipoIncentivoRepository.findAll();
            System.out.println("🎯 [INCENTIVOS] ✅ Encontrados " + tipos.size() + " tipos de incentivos");
            for (TipoIncentivo tipo : tipos) {
                System.out.println("🎯 [INCENTIVOS]   - " + tipo.getNombre() + " (ID: " + tipo.getId() + ", Activo: " + tipo.isActivo() + ", Puntaje min: " + tipo.getPuntajeMinimo() + ")");
            }
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            System.err.println("🎯 [INCENTIVOS] ❌ Error obteniendo tipos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Obtener solo tipos activos
    @GetMapping("/activos")
    public ResponseEntity<List<TipoIncentivo>> obtenerActivos() {
        System.out.println("🎯 [INCENTIVOS] GET /api/tipos-incentivos/activos - Obteniendo tipos activos");
        try {
            List<TipoIncentivo> tipos = tipoIncentivoRepository.findByActivoTrue();
            System.out.println("🎯 [INCENTIVOS] ✅ Encontrados " + tipos.size() + " tipos activos");
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            System.err.println("🎯 [INCENTIVOS] ❌ Error obteniendo tipos activos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Obtener tipo por ID
    @GetMapping("/{id}")
    public ResponseEntity<TipoIncentivo> obtenerPorId(@PathVariable String id) {
        System.out.println("🎯 [INCENTIVOS] GET /api/tipos-incentivos/" + id + " - Obteniendo tipo por ID");
        try {
            Optional<TipoIncentivo> tipo = tipoIncentivoRepository.findById(id);
            if (tipo.isPresent()) {
                System.out.println("🎯 [INCENTIVOS] ✅ Tipo encontrado: " + tipo.get().getNombre());
                return ResponseEntity.ok(tipo.get());
            } else {
                System.out.println("🎯 [INCENTIVOS] ⚠️ Tipo no encontrado con ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("🎯 [INCENTIVOS] ❌ Error obteniendo tipo por ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Crear nuevo tipo de incentivo
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody TipoIncentivo nuevoTipo) {
        System.out.println("🎯 [INCENTIVOS] POST /api/tipos-incentivos - Creando nuevo tipo");
        System.out.println("🎯 [INCENTIVOS] Datos recibidos: " + 
            "Nombre: '" + nuevoTipo.getNombre() + "', " +
            "Puntaje mín: " + nuevoTipo.getPuntajeMinimo() + ", " +
            "Monto: " + nuevoTipo.getMonto());
        try {
            // Validaciones básicas
            if (nuevoTipo.getNombre() == null || nuevoTipo.getNombre().trim().isEmpty()) {
                System.out.println("🎯 [INCENTIVOS] ❌ Validación falló: Nombre requerido");
                return ResponseEntity.badRequest().body("El nombre es requerido");
            }
            
            if (nuevoTipo.getPuntajeMinimo() < 0 || nuevoTipo.getPuntajeMinimo() > 300) {
                System.out.println("🎯 [INCENTIVOS] ❌ Validación falló: Puntaje inválido (" + nuevoTipo.getPuntajeMinimo() + ")");
                return ResponseEntity.badRequest().body("El puntaje mínimo debe estar entre 0 y 300");
            }
            
            if (nuevoTipo.getMonto() < 0) {
                System.out.println("🎯 [INCENTIVOS] ❌ Validación falló: Monto negativo (" + nuevoTipo.getMonto() + ")");
                return ResponseEntity.badRequest().body("El monto no puede ser negativo");
            }
            
            // Verificar si ya existe un incentivo con el mismo nombre
            boolean existe = tipoIncentivoRepository.existsByNombreAndActivoTrue(nuevoTipo.getNombre());
            System.out.println("🎯 [INCENTIVOS] Verificando duplicado: " + existe);
            if (existe) {
                System.out.println("🎯 [INCENTIVOS] ❌ Duplicado encontrado: " + nuevoTipo.getNombre());
                return ResponseEntity.badRequest().body("Ya existe un incentivo activo con ese nombre");
            }
            
            // Establecer creador (en una implementación real vendría del usuario autenticado)
            if (nuevoTipo.getCreadoPor() == null) {
                nuevoTipo.setCreadoPor("Coordinador");
            }
            
            TipoIncentivo guardado = tipoIncentivoRepository.save(nuevoTipo);
            System.out.println("🎯 [INCENTIVOS] ✅ Tipo creado exitosamente - ID: " + guardado.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
            
        } catch (Exception e) {
            System.err.println("🎯 [INCENTIVOS] ❌ Error creando tipo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error al crear tipo de incentivo: " + e.getMessage());
        }
    }
    
    // Actualizar tipo de incentivo
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody TipoIncentivo tipoActualizado) {
        System.out.println("🎯 [INCENTIVOS] PUT /api/tipos-incentivos/" + id + " - Actualizando tipo");
        System.out.println("🎯 [INCENTIVOS] Nuevos datos: " + 
            "Nombre: '" + tipoActualizado.getNombre() + "', " +
            "Puntaje mín: " + tipoActualizado.getPuntajeMinimo() + ", " +
            "Monto: " + tipoActualizado.getMonto());
        try {
            Optional<TipoIncentivo> tipoExistente = tipoIncentivoRepository.findById(id);
            
            if (tipoExistente.isEmpty()) {
                System.out.println("🎯 [INCENTIVOS] ❌ Tipo no encontrado para actualizar: " + id);
                return ResponseEntity.notFound().build();
            }
            
            TipoIncentivo tipo = tipoExistente.get();
            System.out.println("🎯 [INCENTIVOS] ✅ Tipo encontrado: " + tipo.getNombre());
            
            // Actualizar campos
            if (tipoActualizado.getNombre() != null) {
                System.out.println("🎯 [INCENTIVOS] Actualizando nombre: '" + tipo.getNombre() + "' → '" + tipoActualizado.getNombre() + "'");
                tipo.setNombre(tipoActualizado.getNombre());
            }
            if (tipoActualizado.getDescripcion() != null) {
                System.out.println("🎯 [INCENTIVOS] Actualizando descripción");
                tipo.setDescripcion(tipoActualizado.getDescripcion());
            }
            if (tipoActualizado.getPuntajeMinimo() > 0) {
                System.out.println("🎯 [INCENTIVOS] Actualizando puntaje: " + tipo.getPuntajeMinimo() + " → " + tipoActualizado.getPuntajeMinimo());
                tipo.setPuntajeMinimo(tipoActualizado.getPuntajeMinimo());
            }
            if (tipoActualizado.getMonto() >= 0) {
                System.out.println("🎯 [INCENTIVOS] Actualizando monto: " + tipo.getMonto() + " → " + tipoActualizado.getMonto());
                tipo.setMonto(tipoActualizado.getMonto());
            }
            if (tipoActualizado.getBeneficios() != null) {
                System.out.println("🎯 [INCENTIVOS] Actualizando beneficios");
                tipo.setBeneficios(tipoActualizado.getBeneficios());
            }
            
            TipoIncentivo guardado = tipoIncentivoRepository.save(tipo);
            System.out.println("🎯 [INCENTIVOS] ✅ Tipo actualizado exitosamente");
            return ResponseEntity.ok(guardado);
            
        } catch (Exception e) {
            System.err.println("🎯 [INCENTIVOS] ❌ Error actualizando tipo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error al actualizar tipo de incentivo: " + e.getMessage());
        }
    }
    
    // Activar/Desactivar tipo de incentivo
    @PutMapping("/{id}/toggle-activo")
    public ResponseEntity<?> toggleActivo(@PathVariable String id) {
        System.out.println("🎯 [INCENTIVOS] PUT /api/tipos-incentivos/" + id + "/toggle-activo - Cambiando estado");
        try {
            Optional<TipoIncentivo> tipoOpt = tipoIncentivoRepository.findById(id);
            
            if (tipoOpt.isEmpty()) {
                System.out.println("🎯 [INCENTIVOS] ❌ Tipo no encontrado para toggle: " + id);
                return ResponseEntity.notFound().build();
            }
            
            TipoIncentivo tipo = tipoOpt.get();
            boolean estadoAnterior = tipo.isActivo();
            tipo.setActivo(!tipo.isActivo());
            
            TipoIncentivo guardado = tipoIncentivoRepository.save(tipo);
            System.out.println("🎯 [INCENTIVOS] ✅ Estado cambiado: " + estadoAnterior + " → " + guardado.isActivo());
            return ResponseEntity.ok(guardado);
            
        } catch (Exception e) {
            System.err.println("🎯 [INCENTIVOS] ❌ Error cambiando estado: " + e.getMessage());
            e.printStackTrace();
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
            
            // En lugar de eliminar físicamente, desactivar
            TipoIncentivo tipoObj = tipo.get();
            tipoObj.setActivo(false);
            tipoIncentivoRepository.save(tipoObj);
            
            return ResponseEntity.ok().body("Tipo de incentivo desactivado");
            
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