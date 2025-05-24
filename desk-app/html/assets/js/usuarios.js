const API_BASE_URLS = [
    'https://api-management-pet-production2.up.railway.app',
    'https://api-management-pet-production.up.railway.app'
];

async function fetchAPI(endpoint, method = 'GET', body = null, queryParams = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }
    let queryString = '';
    if (queryParams) {
        queryString = '?' + new URLSearchParams(queryParams).toString();
    }

    for (let baseUrl of API_BASE_URLS) {
        const url = `${baseUrl}${endpoint}${queryString}`;
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.warn(`Fallo con ${baseUrl}${endpoint}: ${error.message}`);
        }
    }

    throw new Error('No se pudo conectar a ningún servidor API.');
}



function cerrarSesion() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}


function showAlert(message, type = 'info') {
    alert(`${type.toUpperCase()}: ${message}`);
}


async function cargarUsuarios() {
    try {
        const usuarios = await fetchAPI('/user/');
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.username}</td>
                <td>${usuario.email}</td>
                <td>********</td>
                <td>${usuario.last_conection ? new Date(usuario.last_conection).toLocaleString() : 'N/A'}</td>
                <td>
                    <button class="button warning" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showAlert('Error al cargar usuarios: ' + error.message, 'error');
    }
}


function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}


async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        return;
    }

    try {
        await fetchAPI(`/user/${id}`, 'DELETE');
        showAlert('Usuario eliminado exitosamente.', 'success');
        cargarUsuarios();
    } catch (error) {
        showAlert('Error al eliminar usuario: ' + error.message, 'error');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
});
