from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.middleware.auth import get_current_active_user
from app.schemas.document import SearchRequest, SearchResult
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.repositories.search_query_repository import SearchQueryRepository
from app.services.embedding_service import embedding_service
from app.services.activity_log_service import ActivityLogService

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("", response_model=List[SearchResult])
async def semantic_search(
    search_request: SearchRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not search_request.query or len(search_request.query.strip()) == 0:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    results = embedding_service.search(
        query=search_request.query,
        top_k=search_request.top_k
    )

    doc_repo = DocumentRepository(db)
    search_results = []

    for doc_id, similarity_score, metadata in results:
        document = doc_repo.get_by_id(doc_id)
        if document:
            content_snippet = document.content[:300] if document.content else ""

            search_results.append(SearchResult(
                document_id=document.id,
                title=document.title,
                content_snippet=content_snippet,
                similarity_score=similarity_score,
                filename=document.filename
            ))

    search_query_repo = SearchQueryRepository(db)
    search_query_repo.create({
        'user_id': current_user.id,
        'query_text': search_request.query,
        'results_count': len(search_results)
    })

    ActivityLogService.log_activity(
        db=db,
        user_id=current_user.id,
        action_type="search",
        description=f"Searched for: {search_request.query}",
        metadata={
            "query": search_request.query,
            "results_count": len(search_results)
        }
    )

    return search_results
