package com.saberpro.service;

import com.saberpro.model.EstudianteResultado;
import com.saberpro.repository.EstudianteResultadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EstudianteService {
    
    @Autowired
    private EstudianteResultadoRepository estudianteRepo;
    
    public EstudianteResultado findByDocumentoConLogs(String documento) {
        System.out.println("🔍 === SERVICIO: BÚSQUEDA DE ESTUDIANTE ===");
        System.out.println("🔍 Documento buscado: '" + documento + "'");
        System.out.println("🔍 Tipo: " + documento.getClass().getSimpleName());
        System.out.println("🔍 Longitud: " + documento.length());
        System.out.println("🔍 Repositorio: " + estudianteRepo.getClass().getSimpleName());
        
        try {
            // Búsqueda directa
            System.out.println("🔍 Ejecutando búsqueda directa...");
            EstudianteResultado resultado = estudianteRepo.findByDocumento(documento);
            
            if (resultado != null) {
                System.out.println("✅ ESTUDIANTE ENCONTRADO en búsqueda directa:");
                System.out.println("✅ Documento (ID) en BD: '" + resultado.getDocumento() + "'");
                System.out.println("✅ Nombre: " + resultado.getNombreCompleto());
                System.out.println("🔍 === FIN SERVICIO BÚSQUEDA (EXITOSA) ===");
                return resultado;
            }
            
            System.out.println("❌ No encontrado en búsqueda directa");
            System.out.println("🔍 Ejecutando búsqueda exhaustiva...");
            
            // Búsqueda exhaustiva
            List<EstudianteResultado> todos = estudianteRepo.findAll();
            System.out.println("🔍 Total estudiantes en BD: " + todos.size());
            
            for (int i = 0; i < todos.size(); i++) {
                EstudianteResultado est = todos.get(i);
                String docBD = est.getDocumento();
                
                System.out.println("🔍 Comparando " + (i+1) + "/" + todos.size() + ":");
                System.out.println("    BD: '" + docBD + "' vs Buscado: '" + documento + "'");
                System.out.println("    Equals: " + documento.equals(docBD));
                System.out.println("    EqualsIgnoreCase: " + documento.equalsIgnoreCase(docBD));
                
                if (documento.equals(docBD)) {
                    System.out.println("✅ ¡COINCIDENCIA ENCONTRADA en búsqueda exhaustiva!");
                    System.out.println("✅ Estudiante: " + est.getNombreCompleto());
                    System.out.println("🔍 === FIN SERVICIO BÚSQUEDA (EXITOSA) ===");
                    return est;
                }
            }
            
            System.out.println("❌ ESTUDIANTE NO ENCONTRADO después de búsqueda exhaustiva");
            System.out.println("🔍 === FIN SERVICIO BÚSQUEDA (NO ENCONTRADO) ===");
            return null;
            
        } catch (Exception e) {
            System.err.println("💥 ERROR en servicio de búsqueda:");
            System.err.println("💥 Excepción: " + e.getClass().getSimpleName());
            System.err.println("💥 Mensaje: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public List<EstudianteResultado> findAllConLogs() {
        System.out.println("🔍 === SERVICIO: LISTAR TODOS LOS ESTUDIANTES ===");
        
        try {
            List<EstudianteResultado> estudiantes = estudianteRepo.findAll();
            System.out.println("🔍 Repositorio consultado: " + estudianteRepo.getClass().getSimpleName());
            System.out.println("🔍 Total encontrados: " + estudiantes.size());
            
            if (estudiantes.isEmpty()) {
                System.out.println("⚠️ COLECCIÓN VACÍA - No hay estudiantes en la base de datos");
            }
            
            System.out.println("🔍 === FIN SERVICIO LISTAR (EXITOSO) ===");
            return estudiantes;
            
        } catch (Exception e) {
            System.err.println("💥 ERROR en servicio de listado:");
            System.err.println("💥 Excepción: " + e.getClass().getSimpleName());
            System.err.println("💥 Mensaje: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}