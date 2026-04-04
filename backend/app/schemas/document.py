from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentBase(BaseModel):
    title: str


class DocumentCreate(DocumentBase):
    pass


class Document(DocumentBase):
    id: int
    filename: str
    file_path: Optional[str] = None
    file_type: str
    file_size: Optional[int] = None
    content: Optional[str] = None
    uploaded_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResult(BaseModel):
    document_id: int
    title: str
    content_snippet: str
    similarity_score: float
    filename: str
