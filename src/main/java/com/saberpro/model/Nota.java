package com.saberpro.model;

public class Nota {
    private String materia;
    private Integer puntaje;
    private String nivel;

    public Nota() {}

    public Nota(String materia, Integer puntaje, String nivel) {
        this.materia = materia;
        this.puntaje = puntaje;
        this.nivel = nivel;
    }

    public String getMateria() { return materia; }
    public void setMateria(String materia) { this.materia = materia; }
    public Integer getPuntaje() { return puntaje; }
    public void setPuntaje(Integer puntaje) { this.puntaje = puntaje; }
    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }
}
