// ============================================================
// SABER PRO - SISTEMA SIMPLE Y FUNCIONAL
// ============================================================

console.log('🚀 app-simple.js cargado correctamente');

// ============================================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================================

function initNavigation() {
    console.log('🧭 Inicializando navegación');
    
    // Obtener todos los enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    
    console.log(`📋 Encontrados ${navLinks.length} enlaces y ${contentSections.length} secciones`);
    
    // Agregar event listeners a los enlaces
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            console.log(`🎯 Cambiando a sección: ${targetSection}`);
            
            // Remover clase active de todos los enlaces
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al enlace clickeado
            this.classList.add('active');
            
            // Ocultar todas las secciones
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Mostrar la sección objetivo
            const targetElement = document.getElementById(`${targetSection}-section`);
            if (targetElement) {
                targetElement.classList.add('active');
                console.log(`✅ Sección ${targetSection} activada`);
                
                // Cargar datos específicos según la sección
                if (targetSection === 'estudiantes') {
                    cargarEstudiantes();
                } else if (targetSection === 'dashboard') {
                    cargarDashboard();
                } else if (targetSection === 'reportes') {
                    cargarReportes();
                } else if (targetSection === 'incentivos') {
                    cargarIncentivos();
                }
            } else {
                console.error(`❌ Sección ${targetSection}-section no encontrada`);
            }
        });
    });
}

// ============================================================
// FUNCIONES PRINCIPALES
// ============================================================

// Función para editar estudiante
// Variable global para almacenar el puntaje original del estudiante en edición
window.puntajeGlobalOriginal = null;

window.editarEstudiante = async function(documento) {
    console.log('🔥 EDITANDO ESTUDIANTE:', documento);
    
    try {
        // Hacer petición al servidor
        const response = await fetch(`/api/resultados/${documento}`);
        const estudiante = await response.json();
        
        console.log('📡 Estudiante recibido:', estudiante);
        
        // 💾 Guardar puntaje original para detectar cambios
        window.puntajeGlobalOriginal = estudiante.puntajeGlobal;
        console.log('💾 Puntaje original guardado:', window.puntajeGlobalOriginal);
        
        // Función helper para llenar campos
        function setField(id, value) {
            const field = document.getElementById(id);
            if (field) {
                field.value = value || '';
                console.log(`✅ ${id}: ${value}`);
            } else {
                console.error(`❌ Campo ${id} no encontrado`);
            }
        }
        
        // Llenar datos personales
        setField('documento', estudiante.documento);
        setField('tipoDocumento', estudiante.tipoDocumento);
        setField('primerNombre', estudiante.primerNombre);
        setField('segundoNombre', estudiante.segundoNombre);
        setField('primerApellido', estudiante.primerApellido);
        setField('segundoApellido', estudiante.segundoApellido);
        setField('correoElectronico', estudiante.correoElectronico);
        setField('numeroTelefono', estudiante.numeroTelefono);
        setField('programaAcademico', estudiante.programaAcademico);
        setField('puntajeGlobal', estudiante.puntajeGlobal);
        
        // Procesar notas si existen
        if (estudiante.notas && Array.isArray(estudiante.notas)) {
            console.log('📊 Procesando notas:', estudiante.notas.length);
            
            estudiante.notas.forEach((nota, index) => {
                const materia = nota.materia.toLowerCase();
                console.log(`Nota ${index + 1}: "${nota.materia}" = ${nota.puntaje}`);
                
                // Mapear cada materia específicamente
                if (materia === 'comunicación escrita') {
                    setField('comunicacionEscrita', nota.puntaje);
                } else if (materia === 'razonamiento cuantitativo') {
                    setField('razonamientoCuantitativo', nota.puntaje);
                } else if (materia === 'lectura crítica') {
                    setField('lecturaCritica', nota.puntaje);
                } else if (materia === 'competencias ciudadanas') {
                    setField('competenciasCiudadanas', nota.puntaje);
                } else if (materia === 'inglés') {
                    setField('ingles', nota.puntaje);
                } else if (materia === 'formulación de proyectos de ingeniería') {
                    setField('formulacionProyectos', nota.puntaje);
                } else if (materia === 'diseño de software') {
                    setField('disenoSoftware', nota.puntaje);
                } else if (materia === 'pensamiento científico matemáticas y estadística') {
                    setField('pensamientoCientifico', nota.puntaje);
                } else {
                    console.log(`⚠️ Materia no reconocida: "${nota.materia}"`);
                }
            });
        } else {
            console.warn('⚠️ No hay notas disponibles');
        }
        
        // Configurar modal
        const modalTitle = document.querySelector('#modalTitle span');
        if (modalTitle) {
            modalTitle.textContent = 'Editar Estudiante';
        }
        
        const documentoField = document.getElementById('documento');
        if (documentoField) {
            documentoField.disabled = true;
        }
        
        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('estudianteModal'));
        modal.show();
        
        console.log('✅ Modal abierto para edición');
        
    } catch (error) {
        console.error('❌ Error al editar estudiante:', error);
        alert('Error al cargar los datos del estudiante');
    }
};

// Función para nuevo estudiante
window.nuevoEstudiante = function() {
    console.log('🆕 Creando nuevo estudiante');
    
    // Limpiar formulario
    const form = document.getElementById('formEstudiante');
    if (form) {
        form.reset();
    }
    
    // Configurar modal
    const modalTitle = document.querySelector('#modalTitle span');
    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Estudiante';
    }
    
    const documentoField = document.getElementById('documento');
    if (documentoField) {
        documentoField.disabled = false;
    }
    
    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('estudianteModal'));
    modal.show();
};

// Función para guardar estudiante
window.guardarEstudiante = async function() {
    console.log('💾 Guardando estudiante...');
    
    try {
        // Obtener datos del formulario
        const formData = {
            documento: document.getElementById('documento').value,
            tipoDocumento: document.getElementById('tipoDocumento').value,
            primerNombre: document.getElementById('primerNombre').value,
            segundoNombre: document.getElementById('segundoNombre').value,
            primerApellido: document.getElementById('primerApellido').value,
            segundoApellido: document.getElementById('segundoApellido').value,
            correoElectronico: document.getElementById('correoElectronico').value,
            numeroTelefono: document.getElementById('numeroTelefono').value,
            programaAcademico: document.getElementById('programaAcademico').value,
            puntajeGlobal: parseInt(document.getElementById('puntajeGlobal').value) || 0,
            
            // Crear array de notas con los puntajes de competencias
            notas: [
                { materia: 'Comunicación Escrita', puntaje: parseInt(document.getElementById('comunicacionEscrita').value) || 0 },
                { materia: 'Razonamiento Cuantitativo', puntaje: parseInt(document.getElementById('razonamientoCuantitativo').value) || 0 },
                { materia: 'Lectura Crítica', puntaje: parseInt(document.getElementById('lecturaCritica').value) || 0 },
                { materia: 'Competencias Ciudadanas', puntaje: parseInt(document.getElementById('competenciasCiudadanas').value) || 0 },
                { materia: 'Inglés', puntaje: parseInt(document.getElementById('ingles').value) || 0 },
                { materia: 'Formulación de Proyectos de Ingeniería', puntaje: parseInt(document.getElementById('formulacionProyectos').value) || 0 },
                { materia: 'Diseño de Software', puntaje: parseInt(document.getElementById('disenoSoftware').value) || 0 },
                { materia: 'Pensamiento Científico Matemáticas y Estadística', puntaje: parseInt(document.getElementById('pensamientoCientifico').value) || 0 }
            ]
        };
        
        console.log('📤 Datos a enviar:', formData);
        
        // Determinar si es crear o actualizar
        const isEdit = document.getElementById('documento').disabled;
        const url = isEdit 
            ? `/api/resultados/${formData.documento}`
            : '/api/resultados';
        const method = isEdit ? 'PUT' : 'POST';
        
        // 🎯 Detectar cambio en puntaje global para reevaluación automática
        const puntajeNuevo = formData.puntajeGlobal;
        const puntajeOriginal = window.puntajeGlobalOriginal;
        const puntajeCambio = isEdit && puntajeOriginal !== null && puntajeOriginal !== puntajeNuevo;
        
        if (puntajeCambio) {
            console.log(`🎯 CAMBIO DE PUNTAJE DETECTADO: ${puntajeOriginal} → ${puntajeNuevo} (Δ${puntajeNuevo - puntajeOriginal})`);
        }
        
        // Enviar datos
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            console.log('✅ Estudiante guardado exitosamente');
            
            // 🚀 REEVALUACIÓN AUTOMÁTICA: Si cambió el puntaje global, reevaluar incentivos
            if (puntajeCambio) {
                console.log('🚀 Iniciando reevaluación automática de incentivos...');
                await reevaluarEstudianteEspecifico(formData.documento);
                console.log('✅ Reevaluación automática completada');
            }
            
            alert('Estudiante guardado exitosamente');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('estudianteModal'));
            modal.hide();
            
            // 🔄 Recargar tabla de estudiantes automáticamente
            console.log('🔄 Recargando tabla de estudiantes...');
            await cargarEstudiantes();
            console.log('✅ Tabla recargada exitosamente');
            
            // 🧹 Limpiar variable de puntaje original
            window.puntajeGlobalOriginal = null;
            
        } else {
            throw new Error('Error del servidor');
        }
        
    } catch (error) {
        console.error('❌ Error al guardar estudiante:', error);
        alert('Error al guardar el estudiante');
    }
};

