# Demo Backend

## Purpose

TypeScript/Express mock HTTPS backend for testing the Android and iOS clients. It serves deterministic identity and media responses from in-memory/data files and is not a production service.

## Code map

- `src/index.ts` creates the HTTPS Express server and exposes identity/media routes.
- `src/demo_reg_data.ts` contains demo registration data; media fixtures live in `src/media_data.ts`.
- `public/` serves the registration page and generated QR asset.
- `docker-compose.yml`, `Dockerfile`, and `dev.env` define the container workflow.

## Local commands

```bash
npm install
npx tsc --noEmit
npm run dev
docker compose up -d
```

The container expects a certificate key/certificate pair and a QR code configured through environment variables. Never reuse demo tokens, certificates, or fixture credentials in production. Keep mock response shapes aligned with the client contracts when changing routes.

Update `mml.project/docs` when demo setup, certificates, QR registration, or supported API behavior changes.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
