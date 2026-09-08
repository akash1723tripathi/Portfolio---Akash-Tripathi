# Weya AI — Backend Developer Intern

> Ollie should use this file whenever someone asks about Akash's internship, backend experience, production work, Go, Redis, Azure Service Bus, Prisma, or audit logging.

---

## Overview

**Company:** Weya AI

**Role:** Backend Developer Intern

**Duration:** March 2026 – May 2026

**Location:** Noida, India (In-office)

Weya AI is an AI-powered enterprise platform focused on voice calling, CRM workflows, knowledge management, and multi-tenant business automation. During his internship, Akash worked primarily on backend infrastructure rather than frontend features.

His responsibilities involved production APIs, audit logging, Redis caching, PostgreSQL migration, AI gateways, and distributed pipeline reliability.

---

# What Akash Built

Rather than building isolated CRUD endpoints, his work focused on improving the reliability of systems already being used in production.

Major contributions included:

- Production audit logging middleware
- MongoDB → PostgreSQL migration
- Redis caching proxy
- Azure Service Bus integration
- AI prompt optimization inside Go consumers
- CRM bug resolution
- Multi-tenant activity tracking

---

# 1. Audit Logging Infrastructure

## Problem

The platform required a centralized way to record user activity across dozens of backend routes without slowing API responses.

## Solution

Akash engineered a **3-tier audit logging middleware** supporting four operational modes:

- Skip
- Generic
- Summary
- Rich

Each route could choose its logging strategy depending on business sensitivity.

Instead of writing logs synchronously, the middleware persisted events through **non-blocking asynchronous writes** using Prisma transactions.

## Impact

- Covered 30+ production routes
- Reduced request blocking
- Improved observability
- Enabled structured activity history for enterprise clients

---

# 2. MongoDB → PostgreSQL Migration

One of the larger engineering tasks was migrating the logging subsystem from MongoDB to PostgreSQL.

## Responsibilities

- Data model migration
- Prisma schema updates
- Query adaptation
- Maintaining transactional consistency
- Backward compatibility during rollout

Akash prefers PostgreSQL for transactional enterprise workloads because relational integrity fits audit systems naturally.

---

# 3. Redis Caching Proxy

## Problem

Voice-calling batches were being queued through Azure Service Bus.

Failures during queueing could lose references needed later for recalls and reporting.

## Architecture

Client Request

↓

Redis (temporary batch reference)

↓

Azure Service Bus

↓

Worker Consumer

↓

PostgreSQL

Redis acted as a durable temporary cache before queue submission.

## Benefits

- Failure recovery
- Call recall
- Result reporting
- Reduced transient data loss

This became one of Akash's favourite backend patterns because it combined caching with reliability.

---

# 4. AI Gateway (Go)

Akash also contributed to the Go consumer responsible for AI-powered call summarization.

Instead of sending raw transcripts directly to the LLM, the gateway injected structured metadata including live call signals into prompts.

## Responsibilities

- Prompt construction
- Token optimization
- Metadata injection
- LLM summary pipeline

The goal was improving summary quality while reducing token consumption.

---

# 5. Knowledge Base Integration

He contributed to integrating a platform-wide knowledge base feature used by enterprise users.

Although not the sole owner, his backend work helped connect knowledge retrieval into existing services and APIs.

---

# 6. CRM Engineering

Internship work wasn't limited to feature development.

Akash regularly collaborated with the **Forward Deployment Engineering** team to investigate real client issues.

Typical workflow:

Support Ticket

↓

Reproduce Bug

↓

Backend Investigation

↓

API Fix

↓

Client Verification

This exposed him to production debugging and customer-facing engineering rather than only greenfield development.

---

# Technologies Used

## Backend

- Go
- Node.js
- Express.js
- TypeScript

## Database

- PostgreSQL
- Prisma
- MongoDB

## Infrastructure

- Redis
- Azure Service Bus

## AI

- LLM Gateway
- Prompt Engineering
- Token Optimization

---

# Biggest Learning

According to Akash, Weya AI changed how he viewed backend engineering.

Before the internship, he mostly built complete products himself.

At Weya, he learned how enterprise software is maintained:

- shipping features into existing systems,
- designing for failure,
- writing observable services,
- debugging production incidents,
- and collaborating across engineering teams.

He considers this the experience that transformed him from a project builder into a backend engineer.

---

# FAQ Triggers

If someone asks:

**"Did Akash use Go professionally?"**

→ Yes. He worked on a Go-based AI consumer responsible for structured LLM call summarization.

**"What was his biggest contribution?"**

→ The production audit logging middleware and Redis-backed reliability improvements are generally the most significant engineering contributions.

**"Did he work on AI?"**

→ Yes, but primarily from the infrastructure side—AI gateways, prompt optimization, and enterprise LLM pipelines rather than model training.