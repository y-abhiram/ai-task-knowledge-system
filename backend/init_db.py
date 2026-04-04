import sys
from sqlalchemy import create_engine, text
from app.core.database import Base, engine
from app.models.user import User, Role
from app.models.task import Task
from app.models.document import Document
from app.models.activity_log import ActivityLog
from app.models.search_query import SearchQuery
from app.core.security import get_password_hash
from app.core.config import settings


def init_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

    from sqlalchemy.orm import Session
    db = Session(bind=engine)

    try:
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            print("Creating roles...")
            admin_role = Role(name="admin", description="Administrator role with full access")
            user_role = Role(name="user", description="Regular user role")
            db.add(admin_role)
            db.add(user_role)
            db.commit()
            db.refresh(admin_role)
            db.refresh(user_role)
            print("Roles created successfully!")

            print("Creating default admin user...")
            admin_user = User(
                email="admin@example.com",
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash("admin123"),
                role_id=admin_role.id,
                is_active=True
            )
            db.add(admin_user)

            print("Creating default test user...")
            test_user = User(
                email="user@example.com",
                username="user",
                full_name="Test User",
                hashed_password=get_password_hash("user123"),
                role_id=user_role.id,
                is_active=True
            )
            db.add(test_user)

            db.commit()
            print("Default users created successfully!")
            print("\nDefault Credentials:")
            print("Admin - Username: admin, Password: admin123")
            print("User  - Username: user, Password: user123")
        else:
            print("Database already initialized with roles and users.")

    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

    print("\nDatabase initialization completed!")


if __name__ == "__main__":
    init_database()
