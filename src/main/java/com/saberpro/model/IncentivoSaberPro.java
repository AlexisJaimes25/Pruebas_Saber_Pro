package com.saberpro.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "incentivos_saber_pro")
public class IncentivoSaberPro {
    @Id
    private String id;
    private String tipoExamen; // SABER_TT, SABER_PRO
    private String tipoIncentivo; // EXONERACION_SEMINARIO, BECA_PARCIAL, BECA_TOTAL, CONDONACION_DEUDAS, NOCHE_MEJORES
    private String descripcion;
    private Integer puntajeMinimo;
    private Integer puntajeMaximo;
    private Double porcentajeDescuento; // Para becas (50% o 100%)
    private String requisitosAdicionales;
    private LocalDate fechaVigencia;
    private Boolean activo;

    // Constructores
    public IncentivoSaberPro() {}

    public IncentivoSaberPro(String tipoExamen, String tipoIncentivo, String descripcion, 
                           Integer puntajeMinimo, Integer puntajeMaximo, Double porcentajeDescuento) {
        this.tipoExamen = tipoExamen;
        this.tipoIncentivo = tipoIncentivo;
        this.descripcion = descripcion;
        this.puntajeMinimo = puntajeMinimo;
        this.puntajeMaximo = puntajeMaximo;
        this.porcentajeDescuento = porcentajeDescuento;
        this.activo = true;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTipoExamen() { return tipoExamen; }
    public void setTipoExamen(String tipoExamen) { this.tipoExamen = tipoExamen; }

    public String getTipoIncentivo() { return tipoIncentivo; }
    public void setTipoIncentivo(String tipoIncentivo) { this.tipoIncentivo = tipoIncentivo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getPuntajeMinimo() { return puntajeMinimo; }
    public void setPuntajeMinimo(Integer puntajeMinimo) { this.puntajeMinimo = puntajeMinimo; }

    public Integer getPuntajeMaximo() { return puntajeMaximo; }
    public void setPuntajeMaximo(Integer puntajeMaximo) { this.puntajeMaximo = puntajeMaximo; }

    public Double getPorcentajeDescuento() { return porcentajeDescuento; }
    public void setPorcentajeDescuento(Double porcentajeDescuento) { this.porcentajeDescuento = porcentajeDescuento; }

    public String getRequisitosAdicionales() { return requisitosAdicionales; }
    public void setRequisitosAdicionales(String requisitosAdicionales) { this.requisitosAdicionales = requisitosAdicionales; }

    public LocalDate getFechaVigencia() { return fechaVigencia; }
    public void setFechaVigencia(LocalDate fechaVigencia) { this.fechaVigencia = fechaVigencia; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    // Método para verificar si un puntaje califica para este incentivo
    public boolean calificaParaIncentivo(Integer puntaje) {
        if (!activo || puntaje == null) return false;
        
        if (puntajeMaximo == null) {
            return puntaje >= puntajeMinimo;
        } else {
            return puntaje >= puntajeMinimo && puntaje <= puntajeMaximo;
        }
    }
}