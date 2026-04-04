import sys
from sqlalchemy.orm import Session
from app.core.database import engine, Base
from app.core.security import get_password_hash
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

# Define models inline to avoid circular imports
class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

def create_users():
    db = Session(bind=engine)

    try:
        # Check if roles exist
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        user_role = db.query(Role).filter(Role.name == "user").first()

        if not admin_role or not user_role:
            print("Roles not found. Creating roles...")
            if not admin_role:
                admin_role = Role(name="admin", description="Administrator role with full access")
                db.add(admin_role)
            if not user_role:
                user_role = Role(name="user", description="Regular user role")
                db.add(user_role)
            db.commit()
            db.refresh(admin_role)
            db.refresh(user_role)
            print("Roles created!")

        # Check if admin user exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            print("Creating admin user...")
            admin_user = User(
                email="admin@example.com",
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash("admin123"),
                role_id=admin_role.id,
                is_active=True
            )
            db.add(admin_user)
            print("Admin user created!")
        else:
            print("Admin user already exists")

        # Check if test user exists
        test_user = db.query(User).filter(User.username == "user").first()
        if not test_user:
            print("Creating test user...")
            test_user = User(
                email="user@example.com",
                username="user",
                full_name="Test User",
                hashed_password=get_password_hash("user123"),
                role_id=user_role.id,
                is_active=True
            )
            db.add(test_user)
            print("Test user created!")
        else:
            print("Test user already exists")

        db.commit()

        print("\n✅ Users created successfully!")
        print("\nLogin Credentials:")
        print("Admin - Username: admin, Password: admin123")
        print("User  - Username: user, Password: user123")

    except Exception as e:
        print(f"❌ Error creating users: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_users()
