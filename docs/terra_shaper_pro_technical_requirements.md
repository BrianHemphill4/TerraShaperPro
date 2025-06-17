# TerraShaper Pro – Technical Requirements v2

---
**V2 Changelog (June 17, 2025):**
- **Architecture:** Decoupled the API Gateway from the background render jobs. Introduced a separate `Render Worker` service for better scalability and separation of concerns.
- **Prompt Engineering:** Replaced the static, generic prompt with a `Dynamic Prompt Generation` engine. This is a critical change to improve render quality and consistency.
- **Quality Assurance:** Enhanced the QA process from a vague "pixel-difference" to a concrete `pHash` analysis to detect unwanted image alterations.
- **AI Abstraction:** Introduced an `AI Render Service Abstraction Layer` to mitigate vendor lock-in with AI models.
- **Data Model:** Updated the ERD to include a `license` field for assets and a `prompt_hash` for renders to enable caching.
- **Risk Management:** Added a new risk for "Poor render quality" and strengthened the mitigation strategy for vendor lock-in.
- **AI Models:** Explicitly named `Google Imagen-4-Ultra` and `OpenAI gpt-image-1` as the initial supported models.
---

## 1. Product Scope & Objectives

### 1.1 Vision Statement & Strategic Goals

Deliver a **sub-60-second 4 K-render landscape-design SaaS** optimized explicitly for Texas landscaping contractors working in USDA hardiness zones 8a–9a. Our success metrics:

- **Render SLA**: 95% of 4 K renders completed in ≤60 seconds end-to-end (from request to storage). Latency logged and trended daily.
- **Adoption**: Onboard 20 pilot firms within 30 days of private beta launch, with a 70% engagement rate (≥5 project creations each).
- **Retention**: Achieve 80% monthly active usage among Starter and Pro subscribers after three months.

Core pillars:

1. **Instant-design Canvas**
   - Desktop-first sketching on site photos: drag-and-drop placement, polygon masks, and parametric tools. No local installs required; ideal for Windows/Mac browsers. (Mobile deferred to Phase 2.)
   - Live asset search powered by indexed tags (category, species, color, USDA zone).
   - **Onboarding flow**: Guided tooltips, optional interactive tutorial, and context-sensitive help links.
2. **Guaranteed 4 K Render ≤60 s**
   - Backend orchestration triggers Imagen‑4‑Ultra calls with optimized prompt templates. SLA measured at 4 points: queue time, API time, post-processing, CDN sync.
   - Auto-upscaling fallback via Real‑ESRGAN if vendor model degrades or size mismatch.
   - **Credits dashboard**: Real-time usage graph and projected monthly consumption.
3. **Right-sized Collaboration & Scalability**
   - Supports 1–30 seats in MVP with role-based ACL. Architecture built on multi-tenant Postgres schema; scales to 100+ seats by horizontal shard expansion.
   - **Team workflows**: Shared projects, version history, comments on renders.
   - **Enterprise readiness**: Audit logs, single sign-on (future), and tenant isolation.

### 1.2 Design Principles & Technical Alignments

- **Zero-learning-curve UX**
  - Home screen displays single large "Start Design" CTA. Inline tooltips, keyboard shortcuts cheat-sheet, and full searchable docs.
  - Contextual microcopy explains tool modes: polygon vs. polyline vs. asset.
- **Speed-first Operations**
  - Client bundle ≤200 KB gzipped, service-worker caches static assets. Initial TTI <1.2 s on LTE.
  - All synchronous interactions (e.g., create shape, move asset) target <150 ms.
  - Async tasks (render) offloaded to BullMQ queue with visible progress.
- **No Vendor Lock-in for Clients**
  - Users retain layered JSON exports of annotation objects and raw render PNGs.
  - Data export API with a stable, documented JSON Schema for project metadata and assets.
- **Compliance-by-design**
  - Exclude California geolocation sign-ups

### 1.3 Out-of-Scope (MVP)

- CAD exports (DXF, DWG, or Revit).
- Complex cost/estimator and BOM generation.
- AR/VR immersive walkthroughs.
- Mobile-optimized UI (Phase 2 backlog).
- California user onboarding, CCPA-specific flows, and localized consent banners.

