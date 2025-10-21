package com.saberpro.controller;

import com.saberpro.model.Usuario;
import com.saberpro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepo;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        String documento = request.get("documento");
        String password = request.get("password");
        Map<String, Object> res = new HashMap<>();
        
        Optional<Usuario> userOpt = Optional.empty();
        if (documento != null) {
            String trimmedDocumento = documento.trim();
            userOpt = usuarioRepo.findByDocumentoIgnoreCase(trimmedDocumento);
        }

        if (userOpt.isPresent()) {
            Usuario user = userOpt.get();
            if (user.getPassword().equals(password)) {
                res.put("success", true);
                res.put("rol", user.getRol());
                res.put("documento", user.getDocumento());
            } else {
                res.put("success", false);
                res.put("message", "Documento o contraseña incorrecta");
            }
        } else {
            res.put("success", false);
            res.put("message", "Usuario no encontrado");
        }
        return res;
    }
}
