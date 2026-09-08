# Wizardry AI

> AI-powered Prompt-to-Production Website Builder

---

## Project Overview

Wizardry AI is Akash's flagship SaaS project.

It transforms natural language prompts into fully functional websites using a two-stage LLM pipeline. Instead of generating static templates, the platform allows users to iteratively build, edit, preview, version, and deploy websites through conversational AI.

The project was designed to explore production-grade AI product engineering rather than simply integrating an LLM API.

---

## Why was it built?

Most AI website builders generate a single output and stop there.

Akash wanted to build a system where users could continuously refine their website just by chatting, similar to collaborating with a frontend engineer.

Example:

User: "Create a modern SaaS landing page."

↓

AI generates HTML + Tailwind

↓

User: "Make the navbar sticky and dark."

↓

Previous code is reused as context

↓

AI returns an updated version

Every iteration is preserved as a version.

---

# Core Features

- Prompt → Website generation
- Two-stage LLM architecture
- Live streaming code generation
- Visual no-code editor
- Responsive preview (Desktop / Tablet / Mobile)
- Version history & rollback
- Stripe credit system
- Community showcase
- Authentication & user projects

---

# System Architecture

Frontend (React + TypeScript)

↓

Express API

↓

Prompt Enhancer (LLM #1)

↓

Code Generator (LLM #2)

↓

SSE Streaming

↓

Sandboxed iframe Preview

↓

PostgreSQL (Version Storage)

The backend acts as the orchestrator for authentication, AI requests, payments, and persistence.

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI

## Backend

- Node.js
- Express
- Prisma ORM
- Better Auth

## Database

- PostgreSQL (Neon)

## AI

- OpenRouter
- Claude
- GLM
- Llama

## Payments

- Stripe Checkout
- Webhooks
- Atomic Transactions

---

# Engineering Highlights

## 1. Two-Stage AI Pipeline

Instead of sending the user's prompt directly to the coding model, Wizardry AI performs two independent LLM calls.

### Stage 1

Converts a casual prompt into a detailed technical specification.

Example:

"Build me a fintech homepage"

↓

Structured design brief

- Hero
- Pricing
- CTA
- Colors
- Layout

### Stage 2

Generates semantic HTML + Tailwind CSS from that structured brief.

This significantly improves consistency compared to single-prompt generation.

---

## 2. Live Streaming

Rather than waiting 20–30 seconds for the complete response, generated code streams progressively using **Server Sent Events (SSE)**.

Benefits:

- Better perceived performance
- Real-time preview
- Lower abandonment
- ChatGPT-like experience

---

## 3. Visual Editor

One of the most difficult parts of the project.

The generated website is rendered inside a sandboxed iframe.

The editor communicates through the **postMessage API**, allowing safe DOM manipulation without breaking browser security boundaries.

Users can edit:

- Colors
- Typography
- Spacing
- Components
- Layout classes

without directly touching code.

---

## 4. Version Control

Every AI iteration is stored.

Version 1

↓

Version 2

↓

Version 3

↓

Rollback anytime

Instead of overwriting previous generations, users can restore any historical state.

---

## 5. Credit System

Wizardry AI uses a credit-based SaaS model.

Flow:

User purchases credits

↓

Stripe Checkout

↓

Webhook verification

↓

Prisma transaction

↓

Credits updated

Credits are never modified directly from the frontend.

The webhook is the only trusted source of payment confirmation.

---

# Biggest Challenges

### Challenge 1

LLMs often produced inconsistent layouts.

**Solution**

Separate prompt enhancement from code generation.

---

### Challenge 2

Unsafe HTML rendering.

**Solution**

Sandboxed iframe with controlled communication.

---

### Challenge 3

Preventing double-spend during payments.

**Solution**

Prisma atomic transactions combined with verified Stripe webhooks.

---

# What Akash Learned

Wizardry AI taught Akash that building AI products is less about calling an API and more about designing reliable systems around the model.

His biggest takeaways were:

- Prompt engineering
- Streaming architectures
- AI UX
- Payment reliability
- State management
- Versioned persistence

He considers Wizardry AI the strongest representation of his product engineering ability.

---

# FAQ

### Is Wizardry AI just another ChatGPT wrapper?

No.

The value comes from the orchestration layer: prompt enhancement, streaming, visual editing, version control, authentication, and SaaS infrastructure—not simply forwarding prompts.

### Why SSE instead of WebSockets?

The generation flow is strictly one-way (server → client). Server Sent Events provide a simpler, lighter protocol for streaming LLM responses.

### Why PostgreSQL?

Projects, users, versions, and payments all require strong transactional integrity, making PostgreSQL a better fit than a document database.

### What makes this project unique?

The combination of conversational website generation, visual editing, iterative refinement, and production-ready SaaS architecture makes it much closer to a real product than a portfolio demo.