---

## 2. Personas, Roles & Permissions

| Persona            | Primary Goals                                                        | Role Mapping | Key Pain Points Solved                              |   |   |   |
| ------------------ | -------------------------------------------------------------------- | ------------ | --------------------------------------------------- | - | - | - |
| **Business Owner** | Close deals faster, ensure team stays productive, see ROI on renders | *Owner*      | Slow client approvals, manual vendor quoting        |   |   |   |
| **Lead Designer**  | Iterate concepts, wow homeowners                                     | *Designer*   | Clunky Photoshop workflows, repeated plant searches |   |   |   |
| **Crew Lead**      | View final plan during install                                       | *Viewer*     | Reading architect blueprints, missing plant photos  |   |   |   |
| **Office Admin**   | Manage billing, seats, render credits                                | *Owner*      | Manual invoicing, budget overruns                   |   |   |   |

### Permission Matrix (delta vs previous)

- **Admin** (superset of Owner) added for future enterprise tier (RLS schema prepared).
- Granular project‑level ACLs implemented via row‑level policy in Supabase.

---

## 3. Functional Requirements

### 3.1 Project Lifecycle

1. **Create Project** → Name, client contact, site address (optional to avoid PII).
2. **Upload Scenes** → Accept JPEG/PNG/HEIC; server side converts HEIC → PNG; auto‑compress below 10 MP while storing original.
3. **Versioning** → Each render spawn creates new *version* record; view diff overlay.
4. **Archive/Restore** → Soft‑delete with 30‑day grace

### 3.2 Design Workspace (see PDF UI)

#### 3.2.1 Core Canvas & Annotation

- **Annotation Objects**
  - `mask` (freeform polygon) – defines replace‑area for Imagen prompt.
  - `assetInstance` – links to `assets.id`, stores category, class, material, color, style, geometry, and tool properties.
  - `textLabel` – optional overlay for callouts or measurements.
- **Snapping & Guides** – 24 px grid; magnetic edges; angle snapping at 15° increments.
- **Multi‑select & Group** – Shift+click or drag to select multiple objects; group/ungroup for batch transforms.

#### 3.2.2 Parametric Object Composition UX

**Overview** Shift from icon‑only drag‑and‑drop to a parametric composition flow for both area‑ and line‑based elements (e.g. mulch beds, gravel drives, edging). This maximizes precision, enforces consistency, and avoids managing hundreds of discrete thumbnails.

**Selection & Tool Routing**

1. **Search & Filter**: top‑aligned bar with facets:
   - [Search Bar] [Favorites] [Category > Class > Material > Color Swatch > Size/Style]
   - Example: `Mulch → Organic Mulch → Shredded Bark → Brown → Standard`
2. **Parametric Pick**: selecting an entry auto‑activates the correct drawing tool:
   - **Area tool** for beds, turf, gravel
   - **Line tool** for edging, hoses, lighting runs
3. **Floating Preview**: a semi‑transparent swatch and label follows the cursor until first click.

**Drawing & Commit**

- **Area drawing**: click‑to‑place vertices; press Enter to close polygon. Fills with material texture.
- **Line drawing**: click for start; click for each waypoint; Enter to finish. Configurable width & smoothing.
- **Live Properties Panel**: after commit, side panel shows:
  ```
  [Material] Black Dyed Mulch
  [Width] 6" (editable slider)
  [Smoothing] Enabled (checkbox)
  ```

**Right‑Click Context Menu (for lines & areas)**

- [Bring Forward]

- [Send Backward]

- [Move Forward]

- [Move Backward]

- [Duplicate]

- [Delete]

- [Rotate] ← opens rotation handle or numeric input (degrees)

- [Flip Horizontal]

- [Flip Vertical]

- [Make Favorite] ← stars the assetInstance for quick access in Favorites

- [Edit Width] ← numeric input or slider

- [Toggle Smoothing] ← checkbox

- [Bring Forward] [Send Backward] [Duplicate] [Delete]

- [Edit Width] ← numeric input or slider

- [Toggle Smoothing] ← checkbox

