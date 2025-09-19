// import React, { useState } from 'react';

// interface Ticket {
//   id: string;
//   subject: string;
//   priority: 'LOW' | 'MEDIUM' | 'HIGH';
//   status: 'OPEN' | 'IN PROGRESS' | 'ESCALATED' | 'RESOLVED';
//   lastUpdated: string;
//   facility: string;
//   category: string;
//   description: string;
// }

// const TicketingSystem: React.FC = () => {
//   const [tickets, setTickets] = useState<Ticket[]>([
//     {
//       id: '#3225',
//       subject: 'Email Access Issue',
//       priority: 'LOW',
//       status: 'OPEN',
//       lastUpdated: 'Today',
//       facility: 'Office 1',
//       category: 'IT',
//       description: 'Unable to access email account'
//     },
//     {
//       id: '#3189',
//       subject: 'Projector Not Working',
//       priority: 'HIGH',
//       status: 'OPEN',
//       lastUpdated: 'Apr 23, 2024',
//       facility: 'Office 1',
//       category: 'Equipment',
//       description: 'Conference room projector not displaying'
//     },
//     {
//       id: '#3152',
//       subject: 'Software Installation Request',
//       priority: 'LOW',
//       status: 'IN PROGRESS',
//       lastUpdated: 'Apr 18, 2024',
//       facility: 'Office 1',
//       category: 'IT',
//       description: 'Need new software installed'
//     },
//     {
//       id: '#3120',
//       subject: 'Network Connectivity Problem',
//       priority: 'MEDIUM',
//       status: 'ESCALATED',
//       lastUpdated: 'Apr 10, 2024',
//       facility: 'Office 2',
//       category: 'Network',
//       description: 'Intermittent network connection issues'
//     },
//     {
//       id: '#3097',
//       subject: "Computer Won't Start",
//       priority: 'LOW',
//       status: 'RESOLVED',
//       lastUpdated: 'Apr 02, 2024',
//       facility: 'Office 1',
//       category: 'Hardware',
//       description: 'Desktop computer not powering on'
//     }
//   ]);

//   const [formData, setFormData] = useState({
//     title: '',
//     facility: 'Office 1',
//     category: '',
//     description: ''
//   });

//   const [statusFilter, setStatusFilter] = useState('Open');
//   const [priorityFilter, setPriorityFilter] = useState('');

//   // Calculate status counts
//   const statusCounts = {
//     OPEN: tickets.filter(t => t.status === 'OPEN').length,
//     'IN PROGRESS': tickets.filter(t => t.status === 'IN PROGRESS').length,
//     ESCALATED: tickets.filter(t => t.status === 'ESCALATED').length,
//     RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length
//   };

//   // Filter tickets
//   const filteredTickets = tickets.filter(ticket => {
//     if (statusFilter !== 'All' && ticket.status !== statusFilter.toUpperCase()) return false;
//     if (priorityFilter && ticket.priority !== priorityFilter) return false;
//     return true;
//   });

//   const handleInputChange = (field: string, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleCreateTicket = () => {
//     if (!formData.title.trim()) return;

//     const newTicket: Ticket = {
//       id: `#${Math.floor(Math.random() * 10000)}`,
//       subject: formData.title,
//       priority: 'MEDIUM',
//       status: 'OPEN',
//       lastUpdated: 'Today',
//       facility: formData.facility,
//       category: formData.category || 'General',
//       description: formData.description
//     };

//     setTickets(prev => [newTicket, ...prev]);
//     setFormData({ title: '', facility: 'Office 1', category: '', description: '' });
//   };

//   const getPriorityBadgeStyle = (priority: string) => {
//     switch (priority) {
//       case 'HIGH':
//         return { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' };
//       case 'MEDIUM':
//         return { backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fed7aa' };
//       case 'LOW':
//         return { backgroundColor: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe' };
//       default:
//         return { backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' };
//     }
//   };

