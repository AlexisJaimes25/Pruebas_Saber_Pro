package com.saberpro.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.List;

@Document(collection = "resultados_saber_pro")
public class ResultadoSaberPro {
    @Id
    private String id;
    private String numeroRegistro;
    private String documento;
    private String tipoDocumento;
    private String primerApellido;
    private String segundoApellido;
    private String primerNombre;
    private String segundoNombre;
    private String correoElectronico;
    private String numeroTelefono;
    private String programaAcademico;
    private LocalDate fechaExamen;
    
    // Puntajes Saber PRO (0-300 puntos)
    private Integer puntajeGlobal;
    private Integer comunicacionEscrita;
    private String comunicacionEscritaNivel;
    private Integer razonamientoCuantitativo;
    private String razonamientoCuantitativoNivel;
    private Integer lecturaCritica;
    private String lecturaCriticaNivel;
    private Integer competenciasCiudadanas;
    private String competenciasCiudadanasNivel;
    private Integer ingles;
    private String inglesNivel;
    private Integer formulacionProyectosIngenieria;
    private String formulacionProyectosIngenieriaNivel;
    private Integer pensamientoCientificoMatematicas;
    private String pensamientoCientificoMatematicasNivel;
    private Integer disenoSoftware;
    private String disenoSoftwareNivel;
    
    // Estado académico y incentivos
    private String estadoGraduacion; // PUEDE_GRADUAR, NO_PUEDE_GRADUAR
    private List<String> incentivosObtenidos;
    private String nivelIncentivos; // EXONERADO_SEMINARIO, BECA_50%, BECA_100%
    private Boolean trabajoGradoAprobado;
    private Boolean seminarioMatriculado;
    private Double valorDerechosGrado;
    private Double descuentoAplicado;

    // Constructores
    public ResultadoSaberPro() {}

