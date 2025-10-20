package com.saberpro.service;

import com.saberpro.model.ResultadoSaberPro;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class IncentivoService {

    public List<String> calcularIncentivos(ResultadoSaberPro resultado) {
        List<String> incentivos = new ArrayList<>();
        Integer puntaje = resultado.getPuntajeGlobal();
        
        if (puntaje == null) return incentivos;

        // Incentivos para Saber PRO (0-300 puntos)
        if (puntaje >= 180 && puntaje <= 210) {
            incentivos.add("Exoneración del informe final de trabajo de grado o Seminario de grado IV (Nota 4.5)");
            resultado.setNivelIncentivos("EXONERADO_SEMINARIO");
        } 
        else if (puntaje >= 211 && puntaje <= 240) {
            incentivos.add("Exoneración del informe final de trabajo de grado o Seminario de grado IV (Nota 4.7)");
            incentivos.add("Beca del 50% del valor de derechos de grado");
            resultado.setNivelIncentivos("BECA_50%");
            resultado.setDescuentoAplicado(0.5);
        }
        else if (puntaje >= 241) {
            incentivos.add("Exoneración del informe final de trabajo de grado o Seminario de grado IV (Nota 5.0)");
            incentivos.add("Beca del 100% del valor de derechos de grado");
            incentivos.add("Ceremonia especial - Noche de los mejores");
            resultado.setNivelIncentivos("BECA_100%");
            resultado.setDescuentoAplicado(1.0);
        }

        // Incentivos generales adicionales
        if (puntaje >= 180) {
            incentivos.add("Ayuda para estudios de posgrado mediante becas parciales o totales");
            incentivos.add("Mejores oportunidades laborales en grandes empresas");
            incentivos.add("Condonación de deudas para estudiantes con créditos del Icetex");
        }

        // Verificar estado de graduación
        if (puntaje < 80) {
            incentivos.clear();
            incentivos.add("ATENCIÓN: No puede graduarse con puntaje inferior a 80 puntos");
            resultado.setEstadoGraduacion("NO_PUEDE_GRADUAR");
        } else {
            resultado.setEstadoGraduacion("PUEDE_GRADUAR");
        }

        resultado.setIncentivosObtenidos(incentivos);
        return incentivos;
    }

    public String calcularNivelGlobal(Integer puntaje) {
        if (puntaje == null) return "No evaluado";
        
        if (puntaje >= 241) return "Sobresaliente";
        else if (puntaje >= 211) return "Destacado";
        else if (puntaje >= 180) return "Bueno";
        else if (puntaje >= 120) return "Satisfactorio";
        else if (puntaje >= 80) return "Mínimo";
        else return "Insuficiente";
    }

    public String obtenerColorNivel(String nivel) {
        switch (nivel) {
            case "Sobresaliente": return "success";
            case "Destacado": return "info";
            case "Bueno": return "primary";
            case "Satisfactorio": return "warning";
            case "Mínimo": return "secondary";
            case "Insuficiente": return "danger";
            default: return "light";
        }
    }

    public boolean puedeGraduarse(Integer puntaje) {
        return puntaje != null && puntaje >= 80;
    }

    public String calcularNivelCompetencia(Integer puntaje, String tipoCompetencia) {
        if (puntaje == null) return "No evaluado";
        
        // Niveles según el tipo de competencia
        switch (tipoCompetencia) {
            case "COMUNICACION_ESCRITA":
            case "RAZONAMIENTO_CUANTITATIVO":
            case "LECTURA_CRITICA":
            case "COMPETENCIAS_CIUDADANAS":
                if (puntaje >= 170) return "Nivel 4";
                else if (puntaje >= 150) return "Nivel 3";
                else if (puntaje >= 130) return "Nivel 2";
                else return "Nivel 1";
                
            case "INGLES":
                if (puntaje >= 180) return "B2";
                else if (puntaje >= 150) return "B1";
                else if (puntaje >= 120) return "A2";
                else if (puntaje >= 100) return "A1";
                else return "A0";
                
            case "DISEÑO_SOFTWARE":
            case "FORMULACION_PROYECTOS":
            case "PENSAMIENTO_CIENTIFICO":
                if (puntaje >= 160) return "Nivel 3";
                else if (puntaje >= 140) return "Nivel 2";
                else return "Nivel 1";
                
            default:
                return "No definido";
        }
    }
}