# Frontend ↔ Backend Integration Guide

This guide describes how the Mapping Portal frontend should communicate with the Spring Boot backend: authentication flow, base URLs, headers, and request/response expectations for each available endpoint.

## Server & Environment
- **Base URL**: `http://localhost:8080` in local development (configurable via `server.port` if changed).【F:backend/src/main/resources/application.yml†L23-L24】
- **Stateless API**: All routes except the login endpoint require a JWT bearer token; sessions are not used.【F:backend/src/main/java/com/slashdata/mappingportal/backend/config/SecurityConfig.java†L29-L37】

## Authentication
- **Login**: `POST /api/auth/login`
  - Body: `{ "email": string, "password": string }`.【F:backend/src/main/java/com/slashdata/mappingportal/backend/dto/AuthRequest.java†L6-L28】
  - On success returns `{ token: string, user: User }`. The token includes a `role` claim and expires after the configured duration (12 hours by default).【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AuthController.java†L33-L42】【F:backend/src/main/java/com/slashdata/mappingportal/backend/dto/AuthResponse.java†L3-L18】【F:backend/src/main/java/com/slashdata/mappingportal/backend/security/JwtService.java†L18-L34】
  - On failure returns HTTP 401.
- **Auth Header**: Send `Authorization: Bearer <token>` for every other request. The filter extracts the token, validates expiration, and loads the user context for role checks.【F:backend/src/main/java/com/slashdata/mappingportal/backend/security/JwtAuthFilter.java†L23-L45】【F:backend/src/main/java/com/slashdata/mappingportal/backend/security/JwtService.java†L33-L44】

## Role-Based Access Control
- `ADMIN` users can reach every endpoint, including destructive actions such as deleting makes or users.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/MakeController.java†L48-L53】【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/UserController.java†L20-L50】
- `EDITOR` users can perform create/update/bulk-import actions on master data and ADP mappings but cannot delete makes or manage users.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/MakeController.java†L36-L59】【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AdpController.java†L39-L71】
- `VIEWER` users (or any authenticated role) can call read-only endpoints such as listing data and AI helpers; the security chain enforces authentication while method-level annotations gate mutations.【F:backend/src/main/java/com/slashdata/mappingportal/backend/config/SecurityConfig.java†L29-L37】【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AiController.java†L23-L31】

## User Management (Admin-only)
- `GET /api/users` — list users.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/UserController.java†L31-L34】
- `POST /api/users` — create user. Body must include `name`, `email`, `password`, `role`, and `status`; passwords are bcrypt-hashed server-side before storage.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/UserController.java†L36-L39】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/UserService.java†L27-L35】
- `PUT /api/users/{id}` — partial update; any provided `name`, `role`, `status`, or `password` fields are applied (passwords are re-hashed when supplied).【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/UserController.java†L41-L44】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/UserService.java†L38-L52】
- `DELETE /api/users/{id}` — deletes a user record.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/UserController.java†L46-L50】

## Vehicle Master Data
### Makes (`/api/makes`)
- `GET` — list all makes.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/MakeController.java†L31-L34】
- `POST` — create; body includes `name` and `country`. IDs are generated server-side when missing.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/MakeController.java†L36-L40】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L36-L45】
- `PUT /{id}` — update `name`/`country`.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/MakeController.java†L42-L45】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L51-L56】
- `DELETE /{id}` — admin-only delete.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/MakeController.java†L48-L53】
- `POST /bulk` — multipart file upload (`file`) with CSV headers `name,country`; returns success/error counts.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/MakeController.java†L55-L59】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L98-L117】

### Vehicle Types (`/api/types`)
- `GET` — list vehicle types.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/VehicleTypeController.java†L29-L32】
- `POST` — create; body includes `name`/`description`, ID is generated when omitted.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/VehicleTypeController.java†L34-L38】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L62-L67】
- `PUT /{id}` — update `name`/`description`.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/VehicleTypeController.java†L40-L44】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L69-L73】
- `POST /bulk` — multipart CSV (`file`) with headers `name,description`.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/VehicleTypeController.java†L46-L49】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L119-L138】

### Models (`/api/models`)
- `GET` — list models; optional `makeId` query filters by make.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/ModelController.java†L29-L32】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L76-L81】
- `POST` — create; body should include `name`, `make` (object or ID resolved by repository), and `type`; IDs are generated when missing.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/ModelController.java†L34-L38】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L83-L88】
- `PUT /{id}` — update model fields (`name`, `make`, `type`).【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/ModelController.java†L40-L44】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L90-L95】
- `POST /bulk` — multipart CSV (`file`) with headers `name,make_name,type_name`; backend resolves make/type names to IDs and returns per-row errors when unresolved.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/ModelController.java†L46-L50】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L140-L164】

## ADP Integration (`/api/adp`)
- `GET /master` — read all raw ADP master records.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AdpController.java†L34-L37】
- `POST /master/bulk` — admin/editor CSV upload (`file`) with headers matching ADP fields (`id,adp_make_id,make_ar_desc,...`). Returns success/error totals.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AdpController.java†L39-L43】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/AdpService.java†L51-L77】
- `GET /mappings` — list ADP mapping records (includes status, updated/review metadata).【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AdpController.java†L45-L48】
- `PUT /mappings/{adpId}` — admin/editor update for a specific ADP record. Body may include `status`, `modelId`, and/or `makeId`; when creating a mapping for the first time, `modelId` is required. The backend stamps `updatedBy` and `updatedAt` automatically using the caller’s email.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AdpController.java†L50-L54】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/AdpService.java†L87-L109】
- `POST /mappings/{id}/review` — mark a mapping reviewed (sets `reviewedBy` and `reviewedAt`).【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AdpController.java†L56-L59】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/AdpService.java†L111-L117】
- `GET /makes/mappings` — list ADP make-to-SlashData make mappings.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AdpController.java†L62-L65】
- `POST /makes/mappings` — admin/editor upsert for ADP make mappings. Body: `{ adpMakeId, makeId }`. On save, the service propagates status updates (`MISSING_MAKE` → `MISSING_MODEL`) or inserts new mappings tied to the calling user for all affected ADP master records.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AdpController.java†L67-L70】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/AdpService.java†L120-L155】

## AI Helpers (`/api/ai`)
- `POST /generate-description` — body `{ name, context }`; returns `{ description: string }`.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AiController.java†L23-L26】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/AiService.java†L8-L12】
- `POST /suggest-models` — body `{ makeName }`; returns `{ models: string[] }`.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/AiController.java†L28-L31】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/AiService.java†L14-L16】

## Request Notes for the Frontend
- Always include `Content-Type: application/json` for JSON bodies and `Authorization: Bearer <token>` for authenticated calls.
- For CSV imports, send multipart form data with the file in the `file` field; backend streams and validates rows, returning `successCount`, `errorCount`, and an `errors` array summarizing row failures.【F:backend/src/main/java/com/slashdata/mappingportal/backend/controller/MakeController.java†L55-L59】【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L98-L164】
- Backend entities expect UUID strings for identifiers when provided; otherwise IDs are generated server-side for master data records.【F:backend/src/main/java/com/slashdata/mappingportal/backend/service/MasterDataService.java†L40-L88】

## Token Lifecycle
- Tokens are signed with the server secret and expire after `jwt.expiration-hours` (12h default). Refresh by re-authenticating when the backend returns 401/403 responses.【F:backend/src/main/java/com/slashdata/mappingportal/backend/security/JwtService.java†L18-L34】【F:backend/src/main/resources/application.yml†L19-L24】
