package com.saberpro.repository;

import com.saberpro.model.TipoIncentivo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TipoIncentivoRepository extends MongoRepository<TipoIncentivo, String> {
    
    // Buscar todos los tipos de incentivos activos
    List<TipoIncentivo> findByActivoTrue();
    
    // Buscar todos los tipos de incentivos inactivos
    List<TipoIncentivo> findByActivoFalse();
    
    // Buscar incentivos activos ordenados por puntaje mínimo ascendente
    @Query("{'activo': true}")
    List<TipoIncentivo> findActivosOrderByPuntajeMinimo();
    
    // Buscar incentivos que aplican para un puntaje específico
    @Query("{'activo': true, 'puntajeMinimo': {'$lte': ?0}}")
    List<TipoIncentivo> findIncentivosPorPuntaje(int puntaje);
    
    // Buscar incentivos por creador
    List<TipoIncentivo> findByCreadoPor(String creadoPor);
    
    // Buscar incentivos por rango de puntaje
    @Query("{'activo': true, 'puntajeMinimo': {'$gte': ?0, '$lte': ?1}}")
    List<TipoIncentivo> findByPuntajeRange(int puntajeMin, int puntajeMax);
    
    // Contar incentivos activos
    long countByActivoTrue();
    
    // Verificar si existe un incentivo con un nombre específico (para evitar duplicados)
    boolean existsByNombreAndActivoTrue(String nombre);
}