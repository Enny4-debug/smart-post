import asyncio
import sys
import os

# Add backend directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.routers.auth import pwd_context
from app.database import AsyncSessionLocal
from app.models.user import User

async def seed_users():
    async with AsyncSessionLocal() as session:
        # Check if users exist
        # Admin User
        admin_user = User(
            email="admin@iaacollege.ac.tz",
            password_hash=pwd_context.hash("admin123"),
            name="System Admin",
            role="ADMIN",
            is_active=True
        )
        
        # Staff User (HOD)
        staff_user = User(
            email="hod.cs@iaacollege.ac.tz",
            password_hash=pwd_context.hash("staff123"),
            name="Dr. Smith",
            role="STAFF",
            is_active=True
        )

        # Student User
        student_user = User(
            email="student@iaacollege.ac.tz",
            password_hash=pwd_context.hash("student123"),
            name="Jane Doe",
            role="STUDENT",
            is_active=True
        )

        try:
            session.add(admin_user)
            session.add(staff_user)
            session.add(student_user)
            await session.commit()
            print("Successfully seeded Admin, Staff, and Student users!")
        except Exception as e:
            print(f"Error seeding users (they might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(seed_users())
