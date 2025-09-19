// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import SidebarLayout from './pages/SidebarLayout';
// import InventoryStockUsage from './components/InventoryStockUsage';
// import InventoryAnalytics from './components/inventoryAnalytics'
// import InventoryDashboard from './components/InventoryDashboard';
// // import MaintenanceInventory from './components/MaintenanceInventory';
// import ManageCategories from './components/ManageCategories';
// import ManageItems from './components/ManageItems';
// import Dashboard from './components/Dashboard';
// import LoginPage from './components/LoginPage';
// import MealForecastDashboard from './components/MealForecastDashboard';
// import AssetDashboard from './components/AssetDashboard';
// import TicketingSystem from './components/TicketingSystem';
// import IoTSensorsDashboard from './components/IoTSensorsDashboard';
// import EnergySustainabilityDashboard from './components/EnergySustainabilityDashboard';
// import SpaceOccupancyDashboard from './components/SpaceOccupancyDashboard';
// import RegisterPage from './components/RegisterPage';
// import './App.css';

// const App: React.FC = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // Add logout handler function
//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     localStorage.removeItem('token');
//   };

//   return (
//     <Router>
//       <Routes>
//         {!isLoggedIn ? (
//           <>
//             {/* Login & Register routes */}
//             <Route path="/" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
//             <Route path="/register" element={<RegisterPage />} />

//             {/* Fallback → Login */}
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </>
//         ) : (
//           <>
//             {/* Root → Dashboard */}
//             <Route path="/" element={<Navigate to="/dashboard" replace />} />

//             {/* Sidebar Routes - Pass logout function */}
//             <Route path="/" element={<SidebarLayout onLogout={handleLogout} />}>
//               <Route path="dashboard" element={<Dashboard />} />
//               <Route path="asset-dashboard" element={<AssetDashboard />} />
//               <Route path="ticketing" element={<TicketingSystem />} />
//               <Route path="iot-sensors" element={<IoTSensorsDashboard />} />
//               <Route path="energy-sustainability" element={<EnergySustainabilityDashboard />} />
//               <Route path="space-occupancy" element={<SpaceOccupancyDashboard />} />
              
//               {/* Meal Forecast - Now separate top-level route */}
//               <Route path="meal-forecast" element={<MealForecastDashboard />} />
              
//               {/* Inventory Management routes */}
//               <Route path="inventory/categories" element={<ManageCategories />} />
//               <Route path="inventory/items" element={<ManageItems />} />
//               <Route path="inventory" element={<InventoryDashboard />} />
//               <Route path="inventory/stock-usage" element={<InventoryStockUsage />} />
//               <Route path='inventory/analytics' element={<InventoryAnalytics />} />
//               {/* <Route path="inventory/maintenance" element={<MaintenanceInventory />} /> */}
//             </Route>

//             {/* Fallback → Dashboard */}
//             <Route path="*" element={<Navigate to="/dashboard" replace />} />
//           </>
//         )}
//       </Routes>
//     </Router>
//   );
// };

// export default App;
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./pages/SidebarLayout";
import InventoryStockUsage from "./components/InventoryStockUsage";
import InventoryAnalytics from "./components/inventoryAnalytics";
import InventoryDashboard from "./components/InventoryDashboard";
// import MaintenanceInventory from "./components/MaintenanceInventory";
import ManageCategories from "./components/ManageCategories";
import ManageItems from "./components/ManageItems";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import MealForecastDashboard from "./components/MealForecastDashboard";
import AssetDashboard from "./components/AssetDashboard";
import TicketingSystem from "./components/TicketingSystem";
import IoTSensorsDashboard from "./components/IoTSensorsDashboard";
import EnergySustainabilityDashboard from "./components/EnergySustainabilityDashboard";
import SpaceOccupancyDashboard from "./components/SpaceOccupancyDashboard";
import RegisterPage from "./components/RegisterPage";
import "./App.css";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <Routes>
        {!isLoggedIn ? (
          <>
            {/* Login & Register routes */}
            <Route path="/" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Fallback → Login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* Root → Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Sidebar Routes */}
            <Route path="/" element={<SidebarLayout onLogout={handleLogout} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="asset-dashboard" element={<AssetDashboard />} />
              <Route path="ticketing" element={<TicketingSystem />} />
              <Route path="iot-sensors" element={<IoTSensorsDashboard />} />
              <Route path="energy-sustainability" element={<EnergySustainabilityDashboard />} />
              <Route path="space-occupancy" element={<SpaceOccupancyDashboard />} />

              {/* Meal Forecast */}
              <Route path="meal-forecast" element={<MealForecastDashboard />} />

              {/* Inventory Management */}
              <Route path="inventory/categories" element={<ManageCategories />} />
              <Route path="inventory/items" element={<ManageItems />} />
              <Route path="inventory" element={<InventoryDashboard />} />
              <Route path="inventory/stock-usage" element={<InventoryStockUsage />} />
              <Route path="inventory/analytics" element={<InventoryAnalytics />} />
              {/* <Route path="inventory/maintenance" element={<MaintenanceInventory />} /> */}
            </Route>

            {/* Fallback → Dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
