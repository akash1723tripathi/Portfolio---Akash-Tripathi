# Kanbex

> Real-time Collaborative Kanban Platform

---

## Overview

Kanbex is a production-oriented project management platform built by Akash to explore distributed collaboration, optimistic UI, real-time synchronization, and modern DevOps practices.

Rather than cloning Trello visually, the project focuses on the engineering challenges behind collaborative software: concurrent updates, presence, Dockerized environments, CI/CD, caching, and scalable backend architecture.

---

# Problem Statement

Traditional Kanban boards often feel static.

Akash wanted to build a platform where multiple users could collaborate simultaneously while maintaining a fast and responsive user experience.

The primary engineering goals were:

- Real-time collaboration
- Optimistic drag & drop
- Presence indicators
- Reliable backend synchronization
- Containerized deployment
- CI/CD automation

---

# Core Features

- Multi-project workspace
- Real-time collaborative Kanban board
- Drag & drop task management
- Live editing presence
- Labels & priorities
- Due dates
- File attachments
- Dashboard analytics
- Authentication (Email + Google OAuth)
- Responsive design

---

# Architecture

Browser (Next.js)

↓

TanStack Query Cache

↓

Socket.io Client

↓

Express API

↓

Redis (Presence + Cache)

↓

PostgreSQL (Prisma)

The frontend communicates through both HTTP and WebSockets.

REST handles persistence.

Socket.io handles collaboration.

Redis manages temporary distributed state.

---

# Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- TanStack Query
- DnD Kit
- Framer Motion

## Backend

- Express.js
- TypeScript
- Socket.io
- Zod Validation
- Passport.js

## Database

- PostgreSQL
- Prisma ORM

## Infrastructure

- Redis
- Docker
- Docker Compose
- GitHub Actions
- Render
- Cloudflare R2

---

# Engineering Highlights

## 1. Optimistic UI

Dragging a task should feel instant.

Instead of waiting for the server:

User drags card

↓

UI updates immediately

↓

Background API request

↓

Success → Keep state

Failure → Rollback

This dramatically improves perceived performance.

Akash considers optimistic updates one of the most important frontend UX patterns.

---

## 2. Real-Time Presence

Kanbex doesn't continuously poll the server.

Each editing event flows through Socket.io and Redis.

User starts editing

↓

Socket Event

↓

Redis (30s TTL)

↓

Broadcast

↓

"Akash is editing..."

Redis stores ephemeral collaboration state while PostgreSQL remains the source of truth.

---

## 3. Redis Strategy

Redis serves three different purposes:

### Presence

Stores active editors with TTL.

### Cache

Reduces repeated database reads.

### Distributed State

Allows multiple backend instances to share collaboration events.

Akash intentionally avoids storing permanent business data inside Redis.

---

## 4. PostgreSQL + Prisma

The relational model fits Kanban naturally.

User

↓

Workspace

↓

Project

↓

Column

↓

Task

↓

Comments / Activity

Prisma provides type-safe database access while keeping migrations predictable.

---

## 5. Docker Development

One major objective was eliminating "works on my machine."

Local development spins up:

- Frontend
- Backend
- PostgreSQL
- Redis

using a single Docker Compose command.

This creates reproducible environments across contributors.

---

## 6. CI/CD Pipeline

Every pull request automatically runs:

1. Type checking
2. Linting
3. Tests
4. Docker build validation

After merge:

GitHub

↓

GitHub Actions

↓

Render

↓

Automatic deployment

The goal is treating deployment as infrastructure rather than a manual process.

---

# Database Design

Core entities:

- User
- Workspace
- Project
- Column
- Task
- Label
- Comment
- Activity

The activity table enables future audit history without modifying task records directly.

---

# Challenges Solved

## Challenge 1

Concurrent drag events.

**Solution**

Optimistic UI with authoritative backend reconciliation.

---

## Challenge 2

Backend starting before PostgreSQL.

**Solution**

Docker health checks and dependency ordering.

---

## Challenge 3

Collaborative editing across multiple users.

**Solution**

Socket.io + Redis pub/sub style presence architecture.

---

# What Akash Learned

Kanbex became his strongest DevOps-oriented project.

The project taught him:

- Docker networking
- Health checks
- Multi-stage builds
- CI/CD automation
- Redis architecture
- Real-time synchronization
- Optimistic state management

He considers Kanbex the best representation of his distributed systems thinking.

---

# FAQ

### Why Socket.io instead of only REST?

REST persists data.

Socket.io distributes events instantly between connected users, making collaboration feel live.

### Why Redis?

Presence information is temporary and expires naturally, making Redis much better suited than PostgreSQL for ephemeral state.

### Why optimistic updates?

Waiting for server acknowledgement makes drag-and-drop feel sluggish. Optimistic UI gives immediate feedback while preserving consistency through rollback logic.

### Is Kanbex production deployable?

Yes.

The project includes Dockerized services, CI/CD pipelines, automated deployments, Redis, PostgreSQL, and cloud-ready infrastructure rather than being a local-only demo.