
// import React from "react";
// import { Layout, Card as AntCard, Row, Col, Typography } from "antd";
// import { Bar, Line, Doughnut } from "react-chartjs-2";
// import WorldMapComponent from "./WorldMapComponent";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
//   ArcElement,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
//   ArcElement
// );

// const { Content } = Layout;
// const { Text } = Typography;

// const Dashboard: React.FC = () => {
//   const lineData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [
//       {
//         label: "Predictive Maintenance",
//         data: [120, 200, 150, 80, 70, 110],
//         borderColor: "#ef4444",
//         backgroundColor: "rgba(239, 68, 68, 0.2)",
//         fill: true,
//         tension: 0.4,
//       },
//     ],
//   };

//   const occupancyData = {
//     labels: ["Occupied", "Vacant"],
//     datasets: [
//       {
//         data: [57, 43],
//         backgroundColor: ["#3b82f6", "#1f2937"],
//         borderColor: "#111827",
//       },
//     ],
//   };

//   const occupancyValue = occupancyData.datasets[0]?.data[0] ?? 0;

//   const barData = {
//     labels: ["HVAC", "Elevator", "Water Leak", "Lighting", "Fault Detection"],
//     datasets: [
//       {
//         label: "Anomalies",
//         data: [0, 5, 6, 8, 3],
//         backgroundColor: "#3b82f6",
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: { legend: { display: false } },
//     scales: {
//       x: { ticks: { color: "#9ca3af" } },
//       y: { ticks: { color: "#9ca3af" } },
//     },
//   };

//   return (
//     <Layout style={{ minHeight: "100vh", background: "#0d1117", minWidth: "1230px" }}>
//       <div style={{ padding: "16px 24px", fontSize: "24px", fontWeight: "bold", backgroundColor: "#001529", color: "#fff" }}>
//         Smart Facility Dashboard
//       </div>

//       <Content style={{ padding: "0" }}>
//         <div style={{ maxWidth: "100%", padding: "16px 24px", margin: "0 auto" }}>
//           {/* Top Info Cards */}
//           <Row gutter={12}>
//             <Col xs={24} sm={12} md={6}><InfoCard title="Occupancy Forecasting" value="84%" /></Col>
//             <Col xs={24} sm={12} md={6}><InfoCard title="Assets Under Monitoring" value="1,250" /></Col>
//             <Col xs={24} sm={12} md={6}><InfoCard title="Active Alerts" value="⚠️ 14" /></Col>
//             <Col xs={24} sm={12} md={6}><InfoCard title="Energy Usage" value="⚡ 126 kWh" /></Col>
//           </Row>

//           {/* Sensor Data + Predictive Maintenance + Smart Energy + Fault Detection */}
//           <Row gutter={12} style={{ marginTop: 12 }}>
//             {/* Left Large Card */}
//             <Col xs={24} md={10}>
//               <AntCard title={<span style={{ fontWeight: "bold", color: "#fff" }}>Global Network Monitor</span>} bordered={false} style={mapCardStyle}>
//                 <p style={{ color: "#fff" }}>Temperature: 72°F</p>
//                 <p style={{ color: "#fff" }}>Humidity: 45%</p>
//                 <p style={{ color: "#fff" }}>Occupancy: 57%</p>
//                 <div style={{ height: "260px", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
//                   <WorldMapComponent
//                     style={{
//                       width: "100%",
//                       height: "100%",
//                       borderRadius: "8px"
//                     }}
//                   />
//                 </div>
//               </AntCard>
//             </Col>