**Smart Defaults & Personalized Overrides**

- Default smoothing ON for polylines; can be toggled per instance.
- Area shapes auto‑close if last vertex within 10 px of first.
- Undo/Redo stacks handle individual vertex edits.
- **Personalization**: Users can set their own default materials and styles (e.g., "always use black mulch for new beds") in their user profile, which override the system defaults.

#### 3.2.3 Plant & Tree Icon Drag‑and‑Drop

- **Asset Palette** tabs: Plants & Trees / Hardscape / Other.
- **Drag‑and‑Drop**: click or drag icon from palette onto canvas; ghost preview indicates placement.
- **Parametric Placement**: upon drop, system prompts for rotation, scale, and count (if clustering plants).
- **Batch Placement Mode**: hold Shift to stamp repeated instances along a path or within a region.
- **Instance Metadata**: stores rotation, scale, count, and linked `asset.id` for render prompt.

*Next → 3.3 Asset Palette & Catalog*### 3.3 Asset Palette & Catalog

- **Backend ingest pipeline**: CSV→Supabase row create; image files pushed to `assets/` bucket. Cloud Function auto‑generates 256×256 WebP thumbs and dominant‑color JSON.
- **Tag taxonomy**: category>sub‑category>species; Sun Preference (Full Sun, Partial Sun, Full Shade); Maintenance Level (1–5); Drought Resistant (1–5); Disease Risk (1–5).



### 3.4 Render Request Flow

#### 3.4.1 Data Preparation

- **Frame Image**: Signed URL to the full-resolution current canvas export (JPEG/PNG ≥ 4096×4096), with any masks already applied client-side (areas requiring removal have been erased).
- **Metadata**: JSON summary of all annotation objects (`mask`, `assetInstance`, `textLabel`) on the canvas. This structured data is the input for the Dynamic Prompt Generation engine.

#### 3.4.2 Dynamic Prompt Generation

The quality of the final render is critically dependent on the quality of the prompt. A generic prompt is insufficient. A **Prompt Templating Engine** will be developed to translate the structured `annotations` data into a rich, descriptive prompt for the generative model.

- **System Prompt** (static):
  > "You are a professional landscape visualization engine. Your task is to modify a source image based on specific instructions. Produce a natural, high-resolution 4K photograph by seamlessly integrating all requested landscaping elements. Pay close attention to matching the existing lighting, perspective, and shadows to create a cohesive, photorealistic scene."

- **Dynamic User Prompt** (generated from annotations):
  The engine will iterate through the `assetInstance` list and construct a narrative prompt.
  - **Example Input (JSON from canvas):**
    ```json
    [
      { "asset": "Red Maple", "type": "tree", "position": [250, 400], "scale": 1.2 },
      { "asset": "Black Mulch", "type": "area", "polygon": [[...]], "coverage": "3-inch depth" }
    ]
    ```
  - **Example Output (Generated Text):**
    ```text
    In the user-provided image, perform the following modifications. In the area defined by the polygon mask, add a 'Red Maple' tree at approximate coordinates (250, 400), scaled to 120% of its default size. Ensure its autumn foliage is vibrant. Fill the specified polygonal area with 'Black Mulch' to a depth of 3 inches. The final output should be a single, cohesive 4096×4096 image.
    ```

#### 3.4.3 API Payload & Abstraction

To avoid vendor lock-in, all model interactions will be routed through an internal **AI Render Service Abstraction Layer**. This layer is responsible for translating the generic prompt into the specific API format required by the chosen vendor. The initial implementation will support adapters for **Google Imagen-4-Ultra** and **OpenAI gpt-image-1**.

- **Example Payload (to internal service):**
  ```json
  {
    "sourceImageUrl": "gcs://...",
    "maskImageUrl": "gcs://...",
    "prompt": {
      "system": "You are a professional...",
      "user": "In the user-provided image, perform..."
    },
    "output": { "format": "PNG", "resolution": [4096, 4096] }
  }
  ```

#### 3.4.4 Error Handling & Quality Assurance

