const taskTitle = document.getElementById("taskTitle");
const taskContent = document.getElementById("taskContent");
const addTaskBtn = document.getElementById("addTaskBtn");
const tasksPending = document.getElementById("tasksPending");
const tasksDone = document.getElementById("tasksDone");

let tasks = [];
let currentUser = "Usuario Anónimo";

async function getCurrentUser() {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  const baseUrls = [
    "https://api-management-pet-production.up.railway.app",
    "https://api-management-pet-production2.up.railway.app"
  ];

  for (const baseUrl of baseUrls) {
    try {
      const res = await fetch(`${baseUrl}/employees/`, {
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) continue;

      const employees = await res.json();
      const email = localStorage.getItem("user_email");
      if (email) {
        const matchedUser = employees.find(emp => emp.email === email);
        if (matchedUser) return `${matchedUser.name} ${matchedUser.first_surname}`;
      }

      if (employees.length > 0) return `${employees[0].name} ${employees[0].first_surname}`;
    } catch {
      continue;
    }
  }
  return null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const savedTheme = localStorage.getItem("theme");
  const themeIcon = document.getElementById("theme-icon");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeIcon.src = "../assets/img/sun.png";
  }

  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) tasks = JSON.parse(savedTasks);

  const user = await getCurrentUser();
  if (user) currentUser = user;

  renderTasks();
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

addTaskBtn.addEventListener("click", () => {
  const title = taskTitle.value.trim();
  const content = taskContent.value.trim();
  if (title !== "") {
    const newTask = {
      id: Date.now(),
      title,
      content,
      author: currentUser,
      created_at: new Date().toISOString(),
      status: "pending",
      active: true
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskTitle.value = "";
    taskContent.value = "";
  }
});

function renderTasks() {
  tasksPending.innerHTML = "";
  tasksDone.innerHTML = "";

  if (tasks.length === 0) return;

  tasks
    .filter(task => task.active !== false) 
    .forEach(task => {
      const li = document.createElement("li");
      li.className = "note";
      li.dataset.id = task.id;

      li.innerHTML = `
        <div style="text-align: left; display: inline-block; vertical-align: middle; width: 80%;">
          <strong>${task.title}</strong><br>
          <small>${task.content || ""}</small><br>
          <small>${task.author} | ${new Date(task.created_at).toLocaleString()}</small>
        </div>
        <button class="toggle-btn" title="${task.status === "pending" ? "Marcar como hecho" : "Reiniciar tarea"}" style="
          border:none; cursor:pointer; padding: 4px 10px; font-size: 0.9em; color: white; margin-left: 5px;
          background-color: ${task.status === "pending" ? '#007BFF' : '#DC3545'};
          border-radius: 4px;
        ">${task.status === "pending" ? "Hecho" : "Reiniciar"}</button>
        <button class="delete-btn" title="Eliminar" style="
          background:none; border:none; cursor:pointer; padding:0; font-size:1.2em; color: #555; margin-left: 5px;
        ">🗑️</button>
      `;

      li.querySelector('.delete-btn').addEventListener("click", () => {
        deleteTask(task.id);
      });

      li.querySelector('.toggle-btn').addEventListener("click", () => {
        task.status = task.status === "pending" ? "done" : "pending";
        saveTasks();
        renderTasks();
      });

      const column = task.status === "pending" ? tasksPending : tasksDone;
      column.appendChild(li);
    });
}

function deleteTask(id) {
  tasks = tasks.map(task => task.id === id ? {...task, active: false} : task);
  saveTasks();
  renderTasks();
}
