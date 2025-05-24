const API_BASE_URLS = [
    'https://api-management-pet-production2.up.railway.app',
    'https://api-management-pet-production.up.railway.app'
];

const DIAS_ANALISIS = 18;

async function fetchDiferentFastApi(endpoint, options = {}) {
    for (const base of API_BASE_URLS) {
        try {
            const res = await fetch(base + endpoint, options);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.warn(`Fallo al intentar ${base + endpoint}:`, error.message);
        }
    }
    throw new Error('No se pudo conectar a ninguna instancia del servidor.');
}

const obtenerUltimosDias = (cantidad) => {
    const dias = [];
    const hoy = new Date();
    for (let i = cantidad - 1; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        dias.push(fecha.toISOString().split('T')[0]);
    }
    return dias;
};

const cargarGraficoConexionesPorDia = async () => {
    try {
        const usuarios = await fetchDiferentFastApi('/user/');
        const dias = obtenerUltimosDias(DIAS_ANALISIS);

        const conexionesPorDia = dias.reduce((acc, dia) => {
            acc[dia] = 0;
            return acc;
        }, {});

        usuarios.forEach(usuario => {
            if (usuario.last_conection) {
                const fechaConexion = new Date(usuario.last_conection).toISOString().split('T')[0];
                if (conexionesPorDia[fechaConexion] !== undefined) {
                    conexionesPorDia[fechaConexion]++;
                }
            }
        });

        const labels = dias;
        const datos = dias.map(dia => conexionesPorDia[dia]);

        const canvas = document.getElementById('conexionesChart');
        if (!canvas) {
            console.warn("Elemento 'conexionesChart' no encontrado.");
            return;
        }

        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Usuarios conectados por día',
                    data: datos,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0,123,255,0.2)',
                    tension: 0.3,
                    pointBackgroundColor: '#007bff',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Conexiones Diarias de Usuarios (últimos 7 días)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        precision: 0
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error al generar gráfico de líneas:", error);
    }
};

const cargarGraficoMascotas = async () => {
    try {
        const mascotas = await fetchDiferentFastApi('/pets/get');

        const tipos = { 1: 0, 2: 0 };
        mascotas.forEach(mascota => {
            if (tipos.hasOwnProperty(mascota.id_pet_type)) {
                tipos[mascota.id_pet_type]++;
            }
        });

        const labels = ['Pulpo', 'Red Panda'];
        const data = [tipos[1], tipos[2]];
        const preferida = tipos[1] > tipos[2] ? 'Pulpo' : (tipos[2] > tipos[1] ? 'Red Panda' : 'Empate');

        document.getElementById('mascota-preferida').textContent =
            preferida === 'Empate'
                ? 'Las mascotas Pulpo y Red Panda tienen la misma cantidad.'
                : `La mascota preferida es: ${preferida}`;

        const ctx = document.getElementById('mascotasChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Cantidad de mascotas',
                    data,
                    backgroundColor: ['#6f42c1', '#fd7e14']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Mascotas Preferidas por Tipo'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        precision: 0
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error gráfico mascotas:", error);
    }
};

const contarUsuarios = async () => {
    try {
        const usuarios = await fetchDiferentFastApi('/user/');
        document.getElementById('user-count').textContent = usuarios.length;
    } catch (error) {
        console.error("Error al contar usuarios:", error);
    }
};

contarUsuarios();
cargarGraficoConexionesPorDia();
cargarGraficoMascotas();
