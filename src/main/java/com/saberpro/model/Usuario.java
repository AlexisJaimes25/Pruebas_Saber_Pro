package com.saberpro.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "usuarios")
public class Usuario {
    @Id
    private String documento;
    private String rol; // COORDINADOR o ESTUDIANTE
    private String password;

    public Usuario() {}

    public Usuario(String documento, String rol, String password) {
        this.documento = documento;
        this.rol = rol;
        this.password = password;
    }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
