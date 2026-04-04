from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_password_hash
from app.schemas.user import User, UserCreate, UserUpdate
from app.repositories.user_repository import UserRepository
from app.middleware.auth import require_admin, get_current_active_user
from app.models.user import User as UserModel
from app.services.activity_log_service import ActivityLogService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all users (Admin only).
    """
    user_repo = UserRepository(db)
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user by ID. Users can only view their own profile unless they're admin.
    """
    # Allow users to view their own profile or admins to view any profile
    if current_user.role.name != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update user (Admin only).
    """
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update user
    update_data = user_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)

    ActivityLogService.log_activity(
        db=db,
        user_id=current_user.id,
        action_type="user_update",
        description=f"Admin updated user {user.username}"
    )

    return user


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete user (Admin only).
    Cannot delete yourself.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    ActivityLogService.log_activity(
        db=db,
        user_id=current_user.id,
        action_type="user_delete",
        description=f"Admin deleted user {user.username}"
    )

    return {"message": f"User {user.username} deleted successfully"}


@router.post("/{user_id}/reset-password")
async def admin_reset_password(
    user_id: int,
    new_password: str,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin can reset any user's password without knowing the old password.
    """
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update password
    user.hashed_password = get_password_hash(new_password)
    db.commit()

    ActivityLogService.log_activity(
        db=db,
        user_id=current_user.id,
        action_type="admin_password_reset",
        description=f"Admin reset password for user {user.username}"
    )

    return {"message": f"Password reset successfully for user {user.username}"}
