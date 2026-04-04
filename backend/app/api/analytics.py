from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth import get_current_active_user
from app.schemas.analytics import Analytics, TaskAnalytics, SearchAnalytics
from app.models.user import User
from app.models.task import TaskStatus
from app.repositories.task_repository import TaskRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.search_query_repository import SearchQueryRepository
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=Analytics)
async def get_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task_repo = TaskRepository(db)
    doc_repo = DocumentRepository(db)
    search_repo = SearchQueryRepository(db)
    user_repo = UserRepository(db)

    total_tasks = task_repo.count_all()
    completed_tasks = task_repo.count_by_status(TaskStatus.COMPLETED)
    pending_tasks = task_repo.count_by_status(TaskStatus.PENDING)
    in_progress_tasks = task_repo.count_by_status(TaskStatus.IN_PROGRESS)

    total_searches = search_repo.count_all()
    top_queries = search_repo.get_top_queries(limit=10)

    total_documents = doc_repo.count_all()
    total_users = len(user_repo.get_all())

    task_analytics = TaskAnalytics(
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        in_progress_tasks=in_progress_tasks
    )

    search_analytics = SearchAnalytics(
        total_searches=total_searches,
        top_queries=top_queries
    )

    analytics = Analytics(
        task_analytics=task_analytics,
        search_analytics=search_analytics,
        total_documents=total_documents,
        total_users=total_users
    )

    return analytics