    public ResultadoSaberPro(String numeroRegistro, String documento, String primerApellido, 
                           String primerNombre, Integer puntajeGlobal) {
        this.numeroRegistro = numeroRegistro;
        this.documento = documento;
        this.primerApellido = primerApellido;
        this.primerNombre = primerNombre;
        this.puntajeGlobal = puntajeGlobal;
        this.estadoGraduacion = puntajeGlobal >= 80 ? "PUEDE_GRADUAR" : "NO_PUEDE_GRADUAR";
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNumeroRegistro() { return numeroRegistro; }
    public void setNumeroRegistro(String numeroRegistro) { this.numeroRegistro = numeroRegistro; }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

    public String getPrimerApellido() { return primerApellido; }
    public void setPrimerApellido(String primerApellido) { this.primerApellido = primerApellido; }

    public String getSegundoApellido() { return segundoApellido; }
    public void setSegundoApellido(String segundoApellido) { this.segundoApellido = segundoApellido; }

    public String getPrimerNombre() { return primerNombre; }
    public void setPrimerNombre(String primerNombre) { this.primerNombre = primerNombre; }

    public String getSegundoNombre() { return segundoNombre; }
    public void setSegundoNombre(String segundoNombre) { this.segundoNombre = segundoNombre; }

    public String getCorreoElectronico() { return correoElectronico; }
    public void setCorreoElectronico(String correoElectronico) { this.correoElectronico = correoElectronico; }

    public String getNumeroTelefono() { return numeroTelefono; }
    public void setNumeroTelefono(String numeroTelefono) { this.numeroTelefono = numeroTelefono; }

    public String getProgramaAcademico() { return programaAcademico; }
    public void setProgramaAcademico(String programaAcademico) { this.programaAcademico = programaAcademico; }

    public LocalDate getFechaExamen() { return fechaExamen; }
    public void setFechaExamen(LocalDate fechaExamen) { this.fechaExamen = fechaExamen; }

    public Integer getPuntajeGlobal() { return puntajeGlobal; }
    public void setPuntajeGlobal(Integer puntajeGlobal) { 
        this.puntajeGlobal = puntajeGlobal;
        this.estadoGraduacion = puntajeGlobal >= 80 ? "PUEDE_GRADUAR" : "NO_PUEDE_GRADUAR";
    }

    // Getters y Setters para puntajes específicos
    public Integer getComunicacionEscrita() { return comunicacionEscrita; }
    public void setComunicacionEscrita(Integer comunicacionEscrita) { this.comunicacionEscrita = comunicacionEscrita; }

    public String getComunicacionEscritaNivel() { return comunicacionEscritaNivel; }
    public void setComunicacionEscritaNivel(String comunicacionEscritaNivel) { this.comunicacionEscritaNivel = comunicacionEscritaNivel; }

    public Integer getRazonamientoCuantitativo() { return razonamientoCuantitativo; }
    public void setRazonamientoCuantitativo(Integer razonamientoCuantitativo) { this.razonamientoCuantitativo = razonamientoCuantitativo; }

    public String getRazonamientoCuantitativoNivel() { return razonamientoCuantitativoNivel; }
    public void setRazonamientoCuantitativoNivel(String razonamientoCuantitativoNivel) { this.razonamientoCuantitativoNivel = razonamientoCuantitativoNivel; }

    public Integer getLecturaCritica() { return lecturaCritica; }
    public void setLecturaCritica(Integer lecturaCritica) { this.lecturaCritica = lecturaCritica; }

    public String getLecturaCriticaNivel() { return lecturaCriticaNivel; }
    public void setLecturaCriticaNivel(String lecturaCriticaNivel) { this.lecturaCriticaNivel = lecturaCriticaNivel; }

    public Integer getCompetenciasCiudadanas() { return competenciasCiudadanas; }
    public void setCompetenciasCiudadanas(Integer competenciasCiudadanas) { this.competenciasCiudadanas = competenciasCiudadanas; }

    public String getCompetenciasCiudadanasNivel() { return competenciasCiudadanasNivel; }
    public void setCompetenciasCiudadanasNivel(String competenciasCiudadanasNivel) { this.competenciasCiudadanasNivel = competenciasCiudadanasNivel; }

    public Integer getIngles() { return ingles; }
    public void setIngles(Integer ingles) { this.ingles = ingles; }

    public String getInglesNivel() { return inglesNivel; }
    public void setInglesNivel(String inglesNivel) { this.inglesNivel = inglesNivel; }

    public Integer getFormulacionProyectosIngenieria() { return formulacionProyectosIngenieria; }
    public void setFormulacionProyectosIngenieria(Integer formulacionProyectosIngenieria) { this.formulacionProyectosIngenieria = formulacionProyectosIngenieria; }

    public String getFormulacionProyectosIngenieriaNivel() { return formulacionProyectosIngenieriaNivel; }
    public void setFormulacionProyectosIngenieriaNivel(String formulacionProyectosIngenieriaNivel) { this.formulacionProyectosIngenieriaNivel = formulacionProyectosIngenieriaNivel; }

    public Integer getPensamientoCientificoMatematicas() { return pensamientoCientificoMatematicas; }
    public void setPensamientoCientificoMatematicas(Integer pensamientoCientificoMatematicas) { this.pensamientoCientificoMatematicas = pensamientoCientificoMatematicas; }

    public String getPensamientoCientificoMatematicasNivel() { return pensamientoCientificoMatematicasNivel; }
    public void setPensamientoCientificoMatematicasNivel(String pensamientoCientificoMatematicasNivel) { this.pensamientoCientificoMatematicasNivel = pensamientoCientificoMatematicasNivel; }

    public Integer getDisenoSoftware() { return disenoSoftware; }
    public void setDisenoSoftware(Integer disenoSoftware) { this.disenoSoftware = disenoSoftware; }

    public String getDisenoSoftwareNivel() { return disenoSoftwareNivel; }
    public void setDisenoSoftwareNivel(String disenoSoftwareNivel) { this.disenoSoftwareNivel = disenoSoftwareNivel; }

    public String getEstadoGraduacion() { return estadoGraduacion; }
    public void setEstadoGraduacion(String estadoGraduacion) { this.estadoGraduacion = estadoGraduacion; }

    public List<String> getIncentivosObtenidos() { return incentivosObtenidos; }
    public void setIncentivosObtenidos(List<String> incentivosObtenidos) { this.incentivosObtenidos = incentivosObtenidos; }

    public String getNivelIncentivos() { return nivelIncentivos; }
    public void setNivelIncentivos(String nivelIncentivos) { this.nivelIncentivos = nivelIncentivos; }

    public Boolean getTrabajoGradoAprobado() { return trabajoGradoAprobado; }
    public void setTrabajoGradoAprobado(Boolean trabajoGradoAprobado) { this.trabajoGradoAprobado = trabajoGradoAprobado; }

    public Boolean getSeminarioMatriculado() { return seminarioMatriculado; }
    public void setSeminarioMatriculado(Boolean seminarioMatriculado) { this.seminarioMatriculado = seminarioMatriculado; }

    public Double getValorDerechosGrado() { return valorDerechosGrado; }
    public void setValorDerechosGrado(Double valorDerechosGrado) { this.valorDerechosGrado = valorDerechosGrado; }

    public Double getDescuentoAplicado() { return descuentoAplicado; }
    public void setDescuentoAplicado(Double descuentoAplicado) { this.descuentoAplicado = descuentoAplicado; }

    // Método para obtener el nombre completo
    public String getNombreCompleto() {
        StringBuilder nombre = new StringBuilder();
        if (primerNombre != null) nombre.append(primerNombre).append(" ");
        if (segundoNombre != null) nombre.append(segundoNombre).append(" ");
        if (primerApellido != null) nombre.append(primerApellido).append(" ");
        if (segundoApellido != null) nombre.append(segundoApellido);
        return nombre.toString().trim();
    }

    // Método para verificar si puede graduarse
    public boolean puedeGraduarse() {
        return puntajeGlobal != null && puntajeGlobal >= 80;
    }
}