// ============================================================
// SABER PRO - SISTEMA DE GESTIÓN MEJORADO
// ============================================================

// Función de prueba para verificar que el JS se carga
console.log('🚀 app-enhanced.js cargado correctamente - INICIO');

// Configuración global
const CONFIG = {
    API_BASE_URL: '',
    ENDPOINTS: {
        LOGIN: '/auth/login',
        RESULTADOS: '/api/resultados',
        ESTUDIANTES: '/api/estudiantes',
        ESTADISTICAS: '/api/estadisticas',
        INCENTIVOS: '/api/incentivos'
    },
    PUNTAJES: {
        MIN_GRADUACION: 80,
        INCENTIVOS: {
            SABER_PRO: {
                EXONERACION: { min: 180, max: 210 },
                BECA_50: { min: 211, max: 240 },
                BECA_100: { min: 241 }
            }
        }
    }
};

console.log('🔧 CONFIG definido correctamente');

// ============================================================
// UTILIDADES GENERALES
// ============================================================
class Utils {
    static showLoading(element, show = true) {
        const spinner = element.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
        }
    }

    static showAlert(message, type = 'info', containerId = 'alertContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show alert-modern`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        container.innerHTML = '';
        container.appendChild(alert);

        // Auto-hide después de 5 segundos
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    static formatNumber(num) {
        return num ? num.toLocaleString() : '0';
    }

    static calcularNivelPuntaje(puntaje) {
        if (puntaje >= 241) return { nivel: 'Sobresaliente', color: 'success' };
        if (puntaje >= 211) return { nivel: 'Destacado', color: 'info' };
        if (puntaje >= 180) return { nivel: 'Bueno', color: 'primary' };
        if (puntaje >= 120) return { nivel: 'Satisfactorio', color: 'warning' };
        if (puntaje >= 80) return { nivel: 'Mínimo', color: 'secondary' };
        return { nivel: 'Insuficiente', color: 'danger' };
    }

    // Nueva función para calcular niveles 1-4 por materia individual
    static calcularNivelMateria(puntaje) {
        // Cada materia contribuye aproximadamente 300/7 = ~43 puntos al puntaje global máximo
        // Pero los puntajes individuales pueden ir hasta ~100 puntos por materia
        // Niveles basados en rangos de puntaje por materia:
        if (puntaje >= 85) return { nivel: 'Nivel 4', color: 'success' };      // Excelente (85-100)
        if (puntaje >= 70) return { nivel: 'Nivel 3', color: 'info' };        // Bueno (70-84)
        if (puntaje >= 50) return { nivel: 'Nivel 2', color: 'warning' };     // Regular (50-69)
        if (puntaje >= 25) return { nivel: 'Nivel 1', color: 'danger' };      // Bajo (25-49)
        return { nivel: 'Nivel 1', color: 'danger' };                         // Muy bajo (0-24)
    }

    static calcularIncentivos(puntaje) {
        const incentivos = [];
        if (puntaje >= 241) {
            incentivos.push('Beca 100% derechos de grado');
            incentivos.push('Exoneración Seminario (Nota 5.0)');
            incentivos.push('Ceremonia Noche de los Mejores');
        } else if (puntaje >= 211) {
            incentivos.push('Beca 50% derechos de grado');
            incentivos.push('Exoneración Seminario (Nota 4.7)');
        } else if (puntaje >= 180) {
            incentivos.push('Exoneración Seminario (Nota 4.5)');
        }

        if (puntaje >= 180) {
            incentivos.push('Ayuda para estudios de posgrado');
            incentivos.push('Mejores oportunidades laborales');
            incentivos.push('Condonación de deudas Icetex');
        }

        return incentivos;
    }
}

// ============================================================
// SERVICIO API
// ============================================================
class ApiService {
    static async makeRequest(url, options = {}) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${url}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async login(documento, password) {
        return this.makeRequest(CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ documento, password })
        });
    }

    static async obtenerResultado(documento) {
        return this.makeRequest(`/api/resultados/${documento}`);
    }

    // 🆕 Obtener perfil completo del estudiante (datos + incentivos)
    static async obtenerPerfilEstudiante(documento) {
        return this.makeRequest(`/api/estudiante/perfil/${documento}`);
    }

    static async obtenerEstudiantes() {
        return this.makeRequest(CONFIG.ENDPOINTS.ESTUDIANTES);
    }

    static async obtenerEstadisticas() {
        return this.makeRequest(CONFIG.ENDPOINTS.ESTADISTICAS);
    }
}

// ============================================================
// GESTIÓN DE SESIÓN
// ============================================================
class SessionManager {
    static setSession(documento, rol) {
        sessionStorage.setItem('documento', documento);
        sessionStorage.setItem('rol', rol);
    }

    static getDocumento() {
        return sessionStorage.getItem('documento');
    }

    static getRol() {
        return sessionStorage.getItem('rol');
    }

    static clearSession() {
        sessionStorage.clear();
    }

    static isLoggedIn() {
        return this.getDocumento() && this.getRol();
    }

    static checkAuth(requiredRole = null) {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        
        if (requiredRole && this.getRol() !== requiredRole) {
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    }
}

// ============================================================
// CONTROLADOR DE LOGIN
// ============================================================
class LoginController {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
            
