# Hub Deployment Guide

## Quick Deploy (All-in-One)

```bash
# 1. Copy project to server
scp -r Hub/ user@server:/home/user/

# 2. SSH to server
ssh user@server

# 3. Configure environment
cd Hub
cp .env.prod.example .env.prod
nano .env.prod   # Edit settings!

# 4. Run full deploy
sudo bash deploy/full-deploy.sh
```

Done! Hub will be available at `https://YOUR_DOMAIN`

---

## Step-by-Step Deploy

### 1. Install Docker CE
```bash
sudo bash deploy/01-install-docker.sh
# Log out and log back in!
```

### 2. Configure environment
```bash
bash deploy/02-setup-env.sh
# Or manually:
cp .env.prod.example .env.prod
nano .env.prod
```

### 3. Deploy application
```bash
bash deploy/03-deploy.sh
```

### 4. Install as systemd service (optional)
```bash
sudo bash deploy/07-install-service.sh
```

---

## Scripts Reference

| Script | Description | Run as |
|--------|-------------|--------|
| `full-deploy.sh` | Complete deployment (all steps) | sudo |
| `01-install-docker.sh` | Install Docker CE | sudo |
| `02-setup-env.sh` | Create .env.prod interactively | user |
| `03-deploy.sh` | Build and start containers | user |
| `04-update.sh` | Update (rebuild & restart) | user |
| `05-logs.sh` | View container logs | user |
| `06-stop.sh` | Stop all containers | user |
| `07-install-service.sh` | Install systemd service | sudo |
| `08-uninstall-service.sh` | Remove systemd service | sudo |

---

## Systemd Service Commands

After installing service with `07-install-service.sh`:

```bash
systemctl start hub       # Start Hub
systemctl stop hub        # Stop Hub
systemctl restart hub     # Restart Hub
systemctl status hub      # Check status
journalctl -u hub -f      # View logs
```

Hub will auto-start on server reboot.

---

## Requirements

- Ubuntu 20.04+ or 22.04+
- Domain with DNS pointing to server
- Ports 80 and 443 open

---

## Environment Variables (.env.prod)

```bash
DOMAIN=hub.example.com
ACME_EMAIL=admin@example.com
DB_PASSWORD=secure-password-here
SECRET_KEY=min-32-characters-secret-key
OIDC_DISCOVERY_URL=https://sso.example.com/adfs/.well-known/openid-configuration
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=https://hub.example.com/auth/sso/callback
CORS_ORIGINS=https://hub.example.com
```

---

## ADFS Configuration

Register this redirect URI in ADFS:
```
https://YOUR_DOMAIN/auth/sso/callback
```

---

## Troubleshooting

### Check logs
```bash
bash deploy/05-logs.sh
bash deploy/05-logs.sh backend
docker compose -f docker-compose.prod.yml logs traefik
```

### Restart everything
```bash
bash deploy/06-stop.sh
bash deploy/03-deploy.sh
```

### SSL not working
- Wait 1-2 minutes for Let's Encrypt
- Check domain DNS: `dig YOUR_DOMAIN`
- Check Traefik logs: `docker compose -f docker-compose.prod.yml logs traefik`

### Container issues
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=50
```
