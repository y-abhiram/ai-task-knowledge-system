from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from app.models.search_query import SearchQuery


class SearchQueryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, query_data: dict) -> SearchQuery:
        search_query = SearchQuery(**query_data)
        self.db.add(search_query)
        self.db.commit()
        self.db.refresh(search_query)
        return search_query

    def get_top_queries(self, limit: int = 10) -> List[Dict]:
        results = self.db.query(
            SearchQuery.query_text,
            func.count(SearchQuery.id).label('count')
        ).group_by(SearchQuery.query_text).order_by(
            func.count(SearchQuery.id).desc()
        ).limit(limit).all()

        return [{'query': r.query_text, 'count': r.count} for r in results]

    def count_all(self) -> int:
        return self.db.query(SearchQuery).count()
