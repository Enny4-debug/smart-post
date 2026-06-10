from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.routers import auth, users, requests, approvals, documents, reports, admin

# ── App instance ──────────────────────────────────────────────────
app = FastAPI(
    title="SmartPost API",
    description="IAA College — Digital Academic Postponement Management System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file serving (uploaded evidence files) ─────────────────
os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# ── Routers ───────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router,      prefix=API_PREFIX)
app.include_router(users.router,     prefix=API_PREFIX)
app.include_router(requests.router,  prefix=API_PREFIX)
app.include_router(approvals.router, prefix=API_PREFIX)
app.include_router(documents.router, prefix=API_PREFIX)
app.include_router(reports.router,   prefix=API_PREFIX)
app.include_router(admin.router,     prefix=API_PREFIX)


# ── Health check ──────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "app": settings.app_name, "env": settings.app_env}


# ── Startup / Shutdown events ─────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    print(f"🚀 {settings.app_name} API started [{settings.app_env}]")
    print(f"   Docs → http://127.0.0.1:8000/api/docs")


@app.on_event("shutdown")
async def on_shutdown():
    print(f"🛑 {settings.app_name} API shutting down.")