- **Retries**: On transient errors, retry up to 2× with exponential backoff.
- **Smart Retries**: On the first failure, the prompt is slightly modified (e.g., appending "ensure high quality and photorealism") before the second attempt.
- **Quality Check**:
  - **Primary Check (Automated)**: Use a perceptual hash (pHash) to measure the perceptual distance between the original, unmasked image areas and the final render. If the hash distance exceeds a calibrated threshold, the render is flagged as a potential failure, as it indicates the model altered parts of the image it shouldn't have.
  - **Secondary Check (Future)**: For v1.2, develop a lightweight visual AI model to score renders on key criteria (e.g., artifacting, realism, prompt adherence).
- **Quota Enforcement**: Verify render quota before submission; return 402 with checkout link if exceeded.

---

## 4. Non‑Functional Requirements

- **Performance budgets**: JS bundle ≤ 200 KB gzipped; first contentful paint ≤ 1.1 s on LTE.
- **Accessibility**: WCAG 2.2 AA; color‑blind safe palette; keyboard shortcuts for every tool.
- **Internationalization**: I18n architecture ready; only en‑US strings initially. Currency localized via Stripe.
- **Disaster Recovery**: Daily Postgres WAL‑level backups; GCS bucket versioning 30 days; RTO 4 h, RPO 1 h.
- **Data Retention policy**: Delete soft‑deleted projects > 90 days; purge render job logs > 180 days.
- **Legal**: COPPA not applicable; GDPR minimal footprint but Data Processing Addendum kept in legal repo.

---

## 5. System Architecture

### 5.1 Macro Diagram

The system is composed of a Next.js client, a tRPC API Gateway, and a separate Render Worker service. This decouples the user-facing API from the resource-intensive rendering tasks, ensuring the application remains responsive.

```mermaid
graph TD
    subgraph User Facing
        A[Next.js Client]
    end

    subgraph Backend Services
        B[Edge CDN]
        C[tRPC Gateway - Cloud Run]
        D[Render Worker - Cloud Run]
    end

    subgraph Data & AI
        E[BullMQ - Redis]
        F[AI Render Service]
        G[GCS - Storage]
        H[Postgres - Supabase]
    end
    
    subgraph AI Models
        F1[Google Imagen-4-Ultra]
        F2[OpenAI gpt-image-1]
    end

    A <--> B <--> C
    C -- Enqueue Job --> E
    E -- Dequeue Job --> D
    D -- Calls --> F
    F -- Routes to --> F1
    F -- Routes to --> F2
    D -- Stores/Reads --> G
    C -- CRUD --> H
```

### 5.2 Front-End Details Front‑End Details

- **Leveraging shadcn/ui** & Tailwind.
- Zustand store in-memory; autosave throttled to backend whenever a stable internet connection is detected (simpler state layer).
- PWA manifest for installable experience; service‑worker caches catalog assets.

### 5.3 Back‑End Services & Queue Configuration

| Service        | Runtime           | Responsibility                                           | Autoscale Target |
| -------------- | ----------------- | -------------------------------------------------------- | ---------------- |
| API Gateway    | Node 20 (Fastify) | Type-safe tRPC endpoints for auth, project CRUD, assets. | CPU 70%          |
| Render Worker  | Node 20           | Processes `renderQueue` jobs from BullMQ, calls AI Service.  | CPU 70%          |
| Notification   | Node 20           | Email + in-app toast via Postmark.                       | Low              |

**Queue Setup (BullMQ)**

- **Redis**: hosted MemoryStore; single instance with failover.
- **Queue Name**: `renderQueue` with priority support.
- **Concurrency**: Render Worker instances each process up to 5 jobs in parallel.
- **Priority Rules**:
  - Job options include `priority` (integer 1–10). Assign `Starter` plan users priority `5`, `Pro` `3`, `Growth` `1` (lower number = higher priority).
  - If overall job wait time >120 s for Starter jobs, temporarily elevate their priority.
- **Rate-Limiting**:
  - Per-user and per-organization buckets (max 2 jobs/min for Starter, 10 jobs/min for Pro, 20 jobs/min for Growth).
  - Implemented via BullMQ throttler plugin.
