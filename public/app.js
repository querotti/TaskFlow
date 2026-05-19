const taskList = document.querySelector("#taskList");
const taskForm = document.querySelector("#taskForm");
const formMessage = document.querySelector("#formMessage");
const totalTasks = document.querySelector("#totalTasks");
const pendingTasks = document.querySelector("#pendingTasks");
const doneTasks = document.querySelector("#doneTasks");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = [];
let currentFilter = "todas";

const statusLabels = {
  pendente: "Pendente",
  andamento: "Em andamento",
  concluida: "Concluida"
};

async function requestApi(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Algo deu errado.");
  }

  return data;
}

function updateSummary() {
  totalTasks.textContent = tasks.length;
  pendingTasks.textContent = tasks.filter((task) => task.status !== "concluida").length;
  doneTasks.textContent = tasks.filter((task) => task.status === "concluida").length;
}

function getFilteredTasks() {
  if (currentFilter === "todas") {
    return tasks;
  }

  return tasks.filter((task) => task.status === currentFilter);
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const header = document.createElement("header");
  const content = document.createElement("div");
  const title = document.createElement("h3");
  const description = document.createElement("p");
  const badges = document.createElement("div");

  title.textContent = task.title;
  description.textContent = task.description;
  badges.className = "badges";
  badges.innerHTML = `
    <span class="badge">${task.category}</span>
    <span class="badge ${task.priority}">Prioridade ${task.priority}</span>
    <span class="badge">${statusLabels[task.status]}</span>
  `;

  content.append(title, description);
  header.append(content, badges);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const statusSelect = document.createElement("select");
  statusSelect.className = "status-select";
  statusSelect.setAttribute("aria-label", `Alterar status de ${task.title}`);
  statusSelect.innerHTML = `
    <option value="pendente">Pendente</option>
    <option value="andamento">Em andamento</option>
    <option value="concluida">Concluida</option>
  `;
  statusSelect.value = task.status;
  statusSelect.addEventListener("change", () => updateTaskStatus(task.id, statusSelect.value));

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Excluir";
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  actions.append(statusSelect, deleteButton);
  card.append(header, actions);

  return card;
}

function renderTasks() {
  taskList.innerHTML = "";
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "Nenhuma tarefa encontrada para este filtro.";
    taskList.append(emptyState);
    return;
  }

  filteredTasks.forEach((task) => {
    taskList.append(createTaskCard(task));
  });
}

async function loadTasks() {
  tasks = await requestApi("/api/tasks");
  updateSummary();
  renderTasks();
}

async function createTask(event) {
  event.preventDefault();
  formMessage.textContent = "";

  const formData = new FormData(taskForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const newTask = await requestApi("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    tasks.unshift(newTask);
    taskForm.reset();
    document.querySelector("#priority").value = "media";
    formMessage.textContent = "Tarefa adicionada com sucesso.";
    updateSummary();
    renderTasks();
  } catch (error) {
    formMessage.textContent = error.message;
  }
}

async function updateTaskStatus(taskId, status) {
  const updatedTask = await requestApi(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });

  tasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
  updateSummary();
  renderTasks();
}

async function deleteTask(taskId) {
  await requestApi(`/api/tasks/${taskId}`, { method: "DELETE" });
  tasks = tasks.filter((task) => task.id !== taskId);
  updateSummary();
  renderTasks();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

taskForm.addEventListener("submit", createTask);
loadTasks().catch((error) => {
  taskList.innerHTML = `<div class="empty-state">${error.message}</div>`;
});
