<div align="center">

<br />

# H O M E V A U L T

### The Intelligence Layer for Everything You Own

<br />

**HomeVault is a centralized home-asset intelligence system** — a single source of truth for the homes, rooms, assets, warranties, and maintenance history that define modern ownership. Built for precision. Engineered for scale. Designed to disappear into the background until the moment you need it.

<br />

[![Status](https://img.shields.io/badge/STATUS-PRODUCTION-0A0A0A?style=for-the-badge&labelColor=000000&color=00E599)](https://homevault-394l.vercel.app/)
[![Deployment](https://img.shields.io/badge/DEPLOYED-VERCEL-0A0A0A?style=for-the-badge&labelColor=000000&color=FFFFFF)](https://homevault-394l.vercel.app/)
[![Database](https://img.shields.io/badge/DATABASE-NEON_POSTGRESQL-0A0A0A?style=for-the-badge&labelColor=000000&color=00E5FF)](https://neon.tech)
[![License](https://img.shields.io/badge/LICENSE-PROPRIETARY-0A0A0A?style=for-the-badge&labelColor=000000&color=BFBFBF)](#)

<br />

[**Live Product**](https://homevault-394l.vercel.app/) · [Architecture](#-architecture-overview) · [Core Capabilities](#-core-capabilities) · [Engineering](#-engineering-challenges) · [Roadmap](#-future-roadmap)

<br />

</div>

<br />

---

<br />

## 01 · Product Vision

> **Ownership generates data. Almost none of it is captured.**

Every home is a living system — assets that depreciate, warranties that expire, equipment that requires maintenance on a schedule no one remembers. This information exists, but it lives nowhere. It is scattered across email receipts, physical folders, group chats, and memory.

HomeVault was built on a simple thesis: **home ownership deserves the same structured, queryable, always-available data layer that modern businesses apply to their operations.** Not a note-taking app. Not a spreadsheet. A purpose-built system of record — with relationships, ownership boundaries, and status intelligence engineered in from the schema up.

The product philosophy is deliberately restrained: **no clutter, no gamification, no noise.** A dashboard that tells you exactly what you own, what condition it's in, and what needs attention — nothing more, nothing less.

<br />

---

<br />

## 02 · The Problem

Homeowners operate without a system.

| Failure Mode | Consequence |
|---|---|
| No centralized asset registry | Insurance claims, resale valuations, and estate planning become guesswork |
| Warranty documents scattered or lost | Coverage windows expire silently — free repairs and replacements go unclaimed |
| No structured maintenance history | Equipment fails prematurely from inconsistent or forgotten upkeep |
| Fragmented across homes and rooms | No hierarchy, no organization, no way to reason about a property at scale |
| Generic tools misapplied to the problem | Spreadsheets and note apps were never designed for relational ownership data |

The result is a systemic blind spot in one of the largest financial and logistical responsibilities a person carries.

<br />

---

<br />

## 03 · The Solution

**HomeVault replaces fragmented memory with structured infrastructure.**

At its core is a relational data model that mirrors how ownership actually works: a user owns homes, homes contain rooms, rooms contain assets, and assets carry optional warranty coverage and a maintenance history. This is not a flat list — it is a hierarchy, enforced at the database level, queryable in real time.

The platform continuously computes state — active warranties, expiring coverage, portfolio valuation, maintenance due — and surfaces it through a single dashboard. No manual reconciliation. No stale spreadsheets. The system knows what you own before you have to think about it.

<br />

---

<br />

## 04 · Core Capabilities

<table>
<tr>
<td width="50%" valign="top">

### `AUTH-01` Authentication Engine
Credential-based identity with hashed password storage and session-scoped access control via Auth.js. Every request is authenticated at the edge; every resource is authorized against its owner before a single row is returned.

</td>
<td width="50%" valign="top">

### `HOME-01` Home Management
The top-level container in the ownership hierarchy. Users provision, edit, and retire properties as independent units — each acting as the root node for everything beneath it.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### `ROOM-01` Room Management
Spatial organization beneath each home. Rooms give physical structure to digital inventory, allowing assets to be reasoned about the way they actually exist in the real world.

</td>
<td width="50%" valign="top">

### `ASSET-01` Asset Tracking
The core registry. Every item is captured with category, valuation, acquisition date, and room placement — forming the backbone of portfolio-level financial intelligence.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### `WARR-01` Warranty Intelligence
Coverage windows are tracked per-asset and evaluated continuously. Status — active, expiring, expired — is computed automatically and surfaced before a claim window closes.

</td>
<td width="50%" valign="top">

### `MAINT-01` Maintenance Records
A structured service history per asset — type, date, notes — building a longitudinal record that informs future upkeep and demonstrates asset condition over time.

</td>
</tr>
<tr>
<td width="100%" valign="top" colspan="2">

### `DASH-01` Command Dashboard
The synthesis layer. Portfolio value, active warranty count, tracked assets, and home count — computed in real time and rendered as a single, authoritative view of everything you own.

</td>
</tr>
</table>

<br />

---

<br />

## 05 · Architecture Overview

HomeVault runs on a unified, full-stack request pipeline — no microservice sprawl, no unnecessary network hops. Every layer has one job.

```
┌─────────────────────────┐
│           User           │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│         Frontend          │
│     Next.js · React       │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│         API Layer         │
│    Next.js Route Handlers │
│   Auth · Validation Layer │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│        Prisma ORM         │
│   Type-Safe Query Engine  │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│        PostgreSQL         │
│    Relational Data Store  │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│  Neon Cloud Infrastructure │
│  Serverless · Autoscaling │
└─────────────────────────┘
```

<details>
<summary><strong>Expand — Layer Responsibilities</strong></summary>

<br />

| Layer | Responsibility |
|---|---|
| **User** | Initiates authenticated requests from any modern browser |
| **Frontend** | Presentation, interaction, and client-side state — Next.js App Router + React |
| **API Layer** | Request validation, session verification, ownership enforcement, business logic |
| **Prisma ORM** | Compile-time type-safe translation between application code and SQL |
| **PostgreSQL** | Relational integrity, constraint enforcement, durable storage |
| **Neon Cloud Infrastructure** | Serverless compute, autoscaling, connection pooling, zero-maintenance ops |

</details>

<br />

---

<br />

## 06 · Technology Stack

<div align="center">

### Frontend Layer

| Technology | Role |
|:---|:---|
| **Next.js** | Full-stack React framework — unified frontend and API surface |
| **React** | Component architecture and client-side interactivity |
| **Tailwind CSS** | Utility-first design system for consistent, rapid UI development |

<br />

### Backend & Data Layer

| Technology | Role |
|:---|:---|
| **Prisma** | Type-safe ORM and schema-driven migration engine |
| **PostgreSQL** | Primary relational data store |
| **Neon PostgreSQL** | Serverless cloud database with autoscaling and pooled connections |
| **Auth.js (NextAuth)** | Session-based authentication and route protection |

<br />

### Infrastructure

| Technology | Role |
|:---|:---|
| **Vercel** | Production hosting, CI/CD, and global edge delivery |

</div>

<br />

---

<br />

## 07 · Database Design

The schema encodes a strict ownership hierarchy — every record traces back to exactly one user, enforced by foreign key constraints and validated again at the API layer.

```
User ──< Home ──< Room ──< Asset ──── Warranty      (1 : 0..1)
                              │
                              └──< MaintenanceRecord  (1 : many)
```

| Relationship | Cardinality | Description |
|---|:---:|---|
| `User → Home` | 1 : many | A user owns one or more independent properties |
| `Home → Room` | 1 : many | A home is subdivided into organizational spaces |
| `Room → Asset` | 1 : many | An asset is scoped to a physical location |
| `Asset → Warranty` | 1 : 0..1 | Coverage is optional and, when present, unique to the asset |
| `Asset → MaintenanceRecord` | 1 : many | A full, chronological service history per asset |

This structure allows the platform to answer complex portfolio questions — total value, coverage exposure, maintenance velocity — with a single, efficient query rather than application-level aggregation.

<br />

---

<br />

## 08 · Security & Authentication

Authentication is treated as infrastructure, not a feature.

- **Credential hashing** — passwords are never stored in plaintext; industry-standard hashing is applied before persistence.
- **Session-scoped access** — Auth.js issues and validates session tokens on every protected request.
- **Server-side ownership enforcement** — every API route independently verifies that the requesting user owns the resource being accessed or mutated, regardless of what the client claims.
- **Zero client-trust model** — authorization decisions are never made in the browser; the API layer is the single source of truth.

<br />

---

<br />

## 09 · Deployment Infrastructure

| Component | Platform | Notes |
|---|---|---|
| **Application Hosting** | Vercel | Continuous deployment on every push to `main`, global edge network |
| **Database** | Neon PostgreSQL | Serverless Postgres with autoscaling compute and connection pooling |
| **Schema Migrations** | Prisma Migrate | Version-controlled, deterministic schema evolution across environments |
| **Environment Configuration** | Vercel Environment Variables | Isolated secrets and connection strings per deployment target |

<br />

---

<br />

## 10 · Engineering Challenges

<details open>
<summary><strong>Case Study — From Localhost to Production-Grade Infrastructure</strong></summary>

<br />

**The Signal**
Early deployments to Vercel returned intermittent 500 errors on every database-backed route, despite the application functioning correctly in local development.

**The Diagnosis**
Root-cause analysis traced the failure to environment topology: the connection string pointed to `localhost`, a network target unreachable from Vercel's serverless execution environment. A database reachable only from a developer's machine cannot serve a production deployment — a foundational but easy-to-miss architectural gap.

**The Fix**
The data layer was migrated to **Neon PostgreSQL**, a serverless, network-accessible Postgres provider purpose-built for edge and serverless runtimes. Prisma's migration history was replayed against the new database to guarantee zero schema drift between environments.

**Second-Order Issues Resolved**

| Issue | Resolution |
|---|---|
| Connection exhaustion under serverless load | Prisma Client refactored to a singleton, reusing connections across invocations |
| Environment variable mismatch (local vs. production) | Strict separation enforced between `.env` and Vercel's environment configuration, with every variable documented and verified pre-deploy |
| Session inconsistency across environments | NextAuth secret and callback URLs explicitly scoped to the production domain |
| Opaque production failures | Structured server-side logging added to isolate root causes without exposing internals to the client |
| Cold-start latency on idle databases | Request handling adjusted to tolerate Neon's serverless compute wake-up window |

**The Outcome**
A production system with clean separation between development and deployment environments, resilient connection handling, and observable failure modes — the difference between a project that runs locally and a product that runs in production.

</details>

<br />

---

<br />

## 11 · Performance & Scalability

HomeVault is architected for **serverless-native scale** from day one — no infrastructure to provision, no servers to manage.

- **Autoscaling compute** — Neon scales database compute up and down with demand; Vercel scales the application layer identically.
- **Connection-efficient data access** — Prisma Client is instantiated as a singleton to prevent connection exhaustion under concurrent serverless invocations.
- **Type-safe query layer** — Prisma eliminates an entire class of runtime data errors at compile time, reducing production failure surface.
- **Edge-delivered frontend** — Vercel's global edge network serves the application close to the user, minimizing latency regardless of geography.
- **Stateless request model** — every API route is independently scalable, with no shared in-memory state to bottleneck under load.

The result is a system with a near-zero idle cost and a scaling ceiling defined by the underlying cloud infrastructure — not by the application architecture.

<br />

---

<br />

## 12 · Future Roadmap

<div align="center">

| Phase | Capability | Status |
|:---|:---|:---:|
| **01** | AI-Powered Maintenance Prediction — proactive service alerts based on asset type and usage patterns | `Planned` |
| **02** | Smart Asset Recognition — computer-vision-assisted asset entry from photos | `Planned` |
| **03** | Barcode / QR Scanning — instant asset logging via product identifiers | `Planned` |
| **04** | Multi-User Households — shared portfolio access across family members | `Planned` |
| **05** | Native Mobile Applications — iOS and Android companion apps | `Planned` |
| **06** | Analytics Platform — depreciation curves, spend trends, portfolio insights | `Planned` |

</div>

<br />

---

<br />

## 13 · Live Product

<div align="center">

### The platform is live in production.

**[https://homevault-394l.vercel.app/](https://homevault-394l.vercel.app/)**

<br />

[![Launch HomeVault](https://img.shields.io/badge/LAUNCH_HOMEVAULT-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://homevault-394l.vercel.app/)

</div>

<br />

---

<br />

<div align="center">

## Final Statement

<br />

**HomeVault is not a project. It is infrastructure for a category that never had any.**

Home ownership generates a lifetime of data — value, coverage, condition, history — and until now, none of it has been captured with the rigor it deserves. HomeVault exists to change that: a single, secure, always-current system of record for everything you own.

*Built for permanence. Engineered for scale. Designed to be the last home inventory system anyone needs.*

<br />

---

<br />

**HOMEVAULT** · Production System · 2026

</div>
