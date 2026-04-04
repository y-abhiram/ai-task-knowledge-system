import os
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from typing import List, Tuple, Dict
from app.core.config import settings


class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.document_map = {}
        self.vector_store_path = settings.VECTOR_STORE_DIR
        os.makedirs(self.vector_store_path, exist_ok=True)
        self.index_file = os.path.join(self.vector_store_path, "faiss_index.bin")
        self.doc_map_file = os.path.join(self.vector_store_path, "doc_map.pkl")

        self._load_index()

    def _load_index(self):
        try:
            if os.path.exists(self.index_file) and os.path.exists(self.doc_map_file):
                self.index = faiss.read_index(self.index_file)
                with open(self.doc_map_file, 'rb') as f:
                    self.document_map = pickle.load(f)
            else:
                dimension = 384
                self.index = faiss.IndexFlatIP(dimension)
                self.document_map = {}
        except Exception as e:
            print(f"Error loading index: {e}")
            dimension = 384
            self.index = faiss.IndexFlatIP(dimension)
            self.document_map = {}

    def _save_index(self):
        try:
            faiss.write_index(self.index, self.index_file)
            with open(self.doc_map_file, 'wb') as f:
                pickle.dump(self.document_map, f)
        except Exception as e:
            print(f"Error saving index: {e}")

    def generate_embedding(self, text: str) -> np.ndarray:
        embedding = self.model.encode(text, convert_to_numpy=True)
        embedding = embedding / np.linalg.norm(embedding)
        return embedding

    def add_document(self, doc_id: int, text: str, metadata: Dict):
        embedding = self.generate_embedding(text)
        embedding = embedding.reshape(1, -1).astype('float32')

        self.index.add(embedding)
        index_position = self.index.ntotal - 1
        self.document_map[index_position] = {
            'doc_id': doc_id,
            'metadata': metadata
        }

        self._save_index()

    def search(self, query: str, top_k: int = 5) -> List[Tuple[int, float, Dict]]:
        if self.index.ntotal == 0:
            return []

        query_embedding = self.generate_embedding(query)
        query_embedding = query_embedding.reshape(1, -1).astype('float32')

        distances, indices = self.index.search(query_embedding, min(top_k, self.index.ntotal))

        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1 and idx in self.document_map:
                doc_info = self.document_map[idx]
                results.append((
                    doc_info['doc_id'],
                    float(distances[0][i]),
                    doc_info['metadata']
                ))

        return results

    def remove_document(self, doc_id: int):
        indices_to_remove = [
            idx for idx, info in self.document_map.items()
            if info['doc_id'] == doc_id
        ]

        for idx in indices_to_remove:
            del self.document_map[idx]

        if indices_to_remove:
            self._rebuild_index()

    def _rebuild_index(self):
        dimension = 384
        self.index = faiss.IndexFlatIP(dimension)

        sorted_items = sorted(self.document_map.items(), key=lambda x: x[0])
        new_doc_map = {}

        for new_idx, (old_idx, doc_info) in enumerate(sorted_items):
            new_doc_map[new_idx] = doc_info

        self.document_map = new_doc_map
        self._save_index()


embedding_service = EmbeddingService()
