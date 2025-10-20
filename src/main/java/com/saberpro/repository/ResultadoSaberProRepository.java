package com.saberpro.repository;

import com.saberpro.model.ResultadoSaberPro;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResultadoSaberProRepository extends MongoRepository<ResultadoSaberPro, String> {
    
    Optional<ResultadoSaberPro> findByDocumento(String documento);
    
    Optional<ResultadoSaberPro> findByNumeroRegistro(String numeroRegistro);
    
    List<ResultadoSaberPro> findByEstadoGraduacion(String estadoGraduacion);
    
    List<ResultadoSaberPro> findByPuntajeGlobalGreaterThanEqual(Integer puntajeMinimo);
    
    List<ResultadoSaberPro> findByPuntajeGlobalBetween(Integer puntajeMin, Integer puntajeMax);
    
    @Query("{ 'puntajeGlobal' : { $gte : ?0 } }")
    List<ResultadoSaberPro> findEstudiantesConIncentivos(Integer puntajeMinimo);
    
    @Query("{ 'puntajeGlobal' : { $lt : 80 } }")
    List<ResultadoSaberPro> findEstudiantesNoGraduables();
    
    List<ResultadoSaberPro> findByProgramaAcademicoContainingIgnoreCase(String programa);
    
    @Query("{ '$or' : [ { 'primerNombre' : { $regex : ?0, $options: 'i' } }, " +
           "{ 'primerApellido' : { $regex : ?0, $options: 'i' } }, " +
           "{ 'documento' : ?0 } ] }")
    List<ResultadoSaberPro> buscarPorNombreODocumento(String termino);
    
    long countByEstadoGraduacion(String estadoGraduacion);
    
    @Query("{ 'puntajeGlobal' : { $gte : ?0, $lte : ?1 } }")
    long countByPuntajeRange(Integer min, Integer max);
}