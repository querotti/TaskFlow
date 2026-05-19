const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "data", "tasks.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

async function readTasks() {
  const data = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(data);
}

async function saveTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Payload muito grande."));
      }
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON invalido."));
      }
    });
  });
}

function isValidTaskPayload(payload) {
  return payload.title && payload.description && payload.category && payload.priority;
}

async function handleApi(request, response, pathname) {
  if (pathname === "/api/tasks" && request.method === "GET") {
    const tasks = await readTasks();
    sendJson(response, 200, tasks);
    return;
  }

  if (pathname === "/api/tasks" && request.method === "POST") {
    const payload = await parseBody(request);

    if (!isValidTaskPayload(payload)) {
      sendJson(response, 400, { message: "Preencha titulo, descricao, categoria e prioridade." });
      return;
    }

    const tasks = await readTasks();
    const newTask = {
      id: `task-${Date.now()}`,
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: payload.category.trim(),
      priority: payload.priority,
      status: "pendente",
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    await saveTasks(tasks);
    sendJson(response, 201, newTask);
    return;
  }

  const taskRoute = pathname.match(/^\/api\/tasks\/([^/]+)$/);

  if (taskRoute && request.method === "PATCH") {
    const taskId = taskRoute[1];
    const payload = await parseBody(request);
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      sendJson(response, 404, { message: "Tarefa nao encontrada." });
      return;
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...payload, id: taskId };
    await saveTasks(tasks);
    sendJson(response, 200, tasks[taskIndex]);
    return;
  }

  if (taskRoute && request.method === "DELETE") {
    const taskId = taskRoute[1];
    const tasks = await readTasks();
    const filteredTasks = tasks.filter((task) => task.id !== taskId);

    if (filteredTasks.length === tasks.length) {
      sendJson(response, 404, { message: "Tarefa nao encontrada." });
      return;
    }

    await saveTasks(filteredTasks);
    sendJson(response, 200, { message: "Tarefa removida com sucesso." });
    return;
  }

  sendJson(response, 404, { message: "Rota nao encontrada." });
}

async function serveStatic(response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Acesso negado.");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const extension = path.extname(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extension] || "text/plain; charset=utf-8" });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Arquivo nao encontrado.");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url.pathname);
      return;
    }

    await serveStatic(response, url.pathname);
  } catch (error) {
    sendJson(response, 500, { message: error.message || "Erro interno do servidor." });
  }
});

server.listen(PORT, () => {
  console.log(`TaskFlow rodando em http://localhost:${PORT}`);
});
