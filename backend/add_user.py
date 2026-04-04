#!/usr/bin/env python3
"""
Utility script to add users to the database.
Usage: python add_user.py
"""
import sys
from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.user import User, Role
from app.core.security import get_password_hash


def add_user():
    """Interactive script to add a new user"""
    print("=" * 50)
    print("Add New User to the System")
    print("=" * 50)

    # Get user input
    username = input("Enter username: ").strip()
    email = input("Enter email: ").strip()
    full_name = input("Enter full name: ").strip()
    password = input("Enter password: ").strip()

    print("\nSelect role:")
    print("1. Admin")
    print("2. User (Regular)")
    role_choice = input("Enter choice (1 or 2): ").strip()

    if role_choice == "1":
        role_name = "admin"
    else:
        role_name = "user"

    # Confirm
    print("\n" + "=" * 50)
    print("User Details:")
    print(f"Username: {username}")
    print(f"Email: {email}")
    print(f"Full Name: {full_name}")
    print(f"Role: {role_name}")
    print("=" * 50)

    confirm = input("\nCreate this user? (yes/no): ").strip().lower()

    if confirm not in ['yes', 'y']:
        print("User creation cancelled.")
        return

    # Create user in database
    db = Session(bind=engine)

    try:
        # Check if username exists
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            print(f"\nError: Username '{username}' already exists!")
            return

        # Check if email exists
        existing_email = db.query(User).filter(User.email == email).first()
        if existing_email:
            print(f"\nError: Email '{email}' already exists!")
            return

        # Get role
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            print(f"\nError: Role '{role_name}' not found in database!")
            return

        # Create user
        new_user = User(
            username=username,
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password),
            role_id=role.id,
            is_active=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print("\n" + "=" * 50)
        print("✅ User created successfully!")
        print(f"User ID: {new_user.id}")
        print(f"Username: {new_user.username}")
        print(f"Role: {role_name}")
        print("=" * 50)

    except Exception as e:
        print(f"\n❌ Error creating user: {e}")
        db.rollback()
    finally:
        db.close()


def list_users():
    """List all users in the system"""
    db = Session(bind=engine)

    try:
        users = db.query(User).all()

        print("\n" + "=" * 80)
        print("Current Users in System")
        print("=" * 80)
        print(f"{'ID':<5} {'Username':<15} {'Email':<30} {'Role':<10} {'Active':<8}")
        print("-" * 80)

        for user in users:
            print(f"{user.id:<5} {user.username:<15} {user.email:<30} {user.role.name:<10} {'Yes' if user.is_active else 'No':<8}")

        print("=" * 80)
        print(f"Total users: {len(users)}")
        print("=" * 80)

    except Exception as e:
        print(f"Error listing users: {e}")
    finally:
        db.close()


def change_user_password():
    """Change password for an existing user"""
    print("=" * 50)
    print("Change User Password")
    print("=" * 50)

    username = input("Enter username: ").strip()
    new_password = input("Enter new password: ").strip()

    db = Session(bind=engine)

    try:
        user = db.query(User).filter(User.username == username).first()

        if not user:
            print(f"\n❌ User '{username}' not found!")
            return

        user.hashed_password = get_password_hash(new_password)
        db.commit()

        print(f"\n✅ Password changed successfully for user '{username}'!")

    except Exception as e:
        print(f"\n❌ Error changing password: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    while True:
        print("\n" + "=" * 50)
        print("User Management Tool")
        print("=" * 50)
        print("1. Add new user")
        print("2. List all users")
        print("3. Change user password")
        print("4. Exit")
        print("=" * 50)

        choice = input("\nEnter your choice (1-4): ").strip()

        if choice == "1":
            add_user()
        elif choice == "2":
            list_users()
        elif choice == "3":
            change_user_password()
        elif choice == "4":
            print("\nGoodbye!")
            break
        else:
            print("\n❌ Invalid choice. Please enter 1-4.")


if __name__ == "__main__":
    main()
