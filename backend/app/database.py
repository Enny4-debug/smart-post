from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# ── Engine ───────────────────────────────────────────────────────
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,       # logs SQL in development
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,        # validate connections before use
)

# ── Session factory ───────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,    # objects stay usable after commit
    autoflush=False,
    autocommit=False,
)

# ── Base class for all ORM models ─────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependency: yields a DB session per request ───────────────────
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
