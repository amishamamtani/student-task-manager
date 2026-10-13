const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const message = document.getElementById("message");
let currentFilter = "all";
let tasks = [];

document.getElementById("today").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "short", month: "short", day: "numeric"
});

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return response.status === 204 ? null : response.json();
}

async function loadTasks() {
  try {
    tasks = await request("/api/tasks");
    renderTasks();
  } catch (error) {
    message.textContent = "Could not load tasks. Check that the server is running.";
  }
}

function renderTasks() {
  taskList.replaceChildren();
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);
    checkbox.addEventListener("change", async () => {
      try {
        await request(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify({ completed: checkbox.checked })
        });
        await loadTasks();
      } catch (error) {
        message.textContent = error.message;
      }
    });

    const title = document.createElement("span");
    title.className = "task-text";
    title.textContent = task.title;

    const status = document.createElement("span");
    status.className = "task-status";
    status.textContent = task.completed ? "Completed" : "In progress";

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${task.title}`);
    remove.addEventListener("click", async () => {
      try {
        await request(`/api/tasks/${task.id}`, { method: "DELETE" });
        await loadTasks();
      } catch (error) {
        message.textContent = error.message;
      }
    });

    item.append(checkbox, title, status, remove);
    taskList.append(item);
  });

  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  document.getElementById("total-count").textContent = tasks.length;
  document.getElementById("pending-count").textContent = pending;
  document.getElementById("completed-count").textContent = completed;
  document.getElementById("task-badge").textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  document.getElementById("progress-percent").textContent = `${percent}%`;
  document.getElementById("progress-bar").style.width = `${percent}%`;
  document.getElementById("progress-caption").textContent =
    tasks.length === 0 ? "You've got this. Start with one task." :
    percent === 100 ? "Amazing! All your tasks are complete." :
    `${completed} of ${tasks.length} tasks completed. Keep going!`;

  emptyState.style.display = visibleTasks.length ? "none" : "block";
  message.textContent = "";
}

taskForm.addEventListener("submit", async event => {
  event.preventDefault();
  const title = taskTitle.value.trim();
  if (!title) return;
  try {
    await request("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title })
    });
    taskTitle.value = "";
    currentFilter = "all";
    document.querySelectorAll(".filter").forEach(button => {
      button.classList.toggle("active", button.dataset.filter === "all");
    });
    await loadTasks();
    taskTitle.focus();
  } catch (error) {
    message.textContent = error.message;
  }
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(filter => {
      filter.classList.toggle("active", filter === button);
    });
    renderTasks();
  });
});

loadTasks();