// Función para eliminar estudiante
window.eliminarEstudiante = async function(documento) {
    if (!confirm('¿Está seguro de que desea eliminar este estudiante?')) {
        return;
    }
    
    console.log('🗑️ Eliminando estudiante:', documento);
    
    try {
        const response = await fetch(`/api/resultados/${documento}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('✅ Estudiante eliminado del servidor');
            alert('Estudiante eliminado exitosamente');
            
            // Recargar la tabla directamente
            await cargarEstudiantes();
            console.log('🔄 Tabla actualizada después de eliminar');
            
        } else {
            throw new Error('Error del servidor');
        }
    } catch (error) {
        console.error('❌ Error al eliminar estudiante:', error);
        alert('Error al eliminar el estudiante');
    }
};

// Función para ver detalles de estudiante
window.verEstudiante = async function(documento) {
    console.log('👁️ Viendo estudiante:', documento);
    
    try {
        // Cargar datos del estudiante e incentivos en paralelo
        const [estudianteResponse, incentivosResponse] = await Promise.all([
            fetch(`/api/resultados/${documento}`),
            fetch(`/api/incentivos/asignaciones`)
        ]);
        
        const estudiante = await estudianteResponse.json();
        const todosLosIncentivos = await incentivosResponse.json();
        
        // Filtrar incentivos del estudiante específico
        const incentivosEstudiante = todosLosIncentivos.filter(incentivo => 
            incentivo.documentoEstudiante === documento
        );
        
        console.log('📊 Datos del estudiante:', estudiante);
        console.log('🎁 Incentivos del estudiante:', incentivosEstudiante);
        
        // ========== INFORMACIÓN PERSONAL ==========
        document.getElementById('detalleDocumento').textContent = estudiante.documento || '-';
        document.getElementById('detalleTipoDocumento').textContent = estudiante.tipoDocumento || '-';
        document.getElementById('detalleNombre').textContent = 
            `${estudiante.primerNombre || ''} ${estudiante.segundoNombre || ''} ${estudiante.primerApellido || ''} ${estudiante.segundoApellido || ''}`.trim();
        document.getElementById('detalleCorreo').textContent = estudiante.correoElectronico || '-';
        document.getElementById('detalleTelefono').textContent = estudiante.numeroTelefono || '-';
        document.getElementById('detallePrograma').textContent = estudiante.programaAcademico || '-';
        
        // ========== RESULTADOS GLOBALES ==========
        const puntajeGlobal = estudiante.puntajeGlobal || 0;
        document.getElementById('detallePuntaje').textContent = puntajeGlobal;
        
        // Barra de progreso del puntaje
        const porcentajePuntaje = Math.min((puntajeGlobal / 300) * 100, 100);
        const barraPuntaje = document.querySelector('#detallePuntajeBarra .progress-bar');
        if (barraPuntaje) {
            barraPuntaje.style.width = `${porcentajePuntaje}%`;
        }
        
        // Estado de graduación
        const puedeGraduar = puntajeGlobal >= 80;
        const estadoHtml = puedeGraduar 
            ? '<span class="badge bg-success">Puede Graduarse</span>'
            : '<span class="badge bg-danger">No Puede Graduarse</span>';
        document.getElementById('detalleEstado').innerHTML = estadoHtml;
        
        // Nivel global
        let nivelGlobal = 'Sin clasificar';
        let colorNivel = 'bg-secondary';
        if (puntajeGlobal >= 200) {
            nivelGlobal = 'Excelente';
            colorNivel = 'bg-success';
        } else if (puntajeGlobal >= 150) {
            nivelGlobal = 'Muy Bueno';
            colorNivel = 'bg-primary';
        } else if (puntajeGlobal >= 100) {
            nivelGlobal = 'Bueno';
            colorNivel = 'bg-info';
        } else if (puntajeGlobal >= 50) {
            nivelGlobal = 'Regular';
            colorNivel = 'bg-warning';
        } else {
            nivelGlobal = 'Deficiente';
            colorNivel = 'bg-danger';
        }
        document.getElementById('detalleNivel').innerHTML = `<span class="badge ${colorNivel}">${nivelGlobal}</span>`;
        
        // Estado de incentivos (basado en incentivos reales)
        const tieneIncentivos = incentivosEstudiante.length > 0;
        const incentivosHtml = tieneIncentivos 
            ? `<span class="badge bg-success">Con Incentivos (${incentivosEstudiante.length})</span>`
            : '<span class="badge bg-secondary">Sin Incentivos</span>';
        document.getElementById('detalleIncentivos').innerHTML = incentivosHtml;
        
        // ========== COMPETENCIAS ==========
        // 🔍 Debug: Mostrar todas las materias disponibles
        console.log('📋 Materias disponibles en la BD:');
        if (estudiante.notas && Array.isArray(estudiante.notas)) {
            estudiante.notas.forEach((nota, index) => {
                console.log(`  ${index + 1}. "${nota.materia}" = ${nota.puntaje} puntos`);
            });
        }
        
        // Competencias genéricas
        const competenciasGenericas = [
            { nombre: 'Comunicación Escrita', valor: obtenerPuntajeCompetencia(estudiante, 'Comunicación Escrita') },
            { nombre: 'Razonamiento Cuantitativo', valor: obtenerPuntajeCompetencia(estudiante, 'Razonamiento Cuantitativo') },
            { nombre: 'Lectura Crítica', valor: obtenerPuntajeCompetencia(estudiante, 'Lectura Crítica') },
            { nombre: 'Competencias Ciudadanas', valor: obtenerPuntajeCompetencia(estudiante, 'Competencias Ciudadanas') },
            { nombre: 'Inglés', valor: obtenerPuntajeCompetencia(estudiante, 'Inglés') }
        ];
        
        // Competencias específicas
        const competenciasEspecificas = [
            { nombre: 'Formulación de Proyectos', valor: obtenerPuntajeCompetencia(estudiante, 'Formulación de Proyectos de Ingeniería') },
            { nombre: 'Diseño de Software', valor: obtenerPuntajeCompetencia(estudiante, 'Diseño de Software') }
        ];
        
        // Llenar competencias genéricas
        const containerGenericas = document.getElementById('detalleCompetenciasGenericas');
        containerGenericas.innerHTML = '';
        competenciasGenericas.forEach(comp => {
            const nivel = obtenerNivelCompetencia(comp.valor);
            containerGenericas.innerHTML += `
                <div class="competencia-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="competencia-nombre">${comp.nombre}</span>
                        <div class="text-end">
                            <span class="competencia-puntaje text-primary fw-bold">${comp.valor}</span>
                            <div class="competencia-nivel badge ${nivel.color} ms-2">${nivel.texto}</div>
                        </div>
                    </div>
                    <div class="progress competencia-progreso mt-2" style="height: 6px;">
                        <div class="progress-bar ${nivel.color.replace('bg-', 'bg-')}" 
                             style="width: ${Math.min((comp.valor / 60) * 100, 100)}%"></div>
                    </div>
                </div>
            `;
        });
        
        // Llenar competencias específicas
        const containerEspecificas = document.getElementById('detalleCompetenciasEspecificas');
        containerEspecificas.innerHTML = '';
        competenciasEspecificas.forEach(comp => {
            const nivel = obtenerNivelCompetencia(comp.valor);
            containerEspecificas.innerHTML += `
                <div class="competencia-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="competencia-nombre">${comp.nombre}</span>
                        <div class="text-end">
                            <span class="competencia-puntaje text-warning fw-bold">${comp.valor}</span>
                            <div class="competencia-nivel badge ${nivel.color} ms-2">${nivel.texto}</div>
                        </div>
                    </div>
                    <div class="progress competencia-progreso mt-2" style="height: 6px;">
                        <div class="progress-bar ${nivel.color.replace('bg-', 'bg-')}" 
                             style="width: ${Math.min((comp.valor / 60) * 100, 100)}%"></div>
                    </div>
                </div>
            `;
        });
        
        // ========== GRÁFICO DE RADAR ==========
        // Mostrar modal primero
        const modal = new bootstrap.Modal(document.getElementById('estudianteDetalleModal'));
        
        // Configurar el evento para crear el gráfico cuando el modal esté completamente visible
        const modalElement = document.getElementById('estudianteDetalleModal');
        modalElement.addEventListener('shown.bs.modal', function crearGraficoAlMostrar() {
            console.log('📊 Modal completamente visible, creando gráfico...');
            
            // Remover el listener para evitar múltiples ejecuciones
            modalElement.removeEventListener('shown.bs.modal', crearGraficoAlMostrar);
            
            // Esperar un poco más para asegurar el renderizado completo
            setTimeout(() => {
                crearGraficoMultiplesIntentos([...competenciasGenericas, ...competenciasEspecificas], 0);
            }, 200);
        });
        
        // Mostrar el modal
        modal.show();
        
    } catch (error) {
        console.error('❌ Error al ver estudiante:', error);
        alert('Error al cargar los detalles del estudiante');
    }
};

// Función para intentar crear el gráfico múltiples veces
function crearGraficoMultiplesIntentos(competencias, intento) {
    console.log(`🔄 Intento ${intento + 1} de crear gráfico`);
    
    const maxIntentos = 5;
    if (intento >= maxIntentos) {
        console.error('❌ Se agotaron los intentos para crear el gráfico');
        mostrarErrorGrafico();
        return;
    }
    
    // Verificar que el modal esté visible antes de intentar crear el gráfico
    const modal = document.getElementById('estudianteDetalleModal');
    const isModalVisible = modal && modal.offsetWidth > 0 && modal.offsetHeight > 0;
    
    console.log(`🔍 Verificación de modal - intento ${intento + 1}:`);
    console.log(`  - Modal existe: ${!!modal}`);
    console.log(`  - Modal visible (offsetWidth): ${modal ? modal.offsetWidth : 'N/A'}`);
    console.log(`  - Modal visible (offsetHeight): ${modal ? modal.offsetHeight : 'N/A'}`);
    console.log(`  - isModalVisible: ${isModalVisible}`);
    
    if (!isModalVisible) {
        console.log(`⏳ Modal no visible aún, reintentando en 500ms...`);
        setTimeout(() => {
            crearGraficoMultiplesIntentos(competencias, intento + 1);
        }, 500);
        return;
    }
    
    // Intentar crear el gráfico
    const exito = crearGraficoCompetencias(competencias);
    
    if (!exito) {
        // Si falló, intentar de nuevo con un delay incrementalmente mayor
        const delay = 500 + (intento * 500); // 500ms, 1000ms, 1500ms, etc.
        console.log(`⏳ Reintentando en ${delay}ms...`);
        setTimeout(() => {
            crearGraficoMultiplesIntentos(competencias, intento + 1);
        }, delay);
    }
}

// Función para mostrar error cuando no se puede crear el gráfico
function mostrarErrorGrafico() {
    console.error('❌ Se agotaron los intentos para crear el gráfico');
    mostrarMensajeGrafico('El gráfico no pudo cargarse. El modal necesita estar completamente visible.', 'warning');
}

// Función auxiliar para obtener puntaje de competencia
function obtenerPuntajeCompetencia(estudiante, nombreCompetencia) {
    if (estudiante.notas && Array.isArray(estudiante.notas)) {
        // Primero buscar coincidencia exacta
        let nota = estudiante.notas.find(n => 
            n.materia && n.materia === nombreCompetencia
        );
        
        // Si no encuentra coincidencia exacta, buscar con includes (más flexible)
        if (!nota) {
            nota = estudiante.notas.find(n => 
                n.materia && n.materia.toLowerCase().includes(nombreCompetencia.toLowerCase())
            );
        }
        
        console.log(`🔍 Buscando competencia "${nombreCompetencia}":`, nota ? `Encontrada con puntaje ${nota.puntaje}` : 'No encontrada');
        return nota ? nota.puntaje : 0;
    }
    return 0;
}

// Función auxiliar para determinar nivel de competencia
function obtenerNivelCompetencia(puntaje) {
    if (puntaje >= 50) {
        return { texto: 'Excelente', color: 'bg-success' };
    } else if (puntaje >= 40) {
        return { texto: 'Muy Bueno', color: 'bg-primary' };
    } else if (puntaje >= 30) {
        return { texto: 'Bueno', color: 'bg-info' };
    } else if (puntaje >= 20) {
        return { texto: 'Regular', color: 'bg-warning' };
    } else {
        return { texto: 'Deficiente', color: 'bg-danger' };
    }
}

// Función para crear gráfico de barras de competencias - NUEVA VERSIÓN SIMPLE
function crearGraficoCompetencias(competencias) {
    console.log('📊 Creando gráfico de BARRAS de competencias:', competencias);
    
    // Verificar que Chart.js esté disponible
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js no está disponible');
        mostrarMensajeGrafico('Chart.js no se cargó correctamente', 'warning');
        return false;
    }
    
    const canvas = document.getElementById('estudianteCompetenciasChart');
    if (!canvas) {
        console.error('❌ Canvas estudianteCompetenciasChart no encontrado');
        return false;
    }
    
    console.log('🔍 Estado inicial:');
    console.log('  - Canvas existe:', !!canvas);
    console.log('  - Canvas offsetWidth:', canvas.offsetWidth);
    console.log('  - Canvas offsetHeight:', canvas.offsetHeight);
    
    // Destruir gráfico existente si existe
    if (window.estudianteCompetenciasChartInstance) {
        console.log('🗑️ Destruyendo gráfico existente');
        window.estudianteCompetenciasChartInstance.destroy();
        window.estudianteCompetenciasChartInstance = null;
    }
    
    try {
        // Preparar datos para gráfico de barras horizontales
        const labels = competencias.map(c => c.nombre);
        const data = competencias.map(c => c.valor);
        
        console.log('📈 Datos preparados para gráfico de barras:', { labels, data });
        
        // Configuración del gráfico de barras horizontales (más compatible con modales)
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Puntaje',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(199, 199, 199, 0.8)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Barras horizontales
                plugins: {
                    title: {
                        display: true,
                        text: 'Puntajes por Competencia',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: 20
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Puntaje (0-100)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            maxRotation: 0,
                            minRotation: 0
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                }
            }
        };
        
        console.log('🎨 Creando gráfico de barras...');
        
        // Crear el gráfico
        window.estudianteCompetenciasChartInstance = new Chart(canvas, config);
        
        console.log('✅ ¡Gráfico de BARRAS creado exitosamente!');
        return true;
        
    } catch (error) {
        console.error('❌ Error al crear gráfico de barras:', error);
        mostrarMensajeGrafico('Error al crear el gráfico: ' + error.message, 'danger');
        return false;
    }
}

// Función para mostrar mensajes en lugar del gráfico
function mostrarMensajeGrafico(mensaje, tipo = 'warning') {
    const canvas = document.getElementById('estudianteCompetenciasChart');
    if (canvas && canvas.parentElement) {
        const tipoClass = tipo === 'danger' ? 'alert-danger' : 'alert-warning';
        const icono = tipo === 'danger' ? 'fas fa-exclamation-triangle' : 'fas fa-chart-line';
        
        canvas.parentElement.innerHTML = `
            <div class="alert ${tipoClass} text-center">
                <i class="${icono} me-2"></i>
                ${mensaje}
            </div>
        `;
    }
}

// Función para buscar estudiantes por nombre, documento o programa
window.buscarEstudiante = function() {
    console.log('🔍 Ejecutando búsqueda de estudiantes...');
    const termino = document.getElementById('searchInput').value.toLowerCase().trim();
    console.log('🔍 Término de búsqueda:', termino);
    
    const filas = document.querySelectorAll('#estudiantesTable tbody tr');
    console.log('📋 Filas encontradas:', filas.length);
    
    if (filas.length === 0) {
        console.log('⚠️ No hay filas en la tabla para buscar');
        return;
    }
    
    let filasVisibles = 0;
    
    filas.forEach((fila, index) => {
        if (termino === '') {
            // Si no hay término de búsqueda, mostrar todas las filas
            fila.style.display = '';
            filasVisibles++;
            return;
        }
        
        // Obtener celdas específicas de la fila
        const celdas = fila.querySelectorAll('td');
        if (celdas.length < 4) {
            fila.style.display = 'none';
            return;
        }
        
        // Extraer información específica de cada celda
        const documento = celdas[0] ? celdas[0].textContent.toLowerCase().trim() : '';
        const nombre = celdas[1] ? celdas[1].textContent.toLowerCase().trim() : '';
        const programa = celdas[2] ? celdas[2].textContent.toLowerCase().trim() : '';
        const puntaje = celdas[3] ? celdas[3].textContent.toLowerCase().trim() : '';
        
        // Buscar en campos específicos
        const encontrado = documento.includes(termino) || 
                          nombre.includes(termino) || 
                          programa.includes(termino) ||
                          puntaje.includes(termino);
        
        fila.style.display = encontrado ? '' : 'none';
        
        if (encontrado) {
            filasVisibles++;
        }
        
        // Log detallado para debug (solo primeras 3 filas)
        if (index < 3 && termino !== '') {
            console.log(`  Fila ${index + 1}:`);
            console.log(`    Documento: "${documento}"`);
            console.log(`    Nombre: "${nombre}"`);
            console.log(`    Programa: "${programa}"`);
            console.log(`    Encontrado: ${encontrado}`);
        }
    });
    
    console.log(`✅ Búsqueda completada. ${filasVisibles} filas visibles de ${filas.length} totales`);
    
    // Mostrar mensaje si no se encontraron resultados
    const tableBody = document.querySelector('#estudiantesTable tbody');
    if (filasVisibles === 0 && termino !== '' && tableBody) {
        // Verificar si ya existe una fila de "no resultados"
        let noResultsRow = tableBody.querySelector('.no-results-row');
        if (!noResultsRow) {
            noResultsRow = document.createElement('tr');
            noResultsRow.className = 'no-results-row';
            noResultsRow.innerHTML = `
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-search me-2"></i>
                    No se encontraron estudiantes que coincidan con "${document.getElementById('searchInput').value}"
                </td>
            `;
            tableBody.appendChild(noResultsRow);
        }
    } else {
        // Remover fila de "no resultados" si existe
        const noResultsRow = tableBody?.querySelector('.no-results-row');
        if (noResultsRow) {
            noResultsRow.remove();
        }
    }
};

// Función para limpiar la búsqueda
window.limpiarBusqueda = function() {
    console.log('🧹 Limpiando búsqueda...');
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    
    // Mostrar todas las filas
    const filas = document.querySelectorAll('#estudiantesTable tbody tr:not(.no-results-row)');
    filas.forEach(fila => {
        fila.style.display = '';
    });
    
    // Remover fila de "no resultados" si existe
    const tableBody = document.querySelector('#estudiantesTable tbody');
    const noResultsRow = tableBody?.querySelector('.no-results-row');
    if (noResultsRow) {
        noResultsRow.remove();
    }
    
    console.log('✅ Búsqueda limpiada');
};

// ============================================================
// CARGAR ESTUDIANTES
// ============================================================

async function cargarEstudiantes() {
    console.log('📚 Cargando estudiantes...');
    
    try {
        // Cargar estudiantes y sus incentivos en paralelo
        const [estudiantesResponse, incentivosResponse] = await Promise.all([
            fetch('/api/resultados'),
            fetch('/api/incentivos/asignaciones')
        ]);
        
        const estudiantes = await estudiantesResponse.json();
        const incentivos = await incentivosResponse.json();
        
        console.log(`📊 ${estudiantes.length} estudiantes encontrados`);
        console.log(`🎁 ${incentivos.length} incentivos encontrados`);
        
        // Crear mapa de incentivos por documento de estudiante
        const incentivosPorEstudiante = {};
        incentivos.forEach(incentivo => {
            if (!incentivosPorEstudiante[incentivo.documentoEstudiante]) {
                incentivosPorEstudiante[incentivo.documentoEstudiante] = [];
            }
            incentivosPorEstudiante[incentivo.documentoEstudiante].push(incentivo);
        });
        
        const tbody = document.querySelector('#estudiantesTable tbody');
        if (!tbody) {
            console.error('❌ Tabla de estudiantes no encontrada');
            return;
        }
        
        tbody.innerHTML = '';
        
        estudiantes.forEach(est => {
            const puntaje = est.puntajeGlobal || 0;
            const puedeGraduar = puntaje >= 80;
            const estadoBadge = puedeGraduar 
                ? '<span class="badge bg-success">Puede Graduarse</span>'
                : '<span class="badge bg-danger">No Puede Graduarse</span>';
            
            const nombreCompleto = `${est.primerNombre || ''} ${est.segundoNombre || ''} ${est.primerApellido || ''} ${est.segundoApellido || ''}`.trim();
            
            // Verificar si el estudiante tiene incentivos reales
            const incentivosEstudiante = incentivosPorEstudiante[est.documento] || [];
            const tieneIncentivos = incentivosEstudiante.length > 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${est.documento}</strong></td>
                <td>${nombreCompleto}</td>
                <td><small>${est.programaAcademico || 'No especificado'}</small></td>
                <td>
                    <span class="badge ${puntaje >= 180 ? 'bg-success' : puntaje >= 80 ? 'bg-warning' : 'bg-danger'} fs-6">${puntaje}</span>
                </td>
                <td>${estadoBadge}</td>
                <td>
                    ${tieneIncentivos ? 
                        `<small class="text-success">Con incentivos (${incentivosEstudiante.length})</small>` : 
                        '<small class="text-muted">Sin incentivos</small>'
                    }
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="verEstudiante('${est.documento}')" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="editarEstudiante('${est.documento}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarEstudiante('${est.documento}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('✅ Estudiantes cargados en la tabla con incentivos reales');
        
    } catch (error) {
        console.error('❌ Error al cargar estudiantes:', error);
        
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

// Función para nuevo estudiante
window.nuevoEstudiante = function() {
    console.log('➕ Creando nuevo estudiante');
    
    // 🧹 Limpiar variable de puntaje original (nuevo estudiante = sin puntaje previo)
    window.puntajeGlobalOriginal = null;
    
    // Limpiar formulario
    const form = document.getElementById('formEstudiante');
    if (form) {
        form.reset();
    }
    
    // Configurar para nuevo estudiante
    const titleSpan = document.querySelector('#modalTitle span');
    if (titleSpan) {
        titleSpan.textContent = 'Nuevo Estudiante';
    }
    
    const docField = document.getElementById('documento');
    if (docField) {
        docField.disabled = false;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('estudianteModal'));
    modal.show();
};

// ============================================================
// INICIALIZACIÓN
// ============================================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Inicializando aplicación...');
    
    // Inicializar navegación
    initNavigation();
    
    // Configurar botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Está seguro de que desea cerrar sesión?')) {
                window.location.href = 'index.html';
            }
        });
    }
    
    // 🔍 Configurar búsqueda en tiempo real
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        console.log('🔍 Configurando búsqueda en tiempo real...');
        
        // Búsqueda mientras se escribe (con un pequeño delay para optimización)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                buscarEstudiante();
            }, 300); // Espera 300ms después de dejar de escribir
        });
        
        // Búsqueda al presionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarEstudiante();
            }
        });
        
        console.log('✅ Búsqueda en tiempo real configurada');
    }
    
    // 📊 Cargar dashboard inicial (ya que es la sección por defecto)
    console.log('📊 Cargando dashboard inicial...');
    setTimeout(() => {
        cargarDashboard();
    }, 100); // Pequeño delay para asegurar que el DOM esté completamente listo
    
    console.log('✅ Aplicación inicializada correctamente');
});

// ============================================================
// FUNCIONES AUXILIARES PARA MODAL DE DETALLES
// ============================================================

// Función para imprimir detalles del estudiante
window.imprimirDetalles = function() {
    console.log('🖨️ Imprimiendo detalles del estudiante');
    
    // Crear una nueva ventana con solo el contenido del modal
    const modalContent = document.querySelector('#estudianteDetalleModal .modal-body').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Detalles del Estudiante - SABER PRO</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .competencia-item { margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 5px; }
                .badge { padding: 4px 8px; }
                @media print {
                    .btn { display: none; }
                    canvas { max-width: 100%; height: auto; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 class="text-center mb-4">
                    <i class="fas fa-user me-2"></i>
                    Detalles Completos del Estudiante - SABER PRO UTS
                </h2>
                ${modalContent}
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Esperar a que se cargue y luego imprimir
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 1000);
};

// Función para exportar a PDF (simulada)
window.exportarPDF = function() {
    console.log('📄 Exportando a PDF...');
    alert('Función de exportar PDF en desarrollo. Use la opción de imprimir por ahora.');
};

// Función para importar datos
window.importarDatos = function() {
    console.log('📥 Abriendo modal de importación');
    const modal = new bootstrap.Modal(document.getElementById('importarModal'));
    modal.show();
};

// Función para procesar importación de Excel
window.procesarImportacion = async function() {
    const fileInput = document.getElementById('archivoImportar');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor seleccione un archivo');
        return;
    }
    
    console.log('📊 Procesando archivo:', file.name);
    
    try {
        // Mostrar progreso
        const progressContainer = document.getElementById('importProgress');
        if (progressContainer) {
            progressContainer.classList.remove('d-none');
        }
        
        const btnImportar = document.getElementById('btnImportar');
        if (btnImportar) {
            btnImportar.disabled = true;
            btnImportar.textContent = 'Procesando...';
        }
        
        // Crear FormData para envío
        const formData = new FormData();
        formData.append('archivo', file);
        
        // Enviar archivo al backend
        const response = await fetch('/api/resultados/importar', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const result = await response.json();
        
        alert(`Importación exitosa: ${result.importados || 0} estudiantes procesados`);
        
        // Recargar tabla
        await cargarEstudiantes();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('importarModal'));
        modal.hide();
        
        // Reset formulario
        fileInput.value = '';
        
    } catch (error) {
        console.error('❌ Error al importar archivo:', error);
        alert('Error al procesar el archivo de importación');
    } finally {
        // Reset botón
        const btnImportar = document.getElementById('btnImportar');
        if (btnImportar) {
            btnImportar.disabled = false;
            btnImportar.textContent = 'Importar';
        }
        
        const progressContainer = document.getElementById('importProgress');
        if (progressContainer) {
            progressContainer.classList.add('d-none');
        }
    }
};

// ============================================================
// FUNCIONES DEL DASHBOARD
// ============================================================

// Función para cargar todas las estadísticas del dashboard
async function cargarDashboard() {
    console.log('📊 Cargando dashboard...');
    
    try {
        // Cargar estudiantes y sus incentivos en paralelo
        const [estudiantesResponse, incentivosResponse] = await Promise.all([
            fetch('/api/resultados'),
            fetch('/api/incentivos/asignaciones')
        ]);
        
        if (!estudiantesResponse.ok) {
            throw new Error('Error al cargar datos de estudiantes');
        }
        
        const estudiantes = await estudiantesResponse.json();
        const incentivos = await incentivosResponse.json();
        console.log('📚 Estudiantes cargados para dashboard:', estudiantes.length);
        console.log('🎁 Incentivos cargados para dashboard:', incentivos.length);
        
        // Crear mapa de incentivos por documento de estudiante
        const incentivosPorEstudiante = {};
        incentivos.forEach(incentivo => {
            if (!incentivosPorEstudiante[incentivo.documentoEstudiante]) {
                incentivosPorEstudiante[incentivo.documentoEstudiante] = [];
            }
            incentivosPorEstudiante[incentivo.documentoEstudiante].push(incentivo);
        });
        
        // Agregar información de incentivos a cada estudiante
        const estudiantesConIncentivos = estudiantes.map(est => ({
            ...est,
            tieneIncentivos: (incentivosPorEstudiante[est.documento] || []).length > 0
        }));
        
        // Calcular y mostrar estadísticas con datos completos
        calcularEstadisticas(estudiantesConIncentivos);
        
        // Crear gráficos del dashboard
        crearGraficoDistribucionPuntajes(estudiantesConIncentivos);
        crearGraficoPromedioCompetencias(estudiantesConIncentivos);
        
        console.log('✅ Dashboard cargado exitosamente');
        
    } catch (error) {
        console.error('❌ Error al cargar dashboard:', error);
        // Mostrar valores por defecto en caso de error
        mostrarEstadisticasPorDefecto();
    }
}

// Función para calcular estadísticas generales
function calcularEstadisticas(estudiantes) {
    console.log('📊 Calculando estadísticas...');
    
    const total = estudiantes.length;
    const puedenGraduar = estudiantes.filter(est => (est.puntajeGlobal || 0) >= 80).length;
    const noPuedenGraduar = total - puedenGraduar;
    const conIncentivos = estudiantes.filter(est => est.tieneIncentivos).length;
    
    // Actualizar elementos del DOM
    document.getElementById('totalEstudiantes').textContent = total;
    document.getElementById('puedenGraduar').textContent = puedenGraduar;
    document.getElementById('noPuedenGraduar').textContent = noPuedenGraduar;
    document.getElementById('conIncentivos').textContent = conIncentivos;
    
    console.log(`📈 Estadísticas: Total=${total}, PuedenGraduar=${puedenGraduar}, NoPueden=${noPuedenGraduar}, ConIncentivos=${conIncentivos}`);
}

// Función para crear gráfico de distribución de puntajes
function crearGraficoDistribucionPuntajes(estudiantes) {
    console.log('📊 Creando gráfico de distribución de puntajes...');
    
    const canvas = document.getElementById('puntajesChart');
    if (!canvas) {
        console.error('❌ Canvas puntajesChart no encontrado');
        return;
    }
    
    // Destruir gráfico existente si existe
    if (window.puntajesChartInstance) {
        window.puntajesChartInstance.destroy();
    }
    
    // Categorizar estudiantes por puntaje
    const rangos = {
        'Excelente (200+)': estudiantes.filter(e => (e.puntajeGlobal || 0) >= 200).length,
        'Muy Bueno (150-199)': estudiantes.filter(e => (e.puntajeGlobal || 0) >= 150 && (e.puntajeGlobal || 0) < 200).length,
        'Bueno (100-149)': estudiantes.filter(e => (e.puntajeGlobal || 0) >= 100 && (e.puntajeGlobal || 0) < 150).length,
        'Regular (50-99)': estudiantes.filter(e => (e.puntajeGlobal || 0) >= 50 && (e.puntajeGlobal || 0) < 100).length,
        'Deficiente (0-49)': estudiantes.filter(e => (e.puntajeGlobal || 0) < 50).length
    };
    
    const config = {
        type: 'doughnut',
        data: {
            labels: Object.keys(rangos),
            datasets: [{
                data: Object.values(rangos),
                backgroundColor: [
                    '#4CAF50',  // Verde para Excelente
                    '#2196F3',  // Azul para Muy Bueno
                    '#FF9800',  // Naranja para Bueno
                    '#FFC107',  // Amarillo para Regular
                    '#F44336'   // Rojo para Deficiente
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} estudiantes (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    
    window.puntajesChartInstance = new Chart(canvas, config);
    console.log('✅ Gráfico de distribución de puntajes creado');
}

// Función para crear gráfico de promedio por competencias
function crearGraficoPromedioCompetencias(estudiantes) {
    console.log('📊 Creando gráfico de promedio por competencias...');
    
    const canvas = document.getElementById('competenciasChart');
    if (!canvas) {
        console.error('❌ Canvas competenciasChart no encontrado');
        return;
    }
    
    // Destruir gráfico existente si existe
    if (window.competenciasChartInstance) {
        window.competenciasChartInstance.destroy();
    }
    
    // Calcular promedios por competencia
    const competencias = [
        'Comunicación Escrita',
        'Razonamiento Cuantitativo', 
        'Lectura Crítica',
        'Competencias Ciudadanas',
        'Inglés',
        'Formulación de Proyectos de Ingeniería',
        'Diseño de Software'
    ];
    
    const promedios = competencias.map(competencia => {
        const puntajes = estudiantes
            .filter(est => est.notas && Array.isArray(est.notas))
            .map(est => {
                const nota = est.notas.find(n => n.materia === competencia);
                return nota ? nota.puntaje : 0;
            })
            .filter(p => p > 0); // Solo considerar puntajes válidos
        
        const promedio = puntajes.length > 0 
            ? puntajes.reduce((sum, p) => sum + p, 0) / puntajes.length 
            : 0;
        
        console.log(`📊 ${competencia}: ${puntajes.length} estudiantes, promedio: ${promedio.toFixed(1)}`);
        return promedio;
    });
    
    const config = {
        type: 'bar',
        data: {
            labels: competencias.map(c => c.replace(' de ', '\nde ').replace(' Ingeniería', '\nIngeniería')),
            datasets: [{
                label: 'Promedio',
                data: promedios,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Puntaje Promedio'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Promedio: ${context.parsed.y.toFixed(1)} puntos`;
                        }
                    }
                }
            }
        }
    };
    
    window.competenciasChartInstance = new Chart(canvas, config);
    console.log('✅ Gráfico de promedio por competencias creado');
}

// Función para mostrar estadísticas por defecto en caso de error
function mostrarEstadisticasPorDefecto() {
    document.getElementById('totalEstudiantes').textContent = '0';
    document.getElementById('puedenGraduar').textContent = '0';
    document.getElementById('noPuedenGraduar').textContent = '0';
    document.getElementById('conIncentivos').textContent = '0';
}

// ============================================================
// FUNCIONES DE REPORTES
// ============================================================

// Función para cargar la sección de reportes
async function cargarReportes() {
    console.log('📋 Cargando sección de reportes...');
    
    try {
        // Cargar estudiantes para el selector
        await cargarEstudiantesParaReporte();
        
        // Cargar estadísticas para la sección de reportes
        await cargarEstadisticasReportes();
        
        console.log('✅ Sección de reportes cargada');
    } catch (error) {
        console.error('❌ Error al cargar reportes:', error);
    }
}

