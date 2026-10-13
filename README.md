# Student Task Manager

A simple student productivity app for a DevOps CIE project.

## Features
- Add tasks
- Mark tasks as completed or in progress
- Delete tasks
- Filter all, pending, and completed tasks
- Summary cards and completion progress
- Health endpoint at `/health`
- Prometheus metrics at `/metrics`

## Requirements
- Node.js 20 or newer
- npm

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000

## Verify the endpoints

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/tasks
curl http://localhost:3000/metrics
```

## Run with Docker

```bash
docker build -t student-task-manager:1.0 .
docker run --name student-task-manager -p 3000:3000 student-task-manager:1.0
```

Open http://localhost:3000. In another terminal, verify:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/metrics
```

Stop and remove the container:

```bash
docker stop student-task-manager
docker rm student-task-manager
```

## Important note about storage

For simplicity, tasks are stored in server memory. They reset when the server or container restarts, and separate replicas do not share the same task list. This is suitable for a small classroom demo, not for production use.

## DevOps flow

GitHub → GitHub Actions → Docker image → Google Artifact Registry → Google Kubernetes Engine (GKE) → Prometheus → Grafana.
