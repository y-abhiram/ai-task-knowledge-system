#!/usr/bin/env python3
"""
Script to rebuild the FAISS vector store from existing documents in the database.
This will regenerate all embeddings for documents that have content.
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import all models first to ensure relationships are set up
from app.models import user, document, task, search_query, activity_log
from app.core.database import SessionLocal
from app.repositories.document_repository import DocumentRepository
from app.services.embedding_service import embedding_service


def rebuild_vector_store():
    """Rebuild the entire vector store from scratch."""
    print("Starting vector store rebuild...")

    # Clear existing index
    import faiss
    dimension = 384
    embedding_service.index = faiss.IndexFlatIP(dimension)
    embedding_service.document_map = {}

    # Get all documents from database
    db = SessionLocal()
    try:
        doc_repo = DocumentRepository(db)
        documents = doc_repo.get_all(skip=0, limit=1000)

        print(f"Found {len(documents)} documents in database")

        added_count = 0
        skipped_count = 0

        for doc in documents:
            if doc.content and len(doc.content.strip()) > 0:
                print(f"Adding document ID {doc.id}: {doc.title}")
                try:
                    embedding_service.add_document(
                        doc_id=doc.id,
                        text=doc.content,
                        metadata={
                            'title': doc.title,
                            'filename': doc.filename
                        }
                    )
                    added_count += 1
                    print(f"  ✓ Successfully added (total vectors in index: {embedding_service.index.ntotal})")
                except Exception as e:
                    print(f"  ✗ Error adding document: {e}")
                    skipped_count += 1
            else:
                print(f"Skipping document ID {doc.id}: {doc.title} (no content)")
                skipped_count += 1

        print("\n" + "="*60)
        print(f"Rebuild complete!")
        print(f"  Added: {added_count} documents")
        print(f"  Skipped: {skipped_count} documents")
        print(f"  Total vectors in FAISS index: {embedding_service.index.ntotal}")
        print(f"  Document map entries: {len(embedding_service.document_map)}")
        print("="*60)

    finally:
        db.close()


if __name__ == "__main__":
    rebuild_vector_store()