//   return (
//     <div style={{ 
//       display: 'flex', 
//       height: '100vh', 
//       backgroundColor: '#f8fafc',
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
//     }}>
//       {/* Left Side - Create Ticket Form */}
//       <div style={{ 
//         width: '400px', 
//         backgroundColor: 'white',
//         padding: '32px',
//         borderRight: '1px solid #e5e7eb',
//         boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
//       }}>
//         <h2 style={{ 
//           fontSize: '24px', 
//           fontWeight: '600', 
//           color: '#111827',
//           marginBottom: '24px',
//           borderBottom: '2px solid #3b82f6',
//           paddingBottom: '8px'
//         }}>
//           Create New Ticket
//         </h2>

//         <div style={{ marginBottom: '20px' }}>
//           <label style={{ 
//             display: 'block', 
//             fontSize: '14px', 
//             fontWeight: '600', 
//             color: '#374151',
//             marginBottom: '6px'
//           }}>
//             Title <span style={{ color: '#ef4444' }}>*</span>
//           </label>
//           <input
//             type="text"
//             value={formData.title}
//             onChange={(e) => handleInputChange('title', e.target.value)}
//             style={{
//               width: '100%',
//               padding: '12px 16px',
//               border: `2px solid ${formData.title.trim() ? '#10b981' : '#e5e7eb'}`,
//               borderRadius: '8px',
//               fontSize: '14px',
//               outline: 'none',
//               transition: 'all 0.2s ease',
//             }}
//             onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
//             onBlur={(e) => e.target.style.borderColor = formData.title.trim() ? '#10b981' : '#e5e7eb'}
//             placeholder="Enter ticket title"
//           />
//           {!formData.title.trim() && (
//             <p style={{ 
//               fontSize: '12px', 
//               color: '#6b7280', 
//               margin: '4px 0 0 0',
//               fontStyle: 'italic'
//             }}>
//               Please enter a title for your ticket
//             </p>
//           )}
//         </div>

//         <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
//           <div style={{ flex: 1 }}>
//             <label style={{ 
//               display: 'block', 
//               fontSize: '14px', 
//               fontWeight: '600', 
//               color: '#374151',
//               marginBottom: '6px'
//             }}>
//               Facility
//             </label>
//             <select
//               value={formData.facility}
//               onChange={(e) => handleInputChange('facility', e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '12px 16px',
//                 border: '2px solid #e5e7eb',
//                 borderRadius: '8px',
//                 fontSize: '14px',
//                 backgroundColor: 'white',
//                 outline: 'none'
//               }}
//             >
//               <option value="Office 1">Office 1</option>
//               <option value="Office 2">Office 2</option>
//               <option value="Office 3">Office 3</option>
//             </select>
//           </div>

//           <div style={{ flex: 1 }}>
//             <label style={{ 
//               display: 'block', 
//               fontSize: '14px', 
//               fontWeight: '600', 
//               color: '#374151',
//               marginBottom: '6px'
//             }}>
//               Category
//             </label>
//             <input
//               type="text"
//               value={formData.category}
//               onChange={(e) => handleInputChange('category', e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '12px 16px',
//                 border: '2px solid #e5e7eb',
//                 borderRadius: '8px',
//                 fontSize: '14px',
//                 outline: 'none'
//               }}
//               placeholder="e.g., IT, Equipment"
//             />
//           </div>
//         </div>

//         <div style={{ marginBottom: '24px' }}>
//           <label style={{ 
//             display: 'block', 
//             fontSize: '14px', 
//             fontWeight: '600', 
//             color: '#374151',
//             marginBottom: '6px'
//           }}>
//             Description
//           </label>
//           <textarea
//             value={formData.description}
//             onChange={(e) => handleInputChange('description', e.target.value)}
//             rows={4}
//             style={{
//               width: '100%',
//               padding: '12px 16px',
//               border: '2px solid #e5e7eb',
//               borderRadius: '8px',
//               fontSize: '14px',
//               outline: 'none',
//               resize: 'vertical',
//               minHeight: '100px'
//             }}
//             placeholder="Describe the issue in detail..."
//           />
//         </div>

//         <div style={{ marginBottom: '24px' }}>
//           <label style={{ 
//             display: 'block', 
//             fontSize: '14px', 
//             fontWeight: '600', 
//             color: '#374151',
//             marginBottom: '8px'
//           }}>
//             Attachments
//           </label>
//           <div style={{
//             border: '2px dashed #d1d5db',
//             borderRadius: '8px',
//             padding: '20px',
//             textAlign: 'center',
//             color: '#6b7280',
//             fontSize: '14px'
//           }}>
//             Drop files here or click to upload
//           </div>
//         </div>

