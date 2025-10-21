package com.saberpro.config;

import com.saberpro.model.EstudianteResultado;
import com.saberpro.model.ResultadoSaberPro;
import com.saberpro.model.TipoIncentivo;
import com.saberpro.model.Usuario;
import com.saberpro.repository.EstudianteResultadoRepository;
import com.saberpro.repository.ResultadoSaberProRepository;
import com.saberpro.repository.TipoIncentivoRepository;
import com.saberpro.repository.UsuarioRepository;
import com.saberpro.service.IncentivoEvaluacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ResultadoSaberProRepository resultadoRepository;
    
    @Autowired
    private EstudianteResultadoRepository estudianteResultadoRepository;

    
    @Autowired
    private TipoIncentivoRepository tipoIncentivoRepository;
    
    @Autowired
    private IncentivoEvaluacionService evaluacionService;

    @Override
    public void run(String... args) throws Exception {
        initializeResultadosEjemplo();
        initializeUsuarios();
        initializeTiposIncentivos();
        evaluarIncentivoAutomatico();
    }

    private void initializeUsuarios() {
        // Coordinador
        if (usuarioRepository.findByDocumento("admin").isEmpty()) {
            Usuario coordinador = new Usuario("admin", "COORDINADOR", "admin");
            usuarioRepository.save(coordinador);
        }

        // 🆕 Generar usuarios automáticamente para todos los estudiantes en estudiantes_resultados
        List<EstudianteResultado> estudiantes = estudianteResultadoRepository.findAll();
        for (EstudianteResultado estudiante : estudiantes) {
            if (usuarioRepository.findByDocumento(estudiante.getDocumento()).isEmpty()) {
                // Usar documento como correo y contraseña
                Usuario usuarioEstudiante = new Usuario(estudiante.getDocumento(), "ESTUDIANTE", estudiante.getDocumento());
                usuarioRepository.save(usuarioEstudiante);
            }
        }
    }

    private void initializeResultadosEjemplo() {
        // Solo crear si no existen datos
        if (resultadoRepository.count() > 0) {
            return;
        }

        // Datos basados en el Excel proporcionado
        List<ResultadoSaberPro> resultadosEjemplo = Arrays.asList(
            crearResultado("EK20183140703", "CC", "QUINTERO", "", "JUAN", "CARLOS", 
                "juan.quintero@uts.edu.co", "3201234567", "Ingeniería de Sistemas", 165,
                125, 151, 179, 163, 205, 182, 136),
                
            crearResultado("EK20183040545", "CC", "PARRA", "MARTINEZ", "MARIA", "FERNANDA", 
                "maria.parra@uts.edu.co", "3109876543", "Ingeniería de Sistemas", 164,
                159, 172, 182, 142, 165, 167, 148),
                
            crearResultado("EK20183025381", "CC", "ANAYA", "LOPEZ", "CARLOS", "EDUARDO", 
                "carlos.anaya@uts.edu.co", "3156789012", "Ingeniería de Sistemas", 160,
                146, 199, 157, 149, 147, 174, 171),
                
            crearResultado("EK20183025335", "CC", "FLOR", "GARCIA", "ANA", "LUCIA", 
                "ana.flor@uts.edu.co", "3187654321", "Ingeniería de Sistemas", 160,
                198, 153, 147, 157, 146, 168, 160),
                
            crearResultado("EK20183122648", "CC", "GARCIA", "RODRIGUEZ", "PEDRO", "ANTONIO", 
                "pedro.garcia@uts.edu.co", "3145678901", "Ingeniería de Sistemas", 157,
                179, 172, 158, 140, 136, 128, 142),
                
            crearResultado("EK20183064605", "CC", "MANOSALVA", "PEREZ", "SOFIA", "ANDREA", 
                "sofia.manosalva@uts.edu.co", "3123456789", "Ingeniería de Sistemas", 153,
                115, 152, 159, 172, 165, 142, 119),
                
            crearResultado("EK20183187351", "CC", "MENDOZA", "TORRES", "LUIS", "FERNANDO", 
                "luis.mendoza@uts.edu.co", "3167890123", "Ingeniería de Sistemas", 151,
                132, 123, 125, 169, 204, 173, 171),
                
            crearResultado("EK20183233820", "CC", "BELTRAN", "VARGAS", "DIANA", "CAROLINA", 
                "diana.beltran@uts.edu.co", "3134567890", "Ingeniería de Sistemas", 150,
                86, 187, 160, 171, 148, 162, 142),

            // Estudiantes con puntajes altos para mostrar incentivos
            crearResultado("EK20183030016", "CC", "SANTAMARIA", "GUTIERREZ", "ALEJANDRO", "JOSE", 
                "alejandro.santamaria@uts.edu.co", "3198765432", "Ingeniería de Sistemas", 245,
                209, 183, 155, 164, 133, 174, 154),
                
            crearResultado("EK20183047073", "CC", "SANCHEZ", "MORALES", "CAROLINA", "PATRICIA", 
                "carolina.sanchez@uts.edu.co", "3176543210", "Ingeniería de Sistemas", 220,
                93, 157, 138, 135, 152, 176, 165),

            // Estudiante con puntaje insuficiente
            crearResultado("EK20183236451", "CC", "ROMERO", "CASTRO", "MIGUEL", "ANGEL", 
                "miguel.romero@uts.edu.co", "3112345678", "Ingeniería de Sistemas", 75,
                125, 136, 145, 150, 126, 148, 131)
        );

        // Guardar todos los resultados con cálculos automáticos
        for (ResultadoSaberPro resultado : resultadosEjemplo) {
            // Calcular niveles de competencias usando la lógica directa
            resultado.setComunicacionEscritaNivel(calcularNivelCompetencia(resultado.getComunicacionEscrita()));
            resultado.setRazonamientoCuantitativoNivel(calcularNivelCompetencia(resultado.getRazonamientoCuantitativo()));
            resultado.setLecturaCriticaNivel(calcularNivelCompetencia(resultado.getLecturaCritica()));
            resultado.setCompetenciasCiudadanasNivel(calcularNivelCompetencia(resultado.getCompetenciasCiudadanas()));
            resultado.setInglesNivel(calcularNivelIngles(resultado.getIngles()));
            resultado.setFormulacionProyectosIngenieriaNivel(calcularNivelCompetencia(resultado.getFormulacionProyectosIngenieria()));
            resultado.setPensamientoCientificoMatematicasNivel(calcularNivelCompetencia(resultado.getPensamientoCientificoMatematicas()));
            resultado.setDisenoSoftwareNivel(calcularNivelCompetencia(resultado.getDisenoSoftware()));
            
            // Guardar el resultado
            resultadoRepository.save(resultado);
        }
    }

    private ResultadoSaberPro crearResultado(String documento, String tipoDoc, String apellido1, 
            String apellido2, String nombre1, String nombre2, String email, String telefono, 
            String programa, Integer puntajeGlobal, Integer comEscrita, Integer razCuant, 
            Integer lecCritica, Integer compCiudadanas, Integer ingles, Integer formProyectos, 
            Integer disenoSoft) {
        
        ResultadoSaberPro resultado = new ResultadoSaberPro();
        
        // Información personal
        resultado.setDocumento(documento);
        resultado.setNumeroRegistro(documento);
        resultado.setTipoDocumento(tipoDoc);
        resultado.setPrimerApellido(apellido1);
        resultado.setSegundoApellido(apellido2);
        resultado.setPrimerNombre(nombre1);
        resultado.setSegundoNombre(nombre2);
        resultado.setCorreoElectronico(email);
        resultado.setNumeroTelefono(telefono);
        resultado.setProgramaAcademico(programa);
        resultado.setFechaExamen(LocalDate.now().minusMonths(1));

        // Puntajes
        resultado.setPuntajeGlobal(puntajeGlobal);
        resultado.setComunicacionEscrita(comEscrita);
        resultado.setRazonamientoCuantitativo(razCuant);
        resultado.setLecturaCritica(lecCritica);
        resultado.setCompetenciasCiudadanas(compCiudadanas);
        resultado.setIngles(ingles);
        resultado.setFormulacionProyectosIngenieria(formProyectos);

        Integer pensamiento = null;
        if (formProyectos != null || disenoSoft != null) {
            int suma = 0;
            int contador = 0;
            if (formProyectos != null) {
                suma += formProyectos;
                contador++;
            }
            if (disenoSoft != null) {
                suma += disenoSoft;
                contador++;
            }
            pensamiento = contador > 0 ? Math.round((float) suma / contador) : null;
        }
        resultado.setPensamientoCientificoMatematicas(pensamiento);

        resultado.setDisenoSoftware(disenoSoft);

        // Información académica
        resultado.setTrabajoGradoAprobado(false);
        resultado.setSeminarioMatriculado(false);
        resultado.setValorDerechosGrado(500000.0);
        resultado.setDescuentoAplicado(0.0);

        return resultado;
    }

    private void initializeTiposIncentivos() {
        if (tipoIncentivoRepository.count() == 0) {
            // Tipo 1: Beca 100% para puntajes excelentes (241+)
            TipoIncentivo tipo1 = new TipoIncentivo(
                "Beca 100% Derechos de Grado",
                "Exoneración completa de derechos de grado + Seminario nota 5.0",
                241, // Puntaje mínimo
                500000.0, // Monto
                "- Exoneración 100% derechos de grado\n- Seminario de grado IV con nota 5.0\n- Ceremonia de reconocimiento",
                "Coordinador"
            );
            tipoIncentivoRepository.save(tipo1);

            // Tipo 2: Beca 50% para puntajes muy buenos (211-240)
            TipoIncentivo tipo2 = new TipoIncentivo(
                "Beca 50% Derechos de Grado",
                "Descuento del 50% en derechos + Seminario nota 4.7",
                211, // Puntaje mínimo
                250000.0, // Monto
                "- Descuento 50% derechos de grado\n- Seminario de grado IV con nota 4.7\n- Certificado de reconocimiento",
                "Coordinador"
            );
            tipoIncentivoRepository.save(tipo2);

            // Tipo 3: Exoneración seminario para puntajes buenos (180-210)
            TipoIncentivo tipo3 = new TipoIncentivo(
                "Exoneración Seminario",
                "Seminario de grado IV con nota 4.5",
                180, // Puntaje mínimo
                0.0, // Sin monto económico
                "- Exoneración informe final trabajo de grado\n- Seminario de grado IV con nota 4.5",
                "Coordinador"
            );
            tipoIncentivoRepository.save(tipo3);

            // Tipo 4: Reconocimiento especial para puntajes sobresalientes (250+)
            TipoIncentivo tipo4 = new TipoIncentivo(
                "Reconocimiento Excelencia Académica",
                "Reconocimiento público + beneficios adicionales",
                250, // Puntaje mínimo
                1000000.0, // Monto adicional
                "- Beca completa derechos de grado\n- Reconocimiento público\n- Carta de recomendación\n- Prioridad en becas futuras",
                "Coordinador"
            );
            tipoIncentivoRepository.save(tipo4);
        }
    }

    private void evaluarIncentivoAutomatico() {
        try {
            List<EstudianteResultado> estudiantes = estudianteResultadoRepository.findAll();
            if (!estudiantes.isEmpty()) {
                evaluacionService.reevaluarTodosLosEstudiantes(estudiantes);
            }
        } catch (Exception ignored) {
            // La reevaluación automática no debe interrumpir el inicio de la aplicación
        }
    }

    /**
     * Calcula el nivel de competencia basado en el puntaje
     */
    private String calcularNivelCompetencia(Integer puntaje) {
        if (puntaje == null) {
            return "Sin información";
        }
        return calcularNivelGeneral(puntaje);
    }

    private String calcularNivelGeneral(int puntaje) {
        if (puntaje >= 180) return "Nivel 4";
        if (puntaje >= 150) return "Nivel 3";
        if (puntaje >= 120) return "Nivel 2";
        return "Nivel 1";
    }

    private String calcularNivelIngles(Integer puntaje) {
        if (puntaje == null) {
            return "Sin información";
        }
        int valor = puntaje;
        if (valor >= 190) return "B2";
        if (valor >= 160) return "B1";
        if (valor >= 135) return "A2";
        if (valor >= 110) return "A1";
        return "A0";
    }
}