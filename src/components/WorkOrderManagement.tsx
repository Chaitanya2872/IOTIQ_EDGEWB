// WorkOrderManagement.tsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { WorkOrderApi, type WorkOrder } from '../api/VendorManagement';
import { Edit, AlertCircle } from 'lucide-react';
import styles from './WorkOrderManagement.module.css';

export const WorkOrderManagement: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [filter, setFilter] = useState<'ACTIVE' | 'OVERDUE' | 'ALL'>('ACTIVE');

  const [formData, setFormData] = useState<Partial<WorkOrder>>({
    assetId: '',
    title: '',
    workType: 'REPAIR',
    priority: 'MEDIUM',
    description: '',
    dueDate: '',
    estimatedHours: 0,
    estimatedCost: 0,
  });

  useEffect(() => {
    loadWorkOrders();
  }, [filter]);

  const loadWorkOrders = async () => {
    setLoading(true);
    try {
      const data = filter === 'ACTIVE'
        ? await WorkOrderApi.getActive()
        : filter === 'OVERDUE'
        ? await WorkOrderApi.getOverdue()
        : await WorkOrderApi.getAll();
      setWorkOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingWorkOrder) {
        await WorkOrderApi.update(editingWorkOrder.workOrderId, formData);
      } else {
        await WorkOrderApi.create(formData);
      }
      resetForm();
      await loadWorkOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await WorkOrderApi.updateStatus(id, status);
      await loadWorkOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    }
  };

  const handleEdit = (wo: WorkOrder) => {
    setEditingWorkOrder(wo);
    setFormData(wo);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingWorkOrder(null);
    setFormData({
      assetId: '',
      title: '',
      workType: 'REPAIR',
      priority: 'MEDIUM',
      description: '',
      dueDate: '',
      estimatedHours: 0,
      estimatedCost: 0,
    });
  };

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'COMPLETED': styles.statusCompleted,
      'IN_PROGRESS': styles.statusInProgress,
      'ASSIGNED': styles.statusAssigned,
      'ON_HOLD': styles.statusOnHold,
      'CANCELLED': styles.statusCancelled,
      'OPEN': styles.statusOpen,
      'CLOSED': styles.statusClosed,
    };
    return classNames(styles.statusSelect, statusMap[status] || styles.statusOpen);
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
            <h1 className={styles.title}>Work Order Management</h1>
            <p className={styles.subtitle}>Create and track work orders</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={styles.primaryButton}
          >
            + Create Work Order
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
          {(['ACTIVE', 'OVERDUE', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={classNames(styles.tab, { [styles.tabActive]: filter === tab })}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form Section */}
        {showForm && (
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>
              {editingWorkOrder ? 'Edit Work Order' : 'Create Work Order'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
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

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Work Type *</label>
                  <select
                    required
                    value={formData.workType}
                    onChange={(e) => setFormData({ ...formData, workType: e.target.value as any })}
                    className={styles.formSelect}
                  >
                    <option value="REPAIR">Repair</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INSTALLATION">Installation</option>
                    <option value="INSPECTION">Inspection</option>
                    <option value="UPGRADE">Upgrade</option>
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
                  <label className={styles.formLabel}>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Estimated Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formFieldFull}>
                  <label className={styles.formLabel}>Estimated Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) })}
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
                  {loading ? 'Saving...' : 'Create Work Order'}
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
                <th className={styles.th}>Work Order</th>
                <th className={styles.th}>Asset</th>
                <th className={styles.th}>Type & Priority</th>
                <th className={styles.th}>Due Date</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Cost</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className={styles.loadingRow}>
                    <span className={styles.loadingText}>Loading...</span>
                  </td>
                </tr>
              )}
              
              {!loading && workOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No work orders found
                  </td>
                </tr>
              )}
              
              {workOrders.map((wo) => (
                <tr key={wo.workOrderId} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.cellInfo}>
                      <div className={styles.cellHeader}>{wo.title}</div>
                      <div className={styles.cellSubtext}>{wo.workOrderNumber}</div>
                    </div>
                  </td>
                  <td className={styles.td}>{wo.assetId}</td>
                  <td className={styles.td}>
                    <div className={styles.cellInfo}>
                      <div className={styles.cellHeader}>{wo.workType}</div>
                      <span className={getPriorityClass(wo.priority)}>
                        {wo.priority}
                      </span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className={styles.td}>
                    <select
                      value={wo.status}
                      onChange={(e) => handleStatusChange(wo.workOrderId, e.target.value)}
                      className={getStatusClass(wo.status)}
                    >
                      <option value="OPEN">Open</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.costInfo}>
                      {wo.estimatedCost && (
                        <div className={styles.costEstimate}>Est: ${wo.estimatedCost.toFixed(2)}</div>
                      )}
                      {wo.actualCost && (
                        <div className={styles.costActual}>Act: ${wo.actualCost.toFixed(2)}</div>
                      )}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(wo)}
                        className={styles.actionButton}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderManagement;