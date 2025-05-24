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

async function register() {
    const data = {
        name: document.getElementById('name').value.trim(),
        second_name: document.getElementById('second_name').value.trim(),
        first_surname: document.getElementById('first_surname').value.trim(),
        second_surname: document.getElementById('second_surname').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim(),
        phone_number: document.getElementById('phone_number').value.trim(),
        address: document.getElementById('address').value.trim(),
        birthdate: document.getElementById('birthdate').value.trim().replace(/-/g, '/'),
        role: parseInt(document.getElementById('role').value)
    };

    const responseMessage = document.getElementById('responseMessage');

    try {
        const result = await fetchDiferentFastApi('/employees/singup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        showToast('Empleado registrado con éxito. ID: ' + result[0]?.id, 'success');
        document.getElementById('registrationForm').reset();
    } catch (error) {
        console.error("Error al registrar empleado:", error);
        showToast('Error al registrar. Revisa los campos o intenta más tarde.', 'error');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 4000);
}
