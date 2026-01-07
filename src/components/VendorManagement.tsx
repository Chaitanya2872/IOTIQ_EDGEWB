// VendorManagement.tsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { VendorApi, type Vendor } from '../api/VendorManagement';
import { Search, Plus, Edit, Trash2, Eye, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './VendorManagement.module.css';

export const VendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await VendorApi.getAll();
      setVendors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vendor?')) return;
    try {
      await VendorApi.delete(id);
      await loadVendors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  // Filter vendors
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = 
      vendor.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendorEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      vendor.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'ACTIVE': styles.statusActive,
      'INACTIVE': styles.statusInactive,
      'SUSPENDED': styles.statusSuspended,
      'BLACKLISTED': styles.statusBlacklisted,
    };
    return classNames(styles.statusBadge, statusMap[status] || styles.statusActive);
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className={styles.ratingStars}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            fill={i < rating ? '#F59E0B' : 'none'}
            color={i < rating ? '#F59E0B' : '#CBD5E1'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <span className={styles.loadingText}>Loading vendors...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Vendor Management</h1>
            <p className={styles.subtitle}>Manage your vendor relationships</p>
          </div>
          <button className={styles.primaryButton}>
            <Plus size={16} />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className={styles.card}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.select}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Vendor Name</th>
                <th className={styles.th}>Contact</th>
                <th className={styles.th}>Specialization</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Rating</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    No vendors found
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((vendor) => (
                  <tr key={vendor.vendorId} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.cellInfo}>
                        <div className={styles.cellHeader}>{vendor.vendorName}</div>
                        <div className={styles.cellSubtext}>{vendor.vendorId}</div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.cellInfo}>
                        <div className={styles.cellHeader}>{vendor.vendorEmail}</div>
                        {vendor.vendorPhone && (
                          <div className={styles.cellSubtext}>{vendor.vendorPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className={styles.td}>{vendor.specialization || '-'}</td>
                    <td className={styles.td}>
                      <span className={getStatusClass(vendor.status)}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {renderRating(vendor.rating)}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.actionButton}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={styles.actionButton}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.vendorId)}
                          className={classNames(styles.actionButton, styles.deleteButton)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredVendors.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredVendors.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredVendors.length)} of {filteredVendors.length} vendors
            </div>
            <div className={styles.pageButtons}>
              <button
                className={styles.actionButton}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className={styles.actionButton}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorManagement;