from sqlalchemy.orm import Session
from typing import Optional
from app.repositories.activity_log_repository import ActivityLogRepository


class ActivityLogService:
    @staticmethod
    def log_activity(
        db: Session,
        user_id: int,
        action_type: str,
        description: str,
        metadata: Optional[dict] = None,
        ip_address: Optional[str] = None
    ):
        repo = ActivityLogRepository(db)
        log_data = {
            'user_id': user_id,
            'action_type': action_type,
            'description': description,
            'action_metadata': metadata,
            'ip_address': ip_address
        }
        return repo.create(log_data)
