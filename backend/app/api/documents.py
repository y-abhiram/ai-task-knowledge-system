from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime
from app.core.database import get_db
from app.core.config import settings
from app.middleware.auth import get_current_active_user, require_admin
from app.schemas.document import Document, SearchRequest, SearchResult
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.repositories.search_query_repository import SearchQueryRepository
from app.services.embedding_service import embedding_service
from app.services.activity_log_service import ActivityLogService

router = APIRouter(prefix="/documents", tags=["Documents"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


def extract_text_from_file(file_path: str, file_type: str) -> str:
    try:
        if file_type == "text/plain" or file_path.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        elif file_path.endswith('.pdf'):
            try:
                from PyPDF2 import PdfReader
                reader = PdfReader(file_path)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
                return text
            except Exception as e:
                return f"Error extracting PDF text: {str(e)}"
        else:
            return ""
    except Exception as e:
        return f"Error reading file: {str(e)}"


@router.get("", response_model=List[Document])
async def get_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc_repo = DocumentRepository(db)
    documents = doc_repo.get_all(skip=skip, limit=limit)
    return documents


@router.get("/{doc_id}", response_model=Document)
async def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc_repo = DocumentRepository(db)
    document = doc_repo.get_by_id(doc_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return document


@router.post("", response_model=Document, status_code=status.HTTP_201_CREATED)
async def upload_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    allowed_types = ["text/plain", "application/pdf"]
    if file.content_type not in allowed_types and not file.filename.endswith(('.txt', '.pdf')):
        raise HTTPException(
            status_code=400,
            detail="Only .txt and .pdf files are allowed"
        )

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    content = extract_text_from_file(file_path, file.content_type)

    doc_repo = DocumentRepository(db)
    doc_data = {
        'title': title,
        'filename': file.filename,
        'file_path': file_path,
        'file_type': file.content_type,
        'file_size': file_size,
        'content': content,
        'uploaded_by': current_user.id
    }

    document = doc_repo.create(doc_data)

    if content and len(content.strip()) > 0:
        embedding_service.add_document(
            doc_id=document.id,
            text=content,
            metadata={
                'title': title,
                'filename': file.filename
            }
        )

    ActivityLogService.log_activity(
        db=db,
        user_id=current_user.id,
        action_type="document_upload",
        description=f"Uploaded document: {title}",
        metadata={"document_id": document.id, "filename": file.filename}
    )

    return document


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doc_repo = DocumentRepository(db)
    document = doc_repo.get_by_id(doc_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    embedding_service.remove_document(doc_id)

    doc_repo.delete(document)

    ActivityLogService.log_activity(
        db=db,
        user_id=current_user.id,
        action_type="document_delete",
        description=f"Deleted document: {document.title}",
        metadata={"document_id": doc_id}
    )

    return None
