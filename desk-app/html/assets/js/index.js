async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        showToast("Por favor, completa ambos campos.", "error");
        return;
    }

    const baseUrls = [
        "https://api-management-pet-production.up.railway.app",
        "https://api-management-pet-production2.up.railway.app"
    ];

    async function tryFetch(url, options) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error("Error HTTP");
            return response;
        } catch (error) {
            return null;
        }
    }

    let loginResponse = null;
    let usedBaseUrl = null;

    for (const baseUrl of baseUrls) {
        loginResponse = await tryFetch(`${baseUrl}/employees/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (loginResponse) {
            usedBaseUrl = baseUrl;
            break;
        }
    }

    if (!loginResponse) {
        showToast("Error de conexión. Intenta más tarde.", "error");
        return;
    }

    const data = await loginResponse.json();

    if (data.message === "Inicio de sesión exitoso") {
        const token = data.token;
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_email", email); 
        const allEmployeesRes = await tryFetch(`${usedBaseUrl}/employees/`, {
            method: "GET",
            headers: {
                "accept": "application/json"
            }
        });

        if (allEmployeesRes) {
            const allEmployees = await allEmployeesRes.json();
            const matchedUser = allEmployees.find(user => user.email === email);

            if (matchedUser) {
                const userRole = matchedUser.role;

                switch (userRole) {
                    case 3:
                        window.location.href = "../html/html-admin/inicio-adm.html"; break;
                    case 1:
                        window.location.href = "../html/html-diseno/inicio-dis.html"; break;
                    case 2:
                        window.location.href = "../html/html-marketing/inicio-marketing.html"; break;
                    case 4:
                    case 5:
                        window.location.href = "../html/html-tic-programadores/inicio-tic.html"; break;
                    default:
                        showToast("Rol no reconocido. Contacta al administrador.", "error");
                }
            } else {
                showToast("Usuario no encontrado tras login. Intenta más tarde.", "error");
            }
        } else {
            showToast("Error al obtener la información del usuario.", "error");
        }
    } else {
        const msg = data?.detail?.[0]?.msg;
        if (msg === "Invalid credentials") {
            showToast("Contraseña incorrecta.", "error");
        } else if (msg === "User not found") {
            showToast("Usuario no encontrado.", "error");
        } else {
            showToast("Error desconocido. Intenta más tarde.", "error");
        }
    }
}
