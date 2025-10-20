package com.saberpro.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coordinador")
@CrossOrigin("*")
public class CoordinadorController {

    @GetMapping("/test")
    public java.util.Map<String, String> testCoordinador() {
        java.util.Map<String, String> resp = new java.util.HashMap<>();
        resp.put("mensaje", "Acceso de Coordinador exitoso. Aquí iría el CRUD de Alumnos.");
        return resp;
    }
}
