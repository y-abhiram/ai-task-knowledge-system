from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.middleware.auth import get_current_active_user, require_admin
from app.schemas.task import Task, TaskCreate, TaskUpdate
from app.models.task import TaskStatus
from app.models.user import User
from app.repositories.task_repository import TaskRepository
from app.services.activity_log_service import ActivityLogService

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=List[Task])
async def get_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[TaskStatus] = Query(None),
    assigned_to: Optional[int] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task_repo = TaskRepository(db)

    if current_user.role.name != "admin":
        assigned_to = current_user.id

    tasks = task_repo.get_all(
        skip=skip,
        limit=limit,
        status=status,
        assigned_to=assigned_to
    )
    return tasks


@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task_repo = TaskRepository(db)
    task = task_repo.get_by_id(task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role.name != "admin" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this task")

    return task


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    task_repo = TaskRepository(db)
    task_dict = task_data.model_dump()
    task_dict['created_by'] = current_user.id

    task = task_repo.create(task_dict)

    ActivityLogService.log_activity(
        db=db,
        user_id=current_user.id,
        action_type="task_create",
        description=f"Created task: {task.title}",
        metadata={"task_id": task.id}
    )

    return task


@router.patch("/{task_id}", response_model=Task)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task_repo = TaskRepository(db)
    task = task_repo.get_by_id(task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role.name != "admin" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")

    update_data = task_update.model_dump(exclude_unset=True)
    updated_task = task_repo.update(task, update_data)

    ActivityLogService.log_activity(
        db=db,
        user_id=current_user.id,
        action_type="task_update",
        description=f"Updated task: {task.title}",
        metadata={"task_id": task.id, "updates": update_data}
    )

    return updated_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    task_repo = TaskRepository(db)
    task = task_repo.get_by_id(task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task_repo.delete(task)

    ActivityLogService.log_activity(
        db=db,
        user_id=current_user.id,
        action_type="task_delete",
        description=f"Deleted task: {task.title}",
        metadata={"task_id": task_id}
    )

    return None
