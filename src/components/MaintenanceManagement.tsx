// MaintenanceManagement.tsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { MaintenanceApi, VendorApi, type Maintenance, type Vendor } from '../api/VendorManagement';
import { CheckCircle, Edit, Trash2, AlertCircle } from 'lucide-react';
import styles from './MaintenanceManagement.module.css';

export const MaintenanceManagement: React.FC<{ assetId?: string }> = ({ assetId }) => {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'OVERDUE' | 'UPCOMING'>('ALL');

  const [formData, setFormData] = useState<Partial<Maintenance>>({
    assetId: assetId || '',
    vendorId: '',
    maintenanceType: 'PREVENTIVE',
    priority: 'MEDIUM',
    scheduledDate: '',
    description: '',
    technicianName: '',
  });

  useEffect(() => {
    loadData();
  }, [filter, assetId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vendorData, maintenanceData] = await Promise.all([
        VendorApi.getAll(),
        filter === 'OVERDUE'
          ? MaintenanceApi.getOverdue()
          : filter === 'UPCOMING'
          ? MaintenanceApi.getUpcoming(30)
          : assetId
          ? MaintenanceApi.getByAsset(assetId)
          : MaintenanceApi.getAll(),
      ]);
      setVendors(vendorData);
      setMaintenance(maintenanceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingMaintenance) {
        await MaintenanceApi.update(editingMaintenance.maintenanceId, formData);
      } else {
        await MaintenanceApi.create(formData);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    const workPerformed = prompt('Enter work performed:');
    const costStr = prompt('Enter total cost:');
    
    if (workPerformed && costStr) {
      const cost = parseFloat(costStr);
      try {
        await MaintenanceApi.complete(id, workPerformed, cost);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete');
      }
    }
  };

  const handleEdit = (m: Maintenance) => {
    setEditingMaintenance(m);
    setFormData(m);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this maintenance record?')) return;
    try {
      await MaintenanceApi.delete(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMaintenance(null);
    setFormData({
      assetId: assetId || '',
      vendorId: '',
      maintenanceType: 'PREVENTIVE',
      priority: 'MEDIUM',
      scheduledDate: '',
      description: '',
      technicianName: '',
    });
  };

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'COMPLETED': styles.statusCompleted,
      'IN_PROGRESS': styles.statusInProgress,
      'OVERDUE': styles.statusOverdue,
      'CANCELLED': styles.statusCancelled,
      'SCHEDULED': styles.statusScheduled,
      'ON_HOLD': styles.statusOnHold,
    };
    return classNames(styles.statusBadge, statusMap[status] || styles.statusScheduled);
  };

  const getPriorityClass = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'CRITICAL': styles.priorityCritical,
      'HIGH': styles.priorityHigh,
      'MEDIUM': styles.priorityMedium,
      'LOW': styles.priorityLow,
    };
    return classNames(styles.priorityBadge, priorityMap[priority] || styles.priorityMedium);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Maintenance Management</h1>
            <p className={styles.subtitle}>Schedule and track asset maintenance</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={styles.primaryButton}
          >
            + Schedule Maintenance
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

      {/* Main Card */}
      <div className={styles.card}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {(['ALL', 'OVERDUE', 'UPCOMING'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={classNames(styles.tab, { [styles.tabActive]: filter === tab })}
            >
              {tab === 'ALL' ? 'All Maintenance' : tab === 'OVERDUE' ? 'Overdue' : 'Upcoming'}
              {tab === 'OVERDUE' && (
                <span className={styles.tabBadge}>
                  {maintenance.filter(m => m.status === 'OVERDUE').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Form Section */}
        {showForm && (
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>
              {editingMaintenance ? 'Edit Maintenance' : 'Schedule Maintenance'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                {!assetId && (
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Asset ID *</label>
                    <input
                      type="text"
                      required
                      value={formData.assetId}
                      onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                )}

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Vendor</label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    className={styles.formSelect}
                  >
                    <option value="">Select Vendor (Optional)</option>
                    {vendors.map((v) => (
                      <option key={v.vendorId} value={v.vendorId}>
                        {v.vendorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Maintenance Type *</label>
                  <select
                    required
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value as any })}
                    className={styles.formSelect}
                  >
                    <option value="PREVENTIVE">Preventive</option>
                    <option value="CORRECTIVE">Corrective</option>
                    <option value="PREDICTIVE">Predictive</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Priority *</label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className={styles.formSelect}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Scheduled Date</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Technician Name</label>
                  <input
                    type="text"
                    value={formData.technicianName}
                    onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={resetForm} className={styles.button}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.primaryButton}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Asset / Vendor</th>
                <th className={styles.th}>Type & Priority</th>
                <th className={styles.th}>Scheduled</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Cost</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className={styles.loadingRow}>
                    <span className={styles.loadingText}>Loading...</span>
                  </td>
                </tr>
              )}
              
              {!loading && maintenance.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    No maintenance records found
                  </td>
                </tr>
              )}
              
              {maintenance.map((m) => (
                <tr key={m.maintenanceId} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.cellInfo}>
                      <div className={styles.cellHeader}>Asset: {m.assetId}</div>
                      {m.vendorId && (
                        <div className={styles.cellSubtext}>
                          Vendor: {vendors.find(v => v.vendorId === m.vendorId)?.vendorName || m.vendorId}
                        </div>
                      )}
                      {m.technicianName && (
                        <div className={styles.cellSubtext}>Tech: {m.technicianName}</div>
                      )}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.cellInfo}>
                      <div className={styles.cellHeader}>{m.maintenanceType}</div>
                      <span className={getPriorityClass(m.priority)}>
                        {m.priority}
                      </span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    {m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : 'N/A'}
                    {m.completedDate && (
                      <div className={styles.cellSubtext}>
                        Completed: {new Date(m.completedDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className={styles.td}>
                    <span className={getStatusClass(m.status)}>
                      {m.status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {m.cost ? `$${m.cost.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionButtons}>
                      {m.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleComplete(m.maintenanceId)}
                          className={classNames(styles.actionButton, styles.completeButton)}
                          title="Complete"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(m)}
                        className={styles.actionButton}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.maintenanceId)}
                        className={classNames(styles.actionButton, styles.deleteButton)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total</div>
          <div className={classNames(styles.summaryValue, styles.summaryValueTotal)}>
            {maintenance.length}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Scheduled</div>
          <div className={classNames(styles.summaryValue, styles.summaryValueScheduled)}>
            {maintenance.filter(m => m.status === 'SCHEDULED').length}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>In Progress</div>
          <div className={classNames(styles.summaryValue, styles.summaryValueInProgress)}>
            {maintenance.filter(m => m.status === 'IN_PROGRESS').length}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Completed</div>
          <div className={classNames(styles.summaryValue, styles.summaryValueCompleted)}>
            {maintenance.filter(m => m.status === 'COMPLETED').length}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Overdue</div>
          <div className={classNames(styles.summaryValue, styles.summaryValueOverdue)}>
            {maintenance.filter(m => m.status === 'OVERDUE').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceManagement;