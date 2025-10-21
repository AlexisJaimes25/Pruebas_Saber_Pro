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
        EstudianteResultado resultado = estudianteRepo.findByDocumento(documento);

        if (resultado != null) {
            return resultado;
        }

        List<EstudianteResultado> todos = estudianteRepo.findAll();
        for (EstudianteResultado est : todos) {
            String docBD = est.getDocumento();
            if (documento.equals(docBD)) {
                return est;
            }
        }

        return null;
    }
    
    public List<EstudianteResultado> findAllConLogs() {
        return estudianteRepo.findAll();
    }
}