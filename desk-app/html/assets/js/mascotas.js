const API_BASE_URL = 'https://api-management-pet-production2.up.railway.app';

let petsData = [];
let currentPetId = null;


async function fetchAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en la petición');
        }

        return await response.json();
    } catch (error) {
        console.error(`Error en ${method} ${endpoint}:`, error);
        throw error;
    }
}

async function loadPets() {
    try {
        petsData = await fetchAPI('/pets/get');
        renderPets(petsData);
    } catch (error) {
        showAlert('Error al cargar mascotas: ' + error.message, 'error');
    }
}





function renderPets(pets) {
    const tbody = document.getElementById('petsTableBody');
    tbody.innerHTML = '';

    pets.forEach(pet => {
        const row = document.createElement('tr');
        const createdAt = pet.created_at ? new Date(pet.created_at).toLocaleDateString() : 'N/A';

        row.innerHTML = `
            <td>PET-${String(pet.id).padStart(3, '0')}</td>
            <td>${pet.name}</td>
            <td>${pet.id_user ? 'USR-' + String(pet.id_user).padStart(3, '0') : 'No asignado'}</td>
            <td>Tipo ${pet.id_pet_type}</td>
            <td class="date-column">${createdAt}</td>
            <td class="actions">
                <button class="action-btn qr-btn" data-action="qr" data-pet-id="${pet.id}">QR</button>
                <button class="action-btn delete-btn" data-action="delete" data-pet-id="${pet.id}">Eliminar</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}





function generarNombreAleatorio() {
    return 'Mascota-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createPet(petData) {
    try {
        const response = await fetchAPI('/pets/create', 'POST', petData);
        showAlert('Mascota creada exitosamente', 'success');
        loadPets();
        closeModal();
    } catch (error) {
        showAlert('Error al crear mascota: ' + error.message, 'error');
    }
}

async function deletePet(petId) {
    if (confirm('¿Estás seguro de eliminar esta mascota?')) {
        try {
            await fetchAPI(`/pets/delete/${petId}`, 'DELETE');
            showAlert('Mascota eliminada', 'success');
            loadPets();
        } catch (error) {
            showAlert('Error al eliminar: ' + error.message, 'error');
        }
    }
}





async function showQR(petId) {
    try {
        const pet = await fetchAPI(`/pets/get/${petId}`);
        if (!pet.qr) throw new Error('La mascota no tiene un código QR asignado');

        const qrImage = document.getElementById('qrImage');
        qrImage.src = pet.qr.startsWith('http') ? pet.qr :
            `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pet.qr)}`;

        document.getElementById('qrPetName').textContent = `${pet.name} (PET-${pet.id})`;
        document.getElementById('qrPetOwner').textContent = pet.id_user
            ? `Usuario: USR-${pet.id_user}`
            : 'No asignado a usuario';
        document.getElementById('qrCodeValue').textContent = pet.qr;

        document.getElementById('qrModal').style.display = 'block';
    } catch (error) {
        console.error('Error al cargar QR:', error);
        showAlert('Error al mostrar QR: ' + error.message, 'error');
    }
}

function printQR() {
    const printContents = document.querySelector('.qr-container').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
}

function downloadQR() {
    const qrImage = document.getElementById('qrImage');
    const link = document.createElement('a');
    link.href = qrImage.src;
    link.download = `QR_${document.getElementById('qrPetName').textContent.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}





function handleFormSubmit(event) {
    event.preventDefault();

    const petData = {
        name: generarNombreAleatorio(),
        id_pet_type: parseInt(document.getElementById('petSpecies').value),
        id_user: null
    };

    createPet(petData);
}

function handleTableClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const petId = button.dataset.petId;

    if (action === 'qr') showQR(petId);
    else if (action === 'delete') deletePet(petId);
}





function showAlert(message, type = 'info') {
    alert(`${type.toUpperCase()}: ${message}`);
}

function openModal() {
    document.getElementById('petModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('petModal').style.display = 'none';
    document.getElementById('petForm').reset();
}

function closeQRModal() {
    document.getElementById('qrModal').style.display = 'none';
}

function searchPets() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredPets = petsData.filter(pet => {
        const idUserString = pet.id_user ? String(pet.id_user) : '';
        return (
            pet.name.toLowerCase().includes(searchTerm) ||
            String(pet.id).includes(searchTerm) ||
            idUserString.includes(searchTerm)
        );
    });

    renderPets(filteredPets);
}






document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('petForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('searchButton').addEventListener('click', searchPets);
    document.getElementById('petsTableBody').addEventListener('click', handleTableClick);

    loadPets();
});

window.showQR = showQR;
window.deletePet = deletePet;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeQRModal = closeQRModal;
window.printQR = printQR;
window.downloadQR = downloadQR;
