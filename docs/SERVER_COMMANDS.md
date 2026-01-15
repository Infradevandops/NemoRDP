# Server Management Commands

Here are the essential commands for managing your NemoRDP server.

## 🚀 Start/Stop Server

**Start Services** (Detached mode)
```bash
docker compose -f docker-compose.prod.yml up -d
```

**Stop Services**
```bash
docker compose -f docker-compose.prod.yml down
```

**Restart Specific Service** (e.g., backend)
```bash
docker compose -f docker-compose.prod.yml restart backend
```

---

## 📜 Logs & Monitoring

**View Real-time Logs** (All services)
```bash
docker compose -f docker-compose.prod.yml logs -f
```

**View Specific Logs**
```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f worker
```

**Check Container Status**
```bash
docker compose -f docker-compose.prod.yml ps
```

---

## 🛠️ Maintenance & Debugging

**Create Admin User**
Run this command to create a default admin user (`admin@nemordp.com` / `admin123`):
```bash
docker exec -it nemordp_backend python -c "
from backend.database.connection import SessionLocal
from backend.models.user import User
from backend.models.rdp_instance import RDPInstance
from backend.models.ticket import Ticket
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
db = SessionLocal()

email = 'admin@nemordp.com'
password = 'admin123'

existing = db.query(User).filter(User.email == email).first()
if not existing:
    hashed_pw = pwd_context.hash(password)
    user = User(email=email, hashed_password=hashed_pw)
    db.add(user)
    db.commit()
    print(f'\n✅ Created Admin User:\nEmail: {email}\nPassword: {password}')
else:
    print(f'\nℹ️ Admin User already exists:\nEmail: {email}')
"
```

**Shell into Backend**
```bash
docker exec -it nemordp_backend bash
```

**Database Backup**
```bash
docker exec -t nemordp_db pg_dumpall -c -U postgres > dump_$(date +%F_%H-%M-%S).sql
```

**Database Restore**
```bash
cat dump_file.sql | docker exec -i nemordp_db psql -U postgres
```

---

## 🔄 Updates & Troubleshooting

**Pull Latest Code & Rebuild**
```bash
git pull
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

**Fixing Dependency Issues**
If you encounter `ImportError` or `AttributeError` related to Pydantic/FastAPI, ensure your `backend/requirements.txt` includes `pydantic<2.0.0` and `email-validator`.
Then rebuild:
```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml build --no-cache backend
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
```