- **Error Handling**: automatic retries up to 2×; backoff strategy: fixed 1 s.
- **Monitoring**:
  - Expose queue metrics (`waiting`, `active`, `completed`, `failed`) via Prometheus endpoint on `/metrics` for both Gateway and Worker.
  - Alerts if average wait time >60 s or failure rate >5 % over 10 min.

**Throughput Targets & Autoscaling**:

- **Per-Instance Throughput**: Each gateway instance (processing 5 concurrent jobs) handles ~150 renders/hour based on a 60 s average render time.
- **Scaling Configuration**:
  - Minimum instances: 2; Maximum instances: 20.
  - **Scale-Out Trigger**: Add an instance when `waiting` jobs >15 for 2 min.
  - **Scale-In Trigger**: Remove an instance when `waiting` jobs <5 for 5 min.
- **Hourly Capacity**: At max scale (20 instances), supports up to 3,000 renders/hour.
- **Rate-Limit Enforcement**: Enforce per-org burst limit of 10 jobs in any 1 min window, smoothing spikes.

**Dependency Cleanup**:

- Remove Python runtime and related Azure/Google client SDKs; use Node `@google-cloud/aiplatform` and `openai` libraries.
- Eliminate separate worker Dockerfile; single Docker image for tRPC gateway.
- Prune unused libraries (Fabric.js for front-end, no server-side image libs).

### 5.4 DevOps & CI/CD DevOps & CI/CD

DevOps & CI/CD

- GitHub Actions: PR → unit & e2e tests (Playwright) → container build for Gateway and Worker → deploy to Cloud Run staging → Cypress smoke.
- Terraform provisions: Cloud Run services, Redis, SQL Instance, GCS buckets, Secret Manager.
- **Blue‑green deploys** to avoid downtime; feature flags via LaunchDarkly.

### 5.5 Data Model (full)

```mermaid
erDiagram
  users ||--o{ user_projects : "creates"
  projects ||--o{ scenes : contains
  scenes ||--o{ scene_versions : versions
  scene_versions ||--o{ annotations : has
  scenes ||--o{ renders : produces
  renders ||--|{ render_files : outputs
  annotations }o--|| assets : references
  audit_logs ||--|| users : actor

  users { uuid pk; email; role; stripe_customer_id; seat_group_id; render_quota }
  assets { id pk; name; category; license; tags text[]; img_url; thumb_url; metadata jsonb }
  renders { id pk; scene_id fk; status; cost_cents; generated_at; prompt_hash; prompt_text }
  audit_logs { id pk; actor_id; action; resource; diff jsonb; ts timestamptz }
```

- `audit_logs` enables GDPR‑style access logs; retained 1 y.
- `assets.license` tracks usage rights for catalog images.
- `renders.prompt_hash` allows for caching/re-use of identical render requests.

---

## 6. External Services & Integrations (expanded)

| Service                    | Purpose               | Implementation Notes                                                        | Reliability Tier |
| -------------------------- | --------------------- | --------------------------------------------------------------------------- | ---------------- |
| Google Vertex AI           | Image Generation      | Primary provider (Imagen-4-Ultra). `gcloud` IAM service-account w/ min scopes. | Tier 1           |
| OpenAI API                 | Image Generation      | Secondary provider (gpt-image-1). Key rotation managed via Secret Manager.  | Tier 1           |
| Postmark                   | Transactional email   | DKIM & SPF configured on terrashaper.pro                                    | Tier 2           |
| LaunchDarkly               | Feature flags         | Free tier fits ≤10 flags for MVP                                            | Tier 3           |
| Sentry                     | Error/APM             | Release health dashboards                                                   | Tier 2           |

---

## 7. Rendering Workflow & State Machine (detailed)

```mermaid
stateDiagram-v2
  state "Browser" as B
  state "API Gateway" as A
  state "Queue" as Q
  state "Render Worker" as W
  state "AI Service" as S

  B --> A: POST /renderRequest
  A --> Q: enqueue(jobId)
  Q --> W: pop
  W --> S: REST call (via Abstraction Layer)
  S --> W: imageURL or error
  W --> A: update(jobId, status)
  A --> B: SSE progress 0-100%
```