//             {/* Right Side Column with 3 stacked */}
//             <Col xs={24} md={14}>
//               <Row gutter={[12, 12]}>
//                 <Col xs={24} lg={12}>
//                   <AntCard title={<span style={{ fontWeight: "bold", color: "#fff" }}>Predictive Maintenance</span>} bordered={false} style={cardStyle}>
//                     <Line data={lineData} options={chartOptions} />
//                   </AntCard>
//                 </Col>
//                 <Col xs={24} lg={12}>
//                   <AntCard bordered={false} style={cardStyle}>
//                     <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Smart Energy Optimization</Text>
//                     <div style={{ marginTop: 16, textAlign: "center" }}>
//                       <svg width="100%" height="100" viewBox="0 0 200 100">
//                         <defs>
//                           <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                             <stop offset="0%" stopColor="#00BFFF" />
//                             <stop offset="50%" stopColor="#1DE9B6" />
//                             <stop offset="100%" stopColor="#333" />
//                           </linearGradient>
//                         </defs>
//                         <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGradient)" strokeWidth="14" />
//                         <line x1="100" y1="100" x2="135" y2="60" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
//                         <circle cx="100" cy="100" r="6" fill="#fff" />
//                       </svg>
//                       <div style={{ display: "flex", justifyContent: "space-between", color: "#ccc", marginTop: 4 }}>
//                         <Text>Low</Text>
//                         <Text>Efficient</Text>
//                         <Text>High</Text>
//                       </div>
//                     </div>
//                   </AntCard>
//                 </Col>
//                 <Col xs={24}>
//                   <AntCard bordered={false} style={cardStyle}>
//                     <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Fault Detection</Text>
//                     <ul style={{ marginTop: 16, paddingLeft: 20, color: "#fff", lineHeight: 2 }}>
//                       <li><span style={{ color: "#FF6B6B" }}>■</span> HVAC</li>
//                       <li><span style={{ color: "#FF9F1C" }}>■</span> Elevators</li>
//                       <li><span style={{ color: "#4ECDC4" }}>■</span> Water Leakage</li>
//                       <li><span style={{ color: "#FFE66D" }}>■</span> Lighting</li>
//                     </ul>
//                   </AntCard>
//                 </Col>
//               </Row>
//             </Col>
//           </Row>

//           {/* Bottom Cards */}
//           <Row gutter={12} style={{ marginTop: 12 }}>
//             <Col xs={24} md={6}>
//               <AntCard bordered={false} style={cardStyle}>
//                 <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Space Utilization</Text>
//                 <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   <div>
//                     <Text style={{ color: "#9ca3af", fontSize: 14 }}>Temperature</Text>
//                     <div style={{ fontSize: 24, color: "#fff", fontWeight: "bold" }}>76%</div>
//                   </div>
//                   <div style={{ width: 80, height: 50 }}>
//                     <Bar
//                       data={{
//                         labels: ["A", "B", "C"],
//                         datasets: [{ data: [30, 50, 76], backgroundColor: "#3b82f6", barThickness: 8 }],
//                       }}
//                       options={{
//                         responsive: true,
//                         maintainAspectRatio: false,
//                         plugins: { legend: { display: false }, tooltip: { enabled: false } },
//                         scales: { x: { display: false }, y: { display: false } },
//                       }}
//                     />
//                   </div>
//                 </div>
//                 <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   <div>
//                     <Text style={{ color: "#9ca3af", fontSize: 14 }}>Occupancy</Text>
//                     <div style={{ fontSize: 24, color: "#fff", fontWeight: "bold" }}>57%</div>
//                   </div>
//                   <div style={{ width: 60 }}>
//                     <Doughnut
//                       data={{
//                         labels: ["Occupied", "Vacant"],
//                         datasets: [{ data: [57, 43], backgroundColor: ["#3b82f6", "#1f2937"], borderWidth: 0 }],
//                       }}
//                       options={{
//                         cutout: "70%",
//                         plugins: { legend: { display: false }, tooltip: { enabled: false } },
//                       }}
//                     />
//                   </div>
//                 </div>
//               </AntCard>
//             </Col>

