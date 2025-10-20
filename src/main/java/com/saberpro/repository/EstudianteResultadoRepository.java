package com.saberpro.repository;

import com.saberpro.model.EstudianteResultado;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface EstudianteResultadoRepository extends MongoRepository<EstudianteResultado, String> {
	EstudianteResultado findByDocumento(String documento);
	
	// Métodos para incentivos
	List<EstudianteResultado> findByPuntajeGlobalGreaterThanEqual(Integer puntajeMinimo);
	
	@Query(value = "{'puntajeGlobal': {'$gte': ?0}}", count = true)
	long countByPuntajeGlobalGreaterThanEqual(Integer puntajeMinimo);
	
	// Métodos adicionales para consultas
	List<EstudianteResultado> findByProgramaAcademico(String programaAcademico);
	
	List<EstudianteResultado> findByPuntajeGlobalBetween(Integer minimo, Integer maximo);
}
