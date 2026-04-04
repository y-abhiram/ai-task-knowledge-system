from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.activity_log import ActivityLog


class ActivityLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, log_data: dict) -> ActivityLog:
        activity_log = ActivityLog(**log_data)
        self.db.add(activity_log)
        self.db.commit()
        self.db.refresh(activity_log)
        return activity_log

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[ActivityLog]:
        return self.db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id
        ).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ActivityLog]:
        return self.db.query(ActivityLog).order_by(
            ActivityLog.created_at.desc()
        ).offset(skip).limit(limit).all()

    def get_by_action_type(self, action_type: str, skip: int = 0, limit: int = 100) -> List[ActivityLog]:
        return self.db.query(ActivityLog).filter(
            ActivityLog.action_type == action_type
        ).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()
