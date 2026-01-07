// DocumentManagement.tsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { DocumentApi, type AssetDocument } from '../api/VendorManagement';
import { Search, Upload, Download, Trash2, File, FileText, X } from 'lucide-react';
import styles from './DocumentManagement.module.css';

export const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploadData, setUploadData] = useState({
    assetId: '',
    vendorId: '',
    documentName: '',
    category: 'OTHER',
    description: '',
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await DocumentApi.getAll();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    try {
      await DocumentApi.upload(selectedFile, {
        ...uploadData,
        category: uploadData.category as "OTHER" | "WARRANTY" | "MANUAL" | "INVOICE" | "MAINTENANCE_REPORT" | "COMPLIANCE"
      });
      setShowUploadForm(false);
      setSelectedFile(null);
      setUploadData({
        assetId: '',
        vendorId: '',
        documentName: '',
        category: 'OTHER',
        description: '',
      });
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: AssetDocument) => {
    try {
      const blob = await DocumentApi.download(doc.documentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.documentName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await DocumentApi.delete(id);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading && documents.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <span className={styles.loadingText}>Loading documents...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Document Management</h1>
            <p className={styles.subtitle}>Upload and manage asset documents</p>
          </div>
          <button
            onClick={() => setShowUploadForm(true)}
            className={styles.primaryButton}
          >
            <Upload size={16} />
            Upload Document
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={styles.errorAlert}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={() => setError(null)} className={styles.dismissButton}>
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className={styles.uploadForm}>
          <h2 className={styles.uploadTitle}>Upload Document</h2>

          <div
            className={styles.uploadArea}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <Upload size={32} className={styles.uploadIcon} />
            <p className={styles.uploadText}>
              {selectedFile ? selectedFile.name : 'Click to select a file'}
            </p>
            <p className={styles.uploadSubtext}>PDF or DOCX files only (max 10MB)</p>
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
          </div>

          {selectedFile && (
            <div className={styles.selectedFile}>
              <FileText size={20} className={styles.fileIcon} />
              <div className={styles.fileInfo}>
                <div className={styles.fileName}>{selectedFile.name}</div>
                <div className={styles.fileSize}>{formatFileSize(selectedFile.size)}</div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className={styles.removeFileButton}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Asset ID *</label>
                <input
                  type="text"
                  required
                  value={uploadData.assetId}
                  onChange={(e) => setUploadData({ ...uploadData, assetId: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Vendor ID</label>
                <input
                  type="text"
                  value={uploadData.vendorId}
                  onChange={(e) => setUploadData({ ...uploadData, vendorId: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Document Name *</label>
                <input
                  type="text"
                  required
                  value={uploadData.documentName}
                  onChange={(e) => setUploadData({ ...uploadData, documentName: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Category *</label>
                <select
                  required
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value as any })}
                  className={styles.formSelect}
                >
                  <option value="WARRANTY">Warranty</option>
                  <option value="MANUAL">Manual</option>
                  <option value="INVOICE">Invoice</option>
                  <option value="MAINTENANCE_REPORT">Maintenance Report</option>
                  <option value="COMPLIANCE">Compliance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                }}
                className={styles.button}
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className={styles.primaryButton}>
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Card */}
      <div className={styles.card}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.select}
            >
              <option value="all">All Categories</option>
              <option value="WARRANTY">Warranty</option>
              <option value="MANUAL">Manual</option>
              <option value="INVOICE">Invoice</option>
              <option value="MAINTENANCE_REPORT">Maintenance Report</option>
              <option value="COMPLIANCE">Compliance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Document Grid */}
        <div className={styles.documentGrid}>
          {filteredDocuments.length === 0 ? (
            <div className={styles.emptyState}>
              <File size={48} className={styles.emptyStateIcon} />
              <div className={styles.emptyStateTitle}>No documents found</div>
              <div className={styles.emptyStateText}>Upload documents to get started</div>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.documentId} className={styles.documentCard}>
                <div className={styles.documentHeader}>
                  <div className={styles.documentIconWrapper}>
                    <FileText size={24} className={styles.documentIcon} />
                  </div>
                  <div className={styles.documentInfo}>
                    <div className={styles.documentName}>{doc.documentName}</div>
                    <div className={styles.documentMeta}>
                      {formatFileSize(doc.fileSize)} • {doc.documentType}
                    </div>
                  </div>
                </div>

                <div className={styles.documentCategory}>{doc.category}</div>

                {doc.description && (
                  <div className={styles.documentMeta}>{doc.description}</div>
                )}

                <div className={styles.documentActions}>
                  <button
                    onClick={() => handleDownload(doc)}
                    className={styles.documentButton}
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc.documentId)}
                    className={classNames(styles.documentButton, styles.deleteDocButton)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;