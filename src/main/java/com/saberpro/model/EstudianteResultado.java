package com.saberpro.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "estudiantes_resultados")
public class EstudianteResultado {
    private String tipoDocumento;
    private String primerApellido;
    private String segundoApellido;
    private String primerNombre;
    private String segundoNombre;
    private String correoElectronico;
    private String numeroTelefono;
    @Id
    private String documento;
    private String nombreCompleto;
    private String programaAcademico;
    private Integer puntajeGlobal;
    private String estadoIncentivos;
    private String nivelIcfes;
    private Integer percentil;
    private List<Nota> notas;

    public EstudianteResultado() {}

    public EstudianteResultado(String documento, String nombreCompleto, String programaAcademico,
                               Integer puntajeGlobal, List<Nota> notas) {
        this.documento = documento;
        this.nombreCompleto = nombreCompleto;
        this.programaAcademico = programaAcademico;
        this.puntajeGlobal = puntajeGlobal;
        this.notas = notas;
    }

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
    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
    public String getProgramaAcademico() { return programaAcademico; }
    public void setProgramaAcademico(String programaAcademico) { this.programaAcademico = programaAcademico; }
    public Integer getPuntajeGlobal() { return puntajeGlobal; }
    public void setPuntajeGlobal(Integer puntajeGlobal) { this.puntajeGlobal = puntajeGlobal; }
    public String getEstadoIncentivos() { return estadoIncentivos; }
    public void setEstadoIncentivos(String estadoIncentivos) { this.estadoIncentivos = estadoIncentivos; }
    public String getNivelIcfes() { return nivelIcfes; }
    public void setNivelIcfes(String nivelIcfes) { this.nivelIcfes = nivelIcfes; }
    public Integer getPercentil() { return percentil; }
    public void setPercentil(Integer percentil) { this.percentil = percentil; }
    public List<Nota> getNotas() { return notas; }
    public void setNotas(List<Nota> notas) { this.notas = notas; }
}
