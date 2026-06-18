# Mernix - The Ultimate Developer Video Streaming Hub

A modern full-stack video sharing platform inspired by YouTube, built using TypeScript, React, Node.js, Express.js, and MongoDB.

Mernix is being developed as a large-scale learning project focused on real-world full-stack application architecture, backend engineering, authentication systems, scalable API design, database modeling, and modern frontend development practices.

---

## 🚀 Current Status

🚧 Active Development (November 2025 – Present)

### Completed

- [x] User Authentication & Authorization
- [x] JWT Access Token Authentication
- [x] Refresh Token Flow
- [x] Secure HTTP-Only Cookie Authentication
- [x] User Registration & Login
- [x] Channel Profile Management
- [x] Account Settings Management
- [x] Password Change Functionality
- [x] Watch History System
- [x] Search Functionality
- [x] Home Feed
- [x] Video Feed APIs
- [x] Subscription System APIs
- [x] Like System APIs
- [x] Comment APIs
- [x] Playlist APIs
- [x] Dashboard APIs
- [x] Swagger Documentation
- [x] Cloudinary Integration
- [x] MongoDB Aggregation Pipelines
- [x] Analytics Dashboard

### In Progress

- [ ] Advanced Video Playback
- [ ] Creator Dashboard
- [ ] Video Upload Management
- [ ] My Videos Feed in Tabular format
- [ ] Social Engagement Features
- [ ] Responsive Mobile Optimizations

---

# ✨ Features

## Authentication & Security

* JWT Authentication
* Refresh Token Rotation
* Protected Routes
* Secure HTTP-Only Cookies
* Password Hashing with bcrypt

## Video Platform

* Video Feed
* Video Details
* Search Videos
* Watch History
* Channel Profiles
* Video Upload Management
* User Dashboard

## Social Features

* Comments
* Likes
* Subscriptions
* Playlists
* Community Posts (Tweets)

## Developer Experience

* TypeScript Across Frontend & Backend
* Modular Architecture
* Swagger API Documentation
* Postman Collection
* Centralized Error Handling
* Reusable API Response System
* Scalable Folder Structure

---

# 🏗️ Architecture

The application follows a modular architecture pattern.

Frontend and backend are completely separated and communicate through REST APIs.

```text
Client (React + TypeScript)
        │
        ▼
REST API Layer
        │
        ▼
Express Server
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
Auth   APIs  Middleware
        │
        ▼
MongoDB Database
        │
        ▼
Cloudinary Storage
```

---

# 🛠️ Tech Stack

## Frontend

* React 19
* TypeScript
* TanStack Query
* Zustand
* React Hook Form
* Axios
* Tailwind CSS v4
* React Router v7
* Video.js
* Sonner (thinking to replace `sonner` with `react-hot-toast`)

## Backend

* Node.js
* Express.js 5
* TypeScript
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer
* Cloudinary
* Cookie Parser
* CORS
* Express Rate Limit

## Developer Tools

* Git
* GitHub
* Swagger
* Postman
* Vite
* ESLint
* Prettier

---

# 📂 Project Structure

