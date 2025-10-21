package com.saberpro.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "tipos_incentivos")
public class TipoIncentivo {
    
    @Id
    private String id;
    
    @Indexed
    private String nombre;                // "Beca 100% Derechos de Grado"
    private String descripcion;          // "Exoneración completa + Seminario nota 5.0"
    @Indexed
    private int puntajeMinimo;          // 241
    private double monto;               // 500000.0
    private String beneficios;          // Lista detallada de beneficios
    @Indexed
    private boolean activo;             // true/false
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
    private String creadoPor;           // Coordinador que lo creó
    
    // Constructor por defecto
    public TipoIncentivo() {
        this.fechaCreacion = LocalDateTime.now();
        this.activo = true;
    }
    
    // Constructor completo
    public TipoIncentivo(String nombre, String descripcion, int puntajeMinimo, 
                        double monto, String beneficios, String creadoPor) {
        this();
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.puntajeMinimo = puntajeMinimo;
        this.monto = monto;
        this.beneficios = beneficios;
        this.creadoPor = creadoPor;
    }
    
    // Método para verificar si un puntaje califica
    public boolean esElegible(int puntajeEstudiante) {
        return activo && puntajeEstudiante >= puntajeMinimo;
    }
    
    // Método para obtener resumen del incentivo
    public String getResumen() {
        return String.format("%s (≥%d puntos) - $%,.0f", 
                nombre, puntajeMinimo, monto);
    }
    
    // Getters y Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
        this.fechaModificacion = LocalDateTime.now();
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
        this.fechaModificacion = LocalDateTime.now();
    }
    
    public int getPuntajeMinimo() {
        return puntajeMinimo;
    }
    
    public void setPuntajeMinimo(int puntajeMinimo) {
        this.puntajeMinimo = puntajeMinimo;
        this.fechaModificacion = LocalDateTime.now();
    }
    
    public double getMonto() {
        return monto;
    }
    
    public void setMonto(double monto) {
        this.monto = monto;
        this.fechaModificacion = LocalDateTime.now();
    }
    
    public String getBeneficios() {
        return beneficios;
    }
    
    public void setBeneficios(String beneficios) {
        this.beneficios = beneficios;
        this.fechaModificacion = LocalDateTime.now();
    }
    
    public boolean isActivo() {
        return activo;
    }
    
    public void setActivo(boolean activo) {
        this.activo = activo;
        this.fechaModificacion = LocalDateTime.now();
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaModificacion() {
        return fechaModificacion;
    }
    
    public void setFechaModificacion(LocalDateTime fechaModificacion) {
        this.fechaModificacion = fechaModificacion;
    }
    
    public String getCreadoPor() {
        return creadoPor;
    }
    
    public void setCreadoPor(String creadoPor) {
        this.creadoPor = creadoPor;
    }
    
    @Override
    public String toString() {
        return String.format("TipoIncentivo{nombre='%s', puntajeMinimo=%d, monto=%.2f, activo=%s}", 
                nombre, puntajeMinimo, monto, activo);
    }
}