            // Validación en tiempo real
            const inputs = loginForm.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', this.validateField.bind(this));
                input.addEventListener('blur', this.validateField.bind(this));
            });
        }
    }

    validateField(event) {
        const field = event.target;
        const isValid = field.checkValidity();
        
        field.classList.toggle('is-valid', isValid);
        field.classList.toggle('is-invalid', !isValid);
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const documento = document.getElementById('documento').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loading = submitBtn.querySelector('.loading');

        // Validación básica
        if (!documento || !password) {
            Utils.showAlert('Por favor complete todos los campos', 'warning');
            return;
        }

        // Mostrar loading
        btnText.style.display = 'none';
        loading.style.display = 'inline-block';
        submitBtn.disabled = true;

        try {
            const response = await ApiService.login(documento, password);
            
            if (response.success) {
                SessionManager.setSession(documento, response.rol);
                Utils.showAlert('¡Ingreso exitoso!', 'success');
                
                setTimeout(() => {
                    if (response.rol === 'ESTUDIANTE') {
                        window.location.href = 'estudiante.html';
                    } else if (response.rol === 'COORDINADOR') {
                        window.location.href = 'coordinador.html';
                    }
                }, 1000);
            } else {
                Utils.showAlert(response.message || 'Credenciales incorrectas', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            Utils.showAlert('Error de conexión. Intente nuevamente.', 'danger');
        } finally {
            // Ocultar loading
            btnText.style.display = 'inline-block';
            loading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
}

// ============================================================
// CONTROLADOR DE VISTA ESTUDIANTE
// ============================================================
class EstudianteController {
    constructor() {
        if (!SessionManager.checkAuth('ESTUDIANTE')) return;
        this.initializeComponents();
        this.loadStudentData();
    }

    initializeComponents() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                SessionManager.clearSession();
                window.location.href = 'index.html';
            });
        }

        // Inicializar Chart.js si está disponible
        this.initializeCharts();
    }

    async loadStudentData() {
        const documento = SessionManager.getDocumento();
        const loadingSpinner = document.getElementById('loadingSpinner');
        const mainContent = document.getElementById('mainContent');

        console.log('🚨 INICIO loadStudentData - Documento:', documento);

        try {
            loadingSpinner.style.display = 'block';
            mainContent.style.display = 'none';

            // 🔧 Usar el mismo endpoint que funciona en el panel de coordinador
            console.log('🔄 Llamando endpoint /api/resultados/' + documento);
            const estudiante = await ApiService.obtenerResultado(documento);
            
            console.log('📨 RESPUESTA COMPLETA del endpoint:', estudiante);
            
            if (estudiante) {
                console.log('🎯 Datos del estudiante recibidos:', estudiante);
                console.log('📊 Array de notas específico:', estudiante.notas);
                
                this.displayStudentInfo(estudiante);
                this.displayCompetencias(estudiante);
                await this.displayIncentivos(estudiante);
                this.displayAnalisisCompetencias(estudiante);
                this.updateStatusBanner(estudiante);
                
                console.log('✅ Datos cargados correctamente para:', estudiante.primerNombre, estudiante.primerApellido);
            } else {
                console.error('❌ No se recibieron datos del estudiante');
                Utils.showAlert('No se encontraron resultados para este estudiante', 'warning');
            }
        } catch (error) {
            console.error('❌ Error loading student data:', error);
            Utils.showAlert('Error al cargar la información del estudiante', 'danger');
        } finally {
            loadingSpinner.style.display = 'none';
            mainContent.style.display = 'block';
        }
    }

    displayStudentInfo(resultado) {
        // Debug: Ver qué datos tenemos
        console.log('🔍 DEBUG - Datos del estudiante para info personal:', resultado);
        
        // Información personal
        document.getElementById('infoDocumento').textContent = resultado.documento || '-';
        document.getElementById('infoTipoDocumento').textContent = resultado.tipoDocumento || 'CC';
        
        // Usar nombreCompleto si los campos individuales están nulos
        let nombreCompleto = '';
        if (resultado.primerNombre || resultado.primerApellido) {
            nombreCompleto = `${resultado.primerNombre || ''} ${resultado.segundoNombre || ''} ${resultado.primerApellido || ''} ${resultado.segundoApellido || ''}`.trim();
        } else if (resultado.nombreCompleto) {
            nombreCompleto = resultado.nombreCompleto;
        }
        
        document.getElementById('nombreCompleto').textContent = nombreCompleto || '-';
        document.getElementById('infoProgramaAcademico').textContent = resultado.programaAcademico || '-';
        document.getElementById('infoCorreoElectronico').textContent = resultado.correoElectronico || '-';
        document.getElementById('infoNumeroTelefono').textContent = resultado.numeroTelefono || '-';
        
        // Generar iniciales para el avatar
        const iniciales = this.generarIniciales(nombreCompleto || '');
        const elementoIniciales = document.getElementById('studentInitials');
        if (elementoIniciales) {
            elementoIniciales.textContent = iniciales;
        }
        
        // Nombre en navbar - usar nombreCompleto si está disponible
        let nombreNavbar = '';
        if (resultado.primerNombre && resultado.primerApellido) {
            nombreNavbar = `${resultado.primerNombre} ${resultado.primerApellido}`;
        } else if (resultado.nombreCompleto) {
            // Tomar las primeras dos palabras del nombre completo
            const palabras = resultado.nombreCompleto.split(' ');
            nombreNavbar = palabras.slice(0, 2).join(' ');
        }
        
        document.getElementById('studentName').textContent = nombreNavbar || 'Estudiante';
    }

    generarIniciales(nombreCompleto) {
        if (!nombreCompleto || nombreCompleto === '-') return '??';
        
        const palabras = nombreCompleto.trim().split(' ').filter(palabra => palabra.length > 0);
        if (palabras.length === 0) return '??';
        if (palabras.length === 1) return palabras[0].charAt(0).toUpperCase();
        
        // Tomar primera letra del primer nombre y primer apellido
        return (palabras[0].charAt(0) + palabras[palabras.length - 1].charAt(0)).toUpperCase();
    }

    displayCompetencias(resultado) {
        console.log('🚨 INICIO displayCompetencias');
        const container = document.getElementById('competenciasContainer');
        if (!container) {
            console.error('❌ No se encontró competenciasContainer');
            return;
        }

        // 🐛 Debug: Ver qué datos tenemos disponibles
        console.log('🔍 DEBUG - Datos del estudiante para competencias:', resultado);
        console.log('🔍 Array de notas:', resultado.notas);
        console.log('🔍 Tipo de notas:', typeof resultado.notas);
        console.log('🔍 Es array?:', Array.isArray(resultado.notas));

        let competencias = [];
        
        // Procesar las notas del array si existen
        if (resultado.notas && Array.isArray(resultado.notas)) {
            console.log('✅ Procesando array de notas...');
            competencias = resultado.notas.map(nota => {
                console.log('📝 Procesando nota:', nota);
                return {
                    nombre: nota.materia,
                    puntaje: nota.puntaje,
                    nivel: nota.nivel
                };
            });
            console.log('📊 Competencias procesadas desde notas:', competencias);
        } else {
            console.log('⚠️ Usando fallback a propiedades individuales');
            // Fallback a las propiedades individuales si no hay array de notas
            competencias = [
                { nombre: 'Comunicación Escrita', puntaje: resultado.comunicacionEscrita, nivel: resultado.comunicacionEscritaNivel },
                { nombre: 'Razonamiento Cuantitativo', puntaje: resultado.razonamientoCuantitativo, nivel: resultado.razonamientoCuantitativoNivel },
                { nombre: 'Lectura Crítica', puntaje: resultado.lecturaCritica, nivel: resultado.lecturaCriticaNivel },
                { nombre: 'Competencias Ciudadanas', puntaje: resultado.competenciasCiudadanas, nivel: resultado.competenciasCiudadanasNivel },
                { nombre: 'Inglés', puntaje: resultado.ingles, nivel: resultado.inglesNivel },
                { nombre: 'Diseño de Software', puntaje: resultado.disenoSoftware, nivel: resultado.disenoSoftwareNivel },
                { nombre: 'Pensamiento Científico Matemáticas y Estadística', puntaje: resultado.pensamientoCientifico, nivel: resultado.pensamientoCientificoNivel }
            ];
            console.log('📊 Competencias fallback:', competencias);
        }

        // 🐛 Debug: Ver el array de competencias procesado
        console.log('🔍 Array de competencias FINAL:', competencias);

        const htmlContent = competencias.map(comp => {
            // 🆕 Usar la nueva función para niveles 1-4 por materia
            const nivelInfo = Utils.calcularNivelMateria(comp.puntaje || 0);
            // Porcentaje basado en 100 puntos máximo por materia (no 300)
            const porcentaje = comp.puntaje ? Math.min((comp.puntaje / 100) * 100, 100) : 0;
            
            console.log(`📈 Generando HTML para ${comp.nombre}: puntaje=${comp.puntaje}, nivel=${nivelInfo.nivel}, porcentaje=${porcentaje}%`);
            
            return `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card competencia-card h-100">
                        <div class="card-body text-center">
                            <h6 class="card-title">${comp.nombre}</h6>
                            <div class="display-6 fw-bold text-primary mb-2">${comp.puntaje || 0}</div>
                            <div class="progress mb-2" style="height: 8px;">
                                <div class="progress-bar bg-${nivelInfo.color}" 
                                     style="width: ${porcentaje}%"></div>
                            </div>
                            <span class="badge badge-nivel bg-${nivelInfo.color}">
                                ${comp.nivel || nivelInfo.nivel}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('🖼️ HTML generado:', htmlContent);
        container.innerHTML = htmlContent;
        console.log('✅ HTML insertado en container');
    }

    async displayIncentivos(resultado) {
        const container = document.getElementById('incentivosContainer');
        if (!container) return;

        // Mostrar indicador de carga
        container.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando incentivos...</span>
                </div>
                <p class="mt-2 text-muted">Obteniendo tus incentivos...</p>
            </div>
        `;

        try {
            // Obtener los incentivos reales del estudiante desde el backend
            const documento = resultado.documento;
            const response = await fetch(`/api/incentivos/estudiante/${documento}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const incentivos = await response.json();
            console.log('🎁 Incentivos obtenidos del backend:', incentivos);

            if (incentivos.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-muted">
                        <i class="fas fa-info-circle fa-3x mb-3"></i>
                        <h5>Sin incentivos asignados</h5>
                        <p>Para obtener incentivos necesitas al menos 180 puntos en Saber PRO</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="row">
                        ${incentivos.map(incentivo => `
                            <div class="col-md-6 mb-3">
                                <div class="card incentivo-card">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center mb-3">
                                            <i class="fas fa-star text-warning me-2 fs-4"></i>
                                            <h6 class="card-title mb-0 fw-bold">${incentivo.tipoIncentivo?.nombre || incentivo.nombreCompleto}</h6>
                                        </div>
                                        <p class="card-text text-muted mb-2">${incentivo.descripcion || incentivo.tipoIncentivo?.descripcion || 'Sin descripción disponible'}</p>
                                        <div class="row text-center">
                                            <div class="col-6">
                                                <small class="text-muted">Estado</small>
                                                <div class="fw-bold">
                                                    <span class="badge ${this.getBadgeClassForEstado(incentivo.estado)}">${incentivo.estado}</span>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <small class="text-muted">Monto</small>
                                                <div class="fw-bold text-success">$${(incentivo.tipoIncentivo?.monto || 0).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        ${incentivo.fechaAsignacion ? `
                                        <div class="mt-2">
                                            <small class="text-muted">
                                                <i class="fas fa-calendar-alt me-1"></i>
                                                Asignado: ${new Date(incentivo.fechaAsignacion).toLocaleDateString()}
                                            </small>
                                        </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error obteniendo incentivos:', error);
            // Fallback a la función original si hay error
            const puntaje = resultado.puntajeGlobal || 0;
            const incentivosFallback = Utils.calcularIncentivos(puntaje);

            if (incentivosFallback.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-muted">
                        <i class="fas fa-info-circle fa-3x mb-3"></i>
                        <h5>Sin incentivos disponibles</h5>
                        <p>Para obtener incentivos necesitas al menos 180 puntos en Saber PRO</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="row">
                        ${incentivosFallback.map(incentivo => `
                            <div class="col-md-6 mb-3">
                                <div class="incentivo-item">
                                    <i class="fas fa-star me-2"></i>
                                    ${incentivo}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
    }

    // Función auxiliar para obtener la clase CSS del badge según el estado
    getBadgeClassForEstado(estado) {
        switch (estado?.toUpperCase()) {
            case 'PENDIENTE':
                return 'bg-warning text-dark';
            case 'APROBADO':
                return 'bg-success';
            case 'ENTREGADO':
                return 'bg-primary';
            case 'RECHAZADO':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }

    // 🆕 Generar análisis de competencias con recomendaciones
    displayAnalisisCompetencias(resultado) {
        if (!resultado.notas || !Array.isArray(resultado.notas)) return;

        // Calcular estadísticas
        const puntajes = resultado.notas.map(nota => nota.puntaje);
        const promedio = puntajes.reduce((sum, p) => sum + p, 0) / puntajes.length;
        const maximo = Math.max(...puntajes);
        const minimo = Math.min(...puntajes);

        // Identificar fortalezas y debilidades
        const fortalezas = resultado.notas.filter(nota => nota.puntaje >= 70).sort((a, b) => b.puntaje - a.puntaje);
        const debilidades = resultado.notas.filter(nota => nota.puntaje < 50).sort((a, b) => a.puntaje - b.puntaje);

        // Crear HTML de análisis
        const analisisContainer = document.getElementById('analisisCompetenciasContainer');
        if (analisisContainer) {
            analisisContainer.innerHTML = `
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <div class="analysis-card fortalezas-card">
                            <div class="analysis-header">
                                <i class="fas fa-trophy"></i>
                                <h6>Fortalezas (${fortalezas.length})</h6>
                            </div>
                            ${fortalezas.length > 0 ? 
                                fortalezas.map(nota => `
                                    <div class="analysis-item">
                                        <span class="materia">${nota.materia}</span>
                                        <span class="puntaje">${nota.puntaje}</span>
                                    </div>
                                `).join('') : 
                                '<p class="text-muted small">No hay fortalezas identificadas (puntaje ≥70)</p>'
                            }
                        </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <div class="analysis-card debilidades-card">
                            <div class="analysis-header">
                                <i class="fas fa-exclamation-triangle"></i>
                                <h6>Áreas de Mejora (${debilidades.length})</h6>
                            </div>
                            ${debilidades.length > 0 ? 
                                debilidades.map(nota => `
                                    <div class="analysis-item">
                                        <span class="materia">${nota.materia}</span>
                                        <span class="puntaje">${nota.puntaje}</span>
                                    </div>
                                `).join('') : 
                                '<p class="text-muted small">¡Excelente! No hay áreas críticas de mejora</p>'
                            }
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="analysis-card estadisticas-card">
                            <div class="analysis-header">
                                <i class="fas fa-chart-bar"></i>
                                <h6>Estadísticas Generales</h6>
                            </div>
                            <div class="row text-center">
                                <div class="col-3">
                                    <div class="stat-item">
                                        <div class="stat-value">${promedio.toFixed(1)}</div>
                                        <div class="stat-label">Promedio</div>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="stat-item">
                                        <div class="stat-value text-success">${maximo}</div>
                                        <div class="stat-label">Máximo</div>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="stat-item">
                                        <div class="stat-value text-danger">${minimo}</div>
                                        <div class="stat-label">Mínimo</div>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="stat-item">
                                        <div class="stat-value text-primary">${resultado.puntajeGlobal || 0}</div>
                                        <div class="stat-label">Global</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="analysis-card recomendaciones-card">
                            <div class="analysis-header">
                                <i class="fas fa-lightbulb"></i>
                                <h6>Recomendaciones Personalizadas</h6>
                            </div>
                            <div class="recommendations-content">
                                ${this.generarRecomendaciones(resultado.notas, promedio).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // 🆕 Generar recomendaciones basadas en el rendimiento
    generarRecomendaciones(notas, promedio) {
        const recomendaciones = [];
        
        notas.forEach(nota => {
            if (nota.puntaje < 30) {
                recomendaciones.push(`
                    <div class="recommendation critical">
                        <i class="fas fa-exclamation-circle"></i>
                        <strong>${nota.materia}:</strong> Requiere atención urgente. Te recomendamos buscar tutorías y recursos adicionales.
                    </div>
                `);
            } else if (nota.puntaje < 50) {
                recomendaciones.push(`
                    <div class="recommendation warning">
                        <i class="fas fa-chart-line"></i>
                        <strong>${nota.materia}:</strong> Con práctica adicional puedes mejorar significativamente.
                    </div>
                `);
            } else if (nota.puntaje >= 80) {
                recomendaciones.push(`
                    <div class="recommendation success">
                        <i class="fas fa-star"></i>
                        <strong>${nota.materia}:</strong> ¡Excelente desempeño! Considera ser tutor de otros estudiantes.
                    </div>
                `);
            }
        });

        if (recomendaciones.length === 0) {
            recomendaciones.push(`
                <div class="recommendation info">
                    <i class="fas fa-info-circle"></i>
                    <strong>Rendimiento general:</strong> Tu desempeño es consistente. Sigue practicando para alcanzar la excelencia.
                </div>
            `);
        }

        return recomendaciones;
    }

    updateStatusBanner(resultado) {
        const puntaje = resultado.puntajeGlobal || 0;
        const banner = document.getElementById('statusBanner');
        const statusIcon = document.getElementById('statusIcon');
        const statusText = document.getElementById('statusText');
        const statusDescription = document.getElementById('statusDescription');
        const puntajeElement = document.getElementById('puntajeGlobal');

        puntajeElement.textContent = puntaje;

        if (puntaje >= 80) {
            banner.className = 'alert alert-status alert-success text-center';
            statusIcon.className = 'fas fa-check-circle me-2';
            statusText.textContent = '¡Puede Graduarse!';
            statusDescription.textContent = 'Cumple con el puntaje mínimo requerido para graduación';
        } else {
            banner.className = 'alert alert-status alert-danger text-center';
            statusIcon.className = 'fas fa-exclamation-triangle me-2';
            statusText.textContent = 'No Puede Graduarse';
            statusDescription.textContent = 'Puntaje insuficiente. Mínimo requerido: 80 puntos';
        }
    }

    initializeCharts() {
        // Implementar gráficos si Chart.js está disponible
        if (typeof Chart !== 'undefined') {
            // Chart de radar para competencias se implementará cuando se carguen los datos
        }
    }
}

// ============================================================
// CONTROLADOR DE DASHBOARD COORDINADOR
// ============================================================
class CoordinadorController {
    constructor() {
        if (!SessionManager.checkAuth('COORDINADOR')) return;
        this.currentSection = 'dashboard';
        this.initializeComponents();
        this.loadDashboardData();
    }

    initializeComponents() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                SessionManager.clearSession();
                window.location.href = 'index.html';
            });
        }

        // Navigation
        this.initializeNavigation();
        this.initializeCharts();
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'estudiantes':
                this.loadEstudiantesData();
                break;
            case 'resultados':
                this.loadResultadosData();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // Cargar estadísticas generales
            // const estadisticas = await ApiService.obtenerEstadisticas();
            
            // Por ahora, datos simulados
            const estadisticas = {
                totalEstudiantes: 150,
                puedenGraduar: 120,
                noPuedenGraduar: 30,
                conIncentivos: 45
            };

            this.updateDashboardStats(estadisticas);
            this.loadChartsData();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Utils.showAlert('Error al cargar estadísticas del dashboard', 'danger');
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('totalEstudiantes').textContent = Utils.formatNumber(stats.totalEstudiantes);
        document.getElementById('puedenGraduar').textContent = Utils.formatNumber(stats.puedenGraduar);
        document.getElementById('noPuedenGraduar').textContent = Utils.formatNumber(stats.noPuedenGraduar);
        document.getElementById('conIncentivos').textContent = Utils.formatNumber(stats.conIncentivos);
    }

    async loadEstudiantesData() {
        try {
            // Mostrar indicador de carga
            const tbody = document.querySelector('#estudiantesTable tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted">
                            <i class="fas fa-spinner fa-spin me-2"></i>
                            Cargando estudiantes...
                        </td>
                    </tr>
                `;
            }

            // Cargar estudiantes desde la API correcta
            const response = await ApiService.makeRequest('/api/resultados');
            
            if (response && response.length > 0) {
                this.displayEstudiantesTable(response);
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted">
                            <i class="fas fa-info-circle me-2"></i>
                            No hay estudiantes registrados
                        </td>
                    </tr>
                `;
            }
            
        } catch (error) {
            console.error('Error loading students data:', error);
            Utils.showAlert('Error al cargar datos de estudiantes', 'danger');
            
            const tbody = document.querySelector('#estudiantesTable tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Error al cargar estudiantes
                        </td>
                    </tr>
                `;
            }
        }
    }

    displayEstudiantesTable(estudiantes) {
        const tbody = document.querySelector('#estudiantesTable tbody');
        if (!tbody) return;

        tbody.innerHTML = estudiantes.map(est => {
            const nivelInfo = Utils.calcularNivelPuntaje(est.puntajeGlobal || 0);
            const estadoBadge = (est.puntajeGlobal >= 80) 
                ? '<span class="badge bg-success">Puede Graduarse</span>'
                : '<span class="badge bg-danger">No Puede Graduarse</span>';
            
            const nombreCompleto = est.getNombreCompleto ? est.getNombreCompleto() : 
                `${est.primerNombre || ''} ${est.segundoNombre || ''} ${est.primerApellido || ''} ${est.segundoApellido || ''}`.trim();
            
            // Calcular incentivos
            const incentivos = Utils.calcularIncentivos(est.puntajeGlobal || 0);
            const incentivosTexto = incentivos.length > 0 ? 
                `<small class="text-success">${incentivos.length} incentivo(s)</small>` : 
                '<small class="text-muted">Ninguno</small>';
            
            return `
                <tr>
                    <td><strong>${est.documento}</strong></td>
                    <td>${nombreCompleto}</td>
                    <td><small>${est.programaAcademico || 'No especificado'}</small></td>
                    <td>
                        <span class="badge bg-${nivelInfo.color} fs-6">${est.puntajeGlobal || 0}</span>
                        <br><small class="text-muted">${nivelInfo.nivel}</small>
                    </td>
                    <td>${estadoBadge}</td>
                    <td>${incentivosTexto}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="verEstudiante('${est.documento}')" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-warning" onclick="console.log('🔥 BOTÓN EDITAR CLICADO:', '${est.documento}'); editarEstudiante('${est.documento}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="eliminarEstudiante('${est.documento}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Actualizar estadísticas del dashboard
        this.updateDashboardStats({
            totalEstudiantes: estudiantes.length,
            puedenGraduar: estudiantes.filter(e => (e.puntajeGlobal || 0) >= 80).length,
            noPuedenGraduar: estudiantes.filter(e => (e.puntajeGlobal || 0) < 80).length,
            conIncentivos: estudiantes.filter(e => (e.puntajeGlobal || 0) >= 180).length
        });
    }

    initializeCharts() {
        // Inicializar gráficos con Chart.js cuando esté disponible
        if (typeof Chart !== 'undefined') {
            this.loadChartsData();
        }
    }

    loadChartsData() {
        // Implementar gráficos del dashboard
        // Por ahora, placeholder
    }

    loadResultadosData() {
        // Implementar carga de datos de resultados
    }
}

// ============================================================
// INICIALIZACIÓN GLOBAL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'index.html':
        case '':
            window.loginController = new LoginController();
            break;
        case 'estudiante.html':
            window.estudianteController = new EstudianteController();
            break;
        case 'coordinador.html':
            window.coordinadorController = new CoordinadorController();
            break;
    }
});

// ============================================================
// FUNCIONES GLOBALES AUXILIARES
// ============================================================
window.nuevoEstudiante = function() {
    // Mostrar modal de nuevo estudiante
    const modal = new bootstrap.Modal(document.getElementById('estudianteModal'));
    
    // Limpiar formulario - corregir el ID del formulario
    const form = document.getElementById('formEstudiante');
    if (form) {
        form.reset();
    }
    
    // Configurar para nuevo estudiante
    const modalTitle = document.querySelector('#modalTitle span');
    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Estudiante';
    }
    
    const documentoField = document.getElementById('documento');
    if (documentoField) {
        documentoField.disabled = false;
    }
    
    modal.show();
};

window.editarEstudiante = async function(documento) {
    console.log('🚀 INICIANDO FUNCIÓN editarEstudiante con documento:', documento);
    
    try {
        // Obtener datos del estudiante usando el endpoint correcto
        console.log('📡 Haciendo petición al servidor...');
        const response = await ApiService.makeRequest(`/api/resultados/${documento}`);
        const estudiante = response;
        
        console.log('✅ Datos del estudiante recibidos:', estudiante); // Debug
        
        // Llenar formulario con datos existentes usando los IDs correctos del HTML
        const setFieldValue = (id, value) => {
            const field = document.getElementById(id);
            if (field) {
                field.value = value || '';
                console.log(`✅ Campo ${id}: ${value}`); // Debug
            } else {
                console.error(`❌ Campo ${id} no encontrado en el DOM`);
            }
        };
        
        // Datos personales
        setFieldValue('documento', estudiante.documento);
        setFieldValue('tipoDocumento', estudiante.tipoDocumento);
        setFieldValue('primerNombre', estudiante.primerNombre);
        setFieldValue('segundoNombre', estudiante.segundoNombre);
        setFieldValue('primerApellido', estudiante.primerApellido);
        setFieldValue('segundoApellido', estudiante.segundoApellido);
        setFieldValue('correoElectronico', estudiante.correoElectronico);
        setFieldValue('numeroTelefono', estudiante.numeroTelefono);
        setFieldValue('programaAcademico', estudiante.programaAcademico);
        
        // Puntaje global
        setFieldValue('puntajeGlobal', estudiante.puntajeGlobal);
        
        // Extraer puntajes de competencias del array de notas
        if (estudiante.notas && Array.isArray(estudiante.notas)) {
            console.log('Notas encontradas:', estudiante.notas); // Debug
            console.log('Total de notas:', estudiante.notas.length);
            
            // Mapear las notas a los campos del formulario
            estudiante.notas.forEach((nota, index) => {
                const materia = (nota.materia || '').toLowerCase();
                console.log(`Nota ${index + 1}: "${nota.materia}" = ${nota.puntaje}`); // Debug
                
                // Patrones específicos que coinciden EXACTAMENTE con los nombres en BD
                if (materia.includes('comunicación escrita') || materia === 'comunicación escrita') {
                    console.log('✓ Encontrada Comunicación Escrita:', nota.puntaje);
                    setFieldValue('comunicacionEscrita', nota.puntaje);
                } else if (materia.includes('razonamiento cuantitativo') || materia === 'razonamiento cuantitativo') {
                    console.log('✓ Encontrado Razonamiento Cuantitativo:', nota.puntaje);
                    setFieldValue('razonamientoCuantitativo', nota.puntaje);
                } else if (materia.includes('lectura crítica') || materia === 'lectura crítica') {
                    console.log('✓ Encontrada Lectura Crítica:', nota.puntaje);
                    setFieldValue('lecturaCritica', nota.puntaje);
                } else if (materia.includes('competencias ciudadanas') || materia === 'competencias ciudadanas') {
                    console.log('✓ Encontradas Competencias Ciudadanas:', nota.puntaje);
                    setFieldValue('competenciasCiudadanas', nota.puntaje);
                } else if ((materia.includes('inglés') || materia.includes('ingles')) && !materia.includes('avanzado')) {
                    console.log('✓ Encontrado Inglés:', nota.puntaje);
                    setFieldValue('ingles', nota.puntaje);
                } else if (materia.includes('formulación de proyectos') || materia.includes('proyectos de ingeniería')) {
                    console.log('✓ Encontrada Formulación de Proyectos:', nota.puntaje);
                    setFieldValue('formulacionProyectos', nota.puntaje);
                } else if (materia.includes('diseño de software') || materia === 'diseño de software') {
                    console.log('✓ Encontrado Diseño de Software:', nota.puntaje);
                    setFieldValue('disenoSoftware', nota.puntaje);
                } else {
                    console.log(`⚠️ Materia no reconocida: "${nota.materia}"`);
                }
            });
        } else {
            console.warn('No se encontraron notas en el estudiante o notas no es un array');
            console.log('Estructura del estudiante:', Object.keys(estudiante));
            
            // Intentar cargar desde propiedades directas como fallback
            setFieldValue('comunicacionEscrita', estudiante.comunicacionEscrita);
            setFieldValue('razonamientoCuantitativo', estudiante.razonamientoCuantitativo);
            setFieldValue('lecturaCritica', estudiante.lecturaCritica);
            setFieldValue('competenciasCiudadanas', estudiante.competenciasCiudadanas);
            setFieldValue('ingles', estudiante.ingles);
            setFieldValue('formulacionProyectos', estudiante.formulacionProyectos);
            setFieldValue('disenoSoftware', estudiante.disenoSoftware);
        }
        
        // Configurar modal para edición
        const modalTitle = document.querySelector('#modalTitle span');
        if (modalTitle) {
            modalTitle.textContent = 'Editar Estudiante';
        }
        
        const documentoField = document.getElementById('documento');
        if (documentoField) {
            documentoField.disabled = true;
        }
        
        console.log('✅ Abriendo modal de edición...');
        const modal = new bootstrap.Modal(document.getElementById('estudianteModal'));
        modal.show();
        
        // Log final de verificación
        setTimeout(() => {
            console.log('🔍 VERIFICACIÓN FINAL - Valores en campos:');
            console.log('  - comunicacionEscrita:', document.getElementById('comunicacionEscrita')?.value);
            console.log('  - razonamientoCuantitativo:', document.getElementById('razonamientoCuantitativo')?.value);
            console.log('  - lecturaCritica:', document.getElementById('lecturaCritica')?.value);
            console.log('  - competenciasCiudadanas:', document.getElementById('competenciasCiudadanas')?.value);
            console.log('  - ingles:', document.getElementById('ingles')?.value);
            console.log('  - formulacionProyectos:', document.getElementById('formulacionProyectos')?.value);
            console.log('  - disenoSoftware:', document.getElementById('disenoSoftware')?.value);
        }, 500);
        
    } catch (error) {
        console.error('❌ Error al cargar estudiante:', error);
        Utils.showAlert('Error al cargar los datos del estudiante', 'danger');
    }
};

window.verEstudiante = async function(documento) {
    try {
        const response = await ApiService.makeRequest(`/api/resultados/${documento}`);
        const estudiante = response;
        
        // Debug: verificar qué datos estamos recibiendo
        console.log('Datos del estudiante:', estudiante);
        
        if (!estudiante) {
            Utils.showAlert('No se encontraron datos del estudiante', 'warning');
            return;
        }
        
        // Llenar información personal
        document.getElementById('detalleDocumento').textContent = estudiante.documento || '-';
        
        // Tipo de documento (si está disponible)
        const detalleTipoDocumento = document.getElementById('detalleTipoDocumento');
        if (detalleTipoDocumento) {
            detalleTipoDocumento.textContent = estudiante.tipoDocumento || '-';
        }
        
        // Construir nombre completo de diferentes maneras posibles
        let nombreCompleto = '';
        if (estudiante.nombreCompleto) {
            nombreCompleto = estudiante.nombreCompleto;
        } else {
            // Construir desde componentes individuales
            const partes = [
                estudiante.primerNombre,
                estudiante.segundoNombre,
                estudiante.primerApellido,
                estudiante.segundoApellido
            ].filter(parte => parte && parte.trim() !== '');
            nombreCompleto = partes.join(' ');
        }
        
        document.getElementById('detalleNombre').textContent = nombreCompleto || '-';
        
        // Correo electrónico
        const detalleCorreo = document.getElementById('detalleCorreo');
        if (detalleCorreo) {
            detalleCorreo.textContent = estudiante.correoElectronico || '-';
        }
        
        // Teléfono
        const detalleTelefono = document.getElementById('detalleTelefono');
        if (detalleTelefono) {
            detalleTelefono.textContent = estudiante.numeroTelefono || '-';
        }
        
        document.getElementById('detallePrograma').textContent = estudiante.programaAcademico || '-';
        
        // Agregar período si existe el elemento
        const detallePeriodo = document.getElementById('detallePeriodo');
        if (detallePeriodo) {
            detallePeriodo.textContent = estudiante.periodo || '2024-2';
        }
        
        // Llenar resultados globales
        const puntajeGlobal = estudiante.puntajeGlobal || 0;
        document.getElementById('detallePuntaje').textContent = puntajeGlobal;
        
        // Actualizar barra de progreso del puntaje si existe
        const barraPuntaje = document.querySelector('#detallePuntajeBarra .progress-bar');
        if (barraPuntaje) {
            const porcentajePuntaje = (puntajeGlobal / 300) * 100;
            barraPuntaje.style.width = `${porcentajePuntaje}%`;
            barraPuntaje.className = `progress-bar ${getColorPuntaje(puntajeGlobal)}`;
        }
        
        // Estado de graduación
        const estadoGraduacion = puntajeGlobal >= 80 ? 'Puede Graduarse' : 'No Puede Graduarse';
        const badgeClass = puntajeGlobal >= 80 ? 'bg-success' : 'bg-danger';
        document.getElementById('detalleEstado').innerHTML = `<span class="badge ${badgeClass}">${estadoGraduacion}</span>`;
        
        // Nivel global si existe el elemento
        const detalleNivel = document.getElementById('detalleNivel');
        if (detalleNivel) {
            const nivelGlobal = calcularNivelGlobal(puntajeGlobal);
            const nivelClass = getNivelClass(nivelGlobal);
            detalleNivel.innerHTML = `<span class="badge ${nivelClass}">${nivelGlobal}</span>`;
        }
        
        // Calcular y mostrar incentivos
        let incentivosTexto;
        if (estudiante.estadoIncentivos) {
            incentivosTexto = estudiante.estadoIncentivos;
        } else {
            incentivosTexto = calcularIncentivos(puntajeGlobal);
        }
        
        const incentivosContainer = document.getElementById('detalleIncentivos');
        if (incentivosContainer) {
            // Verificar si hay contenedores para incentivos múltiples o un solo badge
            const tieneMultiplesIncentivos = document.querySelector('#detalleIncentivos .badge');
            if (tieneMultiplesIncentivos || puntajeGlobal >= 180) {
                // Mostrar múltiples incentivos como badges
                const incentivos = [];
                if (puntajeGlobal >= 241) {
                    incentivos.push('Beca 100% derechos de grado', 'Exoneración Seminario (Nota 4.7)', 
                                  'Ayuda para estudios de posgrado', 'Mejores oportunidades laborales', 
                                  'Condonación de deudas Icetex');
                } else if (puntajeGlobal >= 211) {
                    incentivos.push('Beca 50% derechos de grado', 'Exoneración Seminario (Nota 4.7)', 
                                  'Ayuda para estudios de posgrado');
                } else if (puntajeGlobal >= 180) {
                    incentivos.push('Exoneración Seminario (Nota 4.7)');
                }
                
                if (incentivos.length > 0) {
                    incentivosContainer.innerHTML = incentivos.map(inc => 
                        `<span class="badge bg-success me-1 mb-1">${inc}</span>`
                    ).join('');
                } else {
                    incentivosContainer.innerHTML = '<span class="text-muted">Sin incentivos</span>';
                }
            } else {
                // Mostrar un solo badge con el estado
                const incentivoClass = getIncentivoClass(incentivosTexto);
                incentivosContainer.innerHTML = `<span class="badge ${incentivoClass}">${incentivosTexto}</span>`;
            }
        }
        
        // Mostrar competencias en el nuevo formato si existen los contenedores
        const containerGenericas = document.getElementById('detalleCompetenciasGenericas');
        const containerEspecificas = document.getElementById('detalleCompetenciasEspecificas');
        
        if (containerGenericas && containerEspecificas) {
            mostrarCompetenciasNuevo(estudiante.notas || []);
            crearGraficoCompetencias(estudiante.notas || []);
        } else {
            // Usar el formato anterior si no existe el nuevo modal
            mostrarCompetenciasAntiguo(estudiante);
        }
        
        const modal = new bootstrap.Modal(document.getElementById('estudianteDetalleModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error al ver estudiante:', error);
        Utils.showAlert('Error al cargar los detalles del estudiante', 'danger');
    }
};

window.eliminarEstudiante = async function(documento) {
    if (!confirm('¿Está seguro de que desea eliminar este estudiante? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        await ApiService.makeRequest(`/api/resultados/${documento}`, { method: 'DELETE' });
        Utils.showAlert('Estudiante eliminado exitosamente', 'success');
        
        // Recargar tabla
        if (window.coordinadorController) {
            window.coordinadorController.loadEstudiantesData();
        }
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        Utils.showAlert('Error al eliminar el estudiante', 'danger');
    }
};

window.buscarEstudiante = function() {
    const termino = document.getElementById('buscarInput').value.toLowerCase().trim();
    const filas = document.querySelectorAll('#estudiantesTable tbody tr');
    
    filas.forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        const mostrar = termino === '' || texto.includes(termino);
        fila.style.display = mostrar ? '' : 'none';
    });
};

// Funciones auxiliares para el modal de detalles
function mostrarCompetenciasNuevo(notas) {
    const competenciasGenericas = ['Comunicación Escrita', 'Razonamiento Cuantitativo', 'Lectura Crítica', 'Competencias Ciudadanas', 'Inglés'];
    const competenciasEspecificas = ['Formulación de Proyectos de Ingeniería', 'Diseño de Software'];
    
    // Mostrar competencias genéricas
    const containerGenericas = document.getElementById('detalleCompetenciasGenericas');
    if (containerGenericas) {
        containerGenericas.innerHTML = '';
        
        competenciasGenericas.forEach(nombreCompetencia => {
            const nota = notas.find(n => 
                n.materia.toLowerCase().includes(nombreCompetencia.split(' ')[0].toLowerCase()) || 
                n.materia.toLowerCase().includes(nombreCompetencia.toLowerCase())
            );
            const puntaje = nota ? nota.puntaje : 0;
            const nivel = nota ? nota.nivel : 'Sin Evaluar';
            
            containerGenericas.appendChild(crearElementoCompetencia(nombreCompetencia, puntaje, nivel));
        });
    }
    
    // Mostrar competencias específicas
    const containerEspecificas = document.getElementById('detalleCompetenciasEspecificas');
    if (containerEspecificas) {
        containerEspecificas.innerHTML = '';
        
        competenciasEspecificas.forEach(nombreCompetencia => {
            const nota = notas.find(n => 
                n.materia.includes('Formulación') || 
                n.materia.includes('Diseño') ||
                n.materia.toLowerCase().includes(nombreCompetencia.toLowerCase())
            );
            const puntaje = nota ? nota.puntaje : 0;
            const nivel = nota ? nota.nivel : 'Sin Evaluar';
            
            containerEspecificas.appendChild(crearElementoCompetencia(nombreCompetencia, puntaje, nivel));
        });
    }
}

// Función para mostrar competencias en el formato anterior (compatibilidad)
function mostrarCompetenciasAntiguo(estudiante) {
    const competenciasContainer = document.getElementById('detalleCompetencias');
    if (competenciasContainer) {
        // Extraer puntajes directamente del objeto estudiante o de las notas
        let comunicacionEscrita = estudiante.comunicacionEscrita || 0;
        let razonamientoCuantitativo = estudiante.razonamientoCuantitativo || 0;
        let lecturaCritica = estudiante.lecturaCritica || 0;
        let competenciasCiudadanas = estudiante.competenciasCiudadanas || 0;
        let ingles = estudiante.ingles || 0;
        let disenoSoftware = estudiante.disenoSoftware || 0;
        let formulacionProyectos = estudiante.formulacionProyectos || 0;
        
        // Si no están directamente en el objeto, buscar en las notas
        if (estudiante.notas && Array.isArray(estudiante.notas)) {
            estudiante.notas.forEach(nota => {
                const materia = nota.materia.toLowerCase();
                if (materia.includes('comunicación') || materia.includes('escrita')) {
                    comunicacionEscrita = nota.puntaje || 0;
                } else if (materia.includes('razonamiento') || materia.includes('cuantitativo')) {
                    razonamientoCuantitativo = nota.puntaje || 0;
                } else if (materia.includes('lectura') || materia.includes('crítica')) {
                    lecturaCritica = nota.puntaje || 0;
                } else if (materia.includes('ciudadanas')) {
                    competenciasCiudadanas = nota.puntaje || 0;
                } else if (materia.includes('inglés') || materia.includes('ingles')) {
                    ingles = nota.puntaje || 0;
                } else if (materia.includes('diseño') || materia.includes('software')) {
                    disenoSoftware = nota.puntaje || 0;
                } else if (materia.includes('formulación') || materia.includes('proyectos')) {
                    formulacionProyectos = nota.puntaje || 0;
                }
            });
        }
        
        const competenciasHtml = `
            <div class="row">
                <div class="col-md-6 mb-2">
                    <small class="text-muted">Comunicación Escrita</small>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${(comunicacionEscrita/300)*100}%" 
                             aria-valuenow="${comunicacionEscrita}" aria-valuemin="0" aria-valuemax="300">
                            ${comunicacionEscrita}
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-2">
                    <small class="text-muted">Razonamiento Cuantitativo</small>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${(razonamientoCuantitativo/300)*100}%" 
                             aria-valuenow="${razonamientoCuantitativo}" aria-valuemin="0" aria-valuemax="300">
                            ${razonamientoCuantitativo}
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-2">
                    <small class="text-muted">Lectura Crítica</small>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${(lecturaCritica/300)*100}%" 
                             aria-valuenow="${lecturaCritica}" aria-valuemin="0" aria-valuemax="300">
                            ${lecturaCritica}
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-2">
                    <small class="text-muted">Competencias Ciudadanas</small>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${(competenciasCiudadanas/300)*100}%" 
                             aria-valuenow="${competenciasCiudadanas}" aria-valuemin="0" aria-valuemax="300">
                            ${competenciasCiudadanas}
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-2">
                    <small class="text-muted">Inglés</small>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${(ingles/300)*100}%" 
                             aria-valuenow="${ingles}" aria-valuemin="0" aria-valuemax="300">
                            ${ingles}
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-2">
                    <small class="text-muted">Formulación de Proyectos</small>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${(formulacionProyectos/300)*100}%" 
                             aria-valuenow="${formulacionProyectos}" aria-valuemin="0" aria-valuemax="300">
                            ${formulacionProyectos}
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-2">
                    <small class="text-muted">Diseño de Software</small>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${(disenoSoftware/300)*100}%" 
                             aria-valuenow="${disenoSoftware}" aria-valuemin="0" aria-valuemax="300">
                            ${disenoSoftware}
                        </div>
                    </div>
                </div>
            </div>
        `;
        competenciasContainer.innerHTML = competenciasHtml;
    }
}

function crearElementoCompetencia(nombre, puntaje, nivel) {
    const div = document.createElement('div');
    div.className = 'competencia-item';
    
    const porcentaje = (puntaje / 300) * 100;
    const colorClass = getColorNivel(nivel);
    
    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="competencia-nombre">${nombre}</div>
            <div class="competencia-puntaje text-primary">${puntaje}</div>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="competencia-nivel ${colorClass}">${nivel}</span>
            <small class="text-muted">${puntaje}/300</small>
        </div>
        <div class="progress competencia-progreso">
            <div class="progress-bar ${getColorPuntaje(puntaje)}" style="width: ${porcentaje}%"></div>
        </div>
    `;
    
    return div;
}

function crearGraficoCompetencias(notas) {
    const ctx = document.getElementById('competenciasChart');
    if (!ctx) return; // Si no existe el canvas, no crear el gráfico
    
    // Destruir gráfico existente si existe
    if (window.competenciasChartInstance) {
        window.competenciasChartInstance.destroy();
    }
    
    const competencias = [
        'Comunicación Escrita',
        'Razonamiento Cuantitativo', 
        'Lectura Crítica',
        'Competencias Ciudadanas',
        'Inglés',
        'Formulación Proyectos',
        'Diseño Software'
    ];
    
    const datos = competencias.map(comp => {
        const nota = notas.find(n => 
            n.materia.toLowerCase().includes(comp.toLowerCase().split(' ')[0]) ||
            (comp.includes('Formulación') && n.materia.includes('Formulación')) ||
            (comp.includes('Diseño') && n.materia.includes('Diseño'))
        );
        return nota ? nota.puntaje : 0;
    });
    
    window.competenciasChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: competencias,
            datasets: [{
                label: 'Puntajes',
                data: datos,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(76, 175, 80, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 300,
                    ticks: {
                        stepSize: 50
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Funciones auxiliares
function getColorPuntaje(puntaje) {
    if (puntaje >= 241) return 'bg-success';
    if (puntaje >= 211) return 'bg-info';
    if (puntaje >= 180) return 'bg-warning';
    if (puntaje >= 150) return 'bg-orange';
    return 'bg-danger';
}

function getColorNivel(nivel) {
    switch (nivel.toLowerCase()) {
        case 'excelente': return 'nivel-excelente';
        case 'muy bueno': return 'nivel-muy-bueno';
        case 'bueno': return 'nivel-bueno';
        case 'regular': return 'nivel-regular';
        case 'deficiente': return 'nivel-deficiente';
        default: return 'bg-secondary';
    }
}

function calcularNivelGlobal(puntaje) {
    if (puntaje >= 241) return 'Excelente';
    if (puntaje >= 211) return 'Muy Bueno';
    if (puntaje >= 180) return 'Bueno';
    if (puntaje >= 150) return 'Regular';
    return 'Deficiente';
}

function getNivelClass(nivel) {
    switch (nivel.toLowerCase()) {
        case 'excelente': return 'bg-success';
        case 'muy bueno': return 'bg-info';
        case 'bueno': return 'bg-primary';
        case 'regular': return 'bg-warning';
        case 'deficiente': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function calcularIncentivos(puntaje) {
    if (puntaje >= 241) return 'Incentivo Máximo';
    if (puntaje >= 211) return 'Incentivo Medio';
    if (puntaje >= 180) return 'Incentivo Bajo';
    return 'Sin Incentivo';
}

function getIncentivoClass(incentivo) {
    if (incentivo.includes('Máximo')) return 'bg-success';
    if (incentivo.includes('Medio')) return 'bg-info';
    if (incentivo.includes('Bajo')) return 'bg-warning';
    return 'bg-secondary';
}

window.importarDatos = function() {
    const modal = new bootstrap.Modal(document.getElementById('importarModal'));
    modal.show();
};

window.procesarImportacion = function() {
    const archivo = document.getElementById('archivoImportar').files[0];
    if (!archivo) {
        Utils.showAlert('Por favor seleccione un archivo', 'warning');
        return;
    }
    
    // Por ahora mostrar mensaje de funcionalidad en desarrollo
    Utils.showAlert('Funcionalidad de importación en desarrollo', 'info');
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('importarModal'));
    modal.hide();
};

// Exportar para uso global
window.SaberProSystem = {
    Utils,
    ApiService,
    SessionManager,
    CONFIG
};

console.log('🎉 app-enhanced.js cargado COMPLETAMENTE - FINAL');