// Función para cargar estudiantes en el selector
async function cargarEstudiantesParaReporte() {
    try {
        const response = await fetch('/api/resultados');
        if (!response.ok) throw new Error('Error al cargar estudiantes');
        
        const estudiantes = await response.json();
        const select = document.getElementById('estudianteSelect');
        
        if (select) {
            select.innerHTML = '<option value="">Seleccione un estudiante...</option>';
            
            estudiantes.forEach(estudiante => {
                const nombreCompleto = `${estudiante.primerNombre || ''} ${estudiante.segundoNombre || ''} ${estudiante.primerApellido || ''} ${estudiante.segundoApellido || ''}`.trim();
                const option = document.createElement('option');
                option.value = estudiante.documento;
                option.textContent = `${estudiante.documento} - ${nombreCompleto || 'Sin nombre'}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('❌ Error al cargar estudiantes para reporte:', error);
    }
}

// Función para cargar estadísticas en la sección de reportes
async function cargarEstadisticasReportes() {
    try {
        // Cargar estudiantes y sus incentivos en paralelo
        const [estudiantesResponse, incentivosResponse] = await Promise.all([
            fetch('/api/resultados'),
            fetch('/api/incentivos/asignaciones')
        ]);
        
        if (!estudiantesResponse.ok) throw new Error('Error al cargar datos');
        
        const estudiantes = await estudiantesResponse.json();
        const incentivos = await incentivosResponse.json();
        
        // Crear mapa de incentivos por documento de estudiante
        const incentivosPorEstudiante = {};
        incentivos.forEach(incentivo => {
            if (!incentivosPorEstudiante[incentivo.documentoEstudiante]) {
                incentivosPorEstudiante[incentivo.documentoEstudiante] = [];
            }
            incentivosPorEstudiante[incentivo.documentoEstudiante].push(incentivo);
        });
        
        // Agregar información de incentivos a cada estudiante
        const estudiantesConIncentivos = estudiantes.map(est => ({
            ...est,
            tieneIncentivos: (incentivosPorEstudiante[est.documento] || []).length > 0
        }));
        
        const total = estudiantesConIncentivos.length;
        const puedenGraduar = estudiantesConIncentivos.filter(est => (est.puntajeGlobal || 0) >= 80).length;
        const conIncentivos = estudiantesConIncentivos.filter(est => est.tieneIncentivos).length;
        const promedioGeneral = total > 0 
            ? (estudiantesConIncentivos.reduce((sum, est) => sum + (est.puntajeGlobal || 0), 0) / total).toFixed(1)
            : 0;
        
        // Actualizar elementos del DOM
        const elementos = {
            'reporteTotalEstudiantes': total,
            'reportePuedenGraduar': puedenGraduar,
            'reporteConIncentivos': conIncentivos,
            'reportePromedioGeneral': promedioGeneral
        };
        
        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = valor;
        });
        
    } catch (error) {
        console.error('❌ Error al cargar estadísticas de reportes:', error);
    }
}

// Función para generar reporte individual de estudiante
window.generarReporteIndividual = async function() {
    const estudianteSelect = document.getElementById('estudianteSelect');
    const documento = estudianteSelect.value;
    
    if (!documento) {
        alert('Por favor seleccione un estudiante');
        return;
    }
    
    console.log('📄 Generando reporte individual para:', documento);
    
    try {
        // Obtener estudiantes e incentivos en paralelo
        const [estudiantesResponse, incentivosResponse] = await Promise.all([
            fetch('/api/resultados'),
            fetch('/api/incentivos/asignaciones')
        ]);
        
        if (!estudiantesResponse.ok) throw new Error('Error al cargar estudiantes');
        
        const estudiantes = await estudiantesResponse.json();
        const todosLosIncentivos = await incentivosResponse.json();
        
        // Filtrar el estudiante específico por documento
        const estudiante = estudiantes.find(est => est.documento === documento);
        
        if (!estudiante) {
            throw new Error(`No se encontró el estudiante con documento: ${documento}`);
        }
        
        console.log('✅ Estudiante encontrado:', estudiante);
        console.log('📊 Datos del estudiante:');
        console.log('  - Documento:', estudiante.documento);
        console.log('  - Nombre completo original:', estudiante.nombreCompleto);
        console.log('  - Primer nombre:', estudiante.primerNombre);
        console.log('  - Segundo nombre:', estudiante.segundoNombre);
        console.log('  - Primer apellido:', estudiante.primerApellido);
        console.log('  - Segundo apellido:', estudiante.segundoApellido);
        console.log('  - Puntaje global:', estudiante.puntajeGlobal);
        console.log('  - Notas:', estudiante.notas);
        
        // Filtrar incentivos del estudiante específico
        const incentivosEstudiante = todosLosIncentivos.filter(incentivo => 
            incentivo.documentoEstudiante === documento
        );
        console.log('🎯 Incentivos del estudiante:', incentivosEstudiante);
        
        // Procesar datos básicos usando la misma estructura que otros reportes
        const nombreCompleto = estudiante.nombreCompleto || 
            `${estudiante.primerNombre || ''} ${estudiante.segundoNombre || ''} ${estudiante.primerApellido || ''} ${estudiante.segundoApellido || ''}`.trim();
        console.log('📝 Nombre completo procesado:', nombreCompleto);
        
        const puntajeGlobal = estudiante.puntajeGlobal || 0;
        const puedeGraduar = puntajeGlobal >= 80;
        const tieneIncentivos = incentivosEstudiante.length > 0;
        console.log('📊 Datos procesados:');
        console.log('  - Puntaje global:', puntajeGlobal);
        console.log('  - Puede graduar:', puedeGraduar);
        console.log('  - Tiene incentivos:', tieneIncentivos);
        
        // Procesar notas del estudiante
        const notas = estudiante.notas || [];
        console.log('📚 Notas del estudiante:', notas);
        
        const competenciasGenericas = notas.filter(n => 
            ['Comunicación Escrita', 'Razonamiento Cuantitativo', 'Lectura Crítica', 'Competencias Ciudadanas', 'Inglés'].includes(n.materia)
        ).map(comp => ({
            nombre: comp.materia,
            valor: comp.puntaje
        }));
        console.log('🔤 Competencias genéricas:', competenciasGenericas);
        
        const competenciasEspecificas = notas.filter(n => 
            ['Formulación de Proyectos de Ingeniería', 'Diseño de Software'].includes(n.materia)
        ).map(comp => ({
            nombre: comp.materia,
            valor: comp.puntaje
        }));
        console.log('⚙️ Competencias específicas:', competenciasEspecificas);
        
        const promedioGeneral = notas.length > 0 ? 
            (notas.reduce((sum, nota) => sum + nota.puntaje, 0) / notas.length).toFixed(2) : 0;
        
        const competenciaDestacada = notas.length > 0 ? 
            notas.reduce((max, nota) => nota.puntaje > max.puntaje ? nota : max, notas[0]) 
            : {puntaje: 0, materia: 'Ninguna'};
        
        console.log('📊 Estadísticas calculadas:');
        console.log('  - Promedio general:', promedioGeneral);
        console.log('  - Competencia destacada:', competenciaDestacada);
        
        console.log('🛠️ Iniciando generación de HTML...');
        // Generar el HTML usando la función auxiliar
        const htmlContent = generarHTMLReporte(
            estudiante,
            nombreCompleto,
            puntajeGlobal,
            puedeGraduar,
            tieneIncentivos,
            competenciasGenericas,
            competenciasEspecificas,
            competenciaDestacada.materia,
            promedioGeneral
        );
        
        console.log('✅ HTML generado exitosamente. Longitud:', htmlContent.length, 'caracteres');
        
        // Intentar abrir en ventana emergente, si falla mostrar en modal
        console.log('🪟 Intentando abrir nueva ventana para el reporte...');
        const reporteWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        
        if (!reporteWindow || reporteWindow.closed || typeof reporteWindow.closed === 'undefined') {
            console.log('⚠️ Ventana emergente bloqueada, mostrando reporte en modal...');
            mostrarReporteEnModal(htmlContent, estudiante.documento);
        } else {
            console.log('📝 Escribiendo contenido HTML en la ventana...');
            reporteWindow.document.write(htmlContent);
            reporteWindow.document.close();
            console.log('🎉 Ventana del reporte creada exitosamente');
        }
        
        // Actualizar último reporte generado
        document.getElementById('ultimoReporte').textContent = 
            `Reporte individual de ${estudianteSelect.options[estudianteSelect.selectedIndex].text} - ${new Date().toLocaleString('es-CO')}`;
        
        console.log('✅ Reporte individual generado exitosamente');
        
    } catch (error) {
        console.error('❌ Error al generar reporte individual:', error);
        alert('❌ Error al generar reporte individual: ' + error.message);
    }
};

// Función para mostrar el reporte en un modal cuando las ventanas emergentes están bloqueadas
function mostrarReporteEnModal(htmlContent, documento) {
    console.log('🖥️ Creando modal para mostrar el reporte...');
    
    // Crear el modal
    const modalHtml = `
        <div class="modal fade" id="reporteModal" tabindex="-1" aria-labelledby="reporteModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="reporteModalLabel">
                            <i class="fas fa-file-alt me-2"></i>Reporte Individual - Documento: ${documento}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-0" style="overflow-y: auto;">
                        <iframe id="reporteFrame" style="width: 100%; height: 80vh; border: none;"></iframe>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="descargarReporteDesdeModal()">
                            <i class="fas fa-download me-2"></i>Descargar PDF
                        </button>
                        <button type="button" class="btn btn-success" onclick="abrirReporteEnNuevaVentana()">
                            <i class="fas fa-external-link-alt me-2"></i>Abrir en Nueva Ventana
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Eliminar modal anterior si existe
    const existingModal = document.getElementById('reporteModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Insertar el modal en el DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Configurar el iframe con el contenido del reporte
    const iframe = document.getElementById('reporteFrame');
    iframe.onload = function() {
        iframe.contentDocument.open();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();
        console.log('✅ Reporte cargado en el modal exitosamente');
    };
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('reporteModal'));
    modal.show();
    
    // Guardar el contenido HTML para funciones adicionales
    window.currentReportHtml = htmlContent;
    window.currentReportDocument = documento;
}

// Función para descargar el reporte desde el modal
function descargarReporteDesdeModal() {
    if (window.currentReportHtml) {
        // Crear un elemento temporal para generar el PDF
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = window.currentReportHtml;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);
        
        // Usar html2pdf para generar y descargar
        const elemento = tempDiv.querySelector('.reporte-container');
        if (elemento) {
            const opciones = {
                margin: [8, 8, 8, 8],
                filename: `reporte_individual_${window.currentReportDocument}_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 1.8,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                }
            };
            
            // Ocultar botones antes de generar PDF
            const actionsSection = elemento.querySelector('.actions-section');
            if (actionsSection) actionsSection.style.display = 'none';
            
            html2pdf().set(opciones).from(elemento).save().then(() => {
                document.body.removeChild(tempDiv);
                console.log('✅ PDF descargado exitosamente desde el modal');
            }).catch(error => {
                console.error('❌ Error al generar PDF:', error);
                document.body.removeChild(tempDiv);
                alert('Error al generar el PDF. Inténtelo nuevamente.');
            });
        }
    }
}

// Función para intentar abrir en nueva ventana desde el modal
function abrirReporteEnNuevaVentana() {
    if (window.currentReportHtml) {
        const reporteWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        
        if (!reporteWindow || reporteWindow.closed || typeof reporteWindow.closed === 'undefined') {
            alert('Las ventanas emergentes están bloqueadas en tu navegador. Por favor, habilítalas para esta función o usa la opción "Descargar PDF".');
        } else {
            reporteWindow.document.write(window.currentReportHtml);
            reporteWindow.document.close();
            // Cerrar el modal actual
            const modal = bootstrap.Modal.getInstance(document.getElementById('reporteModal'));
            modal.hide();
        }
    }
}

// Función para generar reporte consolidado
window.generarReporteConsolidado = async function() {
    const formato = document.querySelector('input[name="formatoConsolidado"]:checked').value;
    
    console.log(`📊 Generando reporte consolidado en formato: ${formato}`);
    
    try {
        console.log('🔄 Iniciando carga de datos...');
        // Cargar estudiantes e incentivos en paralelo
        const [estudiantesResponse, incentivosResponse] = await Promise.all([
            fetch('/api/resultados'),
            fetch('/api/incentivos/asignaciones')
        ]);
        
        console.log('📊 Respuestas recibidas:', {
            estudiantesOk: estudiantesResponse.ok,
            incentivosOk: incentivosResponse.ok
        });
        
        if (!estudiantesResponse.ok) throw new Error('Error al cargar estudiantes');
        if (!incentivosResponse.ok) throw new Error('Error al cargar incentivos');
        
        console.log('📋 Parseando respuestas JSON...');
        const estudiantes = await estudiantesResponse.json();
        const todosLosIncentivos = await incentivosResponse.json();
        
        console.log('📈 Datos cargados:', {
            totalEstudiantes: estudiantes.length,
            totalIncentivos: todosLosIncentivos.length
        });
        
        // Crear mapa de incentivos por estudiante
        console.log('🗂️ Organizando incentivos por estudiante...');
        const incentivosPorEstudiante = {};
        todosLosIncentivos.forEach(incentivo => {
            if (!incentivosPorEstudiante[incentivo.documentoEstudiante]) {
                incentivosPorEstudiante[incentivo.documentoEstudiante] = [];
            }
            incentivosPorEstudiante[incentivo.documentoEstudiante].push(incentivo);
        });
        
        // Agregar información de incentivos a cada estudiante
        console.log('🔗 Combinando datos de estudiantes e incentivos...');
        const estudiantesConIncentivos = estudiantes.map(est => ({
            ...est,
            incentivos: incentivosPorEstudiante[est.documento] || [],
            tieneIncentivos: (incentivosPorEstudiante[est.documento] || []).length > 0
        }));
        
        console.log('✅ Datos procesados correctamente. Generando reporte...');
        
        if (formato === 'pdf') {
            console.log('📄 Llamando a generarPDFConsolidado...');
            await generarPDFConsolidado(estudiantesConIncentivos);
        } else {
            console.log('📊 Llamando a generarExcelConsolidado...');
            await generarExcelConsolidado(estudiantesConIncentivos);
        }
        
        console.log('🎉 Reporte consolidado generado exitosamente');
        
        // Actualizar último reporte generado
        document.getElementById('ultimoReporte').textContent = 
            `Reporte consolidado (${formato.toUpperCase()}) - ${new Date().toLocaleString('es-CO')}`;
        
    } catch (error) {
        console.error('❌ Error al generar reporte consolidado:', error);
        console.error('📋 Detalles del error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        alert('❌ Error al generar el reporte consolidado: ' + error.message);
    }
};

// Función para generar reporte por criterios
window.generarReportePorCriterio = async function() {
    const criterio = document.getElementById('criterioSelect').value;
    const formato = document.querySelector('input[name="formatoCriterio"]:checked').value;
    
    console.log(`🔍 Generando reporte por criterio: ${criterio} en formato: ${formato}`);
    
    try {
        const response = await fetch('/api/resultados');
        if (!response.ok) throw new Error('Error al cargar estudiantes');
        
        const todosEstudiantes = await response.json();
        const estudiantesFiltrados = filtrarEstudiantesPorCriterio(todosEstudiantes, criterio);
        
        if (estudiantesFiltrados.length === 0) {
            alert(`No se encontraron estudiantes que cumplan el criterio seleccionado.`);
            return;
        }
        
        if (formato === 'pdf') {
            generarPDFPorCriterio(estudiantesFiltrados, criterio);
        } else {
            generarExcelPorCriterio(estudiantesFiltrados, criterio);
        }
        
        // Actualizar último reporte generado
        const criterioTexto = document.getElementById('criterioSelect').options[document.getElementById('criterioSelect').selectedIndex].text;
        document.getElementById('ultimoReporte').textContent = 
            `Reporte por criterio: ${criterioTexto} (${formato.toUpperCase()}) - ${new Date().toLocaleString('es-CO')}`;
        
    } catch (error) {
        console.error('❌ Error al generar reporte por criterio:', error);
        alert('Error al generar el reporte por criterio');
    }
};

// ============================================================
// FUNCIONES AUXILIARES PARA REPORTES
// ============================================================

// Función para filtrar estudiantes por criterio
function filtrarEstudiantesPorCriterio(estudiantes, criterio) {
    switch (criterio) {
        case 'pueden-graduar':
            return estudiantes.filter(est => (est.puntajeGlobal || 0) >= 80);
        case 'no-pueden-graduar':
            return estudiantes.filter(est => (est.puntajeGlobal || 0) < 80);
        case 'con-incentivos':
            return estudiantes.filter(est => est.tieneIncentivos);
        case 'excelente':
            return estudiantes.filter(est => (est.puntajeGlobal || 0) >= 200);
        case 'deficiente':
            return estudiantes.filter(est => (est.puntajeGlobal || 0) < 50);
        default:
            return estudiantes;
    }
}

// Función para generar PDF consolidado
function generarPDFConsolidado(estudiantes) {
    console.log('📄 [PDF] Iniciando generación de PDF consolidado...');
    console.log('📄 [PDF] Total de estudiantes recibidos:', estudiantes.length);
    
    try {
        const total = estudiantes.length;
        const puedenGraduar = estudiantes.filter(est => (est.puntajeGlobal || 0) >= 80).length;
    const conIncentivos = estudiantes.filter(est => est.tieneIncentivos).length;
    const promedioGeneral = total > 0 
        ? (estudiantes.reduce((sum, est) => sum + (est.puntajeGlobal || 0), 0) / total).toFixed(1)
        : 0;
    
    console.log('📄 [PDF] Intentando abrir ventana para reporte...');
    const ventanaReporte = window.open('', '_blank');
    
    // Verificar si la ventana fue bloqueada por el popup blocker
    if (!ventanaReporte || ventanaReporte.closed || typeof ventanaReporte.closed == 'undefined') {
        console.log('🚫 [PDF] Ventana emergente bloqueada, usando modal...');
        // Generar el HTML y mostrarlo en modal
        const htmlContent = generarHTMLReporteConsolidado(estudiantes, conIncentivos, promedioGeneral);
        mostrarReporteConsolidadoEnModal(htmlContent);
        return;
    }
    
    console.log('✅ [PDF] Ventana abierta exitosamente, generando contenido...');
    ventanaReporte.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte Consolidado SABER PRO</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 12px; background: #f8f9fa; }
                .reporte-container {
                    background: white;
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    min-height: 297mm;
                }
                .header-reporte { 
                    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                    color: white;
                    text-align: center; 
                    padding: 25px 20px;
                    margin-bottom: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .university-title {
                    font-size: 1.6rem;
                    font-weight: 700;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .report-title {
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .report-date {
                    opacity: 0.9;
                    font-size: 1rem;
                    margin-top: 10px;
                }
                .table { font-size: 11px; }
                .badge { font-size: 10px; padding: 4px 8px; }
                .actions-section {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                @media print {
                    .actions-section { display: none !important; }
                    body { margin: 0; padding: 0; background: white; }
                    .reporte-container { 
                        box-shadow: none; 
                        margin: 0; 
                        padding: 15px;
                        max-width: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="reporte-container">
                <div class="header-reporte">
                    <h1 class="report-title">
                        <i class="fas fa-chart-bar me-2"></i>
                        REPORTE CONSOLIDADO SABER PRO
                    </h1>
                    <h3 class="university-title">Unidades Tecnológicas de Santander</h3>
                    <p class="report-date">Fecha de generación: ${new Date().toLocaleDateString('es-CO')}</p>
                </div>
                
                <!-- Estadísticas Generales -->
                <div class="row mb-4">
                    <div class="col-12">
                        <h4><i class="fas fa-chart-pie me-2"></i>Estadísticas Generales</h4>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="bg-primary text-white p-3 rounded text-center">
                                    <h3>${total}</h3>
                                    <small>Total Estudiantes</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="bg-success text-white p-3 rounded text-center">
                                    <h3>${puedenGraduar}</h3>
                                    <small>Pueden Graduarse</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="bg-warning text-white p-3 rounded text-center">
                                    <h3>${conIncentivos}</h3>
                                    <small>Con Incentivos</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="bg-info text-white p-3 rounded text-center">
                                    <h3>${promedioGeneral}</h3>
                                    <small>Promedio General</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Listado de Estudiantes -->
                <div class="row">
                    <div class="col-12">
                        <h4><i class="fas fa-list me-2"></i>Listado Completo de Estudiantes</h4>
                        <table class="table table-bordered table-striped">
                            <thead class="table-dark">
                                <tr>
                                    <th>Documento</th>
                                    <th>Nombre Completo</th>
                                    <th>Programa</th>
                                    <th>Puntaje Global</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${estudiantes.map(est => {
                                    const nombreCompleto = `${est.primerNombre || ''} ${est.segundoNombre || ''} ${est.primerApellido || ''} ${est.segundoApellido || ''}`.trim();
                                    const puntaje = est.puntajeGlobal || 0;
                                    const puedeGraduar = puntaje >= 80;
                                    const tieneIncentivos = est.tieneIncentivos;
                                    
                                    let estado = '';
                                    if (tieneIncentivos) {
                                        estado = '<span class="badge bg-warning">Con Incentivos</span>';
                                    } else if (puedeGraduar) {
                                        estado = '<span class="badge bg-success">Puede Graduarse</span>';
                                    } else {
                                        estado = '<span class="badge bg-danger">No Puede Graduarse</span>';
                                    }
                                    
                                    return `
                                        <tr>
                                            <td>${est.documento}</td>
                                            <td>${nombreCompleto || 'Sin nombre'}</td>
                                            <td>${est.programaAcademico || 'Sin programa'}</td>
                                            <td><strong>${puntaje}</strong></td>
                                            <td>${estado}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="actions-section">
                <button class="btn btn-primary btn-lg px-4 py-2 btn-download" onclick="descargarPDF()" style="background: linear-gradient(135deg, #007bff, #0056b3); border: none; border-radius: 25px; box-shadow: 0 4px 15px rgba(0,123,255,0.3); font-weight: 600;">
                    <i class="fas fa-download me-2"></i>Descargar reporte en PDF
                </button>
                <button class="btn btn-secondary btn-lg ms-3 px-4 py-2" onclick="window.close()" style="border-radius: 25px; font-weight: 600;">
                    <i class="fas fa-times me-2"></i>Cerrar
                </button>
            </div>
            
            <script>
                function descargarPDF() {
                    const btnDescargar = document.querySelector('.btn-download');
                    const textoOriginal = btnDescargar.innerHTML;
                    btnDescargar.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generando PDF...';
                    btnDescargar.disabled = true;
                    
                    const elemento = document.querySelector('.reporte-container');
                    const opciones = {
                        margin: [8, 8, 8, 8],
                        filename: 'reporte_consolidado_' + new Date().toISOString().split('T')[0] + '.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { 
                            scale: 1.8,
                            useCORS: true,
                            letterRendering: true,
                            logging: false,
                            allowTaint: true,
                            backgroundColor: '#ffffff',
                            scrollX: 0,
                            scrollY: 0
                        },
                        jsPDF: { 
                            unit: 'mm', 
                            format: 'a4', 
                            orientation: 'portrait',
                            compress: true,
                            hotfixes: ["px_scaling"]
                        },
                        pagebreak: { 
                            mode: ['avoid-all'],
                            avoid: ['.header-reporte', '.table']
                        }
                    };
                    
                    // Ocultar botones antes de generar PDF
                    document.querySelector('.actions-section').style.display = 'none';
                    
                    html2pdf().set(opciones).from(elemento).save().then(() => {
                        document.querySelector('.actions-section').style.display = 'block';
                        btnDescargar.innerHTML = textoOriginal;
                        btnDescargar.disabled = false;
                        alert('✅ PDF generado exitosamente');
                    }).catch(error => {
                        console.error('Error al generar PDF:', error);
                        document.querySelector('.actions-section').style.display = 'block';
                        btnDescargar.innerHTML = textoOriginal;
                        btnDescargar.disabled = false;
                        alert('❌ Error al generar el PDF. Inténtelo nuevamente.');
                    });
                }
            </script>
        </body>
        </html>
    `);
        
        console.log('✅ [PDF] PDF consolidado generado exitosamente');
    } catch (error) {
        console.error('❌ [PDF] Error al generar PDF consolidado:', error);
        throw error;
    }
}

// Función para generar PDF por criterio
function generarPDFPorCriterio(estudiantes, criterio) {
    const criterioTextos = {
        'pueden-graduar': 'Estudiantes que Pueden Graduarse (≥80 puntos)',
        'no-pueden-graduar': 'Estudiantes que No Pueden Graduarse (<80 puntos)',
        'con-incentivos': 'Estudiantes con Incentivos (≥180 puntos)',
        'excelente': 'Estudiantes con Rendimiento Excelente (≥200 puntos)',
        'deficiente': 'Estudiantes con Rendimiento Deficiente (<50 puntos)'
    };
    
    const tituloReporte = criterioTextos[criterio] || 'Reporte Filtrado';
    
    const ventanaReporte = window.open('', '_blank');
    ventanaReporte.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte por Criterio - SABER PRO</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 12px; background: #f8f9fa; }
                .reporte-container {
                    background: white;
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    min-height: 297mm;
                }
                .header-reporte { 
                    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                    color: white;
                    text-align: center; 
                    padding: 25px 20px;
                    margin-bottom: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .university-title {
                    font-size: 1.6rem;
                    font-weight: 700;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .report-title {
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .report-subtitle {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 10px;
                    opacity: 0.95;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                }
                .report-date {
                    opacity: 0.9;
                    font-size: 1rem;
                    margin-top: 10px;
                }
                .table { font-size: 11px; }
                .alert { font-size: 12px; margin: 15px 0; }
                .actions-section {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                @media print {
                    .actions-section { display: none !important; }
                    body { margin: 0; padding: 0; background: white; }
                    .reporte-container { 
                        box-shadow: none; 
                        margin: 0; 
                        padding: 15px;
                        max-width: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="reporte-container">
                <div class="header-reporte">
                    <h1 class="report-title">
                        <i class="fas fa-filter me-2"></i>
                        REPORTE POR CRITERIO - SABER PRO
                    </h1>
                    <h3 class="university-title">Unidades Tecnológicas de Santander</h3>
                    <h4 class="report-subtitle">${tituloReporte}</h4>
                    <p class="report-date">Fecha de generación: ${new Date().toLocaleDateString('es-CO')}</p>
                    <div class="alert alert-info">
                        <strong>Total de estudiantes encontrados: ${estudiantes.length}</strong>
                    </div>
                </div>
                
                <table class="table table-bordered table-striped">
                    <thead class="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Documento</th>
                            <th>Nombre Completo</th>
                            <th>Programa Académico</th>
                            <th>Puntaje Global</th>
                            <th>Correo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${estudiantes.map((est, index) => {
                            const nombreCompleto = `${est.primerNombre || ''} ${est.segundoNombre || ''} ${est.primerApellido || ''} ${est.segundoApellido || ''}`.trim();
                            return `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${est.documento}</td>
                                    <td>${nombreCompleto || 'Sin nombre'}</td>
                                    <td>${est.programaAcademico || 'Sin programa'}</td>
                                    <td><strong>${est.puntajeGlobal || 0}</strong></td>
                                    <td>${est.correoElectronico || 'Sin correo'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="actions-section">
                <button class="btn btn-primary btn-lg px-4 py-2 btn-download" onclick="descargarPDFCriterio()" style="background: linear-gradient(135deg, #007bff, #0056b3); border: none; border-radius: 25px; box-shadow: 0 4px 15px rgba(0,123,255,0.3); font-weight: 600;">
                    <i class="fas fa-download me-2"></i>Descargar reporte en PDF
                </button>
                <button class="btn btn-secondary btn-lg ms-3 px-4 py-2" onclick="window.close()" style="border-radius: 25px; font-weight: 600;">
                    <i class="fas fa-times me-2"></i>Cerrar
                </button>
            </div>
            
            <script>
                function descargarPDFCriterio() {
                    const btnDescargar = document.querySelector('.btn-download');
                    const textoOriginal = btnDescargar.innerHTML;
                    btnDescargar.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generando PDF...';
                    btnDescargar.disabled = true;
                    
                    const elemento = document.querySelector('.reporte-container');
                    const opciones = {
                        margin: [8, 8, 8, 8],
                        filename: 'reporte_criterio_' + new Date().toISOString().split('T')[0] + '.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { 
                            scale: 1.8,
                            useCORS: true,
                            letterRendering: true,
                            logging: false,
                            allowTaint: true,
                            backgroundColor: '#ffffff',
                            scrollX: 0,
                            scrollY: 0
                        },
                        jsPDF: { 
                            unit: 'mm', 
                            format: 'a4', 
                            orientation: 'portrait',
                            compress: true,
                            hotfixes: ["px_scaling"]
                        },
                        pagebreak: { 
                            mode: ['avoid-all'],
                            avoid: ['.header-reporte', '.table', '.alert']
                        }
                    };
                    
                    // Ocultar botones antes de generar PDF
                    document.querySelector('.actions-section').style.display = 'none';
                    
                    html2pdf().set(opciones).from(elemento).save().then(() => {
                        document.querySelector('.actions-section').style.display = 'block';
                        btnDescargar.innerHTML = textoOriginal;
                        btnDescargar.disabled = false;
                        alert('✅ PDF generado exitosamente');
                    }).catch(error => {
                        console.error('Error al generar PDF:', error);
                        document.querySelector('.actions-section').style.display = 'block';
                        btnDescargar.innerHTML = textoOriginal;
                        btnDescargar.disabled = false;
                        alert('❌ Error al generar el PDF. Inténtelo nuevamente.');
                    });
                }
            </script>
        </body>
        </html>
    `);
}

// Función para generar HTML del reporte consolidado para modal
function generarHTMLReporteConsolidado(estudiantes, conIncentivos, promedioGeneral) {
    console.log('🎨 [HTML] Generando HTML para reporte consolidado...');
    
    const total = estudiantes.length;
    const puedenGraduar = estudiantes.filter(est => (est.puntajeGlobal || 0) >= 80).length;
    
    let tablaEstudiantes = '';
    estudiantes.forEach((est, index) => {
        const nombreCompleto = `${est.primerNombre || ''} ${est.segundoNombre || ''} ${est.primerApellido || ''} ${est.segundoApellido || ''}`.trim();
        const puntaje = est.puntajeGlobal || 0;
        const puedeGraduar = puntaje >= 80;
        const estadoClase = puedeGraduar ? 'text-success' : 'text-warning';
        const iconoEstado = puedeGraduar ? 'fa-check-circle' : 'fa-exclamation-triangle';
        
        tablaEstudiantes += `
            <tr>
                <td>${index + 1}</td>
                <td>${est.documento || 'N/A'}</td>
                <td>${nombreCompleto}</td>
                <td>${est.programaAcademico || 'N/A'}</td>
                <td class="text-center ${estadoClase}"><strong>${puntaje}</strong></td>
                <td class="text-center">
                    <i class="fas ${iconoEstado} ${estadoClase}"></i>
                    <span class="${estadoClase}">${puedeGraduar ? 'Sí' : 'No'}</span>
                </td>
                <td class="text-center">
                    <i class="fas ${est.tieneIncentivos ? 'fa-check text-success' : 'fa-times text-muted'}"></i>
                    <span class="${est.tieneIncentivos ? 'text-success' : 'text-muted'}">${est.tieneIncentivos ? 'Sí' : 'No'}</span>
                </td>
                <td>${est.correoElectronico || 'N/A'}</td>
                <td>${est.numeroTelefono || 'N/A'}</td>
            </tr>
        `;
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte Consolidado SABER PRO</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 12px; background: #f8f9fa; }
                .header { text-align: center; margin-bottom: 30px; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
                .stat-card { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #0d6efd; }
                .table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                table { width: 100%; font-size: 11px; }
                th { background: #0d6efd; color: white; padding: 10px 8px; }
                td { padding: 8px; border-bottom: 1px solid #dee2e6; }
                .actions-section { text-align: center; margin: 20px 0; }
                .btn { padding: 10px 20px; margin: 0 5px; border: none; border-radius: 5px; cursor: pointer; }
                .btn-primary { background: #0d6efd; color: white; }
                .btn-secondary { background: #6c757d; color: white; }
                @media print { .actions-section { display: none; } }
                @page { margin: 1cm; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1><i class="fas fa-chart-bar text-primary"></i> Reporte Consolidado SABER PRO</h1>
                <h4 class="text-muted">Universidad - Resultados Académicos</h4>
                <p class="text-muted">Generado el ${new Date().toLocaleDateString('es-CO')}</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h5><i class="fas fa-users text-primary"></i> Total de Estudiantes</h5>
                    <h2 class="text-primary">${total}</h2>
                </div>
                <div class="stat-card">
                    <h5><i class="fas fa-graduation-cap text-success"></i> Pueden Graduarse</h5>
                    <h2 class="text-success">${puedenGraduar}</h2>
                    <small class="text-muted">${((puedenGraduar/total)*100).toFixed(1)}% del total</small>
                </div>
                <div class="stat-card">
                    <h5><i class="fas fa-trophy text-warning"></i> Con Incentivos</h5>
                    <h2 class="text-warning">${conIncentivos}</h2>
                    <small class="text-muted">${((conIncentivos/total)*100).toFixed(1)}% del total</small>
                </div>
                <div class="stat-card">
                    <h5><i class="fas fa-chart-line text-info"></i> Promedio General</h5>
                    <h2 class="text-info">${promedioGeneral}</h2>
                    <small class="text-muted">Puntos SABER PRO</small>
                </div>
            </div>

            <div class="table-container">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Documento</th>
                            <th>Nombre Completo</th>
                            <th>Programa</th>
                            <th>Puntaje Global</th>
                            <th>Puede Graduarse</th>
                            <th>Con Incentivos</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tablaEstudiantes}
                    </tbody>
                </table>
            </div>

            <div class="actions-section">
                <button class="btn btn-primary" onclick="generarPDF()">
                    <i class="fas fa-file-pdf"></i> Descargar PDF
                </button>
                <button class="btn btn-secondary" onclick="window.print()">
                    <i class="fas fa-print"></i> Imprimir
                </button>
            </div>

            <script>
                function generarPDF() {
                    const btnDescargar = event.target;
                    const textoOriginal = btnDescargar.innerHTML;
                    
                    btnDescargar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando PDF...';
                    btnDescargar.disabled = true;
                    document.querySelector('.actions-section').style.display = 'none';
                    
                    const element = document.body;
                    const opt = {
                        margin: [0.5, 0.5, 0.5, 0.5],
                        filename: 'reporte_consolidado_saber_pro.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
                    };
                    
                    html2pdf().set(opt).from(element).save().then(() => {
                        document.querySelector('.actions-section').style.display = 'block';
                        btnDescargar.innerHTML = textoOriginal;
                        btnDescargar.disabled = false;
                        alert('✅ PDF generado exitosamente');
                    }).catch(error => {
                        console.error('Error al generar PDF:', error);
                        document.querySelector('.actions-section').style.display = 'block';
                        btnDescargar.innerHTML = textoOriginal;
                        btnDescargar.disabled = false;
                        alert('❌ Error al generar el PDF. Inténtelo nuevamente.');
                    });
                }
            </script>
        </body>
        </html>
    `;
}

// Función para mostrar reporte consolidado en modal
function mostrarReporteConsolidadoEnModal(htmlContent) {
    console.log('🖼️ [MODAL] Mostrando reporte consolidado en modal...');
    
    // Verificar si ya existe un modal de reporte consolidado
    let modal = document.getElementById('modalReporteConsolidado');
    if (!modal) {
        // Crear el modal
        modal = document.createElement('div');
        modal.id = 'modalReporteConsolidado';
        modal.className = 'modal fade';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-chart-bar"></i> Reporte Consolidado SABER PRO
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-0">
                        <iframe id="iframeReporteConsolidado" style="width: 100%; height: 80vh; border: none;"></iframe>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="abrirReporteConsolidadoEnVentana()">
                            <i class="fas fa-external-link-alt"></i> Abrir en ventana nueva
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Cargar el contenido en el iframe
    const iframe = document.getElementById('iframeReporteConsolidado');
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    
    // Función global para abrir en ventana nueva
    window.abrirReporteConsolidadoEnVentana = function() {
        const ventana = window.open('', '_blank', 'width=1200,height=800');
        if (ventana) {
            ventana.document.write(htmlContent);
            ventana.document.close();
        } else {
            alert('⚠️ No se pudo abrir la ventana. Verifique que no esté bloqueando ventanas emergentes.');
        }
    };
    
    // Mostrar el modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    console.log('✅ [MODAL] Reporte consolidado mostrado en modal');
}

// Funciones para Excel (usando SheetJS para mejor compatibilidad)
function generarExcelConsolidado(estudiantes) {
    console.log('📊 [EXCEL] Iniciando generación de Excel consolidado...');
    console.log('📊 [EXCEL] Total de estudiantes recibidos:', estudiantes.length);
    
    try {
        // Si existe SheetJS, usar la librería para generar Excel real
        if (typeof XLSX !== 'undefined') {
            console.log('📊 [EXCEL] Usando SheetJS para generar Excel real...');
            generarExcelRealConsolidado(estudiantes);
        } else {
            console.log('📊 [EXCEL] SheetJS no disponible, usando fallback a CSV...');
            // Fallback a CSV con mejor codificación
            const csvContent = generarCSVConsolidado(estudiantes);
            descargarCSV(csvContent, 'reporte_consolidado_saber_pro.csv');
        }
        console.log('✅ [EXCEL] Excel consolidado generado exitosamente');
    } catch (error) {
        console.error('❌ [EXCEL] Error al generar Excel consolidado:', error);
        throw error;
    }
}

function generarExcelPorCriterio(estudiantes, criterio) {
    // Si existe SheetJS, usar la librería para generar Excel real
    if (typeof XLSX !== 'undefined') {
        generarExcelRealPorCriterio(estudiantes, criterio);
    } else {
        // Fallback a CSV con mejor codificación
        const csvContent = generarCSVPorCriterio(estudiantes, criterio);
        descargarCSV(csvContent, `reporte_${criterio}_saber_pro.csv`);
    }
}

// Función para generar Excel real usando SheetJS
function generarExcelRealConsolidado(estudiantes) {
    console.log('📊 [XLSX] Creando archivo Excel real con SheetJS...');
    console.log('📊 [XLSX] Número de estudiantes a procesar:', estudiantes.length);
    
    try {
        const datos = [
            ['Documento', 'Nombre Completo', 'Programa Académico', 'Puntaje Global', 'Puede Graduarse', 'Con Incentivos', 'Correo', 'Teléfono']
        ];
        
        console.log('📊 [XLSX] Procesando datos de estudiantes...');
        estudiantes.forEach((est, index) => {
            console.log(`📊 [XLSX] Procesando estudiante ${index + 1}/${estudiantes.length}:`, est.documento);
            const nombreCompleto = `${est.primerNombre || ''} ${est.segundoNombre || ''} ${est.primerApellido || ''} ${est.segundoApellido || ''}`.trim();
            const puntaje = est.puntajeGlobal || 0;
            const puedeGraduar = puntaje >= 80 ? 'Sí' : 'No';
            const conIncentivos = est.tieneIncentivos ? 'Sí' : 'No';
            
            datos.push([
                est.documento || '',
                nombreCompleto,
                est.programaAcademico || '',
                puntaje,
                puedeGraduar,
                conIncentivos,
                est.correoElectronico || '',
                est.numeroTelefono || ''
            ]);
        });
        
        console.log('📊 [XLSX] Datos procesados, creando workbook...');
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datos);
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte Consolidado');
        
        console.log('📊 [XLSX] Generando archivo Excel...');
        XLSX.writeFile(wb, 'reporte_consolidado_saber_pro.xlsx');
        console.log('✅ [XLSX] Excel generado y descargado exitosamente');
        
    } catch (error) {
        console.error('❌ [XLSX] Error al generar Excel real:', error);
        throw error;
    }
}

function generarExcelRealPorCriterio(estudiantes, criterio) {
    const datos = [
        ['Documento', 'Nombre Completo', 'Programa Académico', 'Puntaje Global', 'Correo', 'Teléfono']
    ];
    
    estudiantes.forEach(est => {
        const nombreCompleto = `${est.primerNombre || ''} ${est.segundoNombre || ''} ${est.primerApellido || ''} ${est.segundoApellido || ''}`.trim();
        
        datos.push([
            est.documento || '',
            nombreCompleto,
            est.programaAcademico || '',
            est.puntajeGlobal || 0,
            est.correoElectronico || '',
            est.numeroTelefono || ''
        ]);
    });
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte por Criterio');
    XLSX.writeFile(wb, `reporte_${criterio}_saber_pro.xlsx`);
}

function generarCSVConsolidado(estudiantes) {
    console.log('📊 [CSV] Generando CSV consolidado...');
    console.log('📊 [CSV] Número de estudiantes a procesar:', estudiantes.length);
    
    try {
        // Encabezados con caracteres especiales correctamente codificados
        let csv = 'Documento,Nombre Completo,Programa Académico,Puntaje Global,Puede Graduarse,Con Incentivos,Correo,Teléfono\n';
        
        console.log('📊 [CSV] Procesando datos de estudiantes...');
        estudiantes.forEach((est, index) => {
            console.log(`📊 [CSV] Procesando estudiante ${index + 1}/${estudiantes.length}:`, est.documento);
            const nombreCompleto = `${est.primerNombre || ''} ${est.segundoNombre || ''} ${est.primerApellido || ''} ${est.segundoApellido || ''}`.trim();
            const puntaje = est.puntajeGlobal || 0;
            const puedeGraduar = puntaje >= 80 ? 'Sí' : 'No';
            const conIncentivos = est.tieneIncentivos ? 'Sí' : 'No';
            
            // Limpiar y normalizar los datos para evitar problemas de codificación
            const documento = String(est.documento || '').replace(/"/g, '""');
            const nombre = String(nombreCompleto).replace(/"/g, '""');
            const programa = String(est.programaAcademico || '').replace(/"/g, '""');
            const correo = String(est.correoElectronico || '').replace(/"/g, '""');
            const telefono = String(est.numeroTelefono || '').replace(/"/g, '""');
            
            csv += `"${documento}","${nombre}","${programa}","${puntaje}","${puedeGraduar}","${conIncentivos}","${correo}","${telefono}"\n`;
        });
        
        console.log('📊 [CSV] CSV generado exitosamente. Tamaño:', csv.length, 'caracteres');
        return csv;
        
    } catch (error) {
        console.error('❌ [CSV] Error al generar CSV:', error);
        throw error;
    }
}

function generarCSVPorCriterio(estudiantes, criterio) {
    // Encabezados con caracteres especiales correctamente codificados
    let csv = 'Documento,Nombre Completo,Programa Académico,Puntaje Global,Correo,Teléfono\n';
    
    estudiantes.forEach(est => {
        const nombreCompleto = `${est.primerNombre || ''} ${est.segundoNombre || ''} ${est.primerApellido || ''} ${est.segundoApellido || ''}`.trim();
        
        // Limpiar y normalizar los datos para evitar problemas de codificación
        const documento = String(est.documento || '').replace(/"/g, '""');
        const nombre = String(nombreCompleto).replace(/"/g, '""');
        const programa = String(est.programaAcademico || '').replace(/"/g, '""');
        const puntaje = est.puntajeGlobal || 0;
        const correo = String(est.correoElectronico || '').replace(/"/g, '""');
        const telefono = String(est.numeroTelefono || '').replace(/"/g, '""');
        
        csv += `"${documento}","${nombre}","${programa}","${puntaje}","${correo}","${telefono}"\n`;
    });
    
    return csv;
}

function descargarCSV(csvContent, filename) {
    // Agregar BOM (Byte Order Mark) para UTF-8 para que Excel reconozca correctamente los caracteres especiales
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Función auxiliar para reutilizar el contenido del modal de detalles
function generarContenidoDetalleModal(estudiante, tieneIncentivos = false) {
    const nombreCompleto = `${estudiante.primerNombre || ''} ${estudiante.segundoNombre || ''} ${estudiante.primerApellido || ''} ${estudiante.segundoApellido || ''}`.trim();
    const puntajeGlobal = estudiante.puntajeGlobal || 0;
    const puedeGraduar = puntajeGlobal >= 80;
    
    
    // Obtener competencias (reutilizando la lógica existente)
    const competenciasGenericas = [
        { nombre: 'Comunicación Escrita', valor: obtenerPuntajeCompetencia(estudiante, 'Comunicación Escrita') },
        { nombre: 'Razonamiento Cuantitativo', valor: obtenerPuntajeCompetencia(estudiante, 'Razonamiento Cuantitativo') },
        { nombre: 'Lectura Crítica', valor: obtenerPuntajeCompetencia(estudiante, 'Lectura Crítica') },
        { nombre: 'Competencias Ciudadanas', valor: obtenerPuntajeCompetencia(estudiante, 'Competencias Ciudadanas') },
        { nombre: 'Inglés', valor: obtenerPuntajeCompetencia(estudiante, 'Inglés') }
    ];
    
    const competenciasEspecificas = [
        { nombre: 'Formulación de Proyectos', valor: obtenerPuntajeCompetencia(estudiante, 'Formulación de Proyectos de Ingeniería') },
        { nombre: 'Diseño de Software', valor: obtenerPuntajeCompetencia(estudiante, 'Diseño de Software') }
    ];
    
    return `
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5><i class="fas fa-user me-2"></i>Información Personal</h5>
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless">
                            <tr><td><strong><i class="fas fa-id-card me-2"></i>Documento:</strong></td><td>${estudiante.documento}</td></tr>
                            <tr><td><strong><i class="fas fa-file-alt me-2"></i>Tipo:</strong></td><td>${estudiante.tipoDocumento || '-'}</td></tr>
                            <tr><td><strong><i class="fas fa-user me-2"></i>Nombre:</strong></td><td>${nombreCompleto || 'Sin nombre'}</td></tr>
                            <tr><td><strong><i class="fas fa-envelope me-2"></i>Correo:</strong></td><td>${estudiante.correoElectronico || '-'}</td></tr>
                            <tr><td><strong><i class="fas fa-phone me-2"></i>Teléfono:</strong></td><td>${estudiante.numeroTelefono || '-'}</td></tr>
                            <tr><td><strong><i class="fas fa-graduation-cap me-2"></i>Programa:</strong></td><td>${estudiante.programaAcademico || '-'}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-header bg-success text-white">
                        <h5><i class="fas fa-chart-line me-2"></i>Resultados Globales</h5>
                    </div>
                    <div class="card-body">
                        <div class="text-center mb-3">
                            <div class="puntaje-global">${puntajeGlobal}</div>
                            <p class="text-muted mb-0">Puntaje Global</p>
                            <div class="mt-2">
                                <div class="progress" style="height: 15px;">
                                    <div class="progress-bar ${puntajeGlobal >= 80 ? 'bg-success' : 'bg-danger'}" 
                                         style="width: ${Math.min((puntajeGlobal / 300) * 100, 100)}%"></div>
                                </div>
                                <small class="text-muted">Progreso hacia puntaje máximo</small>
                            </div>
                        </div>
                        <div class="mb-3">
                            <strong><i class="fas fa-check-circle me-2"></i>Estado de Graduación:</strong><br>
                            <span class="badge ${puedeGraduar ? 'bg-success' : 'bg-danger'} mt-1">
                                <i class="fas ${puedeGraduar ? 'fa-thumbs-up' : 'fa-thumbs-down'} me-2"></i>
                                ${puedeGraduar ? 'Puede Graduarse' : 'No Puede Graduarse'}
                            </span>
                        </div>
                        <div class="mb-3">
                            <strong><i class="fas fa-award me-2"></i>Incentivos:</strong><br>
                            <span class="badge ${tieneIncentivos ? 'bg-warning' : 'bg-secondary'} mt-1">
                                <i class="fas ${tieneIncentivos ? 'fa-star' : 'fa-minus'} me-2"></i>
                                ${tieneIncentivos ? 'Con Incentivos' : 'Sin Incentivos'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-header bg-info text-white">
                        <h5><i class="fas fa-book me-2"></i>Competencias Genéricas</h5>
                    </div>
                    <div class="card-body">
                        ${competenciasGenericas.map(comp => {
                            const nivel = obtenerNivelCompetencia(comp.valor);
                            const porcentaje = Math.min((comp.valor / 60) * 100, 100);
                            return `
                                <div class="mb-4">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span class="fw-bold">${comp.nombre}</span>
                                        <span class="badge ${nivel.color}">${comp.valor} pts</span>
                                    </div>
                                    <div class="progress mb-1" style="height: 12px;">
                                        <div class="progress-bar ${nivel.color.replace('bg-', 'bg-')}" 
                                             style="width: ${porcentaje}%"></div>
                                    </div>
                                    <small class="text-muted">
                                        <i class="fas fa-info-circle me-1"></i>
                                        ${nivel.texto}
                                    </small>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-header bg-warning text-dark">
                        <h5><i class="fas fa-cogs me-2"></i>Competencias Específicas</h5>
                    </div>
                    <div class="card-body">
                        ${competenciasEspecificas.map(comp => {
                            const nivel = obtenerNivelCompetencia(comp.valor);
                            const porcentaje = Math.min((comp.valor / 60) * 100, 100);
                            return `
                                <div class="mb-4">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span class="fw-bold">${comp.nombre}</span>
                                        <span class="badge ${nivel.color}">${comp.valor} pts</span>
                                    </div>
                                    <div class="progress mb-1" style="height: 12px;">
                                        <div class="progress-bar ${nivel.color.replace('bg-', 'bg-')}" 
                                             style="width: ${porcentaje}%"></div>
                                    </div>
                                    <small class="text-muted">
                                        <i class="fas fa-info-circle me-1"></i>
                                        ${nivel.texto}
                                    </small>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-dark text-white">
                        <h5><i class="fas fa-chart-bar me-2"></i>Análisis Detallado de Rendimiento</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 text-center mb-3">
                                <div class="border rounded p-3 h-100">
                                    <i class="fas fa-trophy text-warning fa-2x mb-2"></i>
                                    <h6>Competencia Destacada</h6>
                                    <p class="text-muted mb-0">${competenciasGenericas.reduce((max, comp) => comp.valor > max.valor ? comp : max).nombre}</p>
                                    <strong class="text-primary">${competenciasGenericas.reduce((max, comp) => comp.valor > max.valor ? comp : max).valor} pts</strong>
                                </div>
                            </div>
                            <div class="col-md-4 text-center mb-3">
                                <div class="border rounded p-3 h-100">
                                    <i class="fas fa-chart-line text-info fa-2x mb-2"></i>
                                    <h6>Promedio Competencias</h6>
                                    <p class="text-muted mb-0">Genéricas</p>
                                    <strong class="text-info">${(competenciasGenericas.reduce((sum, comp) => sum + comp.valor, 0) / competenciasGenericas.length).toFixed(1)} pts</strong>
                                </div>
                            </div>
                            <div class="col-md-4 text-center mb-3">
                                <div class="border rounded p-3 h-100">
                                    <i class="fas fa-target text-success fa-2x mb-2"></i>
                                    <h6>Meta de Graduación</h6>
                                    <p class="text-muted mb-0">${puntajeGlobal >= 80 ? 'Alcanzada' : 'Pendiente'}</p>
                                    <strong class="text-${puntajeGlobal >= 80 ? 'success' : 'danger'}">${puntajeGlobal}/80 pts</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función auxiliar para generar el HTML del reporte
function generarHTMLReporte(estudiante, nombreCompleto, puntajeGlobal, puedeGraduar, tieneIncentivos, competenciasGenericas, competenciasEspecificas, competenciaDestacada, promedioGeneral) {
    const fechaActual = new Date().toLocaleDateString('es-CO', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    // Generar competencias genéricas HTML
    const competenciasGenericasHTML = competenciasGenericas.map(comp => `
        <div class="competencia-item">
            <div class="competencia-nombre">${comp.nombre}</div>
            <div class="competencia-puntaje">${comp.valor} pts</div>
        </div>
    `).join('');
    
    // Generar competencias específicas HTML
    const competenciasEspecificasHTML = competenciasEspecificas.map(comp => `
        <div class="competencia-item">
            <div class="competencia-nombre">${comp.nombre}</div>
            <div class="competencia-puntaje">${comp.valor} pts</div>
        </div>
    `).join('');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte Individual - ${estudiante.documento}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    margin: 0; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 15px;
                    font-size: 14px;
                }
                .reporte-container {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                    overflow: hidden;
                    max-width: 900px;
                    margin: 0 auto;
                    min-height: 1000px;
                    display: flex;
                    flex-direction: column;
                }
                .header-reporte { 
                    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                    color: white;
                    text-align: center; 
                    padding: 25px 20px;
                    flex-shrink: 0;
                }
                .university-title {
                    font-size: 1.6rem;
                    font-weight: 700;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .report-title {
                    font-size: 1.3rem;
                    margin: 10px 0 5px 0;
                    color: #ecf0f1;
                }
                .fecha-generacion {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    margin-top: 8px;
                }
                .content-body {
                    padding: 20px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .estudiante-info {
                    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 20px;
                    text-align: center;
                    border: 2px solid #dee2e6;
                }
                .estudiante-nombre {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }
                .estudiante-documento {
                    color: #6c757d;
                    font-size: 1rem;
                }
                
                /* Layout principal en dos columnas fijas */
                .main-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                
                .info-personal-card, .resultados-card {
                    background: white;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                
                .card-header-custom {
                    padding: 12px 15px;
                    font-weight: 600;
                    color: white;
                    font-size: 1rem;
                }
                
                .header-primary {
                    background: linear-gradient(135deg, #3498db, #2980b9);
                }
                
                .header-success {
                    background: linear-gradient(135deg, #27ae60, #229954);
                }
                
                .header-info {
                    background: linear-gradient(135deg, #17a2b8, #138496);
                }
                
                .header-warning {
                    background: linear-gradient(135deg, #f39c12, #e67e22);
                }
                
                .card-body-custom {
                    padding: 15px;
                }
                
                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .info-table td {
                    padding: 8px 5px;
                    border-bottom: 1px solid #f1f3f4;
                    font-size: 0.9rem;
                    vertical-align: top;
                }
                
                .info-table td:first-child {
                    font-weight: 600;
                    color: #495057;
                    width: 40%;
                }
                
                .puntaje-global-container {
                    text-align: center;
                    margin-bottom: 15px;
                }
                
                .puntaje-global {
                    font-size: 2.5rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #3498db, #9b59b6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0;
                }
                
                .puntaje-label {
                    color: #6c757d;
                    font-size: 0.9rem;
                    margin-top: 5px;
                }
                
                .status-item {
                    margin-bottom: 12px;
                }
                
                .status-label {
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 5px;
                    font-size: 0.9rem;
                }
                
                .badge-custom {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-align: center;
                }
                
                .badge-success {
                    background: linear-gradient(135deg, #27ae60, #229954);
                    color: white;
                }
                
                .badge-danger {
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    color: white;
                }
                
                .badge-warning {
                    background: linear-gradient(135deg, #f39c12, #e67e22);
                    color: white;
                }
                
                .badge-secondary {
                    background: linear-gradient(135deg, #6c757d, #495057);
                    color: white;
                }
                
                .badge-info {
                    background: linear-gradient(135deg, #17a2b8, #138496);
                    color: white;
                }
                
                /* Sección del gráfico de competencias */
                .grafico-competencias-section {
                    background: white;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                }
                
                .competencias-chart {
                    padding: 10px 0;
                }
                
                .chart-item {
                    margin-bottom: 12px;
                    padding: 8px 0;
                }
                
                .chart-label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 4px;
                }
                
                .chart-bar-container {
                    position: relative;
                    background: #f8f9fa;
                    border-radius: 10px;
                    height: 20px;
                    overflow: hidden;
                }
                
                .chart-bar {
                    height: 100%;
                    border-radius: 10px;
                    position: relative;
                    transition: width 0.3s ease;
                }
                
                .bar-excelente {
                    background: linear-gradient(135deg, #27ae60, #2ecc71);
                }
                
                .bar-muy-bueno {
                    background: linear-gradient(135deg, #3498db, #5dade2);
                }
                
                .bar-bueno {
                    background: linear-gradient(135deg, #f39c12, #f8c471);
                }
                
                .bar-regular {
                    background: linear-gradient(135deg, #e67e22, #f0b27a);
                }
                
                .bar-bajo {
                    background: linear-gradient(135deg, #e74c3c, #ec7063);
                }
                
                .chart-value {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #2c3e50;
                    background: rgba(255,255,255,0.9);
                    padding: 2px 6px;
                    border-radius: 8px;
                }
                
                /* Sección de recomendaciones */
                .recomendaciones-section {
                    background: white;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                }
                
                .recomendaciones-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                
                .recomendacion-item {
                    display: flex;
                    align-items: flex-start;
                    background: #f8f9fa;
                    border-radius: 6px;
                    padding: 12px;
                    border-left: 4px solid #3498db;
                }
                
                .rec-icono {
                    font-size: 1.5rem;
                    margin-right: 10px;
                    flex-shrink: 0;
                }
                
                .rec-content {
                    flex: 1;
                }
                
                .rec-titulo {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #2c3e50;
                    margin-bottom: 4px;
                }
                
                .rec-texto {
                    font-size: 0.8rem;
                    color: #6c757d;
                    line-height: 1.4;
                }
                
                /* Sección de competencias en layout de dos columnas */
                .competencias-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                
                .competencias-card {
                    background: white;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                
                .competencia-item {
                    padding: 10px;
                    border-bottom: 1px solid #f1f3f4;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .competencia-item:last-child {
                    border-bottom: none;
                }
                
                .competencia-nombre {
                    font-weight: 600;
                    color: #495057;
                    font-size: 0.9rem;
                    flex: 1;
                }
                
                .competencia-puntaje {
                    background: linear-gradient(135deg, #3498db, #2980b9);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                
                /* Análisis final en una sola sección */
                .analisis-section {
                    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                    border: 2px solid #3498db;
                    border-radius: 8px;
                    padding: 15px;
                    margin-top: auto;
                }
                
                .analisis-title {
                    color: #2c3e50;
                    font-size: 1rem;
                    font-weight: 700;
                    margin-bottom: 15px;
                    text-align: center;
                }
                
                .analisis-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
                
                .analisis-item {
                    text-align: center;
                    padding: 10px;
                    background: white;
                    border-radius: 6px;
                    border: 1px solid #dee2e6;
                }
                
                .analisis-item-title {
                    font-size: 0.8rem;
                    color: #6c757d;
                    margin-bottom: 5px;
                }
                
                .analisis-valor {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #3498db;
                    margin-bottom: 2px;
                }
                
                .analisis-subtitulo {
                    font-size: 0.7rem;
                    color: #6c757d;
                }
                
                .actions-section {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    border-top: 2px solid #3498db;
                    flex-shrink: 0;
                }
                
                .btn-download {
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    border: none;
                    padding: 12px 25px;
                    border-radius: 20px;
                    color: white;
                    font-weight: 600;
                    font-size: 1rem;
                    margin: 0 8px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
                }
                
                .btn-download:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
                    color: white;
                }
                
                .btn-download:disabled {
                    opacity: 0.7;
                    transform: none;
                    cursor: not-allowed;
                }
                
                .btn-close {
                    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                    border: none;
                    padding: 12px 25px;
                    border-radius: 20px;
                    color: white;
                    font-weight: 600;
                    font-size: 1rem;
                    margin: 0 8px;
                    transition: all 0.3s ease;
                }
                
                @media print {
                    body { 
                        background: white !important; 
                        padding: 0 !important; 
                    }
                    .actions-section { 
                        display: none !important; 
                    }
                    .reporte-container { 
                        box-shadow: none !important; 
                        border-radius: 0 !important; 
                        margin: 0 !important;
                        min-height: auto !important;
                    }
                    .main-content,
                    .competencias-section {
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <div class="reporte-container">
                <div class="header-reporte">
                    <div class="logo-section">
                        <i class="fas fa-university" style="font-size: 3rem; margin-right: 15px; color: #f39c12;"></i>
                        <h1 class="university-title">Unidades Tecnológicas de Santander</h1>
                    </div>
                    <h2 class="report-title">
                        <i class="fas fa-graduation-cap me-2"></i>
                        REPORTE INDIVIDUAL SABER PRO
                    </h2>
                    <p class="fecha-generacion">
                        <i class="fas fa-calendar-alt me-2"></i>
                        Fecha de generación: ${fechaActual}
                    </p>
                </div>
                
                <div class="content-body">
                    <div class="estudiante-info">
                        <h3 class="estudiante-nombre">${nombreCompleto || 'Sin nombre'}</h3>
                        <p class="estudiante-documento">Documento: ${estudiante.documento}</p>
                    </div>
                    
                    <!-- Información Personal y Resultados en dos columnas -->
                    <div class="main-content">
                        <div class="info-personal-card">
                            <div class="card-header-custom header-primary">
                                <i class="fas fa-user me-2"></i>Información Personal
                            </div>
                            <div class="card-body-custom">
                                <table class="info-table">
                                    <tr><td><i class="fas fa-id-card me-2"></i>Documento:</td><td>${estudiante.documento}</td></tr>
                                    <tr><td><i class="fas fa-file-alt me-2"></i>Tipo:</td><td>${estudiante.tipoDocumento || 'CC'}</td></tr>
                                    <tr><td><i class="fas fa-user me-2"></i>Nombre:</td><td>${nombreCompleto || 'Sin nombre'}</td></tr>
                                    <tr><td><i class="fas fa-envelope me-2"></i>Correo:</td><td>${estudiante.correoElectronico || '-'}</td></tr>
                                    <tr><td><i class="fas fa-phone me-2"></i>Teléfono:</td><td>${estudiante.numeroTelefono || '-'}</td></tr>
                                    <tr><td><i class="fas fa-graduation-cap me-2"></i>Programa:</td><td>${estudiante.programaAcademico || '-'}</td></tr>
                                </table>
                            </div>
                        </div>
                        
                        <div class="resultados-card">
                            <div class="card-header-custom header-success">
                                <i class="fas fa-chart-line me-2"></i>Resultados Globales
                            </div>
                            <div class="card-body-custom">
                                <div class="puntaje-global-container">
                                    <div class="puntaje-global">${puntajeGlobal}</div>
                                    <div class="puntaje-label">Puntaje Global</div>
                                </div>
                                
                                <div class="status-item">
                                    <div class="status-label"><i class="fas fa-check-circle me-2"></i>Estado de Graduación:</div>
                                    <span class="badge-custom ${puedeGraduar ? 'badge-success' : 'badge-danger'}">
                                        <i class="fas ${puedeGraduar ? 'fa-thumbs-up' : 'fa-thumbs-down'} me-2"></i>
                                        ${puedeGraduar ? 'Puede Graduarse' : 'No Puede Graduarse'}
                                    </span>
                                </div>
                                
                                <div class="status-item">
                                    <div class="status-label"><i class="fas fa-award me-2"></i>Incentivos:</div>
                                    <span class="badge-custom ${tieneIncentivos ? 'badge-warning' : 'badge-secondary'}">
                                        <i class="fas ${tieneIncentivos ? 'fa-star' : 'fa-minus'} me-2"></i>
                                        ${tieneIncentivos ? 'Con Incentivos' : 'Sin Incentivos'}
                                    </span>
                                </div>
                                
                                <div class="status-item">
                                    <div class="status-label"><i class="fas fa-chart-bar me-2"></i>Nivel ICFES:</div>
                                    <span class="badge-custom badge-info">
                                        ${estudiante.nivelIcfes || 'No disponible'}
                                    </span>
                                </div>
                                
                                <div class="status-item">
                                    <div class="status-label"><i class="fas fa-percentage me-2"></i>Percentil:</div>
                                    <span class="badge-custom badge-info">
                                        ${estudiante.percentil ? estudiante.percentil + '%' : 'No disponible'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Gráfico visual de competencias -->
                    <div class="grafico-competencias-section">
                        <div class="card-header-custom header-info">
                            <i class="fas fa-chart-bar me-2"></i>Distribución de Puntajes por Competencia
                        </div>
                        <div class="card-body-custom">
                            <div class="competencias-chart">
                                ${competenciasGenericas.concat(competenciasEspecificas).map(comp => {
                                    const porcentaje = Math.min((comp.valor / 300) * 100, 100);
                                    let colorClass = 'bar-bajo';
                                    if (comp.valor >= 200) colorClass = 'bar-excelente';
                                    else if (comp.valor >= 180) colorClass = 'bar-muy-bueno';
                                    else if (comp.valor >= 160) colorClass = 'bar-bueno';
                                    else if (comp.valor >= 140) colorClass = 'bar-regular';
                                    
                                    return `
                                        <div class="chart-item">
                                            <div class="chart-label">${comp.nombre}</div>
                                            <div class="chart-bar-container">
                                                <div class="chart-bar ${colorClass}" style="width: ${porcentaje}%"></div>
                                                <span class="chart-value">${comp.valor}</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recomendaciones personalizadas -->
                    <div class="recomendaciones-section">
                        <div class="card-header-custom header-warning">
                            <i class="fas fa-lightbulb me-2"></i>Recomendaciones Personalizadas
                        </div>
                        <div class="card-body-custom">
                            <div class="recomendaciones-grid">
                                ${(() => {
                                    const recomendaciones = [];
                                    
                                    // Recomendaciones basadas en puntaje global
                                    if (puntajeGlobal < 80) {
                                        recomendaciones.push({
                                            icono: '📚',
                                            titulo: 'Mejora Requerida',
                                            texto: 'Es necesario mejorar el rendimiento general para alcanzar la meta de graduación de 80 puntos.'
                                        });
                                    } else {
                                        recomendaciones.push({
                                            icono: '🎯',
                                            titulo: 'Meta Alcanzada',
                                            texto: 'Excelente trabajo. Has alcanzado el puntaje mínimo para graduación.'
                                        });
                                    }
                                    
                                    // Recomendaciones por competencias débiles
                                    const competenciasDebiles = competenciasGenericas.concat(competenciasEspecificas)
                                        .filter(comp => comp.valor < 160)
                                        .sort((a, b) => a.valor - b.valor)
                                        .slice(0, 2);
                                    
                                    if (competenciasDebiles.length > 0) {
                                        recomendaciones.push({
                                            icono: '💪',
                                            titulo: 'Áreas de Mejora',
                                            texto: `Enfócate en mejorar: ${competenciasDebiles.map(c => c.nombre).join(', ')}`
                                        });
                                    }
                                    
                                    // Recomendaciones por fortalezas
                                    const fortalezas = competenciasGenericas.concat(competenciasEspecificas)
                                        .filter(comp => comp.valor >= 180)
                                        .slice(0, 2);
                                    
                                    if (fortalezas.length > 0) {
                                        recomendaciones.push({
                                            icono: '⭐',
                                            titulo: 'Fortalezas Identificadas',
                                            texto: `Mantén tu excelencia en: ${fortalezas.map(c => c.nombre).join(', ')}`
                                        });
                                    }
                                    
                                    // Recomendaciones para incentivos
                                    if (!tieneIncentivos && puntajeGlobal >= 160) {
                                        recomendaciones.push({
                                            icono: '🚀',
                                            titulo: 'Próximo Objetivo',
                                            texto: `Necesitas ${180 - puntajeGlobal} puntos más para obtener incentivos académicos.`
                                        });
                                    }
                                    
                                    return recomendaciones.map(rec => `
                                        <div class="recomendacion-item">
                                            <div class="rec-icono">${rec.icono}</div>
                                            <div class="rec-content">
                                                <div class="rec-titulo">${rec.titulo}</div>
                                                <div class="rec-texto">${rec.texto}</div>
                                            </div>
                                        </div>
                                    `).join('');
                                })()}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Competencias en dos columnas -->
                    <div class="competencias-section">
                        <div class="competencias-card">
                            <div class="card-header-custom header-info">
                                <i class="fas fa-book me-2"></i>Competencias Genéricas
                            </div>
                            <div class="card-body-custom">
                                ${competenciasGenericasHTML}
                            </div>
                        </div>
                        
                        <div class="competencias-card">
                            <div class="card-header-custom header-warning">
                                <i class="fas fa-cogs me-2"></i>Competencias Específicas
                            </div>
                            <div class="card-body-custom">
                                ${competenciasEspecificasHTML}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Análisis detallado -->
                    <div class="analisis-section">
                        <div class="analisis-title">📈 Análisis Detallado de Rendimiento</div>
                        <div class="analisis-grid">
                            <div class="analisis-item">
                                <div class="analisis-item-title">🏆 Competencia Destacada</div>
                                <div class="analisis-valor">${competenciaDestacada}</div>
                                <div class="analisis-subtitulo">Mejor resultado</div>
                            </div>
                            <div class="analisis-item">
                                <div class="analisis-item-title">📊 Promedio General</div>
                                <div class="analisis-valor">${promedioGeneral}</div>
                                <div class="analisis-subtitulo">pts promedio</div>
                            </div>
                            <div class="analisis-item">
                                <div class="analisis-item-title">🎯 Meta Graduación</div>
                                <div class="analisis-valor">${puntajeGlobal}/80</div>
                                <div class="analisis-subtitulo" style="color: ${puedeGraduar ? '#27ae60' : '#e74c3c'};">${puedeGraduar ? 'Alcanzada' : 'Pendiente'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="actions-section">
                    <button class="btn btn-download" onclick="descargarPDF()">
                        <i class="fas fa-download me-2"></i>Descargar Reporte
                    </button>
                    <button class="btn btn-close" onclick="window.close()">
                        <i class="fas fa-times me-2"></i>Cerrar
                    </button>
                </div>
            </div>
            
            <script>
                function descargarPDF() {
                    const btnDescargar = document.querySelector('.btn-download');
                    const textoOriginal = btnDescargar.innerHTML;
                    btnDescargar.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generando PDF...';
                    btnDescargar.disabled = true;
                    
                    const elemento = document.querySelector('.reporte-container');
                    const opciones = {
                        margin: [8, 8, 8, 8],
                        filename: 'reporte_individual_${estudiante.documento}_' + new Date().toISOString().split('T')[0] + '.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { 
                            scale: 1.8,
                            useCORS: true,
                            letterRendering: true,
                            logging: false,
                            allowTaint: true,
                            backgroundColor: '#ffffff',
                            scrollX: 0,
                            scrollY: 0
                        },
                        jsPDF: { 
                            unit: 'mm', 
                            format: 'a4', 
                            orientation: 'portrait',
                            compress: true,
                            hotfixes: ["px_scaling"]
                        },
                        pagebreak: { 
                            mode: ['avoid-all'],
                            avoid: ['.main-content', '.competencias-section', '.analisis-section']
                        }
                    };
                    
                    // Ocultar botones antes de generar PDF
                    document.querySelector('.actions-section').style.display = 'none';
                    
                    html2pdf().set(opciones).from(elemento).save().then(() => {
                        document.querySelector('.actions-section').style.display = 'block';
                        btnDescargar.innerHTML = textoOriginal;
                        btnDescargar.disabled = false;
                        alert('✅ PDF generado exitosamente');
                    }).catch(error => {
                        console.error('Error al generar PDF:', error);
                        document.querySelector('.actions-section').style.display = 'block';
                        btnDescargar.innerHTML = textoOriginal;
                        btnDescargar.disabled = false;
                        alert('❌ Error al generar el PDF. Inténtelo nuevamente.');
                    });
                }
            </script>
        </body>
        </html>
    `;
}

console.log('🎉 Todas las funciones cargadas correctamente');

// ============================================================
// GESTIÓN DE INCENTIVOS
// ============================================================

// Variables globales para incentivos
let incentivosData = [];
let currentPageIncentivos = 1;
const itemsPerPageIncentivos = 10;

// Función principal para cargar incentivos
async function cargarIncentivos() {
    console.log('🎯 Cargando sección de incentivos con NUEVA ARQUITECTURA');
    
    // Mostrar la nueva interfaz con pestañas
    mostrarInterfazIncentivosPestañas();
    
    try {
        await Promise.all([
            cargarTiposIncentivos(),
            cargarEstadisticasIncentivos(), 
            cargarAsignacionesAutomaticas(),
            cargarIncentivosDashboard() // ← AGREGAR ESTA LÍNEA
        ]);
        console.log('✅ Nueva interfaz de incentivos cargada exitosamente');
    } catch (error) {
        console.error('❌ Error cargando incentivos:', error);
        mostrarError('Error al cargar datos de incentivos');
    }
}

// Mostrar la interfaz completa de incentivos
function mostrarInterfazIncentivos() {
    const incentivoSection = document.getElementById('incentivos-section');
    if (!incentivoSection) {
        console.error('❌ Sección incentivos-section no encontrada');
        return;
    }
    
    incentivoSection.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2><i class="fas fa-trophy me-2"></i>Gestión de Incentivos</h2>
                    <button class="btn btn-primary" onclick="prepararNuevoIncentivo()" data-bs-toggle="modal" data-bs-target="#modalIncentivo">
                        <i class="fas fa-plus me-2"></i>Nuevo Incentivo
                    </button>
                </div>
            </div>
        </div>

        <!-- Dashboard de Estadísticas -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Total Incentivos</h6>
                                <h3 id="totalIncentivos">0</h3>
                            </div>
                            <i class="fas fa-trophy fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Pendientes</h6>
                                <h3 id="incentivosPendientes">0</h3>
                            </div>
                            <i class="fas fa-clock fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Aprobados</h6>
                                <h3 id="incentivosAprobados">0</h3>
                            </div>
                            <i class="fas fa-check fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Entregados</h6>
                                <h3 id="incentivosEntregados">0</h3>
                            </div>
                            <i class="fas fa-hand-holding-usd fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtros y Controles -->
        <div class="row mb-3">
            <div class="col-md-3">
                <select id="filtroEstadoIncentivos" class="form-select" onchange="filtrarIncentivos()">
                    <option value="">Todos los estados</option>
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="APROBADO">Aprobados</option>
                    <option value="ENTREGADO">Entregados</option>
                    <option value="RECHAZADO">Rechazados</option>
                </select>
            </div>
            <div class="col-md-3">
                <select id="filtroTipoIncentivo" class="form-select" onchange="filtrarIncentivos()">
                    <option value="">Todos los tipos</option>
                    <option value="Descuento en matrícula">Descuento en matrícula</option>
                    <option value="Beca de excelencia">Beca de excelencia</option>
                    <option value="Auxilio económico">Auxilio económico</option>
                    <option value="Reconocimiento académico">Reconocimiento académico</option>
                </select>
            </div>
            <div class="col-md-3">
                <input type="text" id="busquedaIncentivos" class="form-control" 
                       placeholder="Buscar por documento o nombre..." oninput="filtrarIncentivos()">
            </div>
            <div class="col-md-3">
                <button class="btn btn-outline-secondary" onclick="limpiarFiltrosIncentivos()">
                    <i class="fas fa-times me-1"></i>Limpiar Filtros
                </button>
            </div>
        </div>

        <!-- Tabla de Incentivos -->
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Lista de Incentivos</h5>
                <div>
                    <button class="btn btn-outline-success btn-sm me-2" onclick="exportarIncentivosPDF()">
                        <i class="fas fa-file-pdf me-1"></i>PDF
                    </button>
                    <button class="btn btn-outline-primary btn-sm" onclick="exportarIncentivosExcel()">
                        <i class="fas fa-file-excel me-1"></i>Excel
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>Estudiante</th>
                                <th>Tipo & Monto</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Observaciones</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="incentivosTableBody">
                            <tr>
                                <td colspan="6" class="text-center py-4">
                                    <i class="fas fa-spinner fa-spin text-muted" style="font-size: 2rem;"></i>
                                    <p class="text-muted mt-2">Cargando incentivos...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Paginación -->
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div id="infoIncentivos">Cargando...</div>
                    <nav>
                        <ul class="pagination pagination-sm" id="paginationIncentivos">
                            <!-- Se genera dinámicamente -->
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Modal para crear/editar incentivo -->
        <div class="modal fade" id="modalIncentivo" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalIncentivoLabel">Nuevo Incentivo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="formIncentivo">
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="documentoEstudiante" 
                                               placeholder="Documento" required>
                                        <label for="documentoEstudiante">Documento del Estudiante</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="tipoIncentivo" required>
                                            <option value="">Seleccionar tipo</option>
                                            <option value="Descuento en matrícula">Descuento en matrícula</option>
                                            <option value="Beca de excelencia">Beca de excelencia</option>
                                            <option value="Auxilio económico">Auxilio económico</option>
                                            <option value="Reconocimiento académico">Reconocimiento académico</option>
                                        </select>
                                        <label for="tipoIncentivo">Tipo de Incentivo</label>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="form-floating mb-3">
                                        <input type="number" class="form-control" id="monto" 
                                               placeholder="Monto" min="0" step="1000" required>
                                        <label for="monto">Monto ($)</label>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <div class="form-floating">
                                        <textarea class="form-control" id="observaciones" 
                                                  placeholder="Observaciones" style="height: 100px"></textarea>
                                        <label for="observaciones">Observaciones</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Cargar dashboard de incentivos
async function cargarIncentivosDashboard() {
    console.log('🎯 [DEBUG] Iniciando cargarIncentivosDashboard()...');
    
    try {
        // Cargar estadísticas y tipos en paralelo
        console.log('🌐 [DEBUG] Haciendo fetch a endpoints...');
        const [estadisticasResponse, tiposResponse] = await Promise.all([
            fetch('/api/incentivos/estadisticas'),
            fetch('/api/incentivos/tipos')
        ]);
        
        console.log('📡 [DEBUG] Respuestas recibidas, parseando JSON...');
        const stats = await estadisticasResponse.json();
        const tipos = await tiposResponse.json();
        
        console.log('📊 [DEBUG] Estadísticas incentivos:', stats);
        console.log('📋 [DEBUG] Tipos de incentivos:', tipos);
        
        // Verificar elementos HTML antes de actualizar
        console.log('🔍 [DEBUG] Verificando elementos HTML...');
        const totalTipos = document.getElementById('totalTiposIncentivos');
        const pendientes = document.getElementById('asignacionesPendientes');
        const automaticas = document.getElementById('asignacionesAutomaticas');
        const entregados = document.getElementById('totalEntregados');
        
        console.log('🔍 [DEBUG] Elementos encontrados:', {
            totalTipos: !!totalTipos,
            pendientes: !!pendientes,
            automaticas: !!automaticas,
            entregados: !!entregados
        });
        
        // Actualizar cards del dashboard con los IDs correctos
        if (totalTipos) {
            const valor = tipos.length || 0;
            console.log('✏️ [DEBUG] Actualizando totalTipos:', valor);
            totalTipos.textContent = valor;
        }
        
        if (pendientes) {
            const valor = stats.porEstado?.pendientes || 0;
            console.log('✏️ [DEBUG] Actualizando pendientes:', valor);
            pendientes.textContent = valor;
        }
        
        if (automaticas) {
            const valor = stats.porTipo?.automaticos || 0;
            console.log('✏️ [DEBUG] Actualizando automaticas:', valor);
            automaticas.textContent = valor;
        }
        
        if (entregados) {
            const valor = stats.porEstado?.entregados || 0;
            console.log('✏️ [DEBUG] Actualizando entregados:', valor);
            entregados.textContent = valor;
        }
        
        console.log('✅ [DEBUG] cargarIncentivosDashboard() completado exitosamente');
        
    } catch (error) {
        console.error('❌ [DEBUG] Error en cargarIncentivosDashboard():', error);
        console.error('❌ [DEBUG] Stack trace:', error.stack);
        
        // Valores por defecto
        const totalTipos = document.getElementById('totalTiposIncentivos');
        if (totalTipos) totalTipos.textContent = '0';
        
        const pendientes = document.getElementById('asignacionesPendientes');
        if (pendientes) pendientes.textContent = '0';
        
        const automaticas = document.getElementById('asignacionesAutomaticas');
        if (automaticas) automaticas.textContent = '0';
        
        const entregados = document.getElementById('totalEntregados');
        if (entregados) entregados.textContent = '0';
    }
}

// Función optimizada para actualizar solo los indicadores (sin logs)
async function actualizarIndicadoresIncentivos() {
    try {
        const [estadisticasResponse, tiposResponse] = await Promise.all([
            fetch('/api/incentivos/estadisticas'),
            fetch('/api/incentivos/tipos')
        ]);
        
        const stats = await estadisticasResponse.json();
        const tipos = await tiposResponse.json();
        
        // Actualizar indicadores sin logs para mejor rendimiento
        const totalTipos = document.getElementById('totalTiposIncentivos');
        if (totalTipos) totalTipos.textContent = tipos.length || 0;
        
        const pendientes = document.getElementById('asignacionesPendientes');
        if (pendientes) pendientes.textContent = stats.porEstado?.pendientes || 0;
        
        const automaticas = document.getElementById('asignacionesAutomaticas');
        if (automaticas) automaticas.textContent = stats.porTipo?.automaticos || 0;
        
        const entregados = document.getElementById('totalEntregados');
        if (entregados) entregados.textContent = stats.porEstado?.entregados || 0;
        
        console.log('🔄 Indicadores de incentivos actualizados automáticamente');
        
    } catch (error) {
        console.error('❌ Error actualizando indicadores:', error);
    }
}

// Cargar datos de la tabla de incentivos
async function cargarIncentivosDatos() {
    try {
        const response = await fetch('/api/incentivos');
        incentivosData = await response.json();
        
        console.log(`📋 ${incentivosData.length} incentivos cargados`);
        
        mostrarIncentivos();
        actualizarPaginacionIncentivos();
        
    } catch (error) {
        console.error('❌ Error cargando datos incentivos:', error);
        incentivosData = [];
        mostrarIncentivos();
    }
}

// Mostrar incentivos en la tabla
function mostrarIncentivos(filtrados = null) {
    const datos = filtrados || incentivosData;
    const tbody = document.getElementById('incentivosTableBody');
    
    if (!tbody) {
        console.error('❌ Tabla de incentivos no encontrada');
        return;
    }
    
    // Calcular paginación
    const startIndex = (currentPageIncentivos - 1) * itemsPerPageIncentivos;
    const endIndex = startIndex + itemsPerPageIncentivos;
    const paginatedData = datos.slice(startIndex, endIndex);
    console.log('📦 Incentivos a mostrar (paginatedData):', paginatedData);
    
    if (paginatedData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-inbox text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted mt-2">No hay incentivos registrados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = paginatedData.map(incentivo => {
        const estadoBadge = obtenerBadgeEstado(incentivo.estado);
        const fechaFormatted = new Date(incentivo.fechaAsignacion).toLocaleDateString();
        
        return `
            <tr>
                <td>
                    <div class="fw-bold">${incentivo.documentoEstudiante}</div>
                    <small class="text-muted">${incentivo.nombreEstudiante || 'N/A'}</small>
                </td>
                <td>
                    <div class="fw-bold">${incentivo.tipoIncentivo}</div>
                    <small class="text-muted">$${Number(incentivo.monto).toLocaleString()}</small>
                </td>
                <td>${estadoBadge}</td>
                <td>${fechaFormatted}</td>
                <td>
                    <small class="text-muted">${incentivo.observaciones || 'Sin observaciones'}</small>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        ${incentivo.estado === 'PENDIENTE' ? `
                            <button class="btn btn-success btn-sm" onclick="aprobarIncentivo('${incentivo.id}')" 
                                    title="Aprobar incentivo">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="rechazarIncentivo('${incentivo.id}')" 
                                    title="Rechazar incentivo">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                        ${incentivo.estado === 'APROBADO' ? `
                            <button class="btn btn-primary btn-sm" onclick="marcarComoEntregado('${incentivo.id}')" 
                                    title="Marcar como entregado">
                                <i class="fas fa-hand-holding-usd"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-info btn-sm" onclick="editarIncentivo('${incentivo.id}')" 
                                title="Editar incentivo">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarIncentivo('${incentivo.id}')" 
                                title="Eliminar incentivo">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Obtener badge según el estado
function obtenerBadgeEstado(estado) {
    const badges = {
        'PENDIENTE': '<span class="badge bg-warning">Pendiente</span>',
        'APROBADO': '<span class="badge bg-success">Aprobado</span>',
        'ENTREGADO': '<span class="badge bg-primary">Entregado</span>',
        'RECHAZADO': '<span class="badge bg-danger">Rechazado</span>'
    };
    return badges[estado] || '<span class="badge bg-secondary">Desconocido</span>';
}

// Paginación de incentivos
function actualizarPaginacionIncentivos() {
    const totalPages = Math.ceil(incentivosData.length / itemsPerPageIncentivos);
    const pagination = document.getElementById('paginationIncentivos');
    
    if (!pagination || totalPages <= 1) {
        if (pagination) pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Botón anterior
    paginationHTML += `
        <li class="page-item ${currentPageIncentivos === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaIncentivos(${currentPageIncentivos - 1})">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPageIncentivos - 2 && i <= currentPageIncentivos + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentPageIncentivos ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="cambiarPaginaIncentivos(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentPageIncentivos - 3 || i === currentPageIncentivos + 3) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    // Botón siguiente
    paginationHTML += `
        <li class="page-item ${currentPageIncentivos === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaIncentivos(${currentPageIncentivos + 1})">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Cambiar página de incentivos
function cambiarPaginaIncentivos(page) {
    const totalPages = Math.ceil(incentivosData.length / itemsPerPageIncentivos);
    if (page >= 1 && page <= totalPages) {
        currentPageIncentivos = page;
        mostrarIncentivos();
        actualizarPaginacionIncentivos();
    }
}

// Filtrar incentivos
function filtrarIncentivos() {
    const filtroEstado = document.getElementById('filtroEstadoIncentivos').value;
    const filtroTipo = document.getElementById('filtroTipoIncentivo').value;
    const busquedaTexto = document.getElementById('busquedaIncentivos').value.toLowerCase();
    
    let filtrados = incentivosData;
    
    // Filtro por estado
    if (filtroEstado) {
        filtrados = filtrados.filter(incentivo => incentivo.estado === filtroEstado);
    }
    
    // Filtro por tipo
    if (filtroTipo) {
        filtrados = filtrados.filter(incentivo => incentivo.tipoIncentivo === filtroTipo);
    }
    
    // Búsqueda por texto
    if (busquedaTexto) {
        filtrados = filtrados.filter(incentivo => 
            incentivo.documentoEstudiante.toLowerCase().includes(busquedaTexto) ||
            (incentivo.nombreEstudiante && incentivo.nombreEstudiante.toLowerCase().includes(busquedaTexto)) ||
            incentivo.tipoIncentivo.toLowerCase().includes(busquedaTexto)
        );
    }
    
    currentPageIncentivos = 1;
    mostrarIncentivos(filtrados);
    actualizarPaginacionIncentivos();
}

// Limpiar filtros de incentivos
function limpiarFiltrosIncentivos() {
    document.getElementById('filtroEstadoIncentivos').value = '';
    document.getElementById('filtroTipoIncentivo').value = '';
    document.getElementById('busquedaIncentivos').value = '';
    
    currentPageIncentivos = 1;
    mostrarIncentivos();
    actualizarPaginacionIncentivos();
}

// Crear nuevo incentivo
async function crearIncentivo() {
    const form = document.getElementById('formIncentivo');
    const formData = new FormData(form);
    
    const incentivo = {
        documentoEstudiante: formData.get('documentoEstudiante'),
        tipoIncentivo: formData.get('tipoIncentivo'),
        monto: parseFloat(formData.get('monto')),
        observaciones: formData.get('observaciones')
    };
    
    try {
        const response = await fetch('/api/incentivos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(incentivo)
        });
        
        if (response.ok) {
            mostrarExito('Incentivo creado exitosamente');
            bootstrap.Modal.getInstance(document.getElementById('modalIncentivo')).hide();
            form.reset();
            await cargarIncentivosDatos();
            await cargarIncentivosDashboard();
        } else {
            const error = await response.text();
            mostrarError('Error al crear incentivo: ' + error);
        }
    } catch (error) {
        console.error('❌ Error creando incentivo:', error);
        mostrarError('Error al crear incentivo');
    }
}

// Aprobar incentivo
async function aprobarIncentivo(id) {
    if (!confirm('¿Está seguro de aprobar este incentivo?')) return;
    
    try {
        const response = await fetch(`/api/incentivos/${id}/aprobar`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            mostrarExito('Incentivo aprobado exitosamente');
            await cargarIncentivosDatos();
            await cargarIncentivosDashboard();
        } else {
            mostrarError('Error al aprobar incentivo');
        }
    } catch (error) {
        console.error('❌ Error aprobando incentivo:', error);
        mostrarError('Error al aprobar incentivo');
    }
}

// Rechazar incentivo
async function rechazarIncentivo(id) {
    const observaciones = prompt('Motivo del rechazo (opcional):');
    if (observaciones === null) return; // Usuario canceló
    
    try {
        const response = await fetch(`/api/incentivos/${id}/rechazar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ observaciones })
        });
        
        if (response.ok) {
            mostrarExito('Incentivo rechazado');
            await cargarIncentivosDatos();
            await cargarIncentivosDashboard();
        } else {
            mostrarError('Error al rechazar incentivo');
        }
    } catch (error) {
        console.error('❌ Error rechazando incentivo:', error);
        mostrarError('Error al rechazar incentivo');
    }
}

// Marcar como entregado
async function marcarComoEntregado(id) {
    if (!confirm('¿Confirma que el incentivo ha sido entregado?')) return;
    
    try {
        const response = await fetch(`/api/incentivos/${id}/entregar`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            mostrarExito('Incentivo marcado como entregado');
            await cargarIncentivosDatos();
            await cargarIncentivosDashboard();
        } else {
            mostrarError('Error al marcar como entregado');
        }
    } catch (error) {
        console.error('❌ Error marcando como entregado:', error);
        mostrarError('Error al marcar como entregado');
    }
}

// Editar incentivo
async function editarIncentivo(id) {
    try {
        const response = await fetch(`/api/incentivos/${id}`);
        const incentivo = await response.json();
        
        // Llenar el formulario con los datos
        document.getElementById('documentoEstudiante').value = incentivo.documentoEstudiante;
        document.getElementById('tipoIncentivo').value = incentivo.tipoIncentivo;
        document.getElementById('monto').value = incentivo.monto;
        document.getElementById('observaciones').value = incentivo.observaciones || '';
        
        // Cambiar el modo del formulario a edición
        document.getElementById('formIncentivo').dataset.mode = 'edit';
        document.getElementById('formIncentivo').dataset.id = id;
        document.getElementById('modalIncentivoLabel').textContent = 'Editar Incentivo';
        
        // Mostrar el modal
        new bootstrap.Modal(document.getElementById('modalIncentivo')).show();
        
    } catch (error) {
        console.error('❌ Error cargando incentivo:', error);
        mostrarError('Error al cargar datos del incentivo');
    }
}

// Actualizar incentivo
async function actualizarIncentivo(id) {
    const form = document.getElementById('formIncentivo');
    const formData = new FormData(form);
    
    const incentivo = {
        documentoEstudiante: formData.get('documentoEstudiante'),
        tipoIncentivo: formData.get('tipoIncentivo'),
        monto: parseFloat(formData.get('monto')),
        observaciones: formData.get('observaciones')
    };
    
    try {
        const response = await fetch(`/api/incentivos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(incentivo)
        });
        
        if (response.ok) {
            mostrarExito('Incentivo actualizado exitosamente');
            bootstrap.Modal.getInstance(document.getElementById('modalIncentivo')).hide();
            form.reset();
            await cargarIncentivosDatos();
            await cargarIncentivosDashboard();
        } else {
            const error = await response.text();
            mostrarError('Error al actualizar incentivo: ' + error);
        }
    } catch (error) {
        console.error('❌ Error actualizando incentivo:', error);
        mostrarError('Error al actualizar incentivo');
    }
}

// Eliminar incentivo
async function eliminarIncentivo(id) {
    if (!confirm('¿Está seguro de eliminar este incentivo? Esta acción no se puede deshacer.')) return;
    
    try {
        console.log('🗑️ Eliminando incentivo con id:', id);
        const response = await fetch(`/api/incentivos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            mostrarExito('Incentivo eliminado exitosamente');
            await cargarIncentivosDatos();
            await cargarIncentivosDashboard();
            // También recargar gestión de estudiantes por si el cambio afecta la vista
            if (document.getElementById('estudiantes-section') && document.getElementById('estudiantes-section').classList.contains('active')) {
                await cargarEstudiantes();
            }
        } else {
            mostrarError('Error al eliminar incentivo');
        }
    } catch (error) {
        console.error('❌ Error eliminando incentivo:', error);
        mostrarError('Error al eliminar incentivo');
    }
}

// Preparar modal para nuevo incentivo
function prepararNuevoIncentivo() {
    document.getElementById('formIncentivo').reset();
    document.getElementById('formIncentivo').dataset.mode = 'create';
    document.getElementById('modalIncentivoLabel').textContent = 'Nuevo Incentivo';
}

// Manejar envío del formulario de incentivo
async function manejarFormularioIncentivo(event) {
    event.preventDefault();
    
    const form = event.target;
    const mode = form.dataset.mode || 'create';
    
    if (mode === 'edit') {
        const id = form.dataset.id;
        await actualizarIncentivo(id);
    } else {
        await crearIncentivo();
    }
}

// Event listeners para incentivos
document.addEventListener('DOMContentLoaded', function() {
    // Formulario de incentivo
    const formIncentivo = document.getElementById('formIncentivo');
    if (formIncentivo) {
        formIncentivo.addEventListener('submit', manejarFormularioIncentivo);
    }
    
    // Filtros de incentivos
    const filtroEstado = document.getElementById('filtroEstadoIncentivos');
    const filtroTipo = document.getElementById('filtroTipoIncentivo');
    const busqueda = document.getElementById('busquedaIncentivos');
    
    if (filtroEstado) filtroEstado.addEventListener('change', filtrarIncentivos);
    if (filtroTipo) filtroTipo.addEventListener('change', filtrarIncentivos);
    if (busqueda) busqueda.addEventListener('input', filtrarIncentivos);
});

// Funciones de utilidad para mostrar mensajes
function mostrarError(mensaje) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function mostrarExito(mensaje) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

function mostrarMensaje(mensaje, tipo = 'info') {
    if (tipo === 'error') {
        mostrarError(mensaje);
    } else if (tipo === 'success') {
        mostrarExito(mensaje);
    } else {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            <i class="fas fa-info-circle me-2"></i>${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 4000);
    }
}

console.log('🎯 Funciones de incentivos cargadas correctamente');

// Exportar incentivos a PDF
function exportarIncentivosPDF() {
    const incentivos = incentivosData; // Usar todos los datos o filtrados según necesidad
    
    const ventanaReporte = window.open('', '_blank');
    ventanaReporte.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte de Incentivos</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                .header { text-align: center; margin-bottom: 30px; }
                .table { font-size: 11px; }
                @media print { .btn { display: none; } }
            </style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>
        </head>
        <body>
            <div class="header">
                <h2>Reporte de Incentivos SABER PRO</h2>
                <h4>Unidades Tecnológicas de Santander</h4>
                <p>Fecha de generación: ${new Date().toLocaleDateString('es-CO')}</p>
                <p>Total de incentivos: ${incentivos.length}</p>
            </div>
            
            <table class="table table-bordered table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Documento</th>
                        <th>Tipo</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${incentivos.map(incentivo => `
                        <tr>
                            <td>${incentivo.documentoEstudiante}</td>
                            <td>${incentivo.tipoIncentivo}</td>
                            <td>$${Number(incentivo.monto).toLocaleString()}</td>
                            <td>${incentivo.estado}</td>
                            <td>${new Date(incentivo.fechaAsignacion).toLocaleDateString()}</td>
                            <td>${incentivo.observaciones || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="text-center mt-4">
                <button class="btn btn-primary" onclick="descargarPDF()">Descargar PDF</button>
                <button class="btn btn-secondary ms-2" onclick="window.print()">Imprimir</button>
                <button class="btn btn-secondary ms-2" onclick="window.close()">Cerrar</button>
            </div>
            
            <script>
                function descargarPDF() {
                    const elemento = document.body;
                    const opt = {
                        margin: 1,
                        filename: 'reporte_incentivos.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                    };
                    html2pdf().set(opt).from(elemento).save();
                }
            </script>
        </body>
        </html>
    `);
}

// Exportar incentivos a Excel
function exportarIncentivosExcel() {
    const incentivos = incentivosData;
    
    // Crear datos para Excel
    const datos = [
        ['Documento', 'Tipo Incentivo', 'Monto', 'Estado', 'Fecha Asignación', 'Observaciones']
    ];
    
    incentivos.forEach(incentivo => {
        datos.push([
            incentivo.documentoEstudiante,
            incentivo.tipoIncentivo,
            incentivo.monto || 0,
            incentivo.estado,
            new Date(incentivo.fechaAsignacion).toLocaleDateString(),
            incentivo.observaciones || ''
        ]);
    });
    
    // Si existe SheetJS, crear Excel real
    if (typeof XLSX !== 'undefined') {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datos);
        XLSX.utils.book_append_sheet(wb, ws, 'Incentivos');
        XLSX.writeFile(wb, 'reporte_incentivos.xlsx');
    } else {
        // Fallback a CSV
        const csvContent = datos.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\\n');
        
        const BOM = '\\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'reporte_incentivos.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ===========================================================================
// NUEVA ARQUITECTURA DE INCENTIVOS CON PESTAÑAS
// ===========================================================================

// Mostrar la nueva interfaz con pestañas para la NUEVA ARQUITECTURA
function mostrarInterfazIncentivosPestañas() {
    const incentivoSection = document.getElementById('incentivos-section');
    if (!incentivoSection) {
        console.error('❌ No se encuentra la sección incentivos-section');
        return;
    }

    incentivoSection.innerHTML = `
        <div class="container-fluid">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h2><i class="fas fa-trophy me-2 text-warning"></i>Sistema de Incentivos SABER PRO</h2>
                        <div class="btn-group" role="group">
                            <button class="btn btn-success" onclick="mostrarModalNuevoTipo()">
                                <i class="fas fa-plus me-2"></i>Nuevo Tipo de Incentivo
                            </button>
                            <button class="btn btn-info" onclick="reevaluarTodosEstudiantes()">
                                <i class="fas fa-sync me-2"></i>Reevaluar Estudiantes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dashboard de Estadísticas -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body text-center">
                            <i class="fas fa-cog fa-2x mb-2"></i>
                            <h4 id="totalTiposIncentivos">0</h4>
                            <p class="mb-0">Tipos Configurados</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body text-center">
                            <i class="fas fa-clock fa-2x mb-2"></i>
                            <h4 id="asignacionesPendientes">0</h4>
                            <p class="mb-0">Asignaciones Pendientes</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <i class="fas fa-robot fa-2x mb-2"></i>
                            <h4 id="asignacionesAutomaticas">0</h4>
                            <p class="mb-0">Asignaciones Automáticas</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <i class="fas fa-hand-holding-usd fa-2x mb-2"></i>
                            <h4 id="totalEntregados">0</h4>
                            <p class="mb-0">Incentivos Entregados</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pestañas de navegación -->
            <ul class="nav nav-tabs mb-4" id="incentivosTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="tipos-tab" data-bs-toggle="tab" 
                            data-bs-target="#tipos-panel" type="button" role="tab">
                        <i class="fas fa-cog me-2"></i>Configuración de Tipos
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="asignaciones-tab" data-bs-toggle="tab" 
                            data-bs-target="#asignaciones-panel" type="button" role="tab">
                        <i class="fas fa-list me-2"></i>Asignaciones Automáticas
                    </button>
                </li>
            </ul>

            <!-- Contenido de las pestañas -->
            <div class="tab-content">
                <!-- Panel de Configuración de Tipos -->
                <div class="tab-pane fade show active" id="tipos-panel" role="tabpanel">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">
                                <i class="fas fa-cog me-2"></i>Tipos de Incentivos Configurados
                            </h5>
                            <button class="btn btn-success" onclick="crearNuevoTipoIncentivo()">
                                <i class="fas fa-plus me-2"></i>Nuevo Tipo
                            </button>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>¿Cómo funciona?</strong> Configure aquí los tipos de incentivos y sus criterios. 
                                El sistema evaluará automáticamente a todos los estudiantes y asignará los incentivos correspondientes.
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Tipo de Incentivo</th>
                                            <th>Puntaje Mínimo</th>
                                            <th>Monto</th>
                                            <th>Estado</th>
                                            <th>Beneficios</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tablaTiposIncentivos">
                                        <tr><td colspan="6" class="text-center py-4">Cargando tipos de incentivos...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Panel de Asignaciones Automáticas -->
                <div class="tab-pane fade" id="asignaciones-panel" role="tabpanel">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">
                                <i class="fas fa-robot me-2"></i>Asignaciones Automáticas de Incentivos
                            </h5>
                            <div class="d-flex gap-2">
                                <button class="btn btn-warning btn-sm" onclick="limpiarYRegenerarAsignaciones()" 
                                        title="Eliminar todas las asignaciones automáticas y regenerar desde estudiantes actuales">
                                    <i class="fas fa-sync-alt me-1"></i>Limpiar y Regenerar
                                </button>
                                <select id="filtroEstadoAsignaciones" class="form-select form-select-sm" onchange="filtrarAsignaciones()">
                                    <option value="">Todos los estados</option>
                                    <option value="PENDIENTE">Pendientes</option>
                                    <option value="APROBADO">Aprobados</option>
                                    <option value="ENTREGADO">Entregados</option>
                                    <option value="RECHAZADO">Rechazados</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-success">
                                <i class="fas fa-magic me-2"></i>
                                <strong>Evaluación Automática:</strong> Estas asignaciones fueron generadas automáticamente 
                                basándose en los puntajes SABER PRO y los tipos de incentivos configurados.
                            </div>
                            <div id="tablaAsignacionesContainer">
                                <div class="text-center py-4">
                                    <i class="fas fa-spinner fa-spin me-2"></i>
                                    Cargando asignaciones automáticas...
                                </div>
                            </div>
                            <!-- Paginación -->
                            <nav class="mt-3">
                                <ul class="pagination justify-content-center" id="paginacionAsignaciones">
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para Nuevo Tipo de Incentivo -->
        <div class="modal fade" id="modalNuevoTipo" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-plus me-2"></i>Configurar Nuevo Tipo de Incentivo
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoTipo">
                            <div class="row">
                                <div class="col-md-6">
                                    <label class="form-label">Nombre del Incentivo <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="nombreTipo" 
                                           placeholder="Ej: Beca 100% Derechos de Grado" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Puntaje Mínimo SABER PRO <span class="text-danger">*</span></label>
                                    <input type="number" class="form-control" id="puntajeMinimo" 
                                           placeholder="Ej: 241" min="180" max="300" required>
                                    <div class="form-text">Puntaje mínimo para ser elegible (180-300)</div>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <label class="form-label">Monto Económico</label>
                                    <input type="number" class="form-control" id="montoTipo" 
                                           placeholder="Ej: 500000" min="0" step="1000">
                                    <div class="form-text">Monto en pesos (opcional)</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Estado</label>
                                    <select class="form-select" id="activoTipo">
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    <label class="form-label">Descripción</label>
                                    <textarea class="form-control" id="descripcionTipo" rows="2" 
                                              placeholder="Descripción breve del incentivo"></textarea>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    <label class="form-label">Beneficios Detallados</label>
                                    <textarea class="form-control" id="beneficiosTipo" rows="3" 
                                              placeholder="Lista detallada de beneficios que incluye este incentivo"></textarea>
                                    <div class="form-text">Ejemplo: "Exoneración completa derechos de grado, Seminario con nota 5.0, Ceremonia de reconocimiento"</div>
                                </div>
                            </div>
                            <div class="alert alert-warning mt-3">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                <strong>Importante:</strong> Una vez creado este tipo, el sistema evaluará automáticamente 
                                a todos los estudiantes y asignará este incentivo a quienes cumplan el criterio de puntaje.
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-success" onclick="guardarNuevoTipoIncentivo()">
                            <i class="fas fa-save me-2"></i>Crear y Evaluar Automáticamente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Funciones para la nueva arquitectura de incentivos
async function cargarTiposIncentivos() {
    console.log('📋 Cargando tipos de incentivos configurados');
    try {
        const response = await fetch('/api/tipos-incentivos');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tipos = await response.json();
        console.log('✅ Tipos de incentivos obtenidos:', tipos);
        
        actualizarTablaTiposIncentivos(tipos);
        
    } catch (error) {
        console.error('❌ Error cargando tipos de incentivos:', error);
        const tabla = document.getElementById('tablaTiposIncentivos');
        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger py-4">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error al cargar los tipos de incentivos
                    </td>
                </tr>
            `;
        }
    }
}

function actualizarTablaTiposIncentivos(tipos) {
    const tabla = document.getElementById('tablaTiposIncentivos');
    if (!tabla) return;
    
    if (!tipos || tipos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay tipos de incentivos configurados. 
                    <a href="#" onclick="mostrarModalNuevoTipo()" class="btn btn-link p-0">Crear el primero</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tabla.innerHTML = tipos.map(tipo => `
        <tr>
            <td>
                <div class="fw-bold">${tipo.nombre}</div>
                <small class="text-muted">${tipo.descripcion || 'Sin descripción'}</small>
            </td>
            <td>
                <span class="badge bg-info">${tipo.puntajeMinimo} puntos</span>
            </td>
            <td>
                ${tipo.monto ? `<span class="fw-bold text-success">$${tipo.monto.toLocaleString()}</span>` : '<span class="text-muted">Sin monto</span>'}
            </td>
            <td>
                <span class="badge ${tipo.activo ? 'bg-success' : 'bg-secondary'}">
                    ${tipo.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <small class="text-muted">${tipo.beneficios || 'Sin beneficios especificados'}</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editarTipoIncentivo('${tipo.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-${tipo.activo ? 'warning' : 'success'}" 
                            onclick="toggleTipoIncentivo('${tipo.id}', ${tipo.activo})" 
                            title="${tipo.activo ? 'Desactivar' : 'Activar'}">
                        <i class="fas fa-${tipo.activo ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="eliminarTipoIncentivo('${tipo.id}', '${tipo.nombre}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function cargarEstadisticasIncentivos() {
    console.log('📊 Cargando estadísticas de incentivos');
    try {
        const [estadisticasResponse, distribucionResponse] = await Promise.all([
            fetch('/api/incentivos/estadisticas'),
            fetch('/api/incentivos/distribucion-tipos')
        ]);
        
        if (!estadisticasResponse.ok || !distribucionResponse.ok) {
            throw new Error('Error al cargar datos para estadísticas');
        }
        
        const estadisticas = await estadisticasResponse.json();
        const distribucion = await distribucionResponse.json();
        
        console.log('📊 Estadísticas obtenidas:', estadisticas);
        console.log('📊 Distribución obtenida:', distribucion);
        
        // Actualizar gráfico de distribución por estado
        actualizarGraficoEstados(estadisticas.porEstado);
        
        // Actualizar gráfico de incentivos por tipo
        actualizarGraficoTipos(distribucion.distribucion);
        
        console.log('✅ Estadísticas actualizadas');
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        // Mostrar error en los contenedores de gráficos
        const contenedorEstados = document.getElementById('graficoEstados');
        const contenedorTipos = document.getElementById('graficoTipos');
        
        if (contenedorEstados) {
            contenedorEstados.innerHTML = `
                <div class="alert alert-warning text-center">
                    <i class="fas fa-chart-pie me-2"></i>
                    No se pudieron cargar las estadísticas por estado
                </div>
            `;
        }
        
        if (contenedorTipos) {
            contenedorTipos.innerHTML = `
                <div class="alert alert-warning text-center">
                    <i class="fas fa-chart-bar me-2"></i>
                    No se pudieron cargar las estadísticas por tipo
                </div>
            `;
        }
    }
}

function actualizarGraficoEstados(porEstado) {
    const contenedor = document.getElementById('graficoEstados');
    if (!contenedor) return;
    
    if (!porEstado || Object.keys(porEstado).length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle me-2"></i>
                No hay asignaciones para mostrar estadísticas
            </div>
        `;
        return;
    }
    
    const colores = {
        'pendientes': '#ffc107',
        'aprobados': '#28a745', 
        'entregados': '#17a2b8',
        'rechazados': '#dc3545'
    };
    
    const etiquetas = {
        'pendientes': 'Pendientes',
        'aprobados': 'Aprobados',
        'entregados': 'Entregados', 
        'rechazados': 'Rechazados'
    };
    
    const total = Object.values(porEstado).reduce((sum, val) => sum + val, 0);
    
    const html = `
        <div class="estadisticas-container">
            ${Object.entries(porEstado).map(([estado, cantidad]) => {
                const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
                return `
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <small class="fw-bold">${etiquetas[estado] || estado}</small>
                            <small class="text-muted">${cantidad} (${porcentaje}%)</small>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar" 
                                 style="width: ${porcentaje}%; background-color: ${colores[estado] || '#6c757d'}"
                                 role="progressbar">
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    contenedor.innerHTML = html;
}

function actualizarGraficoTipos(distribucion) {
    const contenedor = document.getElementById('graficoTipos');
    if (!contenedor) return;
    
    if (!distribucion || Object.keys(distribucion).length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle me-2"></i>
                No hay asignaciones para mostrar por tipo
            </div>
        `;
        return;
    }
    
    const colores = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997'];
    const total = Object.values(distribucion).reduce((sum, val) => sum + val, 0);
    
    const html = `
        <div class="estadisticas-container">
            ${Object.entries(distribucion).map(([tipo, cantidad], index) => {
                const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
                const color = colores[index % colores.length];
                return `
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <small class="fw-bold" style="font-size: 0.85rem;">${tipo}</small>
                            <small class="text-muted">${cantidad} (${porcentaje}%)</small>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar" 
                                 style="width: ${porcentaje}%; background-color: ${color}"
                                 role="progressbar">
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    contenedor.innerHTML = html;
}

// ===== FUNCIONES PARA CREAR TIPO INCENTIVO =====

async function crearNuevoTipoIncentivo() {
    try {
        const { value: formValues } = await Swal.fire({
            title: '➕ Crear Nuevo Tipo de Incentivo',
            html: `
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label class="form-label">Nombre del Incentivo *</label>
                            <input type="text" id="nuevoNombre" class="form-control" placeholder="Ej: Beca Excelencia" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label class="form-label">Puntaje Mínimo *</label>
                            <input type="number" id="nuevoPuntajeMinimo" class="form-control" placeholder="180" min="0" max="300" required>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label class="form-label">Monto (COP)</label>
                    <input type="number" id="nuevoMonto" class="form-control" placeholder="500000" min="0" step="1000">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea id="nuevaDescripcion" class="form-control" rows="2" placeholder="Descripción del incentivo..."></textarea>
                </div>
                <div class="form-group mb-3">
                    <label class="form-label">Beneficios Incluidos</label>
                    <textarea id="nuevosBeneficios" class="form-control" rows="3" placeholder="- Beneficio 1&#10;- Beneficio 2&#10;- Beneficio 3"></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '💾 Crear Tipo',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#28a745',
            preConfirm: () => {
                const nombre = document.getElementById('nuevoNombre').value;
                const descripcion = document.getElementById('nuevaDescripcion').value;
                const puntajeMinimo = parseInt(document.getElementById('nuevoPuntajeMinimo').value);
                const monto = parseFloat(document.getElementById('nuevoMonto').value) || 0;
                const beneficios = document.getElementById('nuevosBeneficios').value;

                if (!nombre || !puntajeMinimo) {
                    Swal.showValidationMessage('Nombre y puntaje mínimo son obligatorios');
                    return false;
                }

                return { nombre, descripcion, puntajeMinimo, monto, beneficios, activo: true };
            }
        });

        if (formValues) {
            const response = await fetch('/api/tipos-incentivos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formValues)
            });

            if (!response.ok) {
                throw new Error('Error al crear tipo de incentivo');
            }

            await Swal.fire({
                icon: 'success',
                title: '✅ Tipo Creado',
                text: 'El nuevo tipo de incentivo ha sido creado exitosamente',
                timer: 2000,
                showConfirmButton: false
            });

            await cargarTiposIncentivos();
        }
        
    } catch (error) {
        console.error('❌ Error creando tipo:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al crear',
            text: 'No se pudo crear el tipo de incentivo'
        });
    }
}

async function reevaluarTodosEstudiantes() {
    try {
        console.log('🔄 Iniciando reevaluación de todos los estudiantes');
        
        Swal.fire({
            title: 'Reevaluando estudiantes...',
            text: 'Por favor espere mientras se procesan los datos',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const response = await fetch('/api/incentivos/reevaluar-todos', {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Reevaluación completada:', resultado);
        
        Swal.fire({
            icon: 'success',
            title: 'Reevaluación completada',
            html: `
                <p>Se procesaron <strong>${resultado.estudiantesReevaluados || 'N/A'}</strong> estudiantes</p>
                <p>Nuevas asignaciones: <strong>${resultado.nuevasAsignaciones || '0'}</strong></p>
                <p><small>${resultado.mensaje || 'Proceso completado exitosamente'}</small></p>
            `,
            timer: 4000
        });
        
        // Recargar datos incluyendo la tabla de estudiantes para mostrar nuevos incentivos
        console.log('🔄 Recargando datos después de reevaluación...');
        await Promise.all([
            cargarEstadisticasIncentivos(),
            cargarAsignacionesAutomaticas(),
            cargarEstudiantes(), // ← Recargar tabla de estudiantes para mostrar nuevos incentivos
            actualizarIndicadoresIncentivos() // ← Actualizar indicadores automáticamente
        ]);
        console.log('✅ Datos recargados exitosamente');
        
        // Mostrar notificación adicional sobre la actualización de datos
        if (resultado.nuevasAsignaciones > 0) {
            console.log('🎉 Nuevos incentivos disponibles en la tabla de estudiantes');
            // Crear una pequeña notificación visual
            const toast = document.createElement('div');
            toast.className = 'alert alert-info alert-dismissible fade show position-fixed';
            toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
            toast.innerHTML = `
                <strong>¡Datos actualizados!</strong> 
                La tabla de estudiantes ahora muestra ${resultado.nuevasAsignaciones} nuevos incentivos asignados.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(toast);
            
            // Auto-remover después de 5 segundos
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 5000);
        }
        
    } catch (error) {
        console.error('❌ Error en reevaluación:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error en reevaluación',
            text: 'No se pudo completar la reevaluación de estudiantes'
        });
    }
}

// 🆕 Nueva función para reevaluar un estudiante específico
async function reevaluarEstudianteEspecifico(documento) {
    try {
        console.log('🔄 Iniciando reevaluación individual del estudiante:', documento);
        
        const response = await fetch(`/api/incentivos/reevaluar-estudiante/${documento}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Reevaluación individual completada:', resultado);
        
        // Mostrar mensaje específico si hubo cambios
        if (resultado.nuevasAsignaciones > 0) {
            console.log(`🎯 Estudiante ${resultado.estudianteNombre} reevaluado: ${resultado.nuevasAsignaciones} nuevas asignaciones`);
            
            // Recargar datos incluyendo indicadores
            await Promise.all([
                cargarEstadisticasIncentivos(),
                cargarAsignacionesAutomaticas(),
                cargarEstudiantes(),
                actualizarIndicadoresIncentivos()
            ]);
            
            // Mostrar notificación de éxito
            const toast = document.createElement('div');
            toast.className = 'alert alert-success alert-dismissible fade show position-fixed';
            toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
            toast.innerHTML = `
                <strong>¡Incentivos actualizados!</strong><br>
                ${resultado.estudianteNombre} ahora tiene ${resultado.nuevasAsignaciones} nuevo(s) incentivo(s) disponible(s).
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 6000);
        } else {
            console.log(`ℹ️ Estudiante ${resultado.estudianteNombre} reevaluado: sin cambios en incentivos`);
        }
        
        return resultado;
        
    } catch (error) {
        console.error('❌ Error en reevaluación individual:', error);
        return null;
    }
}

async function aprobarAsignacion(asignacionId) {
    try {
        console.log('✅ Aprobando asignación con ID:', asignacionId);
        
        const response = await fetch(`/api/incentivos/${asignacionId}/aprobar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aprobadoPor: 'Coordinador',
                observaciones: 'Aprobado automáticamente desde la interfaz'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        Swal.fire({
            icon: 'success',
            title: 'Asignación aprobada',
            timer: 1500
        });
        
        await cargarAsignacionesAutomaticas();
        await cargarEstadisticasIncentivos();
        await actualizarIndicadoresIncentivos(); // ← Actualizar indicadores automáticamente
        
    } catch (error) {
        console.error('❌ Error aprobando asignación:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al aprobar',
            text: 'No se pudo aprobar la asignación'
        });
    }
}

async function rechazarAsignacion(asignacionId) {
    const { value: observaciones } = await Swal.fire({
        title: 'Rechazar asignación',
        input: 'textarea',
        inputLabel: 'Motivo del rechazo (opcional)',
        inputPlaceholder: 'Escriba el motivo del rechazo...',
        showCancelButton: true,
        confirmButtonText: 'Rechazar',
        cancelButtonText: 'Cancelar'
    });
    
    if (observaciones !== undefined) {
        try {
            console.log('❌ Rechazando asignación con ID:', asignacionId);
            
            const response = await fetch(`/api/incentivos/${asignacionId}/rechazar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ observaciones: observaciones })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Asignación rechazada',
                timer: 1500
            });
            
            await cargarAsignacionesAutomaticas();
            await cargarEstadisticasIncentivos();
            await actualizarIndicadoresIncentivos(); // ← Actualizar indicadores automáticamente
            
        } catch (error) {
            console.error('❌ Error rechazando asignación:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al rechazar',
                text: 'No se pudo rechazar la asignación'
            });
        }
    }
}

async function entregarAsignacion(asignacionId) {
    try {
        console.log('✅ Entregando asignación con ID:', asignacionId);
        
        const response = await fetch(`/api/incentivos/${asignacionId}/entregar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entregadoPor: 'Coordinador',
                observaciones: 'Incentivo entregado exitosamente'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        Swal.fire({
            icon: 'success',
            title: 'Incentivo entregado',
            text: 'La asignación ha sido marcada como entregada',
            timer: 1500
        });
        
        await cargarAsignacionesAutomaticas();
        await cargarEstadisticasIncentivos();
        await actualizarIndicadoresIncentivos(); // ← Actualizar indicadores automáticamente
        
    } catch (error) {
        console.error('❌ Error entregando incentivo:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al entregar',
            text: 'No se pudo marcar como entregado'
        });
    }
}

async function eliminarAsignacion(asignacionId) {
    // Log inmediato para verificar si se llama la función
    alert('¡Función eliminarAsignacion llamada con ID: ' + asignacionId);
    console.log('🚨 FUNCIÓN eliminarAsignacion LLAMADA con ID:', asignacionId);
    console.log('🚨 Tipo de ID:', typeof asignacionId);
    
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará la asignación de incentivo permanentemente',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    console.log('🚨 Resultado del SweetAlert:', result);

    if (result.isConfirmed) {
        try {
            console.log('🗑️ Eliminando asignación con ID:', asignacionId);
            
            const response = await fetch(`/api/incentivos/${asignacionId}`, {
                method: 'DELETE'
            });
            
            console.log('📥 Respuesta del servidor:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Asignación eliminada',
                text: 'La asignación ha sido eliminada correctamente',
                timer: 1500
            });
            
            // Recargar las asignaciones y estadísticas
            await cargarAsignacionesAutomaticas();
            await cargarEstadisticasIncentivos();
            await actualizarIndicadoresIncentivos(); // ← Actualizar indicadores automáticamente
            
        } catch (error) {
            console.error('❌ Error eliminando asignación:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al eliminar',
                text: 'No se pudo eliminar la asignación'
            });
        }
    }
}

// Alias para compatibilidad
async function marcarEntregado(asignacionId) {
    return await entregarAsignacion(asignacionId);
}

async function verDetalleAsignacion(asignacionId) {
    // Log inmediato para verificar si se llama la función
    alert('¡Función verDetalleAsignacion llamada con ID: ' + asignacionId);
    console.log('👁️ Viendo detalle de asignación:', asignacionId);
    try {
        const response = await fetch(`/api/incentivos/${asignacionId}`);
        if (!response.ok) {
            throw new Error('Error al obtener detalle de asignación');
        }
        
        const asignacion = await response.json();
        
        Swal.fire({
            title: '📋 Detalle de Asignación',
            html: `
                <div class="text-start">
                    <p><strong>Estudiante:</strong> ${asignacion.nombreCompleto || 'Sin nombre'}</p>
                    <p><strong>Documento:</strong> ${asignacion.documentoEstudiante}</p>
                    <p><strong>Puntaje:</strong> ${asignacion.puntajeObtenido} pts</p>
                    <p><strong>Incentivo:</strong> ${asignacion.tipoIncentivo?.nombre || 'Sin tipo'}</p>
                    <p><strong>Monto:</strong> $${formatearMonto(asignacion.tipoIncentivo?.monto || 0)}</p>
                    <p><strong>Estado:</strong> <span class="badge ${obtenerClaseEstado(asignacion.estado)}">${asignacion.estado}</span></p>
                    <p><strong>Fecha:</strong> ${formatearFecha(asignacion.fechaAsignacion)}</p>
                    ${asignacion.observaciones ? `<p><strong>Observaciones:</strong> ${asignacion.observaciones}</p>` : ''}
                </div>
            `,
            width: 600,
            confirmButtonText: 'Cerrar'
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo detalle:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo obtener el detalle de la asignación'
        });
    }
}

// ===== FUNCIONES PARA TIPOS DE INCENTIVOS =====

async function editarTipoIncentivo(id) {
    try {
        console.log('🔧 Editando tipo de incentivo:', id);
        
        // Obtener los datos del tipo de incentivo
        const response = await fetch(`/api/tipos-incentivos/${id}`);
        if (!response.ok) {
            throw new Error('Error al obtener tipo de incentivo');
        }
        
        const tipo = await response.json();
        
        // Mostrar modal de edición con datos precargados
        const { value: formValues } = await Swal.fire({
            title: '✏️ Editar Tipo de Incentivo',
            html: `
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label class="form-label">Nombre del Incentivo</label>
                            <input type="text" id="editNombre" class="form-control" value="${tipo.nombre}" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label class="form-label">Puntaje Mínimo</label>
                            <input type="number" id="editPuntajeMinimo" class="form-control" value="${tipo.puntajeMinimo}" min="0" max="300" required>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label class="form-label">Monto (COP)</label>
                            <input type="number" id="editMonto" class="form-control" value="${tipo.monto}" min="0" step="1000">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label class="form-label">Estado</label>
                            <select id="editActivo" class="form-control">
                                <option value="true" ${tipo.activo ? 'selected' : ''}>Activo</option>
                                <option value="false" ${!tipo.activo ? 'selected' : ''}>Inactivo</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea id="editDescripcion" class="form-control" rows="2" placeholder="Descripción del incentivo...">${tipo.descripcion}</textarea>
                </div>
                <div class="form-group mb-3">
                    <label class="form-label">Beneficios Incluidos</label>
                    <textarea id="editBeneficios" class="form-control" rows="3" placeholder="- Beneficio 1&#10;- Beneficio 2&#10;- Beneficio 3">${tipo.beneficios}</textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '💾 Guardar Cambios',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#28a745',
            preConfirm: () => {
                const nombre = document.getElementById('editNombre').value;
                const descripcion = document.getElementById('editDescripcion').value;
                const puntajeMinimo = parseInt(document.getElementById('editPuntajeMinimo').value);
                const monto = parseFloat(document.getElementById('editMonto').value) || 0;
                const beneficios = document.getElementById('editBeneficios').value;
                const activo = document.getElementById('editActivo').value === 'true';

                if (!nombre || !puntajeMinimo) {
                    Swal.showValidationMessage('Nombre y puntaje mínimo son obligatorios');
                    return false;
                }

                return { nombre, descripcion, puntajeMinimo, monto, beneficios, activo };
            }
        });

        if (formValues) {
            // Enviar actualización al servidor
            const updateResponse = await fetch(`/api/tipos-incentivos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formValues)
            });

            if (!updateResponse.ok) {
                throw new Error('Error al actualizar tipo de incentivo');
            }

            // Mostrar confirmación y recargar
            await Swal.fire({
                icon: 'success',
                title: '✅ Tipo Actualizado',
                text: 'El tipo de incentivo ha sido actualizado exitosamente',
                timer: 2000,
                showConfirmButton: false
            });

            // Recargar la tabla
            await cargarTiposIncentivos();
        }
        
    } catch (error) {
        console.error('❌ Error editando tipo:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al editar',
            text: 'No se pudo actualizar el tipo de incentivo'
        });
    }
}

async function toggleTipoIncentivo(id, estadoActual) {
    try {
        const nuevoEstado = !estadoActual;
        const accion = nuevoEstado ? 'activar' : 'desactivar';
        
        const confirmResult = await Swal.fire({
            title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} tipo de incentivo?`,
            text: `¿Estás seguro de que quieres ${accion} este tipo de incentivo?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `✅ Sí, ${accion}`,
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: nuevoEstado ? '#28a745' : '#ffc107'
        });

        if (confirmResult.isConfirmed) {
            const response = await fetch(`/api/tipos-incentivos/${id}/toggle-activo`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Error al cambiar estado');
            }

            await Swal.fire({
                icon: 'success',
                title: `✅ Estado Cambiado`,
                text: `El tipo de incentivo ha sido ${nuevoEstado ? 'activado' : 'desactivado'}`,
                timer: 2000,
                showConfirmButton: false
            });

            await cargarTiposIncentivos();
        }
    } catch (error) {
        console.error('❌ Error cambiando estado:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cambiar el estado del tipo de incentivo'
        });
    }
}

async function eliminarTipoIncentivo(id, nombre) {
    try {
        const confirmResult = await Swal.fire({
            title: '⚠️ ¿Eliminar Tipo de Incentivo?',
            html: `
                <p>¿Estás seguro de que quieres eliminar el tipo:</p>
                <strong>"${nombre}"</strong>
                <br><br>
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Esta acción no se puede deshacer y puede afectar asignaciones existentes.
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '🗑️ Sí, eliminar',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#dc3545'
        });

        if (confirmResult.isConfirmed) {
            const response = await fetch(`/api/tipos-incentivos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar tipo de incentivo');
            }

            await Swal.fire({
                icon: 'success',
                title: '✅ Tipo Eliminado',
                text: 'El tipo de incentivo ha sido eliminado exitosamente',
                timer: 2000,
                showConfirmButton: false
            });

            await cargarTiposIncentivos();
        }
    } catch (error) {
        console.error('❌ Error eliminando tipo:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: 'No se pudo eliminar el tipo de incentivo'
        });
    }
}

async function crearNuevoTipoIncentivo() {
    try {
        const { value: formValues } = await Swal.fire({
            title: '➕ Crear Nuevo Tipo de Incentivo',
            html: `
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label class="form-label">Nombre del Incentivo *</label>
                            <input type="text" id="nuevoNombre" class="form-control" placeholder="Ej: Beca Excelencia" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label class="form-label">Puntaje Mínimo *</label>
                            <input type="number" id="nuevoPuntajeMinimo" class="form-control" placeholder="180" min="0" max="300" required>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label class="form-label">Monto (COP)</label>
                    <input type="number" id="nuevoMonto" class="form-control" placeholder="500000" min="0" step="1000">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea id="nuevaDescripcion" class="form-control" rows="2" placeholder="Descripción del incentivo..."></textarea>
                </div>
                <div class="form-group mb-3">
                    <label class="form-label">Beneficios Incluidos</label>
                    <textarea id="nuevosBeneficios" class="form-control" rows="3" placeholder="- Beneficio 1&#10;- Beneficio 2&#10;- Beneficio 3"></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '💾 Crear Tipo',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#28a745',
            preConfirm: () => {
                const nombre = document.getElementById('nuevoNombre').value;
                const descripcion = document.getElementById('nuevaDescripcion').value;
                const puntajeMinimo = parseInt(document.getElementById('nuevoPuntajeMinimo').value);
                const monto = parseFloat(document.getElementById('nuevoMonto').value) || 0;
                const beneficios = document.getElementById('nuevosBeneficios').value;

                if (!nombre || !puntajeMinimo) {
                    Swal.showValidationMessage('Nombre y puntaje mínimo son obligatorios');
                    return false;
                }

                return { nombre, descripcion, puntajeMinimo, monto, beneficios, activo: true };
            }
        });

        if (formValues) {
            const response = await fetch('/api/tipos-incentivos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formValues)
            });

            if (!response.ok) {
                throw new Error('Error al crear tipo de incentivo');
            }

            await Swal.fire({
                icon: 'success',
                title: '✅ Tipo Creado',
                text: 'El nuevo tipo de incentivo ha sido creado exitosamente',
                timer: 2000,
                showConfirmButton: false
            });

            await cargarTiposIncentivos();
        }
        
    } catch (error) {
        console.error('❌ Error creando tipo:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al crear',
            text: 'No se pudo crear el tipo de incentivo'
        });
    }
}

// ===== FUNCIONES PARA ASIGNACIONES AUTOMÁTICAS =====

async function cargarAsignacionesAutomaticas() {
    try {
        console.log('🔄 [FRONTEND] Iniciando carga de asignaciones automáticas...');
        console.log('🔄 [FRONTEND] URL del endpoint: /api/incentivos/asignaciones');
        console.log('🔄 [FRONTEND] Timestamp:', new Date().toISOString());
        
        const response = await fetch('/api/incentivos/asignaciones');
        console.log('📡 [FRONTEND] Respuesta recibida del servidor:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
            console.error('❌ [FRONTEND] Error HTTP:', response.status, response.statusText);
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('📥 [FRONTEND] Parseando respuesta JSON...');
        const asignaciones = await response.json();
        console.log('📊 [FRONTEND] Asignaciones cargadas del servidor:', {
            cantidad: asignaciones.length,
            datos: asignaciones
        });
        console.log('🔍 [FRONTEND] IDs de asignaciones:', asignaciones.map(a => ({ 
            id: a.id, 
            nombre: a.nombreCompleto,
            documento: a.documentoEstudiante,
            tipoIncentivo: a.tipoIncentivo?.nombre 
        })));
        
        console.log('🎨 [FRONTEND] Llamando a mostrarAsignacionesEnTabla...');
        mostrarAsignacionesEnTabla(asignaciones);
        console.log('✅ [FRONTEND] Función cargarAsignacionesAutomaticas completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error cargando asignaciones:', error);
        const contenedor = document.getElementById('tablaAsignacionesContainer');
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error al cargar las asignaciones automáticas: ${error.message}
                </div>
            `;
        }
    }
}

async function limpiarYRegenerarAsignaciones() {
    try {
        console.log('🧹 [FRONTEND] Iniciando limpieza y regeneración de asignaciones...');
        
        // Confirmar acción con el usuario
        const confirmacion = confirm(
            '⚠️ ¿Estás seguro de que deseas limpiar todas las asignaciones automáticas y regenerarlas?\n\n' +
            'Esta acción:\n' +
            '• Eliminará todas las asignaciones automáticas existentes\n' +
            '• Regenerará las asignaciones basándose únicamente en los estudiantes actuales en la base de datos\n' +
            '• Las asignaciones manuales NO se verán afectadas\n\n' +
            'Esta acción NO se puede deshacer.'
        );
        
        if (!confirmacion) {
            console.log('🧹 [FRONTEND] Operación cancelada por el usuario');
            return;
        }
        
        // Mostrar indicador de carga
        const contenedor = document.getElementById('tablaAsignacionesContainer');
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-sync-alt fa-spin me-2 text-warning"></i>
                    <strong>Limpiando y regenerando asignaciones automáticas...</strong>
                    <br><small class="text-muted">Este proceso puede tomar unos momentos</small>
                </div>
            `;
        }
        
        // Llamar al endpoint
        console.log('🧹 [FRONTEND] Llamando a /api/incentivos/limpiar-y-regenerar...');
        const response = await fetch('/api/incentivos/limpiar-y-regenerar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 [FRONTEND] Respuesta recibida:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const resultado = await response.json();
        console.log('📊 [FRONTEND] Resultado de la operación:', resultado);
        
        // Mostrar mensaje de éxito
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>¡Operación completada exitosamente!</strong><br>
                    <small>
                        • Eliminadas: ${resultado.eliminadas} asignaciones automáticas<br>
                        • Regeneradas: ${resultado.regeneradas} nuevas asignaciones<br>
                        • Total actual: ${resultado.estadisticas?.total || 'N/A'} asignaciones
                    </small>
                </div>
            `;
        }
        
        // Recargar la tabla después de un breve delay
        setTimeout(async () => {
            console.log('🔄 [FRONTEND] Recargando tabla de asignaciones...');
            await cargarAsignacionesAutomaticas();
            await actualizarIndicadoresIncentivos(); // ← Actualizar indicadores automáticamente
        }, 2000);
        
    } catch (error) {
        console.error('❌ [FRONTEND] Error en limpieza y regeneración:', error);
        
        const contenedor = document.getElementById('tablaAsignacionesContainer');
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Error durante la operación:</strong><br>
                    <small>${error.message}</small>
                </div>
            `;
        }
        
        // Intentar recargar la tabla original después de un error
        setTimeout(async () => {
            await cargarAsignacionesAutomaticas();
            await actualizarIndicadoresIncentivos(); // ← Actualizar indicadores automáticamente
        }, 3000);
    }
}

function mostrarAsignacionesEnTabla(asignaciones) {
    console.log('🎨 [FRONTEND] Iniciando mostrarAsignacionesEnTabla con:', asignaciones);
    console.log('🎨 [FRONTEND] Tipo de asignaciones:', typeof asignaciones, 'Es array:', Array.isArray(asignaciones));
    
    const contenedor = document.getElementById('tablaAsignacionesContainer');
    console.log('🎨 [FRONTEND] Contenedor tablaAsignacionesContainer encontrado:', !!contenedor);
    
    if (!contenedor) {
        console.error('❌ [FRONTEND] No se encontró el contenedor tablaAsignacionesContainer');
        return;
    }
    
    if (!asignaciones || asignaciones.length === 0) {
        console.log('ℹ️ [FRONTEND] No hay asignaciones para mostrar');
        contenedor.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle me-2"></i>
                No hay asignaciones automáticas registradas
            </div>
        `;
        return;
    }
    
    console.log('🎨 [FRONTEND] Generando HTML para', asignaciones.length, 'asignaciones...');
    
    const tabla = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Estudiante</th>
                        <th>Puntaje</th>
                        <th>Incentivo Asignado</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Fecha Asignación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${asignaciones.map(asignacion => `
                        <tr data-id="${asignacion.id}" data-estudiante="${asignacion.documentoEstudiante}">
                            <td>
                                <div>
                                    <strong>${asignacion.nombreCompleto || 'Sin nombre'}</strong><br>
                                    <small class="text-muted">${asignacion.documentoEstudiante}</small>
                                </div>
                            </td>
                            <td>
                                <span class="badge bg-success text-white">
                                    ${asignacion.puntajeObtenido || 'N/A'} pts
                                </span>
                            </td>
                            <td>
                                <div>
                                    <strong>${asignacion.tipoIncentivo?.nombre || 'Sin tipo'}</strong><br>
                                    <small class="text-muted">${asignacion.tipoIncentivo?.descripcion || ''}</small>
                                </div>
                            </td>
                            <td>
                                <strong class="text-success">
                                    $${formatearMonto(asignacion.tipoIncentivo?.monto || 0)}
                                </strong>
                            </td>
                            <td>
                                <span class="badge ${obtenerClaseEstado(asignacion.estado)}">
                                    ${asignacion.estado || 'PENDIENTE'}
                                </span>
                            </td>
                            <td>
                                ${formatearFecha(asignacion.fechaAsignacion)}
                            </td>
                            <td>
                                <div class="btn-group" role="group">
                                    ${asignacion.estado === 'PENDIENTE' ? `
                                        <button class="btn btn-sm btn-success" onclick="aprobarAsignacion('${asignacion.id}')" title="Aprobar">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="rechazarAsignacion('${asignacion.id}')" title="Rechazar">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    ` : ''}
                                    ${asignacion.estado === 'APROBADO' ? `
                                        <button class="btn btn-sm btn-info" onclick="marcarEntregado('${asignacion.id}')" title="Marcar como entregado">
                                            <i class="fas fa-hand-holding-usd"></i>
                                        </button>
                                    ` : ''}
                                    <button class="btn btn-sm btn-outline-primary" onclick="verDetalleAsignacion('${asignacion.id}')" title="Ver detalle">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarAsignacion('${asignacion.id}')" title="Eliminar asignación">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    console.log('🎨 [FRONTEND] HTML generado, insertando en contenedor...');
    contenedor.innerHTML = tabla;
    console.log('✅ [FRONTEND] Tabla de asignaciones mostrada exitosamente');
}

function obtenerClassePuntaje(puntaje) {
    if (!puntaje) return 'bg-secondary';
    if (puntaje >= 250) return 'bg-purple';
    if (puntaje >= 241) return 'bg-success';
    if (puntaje >= 211) return 'bg-primary';
    if (puntaje >= 180) return 'bg-warning';
    return 'bg-danger';
}

function obtenerClaseEstado(estado) {
    switch(estado) {
        case 'PENDIENTE': return 'bg-warning';
        case 'APROBADO': return 'bg-success';
        case 'ENTREGADO': return 'bg-info';
        case 'RECHAZADO': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function formatearMonto(monto) {
    return monto ? monto.toLocaleString('es-CO') : '0';
}

function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ============================================================================
// FUNCIONES ADICIONALES PARA INCENTIVOS
// ============================================================================

/**
 * Muestra el modal para crear un nuevo tipo de incentivo
 */
async function mostrarModalNuevoTipo() {
    console.log('🆕 Abriendo modal para crear nuevo tipo de incentivo');
    
    const { value: formValues } = await Swal.fire({
        title: '🎯 Nuevo Tipo de Incentivo',
        html: `
            <div class="form-group mb-3">
                <label for="swal-nombre" class="form-label">Nombre del Incentivo:</label>
                <input id="swal-nombre" class="form-control" placeholder="Ej: Beca Excelencia Académica">
            </div>
            <div class="form-group mb-3">
                <label for="swal-descripcion" class="form-label">Descripción:</label>
                <textarea id="swal-descripcion" class="form-control" rows="3" placeholder="Describe el incentivo..."></textarea>
            </div>
            <div class="form-group mb-3">
                <label for="swal-puntaje" class="form-label">Puntaje Mínimo SABER PRO:</label>
                <input id="swal-puntaje" type="number" class="form-control" placeholder="180" min="0" max="300">
            </div>
            <div class="form-group mb-3">
                <label for="swal-monto" class="form-label">Monto ($):</label>
                <input id="swal-monto" type="number" class="form-control" placeholder="500000" min="0">
            </div>
            <div class="form-group mb-3">
                <label for="swal-beneficios" class="form-label">Beneficios:</label>
                <textarea id="swal-beneficios" class="form-control" rows="3" placeholder="Lista los beneficios específicos..."></textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: '💾 Crear Incentivo',
        cancelButtonText: '❌ Cancelar',
        confirmButtonColor: '#28a745',
        preConfirm: () => {
            const nombre = document.getElementById('swal-nombre').value;
            const descripcion = document.getElementById('swal-descripcion').value;
            const puntaje = document.getElementById('swal-puntaje').value;
            const monto = document.getElementById('swal-monto').value;
            const beneficios = document.getElementById('swal-beneficios').value;
            
            if (!nombre || !descripcion || !puntaje || !beneficios) {
                Swal.showValidationMessage('Todos los campos son obligatorios excepto el monto');
                return false;
            }
            
            return {
                nombre: nombre,
                descripcion: descripcion,
                puntajeMinimo: parseInt(puntaje),
                monto: parseFloat(monto) || 0,
                beneficios: beneficios
            };
        }
    });

    if (formValues) {
        await crearTipoIncentivo(formValues);
    }
}

/**
 * Crea un nuevo tipo de incentivo
 */
async function crearTipoIncentivo(datos) {
    console.log('🆕 Creando nuevo tipo de incentivo:', datos);
    
    try {
        const response = await fetch('/api/tipos-incentivos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...datos,
                activo: true,
                creadoPor: 'Coordinador'
            })
        });

        if (response.ok) {
            const resultado = await response.json();
            
            await Swal.fire({
                title: '✅ ¡Éxito!',
                text: 'Tipo de incentivo creado correctamente',
                icon: 'success',
                confirmButtonColor: '#28a745'
            });
            
            // Recargar la tabla
            await cargarTiposIncentivos();
            await actualizarIndicadoresIncentivos(); // ← Actualizar indicadores automáticamente
            
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
        
    } catch (error) {
        console.error('❌ Error creando tipo de incentivo:', error);
        
        await Swal.fire({
            title: '❌ Error',
            text: 'No se pudo crear el tipo de incentivo',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
}

/**
 * Exporta el reporte de incentivos a Excel
 */
async function exportarReporteExcel() {
    console.log('📊 Exportando reporte de incentivos a Excel');
    
    try {
        // Mostrar indicador de carga
        Swal.fire({
            title: '📊 Generando reporte...',
            text: 'Preparando datos para exportación',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Obtener datos
        const [tiposResponse, asignacionesResponse] = await Promise.all([
            fetch('/api/tipos-incentivos'),
            fetch('/api/incentivos')
        ]);

        const tipos = await tiposResponse.json();
        const asignaciones = await asignacionesResponse.json();

        // Preparar datos para Excel
        const datosReporte = asignaciones.map(asignacion => ({
            'Documento': asignacion.documentoEstudiante,
            'Estudiante': asignacion.nombreCompleto,
            'Programa': asignacion.programaAcademico,
            'Puntaje SABER PRO': asignacion.puntajeObtenido,
            'Tipo de Incentivo': asignacion.tipoIncentivo?.nombre || 'Sin tipo',
            'Monto': asignacion.tipoIncentivo?.monto || 0,
            'Estado': asignacion.estado,
            'Evaluación': asignacion.evaluacionAutomatica ? 'Automática' : 'Manual',
            'Fecha Asignación': asignacion.fechaAsignacion ? new Date(asignacion.fechaAsignacion).toLocaleDateString('es-CO') : '',
            'Observaciones': asignacion.observaciones || ''
        }));

        // Crear libro de trabajo
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(datosReporte);
        
        // Configurar ancho de columnas
        const colWidths = [
            {wch: 15}, {wch: 30}, {wch: 25}, {wch: 12}, 
            {wch: 25}, {wch: 12}, {wch: 12}, {wch: 12}, 
            {wch: 15}, {wch: 30}
        ];
        worksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Incentivos');

        // Generar y descargar archivo
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `reporte_incentivos_${fecha}.xlsx`;
        
        XLSX.writeFile(workbook, nombreArchivo);

        Swal.fire({
            title: '✅ ¡Éxito!',
            text: `Reporte exportado: ${nombreArchivo}`,
            icon: 'success',
            confirmButtonColor: '#28a745'
        });

    } catch (error) {
        console.error('❌ Error exportando reporte:', error);
        
        Swal.fire({
            title: '❌ Error',
            text: 'No se pudo exportar el reporte a Excel',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
}

/**
 * Exporta el reporte de incentivos a PDF
 */
async function exportarReportePDF() {
    console.log('📄 Exportando reporte de incentivos a PDF');
    
    try {
        // Verificar si html2pdf está disponible
        if (typeof html2pdf === 'undefined') {
            throw new Error('Biblioteca html2pdf no está disponible');
        }

        // Mostrar indicador de carga
        Swal.fire({
            title: '📄 Generando PDF...',
            text: 'Preparando reporte para descarga',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Obtener datos
        const [tiposResponse, asignacionesResponse] = await Promise.all([
            fetch('/api/tipos-incentivos'),
            fetch('/api/incentivos')
        ]);

        const tipos = await tiposResponse.json();
        const asignaciones = await asignacionesResponse.json();

        // Crear contenido HTML para PDF
        const fecha = new Date().toLocaleDateString('es-CO');
        const contenido = `
            <div style="font-family: Arial, sans-serif; margin: 20px;">
                <h1 style="color: #2c3e50; text-align: center;">📊 Reporte de Incentivos SABER PRO</h1>
                <p style="text-align: center; color: #7f8c8d;">Generado el ${fecha}</p>
                
                <h2 style="color: #3498db;">📋 Resumen Ejecutivo</h2>
                <p><strong>Total asignaciones:</strong> ${asignaciones.length}</p>
                <p><strong>Tipos configurados:</strong> ${tipos.length}</p>
                
                <h2 style="color: #3498db;">🎯 Asignaciones de Incentivos</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background-color: #3498db; color: white;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Estudiante</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Puntaje</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Incentivo</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Estado</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${asignaciones.map(asignacion => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 6px;">${asignacion.nombreCompleto}</td>
                                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${asignacion.puntajeObtenido}</td>
                                <td style="border: 1px solid #ddd; padding: 6px;">${asignacion.tipoIncentivo?.nombre || 'Sin tipo'}</td>
                                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${asignacion.estado}</td>
                                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">$${(asignacion.tipoIncentivo?.monto || 0).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Configurar opciones del PDF
        const opciones = {
            margin: 1,
            filename: `reporte_incentivos_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generar y descargar PDF
        await html2pdf().from(contenido).set(opciones).save();

        Swal.fire({
            title: '✅ ¡Éxito!',
            text: 'Reporte PDF generado correctamente',
            icon: 'success',
            confirmButtonColor: '#28a745'
        });

    } catch (error) {
        console.error('❌ Error exportando PDF:', error);
        
        Swal.fire({
            title: '❌ Error',
            text: 'No se pudo exportar el reporte a PDF. Verifique que las librerías estén cargadas.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
}

/**
 * Filtra las asignaciones automáticas por estado
 */
function filtrarAsignaciones(estado) {
    console.log('🔍 Filtrando asignaciones por estado:', estado);
    
    const filas = document.querySelectorAll('#tabla-asignaciones tbody tr');
    
    filas.forEach(fila => {
        if (estado === 'todos') {
            fila.style.display = '';
        } else {
            const estadoFila = fila.querySelector('.badge')?.textContent?.trim().toLowerCase();
            if (estadoFila === estado.toLowerCase()) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        }
    });
    
    // Actualizar contador de resultados
    const filasVisibles = Array.from(filas).filter(fila => fila.style.display !== 'none').length;
    console.log(`🔍 Mostrando ${filasVisibles} de ${filas.length} asignaciones`);
}

console.log('🎯 Funciones adicionales de incentivos cargadas correctamente');

// ===== EXPOSICIÓN DE FUNCIONES GLOBALES =====
window.eliminarAsignacion = eliminarAsignacion;
window.aprobarAsignacion = aprobarAsignacion;
window.rechazarAsignacion = rechazarAsignacion;
window.entregarAsignacion = entregarAsignacion;
window.marcarEntregado = marcarEntregado;
window.verDetalleAsignacion = verDetalleAsignacion;
window.editarTipoIncentivo = editarTipoIncentivo;
window.eliminarTipoIncentivo = eliminarTipoIncentivo;
window.crearNuevoTipoIncentivo = crearNuevoTipoIncentivo;
window.cambiarEstadoTipo = cambiarEstadoTipo;
window.reevaluarEstudiantes = reevaluarEstudiantes;
window.filtrarAsignaciones = filtrarAsignaciones;
window.mostrarReporteEnModal = mostrarReporteEnModal;
window.descargarReporteDesdeModal = descargarReporteDesdeModal;
window.abrirReporteEnNuevaVentana = abrirReporteEnNuevaVentana;

console.log('🌐 Funciones de incentivos expuestas globalmente');
