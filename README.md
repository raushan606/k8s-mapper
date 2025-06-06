
# 🚀 Live Kubernetes Mapping Tool

_Visualize your Kubernetes apps in real time — see what’s running, how it connects, and where it’s breaking._

---

## 📘 Overview

The Live Kubernetes Mapping Tool provides a **real-time, animated map of your applications and infrastructure** running inside a Kubernetes cluster. It’s a developer-first tool that turns complex deployments into a visual, interactive graph with insights into the relationships between workloads, services, ingress routes, and configurations.

---

## 🏗️ System Architecture

```
+--------------------+        API / WebSocket        +-------------------------+
| Kubernetes Cluster |  <--------------------------> | Java Backend Service    |
| (Live resources)   |                               | (Spring Boot / Quarkus) |
+--------------------+                               +-----------+-------------+
                                                               |
                                                       JSON Topology Model
                                                               |
                                                               v
                                           +-------------------+------------------+
                                           | Frontend Web App (React/Svelte/Vue) |
                                           | (Graph rendering with animations)   |
                                           +-------------------------------------+
```

---

## ⚙️ Core Flow

### 1. Kubernetes Watcher (Java Backend)

- Uses **Fabric8** or **official Java K8s client**
- Watches changes in:
  - Deployments, Pods, ReplicaSets
  - Services, Ingresses
  - ConfigMaps, Secrets, Volumes
- Builds in-memory topology grouped by namespace or application label.

**Sample Output JSON:**
```json
{
  "namespace": "prod",
  "apps": [
    {
      "name": "user-service",
      "ingress": "users.example.com",
      "service": "user-svc",
      "pods": ["user-1a2b", "user-3c4d"],
      "configMaps": ["user-config"],
      "secrets": ["user-db-secret"],
      "status": "Healthy"
    }
  ]
}
```

### 2. Animated Frontend UI

- Fetches initial topology via REST
- Connects to live updates via WebSocket
- Uses **Cytoscape.js**, **Reaflow**, or **Vis.js** for rendering animated DAG/graph
- Animates:
  - Pod creation/removal
  - Service routing lines
  - Config/Secret mounts appearing/disappearing
  - Status changes

---

## 🧑‍💻 Developer Interactions

- **Click Node** → Show metadata, mounted configs, pod logs
- **Hover** → Tooltip with labels/status
- **Filters**:
  - Namespace
  - Label selector
  - Resource type
- **Legend** for colors, edge types (traffic, mount)

---

## 🧩 Bonus Features

### ✅ 1. Export as Image or Diagram
- SVG, PNG, PDF exports
- Markdown Mermaid export for GitHub READMEs

### 🕒 2. Cluster Time Machine
- Record/replay cluster state
- Timeline slider with animations

### 🔍 3. Search and Inspector
- Search by pod name, config, label
- Inspector shows YAML, metrics, related logs/events

### 🧩 4. Plugin System
- Extendable with custom plugins:
  - Annotations
  - Metrics overlays
  - Tracing links

### 📦 5. Embeddable Dashboard
- Can be used standalone or inside:
  - Grafana
  - Backstage
  - Custom portals

---

## 🔌 APIs & Endpoints

### REST
```http
GET /api/topology?namespace=prod
GET /api/apps/:name/details
```

### WebSocket
```ws
/ws/topology/stream
```
Pushes JSON deltas:
```json
{
  "event": "POD_ADDED",
  "data": {
    "pod": "user-xyz",
    "status": "Running"
  }
}
```

---

## 🧱 Tech Stack

| Layer       | Technology                         |
|-------------|------------------------------------|
| Backend     | Java, Spring Boot or Quarkus       |
| K8s Client  | Fabric8 Kubernetes Client          |
| Frontend    | React (or Svelte/Vue)              |
| Animation   | Cytoscape.js / Reaflow / Vis.js    |
| Styling     | Tailwind CSS / Chakra UI           |
| Comm Layer  | REST + WebSocket                   |
| Deployment  | Docker, Helm, Kubernetes           |

---

## 🚀 Future Ideas

- GitOps integration
- Live linting of topology
- AI assistant for suggestions and troubleshooting
