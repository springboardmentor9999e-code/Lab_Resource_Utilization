# Deployment Guide — Docker & Cloud

Lab Resource Utilization Platform · Milestone 4

This platform deploys as three Docker containers behind a single Nginx entry point.
The same `docker-compose.prod.yml` runs unchanged on **AWS EC2**, an **Azure VM**, GCP
Compute Engine, a DigitalOcean droplet, or an on-prem Linux server — the cloud provider
only supplies the VM, the disk and the firewall rules.

---

## 1. Architecture of the deployed stack

```
                     Internet
                        │
                   :80 / :443
                        │
        ┌───────────────▼────────────────┐
        │  nginx  (lab-resource-frontend)│   ← only published port
        │  · serves the React build      │
        │  · /api/    → backend:8080     │
        │  · /uploads/→ backend:8080     │
        │  · /ws/     → backend:8080     │
        └───────────────┬────────────────┘
                        │  docker network: lab-net
        ┌───────────────▼────────────────┐
        │  backend (lab-resource-backend)│   ← no host port
        │  Spring Boot 3.5, profile=prod │
        │  healthcheck /actuator/health  │
        └───────────────┬────────────────┘
                        │
        ┌───────────────▼────────────────┐
        │  postgres (lab-resource-db)    │   ← no host port
        │  volume: pgdata                │
        │  initdb: database/01..17_*.sql │
        └────────────────────────────────┘

        volumes:  pgdata (database)   uploads (equipment images & docs)
```

Only Nginx is reachable from outside the host. Postgres and the API have **no published
ports at all** — a port scan of the VM finds one open service, not three.

### Why Nginx sits in front

* The SPA and the API share one origin, so the browser never issues a cross-origin
  request and no CORS relaxation is needed in production.
* WebSocket upgrades for the live utilization feed are proxied on the same origin.
* It is the single place to terminate TLS.
* Hashed Vite assets get a one-year immutable cache; `index.html` does not.

---

## 2. Prerequisites

| | |
|---|---|
| Cloud VM | 2 vCPU / 4 GB RAM recommended (2 GB is the practical floor — the JVM, Postgres and Nginx share it) |
| Disk | 20 GB+ |
| OS | Ubuntu 22.04 / 24.04 LTS (any Docker-capable Linux works) |
| Software | Docker Engine 24+ and the Docker Compose v2 plugin |
| Open ports | 22 (SSH, your IP only), 80, 443 |

Install Docker on a fresh Ubuntu host:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker
docker compose version      # must print v2.x
```

---

## 3. Deploy on AWS EC2

### 3.1 Launch the instance

1. **EC2 → Launch instance**
   * AMI: *Ubuntu Server 24.04 LTS (64-bit x86)*
   * Instance type: **t3.small** (2 vCPU / 2 GB) for a demo, **t3.medium** (4 GB) if the
     grader will click around while the JVM is warming.
   * Key pair: create one and download the `.pem`. This is also the deploy key later.
   * Storage: 20 GB gp3.
2. **Security group** — inbound rules:

   | Type | Port | Source | Why |
   |---|---|---|---|
   | SSH | 22 | *My IP* | administration only, never `0.0.0.0/0` |
   | HTTP | 80 | `0.0.0.0/0` | Nginx |
   | HTTPS | 443 | `0.0.0.0/0` | Nginx after TLS is added |

   Do **not** open 5432 or 8080. The compose file does not publish them, and the
   security group should not either.
3. Allocate an **Elastic IP** and associate it, so the address survives a stop/start.

### 3.2 Provision the host

```bash
ssh -i lab-key.pem ubuntu@<ELASTIC_IP>

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu && newgrp docker

git clone https://github.com/badalsingh25/lab-resource-platform.git
cd lab-resource-platform

cp .env.prod.example .env
chmod 600 .env
nano .env      # fill in the four REQUIRED values — see §5
```

### 3.3 Start it

```bash
# Build the images on the host:
docker compose -f docker-compose.prod.yml up -d --build

# …or pull the images GitHub Actions already published:
echo "$GHCR_PAT" | docker login ghcr.io -u badalsingh25 --password-stdin
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

First boot takes 60–90 s: Postgres runs `database/01..17_*.sql`, then Hibernate
validates the schema and the bootstrap admin is created.

```bash
docker compose -f docker-compose.prod.yml ps        # all three "healthy"
docker compose -f docker-compose.prod.yml logs -f backend
```

Open `http://<ELASTIC_IP>/`.

---

## 4. Deploy on Azure

Two supported routes. The VM route is the direct analogue of §3; the Container Apps
route is the managed option.

### 4.1 Azure VM (recommended — identical to EC2)