//             <Col xs={24} md={6}>
//               <AntCard bordered={false} style={cardStyle}>
//                 <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Space Utilization</Text>
//                 <div style={{
//                   marginTop: 16, backgroundColor: "#1f2937", borderRadius: 8, padding: 16,
//                   display: "flex", alignItems: "center", justifyContent: "center", height: 150,
//                 }}>
//                   <svg width="92" height="92" viewBox="0 0 100 100" fill="none">
//                     <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
//                       fill="#10b981" stroke="#ffffff" strokeWidth="4" />
//                   </svg>
//                   <Text style={{ fontSize: 24, color: "#ffffff", fontWeight: "bold", marginLeft: 12 }}>76%</Text>
//                 </div>
//               </AntCard>
//             </Col>

//             <Col xs={24} md={6}>
//               <AntCard bordered={false} style={cardStyle}>
//                 <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Anomaly Detection</Text>
//                 <div style={{ marginTop: 16 }}>
//                   {["HVAC", "Elevator", "Water Leak", "Lighting"].map((label, i) => (
//                     <div key={i} style={{ color: "#fff", fontSize: 14, marginBottom: 8 }}>
//                       <span style={{ width: 10, height: 10, backgroundColor: "#ef4444", display: "inline-block", borderRadius: 2, marginRight: 8 }} />
//                       {label}
//                     </div>
//                   ))}
//                 </div>
//               </AntCard>
//             </Col>

//             <Col xs={24} md={6}>
//               <AntCard bordered={false} style={cardStyle}>
//                 <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Anomaly Detection</Text>
//                 <Bar
//                   data={{
//                     labels: ["0", "5", "A", "6", "8"],
//                     datasets: [{ label: "Anomaly", data: [40, 60, 90, 45, 30], backgroundColor: "#3b82f6" }],
//                   }}
//                   options={chartOptions}
//                 />
//               </AntCard>
//             </Col>
//           </Row>
//         </div>
//       </Content>
//     </Layout>
//   );
// };

// const InfoCard = ({ title, value }: { title: string; value: string }) => (
//   <AntCard bordered={false} style={cardStyle}>
//     <Text style={{ fontSize: 18, fontWeight: "bold", color: "#9ca3af" }}>{title}</Text>
//     <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff", display: "block", marginTop: 8 }}>{value}</Text>
//   </AntCard>
// );

// const cardStyle: React.CSSProperties = {
//   background: "#161b22",
//   borderRadius: 12,
//   boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
//   color: "#ffffff",
//   height: "100%",
// };

// // Map card style to complement the golden theme
// const mapCardStyle: React.CSSProperties = {
//   background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)",
//   borderRadius: 12,
//   boxShadow: "0 2px 8px rgba(212,175,55,0.2)",
//   border: "1px solid rgba(212,175,55,0.1)",
//   color: "#ffffff",
//   height: "100%",
// };

// export default Dashboard;
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Package, AlertTriangle, Zap, Building, Thermometer, Users, Bell, Settings, Search, Filter, Calendar, Plus } from 'lucide-react';

const UnifiedSmartFacilityDashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const [timeRange, setTimeRange] = useState('today');

  // Combined data from all dashboards
  const facilityMetrics = {
    occupancy: { current: 84, capacity: 400, occupied: 336, vacant: 64 },
    assets: { total: 1250, allocated: 950, maintenance: 45, unknown: 15 },
    energy: { usage: 126, target: 120, efficiency: 87, renewable: 34 },
    tickets: { open: 14, inProgress: 8, escalated: 3, resolved: 125 },
    sensors: { active: 932, inactive: 15, warning: 8 },
    temperature: 72,
    humidity: 45,
    airQuality: 'Good'
  };

  // Energy consumption over time
  const energyData = [
    { time: 'Mon', actual: 124, predicted: 120, target: 115 },
    { time: 'Tue', actual: 132, predicted: 128, target: 125 },
    { time: 'Wed', actual: 118, predicted: 122, target: 120 },
    { time: 'Thu', actual: 126, predicted: 125, target: 122 },
    { time: 'Fri', actual: 135, predicted: 130, target: 128 },
    { time: 'Sat', actual: 98, predicted: 95, target: 90 },
    { time: 'Sun', actual: 89, predicted: 88, target: 85 }
  ];

  // Space utilization data
  const spaceUtilization = [
    { area: 'Meeting Rooms', utilization: 89, capacity: 50, occupied: 45 },
    { area: 'Open Seating', utilization: 72, capacity: 200, occupied: 144 },
    { area: 'Cafeteria', utilization: 64, capacity: 100, occupied: 64 },
    { area: 'Server Room', utilization: 95, capacity: 10, occupied: 10 },
    { area: 'Break Areas', utilization: 55, capacity: 40, occupied: 22 }
  ];

  // Asset distribution
  const assetDistribution = [
    { name: 'Laptops', value: 45, color: '#3b82f6' },
    { name: 'Furniture', value: 25, color: '#10b981' },
    { name: 'Machinery', value: 18, color: '#f59e0b' },
    { name: 'IoT Sensors', value: 12, color: '#8b5cf6' }
  ];

  // Inventory trends
  const inventoryData = [
    { category: 'Office Supplies', current: 75, predicted: 68, threshold: 60 },
    { category: 'Cleaning', current: 45, predicted: 38, threshold: 40 },
    { category: 'Maintenance', current: 89, predicted: 82, threshold: 70 },
    { category: 'IT Equipment', current: 92, predicted: 88, threshold: 80 }
  ];

  // Sensor readings over time
  const sensorData = [
    { time: '09:00', temperature: 70, humidity: 48, co2: 420, light: 850 },
    { time: '12:00', temperature: 72, humidity: 45, co2: 480, light: 920 },
    { time: '15:00', temperature: 74, humidity: 43, co2: 510, light: 780 },
    { time: '18:00', temperature: 71, humidity: 46, co2: 450, light: 650 }
  ];

  // Alert data
  const alerts = [
    { id: 1, type: 'critical', message: 'HVAC System Anomaly Detected - Conference Room A', time: '2 min ago' },
    { id: 2, type: 'warning', message: 'High CO2 Levels in Open Office Area', time: '15 min ago' },
    { id: 3, type: 'info', message: 'Inventory Reorder Required - Cleaning Supplies', time: '1 hour ago' },
    { id: 4, type: 'warning', message: 'Network Connectivity Issue - Floor 4', time: '2 hours ago' }
  ];

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return '#ef4444';
    if (percentage >= 60) return '#f59e0b';
    return '#10b981';
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#0d1117', 
      minHeight: '100vh',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#161b22',
        padding: '16px 32px',
        borderBottom: '1px solid #30363d',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#ffffff',
            margin: '0 0 4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Building size={32} style={{ color: '#f59e0b' }} />
            Smart Facility Management Dashboard
          </h1>
          <p style={{ color: '#8b949e', fontSize: '14px', margin: 0 }}>
            Real-time monitoring and intelligent facility operations
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#21262d',
              border: '1px solid #30363d',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select> */}
          
          <button style={{
            padding: '8px 12px',
            backgroundColor: '#238636',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: '#161b22',
        padding: '0 32px',
        borderBottom: '1px solid #30363d'
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: Building },
            { id: 'energy', label: 'Energy', icon: Zap },
            { id: 'occupancy', label: 'Occupancy', icon: Users },
            { id: 'assets', label: 'Assets', icon: Package },
            { id: 'sensors', label: 'Sensors', icon: Thermometer }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: selectedView === tab.id ? '3px solid #f59e0b' : '3px solid transparent',
                  color: selectedView === tab.id ? '#ffffff' : '#8b949e',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Key Metrics Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Occupancy */}
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Users size={24} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#8b949e' }}>Occupancy</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#3b82f6', marginBottom: '8px' }}>
              {facilityMetrics.occupancy.current}%
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>
              {facilityMetrics.occupancy.occupied} / {facilityMetrics.occupancy.capacity} spaces occupied
            </div>
          </div>

          {/* Energy Usage */}
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Zap size={24} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#8b949e' }}>Energy Usage</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>
              {facilityMetrics.energy.usage} kWh
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>
              Target: {facilityMetrics.energy.target} kWh
            </div>
          </div>

          {/* Active Alerts */}
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#8b949e' }}>Active Alerts</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>
              {facilityMetrics.tickets.open}
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>
              {facilityMetrics.tickets.escalated} escalated, {facilityMetrics.tickets.inProgress} in progress
            </div>
          </div>

          {/* Asset Status */}
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Package size={24} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#8b949e' }}>Assets</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>
              {facilityMetrics.assets.total}
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>
              {facilityMetrics.assets.maintenance} in maintenance
            </div>
          </div>
        </div>

        {/* Main Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Energy Consumption Chart */}
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#ffffff',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              Energy Consumption Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="time" stroke="#8b949e" fontSize={12} />
                <YAxis stroke="#8b949e" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fill="url(#actualGradient)"
                  name="Actual"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="8 8"
                  name="Predicted"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Asset Distribution */}
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#ffffff',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              Asset Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={assetDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                >
                  {assetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Space Utilization and Sensor Data */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Space Utilization */}
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#ffffff',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              Space Utilization
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {spaceUtilization.map((space, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    minWidth: '100px', 
                    fontSize: '14px', 
                    color: '#8b949e' 
                  }}>
                    {space.area}
                  </div>
                  <div style={{ 
                    flex: 1, 
                    position: 'relative', 
                    height: '8px', 
                    backgroundColor: '#30363d', 
                    borderRadius: '4px' 
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${space.utilization}%`,
                      backgroundColor: getUtilizationColor(space.utilization),
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ 
                    minWidth: '60px', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#ffffff',
                    textAlign: 'right'
                  }}>
                    {space.utilization}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensor Readings */}
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#ffffff',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              Environmental Conditions
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="time" stroke="#8b949e" fontSize={12} />
                <YAxis stroke="#8b949e" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature (°F)" />
                <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2} name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts and Inventory Status */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '24px'
        }}>
          {/* Real-time Alerts */}
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#ffffff',
                margin: '0'
              }}>
                Real-time Alerts
              </h3>
              <button style={{
                padding: '6px 12px',
                backgroundColor: '#238636',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                View All
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map((alert) => (
                <div key={alert.id} style={{
                  padding: '16px',
                  backgroundColor: '#21262d',
                  borderRadius: '8px',
                  border: `1px solid ${getAlertColor(alert.type)}30`,
                  borderLeft: `4px solid ${getAlertColor(alert.type)}`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#ffffff',
                        marginBottom: '4px'
                      }}>
                        {alert.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8b949e' }}>
                        {alert.time}
                      </div>
                    </div>
                    <div style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      backgroundColor: `${getAlertColor(alert.type)}20`,
                      color: getAlertColor(alert.type)
                    }}>
                      {alert.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Status */}
          <div style={{
            backgroundColor: '#161b22',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#ffffff',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              Inventory Status
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {inventoryData.map((item, index) => (
                <div key={index} style={{
                  padding: '16px',
                  backgroundColor: '#21262d',
                  borderRadius: '8px',
                  border: '1px solid #30363d'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>
                      {item.category}
                    </span>
                    <span style={{ 
                      fontSize: '16px', 
                      fontWeight: '700',
                      color: item.current <= item.threshold ? '#ef4444' : '#10b981'
                    }}>
                      {item.current}%
                    </span>
                  </div>
                  
                  <div style={{ 
                    position: 'relative', 
                    height: '6px', 
                    backgroundColor: '#30363d', 
                    borderRadius: '3px' 
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${item.current}%`,
                      backgroundColor: item.current <= item.threshold ? '#ef4444' : '#10b981',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                    <div style={{
                      position: 'absolute',
                      left: `${item.threshold}%`,
                      top: '-2px',
                      height: '10px',
                      width: '2px',
                      backgroundColor: '#f59e0b'
                    }} />
                  </div>
                  
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#8b949e', 
                    marginTop: '4px' 
                  }}>
                    Threshold: {item.threshold}% | Predicted: {item.predicted}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSmartFacilityDashboard;