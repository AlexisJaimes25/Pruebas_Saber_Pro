package com.saberpro.service;

import com.saberpro.model.AsignacionIncentivo;
import com.saberpro.model.EstudianteResultado;
import com.saberpro.repository.AsignacionIncentivoRepository;
import com.saberpro.repository.EstudianteResultadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AsignacionIncentivoService {

    @Autowired
    private AsignacionIncentivoRepository asignacionIncentivoRepository;
    
    @Autowired
    private EstudianteResultadoRepository estudianteResultadoRepository;

    // CRUD básico
    public List<AsignacionIncentivo> obtenerTodos() {
        return asignacionIncentivoRepository.findAll();
    }

    public long contarTodos() {
        return asignacionIncentivoRepository.count();
    }

    public Optional<AsignacionIncentivo> obtenerPorId(String id) {
        return asignacionIncentivoRepository.findById(id);
    }

    public AsignacionIncentivo guardar(AsignacionIncentivo incentivo) {
        return asignacionIncentivoRepository.save(incentivo);
    }

    public void eliminar(String id) {
        try {
                asignacionIncentivoRepository.deleteById(id);
        } catch (Exception e) {
            throw e;
        }
    }

    // Métodos de negocio
    public List<EstudianteResultado> obtenerEstudiantesElegibles() {
        return estudianteResultadoRepository.findByPuntajeGlobalGreaterThanEqual(180);
    }

    public AsignacionIncentivo asignarIncentivo(String documentoEstudiante, String tipoIncentivoNombre, 
                                              String descripcion, Double monto, String asignadoPor) {
        // Verificar que el estudiante existe y es elegible
        EstudianteResultado estudiante = estudianteResultadoRepository.findByDocumento(documentoEstudiante);
        if (estudiante == null) {
            throw new RuntimeException("Estudiante no encontrado: " + documentoEstudiante);
        }
        
        if (estudiante.getPuntajeGlobal() == null || estudiante.getPuntajeGlobal() < 180) {
            throw new RuntimeException("El estudiante no es elegible para incentivos (puntaje < 180)");
        }

        // Verificar que no tenga incentivos activos
        List<AsignacionIncentivo> incentivosActivos = asignacionIncentivoRepository
            .findIncentivoActivoPorEstudiante(documentoEstudiante);
        
        if (!incentivosActivos.isEmpty()) {
            throw new RuntimeException("El estudiante ya tiene un incentivo activo");
        }

        // Crear nueva asignación usando el constructor básico
        AsignacionIncentivo nuevaAsignacion = new AsignacionIncentivo();
        nuevaAsignacion.setDocumentoEstudiante(documentoEstudiante);
        
        // Construir nombre completo
        String nombreCompleto = String.format("%s %s %s %s", 
            estudiante.getPrimerNombre() != null ? estudiante.getPrimerNombre() : "",
            estudiante.getSegundoNombre() != null ? estudiante.getSegundoNombre() : "",
            estudiante.getPrimerApellido() != null ? estudiante.getPrimerApellido() : "",
            estudiante.getSegundoApellido() != null ? estudiante.getSegundoApellido() : ""
        ).trim().replaceAll("\\s+", " ");
        
        nuevaAsignacion.setNombreCompleto(nombreCompleto);
        nuevaAsignacion.setProgramaAcademico(estudiante.getProgramaAcademico());
        nuevaAsignacion.setPuntajeObtenido(estudiante.getPuntajeGlobal());
        nuevaAsignacion.setAsignadoPor(asignadoPor);
        nuevaAsignacion.setObservaciones(descripcion);
        nuevaAsignacion.setEvaluacionAutomatica(false);  // Es asignación manual
        nuevaAsignacion.setEstado("PENDIENTE");
        nuevaAsignacion.setFechaAsignacion(LocalDateTime.now());

        return asignacionIncentivoRepository.save(nuevaAsignacion);
    }

    public AsignacionIncentivo aprobarIncentivo(String id, String aprobadoPor, String observaciones) {
        AsignacionIncentivo incentivo = asignacionIncentivoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incentivo no encontrado: " + id));
        
        if (!"PENDIENTE".equals(incentivo.getEstado())) {
            throw new RuntimeException("Solo se pueden aprobar incentivos en estado PENDIENTE");
        }

        incentivo.setEstado("APROBADO");
        incentivo.setAprobadoPor(aprobadoPor);
        incentivo.setObservaciones(observaciones);
        
        return asignacionIncentivoRepository.save(incentivo);
    }

    public AsignacionIncentivo entregarIncentivo(String id, String observaciones) {
        AsignacionIncentivo incentivo = asignacionIncentivoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incentivo no encontrado: " + id));
        
        if (!"APROBADO".equals(incentivo.getEstado())) {
            throw new RuntimeException("Solo se pueden entregar incentivos en estado APROBADO");
        }

        incentivo.setEstado("ENTREGADO");
        if (observaciones != null && !observaciones.trim().isEmpty()) {
            String observacionesActuales = incentivo.getObservaciones() != null ? incentivo.getObservaciones() : "";
            incentivo.setObservaciones(observacionesActuales + "\nEntrega: " + observaciones);
        }
        
        return asignacionIncentivoRepository.save(incentivo);
    }

    public AsignacionIncentivo rechazarIncentivo(String id, String motivoRechazo) {
        AsignacionIncentivo incentivo = asignacionIncentivoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incentivo no encontrado: " + id));
        
        if ("ENTREGADO".equals(incentivo.getEstado())) {
            throw new RuntimeException("No se puede rechazar un incentivo ya entregado");
        }

        incentivo.setEstado("RECHAZADO");
        String observacionesActuales = incentivo.getObservaciones() != null ? incentivo.getObservaciones() : "";
        incentivo.setObservaciones(observacionesActuales + "\nRechazado: " + motivoRechazo);
        
        return asignacionIncentivoRepository.save(incentivo);
    }

    // Métodos de consulta
    public List<AsignacionIncentivo> obtenerPorEstudiante(String documentoEstudiante) {
        return asignacionIncentivoRepository.findByDocumentoEstudiante(documentoEstudiante);
    }

    public List<AsignacionIncentivo> obtenerPorEstado(String estado) {
        return asignacionIncentivoRepository.findByEstadoOrderByFechaAsignacionDesc(estado);
    }

    public long contarPorEstado(String estado) {
        return asignacionIncentivoRepository.countByEstado(estado);
    }

    public List<AsignacionIncentivo> obtenerPorPrograma(String programa) {
        return asignacionIncentivoRepository.findByProgramaAcademico(programa);
    }

    public List<AsignacionIncentivo> obtenerRecientes() {
        return asignacionIncentivoRepository.findTop10ByOrderByFechaCreacionDesc();
    }

    public long contarAutomaticos() {
        return asignacionIncentivoRepository.countByEvaluacionAutomaticaTrue();
    }

    public double sumatoriaMontos(String estado) {
        List<AsignacionIncentivo> incentivos;

        if (estado == null) {
            incentivos = asignacionIncentivoRepository.findAll();
        } else {
            incentivos = asignacionIncentivoRepository.findByEstadoForSum(estado);
        }

        return incentivos.stream()
            .filter(i -> i.getTipoIncentivo() != null)
            .mapToDouble(i -> i.getTipoIncentivo().getMonto())
            .sum();
    }

    // Estadísticas
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> estadisticas = new HashMap<>();
        
        // Conteos por estado
        estadisticas.put("pendientes", asignacionIncentivoRepository.countByEstado("PENDIENTE"));
        estadisticas.put("aprobados", asignacionIncentivoRepository.countByEstado("APROBADO"));
        estadisticas.put("entregados", asignacionIncentivoRepository.countByEstado("ENTREGADO"));
        estadisticas.put("rechazados", asignacionIncentivoRepository.countByEstado("RECHAZADO"));
        
        // Total de incentivos
        estadisticas.put("total", asignacionIncentivoRepository.count());
        
        // Estudiantes elegibles
        estadisticas.put("elegibles", estudianteResultadoRepository.countByPuntajeGlobalGreaterThanEqual(180));
        
        // Montos totales
        List<AsignacionIncentivo> aprobados = asignacionIncentivoRepository.findByEstadoForSum("APROBADO");
        List<AsignacionIncentivo> entregados = asignacionIncentivoRepository.findByEstadoForSum("ENTREGADO");
        
        double montoAprobado = aprobados.stream()
            .filter(i -> i.getMonto() != null)
            .mapToDouble(AsignacionIncentivo::getMonto)
            .sum();
            
        double montoEntregado = entregados.stream()
            .filter(i -> i.getMonto() != null)
            .mapToDouble(AsignacionIncentivo::getMonto)
            .sum();
        
        estadisticas.put("montoAprobado", montoAprobado);
        estadisticas.put("montoEntregado", montoEntregado);
        
        // Distribución por tipo
        Map<String, Long> distribucionTipos = Arrays.asList("BECA_ECONOMICA", "RECONOCIMIENTO", "EXONERACION", "PREMIO")
            .stream()
            .collect(Collectors.toMap(
                tipo -> tipo,
                tipo -> asignacionIncentivoRepository.countByTipoIncentivo(tipo)
            ));
        estadisticas.put("distribucionTipos", distribucionTipos);
        
        // Distribución por programa
        List<AsignacionIncentivo> todos = asignacionIncentivoRepository.findAll();
        Map<String, Long> distribucionProgramas = todos.stream()
            .filter(i -> i.getProgramaAcademico() != null)
            .collect(Collectors.groupingBy(
                AsignacionIncentivo::getProgramaAcademico,
                Collectors.counting()
            ));
        estadisticas.put("distribucionProgramas", distribucionProgramas);
        
        return estadisticas;
    }

    // Validaciones
    public boolean estudianteEsElegible(String documentoEstudiante) {
        EstudianteResultado estudiante = estudianteResultadoRepository.findByDocumento(documentoEstudiante);
        return estudiante != null && estudiante.getPuntajeGlobal() != null && estudiante.getPuntajeGlobal() >= 180;
    }

    public boolean estudianteTieneIncentivoActivo(String documentoEstudiante) {
        List<AsignacionIncentivo> activos = asignacionIncentivoRepository
            .findIncentivoActivoPorEstudiante(documentoEstudiante);
        return !activos.isEmpty();
    }

    // Reportes
    public List<Map<String, Object>> generarReporteIncentivos() {
        List<AsignacionIncentivo> incentivos = asignacionIncentivoRepository.findAll();
        
        return incentivos.stream().map(incentivo -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", incentivo.getId());
            item.put("documento", incentivo.getDocumentoEstudiante());
            item.put("nombreCompleto", incentivo.getNombreCompleto());
            item.put("programa", incentivo.getProgramaAcademico());
            item.put("puntaje", incentivo.getPuntajeObtenido());
            item.put("tipoIncentivo", incentivo.getTipoIncentivo());
            item.put("descripcion", incentivo.getDescripcion());
            item.put("monto", incentivo.getMonto());
            item.put("estado", incentivo.getEstado());
            item.put("fechaAsignacion", incentivo.getFechaAsignacion() != null ? 
                incentivo.getFechaAsignacion().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
            item.put("asignadoPor", incentivo.getAsignadoPor());
            item.put("observaciones", incentivo.getObservaciones());
            return item;
        }).collect(Collectors.toList());
    }

    // Tipos de incentivos predefinidos
    public List<Map<String, Object>> obtenerTiposIncentivos() {
        List<Map<String, Object>> tipos = new ArrayList<>();
        
        Map<String, Object> beca = new HashMap<>();
        beca.put("tipo", "BECA_ECONOMICA");
        beca.put("nombre", "Beca Económica");
        beca.put("descripcion", "Incentivo económico en efectivo");
        beca.put("montoSugerido", 1000000.0);
        tipos.add(beca);
        
        Map<String, Object> reconocimiento = new HashMap<>();
        reconocimiento.put("tipo", "RECONOCIMIENTO");
        reconocimiento.put("nombre", "Reconocimiento Académico");
        reconocimiento.put("descripcion", "Diploma de honor y reconocimiento público");
        reconocimiento.put("montoSugerido", 0.0);
        tipos.add(reconocimiento);
        
        Map<String, Object> exoneracion = new HashMap<>();
        exoneracion.put("tipo", "EXONERACION");
        exoneracion.put("nombre", "Exoneración de Tasas");
        exoneracion.put("descripcion", "Exoneración de derechos de grado o matrícula");
        exoneracion.put("montoSugerido", 500000.0);
        tipos.add(exoneracion);
        
        Map<String, Object> premio = new HashMap<>();
        premio.put("tipo", "PREMIO");
        premio.put("nombre", "Premio Especial");
        premio.put("descripcion", "Premio especial por excelencia académica");
        premio.put("montoSugerido", 2000000.0);
        tipos.add(premio);
        
        return tipos;
    }
}