from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.document import Document


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, doc_id: int) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == doc_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Document]:
        return self.db.query(Document).offset(skip).limit(limit).all()

    def create(self, doc_data: dict) -> Document:
        document = Document(**doc_data)
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def update(self, document: Document, update_data: dict) -> Document:
        for key, value in update_data.items():
            if value is not None:
                setattr(document, key, value)
        self.db.commit()
        self.db.refresh(document)
        return document

    def delete(self, document: Document):
        self.db.delete(document)
        self.db.commit()

    def count_all(self) -> int:
        return self.db.query(Document).count()
