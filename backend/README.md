# DECA Window Configurator — Backend API

## Architecture

- **Runtime**: Node.js 22 + Express
- **Database**: PostgreSQL 16 with pgvector (schema: `configurator` inside `deca_crm`)
- **Process Manager**: PM2
- **Reverse Proxy**: nginx (api.decacrm.com)
- **Port**: 4000

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/settings` | All settings in one call (profiles, colors, glass, etc.) |
| GET | `/api/stats` | Dashboard statistics |
| CRUD | `/api/profiles` | Profile systems |
| CRUD | `/api/colors` | Profile + handle colors |
| CRUD | `/api/muntins` | Muntin types |
| CRUD | `/api/glass` | Glass units (IGU) |
| CRUD | `/api/hardware` | Hardware items |
| CRUD | `/api/accessories` | Accessories |
| CRUD | `/api/screens` | Screen types |
| CRUD | `/api/constraints` | Constraint groups |
| CRUD | `/api/users` | Users |
| CRUD | `/api/customers` | Customers |
| GET | `/api/customers/:id/full` | Customer with all nested projects/quotes/constructions |
| CRUD | `/api/projects` | Projects |
| CRUD | `/api/quotes` | Quotes |
| GET | `/api/quotes/:id/full` | Quote with constructions + positions + invoices |
| CRUD | `/api/constructions` | Window constructions |
| CRUD | `/api/positions` | Position instances |
| CRUD | `/api/invoices` | Invoices |
| POST | `/api/ai/resolve` | AI parameter matching (vector search) |

CRUD = GET /, GET /:id, POST /, PUT /:id, DELETE /:id

---

## Deployment Steps (for VPS agents)

### 1. Install PM2

```bash
sudo npm install -g pm2
```

### 2. Clone and setup

```bash
# Create directory
sudo mkdir -p /opt/deca/configurator-api
sudo chown $(whoami):$(whoami) /opt/deca/configurator-api

# Copy files (or git clone when repo is ready)
cp -r ./* /opt/deca/configurator-api/
cd /opt/deca/configurator-api

# Install dependencies
npm install --production

# Copy and edit .env
cp .env.example .env
# Edit .env if needed — the defaults match the VPS config
```

### 3. Initialize database

```bash
cd /opt/deca/configurator-api

# Create schema and tables
psql postgresql://deca:deca2026secure@127.0.0.1:5432/deca_crm -f db/schema.sql

# Seed initial data
psql postgresql://deca:deca2026secure@127.0.0.1:5432/deca_crm -f db/seed.sql

# Verify
psql postgresql://deca:deca2026secure@127.0.0.1:5432/deca_crm -c "SET search_path TO configurator; SELECT count(*) FROM profiles;"
# Should return: 1
```

### 4. Start with PM2

```bash
cd /opt/deca/configurator-api
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the output command to enable autostart
```

### 5. Configure nginx

```bash
# Edit the api.decacrm.com nginx config
sudo nano /etc/nginx/sites-available/api.decacrm.com
# (or wherever the api config is)

# Add inside the server { } block:
# location /configurator/ {
#     proxy_pass http://127.0.0.1:4000/api/;
#     proxy_http_version 1.1;
#     proxy_set_header Host $host;
#     proxy_set_header X-Real-IP $remote_addr;
#     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#     proxy_set_header X-Forwarded-Proto $scheme;
# }

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Verify

```bash
# Direct test
curl http://localhost:4000/api/health

# Through nginx
curl https://api.decacrm.com/configurator/health

# Get all settings
curl https://api.decacrm.com/configurator/settings | jq .
```

---

## Database Schema

All tables live in `configurator` schema inside `deca_crm` database.

| Table | Purpose |
|-------|---------|
| `users` | System users with roles and seller codes |
| `profiles` | Window profile systems (Gealan, etc.) |
| `colors` | Profile and handle colors |
| `muntins` | Muntin/grille types |
| `glass_units` | IGU specifications |
| `hardware` | Handles, hinges, locks |
| `accessories` | Nailing fins, extensions, etc. |
| `screens` | Insect screen types |
| `constraints` | Grouped constraint rules |
| `customers` | Customer records |
| `projects` | Projects per customer |
| `quotes` | Quotes per project (numbered, with timer) |
| `constructions` | Window definitions (tree, defaults) |
| `positions` | Position instances per construction |
| `invoices` | Invoices per quote |
| `parameter_embeddings` | AI vector search (pgvector) |
| `audit_log` | Change tracking |

---

## Frontend Integration

The frontend (React artifact) will be converted to fetch from this API instead of localStorage.
The key endpoint is `GET /api/settings` which returns everything needed for initial load.

For the React app deployed at `/var/www/decacrm/`:
- API base URL: `https://api.decacrm.com/configurator`
- All CRUD operations via standard REST
- WebSocket support can be added later for real-time updates

---

## Next Steps

1. ✅ Schema + seed deployed
2. ✅ API running on port 4000
3. ✅ nginx proxying api.decacrm.com/configurator
4. [ ] Convert frontend from localStorage to API calls
5. [ ] Setup Google Embeddings API key
6. [ ] Index all parameters as embeddings
7. [ ] GitHub repo + CI/CD
8. [ ] Authentication (JWT or session)
