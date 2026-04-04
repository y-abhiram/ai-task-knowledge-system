import React, { useEffect, useState } from 'react';
import { documentsAPI } from '../services/api';
import type { Document } from '../types';
import Navbar from '../components/Navbar';

const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await documentsAPI.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setMessage('');

    try {
      await documentsAPI.uploadDocument(file, title);
      setMessage('Document uploaded successfully!');
      setTitle('');
      setFile(null);
      (document.getElementById('fileInput') as HTMLInputElement).value = '';
      loadDocuments();
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentsAPI.deleteDocument(id);
      setMessage('Document deleted successfully!');
      loadDocuments();
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to delete document');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Document Management</h1>

        <div style={styles.uploadSection}>
          <h2 style={styles.sectionTitle}>Upload New Document</h2>
          <form onSubmit={handleUpload} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>File (.txt or .pdf)</label>
              <input
                id="fileInput"
                type="file"
                accept=".txt,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={styles.input}
                required
              />
            </div>
            <button type="submit" style={styles.button} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
          {message && <div style={styles.message}>{message}</div>}
        </div>

        <div style={styles.documentsSection}>
          <h2 style={styles.sectionTitle}>All Documents</h2>
          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : documents.length === 0 ? (
            <div style={styles.empty}>No documents found</div>
          ) : (
            <div style={styles.documentList}>
              {documents.map((doc) => (
                <div key={doc.id} style={styles.documentCard}>
                  <div style={styles.documentInfo}>
                    <h3 style={styles.documentTitle}>{doc.title}</h3>
                    <div style={styles.documentMeta}>
                      <span>Filename: {doc.filename}</span>
                      <span>Type: {doc.file_type}</span>
                      <span>Size: {(doc.file_size || 0 / 1024).toFixed(2)} KB</span>
                      <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={styles.actions}>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      style={styles.viewBtn}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '2rem',
  },
  uploadSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  sectionTitle: {
    color: '#2c3e50',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#2c3e50',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  message: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
  },
  documentsSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#7f8c8d',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#7f8c8d',
  },
  documentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  documentCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    color: '#2c3e50',
    marginBottom: '0.5rem',
  },
  documentMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.85rem',
    color: '#7f8c8d',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  viewBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
};

export default AdminDocuments;
