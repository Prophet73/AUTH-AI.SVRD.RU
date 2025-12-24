# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hub** is a centralized OAuth2/SSO authentication service for Severin Development. It integrates with corporate ADFS for authentication and acts as an OAuth2 provider for internal microservices.

**Key features:**
- SSO via corporate ADFS (OpenID Connect)
- OAuth2 provider for internal applications
- Application portal dashboard
- JWT-based session management (httpOnly cookies)

## Development Commands

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn src.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Docker:**
```bash
docker-compose up -d
```

**Database migrations:**
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1
```

## Project Structure

```
Hub/
├── backend/
│   ├── src/
│   │   ├── main.py              # FastAPI app
│   │   ├── core/
│   │   │   ├── config.py        # Settings (pydantic-settings)
│   │   │   ├── security.py      # JWT create/verify
│   │   │   └── dependencies.py  # Auth dependencies
│   │   ├── db/
│   │   │   └── base.py          # Async SQLAlchemy setup
│   │   ├── models/
│   │   │   ├── user.py          # User (from AD)
│   │   │   ├── application.py   # OAuth2 clients
│   │   │   └── oauth_token.py   # Codes & tokens
│   │   ├── schemas/             # Pydantic models
│   │   ├── services/
│   │   │   ├── sso_service.py   # ADFS integration
│   │   │   └── oauth_service.py # OAuth2 provider
│   │   └── api/
│   │       ├── auth.py          # /auth/sso/login, callback
│   │       ├── oauth.py         # /oauth/authorize, token
│   │       └── applications.py  # App management
│   └── alembic/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── store/auth.ts        # Zustand auth store
│   │   ├── api/client.ts        # Axios with credentials
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   └── components/
│   └── package.json
└── docker-compose.yml
```

## API Endpoints

### Auth (SSO)
```
GET  /auth/sso/login     → Redirect to ADFS
GET  /auth/sso/callback  → Handle ADFS response
POST /auth/logout        → Clear session
GET  /auth/me            → Current user info
```

### OAuth2 Provider (for client apps)
```
GET  /oauth/authorize    → Authorization endpoint
POST /oauth/token        → Token endpoint
GET  /oauth/userinfo     → User info (protected)
GET  /.well-known/openid-configuration
```

### Applications
```
GET    /api/applications      → List apps (portal)
POST   /api/applications      → Create app (admin)
PUT    /api/applications/{id} → Update (admin)
DELETE /api/applications/{id} → Delete (admin)
```

## OAuth2 Flow (how services use Hub)

```
1. Service → Hub: GET /oauth/authorize?client_id=...&redirect_uri=...
2. Hub: checks session, redirects to ADFS if needed
3. Hub → Service: redirect with ?code=...
4. Service → Hub: POST /oauth/token (code → tokens)
5. Service → Hub: GET /oauth/userinfo (get user info)
6. Service: creates local user, issues own session
```

## Key Files

| Purpose | File |
|---------|------|
| FastAPI app | `backend/src/main.py` |
| Config/Settings | `backend/src/core/config.py` |
| JWT handling | `backend/src/core/security.py` |
| Auth guards | `backend/src/core/dependencies.py` |
| DB connection | `backend/src/db/base.py` |
| ADFS integration | `backend/src/services/sso_service.py` |
| OAuth2 logic | `backend/src/services/oauth_service.py` |
| Auth store | `frontend/src/store/auth.ts` |

## Database Models

- **User**: sso_id, email, display_name, department, ad_groups, is_admin
- **Application**: name, slug, client_id, client_secret_hash, redirect_uris, base_url
- **OAuthCode**: temporary authorization codes (10 min TTL)
- **OAuthToken**: access/refresh tokens for applications

## Environment Variables

```bash
DATABASE_URL=postgresql+asyncpg://hub:password@localhost:5432/hub_db
SECRET_KEY=your-secret-key-min-32-chars
OIDC_DISCOVERY_URL=https://sso.severindevelopment.ru/adfs/.well-known/openid-configuration
OIDC_CLIENT_ID=hub-client-id
OIDC_CLIENT_SECRET=hub-client-secret
OIDC_REDIRECT_URI=https://ai-hub.svrd.ru/auth/sso/callback
CORS_ORIGINS=http://localhost:5173,https://ai-hub.svrd.ru
```

## Architecture Notes

- Session stored in httpOnly cookie (`hub_session`)
- All DB operations are async (SQLAlchemy + asyncpg)
- OAuth2 tokens include `aud` (application_id) claim
- Applications verify their client_secret via SHA256 hash
- Frontend proxies API requests via Vite dev server (or nginx in prod)
