import React, { useState } from 'react';
import { searchAPI, documentsAPI } from '../services/api';
import type { SearchResult, Document } from '../types';
import Navbar from '../components/Navbar';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const data = await searchAPI.search(query);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (documentId: number) => {
    setLoadingDoc(true);
    try {
      const doc = await documentsAPI.getDocument(documentId);
      setViewingDoc(doc);
    } catch (error) {
      console.error('Failed to load document:', error);
      alert('Failed to load document');
    } finally {
      setLoadingDoc(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>AI-Powered Document Search</h1>
        <p style={styles.subtitle}>
          Use semantic search to find relevant documents using natural language
        </p>

        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for documents..."
            style={styles.searchInput}
            autoFocus
          />
          <button type="submit" style={styles.searchButton} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {loading && <div style={styles.loading}>Searching with AI...</div>}

        {searched && !loading && (
          <div style={styles.resultsSection}>
            <h2 style={styles.resultsTitle}>
              {results.length} Result{results.length !== 1 ? 's' : ''} Found
            </h2>
            {results.length === 0 ? (
              <div style={styles.noResults}>
                No documents found matching your query. Try different keywords.
              </div>
            ) : (
              <div style={styles.resultsList}>
                {results.map((result, index) => (
                  <div key={index} style={styles.resultCard}>
                    <div style={styles.resultHeader}>
                      <h3 style={styles.resultTitle}>{result.title}</h3>
                      <span style={styles.similarity}>
                        {(result.similarity_score * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <p style={styles.resultSnippet}>{result.content_snippet}...</p>
                    <div style={styles.resultFooter}>
                      <div style={styles.resultMeta}>
                        <span>File: {result.filename}</span>
                        <span>Document ID: {result.document_id}</span>
                      </div>
                      <button
                        onClick={() => handleViewDocument(result.document_id)}
                        style={styles.viewBtn}
                        disabled={loadingDoc}
                      >
                        {loadingDoc ? 'Loading...' : 'View Full Document'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Document Viewer Modal */}
        {viewingDoc && (
          <div style={styles.modal} onClick={() => setViewingDoc(null)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2>{viewingDoc.title}</h2>
                <button onClick={() => setViewingDoc(null)} style={styles.closeBtn}>
                  ✕
                </button>
              </div>
              <div style={styles.modalBody}>
                <pre style={styles.documentContent}>{viewingDoc.content || 'No content available'}</pre>
              </div>
              <div style={styles.modalFooter}>
                <span>Filename: {viewingDoc.filename}</span>
                <span>Uploaded: {new Date(viewingDoc.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {!searched && (
          <div style={styles.info}>
            <h3 style={styles.infoTitle}>How it works</h3>
            <ul style={styles.infoList}>
              <li>Enter your question or keywords in natural language</li>
              <li>Our AI converts your query into semantic embeddings</li>
              <li>FAISS vector search finds the most relevant documents</li>
              <li>Results are ranked by similarity score</li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  subtitle: {
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  searchInput: {
    flex: 1,
    padding: '1rem',
    fontSize: '1rem',
    border: '2px solid #3498db',
    borderRadius: '8px',
  },
  searchButton: {
    padding: '1rem 2rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.1rem',
    color: '#7f8c8d',
  },
  resultsSection: {
    marginTop: '2rem',
  },
  resultsTitle: {
    color: '#2c3e50',
    marginBottom: '1rem',
  },
  noResults: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#fff3cd',
    borderRadius: '8px',
    color: '#856404',
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  resultCard: {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  resultTitle: {
    color: '#2c3e50',
    margin: 0,
  },
  similarity: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#27ae60',
    color: 'white',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  resultSnippet: {
    color: '#7f8c8d',
    lineHeight: '1.6',
    marginBottom: '0.75rem',
  },
  resultFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.85rem',
    color: '#95a5a6',
  },
  viewBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #ddd',
  },
  modalBody: {
    padding: '1.5rem',
    overflow: 'auto',
    flex: 1,
  },
  documentContent: {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: '#2c3e50',
  },
  modalFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#7f8c8d',
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#7f8c8d',
    padding: '0',
    width: '2rem',
    height: '2rem',
  },
  info: {
    marginTop: '3rem',
    padding: '2rem',
    backgroundColor: '#ecf0f1',
    borderRadius: '8px',
  },
  infoTitle: {
    color: '#2c3e50',
    marginBottom: '1rem',
  },
  infoList: {
    color: '#7f8c8d',
    lineHeight: '2',
  },
};

export default Search;
