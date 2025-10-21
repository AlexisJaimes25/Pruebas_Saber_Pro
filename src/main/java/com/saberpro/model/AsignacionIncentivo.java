package com.saberpro.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "asignaciones_incentivos")
public class AsignacionIncentivo {
    @Id
    private String id;
    
    @Indexed
    private String documentoEstudiante; // Documento del estudiante
    private String nombreCompleto;
    
    // CAMBIO: Ahora referencia al TipoIncentivo configurado
    @DBRef
    @Indexed
    private TipoIncentivo tipoIncentivo; // Referencia al tipo de incentivo configurado
    
    @Indexed
    private String estado; // PENDIENTE, APROBADO, ENTREGADO, RECHAZADO
    private boolean evaluacionAutomatica; // true si fue asignado automáticamente
    @Indexed
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaAprobacion;
    private LocalDateTime fechaEntrega;
    private String observaciones;
    @Indexed
    private String programaAcademico;
    private Integer puntajeObtenido;
    private String semestreAcademico;
    
    // Campos para auditoría
    private String asignadoPor; // Usuario que asignó el incentivo
    private String aprobadoPor; // Usuario que aprobó el incentivo
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    // Constructores
    public AsignacionIncentivo() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
        this.estado = "PENDIENTE";
        this.evaluacionAutomatica = false;
    }

    // Constructor para asignación automática
    public AsignacionIncentivo(String documentoEstudiante, String nombreCompleto, TipoIncentivo tipoIncentivo, 
                             String programaAcademico, Integer puntajeObtenido, boolean esAutomatico) {
        this();
        this.documentoEstudiante = documentoEstudiante;
        this.nombreCompleto = nombreCompleto;
        this.tipoIncentivo = tipoIncentivo;
        this.fechaAsignacion = LocalDateTime.now();
        this.programaAcademico = programaAcademico;
        this.puntajeObtenido = puntajeObtenido;
        this.evaluacionAutomatica = esAutomatico;
        this.asignadoPor = esAutomatico ? "SISTEMA_AUTOMATICO" : null;
    }

    // Constructor manual
    public AsignacionIncentivo(String documentoEstudiante, String nombreCompleto, TipoIncentivo tipoIncentivo, 
                             String asignadoPor, String programaAcademico, Integer puntajeObtenido) {
        this(documentoEstudiante, nombreCompleto, tipoIncentivo, programaAcademico, puntajeObtenido, false);
        this.asignadoPor = asignadoPor;
    }

    // Métodos de utilidad
    public boolean esElegible() {
        return tipoIncentivo != null && tipoIncentivo.esElegible(puntajeObtenido != null ? puntajeObtenido : 0);
    }

    public void aprobar(String aprobadoPor) {
        this.estado = "APROBADO";
        this.aprobadoPor = aprobadoPor;
        this.fechaAprobacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }

    public void entregar() {
        if (!"APROBADO".equals(this.estado)) {
            throw new IllegalStateException("Solo se pueden entregar incentivos aprobados");
        }
        this.estado = "ENTREGADO";
        this.fechaEntrega = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }

    public void rechazar(String motivo) {
        this.estado = "RECHAZADO";
        this.observaciones = motivo;
        this.fechaActualizacion = LocalDateTime.now();
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDocumentoEstudiante() { return documentoEstudiante; }
    public void setDocumentoEstudiante(String documentoEstudiante) { 
        this.documentoEstudiante = documentoEstudiante;
        this.fechaActualizacion = LocalDateTime.now();
    }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { 
        this.nombreCompleto = nombreCompleto;
        this.fechaActualizacion = LocalDateTime.now();
    }

    public TipoIncentivo getTipoIncentivo() { return tipoIncentivo; }
    public void setTipoIncentivo(TipoIncentivo tipoIncentivo) { 
        this.tipoIncentivo = tipoIncentivo;
        this.fechaActualizacion = LocalDateTime.now();
    }

    public boolean isEvaluacionAutomatica() { return evaluacionAutomatica; }
    public void setEvaluacionAutomatica(boolean evaluacionAutomatica) { 
        this.evaluacionAutomatica = evaluacionAutomatica; 
    }

    // Métodos de conveniencia para compatibilidad con código existente
    public String getTipoIncentivoNombre() {
        return tipoIncentivo != null ? tipoIncentivo.getNombre() : null;
    }

    public String getDescripcion() {
        return tipoIncentivo != null ? tipoIncentivo.getDescripcion() : null;
    }

    public Double getMonto() {
        return tipoIncentivo != null ? tipoIncentivo.getMonto() : null;
    }

    public String getBeneficios() {
        return tipoIncentivo != null ? tipoIncentivo.getBeneficios() : null;
    }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { 
        this.estado = estado;
        this.fechaActualizacion = LocalDateTime.now();
        if ("APROBADO".equals(estado)) {
            this.fechaAprobacion = LocalDateTime.now();
        } else if ("ENTREGADO".equals(estado)) {
            this.fechaEntrega = LocalDateTime.now();
        }
    }

    public LocalDateTime getFechaAsignacion() { return fechaAsignacion; }
    public void setFechaAsignacion(LocalDateTime fechaAsignacion) { this.fechaAsignacion = fechaAsignacion; }

    public LocalDateTime getFechaAprobacion() { return fechaAprobacion; }
    public void setFechaAprobacion(LocalDateTime fechaAprobacion) { this.fechaAprobacion = fechaAprobacion; }

    public LocalDateTime getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDateTime fechaEntrega) { this.fechaEntrega = fechaEntrega; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getProgramaAcademico() { return programaAcademico; }
    public void setProgramaAcademico(String programaAcademico) { this.programaAcademico = programaAcademico; }

    public Integer getPuntajeObtenido() { return puntajeObtenido; }
    public void setPuntajeObtenido(Integer puntajeObtenido) { this.puntajeObtenido = puntajeObtenido; }

    public String getSemestreAcademico() { return semestreAcademico; }
    public void setSemestreAcademico(String semestreAcademico) { this.semestreAcademico = semestreAcademico; }

    public String getAsignadoPor() { return asignadoPor; }
    public void setAsignadoPor(String asignadoPor) { this.asignadoPor = asignadoPor; }

    public String getAprobadoPor() { return aprobadoPor; }
    public void setAprobadoPor(String aprobadoPor) { this.aprobadoPor = aprobadoPor; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    @Override
    public String toString() {
        return String.format("AsignacionIncentivo{id='%s', documento='%s', nombre='%s', incentivo='%s', estado='%s', automatico=%s}", 
                id, documentoEstudiante, nombreCompleto, 
                tipoIncentivo != null ? tipoIncentivo.getNombre() : "N/A", 
                estado, evaluacionAutomatica);
    }
}