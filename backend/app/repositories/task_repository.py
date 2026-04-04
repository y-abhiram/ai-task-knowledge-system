from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.task import Task, TaskStatus


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, task_id: int) -> Optional[Task]:
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[TaskStatus] = None,
        assigned_to: Optional[int] = None
    ) -> List[Task]:
        query = self.db.query(Task)

        if status:
            query = query.filter(Task.status == status)

        if assigned_to:
            query = query.filter(Task.assigned_to == assigned_to)

        return query.offset(skip).limit(limit).all()

    def create(self, task_data: dict) -> Task:
        task = Task(**task_data)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task: Task, update_data: dict) -> Task:
        for key, value in update_data.items():
            if value is not None:
                setattr(task, key, value)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task):
        self.db.delete(task)
        self.db.commit()

    def count_by_status(self, status: TaskStatus) -> int:
        return self.db.query(Task).filter(Task.status == status).count()

    def count_all(self) -> int:
        return self.db.query(Task).count()
