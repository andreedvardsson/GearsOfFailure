# Vecka 3: Docker Compose - Multi-Container Setup

> **🚀 STARTA HÄR → [Öppna team-flags på GitHub](https://github.com/r87-e/team-flags)**
>
> All kod, dokumentation och instruktioner finns i repot. Forka och klona för att komma igång!

---

| 📚 Dokumentation | 🔗 Länk |
|------------------|---------|
| **Huvudrepo** | [github.com/r87-e/team-flags](https://github.com/r87-e/team-flags) |
| Vecka 2: Single Container | [WEEK2_SINGLE_CONTAINER.md](https://github.com/r87-e/team-flags/blob/main/docs/WEEK2_SINGLE_CONTAINER.md) |
| **Vecka 3: Docker Compose** | [WEEK3_BOILER_ROOM_SV.md](https://github.com/r87-e/team-flags/blob/main/docs/WEEK3_BOILER_ROOM_SV.md) |
| Felsökning | [TROUBLESHOOTING.md](https://github.com/r87-e/team-flags/blob/main/docs/TROUBLESHOOTING.md) |

---

**Mål:** Orkestrera en 3-tjänst applikation med Docker Compose

**Förkunskaper:** Slutfört Vecka 2, eller ha grundläggande Docker-kunskaper.

---

## Lärandemål

Efter denna lab kommer du:
- ✅ Ha en docker-compose.yml som startar 3 tjänster
- ✅ Förstå Nginx → Next.js App → MongoDB arkitekturen
- ✅ Veta hur Docker-nätverk ger isolering
- ✅ Använda volumes för persistent data
- ✅ Konfigurera health checks för startordning

---

## Föreslagen Tidsplan

| Tid | Aktivitet |
|-----|-----------|
| 30 min | Intro: Docker Compose-grunder, arkitekturöversikt |
| 60 min | Hands-on: Fork → Clone → Starta → Förstå |
| 60 min | Utforska: Läs och förstå alla konfigurationsfiler |
| 30 min | Experimentera: Ändra, bryt, fixa |

---

## Snabbstart: Synka & Kör

### Steg 1: Synka Din Befintliga Fork (VIKTIGT!)

> **⚠️ Har du redan en fork från Vecka 2?** Då behöver du INTE forka igen!
> Du behöver synka din fork med upstream för att få de nya Docker Compose-filerna.

```bash
# 1. Gå till din befintliga fork-mapp
cd team-flags

# 2. Lägg till upstream (original-repot) - gör detta endast EN gång
git remote add upstream https://github.com/r87-e/team-flags.git

# 3. Verifiera att upstream är tillagt
git remote -v
# Du bör se:
# origin    https://github.com/DITT-ANVÄNDARNAMN/team-flags.git (fetch)
# origin    https://github.com/DITT-ANVÄNDARNAMN/team-flags.git (push)
# upstream  https://github.com/r87-e/team-flags.git (fetch)
# upstream  https://github.com/r87-e/team-flags.git (push)

# 4. Hämta uppdateringar från upstream
git fetch upstream

# 5. Merga in ändringarna till din main-branch
git checkout main
git merge upstream/main

# 6. Pusha till din fork (valfritt men rekommenderat)
git push origin main
```

> **💡 Vad händer här?**
> - `upstream` = original-repot (r87-e/team-flags) med de senaste ändringarna
> - `origin` = din fork (DITT-ANVÄNDARNAMN/team-flags)
> - `git fetch upstream` = hämtar ändringar utan att applicera dem
> - `git merge upstream/main` = applicerar ändringarna på din kod

**Om du får merge-konflikter:**
```bash
# Se vilka filer som har konflikter
git status

# Öppna filerna och lös konflikterna manuellt
# Leta efter <<<<<<< HEAD och >>>>>>> upstream/main

# Efter att du löst konflikterna:
git add .
git commit -m "Merge upstream changes"
```

---

### Steg 1b: Ny Här? Forka Repot

> **🆕 Första gången?** Om du INTE har en fork sedan tidigare, följ dessa steg:

```bash
# 1. Gå till GitHub och forka:
#    https://github.com/r87-e/team-flags
#    (Klicka på "Fork"-knappen uppe till höger)

# 2. Klona din fork (byt ut YOUR-USERNAME mot ditt GitHub-användarnamn)
git clone https://github.com/YOUR-USERNAME/team-flags.git
cd team-flags
```

### Steg 2: Inspektera Projektstrukturen

Innan du kör något, låt oss förstå vad vi jobbar med:

```bash
# Se vilka filer som finns i projektet
ls -la

# Du bör se dessa nyckelfiler:
# - docker-compose.yml  → Orkestrerar alla tjänster
# - Dockerfile          → Bygger Next.js-appen
# - nginx/              → Nginx reverse proxy-konfiguration
# - scripts/            → Databasinitiering
# - .env.example        → Miljövariabel-mall
```

---

## STOPP! Läs Innan Du Kör

**Kör inte kommandon blint.** Att förstå konfigurationen är hela poängen med denna lab. Ta tid att läsa varje fil.

---

### Steg 3: Inspektera docker-compose.yml (Orkestreraren)

Detta är den viktigaste filen. Läs den noggrant:

```bash
cat docker-compose.yml
```

**🔍 Vad du ska leta efter:**

| Rad | Leta efter | Varför det är viktigt |
|-----|------------|----------------------|
| `services:` | 3 tjänster definierade | nginx, app, db - vår 3-tier arkitektur |
| `build: ./nginx` | Bygg från lokal Dockerfile | nginx har anpassad konfiguration |
| `image: mongo:7` | Använder officiell image | db behöver ingen anpassad build |
| `depends_on: ... condition: service_healthy` | Startordning | Förhindrar "connection refused"-fel |
| `networks:` | Två nätverk definierade | frontend-net och backend-net för isolering |
| `volumes:` | Namngiven volym | mongo-data bevarar databasen över omstarter |
| `${VARIABLE:-default}` | Miljövariabler | Värden kommer från .env-fil, med fallback |

**❓ Fråga dig själv:**
- Vilken tjänst är exponerad mot internet (port 80)?
- Vilken tjänst kan prata med MongoDB?
- Vad händer om du tar bort `depends_on`?

---

### Steg 4: Inspektera Dockerfile (App Container)

```bash
cat Dockerfile
```

**🔍 Vad du ska leta efter:**

| Rad | Leta efter | Varför det är viktigt |
|-----|------------|----------------------|
| `FROM ... AS deps` | Multi-stage build | Separerar build från runtime |
| `FROM ... AS builder` | Andra steget | Kompilerar appen |
| `FROM ... AS runner` | Sista steget | Endast ~150MB istället för 1.5GB |
| `RUN adduser ... nextjs` | Icke-root användare | Säkerhet: containern kör inte som root |
| `USER nextjs` | Byt användare | Använder faktiskt icke-root användaren |
| `COPY --from=builder` | Kopiera mellan steg | Kopierar endast det som behövs |
| `EXPOSE 3000` | Dokumentation | Berättar vilken port (öppnar den inte) |

**❓ Fråga dig själv:**
- Varför använda 3 steg istället för 1?
- Varför skapa en speciell användare istället för att använda root?
- Vilka filer kopieras till den slutliga imagen?

---

### Steg 5: Inspektera Nginx-konfiguration

```bash
cat nginx/nginx.conf
```

**🔍 Vad du ska leta efter:**

| Rad | Leta efter | Varför det är viktigt |
|-----|------------|----------------------|
| `upstream nextjs { server app:3000; }` | Service discovery | `app` är containernamnet från docker-compose |
| `listen 80` | Port binding | Nginx lyssnar på port 80 |
| `proxy_pass http://nextjs` | Reverse proxy | Vidarebefordrar requests till Next.js |
| `X-Frame-Options` | Säkerhetsheader | Förhindrar clickjacking-attacker |
| `X-Content-Type-Options` | Säkerhetsheader | Förhindrar MIME sniffing |
| `location /health` | Health endpoint | Docker använder detta för health checks |

**❓ Fråga dig själv:**
- Hur vet nginx var `app:3000` finns?
- Vilka säkerhetsheaders läggs till?
- Varför ha en separat `/health` endpoint?

---

### Steg 6: Inspektera Nginx Dockerfile

```bash
cat nginx/Dockerfile
```

**🔍 Vad du ska leta efter:**
- Base image: `nginx:alpine` (minimal)
- Anpassad konfiguration kopieras in
- Health check-verktyg installeras (wget)

---

### Steg 7: Inspektera Miljökonfiguration

```bash
cat .env.example
```

**🔍 Vad du ska leta efter:**

| Variabel | Syfte |
|----------|-------|
| `MONGODB_URI` | Databasanslutningssträng (innehåller inloggningsuppgifter!) |
| `MONGO_USERNAME` / `MONGO_PASSWORD` | Databasinloggningsuppgifter |
| `NGINX_PORT` | Vilken port nginx lyssnar på |
| `NODE_ENV` | production vs development-läge |

**⚠️ Säkerhetsnotis:** Denna fil har exempellösenord. I produktion, använd starka lösenord och committa ALDRIG `.env` till Git!

---

### Steg 8: Skapa Din Miljöfil

Nu när du förstår vad som finns i den:

```bash
# Kopiera exempelfilen till en riktig .env
cp .env.example .env

# Verifiera att den skapades
cat .env
```

> **💡 Varför .env?**
> Miljövariabler separerar konfiguration från kod. Du kan köra samma Docker-image
> i olika miljöer (dev, staging, prod) bara genom att ändra .env-filen.
> Dessa filer ska ALDRIG committas till Git eftersom de ofta innehåller lösenord!

---

### Steg 9: NU Kör Docker Compose

Du har läst konfigurationerna. Nu förstår du vad som kommer hända:

```bash
# Bygg och starta alla 3 tjänster
docker compose up --build
```

**Titta på outputen och matcha den mot vad du läste:**
1. Docker läser `docker-compose.yml` och hittar 3 tjänster: nginx, app, db
2. För `db`: hämtar `mongo:7` image (ingen build behövs)
3. För `app`: kör multi-stage Dockerfile du inspekterade
4. För `nginx`: kör `nginx/Dockerfile` du inspekterade
5. Tjänster startar i ordning: db → app → nginx (på grund av `depends_on`)
6. Health checks körs tills alla tjänster är healthy
7. När redo kan du nå appen på http://localhost

---

### Steg 10: Verifiera Att Allt Fungerar

```bash
# I en ny terminal, kontrollera status på alla containrar
docker compose ps

# Förväntat resultat - alla ska visa "healthy":
# NAME               STATUS                   PORTS
# team-flags-nginx   Up X minutes (healthy)   0.0.0.0:80->80/tcp
# team-flags-app     Up X minutes (healthy)   3000/tcp
# team-flags-db      Up X minutes (healthy)   0.0.0.0:27017->27017/tcp
```

---

## Arkitektur: 3-Tjänst Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                         DOCKER HOST                              │
│                                                                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                    WEBBLÄSARE                            │  │
│    │                 http://localhost                         │  │
│    └─────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│                          ▼                                       │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │              NGINX (Reverse Proxy)                       │  │
│    │                                                          │  │
│    │  • Port 80 (exponerad)                                   │  │
│    │  • Vidarebefordrar requests till app:3000                │  │
│    │  • Lägger till säkerhetsheaders                          │  │
│    │  • Hanterar cachning av statiska filer                   │  │
│    └─────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│                    frontend-net (Docker-nätverk)                 │
│                          │                                       │
│                          ▼                                       │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │              NEXT.JS APP (Applikation)                   │  │
│    │                                                          │  │
│    │  • Port 3000 (intern - ej exponerad)                     │  │
│    │  • React frontend + API routes                           │  │
│    │  • Ansluter till MongoDB för data                        │  │
│    │  • Health endpoint: /api/health                          │  │
│    └─────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│                    backend-net (Docker-nätverk)                  │
│                          │                                       │
│                          ▼                                       │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │              MONGODB (Databas)                           │  │
│    │                                                          │  │
│    │  • Port 27017 (exponerad för debug)                      │  │
│    │  • Persistent data via volym                             │  │
│    │  • Inloggningsuppgifter via miljövariabler               │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Varför Denna Arkitektur?

| Tjänst | Syfte | Varför? |
|--------|-------|---------|
| **Nginx** | Reverse proxy | Döljer backend-portar, lägger till säkerhetsheaders, kan hantera SSL |
| **App** | Applikationslogik | Separerad från databas och proxy för skalbarhet |
| **MongoDB** | Datalagring | Isolerad i eget nätverk, endast åtkomlig från app |

### Nätverksisolering

```
frontend-net:  nginx ←→ app       (användare kan nå)
backend-net:   app ←→ db         (endast internt)
```

> **💡 Varför två nätverk?**
> MongoDB är endast ansluten till `backend-net`. Det betyder att någon som komprometterar
> nginx INTE kan nå databasen direkt - de måste gå genom app-tjänsten först.
> Detta är "defense in depth" - flera lager av säkerhet.

---

## Praktiska Övningar

### Övning 1: Utforska Docker Compose (15 min)

```bash
# 1. Visa alla containrar och deras status
docker compose ps
```

> **💡 Lärmoment: Container-tillstånd**
> - `Up (healthy)` = Container kör OCH health check passerar
> - `Up (health: starting)` = Kör men health check har inte passerat än
> - `Up (unhealthy)` = Kör men health check misslyckas
> - `Exited` = Container stannade (kolla loggar för att se varför!)

```bash
# 2. Visa loggar från alla tjänster (Ctrl+C för att stoppa)
docker compose logs -f
```

> **🔧 Tips:** Flaggan `-f` betyder "follow" - loggar strömmas i realtid.
> Utan `-f` ser du bara befintliga loggar och avslutar.

```bash
# 3. Visa loggar från endast appen
docker compose logs -f app
```

> **💡 Lärmoment: Loggfiltrering**
> I produktion kan du ha 20+ tjänster. Att filtrera loggar efter tjänstnamn
> är essentiellt för felsökning. Du kan också kombinera: `docker compose logs -f app nginx`

```bash
# 4. Visa nätverkskonfiguration
docker network ls
docker network inspect team-flags-frontend
```

> **🔍 Vad du ska leta efter i network inspect:**
> - `"Containers"` sektionen visar vilka containrar som är anslutna
> - `"Subnet"` visar IP-intervallet (t.ex. 172.18.0.0/16)
> - Varje container får en IP inom detta subnet

**Frågor att svara på:**
- Vilka containrar kör?
- Vilken status har varje container?
- Vilka nätverk finns och vilka tjänster är anslutna till varje?

---

### Övning 2: Testa Health Endpoints (10 min)

```bash
# 1. Nginx health check (direkt)
curl http://localhost/health
```

> **💡 Varför nginx har sin egen health endpoint:**
> Nginx svarar med "OK" direkt - ingen backend behövs. Detta låter Docker
> veta att nginx själv fungerar, separat från om appen fungerar.

```bash
# 2. App health check (via nginx)
curl http://localhost/api/health
```

> **🔍 Undersök svaret:**
> ```json
> {
>   "status": "healthy",
>   "checks": {
>     "database": { "status": "connected" }
>   }
> }
> ```
> Appen kontrollerar MongoDB-anslutningen och rapporterar det. Detta är en **djup health check** -
> den verifierar att hela kedjan fungerar, inte bara att processen kör.

```bash
# 3. MongoDB ping (inne i containern)
docker compose exec db mongosh --eval "db.adminCommand('ping')"
```

> **💡 Lärmoment: `docker compose exec`**
> Detta kör ett kommando INNE I en körande container. Det är som att SSH:a in i en server.
> - `exec db` = kör i `db`-containern
> - `mongosh` = MongoDB shell
> - `--eval "..."` = kör detta JavaScript och avsluta

**Frågor att svara på:**
- Vad returnerar varje health endpoint?
- Varför har vi health checks på varje tjänst?

> **🎓 Verklighetsinsikt:**
> Health checks är inte bara för Docker. Kubernetes, lastbalanserare (AWS ALB,
> nginx upstream), och övervakningsverktyg (Prometheus, Datadog) använder alla health
> endpoints för att veta om din tjänst fungerar.

---

### Övning 3: Nätverksisoleringtest (15 min)

Denna övning bevisar att Docker-nätverk faktiskt isolerar tjänster.

```bash
# 1. Försök nå MongoDB från nginx-containern (ska MISSLYCKAS)
docker compose exec nginx ping -c 3 db
# Förväntat: "bad address 'db'" - nginx kan inte se db
```

> **🔐 Säkerhetsinsikt:**
> Detta fel är BRA! Det betyder att nginx (som är exponerad mot internet på port 80)
> inte kan direkt nå din databas. En angripare som komprometterar nginx
> skulle behöva också komprometta appen för att nå MongoDB.

```bash
# 2. Försök nå MongoDB från app-containern (ska LYCKAS)
docker compose exec app ping -c 3 db
# Förväntat: "64 bytes from..." - app kan nå db
```

> **💡 Hur löser `db` upp till en IP?**
> Docker har en inbyggd DNS-server. När du använder tjänstnamn i docker-compose,
> skapar Docker automatiskt DNS-poster. `db` löser upp till MongoDBs container-IP.

```bash
# 3. Försök nå app från nginx (ska LYCKAS)
docker compose exec nginx wget -qO- http://app:3000/api/health
```

> **💡 Lärmoment: Service Discovery**
> Notera att vi använder `app:3000` inte `localhost:3000` eller en IP-adress.
> Detta är **service discovery** - containrar hittar varandra via namn.
> Om du skalar till 3 app-containrar skulle `app` round-robin mellan dem!

**Vad vi bevisade:**
| Från | Till | Resultat | Varför |
|------|------|----------|--------|
| nginx | db | ❌ MISSLYCKAS | Olika nätverk |
| nginx | app | ✅ OK | Båda på frontend-net |
| app | db | ✅ OK | Båda på backend-net |

> **🎓 Detta är "Defense in Depth"**
> Flera säkerhetslager: Även om ett lager misslyckas, skyddar andra dig.
> Nätverksisolering är ett lager. Icke-root användare är ett annat. Brandväggar är ett annat.

---

### Övning 4: Experimentera - Bryt Saker! (20 min)

Det bästa sättet att lära sig är att bryta saker och fixa dem.

**A) Ändra en miljövariabel:**
```bash
# Stoppa allt
docker compose down

# Redigera .env och ändra NGINX_PORT till 8080
nano .env  # eller använd valfri editor

# Starta igen
docker compose up -d

# Nu bör appen vara på http://localhost:8080
curl http://localhost:8080/api/health
```

> **💡 Lärmoment: Miljövariabler**
> Vi ändrade porten UTAN att modifiera någon kod eller konfigurationsfiler.
> Detta är "12-factor app"-principen: konfiguration via miljön.
> Samma Docker-image kan köra på port 80, 8080, eller 443 bara genom att ändra `.env`.

**B) Simulera ett databasfel:**
```bash
# Stoppa endast databasen
docker compose stop db

# Kolla vad som händer med health checks
docker compose ps
# Notera: app kan bli "unhealthy" efter några kontroller

curl http://localhost/api/health
# Bör visa database: "disconnected" eller "error"

# Starta databasen igen
docker compose start db

# Titta på återhämtningen
docker compose ps
# App bör bli healthy igen automatiskt
```

> **🎓 Verklighetsinsikt: Resiliens**
> I produktion startar databaser om, nätverk hickar, tjänster kraschar.
> Bra applikationer hanterar detta graciöst:
> - Health checks upptäcker problem
> - Orkestreringssystem (Docker, Kubernetes) startar om ohälsosamma containrar
> - Appar återansluter när beroenden kommer tillbaka
>
> Detta är varför vi använder connection pooling och retry-logik!

**C) Inspektera inne i en container:**
```bash
# Gå in i app-containern
docker compose exec app sh

# Inne i containern - utforska!
pwd                           # Var är vi? /app
ls -la                        # Vilka filer finns?
cat /etc/passwd | grep nextjs # Se icke-root användaren
whoami                        # Bekräfta att vi kör som nextjs
ps aux                        # Vilka processer kör?
env | grep MONGO              # Se miljövariabler

exit
```

> **🔐 Säkerhetsinsikt: Varför icke-root är viktigt**
> Notera att `whoami` returnerar `nextjs`, inte `root`.
> Om en angripare utnyttjar en sårbarhet i din app, får de `nextjs`
> behörigheter - som inte kan installera mjukvara, modifiera systemfiler, eller
> nå andra containrar. Detta begränsar skadeomfånget vid en kompromiss.

**D) BONUS: Titta på resursanvändning i realtid:**
```bash
# Se CPU/minnesanvändning för alla containrar
docker stats

# Tryck Ctrl+C för att avsluta
```

> **💡 Tips:** I produktion skulle du sätta minnes-/CPU-gränser i docker-compose
> för att förhindra att en container svälter ut andra. Kolla upp `deploy.resources.limits`.

---

## Kunskapskontroll

Testa din förståelse genom att svara på dessa frågor:

### 1. Förklara syftet med varje tjänst (3 poäng)
- Nginx:
- App (Next.js):
- MongoDB:

### 2. Varför har vi två separata nätverk? (2 poäng)

### 3. Vad händer om du tar bort `depends_on` från app-tjänsten? (2 poäng)

### 4. Förklara skillnaden mellan `ports` och `expose` i Docker Compose (2 poäng)

### 5. Varför använder Dockerfile multi-stage builds? (2 poäng)

### 6. Rita ett diagram som visar hur en HTTP-request flödar från webbläsare till databas (3 poäng)

---

## Vanliga Problem & Lösningar

### Problem: "Port already in use"
```bash
# Lösning 1: Ändra port i .env
NGINX_PORT=8080

# Lösning 2: Hitta och stoppa processen som använder porten
lsof -i :80
kill -9 <PID>
```

### Problem: "Container won't start"
```bash
# Kolla loggar för specifik tjänst
docker compose logs app

# Bygg om från scratch
docker compose down -v
docker compose up --build
```

### Problem: "Cannot connect to MongoDB"
```bash
# Vänta - MongoDB tar tid att starta
# Kolla health status
docker compose ps

# Verifiera att MongoDB kör
docker compose exec db mongosh --eval "db.adminCommand('ping')"
```

### Problem: "502 Bad Gateway"
```bash
# Appen har inte startat än, vänta på health check
docker compose logs -f app
# Vänta tills du ser "Ready in Xs"
```

---

## Självstudier: Fördjupningsresurser

Använd dessa resurser för att fördjupa din förståelse:

### Docker Compose-grunder

| Ämne | Resurs | Tid |
|------|--------|-----|
| Docker Compose Intro | [YouTube: TechWorld with Nana](https://www.youtube.com/watch?v=MVIcrmeV_6c) | 20 min |
| Docker Networks Explained | [YouTube: NetworkChuck](https://www.youtube.com/watch?v=bKFMS5C4CG0) | 15 min |
| Docker Volumes Deep Dive | [YouTube: TechWorld with Nana](https://www.youtube.com/watch?v=p2PH_YPCsis) | 18 min |

### Multi-stage Builds & Optimering

| Ämne | Resurs | Tid |
|------|--------|-----|
| Multi-stage Dockerfile | [YouTube: DevOps Directive](https://www.youtube.com/watch?v=zpkqNPwEzac) | 12 min |
| Docker Security Best Practices | [YouTube: IBM Technology](https://www.youtube.com/watch?v=JE2PJbbpjsM) | 10 min |

### Nginx som Reverse Proxy

| Ämne | Resurs | Tid |
|------|--------|-----|
| Nginx Reverse Proxy | [YouTube: The Digital Life](https://www.youtube.com/watch?v=lZVAI3PqgHc) | 14 min |
| Nginx Configuration | [YouTube: Traversy Media](https://www.youtube.com/watch?v=7VAI73roXaY) | 25 min |

### Officiell Dokumentation

- [Docker Compose Specification](https://docs.docker.com/compose/compose-file/)
- [Docker Networking](https://docs.docker.com/network/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Interaktiva Övningar

- [Play with Docker](https://labs.play-with-docker.com/) - Gratis Docker-miljö i webbläsaren
- [Docker 101 Tutorial](https://www.docker.com/101-tutorial/) - Officiell hands-on tutorial

---

## Vad Kommer Härnäst

### Vecka 4: CI/CD Pipeline
- GitHub Actions
- Automatiserade builds
- Container registry

### Vecka 5-6: Säkerhet
- Trivy container scanning
- SBOM-generering
- Säkerhetshärdning

---

## Checklista

Innan du avslutar, se till att du:

- [ ] Kan starta alla 3 tjänster med `docker compose up`
- [ ] Förstår vad varje tjänst gör
- [ ] Kan förklara nätverksisolering
- [ ] Har testat health endpoints
- [ ] Har svarat på kunskapskontrollfrågorna
- [ ] Vet var du hittar fördjupningsmaterial

---

## Behöver Du Hjälp?

- **Något trasigt?** Kolla [Felsökningsguiden på GitHub](https://github.com/r87-e/team-flags/blob/main/docs/TROUBLESHOOTING.md)
- **Repetera grunder?** Gå tillbaka till [Vecka 2 på GitHub](https://github.com/r87-e/team-flags/blob/main/docs/WEEK2_SINGLE_CONTAINER.md)
- **Redo för mer?** Fortsätt till Vecka 4: CI/CD Pipeline (kommer snart)

---

**Lycka till! Fråga om du kör fast!**

---

> **📚 Navigation:** [GitHub Repo](https://github.com/r87-e/team-flags) | [Vecka 2](https://github.com/r87-e/team-flags/blob/main/docs/WEEK2_SINGLE_CONTAINER.md) | **Vecka 3** | [Felsökning](https://github.com/r87-e/team-flags/blob/main/docs/TROUBLESHOOTING.md)