```bash
az group create --name lab-resource-rg --location centralindia

az vm create \
  --resource-group lab-resource-rg \
  --name lab-resource-vm \
  --image Ubuntu2404 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

az vm open-port --resource-group lab-resource-rg --name lab-resource-vm --port 80  --priority 900
az vm open-port --resource-group lab-resource-rg --name lab-resource-vm --port 443 --priority 910

az vm show -d -g lab-resource-rg -n lab-resource-vm --query publicIps -o tsv
```

`Standard_B2s` is 2 vCPU / 4 GB — the closest match to a t3.medium. Then SSH in and
repeat §3.2 and §3.3 verbatim; nothing in the stack is AWS-specific.

Lock SSH down to your own address afterwards:

```bash
az network nsg rule create -g lab-resource-rg --nsg-name lab-resource-vmNSG \
  --name allow-ssh-my-ip --priority 800 --access Allow --protocol Tcp \
  --destination-port-ranges 22 --source-address-prefixes "<YOUR_IP>/32"
```

### 4.2 Azure Container Apps (managed, no VM to patch)

```bash
az containerapp env create -g lab-resource-rg -n lab-env -l centralindia

# Managed Postgres instead of the postgres container
az postgres flexible-server create -g lab-resource-rg -n lab-resource-pg \
  --tier Burstable --sku-name Standard_B1ms --version 16 \
  --admin-user labresource --admin-password '<STRONG_PASSWORD>'

az containerapp create -g lab-resource-rg -n lab-backend --environment lab-env \
  --image ghcr.io/badalsingh25/lab-resource-platform-backend:latest \
  --target-port 8080 --ingress internal \
  --env-vars SPRING_PROFILES_ACTIVE=prod \
             DB_URL="jdbc:postgresql://lab-resource-pg.postgres.database.azure.com:5432/lab_resource_db?sslmode=require" \
             DB_USERNAME=labresource DB_PASSWORD=secretref:db-password \
             JWT_SECRET=secretref:jwt-secret \
             BOOTSTRAP_ADMIN_PASSWORD=secretref:admin-password

az containerapp create -g lab-resource-rg -n lab-frontend --environment lab-env \
  --image ghcr.io/badalsingh25/lab-resource-platform-frontend:latest \
  --target-port 80 --ingress external
```

Two caveats before choosing this route:

* **The schema is not created for you.** Container Apps has no `docker-entrypoint-initdb.d`,
  and `prod` runs `ddl-auto=validate`, so the backend will fail to start against an empty
  database. Apply the migrations once by hand first:
  `psql "host=lab-resource-pg.postgres.database.azure.com ..." -f database/01_schema_auth_organization.sql` and so on through `17_`.
* **Uploads need shared storage.** Container Apps replicas do not share a filesystem;
  mount an Azure Files share at `/app/uploads`, or equipment images vanish on restart.
  The VM route has neither problem.

---

## 5. Configuration

Copy the template and fill it in on the host:

```bash
cp .env.prod.example .env
chmod 600 .env
```

Four values are **required** — compose refuses to start without them, rather than falling
back to a development default:

| Variable | Generate with |
|---|---|
| `POSTGRES_PASSWORD` | `openssl rand -base64 24` |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `BOOTSTRAP_ADMIN_PASSWORD` | `openssl rand -base64 18` |
| `POSTGRES_USER` | your choice, e.g. `labresource` |

Everything else is optional and documented inline in [.env.prod.example](.env.prod.example):
mail (OTP delivery), Google OAuth2, Twilio SMS, Firebase push, image tag, JVM heap.

With mail, SMS and push disabled the platform stays fully functional — OTPs and message
bodies are written to the backend log instead of being sent, so every flow is still
demonstrable without a paid account.

The bootstrap `SYSTEM_ADMIN` is created on first boot only. Log in with it once and
change the password from the UI.

---

## 6. HTTPS

Browsers gate several features behind a secure context, and JWTs on plain HTTP are
readable in transit. Terminate TLS with Certbot on the host:

```bash
sudo apt install -y certbot
docker compose -f docker-compose.prod.yml stop frontend
sudo certbot certonly --standalone -d lab.example.com
docker compose -f docker-compose.prod.yml start frontend
```

Then put a host-level Nginx (or a `443` mapping plus a TLS server block) in front. The
certificates land in `/etc/letsencrypt/live/lab.example.com/`; mount that read-only into
the frontend container and add a `listen 443 ssl;` server block that redirects `:80`.

Renewal: `sudo certbot renew --quiet` from cron, twice daily.

On AWS, an **Application Load Balancer with an ACM certificate** is the lower-maintenance
alternative — TLS terminates at the ALB and the instance keeps serving plain `:80` inside
the VPC. On Azure, **Application Gateway** plays the same role, and Container Apps issues
a managed certificate automatically.

