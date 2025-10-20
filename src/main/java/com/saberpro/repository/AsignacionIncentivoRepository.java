package com.saberpro.repository;

import com.saberpro.model.AsignacionIncentivo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsignacionIncentivoRepository extends MongoRepository<AsignacionIncentivo, String> {
    
    // Buscar por documento de estudiante
    List<AsignacionIncentivo> findByDocumentoEstudiante(String documentoEstudiante);
    
    // Buscar por estado
    List<AsignacionIncentivo> findByEstado(String estado);
    
    // Buscar por tipo de incentivo
    List<AsignacionIncentivo> findByTipoIncentivo(String tipoIncentivo);
    
    // Buscar por ID del tipo de incentivo
    @Query("{'tipoIncentivo.id': ?0}")
    List<AsignacionIncentivo> findByTipoIncentivoId(String tipoIncentivoId);
    
    // Buscar por programa académico
    List<AsignacionIncentivo> findByProgramaAcademico(String programaAcademico);
    
    // Buscar incentivos pendientes
    List<AsignacionIncentivo> findByEstadoOrderByFechaAsignacionDesc(String estado);
    
    // Buscar por rango de fechas
    List<AsignacionIncentivo> findByFechaAsignacionBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    // Buscar por puntaje mínimo
    List<AsignacionIncentivo> findByPuntajeObtenidoGreaterThanEqual(Integer puntajeMinimo);
    
    // Verificar si un estudiante ya tiene un incentivo activo
    @Query("{'documentoEstudiante': ?0, 'estado': {'$in': ['PENDIENTE', 'APROBADO']}}")
    List<AsignacionIncentivo> findIncentivoActivoPorEstudiante(String documentoEstudiante);
    
    // Buscar estudiantes elegibles sin incentivos asignados
    @Query("{'puntajeObtenido': {'$gte': 180}}")
    List<AsignacionIncentivo> findEstudiantesElegibles();
    
    // Estadísticas por estado
    @Query(value = "{'estado': ?0}", count = true)
    long countByEstado(String estado);
    
    // Estadísticas por tipo de incentivo
    @Query(value = "{'tipoIncentivo': ?0}", count = true)
    long countByTipoIncentivo(String tipoIncentivo);
    
    // Suma total de montos por estado
    @Query("{'estado': ?0}")
    List<AsignacionIncentivo> findByEstadoForSum(String estado);
    
    // Buscar incentivos asignados por usuario
    List<AsignacionIncentivo> findByAsignadoPor(String asignadoPor);
    
    // Buscar incentivos aprobados por usuario
    List<AsignacionIncentivo> findByAprobadoPor(String aprobadoPor);
    
    // Buscar últimos incentivos creados
    List<AsignacionIncentivo> findTop10ByOrderByFechaCreacionDesc();
    
    // Buscar por documento y verificar existencia
    Optional<AsignacionIncentivo> findFirstByDocumentoEstudianteAndEstadoIn(String documentoEstudiante, List<String> estados);
    
    // Buscar incentivos por múltiples criterios
    @Query("{'$and': [" +
           "{'estado': {'$regex': ?0, '$options': 'i'}}, " +
           "{'tipoIncentivo': {'$regex': ?1, '$options': 'i'}}, " +
           "{'programaAcademico': {'$regex': ?2, '$options': 'i'}}" +
           "]}")
    List<AsignacionIncentivo> findByCriteriosMultiples(String estado, String tipoIncentivo, String programaAcademico);
    
    // Eliminar incentivos antiguos (para limpieza)
    void deleteByFechaCreacionBefore(LocalDateTime fechaLimite);
    
    // Métodos para evaluación automática
    long countByEvaluacionAutomaticaTrue();
    List<AsignacionIncentivo> findByEvaluacionAutomaticaTrue();
    List<AsignacionIncentivo> findByEvaluacionAutomaticaFalse();
}