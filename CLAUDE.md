# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hub** is a centralized OAuth2/SSO authentication service for Severin Development. It integrates with corporate ADFS for authentication and acts as an OAuth2 provider for internal microservices.

**Key features:**
- SSO via corporate ADFS (OpenID Connect)
- OAuth2 provider for internal applications
- Application portal dashboard
- JWT-based session management (httpOnly cookies)
- User profile with ФИО from OIDC claims

## Git Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Auto-deploys to prod. |
| `release/v*` | Release branches for testing before merge to main |
| `feature/*` | New features (branch from main) |
| `fix/*` | Bug fixes |

### Release Process

1. Create feature branch: `git checkout -b feature/my-feature`
2. Develop and test locally
3. Create release branch: `git checkout -b release/v1.2.0-description`
4. Test on staging/prod manually
5. Merge to main: `git checkout main && git merge release/v1.2.0-description`
6. Push triggers auto-deploy: `git push origin main`

### Commit Messages

```
feat: add new feature
fix: bug fix
docs: documentation changes
refactor: code refactoring
chore: maintenance tasks
```

## Development Commands

**Docker (recommended):**
```bash
docker compose up -d                    # Start all services
docker compose down                     # Stop all
docker compose logs -f backend          # View logs
docker compose exec backend bash        # Shell into container
```

**Backend (standalone):**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn src.main:app --reload --port 8000
```

**Frontend (standalone):**
```bash
cd frontend
npm install
npm run dev
```

**Database migrations:**
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1
```

**Dev login (bypass SSO):**
```
http://localhost:5173/auth/dev-login
```

## Deployment

### Auto-Deploy (GitHub Actions)

Push to `main` triggers automatic deployment:
1. SSH to production server
2. `git pull`
3. `docker compose build --no-cache`
4. `docker compose up -d`

**Required GitHub Secrets:**
- `SERVER_HOST` - production server IP
- `SERVER_USER` - SSH username
- `SSH_PRIVATE_KEY` - SSH private key

### Manual Deploy

```bash
ssh user@server
cd /opt/hub
git pull
sudo bash deploy/04-update.sh
```

### Deploy Scripts

| Script | Description |
|--------|-------------|
| `deploy/03-deploy.sh` | Build and start containers |
| `deploy/04-update.sh` | Pull, rebuild, restart |
| `deploy/05-logs.sh` | View container logs |
| `deploy/06-stop.sh` | Stop all containers |
| `deploy/full-deploy.sh` | Complete setup (Docker + systemd) |

## Project Structure

```
Hub/
├── .github/workflows/
│   └── deploy.yml           # Auto-deploy on push to main
├── backend/
│   ├── src/
│   │   ├── main.py          # FastAPI app
│   │   ├── core/
│   │   │   ├── config.py    # Settings (pydantic-settings)
│   │   │   ├── security.py  # JWT create/verify
│   │   │   └── dependencies.py
│   │   ├── db/
│   │   │   └── base.py      # Async SQLAlchemy
│   │   ├── models/
│   │   │   ├── user.py      # User model
│   │   │   ├── application.py
│   │   │   └── oauth_token.py
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── sso_service.py   # ADFS integration
│   │   │   └── oauth_service.py
│   │   └── api/
│   │       ├── auth.py      # SSO endpoints
│   │       ├── oauth.py     # OAuth2 provider
│   │       └── applications.py
│   └── alembic/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── store/auth.ts
│   │   ├── api/client.ts
│   │   ├── pages/
│   │   └── components/
│   ├── nginx.conf           # Production nginx config
│   └── Dockerfile
├── deploy/                  # Deployment scripts
├── docker-compose.yml       # Development
└── docker-compose.prod.yml  # Production
```

## API Endpoints

### Auth (SSO)
```
GET  /auth/sso/login      → Redirect to ADFS
GET  /auth/sso/callback   → Handle ADFS response
GET  /auth/dev-login      → Dev-only bypass (creates test user)
POST /auth/logout         → Clear session
GET  /auth/me             → Current user info
GET  /auth/check          → Check if authenticated
```

### OAuth2 Provider
```
GET  /oauth/authorize     → Authorization endpoint
POST /oauth/token         → Token endpoint
GET  /oauth/userinfo      → User info (protected)
POST /oauth/revoke        → Revoke token
GET  /.well-known/openid-configuration
```

### Applications
```
GET    /api/applications      → List apps (portal)
POST   /api/applications      → Create app (admin)
GET    /api/applications/{id} → Get app details
PUT    /api/applications/{id} → Update (admin)
DELETE /api/applications/{id} → Delete (admin)
POST   /api/applications/{id}/regenerate-secret → New secret (admin)
```

## Database Models

### User
```python
id: UUID
sso_id: str          # From ADFS (sub claim)
email: str
display_name: str    # Full name from OIDC
first_name: str      # given_name claim
last_name: str       # family_name claim
middle_name: str     # middle_name claim
department: str
job_title: str
ad_groups: list[str]
is_active: bool
is_admin: bool
last_login_at: datetime
```

### Application
```python
id: UUID
name: str
slug: str
description: str
base_url: str
icon_url: str
client_id: str
client_secret_hash: str
redirect_uris: list[str]
is_active: bool
```

## Environment Variables

### Development (.env)
```bash
DATABASE_URL=postgresql+asyncpg://hub:hubpassword@localhost:5433/hub_db
SECRET_KEY=dev-secret-key-for-local-testing-only-32chars
OIDC_DISCOVERY_URL=https://sso.severindevelopment.ru/adfs/.well-known/openid-configuration
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=https://ai-hub.svrd.ru/signing-sso-...
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Production (.env.prod)
```bash
DOMAIN=ai-hub.svrd.ru
DB_PASSWORD=secure-password-here  # No $ signs!
SECRET_KEY=min-32-characters-secret-key
OIDC_DISCOVERY_URL=...
OIDC_CLIENT_ID=...
OIDC_CLIENT_SECRET=...
OIDC_REDIRECT_URI=https://ai-hub.svrd.ru/signing-sso-...
CORS_ORIGINS=https://ai-hub.svrd.ru
```

## Architecture Notes

- Session stored in httpOnly cookie (`hub_session`)
- Cookie `secure` flag auto-detected via `X-Forwarded-Proto` header
- All DB operations are async (SQLAlchemy + asyncpg)
- OAuth2 tokens include `aud` (application_id) claim
- Applications verify client_secret via SHA256 hash
- Frontend uses nginx in prod (proxies /api, /auth, /oauth to backend)
- ADFS callback uses special URL: `/signing-sso-{uuid}` (registered in ADFS)

## Troubleshooting

### "Failed to load applications"
1. Check backend logs: `docker compose logs backend`
2. Verify database has applications: `docker exec hub-postgres-1 psql -U hub -d hub_db -c "SELECT * FROM applications;"`
3. Check cookie is set (dev tools → Application → Cookies)

### 502 Bad Gateway
1. Backend container crashed - check logs
2. Database connection failed - verify DB_PASSWORD in .env.prod
3. Nginx can't reach backend - check docker network

### SSO Redirect Issues
1. OIDC_REDIRECT_URI must match ADFS registration exactly
2. Cookie secure flag - behind reverse proxy needs X-Forwarded-Proto header
