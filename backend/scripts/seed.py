import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.routers.auth import pwd_context
from app.database import AsyncSessionLocal
from app.models.user import User

USERS = [
    User(
        email="admin@iaacollege.ac.tz",
        password_hash=pwd_context.hash("admin123"),
        name="System Admin",
        role="administrator",
        is_active=True,
    ),
    User(
        email="hod.cs@iaacollege.ac.tz",
        password_hash=pwd_context.hash("staff123"),
        name="Dr. Smith",
        role="hod_academic",
        is_active=True,
    ),
    User(
        email="exams@iaacollege.ac.tz",
        password_hash=pwd_context.hash("staff123"),
        name="Ms. Johnson",
        role="hod_examinations",
        is_active=True,
    ),
    User(
        email="manager@iaacollege.ac.tz",
        password_hash=pwd_context.hash("manager123"),
        name="Mr. Kamau",
        role="campus_manager",
        is_active=True,
    ),
    User(
        email="student@iaacollege.ac.tz",
        password_hash=pwd_context.hash("student123"),
        name="Enny Mwaseba",
        role="student",
        is_active=True,
    ),
]

async def seed_users():
    async with AsyncSessionLocal() as session:
        try:
            for u in USERS:
                session.add(u)
            await session.commit()
            print("Successfully seeded all 5 users!")
        except Exception as e:
            print(f"Error seeding users (they might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(seed_users())