```text
mernix/
├── client/
│   ├── bun.lock
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── README.md
│   ├── src/
│   │   ├── api/
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   └── video.service.ts
│   │   ├── App.tsx
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── LoginModal.tsx
│   │   │   ├── common/
│   │   │   │   └── ConfirmationModal.tsx
│   │   │   ├── container/
│   │   │   │   └── Container.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── layouts/
│   │   │       ├── AuthLayout.tsx
│   │   │       ├── DashboardLayout.tsx
│   │   │       └── index.ts
│   │   ├── conf/
│   │   │   └── conf.ts
│   │   ├── hooks/
│   │   │   ├── useChangePassword.ts
│   │   │   ├── useChannelProfile.ts
│   │   │   ├── useGetVideos.ts
│   │   │   ├── useLogin.ts
│   │   │   ├── useLogout.ts
│   │   │   ├── useRegister.ts
│   │   │   ├── useUpdateSettings.ts
│   │   │   ├── useVideoDetails.ts
│   │   │   ├── useVideoMutations.ts
│   │   │   └── useWatchHistory.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── pages/
│   │   │   ├── Channel.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── index.ts
│   │   │   ├── Login.tsx
│   │   │   ├── ProfileSettings.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── WatchHistory.tsx
│   │   ├── providers/
│   │   │   └── AuthProvider.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── themeStore.ts
│   │   ├── types/
│   │   │   └── types.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       └── formatDuration.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── Postman Collections/
│   └── API_Docs.md.json
├── README.md
└── server/
    ├── mernix.postman_collection.json
    ├── package.json
    ├── pnpm-lock.yaml
    ├── public/
    │   └── temp
    ├── README.md
    ├── src/
    │   ├── app.ts
    │   ├── conf/
    │   │   └── conf.ts
    │   ├── constants.ts
    │   ├── controllers/
    │   │   ├── comment.controller.ts
    │   │   ├── dashboard.controller.ts
    │   │   ├── healthCheck.controller.ts
    │   │   ├── like.controller.ts
    │   │   ├── playlist.controller.ts
    │   │   ├── subscription.controller.ts
    │   │   ├── tweet.controller.ts
    │   │   ├── user.controller.ts
    │   │   └── video.controller.ts
    │   ├── db/
    │   │   └── index.ts
    │   ├── middlewares/
    │   │   ├── auth.middleware.ts
    │   │   ├── error.middleware.ts
    │   │   └── multer.middleware.ts
    │   ├── models/
    │   │   ├── comment.model.ts
    │   │   ├── like.model.ts
    │   │   ├── playlist.model.ts
    │   │   ├── subscription.model.ts
    │   │   ├── tweet.model.ts
    │   │   ├── user.model.ts
    │   │   └── video.model.ts
    │   ├── routes/
    │   │   ├── comment.routes.ts
    │   │   ├── dashboard.routes.ts
    │   │   ├── healthCheck.routes.ts
    │   │   ├── index.ts
    │   │   ├── like.routes.ts
    │   │   ├── playlist.routes.ts
    │   │   ├── subscription.routes.ts
    │   │   ├── tweet.routes.ts
    │   │   ├── user.routes.ts
    │   │   └── video.routes.ts
    │   ├── server.ts
    │   ├── types/
    │   │   ├── aggregation.types.ts
    │   │   ├── auth.d.ts
    │   │   └── types.ts
    │   └── utils/
    │       ├── ApiError.ts
    │       ├── ApiResponse.ts
    │       ├── asyncHandler.ts
    │       └── cloudinary.ts
    ├── swaggerDoc.yaml
    └── tsconfig.json

32 directories, 102 files
```

---

# 📊 Backend Overview

Current backend implementation includes:

### 9+ API Modules

* User Management & Authentication
* Videos
* Comments
* Tweets
* Likes
* Playlists
* Subscriptions
* Dashboard
* Health Monitoring

### 7+ MongoDB Collections

* Users
* Videos
* Comments
* Likes
* Playlists
* Subscriptions
* Tweets (Community Posts)

### Core Backend Features

* JWT Authentication
* Refresh Token System
* Cloudinary Uploads
* Aggregation Pipelines
* Error Middleware
* Custom API Responses
* Async Request Handling
* Swagger Documentation

---

# 🔐 Authentication Flow

```text
User Login
     │
     ▼
Validate Credentials
     │
     ▼
Generate Access Token
Generate Refresh Token
     │
     ▼
Store Refresh Token
     │
     ▼
Send HTTP-Only Cookies
     │
     ▼
Protected API Access
```

---

# 📖 API Documentation

Swagger documentation is available locally after running the server.

```bash
http://localhost:3000/api/v1/docs
```

The repository also includes a Postman Collection for testing endpoints.

---

# ⚙️ Local Setup

## Clone Repository

```bash
git clone https://github.com/undefinedx96/mernix.git

cd mernix
```

<small> NOTE: Copy `.env.sample` and create a `.env` file with the required environment variables </small>

## Client Setup

```bash
cd client

bun i

bun run dev
```

## Server Setup

```bash
cd server

pnpm install

pnpm run dev
```

---

# 🌱 Learning Goals

This project is helping me deepen my understanding of:

* TypeScript
* Backend Architecture
* Authentication Systems
* Database Design
* MongoDB Aggregation Pipelines
* REST API Design
* Scalable Folder Structures
* Full Stack Application Development

---

# 🛣️ Roadmap

* Creator Studio
* Video Upload Workflow
* Advanced Video Player
* Channel Analytics
* Notifications
* Recommendation System
* Realtime Features
* Admin Dashboard
* Performance Optimizations

---

# 🤝 Contributing

Contributions are welcome.

### Branch Strategy

```text
main                    → Stable production-ready code
development             → Active integration branch

client/dev/feature-x    → Client feature branches
server/dev/feature-y    → Server feature branches
```

### Contribution Guidelines

- Do not create pull requests directly to `main`.
- Create your branch from `development`.
- Submit pull requests targeting `development`.
- Follow the existing folder structure, coding style, and naming conventions.
- Keep pull requests focused on a single feature or fix.

---

# 👨‍💻 Author

### Prantik Ghosh

MERN Stack Developer

Portfolio: https://prantikghosh.vercel.app

LinkedIn: https://linkedin.com/in/prantikghosh96

GitHub: https://github.com/undefinedx96

Bsky: https://bsky.app/profile/undefinedx96.bsky.social

Dev: https://dev.to/undefinedx96

---

⭐ If you find this project interesting, feel free to star the repository.