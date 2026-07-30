# API-Explorer v1 — Design

**Date:** 2026-07-30
**Status:** Approved (Approach A — two services, structured proxy envelope)

## Purpose

A browser-based HTTP client: select a method, enter a URL, optionally set headers and a JSON body, send the request, and inspect the response (color-coded status, pretty-printed JSON, response headers, time, size). The FastAPI backend proxies requests so browser CORS doesn't block arbitrary target APIs.

**v1 scope exclusions:** no auth, no database, no request history. Runs locally only; designed so deploy-time guardrails (SSRF blocking, rate limits) can be added in `backend/app/proxy.py` without restructuring.

## Architecture

Two dev processes:

- `frontend/` — Vite + React + TypeScript, dev server on :5173. Vite's dev proxy forwards `/api/*` to :8000, so there is no CORS handling between our own services.
- `backend/` — FastAPI + httpx on :8000. One endpoint: `POST /api/proxy`.

```
ApiExplorer/
├── frontend/
│   └── src/
│       ├── components/    # RequestForm, ResponseViewer, and children
│       ├── api/           # sendRequest() → POST /api/proxy
│       └── types.ts       # ProxyRequest, ProxyResult shapes
└── backend/
    └── app/
        ├── main.py        # FastAPI app + route
        ├── proxy.py       # isolated proxy execution (v2 guardrails go here)
        └── models.py      # Pydantic models
```

**Data flow:** form state → `POST /api/proxy` with the request spec → `proxy.py` executes the real call via httpx (30s timeout) → structured envelope back → React renders it. Time and size are measured in the backend around the httpx call, so they exclude the browser↔proxy hop.

## Backend contract

`POST /api/proxy`

Request body (Pydantic-validated):

```json
{
  "method": "GET | POST | PUT | PATCH | DELETE | HEAD | OPTIONS",
  "url": "https://...",
  "headers": { "Header-Name": "value" },
  "body": "raw request body string or null"
}
```

Response is always HTTP 200 from our API with a discriminated envelope, so the frontend can always distinguish "target API errored" from "proxy failed":

```json
{ "ok": true,
  "response": {
    "status": 404,
    "statusText": "Not Found",
    "headers": { "content-type": "application/json" },
    "body": "raw response text",
    "contentType": "application/json",
    "elapsedMs": 132,
    "sizeBytes": 512
  }
}
```

```json
{ "ok": false,
  "error": { "type": "timeout | connection | invalid_url", "message": "human-readable detail" }
}
```

Rules:
- `url` must be http/https (Pydantic validation → 422, surfaced as a form error).
- Body is forwarded verbatim as bytes with the user's headers; the frontend is responsible for JSON validity.
- Response body is decoded as text; if decoding fails (binary), `body` is null and the frontend shows a "binary response" notice with the size.
- Hop-by-hop headers (`connection`, `transfer-encoding`, etc.) are stripped from the returned header map.
- 30-second timeout on the httpx call → `timeout` error.

## Frontend

Components (state lives in `App` via `useState`; no state library):

- **RequestForm** — method `<select>`, URL input, Send button (disabled while in flight).
  - **HeadersEditor** — key/value rows with add/remove; empty rows ignored.
  - **BodyEditor** — textarea shown for methods that take a body (POST/PUT/PATCH); "invalid JSON" inline warning via `JSON.parse` check (warning only — sending is still allowed, since non-JSON bodies are legitimate).
- **ResponseViewer** — hidden until first response.
  - **StatusBadge** — color-coded: 2xx green, 3xx blue, 4xx orange, 5xx red.
  - **MetaBar** — elapsed ms + human-readable size.
  - Body/Headers tabs. Body tab pretty-prints when the response parses as JSON (2-space indent), otherwise shows raw text; binary shows the notice.
- **ErrorPanel** — replaces ResponseViewer when `ok: false`; visually distinct from an HTTP error response (a 500 from the target is a *successful* proxy result).

## Error handling summary

| Failure | Where caught | UX |
|---|---|---|
| Malformed URL / bad method | Pydantic (422) | inline form error |
| Target unreachable / DNS | `proxy.py` → `ok: false, connection` | ErrorPanel |
| Timeout (>30s) | `proxy.py` → `ok: false, timeout` | ErrorPanel |
| Target returns 4xx/5xx | normal envelope | ResponseViewer, colored badge |
| Binary body | decode check | size + "binary response" notice |

## Testing

- **Backend:** pytest + FastAPI `TestClient`, httpx mocked with `respx` — envelope shape, error taxonomy (timeout/connection/invalid_url), hop-by-hop header stripping, binary handling.
- **Frontend:** Vitest + React Testing Library — status color mapping, JSON pretty-print vs raw fallback, headers editor row logic, in-flight button disable. `sendRequest` mocked at the module boundary.

## v2 (out of scope, noted for placement)

SSRF guards (block private IPs/localhost), rate limiting, request size caps — all inside `proxy.py`. Static serving of the built frontend from FastAPI for single-process deploy.
