package com.saberpro.service;

import com.saberpro.model.AsignacionIncentivo;
import com.saberpro.model.EstudianteResultado;
import com.saberpro.model.ResultadoSaberPro;
import com.saberpro.model.TipoIncentivo;
import com.saberpro.repository.AsignacionIncentivoRepository;
import com.saberpro.repository.EstudianteResultadoRepository;
import com.saberpro.repository.TipoIncentivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncentivoEvaluacionService {

    @Autowired
    private TipoIncentivoRepository tipoIncentivoRepository;

    @Autowired
    private AsignacionIncentivoRepository asignacionIncentivoRepository;

    @Autowired
    private EstudianteResultadoRepository estudianteResultadoRepository;

    /**
     * Evalúa automáticamente qué incentivos aplican para un estudiante basándose en su puntaje SABER PRO.
     */
    public List<AsignacionIncentivo> evaluarIncentivosPorEstudiante(ResultadoSaberPro estudiante) {
        int puntajeGlobal = estudiante.getPuntajeGlobal() != null ? estudiante.getPuntajeGlobal() : 0;
        List<AsignacionIncentivo> incentivosExistentes =
            asignacionIncentivoRepository.findByDocumentoEstudiante(estudiante.getDocumento());
        List<TipoIncentivo> tiposAplicables = tipoIncentivoRepository.findIncentivosPorPuntaje(puntajeGlobal);

        return evaluarIncentivosComun(
            estudiante.getDocumento(),
            estudiante.getNombreCompleto(),
            estudiante.getProgramaAcademico(),
            puntajeGlobal,
            incentivosExistentes,
            tiposAplicables
        );
    }

    /**
     * Evalúa automáticamente qué incentivos aplican para un estudiante (EstudianteResultado) basándose en su puntaje.
     */
    public List<AsignacionIncentivo> evaluarIncentivosPorEstudiante(EstudianteResultado estudiante) {
        int puntajeGlobal = estudiante.getPuntajeGlobal() != null ? estudiante.getPuntajeGlobal() : 0;
        List<AsignacionIncentivo> incentivosExistentes =
            asignacionIncentivoRepository.findByDocumentoEstudiante(estudiante.getDocumento());
        List<TipoIncentivo> tiposAplicables = tipoIncentivoRepository.findIncentivosPorPuntaje(puntajeGlobal);

        return evaluarIncentivosComun(
            estudiante.getDocumento(),
            estudiante.getNombreCompleto(),
            estudiante.getProgramaAcademico(),
            puntajeGlobal,
            incentivosExistentes,
            tiposAplicables
        );
    }

    /**
     * Método común para evaluar incentivos independientemente del tipo de entidad estudiante.
     */
    private List<AsignacionIncentivo> evaluarIncentivosComun(
        String documento,
        String nombreCompleto,
        String programaAcademico,
        int puntajeGlobal,
        List<AsignacionIncentivo> incentivosExistentes,
        List<TipoIncentivo> tiposAplicables
    ) {
        List<AsignacionIncentivo> incentivosAsignados = new ArrayList<>();

        for (TipoIncentivo tipo : tiposAplicables) {
            boolean yaAsignado = incentivosExistentes.stream()
                .anyMatch(incentivo -> incentivo.getTipoIncentivo() != null
                    && incentivo.getTipoIncentivo().getId().equals(tipo.getId()));

            if (!yaAsignado && tipo.esElegible(puntajeGlobal)) {
                AsignacionIncentivo nuevaAsignacion = new AsignacionIncentivo(
                    documento,
                    nombreCompleto,
                    tipo,
                    programaAcademico,
                    puntajeGlobal,
                    true
                );
                incentivosAsignados.add(nuevaAsignacion);
            }
        }

        return incentivosAsignados;
    }

    /**
     * Guarda las asignaciones automáticas en la base de datos.
     */
    public List<AsignacionIncentivo> guardarAsignacionesAutomaticas(List<AsignacionIncentivo> asignaciones) {
        if (asignaciones.isEmpty()) {
            return asignaciones;
        }

        try {
            return asignacionIncentivoRepository.saveAll(asignaciones);
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar asignaciones automáticas", e);
        }
    }

    /**
     * Procesa un estudiante completo: evalúa y guarda automáticamente los incentivos.
     */
    public List<AsignacionIncentivo> procesarEstudianteCompleto(ResultadoSaberPro estudiante) {
        List<AsignacionIncentivo> incentivos = evaluarIncentivosPorEstudiante(estudiante);
        return incentivos.isEmpty() ? incentivos : guardarAsignacionesAutomaticas(incentivos);
    }

    /**
     * Procesa un estudiante completo (EstudianteResultado): evalúa y guarda automáticamente los incentivos.
     */
    public List<AsignacionIncentivo> procesarEstudianteCompleto(EstudianteResultado estudiante) {
        List<AsignacionIncentivo> incentivos = evaluarIncentivosPorEstudiante(estudiante);
        return incentivos.isEmpty() ? incentivos : guardarAsignacionesAutomaticas(incentivos);
    }

    /**
     * Evalúa todos los estudiantes existentes y asigna incentivos automáticamente.
     */
    public int reevaluarTodosLosEstudiantes(List<EstudianteResultado> estudiantes) {
        int totalAsignaciones = 0;
        eliminarIncentivosInactivos();

        for (EstudianteResultado estudiante : estudiantes) {
            try {
                List<AsignacionIncentivo> nuevasAsignaciones = procesarEstudianteCompleto(estudiante);
                totalAsignaciones += nuevasAsignaciones.size();
            } catch (Exception e) {
                // Continúa con el siguiente estudiante si ocurre un problema puntual
            }
        }

        return totalAsignaciones;
    }

    /**
     * Obtiene estadísticas de incentivos automáticos vs manuales.
     */
    public EstatisticasIncentivos obtenerEstadisticasEvaluacion() {
        long totalIncentivos = asignacionIncentivoRepository.count();
        long automaticos = asignacionIncentivoRepository.countByEvaluacionAutomaticaTrue();
        long manuales = totalIncentivos - automaticos;
        return new EstatisticasIncentivos(totalIncentivos, automaticos, manuales);
    }

    /**
     * Clase interna para estadísticas de incentivos.
     */
    public static class EstatisticasIncentivos {
        private final long total;
        private final long automaticos;
        private final long manuales;

        public EstatisticasIncentivos(long total, long automaticos, long manuales) {
            this.total = total;
            this.automaticos = automaticos;
            this.manuales = manuales;
        }

        public long getTotal() {
            return total;
        }

        public long getAutomaticos() {
            return automaticos;
        }

        public long getManuales() {
            return manuales;
        }

        public double getPorcentajeAutomaticos() {
            return total > 0 ? (double) automaticos / total * 100 : 0;
        }
    }

    /**
     * Elimina todos los incentivos asignados que corresponden a tipos de incentivos inactivos.
     */
    private int eliminarIncentivosInactivos() {
        List<TipoIncentivo> tiposInactivos = tipoIncentivoRepository.findByActivoFalse();
        int totalEliminados = 0;

        for (TipoIncentivo tipoInactivo : tiposInactivos) {
            try {
                List<AsignacionIncentivo> asignacionesAEliminar =
                    asignacionIncentivoRepository.findByTipoIncentivoId(tipoInactivo.getId());

                for (AsignacionIncentivo asignacion : asignacionesAEliminar) {
                    asignacionIncentivoRepository.delete(asignacion);
                    totalEliminados++;
                }
            } catch (Exception e) {
                // Continúa con el siguiente tipo inactivo si surge un problema puntual
            }
        }

        return totalEliminados;
    }

    /**
     * Elimina todas las asignaciones automáticas de incentivos.
     */
    public int eliminarAsignacionesAutomaticas() {
        try {
            List<AsignacionIncentivo> todasAsignaciones = asignacionIncentivoRepository.findAll();
            List<AsignacionIncentivo> automaticas = todasAsignaciones.stream()
                .filter(AsignacionIncentivo::isEvaluacionAutomatica)
                .collect(Collectors.toList());

            for (AsignacionIncentivo asignacion : automaticas) {
                asignacionIncentivoRepository.delete(asignacion);
            }

            return automaticas.size();
        } catch (Exception e) {
            throw new RuntimeException("Error eliminando asignaciones automáticas", e);
        }
    }

    /**
     * Regenera las asignaciones automáticas basándose en los estudiantes actuales.
     */
    public int regenerarAsignacionesAutomaticas() {
        try {
            List<EstudianteResultado> estudiantes = estudianteResultadoRepository.findAll();
            int regeneradas = 0;

            for (EstudianteResultado estudiante : estudiantes) {
                try {
                    ResultadoSaberPro resultadoSP = new ResultadoSaberPro();
                    resultadoSP.setDocumento(estudiante.getDocumento());

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

                    List<AsignacionIncentivo> incentivosNuevos = evaluarIncentivosPorEstudiante(resultadoSP);
                    regeneradas += incentivosNuevos.size();
                } catch (Exception e) {
                    // Continúa con los demás estudiantes si ocurre un problema puntual
                }
            }

            return regeneradas;
        } catch (Exception e) {
            throw new RuntimeException("Error regenerando asignaciones automáticas", e);
        }
    }

    /**
     * Reevalúa completamente un estudiante específico: elimina sus asignaciones automáticas existentes y crea nuevas.
     */
    public int reevaluarEstudianteIndividual(EstudianteResultado estudiante) {
        try {
            List<AsignacionIncentivo> todasAsignaciones = asignacionIncentivoRepository
                .findByDocumentoEstudiante(estudiante.getDocumento());

            List<AsignacionIncentivo> asignacionesAutomaticas = todasAsignaciones.stream()
                .filter(AsignacionIncentivo::isEvaluacionAutomatica)
                .collect(Collectors.toList());

            for (AsignacionIncentivo asignacion : asignacionesAutomaticas) {
                asignacionIncentivoRepository.delete(asignacion);
            }

            List<AsignacionIncentivo> nuevasAsignaciones = evaluarIncentivosPorEstudiante(estudiante);
            List<AsignacionIncentivo> guardadas = guardarAsignacionesAutomaticas(nuevasAsignaciones);

            return guardadas.size();
        } catch (Exception e) {
            throw new RuntimeException("Error en reevaluación individual", e);
        }
    }
}