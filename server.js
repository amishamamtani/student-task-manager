const express = require("express");
const path = require("path");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const tasks = [];
let nextId = 1;

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: "student_task_manager_http_requests_total",
  help: "Total number of HTTP requests handled by the application",
  labelNames: ["method", "route", "status"]
});
register.registerMetric(httpRequests);

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequests.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: String(res.statusCode)
    });
  });
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", application: "student-task-manager" });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const task = {
    id: nextId++,
    title,
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const task = tasks.find(item => item.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found." });

  task.completed = Boolean(req.body.completed);
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const index = tasks.findIndex(item => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Task not found." });

  tasks.splice(index, 1);
  res.status(204).end();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Student Task Manager running on port ${PORT}`);
});
