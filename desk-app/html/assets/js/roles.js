const API_BASE_URLS = [
    'https://api-management-pet-production2.up.railway.app',
    'https://api-management-pet-production.up.railway.app'
];

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

const roleImageMap = {
    1: "../img/diseno.png",
    2: "../img/marketing.png",
    3: "../img/gestion.png",
    4: "../img/caracteristica.png",
    5: "../img/programacion.png"
};

const roleNameMap = {
    1: "Diseñador",
    2: "Marketing",
    3: "Administrador",
    4: "TIC",
    5: "Programador"
};

document.addEventListener("DOMContentLoaded", () => { 
    fetchEmployees();
    fetchRoles();

    const closeButton = document.querySelector(".close-button");
    if (closeButton) {
        closeButton.addEventListener("click", closeRoleModal);
    }
});

async function fetchEmployees() {
    try {
        const employees = await fetchDiferentFastApi('/employees/', {
            headers: { "Accept": "application/json" }
        });
        cargarEmployees(employees);
    } catch (err) {
        console.error("Error al obtener empleados:", err);
    }
}

function cargarEmployees(employees) {
    const tbody = document.getElementById("employeeTableBody");
    tbody.innerHTML = "";
    employees.forEach(emp => {
        const roleName = roleNameMap[emp.role] || "Rol desconocido";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${roleName}</td>
            <td>${emp.role}</td>
            <td>
                <button class="button warning" onclick="eliminarTrabajador(${emp.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function eliminarTrabajador(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este trabajador?')) return;

    try {

        let success = false;
        for (const base of API_BASE_URLS) {
            try {
                const res = await fetch(`${base}/user/${id}`, {
                    method: 'DELETE',
                    headers: { "Accept": "application/json" }
                });
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                success = true;
                break;
            } catch (error) {
                console.warn(`Fallo al eliminar en ${base}/user/${id}:`, error.message);
            }
        }
        if (!success) throw new Error('No se pudo eliminar el trabajador en ninguna instancia.');

        alert('Trabajador eliminado exitosamente.');
        fetchEmployees();
    } catch (error) {
        alert('Error al eliminar trabajador: ' + error.message);
    }
}

async function fetchRoles() {
    try {
        const roles = await fetchDiferentFastApi('/role/', {
            headers: { "Accept": "application/json" }
        });
        renderRoleButtons(roles);
    } catch (err) {
        console.error("Error al obtener roles:", err);
    }
}

function renderRoleButtons(roles) {
    const container = document.getElementById("rolesButtons");
    container.innerHTML = "";

    roles.forEach(role => {
        const imageFile = roleImageMap[role.id] || "default.png";
        const card = document.createElement("div");
        card.className = "role-card";
        card.onclick = () => showRoleDetails(role);

        card.innerHTML = `
            <img class="role-icon" src="../assets/icons/${imageFile}" alt="${role.role_name}" />
            <div class="role-text">
                <h3 class="role-title">${role.role_name}</h3>
                <p class="role-description">${role.description || 'Sin descripción'}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function showRoleDetails(role) {
    document.getElementById("roleDescription").textContent = role.description || "Sin descripción";
    document.getElementById("rolePermissions").textContent = role.permission || "Sin permisos";
    document.getElementById("roleModal").style.display = "block";
}

function closeRoleModal() {
    const modal = document.getElementById("roleModal");
    modal.style.display = "none";
}
