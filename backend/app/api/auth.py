from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.schemas.user import LoginRequest, Token, UserCreate, User, PasswordChangeRequest
from app.repositories.user_repository import UserRepository
from app.services.activity_log_service import ActivityLogService
from app.middleware.auth import get_current_active_user
from app.models.user import User as UserModel

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)
    user = user_repo.get_by_username(login_data.username)

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username, "role": user.role.name},
        expires_delta=access_token_expires
    )

    ActivityLogService.log_activity(
        db=db,
        user_id=user.id,
        action_type="login",
        description=f"User {user.username} logged in",
        ip_address=request.client.host if request.client else None
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)

    if user_repo.get_by_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    if user_repo.get_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user = user_repo.create(user_data.model_dump())

    ActivityLogService.log_activity(
        db=db,
        user_id=user.id,
        action_type="register",
        description=f"New user {user.username} registered"
    )

    return user


@router.post("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    request: Request,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change password for the currently logged-in user.
    Requires old password verification.
    """
    # Verify old password
    if not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )

    # Update to new password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    # Log the activity
    ActivityLogService.log_activity(
        db=db,
        user_id=current_user.id,
        action_type="password_change",
        description=f"User {current_user.username} changed their password",
        ip_address=request.client.host if request.client else None
    )

    return {"message": "Password changed successfully"}
