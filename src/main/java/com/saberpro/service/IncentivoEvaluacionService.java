package com.saberpro.service;

import com.saberpro.model.AsignacionIncentivo;
import com.saberpro.model.EstudianteResultado;
import com.saberpro.model.ResultadoSaberPro;
import com.saberpro.model.TipoIncentivo;
import com.saberpro.repository.AsignacionIncentivoRepository;
import com.saberpro.repository.EstudianteResultadoRepository;
import com.saberpro.repository.TipoIncentivoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class IncentivoEvaluacionService {
    
    private static final Logger logger = LoggerFactory.getLogger(IncentivoEvaluacionService.class);
    
    @Autowired
    private TipoIncentivoRepository tipoIncentivoRepository;
    
    @Autowired
    private AsignacionIncentivoRepository asignacionIncentivoRepository;
    
    @Autowired
    private EstudianteResultadoRepository estudianteResultadoRepository;
    
    /**
     * Evalúa automáticamente qué incentivos aplican para un estudiante
     * basándose en su puntaje SABER PRO y los tipos de incentivos configurados
     */
    public List<AsignacionIncentivo> evaluarIncentivosPorEstudiante(ResultadoSaberPro estudiante) {
        System.out.println("🎯 [EVALUACION] Iniciando evaluación automática para: " + 
                   estudiante.getNombreCompleto() + " (" + estudiante.getDocumento() + ")");
        
        List<AsignacionIncentivo> incentivosAsignados = new ArrayList<>();
        
        // Obtener puntaje global del estudiante
        int puntajeGlobal = estudiante.getPuntajeGlobal() != null ? estudiante.getPuntajeGlobal() : 0;
        System.out.println("🎯 [EVALUACION] Puntaje SABER PRO: " + puntajeGlobal);
        
        // Verificar si ya tiene incentivos asignados
        List<AsignacionIncentivo> incentivosExistentes = 
            asignacionIncentivoRepository.findByDocumentoEstudiante(estudiante.getDocumento());
        System.out.println("🎯 [EVALUACION] Incentivos existentes: " + incentivosExistentes.size());
        
        // Obtener todos los tipos de incentivos aplicables para este puntaje
        List<TipoIncentivo> tiposAplicables = tipoIncentivoRepository.findIncentivosPorPuntaje(puntajeGlobal);
        System.out.println("🎯 [EVALUACION] Tipos aplicables encontrados: " + tiposAplicables.size());
        
        logger.info("📋 Encontrados {} tipos de incentivos aplicables para puntaje {}", 
                   tiposAplicables.size(), puntajeGlobal);
        
        return evaluarIncentivosComun(estudiante.getDocumento(), estudiante.getNombreCompleto(), 
                                     estudiante.getProgramaAcademico(), puntajeGlobal, 
                                     incentivosExistentes, tiposAplicables);
    }

    /**
     * Evalúa automáticamente qué incentivos aplican para un estudiante (EstudianteResultado)
     * basándose en su puntaje SABER PRO y los tipos de incentivos configurados
     */
    public List<AsignacionIncentivo> evaluarIncentivosPorEstudiante(EstudianteResultado estudiante) {
        System.out.println("🎯 [EVALUACION] Iniciando evaluación automática para: " + 
                   estudiante.getNombreCompleto() + " (" + estudiante.getDocumento() + ")");
        
        List<AsignacionIncentivo> incentivosAsignados = new ArrayList<>();
        
        // Obtener puntaje global del estudiante
        int puntajeGlobal = estudiante.getPuntajeGlobal() != null ? estudiante.getPuntajeGlobal() : 0;
        System.out.println("🎯 [EVALUACION] Puntaje SABER PRO: " + puntajeGlobal);
        
        // Verificar si ya tiene incentivos asignados
        List<AsignacionIncentivo> incentivosExistentes = 
            asignacionIncentivoRepository.findByDocumentoEstudiante(estudiante.getDocumento());
        System.out.println("🎯 [EVALUACION] Incentivos existentes: " + incentivosExistentes.size());
        
        // Obtener todos los tipos de incentivos aplicables para este puntaje
        List<TipoIncentivo> tiposAplicables = tipoIncentivoRepository.findIncentivosPorPuntaje(puntajeGlobal);
        System.out.println("🎯 [EVALUACION] Tipos aplicables encontrados: " + tiposAplicables.size());
        
        logger.info("📋 Encontrados {} tipos de incentivos aplicables para puntaje {}", 
                   tiposAplicables.size(), puntajeGlobal);
        
        return evaluarIncentivosComun(estudiante.getDocumento(), estudiante.getNombreCompleto(), 
                                     estudiante.getProgramaAcademico(), puntajeGlobal, 
                                     incentivosExistentes, tiposAplicables);
    }
    
    /**
     * Método común para evaluar incentivos independientemente del tipo de entidad estudiante
     */
    private List<AsignacionIncentivo> evaluarIncentivosComun(String documento, String nombreCompleto, 
                                                            String programaAcademico, int puntajeGlobal,
                                                            List<AsignacionIncentivo> incentivosExistentes,
                                                            List<TipoIncentivo> tiposAplicables) {
        
        List<AsignacionIncentivo> incentivosAsignados = new ArrayList<>();
        
        for (TipoIncentivo tipo : tiposAplicables) {
            // Verificar si ya tiene este tipo de incentivo
            boolean yaAsignado = incentivosExistentes.stream()
                .anyMatch(incentivo -> 
                    incentivo.getTipoIncentivo() != null && 
                    incentivo.getTipoIncentivo().getId().equals(tipo.getId())
                );
            
            if (!yaAsignado && tipo.esElegible(puntajeGlobal)) {
                // Crear nueva asignación automática
                AsignacionIncentivo nuevaAsignacion = new AsignacionIncentivo(
                    documento,
                    nombreCompleto,
                    tipo,
                    programaAcademico,
                    puntajeGlobal,
                    true // Es evaluación automática
                );
                
                incentivosAsignados.add(nuevaAsignacion);
                
                logger.info("✅ Incentivo automático asignado: {} para {} (puntaje: {})", 
                           tipo.getNombre(), documento, puntajeGlobal);
            } else if (yaAsignado) {
                logger.info("ℹ️ Incentivo {} ya está asignado para {}", 
                           tipo.getNombre(), documento);
            }
        }
        
        return incentivosAsignados;
    }
    
    /**
     * Guarda las asignaciones automáticas en la base de datos
     */
    public List<AsignacionIncentivo> guardarAsignacionesAutomaticas(List<AsignacionIncentivo> asignaciones) {
        if (asignaciones.isEmpty()) {
            return asignaciones;
        }
        
        try {
            List<AsignacionIncentivo> guardadas = asignacionIncentivoRepository.saveAll(asignaciones);
            logger.info("💾 Guardadas {} asignaciones automáticas de incentivos", guardadas.size());
            return guardadas;
        } catch (Exception e) {
            logger.error("❌ Error guardando asignaciones automáticas: {}", e.getMessage());
            throw new RuntimeException("Error al guardar asignaciones automáticas", e);
        }
    }
    
    /**
     * Procesa un estudiante completo: evalúa y guarda automáticamente los incentivos
     */
    public List<AsignacionIncentivo> procesarEstudianteCompleto(ResultadoSaberPro estudiante) {
        List<AsignacionIncentivo> incentivos = evaluarIncentivosPorEstudiante(estudiante);
        
        if (!incentivos.isEmpty()) {
            return guardarAsignacionesAutomaticas(incentivos);
        }
        
        return incentivos;
    }
    
    /**
     * Procesa un estudiante completo: evalúa y guarda automáticamente los incentivos (EstudianteResultado)
     */
    public List<AsignacionIncentivo> procesarEstudianteCompleto(EstudianteResultado estudiante) {
        List<AsignacionIncentivo> incentivos = evaluarIncentivosPorEstudiante(estudiante);
        
        if (!incentivos.isEmpty()) {
            return guardarAsignacionesAutomaticas(incentivos);
        }
        
        return incentivos;
    }
    
    /**
     * Evalúa todos los estudiantes existentes y asigna incentivos automáticamente (EstudianteResultado)
     * @return número de nuevas asignaciones creadas
     */
    public int reevaluarTodosLosEstudiantes(List<EstudianteResultado> estudiantes) {
        logger.info("🔄 Iniciando reevaluación de {} estudiantes para incentivos automáticos", estudiantes.size());
        
        int totalAsignaciones = 0;
        int incentivosEliminados = 0;
        
        // Primero, eliminar incentivos de tipos inactivos
        incentivosEliminados = eliminarIncentivosInactivos();
        logger.info("🗑️ Eliminados {} incentivos de tipos inactivos", incentivosEliminados);
        
        for (EstudianteResultado estudiante : estudiantes) {
            try {
                List<AsignacionIncentivo> nuevasAsignaciones = procesarEstudianteCompleto(estudiante);
                totalAsignaciones += nuevasAsignaciones.size();
            } catch (Exception e) {
                logger.error("❌ Error procesando estudiante {}: {}", estudiante.getDocumento(), e.getMessage());
            }
        }
        
        logger.info("🎉 Reevaluación completada: {} incentivos eliminados (inactivos), {} nuevas asignaciones automáticas creadas", 
                   incentivosEliminados, totalAsignaciones);
        return totalAsignaciones;
    }

    /**
     * Obtiene estadísticas de incentivos automáticos vs manuales
     */
    public EstatisticasIncentivos obtenerEstadisticasEvaluacion() {
        long totalIncentivos = asignacionIncentivoRepository.count();
        long automaticos = asignacionIncentivoRepository.countByEvaluacionAutomaticaTrue();
        long manuales = totalIncentivos - automaticos;
        
        return new EstatisticasIncentivos(totalIncentivos, automaticos, manuales);
    }
    
    // Clase interna para estadísticas
    public static class EstatisticasIncentivos {
        private final long total;
        private final long automaticos;
        private final long manuales;
        
        public EstatisticasIncentivos(long total, long automaticos, long manuales) {
            this.total = total;
            this.automaticos = automaticos;
            this.manuales = manuales;
        }
        
        public long getTotal() { return total; }
        public long getAutomaticos() { return automaticos; }
        public long getManuales() { return manuales; }
        public double getPorcentajeAutomaticos() { 
            return total > 0 ? (double) automaticos / total * 100 : 0;
        }
    }
    
    /**
     * Elimina todos los incentivos asignados que corresponden a tipos de incentivos inactivos
     * @return número de incentivos eliminados
     */
    private int eliminarIncentivosInactivos() {
        logger.info("🗑️ Iniciando eliminación de incentivos de tipos inactivos");
        
        // Obtener todos los tipos de incentivos inactivos
        List<TipoIncentivo> tiposInactivos = tipoIncentivoRepository.findByActivoFalse();
        logger.info("🗑️ Encontrados {} tipos de incentivos inactivos", tiposInactivos.size());
        
        int totalEliminados = 0;
        
        for (TipoIncentivo tipoInactivo : tiposInactivos) {
            try {
                // Buscar todas las asignaciones de este tipo de incentivo
                List<AsignacionIncentivo> asignacionesAEliminar = 
                    asignacionIncentivoRepository.findByTipoIncentivoId(tipoInactivo.getId());
                
                logger.info("🗑️ Eliminando {} asignaciones del tipo inactivo: {}", 
                           asignacionesAEliminar.size(), tipoInactivo.getNombre());
                
                // Eliminar cada asignación
                for (AsignacionIncentivo asignacion : asignacionesAEliminar) {
                    logger.info("🗑️ Eliminando incentivo de {} ({}): {}", 
                               asignacion.getNombreCompleto(), asignacion.getDocumentoEstudiante(), 
                               tipoInactivo.getNombre());
                    asignacionIncentivoRepository.delete(asignacion);
                    totalEliminados++;
                }
                
            } catch (Exception e) {
                logger.error("❌ Error eliminando incentivos del tipo {}: {}", 
                            tipoInactivo.getNombre(), e.getMessage());
            }
        }
        
        logger.info("🗑️ Eliminación completada: {} incentivos eliminados de tipos inactivos", totalEliminados);
        return totalEliminados;
    }

    /**
     * Elimina todas las asignaciones automáticas de incentivos
     */
    public int eliminarAsignacionesAutomaticas() {
        logger.info("🧹 Iniciando eliminación de todas las asignaciones automáticas");
        
        try {
            List<AsignacionIncentivo> todasAsignaciones = asignacionIncentivoRepository.findAll();
            logger.info("🧹 Encontradas {} asignaciones totales", todasAsignaciones.size());
            
            // Filtrar solo las automáticas (evaluacionAutomatica = true)
            List<AsignacionIncentivo> automaticas = todasAsignaciones.stream()
                .filter(asignacion -> asignacion.isEvaluacionAutomatica())
                .toList();
            
            logger.info("🧹 Eliminando {} asignaciones automáticas", automaticas.size());
            
            for (AsignacionIncentivo asignacion : automaticas) {
                asignacionIncentivoRepository.delete(asignacion);
                logger.debug("🗑️ Eliminada asignación automática: {} para documento {}", 
                           asignacion.getTipoIncentivo().getNombre(), 
                           asignacion.getDocumentoEstudiante());
            }
            
            logger.info("✅ Eliminación completada: {} asignaciones automáticas eliminadas", automaticas.size());
            return automaticas.size();
            
        } catch (Exception e) {
            logger.error("❌ Error eliminando asignaciones automáticas: {}", e.getMessage());
            throw new RuntimeException("Error eliminando asignaciones automáticas", e);
        }
    }

    /**
     * Regenera las asignaciones automáticas basándose en los estudiantes actuales en estudiantes_resultados
     */
    public int regenerarAsignacionesAutomaticas() {
        logger.info("🔄 Iniciando regeneración de asignaciones automáticas");
        
        try {
            // Obtener todos los estudiantes con resultados SABER PRO
            List<EstudianteResultado> estudiantes = estudianteResultadoRepository.findAll();
            logger.info("🔄 Encontrados {} estudiantes en estudiantes_resultados", estudiantes.size());
            
            int regeneradas = 0;
            
            for (EstudianteResultado estudiante : estudiantes) {
                try {
                    logger.info("🔄 Procesando estudiante: {} ({})", 
                               estudiante.getNombreCompleto(), estudiante.getDocumento());
                    
                    // Convertir EstudianteResultado a ResultadoSaberPro para reutilizar lógica existente
                    ResultadoSaberPro resultadoSP = new ResultadoSaberPro();
                    resultadoSP.setDocumento(estudiante.getDocumento());
                    // Dividir el nombre completo en primer nombre (aproximación)
                    String nombreCompleto = estudiante.getNombreCompleto();
                    if (nombreCompleto != null && !nombreCompleto.trim().isEmpty()) {
                        String[] partes = nombreCompleto.trim().split("\\s+");
                        if (partes.length > 0) {
                            resultadoSP.setPrimerNombre(partes[0]);
                        }
                        if (partes.length > 1) {
                            resultadoSP.setPrimerApellido(partes[1]);
                        }
                    }
                    resultadoSP.setProgramaAcademico(estudiante.getProgramaAcademico());
                    resultadoSP.setPuntajeGlobal(estudiante.getPuntajeGlobal());
                    
                    // Evaluar incentivos para este estudiante
                    List<AsignacionIncentivo> incentivosNuevos = evaluarIncentivosPorEstudiante(resultadoSP);
                    regeneradas += incentivosNuevos.size();
                    
                    logger.info("🔄 Generados {} incentivos para estudiante {}", 
                               incentivosNuevos.size(), estudiante.getDocumento());
                    
                } catch (Exception e) {
                    logger.error("❌ Error procesando estudiante {}: {}", 
                                estudiante.getDocumento(), e.getMessage());
                }
            }
            
            logger.info("✅ Regeneración completada: {} asignaciones automáticas creadas", regeneradas);
            return regeneradas;
            
        } catch (Exception e) {
            logger.error("❌ Error regenerando asignaciones automáticas: {}", e.getMessage());
            throw new RuntimeException("Error regenerando asignaciones automáticas", e);
        }
    }

    /**
     * Reevalúa completamente un estudiante específico: elimina sus asignaciones automáticas existentes 
     * y crea nuevas basadas en su puntaje actual
     */
    public int reevaluarEstudianteIndividual(EstudianteResultado estudiante) {
        logger.info("🎯 Iniciando reevaluación individual para estudiante: {} (Puntaje: {})", 
                   estudiante.getDocumento(), estudiante.getPuntajeGlobal());
        
        try {
            // 1. Eliminar todas las asignaciones automáticas existentes del estudiante
            List<AsignacionIncentivo> todasAsignaciones = asignacionIncentivoRepository
                .findByDocumentoEstudiante(estudiante.getDocumento());
            
            // Filtrar solo las automáticas
            List<AsignacionIncentivo> asignacionesAutomaticas = todasAsignaciones.stream()
                .filter(asignacion -> asignacion.isEvaluacionAutomatica())
                .toList();
            
            int asignacionesEliminadas = asignacionesAutomaticas.size();
            logger.info("🗑️ Eliminando {} asignaciones automáticas existentes del estudiante {}", 
                       asignacionesEliminadas, estudiante.getDocumento());
            
            for (AsignacionIncentivo asignacion : asignacionesAutomaticas) {
                asignacionIncentivoRepository.delete(asignacion);
                logger.info("🗑️ Eliminada asignación: {} - {}", 
                           asignacion.getTipoIncentivo().getNombre(), asignacion.getEstado());
            }
            
            // 2. Evaluar incentivos que corresponden al puntaje actual
            List<AsignacionIncentivo> nuevasAsignaciones = evaluarIncentivosPorEstudiante(estudiante);
            logger.info("🔍 Evaluados {} incentivos aplicables para puntaje {}", 
                       nuevasAsignaciones.size(), estudiante.getPuntajeGlobal());
            
            // 3. Guardar las nuevas asignaciones automáticas
            int nuevasAsignacionesCreadas = 0;
            if (!nuevasAsignaciones.isEmpty()) {
                List<AsignacionIncentivo> guardadas = guardarAsignacionesAutomaticas(nuevasAsignaciones);
                nuevasAsignacionesCreadas = guardadas.size();
                logger.info("💾 Guardadas {} nuevas asignaciones automáticas", nuevasAsignacionesCreadas);
                
                for (AsignacionIncentivo asignacion : guardadas) {
                    logger.info("✅ Nueva asignación: {} - {} puntos requeridos", 
                               asignacion.getTipoIncentivo().getNombre(), 
                               asignacion.getTipoIncentivo().getPuntajeMinimo());
                }
            }
            
            logger.info("🎯 Reevaluación individual completada para {}: {} eliminadas → {} creadas", 
                       estudiante.getDocumento(), asignacionesEliminadas, nuevasAsignacionesCreadas);
            
            return nuevasAsignacionesCreadas;
            
        } catch (Exception e) {
            logger.error("❌ Error en reevaluación individual del estudiante {}: {}", 
                        estudiante.getDocumento(), e.getMessage());
            throw new RuntimeException("Error en reevaluación individual", e);
        }
    }
}