//         <button
//           onClick={handleCreateTicket}
//           disabled={!formData.title.trim()}
//           style={{
//             width: '100%',
//             padding: '16px',
//             backgroundColor: formData.title.trim() ? '#3b82f6' : '#9ca3af',
//             color: 'white',
//             border: 'none',
//             borderRadius: '8px',
//             fontSize: '16px',
//             fontWeight: '600',
//             cursor: formData.title.trim() ? 'pointer' : 'not-allowed',
//             transition: 'background-color 0.2s'
//           }}
//           onMouseOver={(e) => {
//             if (formData.title.trim()) e.currentTarget.style.backgroundColor = '#2563eb';
//           }}
//           onMouseOut={(e) => {
//             e.currentTarget.style.backgroundColor = formData.title.trim() ? '#3b82f6' : '#9ca3af';
//           }}
//         >
//           Create Ticket
//         </button>
//       </div>

//       {/* Right Side - Ticket Management */}
//       <div style={{ flex: 1, padding: '32px' }}>
//         {/* Status Summary */}
//         <div style={{ 
//           display: 'flex', 
//           gap: '24px', 
//           marginBottom: '32px',
//           alignItems: 'center'
//         }}>
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: '32px', fontWeight: '700', color: '#6b7280' }}>
//               📊 {statusCounts.OPEN}
//             </div>
//             <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginTop: '4px' }}>
//               OPEN
//             </div>
//           </div>
          
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
//               🔄 {statusCounts['IN PROGRESS']}
//             </div>
//             <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginTop: '4px' }}>
//               IN PROGRESS
//             </div>
//           </div>
          
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>
//               ⚠️ {statusCounts.ESCALATED}
//             </div>
//             <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginTop: '4px' }}>
//               ESCALATED
//             </div>
//           </div>
          
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>
//               ✅ {statusCounts.RESOLVED}
//             </div>
//             <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginTop: '4px' }}>
//               RESOLVED
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div style={{ 
//           backgroundColor: 'white',
//           padding: '20px',
//           borderRadius: '12px',
//           marginBottom: '24px',
//           boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
//         }}>
//           <h3 style={{ 
//             fontSize: '16px', 
//             fontWeight: '600', 
//             color: '#374151',
//             marginBottom: '16px'
//           }}>
//             Filters
//           </h3>
//           <div style={{ display: 'flex', gap: '16px' }}>
//             <div>
//               <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
//                 Status
//               </label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 style={{
//                   padding: '8px 12px',
//                   border: '1px solid #d1d5db',
//                   borderRadius: '6px',
//                   fontSize: '14px',
//                   backgroundColor: 'white'
//                 }}
//               >
//                 <option value="All">All Status</option>
//                 <option value="Open">Open</option>
//                 <option value="In Progress">In Progress</option>
//                 <option value="Escalated">Escalated</option>
//                 <option value="Resolved">Resolved</option>
//               </select>
//             </div>
            
//             <div>
//               <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
//                 Priority
//               </label>
//               <select
//                 value={priorityFilter}
//                 onChange={(e) => setPriorityFilter(e.target.value)}
//                 style={{
//                   padding: '8px 12px',
//                   border: '1px solid #d1d5db',
//                   borderRadius: '6px',
//                   fontSize: '14px',
//                   backgroundColor: 'white'
//                 }}
//               >
//                 <option value="">All Priority</option>
//                 <option value="HIGH">High</option>
//                 <option value="MEDIUM">Medium</option>
//                 <option value="LOW">Low</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Tickets Table */}
//         <div style={{
//           backgroundColor: 'white',
//           borderRadius: '12px',
//           overflow: 'hidden',
//           boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
//         }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <thead style={{ backgroundColor: '#f8fafc' }}>
//               <tr>
//                 <th style={{ 
//                   padding: '16px 20px', 
//                   textAlign: 'left', 
//                   fontSize: '12px', 
//                   fontWeight: '600',
//                   color: '#6b7280',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em'
//                 }}>
//                   TICKET
//                 </th>
//                 <th style={{ 
//                   padding: '16px 20px', 
//                   textAlign: 'left', 
//                   fontSize: '12px', 
//                   fontWeight: '600',
//                   color: '#6b7280',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em'
//                 }}>
//                   SUBJECT
//                 </th>
//                 <th style={{ 
//                   padding: '16px 20px', 
//                   textAlign: 'left', 
//                   fontSize: '12px', 
//                   fontWeight: '600',
//                   color: '#6b7280',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em'
//                 }}>
//                   PRIORITY
//                 </th>
//                 <th style={{ 
//                   padding: '16px 20px', 
//                   textAlign: 'left', 
//                   fontSize: '12px', 
//                   fontWeight: '600',
//                   color: '#6b7280',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em'
//                 }}>
//                   LAST UPDATED
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredTickets.map((ticket, index) => (
//                 <tr key={ticket.id} style={{ 
//                   borderBottom: '1px solid #f1f5f9',
//                   transition: 'background-color 0.2s'
//                 }}
//                 onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
//                 onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
//                 >
//                   <td style={{ 
//                     padding: '16px 20px', 
//                     fontSize: '14px', 
//                     fontWeight: '600',
//                     color: '#3b82f6'
//                   }}>
//                     {ticket.id}
//                   </td>
//                   <td style={{ 
//                     padding: '16px 20px', 
//                     fontSize: '14px',
//                     color: '#374151'
//                   }}>
//                     {ticket.subject}
//                   </td>
//                   <td style={{ padding: '16px 20px' }}>
//                     <span style={{
//                       padding: '4px 12px',
//                       borderRadius: '20px',
//                       fontSize: '12px',
//                       fontWeight: '600',
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.025em',
//                       ...getPriorityBadgeStyle(ticket.priority)
//                     }}>
//                       {ticket.priority}
//                     </span>
//                   </td>
//                   <td style={{ 
//                     padding: '16px 20px', 
//                     fontSize: '14px',
//                     color: '#6b7280'
//                   }}>
//                     {ticket.lastUpdated}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TicketingSystem;
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN PROGRESS' | 'ESCALATED' | 'RESOLVED';
  lastUpdated: string;
  facility: string;
  category: string;
  description: string;
}

const TicketingDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '#3225',
      subject: 'Email Access Issue',
      priority: 'LOW',
      status: 'OPEN',
      lastUpdated: 'Today',
      facility: 'Office 1',
      category: 'IT',
      description: 'Unable to access email account'
    },
    {
      id: '#3189',
      subject: 'Projector Not Working',
      priority: 'HIGH',
      status: 'OPEN',
      lastUpdated: 'Apr 23, 2024',
      facility: 'Office 1',
      category: 'Equipment',
      description: 'Conference room projector not displaying'
    },
    {
      id: '#3152',
      subject: 'Software Installation Request',
      priority: 'LOW',
      status: 'IN PROGRESS',
      lastUpdated: 'Apr 18, 2024',
      facility: 'Office 1',
      category: 'IT',
      description: 'Need new software installed'
    },
    {
      id: '#3120',
      subject: 'Network Connectivity Problem',
      priority: 'MEDIUM',
      status: 'ESCALATED',
      lastUpdated: 'Apr 10, 2024',
      facility: 'Office 2',
      category: 'Network',
      description: 'Intermittent network connection issues'
    },
    {
      id: '#3097',
      subject: "Computer Won't Start",
      priority: 'LOW',
      status: 'RESOLVED',
      lastUpdated: 'Apr 02, 2024',
      facility: 'Office 1',
      category: 'Hardware',
      description: 'Desktop computer not powering on'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    facility: 'Office 1',
    category: '',
    description: ''
  });

  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Calculate status counts
  const statusCounts = {
    OPEN: tickets.filter(t => t.status === 'OPEN').length,
    'IN PROGRESS': tickets.filter(t => t.status === 'IN PROGRESS').length,
    ESCALATED: tickets.filter(t => t.status === 'ESCALATED').length,
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'All' && ticket.status !== statusFilter.toUpperCase()) return false;
    if (priorityFilter && ticket.priority !== priorityFilter) return false;
    return true;
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTicket = () => {
    if (!formData.title.trim()) return;

    const newTicket: Ticket = {
      id: `#${Math.floor(Math.random() * 10000)}`,
      subject: formData.title,
      priority: 'MEDIUM',
      status: 'OPEN',
      lastUpdated: 'Today',
      facility: formData.facility,
      category: formData.category || 'General',
      description: formData.description
    };

    setTickets(prev => [newTicket, ...prev]);
    setFormData({ title: '', facility: 'Office 1', category: '', description: '' });
    setShowModal(false);
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' };
      case 'MEDIUM':
        return { backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fed7aa' };
      case 'LOW':
        return { backgroundColor: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' };
    }
  };

  const statusBoxes = [
    { 
      title: 'OPEN', 
      count: statusCounts.OPEN, 
      color: '#3b82f6', 
      bgColor: '#eff6ff', 
      icon: '📋'
    },
    { 
      title: 'IN PROGRESS', 
      count: statusCounts['IN PROGRESS'], 
      color: '#f59e0b', 
      bgColor: '#fffbeb', 
      icon: '🔄'
    },
    { 
      title: 'ESCALATED', 
      count: statusCounts.ESCALATED, 
      color: '#ef4444', 
      bgColor: '#fef2f2', 
      icon: '⚠️'
    },
    { 
      title: 'RESOLVED', 
      count: statusCounts.RESOLVED, 
      color: '#10b981', 
      bgColor: '#f0fdf4', 
      icon: '✅'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#111827',
            margin: 0
          }}>
            Support Tickets
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            margin: '4px 0 0 0'
          }}>
            Manage and track support requests
          </p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
          }}
        >
          <Plus size={20} />
          Create Ticket
        </button>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px' }}>
        {/* Status Boxes */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {statusBoxes.map((box) => (
            <div key={box.title} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: `2px solid ${box.color}15`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
            >
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
                justifyContent: 'center'
              }}>
                <div style={{ 
                  fontSize: '48px',
                  fontWeight: '800',
                  color: box.color
                }}>
                  {box.count}
                </div>
                <div style={{ fontSize: '24px' }}>
                  {box.icon}
                </div>
              </div>
              <div style={{ 
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {box.title}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #f3f4f6'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Filters
          </h3>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div>
              <label style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                marginBottom: '8px', 
                display: 'block',
                fontWeight: '500'
              }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '10px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            
            <div>
              <label style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                marginBottom: '8px', 
                display: 'block',
                fontWeight: '500'
              }}>
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{
                  padding: '10px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">All Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Showing {filteredTickets.length} of {tickets.length} tickets
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #f3f4f6'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th style={{ 
                  padding: '20px 24px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Ticket ID
                </th>
                <th style={{ 
                  padding: '20px 24px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Subject
                </th>
                <th style={{ 
                  padding: '20px 24px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Priority
                </th>
                <th style={{ 
                  padding: '20px 24px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: '20px 24px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} style={{ 
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <td style={{ 
                    padding: '20px 24px', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#3b82f6'
                  }}>
                    {ticket.id}
                  </td>
                  <td style={{ 
                    padding: '20px 24px', 
                    fontSize: '16px',
                    color: '#111827',
                    fontWeight: '500'
                  }}>
                    {ticket.subject}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                      ...getPriorityBadgeStyle(ticket.priority)
                    }}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ 
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {ticket.status}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '20px 24px', 
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {ticket.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#111827',
                margin: 0
              }}>
                Create New Ticket
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  color: '#6b7280',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '6px'
              }}>
                Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="Enter ticket title"
              />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Facility
                </label>
                <select
                  value={formData.facility}
                  onChange={(e) => handleInputChange('facility', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none'
                  }}
                >
                  <option value="Office 1">Office 1</option>
                  <option value="Office 2">Office 2</option>
                  <option value="Office 3">Office 3</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="e.g., IT, Equipment"
                />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '6px'
              }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '100px'
                }}
                placeholder="Describe the issue in detail..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={!formData.title.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: formData.title.trim() ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: formData.title.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (formData.title.trim()) e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = formData.title.trim() ? '#3b82f6' : '#9ca3af';
                }}
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketingDashboard;