# CodeRoom

> Real-Time Collaborative Coding & Pair Programming Platform

---

## Overview

CodeRoom is a distributed collaborative coding platform built by Akash to simulate the experience of pair programming inside the browser.

Unlike a traditional code editor, the platform combines live code editing, WebRTC video/audio communication, authentication, sandboxed code execution, and event-driven backend architecture into a single developer workspace.

The project was built to explore real-world collaboration systems rather than simple CRUD applications.

---

# Vision

Akash wanted to answer one question:

> "What would Google Docs look like if it were built for software engineers?"

The result was CodeRoom — a platform where developers can join a room, write code together, communicate through video, and execute programs safely without installing anything locally.

---

# Core Features

- Real-time collaborative coding
- Monaco Editor integration
- WebRTC video & audio rooms
- OAuth authentication
- Live participant presence
- Multi-language code execution
- Stateless backend architecture
- Event-driven user synchronization

---

# High-Level Architecture

Browser (React)

↓

Clerk Authentication

↓

Express API

↓

Piston Execution Engine

↓

MongoDB

↓

GetStream SFU

↓

Inngest Event Workers

Every service has a dedicated responsibility instead of combining everything into one backend.

---

# Tech Stack

## Frontend

- React
- Vite
- Monaco Editor
- TanStack Query
- Tailwind CSS

## Backend

- Node.js
- Express
- Clerk Middleware
- Inngest

## Database

- MongoDB
- Mongoose

## Collaboration

- GetStream Video SDK
- WebRTC (SFU)

## Code Execution

- Piston API

---

# Engineering Highlights

## 1. Stateless Authentication

Instead of building authentication from scratch, CodeRoom delegates identity to **Clerk**.

Flow:

User signs in

↓

Clerk issues JWT

↓

Express verifies token

↓

Backend generates Stream token

↓

Video room initialized

No server-side session store is required.

This keeps the backend horizontally scalable.

---

## 2. Monaco Editor

Akash selected Monaco because it's the same editor powering VS Code.

Benefits include:

- Syntax highlighting
- IntelliSense foundation
- Multiple language support
- Rich editor APIs
- Professional editing experience

The editor becomes the center of the collaboration workspace.

---

## 3. WebRTC via SFU

Peer-to-peer calls become inefficient as participants increase.

Instead, CodeRoom uses **GetStream's SFU architecture**.

Why SFU?

- Lower client bandwidth
- Better scalability
- Adaptive bitrate
- Stable multi-user calls

The browser sends one media stream to the SFU instead of sending streams to every participant individually.

---

## 4. Sandboxed Code Execution

Running user code directly on the backend is dangerous.

CodeRoom proxies execution through **Piston**, which creates ephemeral Linux containers for every execution request.

Flow:

User clicks Run

↓

Express validates request

↓

Piston container

↓

stdout / stderr

↓

React output panel

No user code ever executes inside Akash's backend server.

---

## 5. Event-Driven User Sync

New users created in Clerk must also exist inside MongoDB and GetStream.

Instead of coupling these operations into registration APIs, CodeRoom uses **Inngest**.

Flow:

clerk.user.created

↓

Inngest Event

↓

MongoDB upsert

↓

GetStream user creation

↓

Retry on failure

This makes synchronization idempotent and resilient.

---

# Database Model

Core entities:

- User
- Clerk Identity
- Stream User
- Coding Room
- Session Metadata

The internal User document acts as the canonical record while external identities remain linked through Clerk IDs.

---

# Challenges Solved

## Challenge 1

Secure authentication across multiple services.

**Solution**

Clerk handles identity while Stream receives derived HMAC tokens from the backend.

---

## Challenge 2

Safe remote code execution.

**Solution**

Piston sandbox containers prevent arbitrary code from running on production infrastructure.

---

## Challenge 3

Keeping external services synchronized.

**Solution**

Inngest event orchestration with retryable workflows instead of synchronous coupling.

---

# Security Decisions

CodeRoom intentionally avoids:

- Local password storage
- Backend session persistence
- Direct shell execution
- Client-side API secrets

Security is delegated to specialized services wherever possible.

---

# What Akash Learned

According to Akash, CodeRoom taught him the value of **service orchestration**.

Rather than building everything himself, he learned how modern products combine specialized platforms:

- Clerk for identity
- GetStream for media transport
- Piston for isolated execution
- Inngest for background workflows
- MongoDB for persistence

This project significantly improved his understanding of distributed SaaS architecture.

---

# FAQ

### Why Clerk instead of JWT auth?

Clerk provides production-grade OAuth, session management, JWKS verification, and identity lifecycle, allowing the backend to remain stateless.

### Why use an SFU?

An SFU scales far better than peer-to-peer WebRTC because each participant uploads only one stream regardless of room size.

### Why Piston?

Executing arbitrary user code directly is unsafe. Piston isolates execution inside disposable containers with resource limits.

### What is the most important engineering idea in CodeRoom?

The separation of responsibilities. Identity, media, execution, persistence, and event processing are handled independently, making the system much easier to scale and maintain.