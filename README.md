# WeTube

A real-time YouTube watch party web application featuring synchronized video playback, WebSockets communication, and role-based access control.

---

## 🚀 Live Demo

Live URL:we-tube-five-brown.vercel.app

---

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Real-Time Communication:** Socket.IO
- **Video Integration:** YouTube IFrame Player API

---

## 🏗 Architecture Overview

- **Real-Time Bidirectional Sync:** Socket.IO handles low-latency event broadcasting between the server and all connected room clients (play, pause, seek, video changes, and room presence).
- **In-Memory State Management:** Object-oriented `Room` and `Participant` models manage active rooms, participant roles, and synchronization timestamps in server memory.
- **Server-Side Authorization:** Role-based permission checks (Host, Moderator, Participant) are enforced server-side before processing playback or room-moderation events to prevent unauthorized actions.

---

## ✨ Features

- **Room Creation & Joining:** Generate random room codes or join existing watch parties instantly by code or direct link.
- **Real-Time Playback Synchronization:** Synchronized play, pause, seek, and instant video switching across all room members with drift correction.
- **Role-Based Access Control (RBAC):**
  - **Host:** Full playback control, can promote/demote moderators, and remove participants.
  - **Moderator:** Playback control permissions (play/pause/seek/change video).
  - **Participant:** View-only synchronized playback with real-time room presence.
- **Participant Management:** Live participant list displaying usernames, color-hashed avatars, and role badges.
- **Discord-Inspired UI:** Dark and light theme support with responsive mobile drawer navigation and touch-friendly controls.

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### 1. Clone the Repository

```bash
git clone https://github.com/jai345coder/WeTube.git
cd WeTube
```

### 2. Backend Setup (`/server`)

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

*The server will start on `http://localhost:3000`.*

### 3. Frontend Setup (`/client`)

```bash
cd ../client
npm install
cp .env.example .env
npm run dev
```

*The client will start on `http://localhost:5173`.*

---

## 📄 License

This project is licensed under the MIT License.