---

## 7. Continuous delivery with GitHub Actions

Two workflows:

* **[.github/workflows/ci.yml](.github/workflows/ci.yml)** — on every push and PR: 128
  backend JUnit tests, then frontend lint + 26 Vitest tests + production build.
* **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)** — on push to `main`:
  builds both images with Buildx (GitHub Actions layer cache), pushes them to GHCR tagged
  `latest` and `<commit-sha>`, then SSHes into the cloud host and rolls the stack forward.

### Wiring the deploy job to your VM

Add these under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | Elastic IP / Azure public IP |
| `DEPLOY_USER` | `ubuntu` (EC2) or `azureuser` (Azure) |
| `DEPLOY_SSH_KEY` | the **private** key, full PEM including header and footer |
| `DEPLOY_PATH` | *(optional)* clone path, default `~/lab-resource-platform` |
| `DEPLOY_PORT` | *(optional)* SSH port, default `22` |
| `GHCR_PULL_TOKEN` | a PAT with `read:packages`, so the host can pull private images |

Until `DEPLOY_HOST` is set the deploy job prints a notice and passes, so the workflow is
green on a fresh clone.

The rollout pins `IMAGE_TAG` to `github.sha` rather than `latest`, so a second push
landing mid-deploy cannot swap a different build onto the host, then waits up to five
minutes for the backend container to report `healthy` and dumps the last 100 log lines if
it does not.

---

## 8. Operations

```bash
C=docker-compose.prod.yml

docker compose -f $C ps                     # health of all three containers
docker compose -f $C logs -f backend        # follow API logs
docker compose -f $C logs --tail=200 frontend
docker compose -f $C restart backend
docker compose -f $C pull && docker compose -f $C up -d     # roll forward
docker compose -f $C down                   # stop (volumes survive)
docker stats --no-stream                    # CPU / memory per container
```

### Backups

```bash
# Database
docker exec lab-resource-db pg_dump -U labresource lab_resource_db \
  | gzip > backup-$(date +%F).sql.gz

# Restore
gunzip -c backup-2026-07-30.sql.gz \
  | docker exec -i lab-resource-db psql -U labresource -d lab_resource_db

# Uploaded equipment images and documents
docker run --rm -v lab-resource-platform_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

Schedule the database dump nightly from cron and copy it off the host — to S3 on AWS, to
Blob Storage on Azure. A backup that only exists on the VM does not survive losing the VM.

### Applying a new migration

`prod` runs `ddl-auto=validate`, so Hibernate never alters a table holding real data — an
entity change that arrives without its migration fails the deploy loudly instead. The
`docker-entrypoint-initdb.d` mount only runs on an *empty* volume, so migrations after the
first boot are applied by hand:

```bash
docker exec -i lab-resource-db psql -U labresource -d lab_resource_db < database/18_new_migration.sql
docker compose -f docker-compose.prod.yml up -d --force-recreate backend
```

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `POSTGRES_PASSWORD is required` on `up` | `.env` missing or a required value blank | `cp .env.prod.example .env`, fill in §5 |
| Backend restarts in a loop, log says `Schema-validation: missing table` | Postgres volume was created before the migrations were mounted | `docker compose -f docker-compose.prod.yml down -v` then `up -d` — **this deletes the database** |
| Frontend loads, every API call 502 | Backend not healthy yet, or crashed | `docker compose -f docker-compose.prod.yml logs backend` |
| Login works, page reload logs you out | Clock skew between host and JWT expiry | `sudo timedatectl set-ntp true` |
| Google sign-in returns `origin_mismatch` | Deployed origin not registered | Add `http://<IP>` to *Authorised JavaScript origins* in the Google Cloud console |
| Uploaded images 404 after redeploy | `uploads` volume removed | Never pass `-v` to `down`; restore from the tarball above |
| Container killed, exit 137 | Out of memory on a 2 GB instance | Lower `JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=50.0`, or resize the VM |
| `denied` when pulling from GHCR | Package is private | `docker login ghcr.io` with a `read:packages` PAT, or make the package public |

---

## 10. Local verification before deploying

The dev stack in [docker-compose.yml](docker-compose.yml) publishes every port and uses
development defaults, which is what you want on a laptop:

```bash
cp .env.docker.example .env
docker compose up --build
# frontend  http://localhost:3000
# backend   http://localhost:8080
# postgres  localhost:5433
```

To rehearse the real thing locally, run the production file with `HTTP_PORT=8081` and a
throwaway `.env` — same images, same profile, same health checks, on `http://localhost:8081`.