**UX nuance**: Browser receives server‑sent events every 2 s; displays progress bar. If job fails, dialog shows "Retry" which enqueues again unless attempts ≥3.

### Retry/Refund Logic

- Attempt 1 → Full price credit.
- Attempts 2–3 → Free; no additional credit consumed.
- After 3 × error, status `permanent_fail`; user emailed & credit automatically restored.

---

## 8. Observability & Monitoring

- **Metrics** collected via OpenTelemetry → Cloud Monitoring.
  - `render_latency_ms`, `render_fail_ratio`, `credits_consumed_total`.
- **Tracing** for distributed latency across API → Worker → Imagen.
- Dashboards: Grafana (Stackdriver data‑source) with p50/p95/p99.
- **Alerting policies**: PagerDuty integration; on‑call rotation defined.

---

## 9. Security & Compliance Addenda

- JWT length limited to 512 chars; rotated every 24 h.
- Bcrypt password cost 12; Argon2 considered for v1.
- Secrets stored in Google Secret Manager; accessed via Workload Identity.
- **PII minimization**: Address, phone optional; if entered, stored encrypted column.
- **Children images** – TOS prohibits under‑13 facial inclusion to avoid COPPA.
- Annual penetration test budgeted ($5 K) prior to v1.1.

---

## 10. Risk Register (expanded)

| ID   | Risk                                    | Likelihood | Impact | Response                                                                                                                                                                                                                               | Owner        |
| ---- | --------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| R‑01 | AI Vendor Lock-in / Price Hike >25%     | Med        | High   | **Mitigation**: The AI Render Service Abstraction Layer is in place from day one. It will be built with adapters for both Google Imagen-4 and OpenAI gpt-image-1, allowing for rapid, programmatic switching. | CTO          |
| R‑02 | GPU quota exhaustion                    | Low        | Med    | Multi‑region GPU quotas; proactive GPU‑usage dashboard; PagerDuty alert at > 75 % usage; per‑user & per‑org rate‑limiting; BullMQ queue prioritizes Starter plan if Pro users over‑consume.                                   | DevOps       |
| R‑03 | Feature creep (cost estimator requests) | High       | Med    | Roadmap gatekeeping; maintain MoSCoW backlog.                                                                                                                                                                                          | PM           |
| R‑04 | Plant catalog rights issues             | Low        | Low    | Use royalty‑free/owned images; track `license` field in `assets` table.                                                                                                                                                        | Legal        |
| R‑05 | Texas drought imagery outdate           | Med        | Low    | Quarterly asset review cycle; auto flag low‑usage assets                                                                                                                                                                       | Content Lead |
| R‑06 | Poor render quality / "bad results"     | Med        | High   | **Mitigation**: Invest heavily in Dynamic Prompt Generation engine. Implement pHash-based QA checks. Manually review first 1,000 renders from beta users to fine-tune prompts and QA thresholds.                               | Product      |

---

## 11. Release Roadmap (phased)

| Phase            | Timing   | Milestones                                                                                 | Key Deliverables                        |
| ---------------- | -------- | ------------------------------------------------------------------------------------------ | --------------------------------------- |
| Alpha (Internal) | Wks 1-2  | Scene upload, annotation save/load, Vertex call returns dummy image.                       | Dev‑only release on staging             |
| Private Beta     | Wks 3–5  | Stripe Starter plan, 2K renders, 10 pilot landscapers, feedback surveys.                   | Loom onboarding vids, feedback surveys  |
| **MVP GA**       | Wks 6–20 | 4K renders, PWA install, public marketing site, billing support.                           | SLA docs, marketing site                |
| v1.1             | +6 wks   | Batch render, seat management, custom asset uploads.                                       | Press release, upgrade migration script |
| v1.2             | +4 wks   | Advanced QA model, offline mode (local caching & deferred sync).                           | Admin moderation UI                     |
| v2.0             | +12 wks  | CA rollout, AR viewer, AI plant recommender.                                               | iOS App Store listing                   |

---

*Prepared June 18, 2025 – This expanded draft (v2) supersedes all previous versions. Review acceptance by 06/20 EOD.*

