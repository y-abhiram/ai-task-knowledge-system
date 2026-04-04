from pydantic import BaseModel
from typing import List, Dict, Any


class TaskAnalytics(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    in_progress_tasks: int


class TopQuery(BaseModel):
    query: str
    count: int


class SearchAnalytics(BaseModel):
    total_searches: int
    top_queries: List[TopQuery]


class Analytics(BaseModel):
    task_analytics: TaskAnalytics
    search_analytics: SearchAnalytics
    total_documents: int
    total_users: int
