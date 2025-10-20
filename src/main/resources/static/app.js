document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

    // ============================================================
    // LOGIN
    // ============================================================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async e => {
            e.preventDefault();
            const documento = document.getElementById('documento').value;
            const password = document.getElementById('password').value;

            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documento, password })
            });
            const data = await res.json();

            if (data.success) {
                sessionStorage.setItem('documento', documento);
                sessionStorage.setItem('rol', data.rol);
                if (data.rol === 'ESTUDIANTE') window.location = 'estudiante.html';
                else if (data.rol === 'COORDINADOR') window.location = 'coordinador.html';
            } else {
                document.getElementById('errorMsg').innerText = data.message;
            }
        });
    }

    // ============================================================
    // LOGOUT
    // ============================================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            window.location = 'index.html';
        });
    }

    // ============================================================
    // VISTA ESTUDIANTE
    // ============================================================
    if (window.location.pathname.endsWith('estudiante.html')) {
        if (sessionStorage.getItem('rol') !== 'ESTUDIANTE') window.location = 'index.html';
        const doc = sessionStorage.getItem('documento');

        fetch(`/api/estudiantes/resultado/${doc}`)
            .then(res => res.json())
            .then(data => {
                const incentivosEl = document.getElementById('estadoIncentivos');
                if (!incentivosEl) return;
                const puntajeGlobal = Number(data.puntajeGlobal);
                const reglasBeneficios = [
                    {
                        nombre: 'Exoneración del proyecto de grado',
                        minimo: 360,
                        detalle: 'Disponible a partir de 360 puntos.'
                    },
                    {
                        nombre: 'Pago de derechos de grado por parte de la institución',
                        minimo: 340,
                        detalle: 'Disponible a partir de 340 puntos.'
                    },
                    {
                        nombre: 'Exoneración del formulario F125',
                        minimo: 320,
                        detalle: 'Disponible a partir de 320 puntos.'
                    }
                ];

                if (!Number.isFinite(puntajeGlobal)) {
                    incentivosEl.innerText = data.estadoIncentivos || 'Sin información de puntaje global.';
                } else {
                    const beneficios = reglasBeneficios.map(regla => ({
                        ...regla,
                        elegible: puntajeGlobal >= regla.minimo
                    }));

                    const beneficiosObtenidos = beneficios.filter(b => b.elegible);
                    const beneficiosPendientes = beneficios.filter(b => !b.elegible);

                    const lista = [
                        ...beneficiosObtenidos.map(b => `<li>[OK] ${b.nombre} (requisito: ${b.detalle})</li>`),
                        ...beneficiosPendientes.map(b => `<li>[Pendiente] ${b.nombre} (requisito: ${b.detalle})</li>`)
                    ].join('');

                    // Mostrar resumen de incentivos junto con el detalle calculado.
                    incentivosEl.innerHTML = beneficiosObtenidos.length
                        ? `<strong>Beneficios obtenidos con ${puntajeGlobal} puntos:</strong><ul class="text-start">${lista}</ul>`
                        : `<strong>Sin beneficios automáticos con ${puntajeGlobal} puntos.</strong><ul class="text-start">${lista}</ul>`;
                }
                // Llenar tabla de información del estudiante
                document.getElementById('infoDocumento').innerText = data.documento || '';
                document.getElementById('infoTipoDocumento').innerText = data.tipoDocumento || '';
                document.getElementById('infoPrimerApellido').innerText = data.primerApellido || '';
                document.getElementById('infoSegundoApellido').innerText = data.segundoApellido || '';
                document.getElementById('infoPrimerNombre').innerText = data.primerNombre || '';
                document.getElementById('infoSegundoNombre').innerText = data.segundoNombre || '';
                document.getElementById('infoCorreoElectronico').innerText = data.correoElectronico || '';
                document.getElementById('infoNumeroTelefono').innerText = data.numeroTelefono || '';
                document.getElementById('infoProgramaAcademico').innerText = data.programaAcademico || '';
                document.getElementById('infoPuntajeGlobal').innerText = data.puntajeGlobal || '';
                // Calcular nivel de efectividad según puntaje
                function calcularNivel(puntaje) {
                    if (puntaje === null || puntaje === undefined || isNaN(puntaje)) return '';
                    if (puntaje >= 350) return 'Alto';
                    if (puntaje >= 250) return 'Medio';
                    if (puntaje >= 150) return 'Bajo';
                    return 'Muy Bajo';
                }
                const tbody = document.querySelector('#notasTable tbody');
                tbody.innerHTML = '';
                data.notas.forEach(n => {
                    const nivel = calcularNivel(n.puntaje);
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${n.materia}</td><td>${n.puntaje}</td><td>${nivel}</td>`;
                    tbody.appendChild(tr);
                });
            })
            .catch(err => console.error('Error cargando estudiante:', err));
    }

    // ============================================================
    // VISTA COORDINADOR (CRUD)
    // ============================================================
    if (window.location.pathname.endsWith('coordinador.html')) {
        if (sessionStorage.getItem('rol') !== 'COORDINADOR') window.location = 'index.html';

        // Mensaje de bienvenida
        fetch('/api/coordinador/test')
            .then(res => res.json())
            .then(data => {
                document.getElementById('mensajeCoordinador').innerText = data.mensaje;
            });

        // ----- Variables globales -----
        const API_URL = '/api/estudiantes';
        const tabla = document.getElementById('tablaEstudiantes');
        const form = document.getElementById('formEstudiante');
        let estudianteSeleccionado = null;
        let documentoActual = null;

        // ============================================================
        // FUNCIONES CRUD ESTUDIANTES
        // ============================================================

        async function cargarEstudiantes() {
            const res = await fetch(API_URL);
            const data = await res.json();

            tabla.innerHTML = data.map(e => `
                <tr>
                    <td>${e.documento}</td>
                    <td>${e.nombreCompleto || ''}</td>
                    <td>${e.puntajeGlobal}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="editar('${e.documento}')">Editar</button>
                        <button class="btn btn-sm btn-warning" onclick="abrirMaterias('${e.documento}')">Materias</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminar('${e.documento}')">Eliminar</button>
                    </td>
                </tr>
            `).join('');
        }

        // Crear o actualizar estudiante
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const estudiante = {
                documento: document.getElementById('documento').value,
                tipoDocumento: document.getElementById('tipoDocumento').value,
                primerApellido: document.getElementById('primerApellido').value,
                segundoApellido: document.getElementById('segundoApellido').value,
                primerNombre: document.getElementById('primerNombre').value,
                segundoNombre: document.getElementById('segundoNombre').value,
                correoElectronico: document.getElementById('correoElectronico').value,
                numeroTelefono: document.getElementById('numeroTelefono').value,
                nombreCompleto: `${document.getElementById('primerNombre').value} ${document.getElementById('segundoNombre').value} ${document.getElementById('primerApellido').value} ${document.getElementById('segundoApellido').value}`.replace(/  +/g, ' ').trim(),
                programaAcademico: document.getElementById('programaAcademico').value,
                puntajeGlobal: parseFloat(document.getElementById('puntajeGlobal').value),
                notas: []
            };
            const method = estudianteSeleccionado ? 'PUT' : 'POST';
            const endpoint = estudianteSeleccionado ? `${API_URL}/${estudiante.documento}` : API_URL;

            await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(estudiante)
            });

            form.reset();
            estudianteSeleccionado = null;
            cargarEstudiantes();
        });

        // Editar estudiante
        window.editar = async (documento) => {
            const res = await fetch(`${API_URL}/${documento}`);
            const e = await res.json();
            document.getElementById('documento').value = e.documento;
            document.getElementById('tipoDocumento').value = e.tipoDocumento || '';
            document.getElementById('primerApellido').value = e.primerApellido || '';
            document.getElementById('segundoApellido').value = e.segundoApellido || '';
            document.getElementById('primerNombre').value = e.primerNombre || '';
            document.getElementById('segundoNombre').value = e.segundoNombre || '';
            document.getElementById('correoElectronico').value = e.correoElectronico || '';
            document.getElementById('numeroTelefono').value = e.numeroTelefono || '';
            // No hay input de nombre, nombreCompleto se arma automáticamente
            document.getElementById('programaAcademico').value = e.programaAcademico || '';
            document.getElementById('puntajeGlobal').value = e.puntajeGlobal;
            estudianteSeleccionado = e;
        };

        // Eliminar estudiante
        window.eliminar = async (documento) => {
            if (!confirm('¿Eliminar este estudiante?')) return;
            await fetch(`${API_URL}/${documento}`, { method: 'DELETE' });
            cargarEstudiantes();
        };

        // ============================================================
        // FUNCIONES CRUD MATERIAS (ANIDADAS)
        // ============================================================

        window.abrirMaterias = async (documento) => {
            documentoActual = documento;
            // Si quieres precargar notas existentes, puedes hacerlo aquí (opcional)
            const res = await fetch(`${API_URL}/${documento}`);
            const estudiante = await res.json();
            // Limpiar los inputs del formulario de materias
            const formMaterias = document.getElementById('formMaterias');
            if (formMaterias) {
                formMaterias.reset();
                // Si hay notas existentes, precargarlas
                if (estudiante.notas && Array.isArray(estudiante.notas)) {
                    estudiante.notas.forEach(nota => {
                        // Mapear nombre de materia a name del input
                        const map = {
                            'Comunicación Escrita': 'comunicacionEscrita',
                            'Razonamiento Cuantitativo': 'razonamientoCuantitativo',
                            'Lectura Crítica': 'lecturaCritica',
                            'Competencias Ciudadanas': 'competenciasCiudadanas',
                            'Inglés': 'ingles',
                            'Formulación de Proyectos de Ingeniería': 'formulacionProyectos',
                            'Pensamiento Científico, Matemáticas y Estadística': 'pensamientoCientifico',
                            'Diseño de Software': 'disenoSoftware',
                            'Inglés (Avanzado)': 'inglesAvanzado'
                        };
                        const input = formMaterias.elements[map[nota.materia]];
                        if (input) input.value = nota.puntaje;
                    });
                }
            }
            const modal = new bootstrap.Modal(document.getElementById('modalMaterias'));
            modal.show();
        };

        // Agregar materia
        // Guardar todas las materias de la plantilla
        document.getElementById('formMaterias')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const materias = [
                { nombre: 'Comunicación Escrita', name: 'comunicacionEscrita' },
                { nombre: 'Razonamiento Cuantitativo', name: 'razonamientoCuantitativo' },
                { nombre: 'Lectura Crítica', name: 'lecturaCritica' },
                { nombre: 'Competencias Ciudadanas', name: 'competenciasCiudadanas' },
                { nombre: 'Inglés', name: 'ingles' },
                { nombre: 'Formulación de Proyectos de Ingeniería', name: 'formulacionProyectos' },
                { nombre: 'Pensamiento Científico, Matemáticas y Estadística', name: 'pensamientoCientifico' },
                { nombre: 'Diseño de Software', name: 'disenoSoftware' },
                { nombre: 'Inglés (Avanzado)', name: 'inglesAvanzado' }
            ];
            const notas = materias.map(m => ({
                materia: m.nombre,
                puntaje: parseFloat(form[m.name].value) || 0,
                nivel: ''
            }));
            await fetch(`${API_URL}/${documentoActual}/notas`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notas })
            });
            // Cerrar modal y refrescar datos
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterias'));
            if (modal) modal.hide();
            cargarEstudiantes();
        });

        // Eliminar materia
        window.eliminarMateria = async (materia) => {
            await fetch(`${API_URL}/${documentoActual}/notas/${materia}`, { method: 'DELETE' });
            abrirMaterias(documentoActual);
        };

        // Inicializar tabla
        cargarEstudiantes();
    }
});
