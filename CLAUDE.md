# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

API-Explorer is a browser-based HTTP client web app (in the spirit of Postman/Hoppscotch): compose HTTP requests in the UI, send them, and inspect responses.

## Stack and layout (decided 2026-07, pre-scaffold)

The repo is greenfield; this is the agreed plan — don't re-propose a different stack:

- `frontend/` — Vite + React + TypeScript. This is the product UI.
- `backend/` — Python FastAPI, acting as a thin request proxy.

## Architecture: why the backend exists

Browsers block cross-origin requests to arbitrary APIs (CORS), so the frontend cannot call target APIs directly. The frontend sends the request spec (method, URL, headers, body) to the FastAPI backend, which performs the real HTTP call server-side and returns the response. Keep the backend a thin proxy — request execution, not business logic.

## Commands

Not yet scaffolded. Add dev/build/test/lint commands here as `frontend/` and `backend/` land.
