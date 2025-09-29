import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./pages/SidebarLayout";

// Import the clean auth page (choose one of the two versions)
import SimpleAuthPage from "./components/AuthPage"; // Version 1: with curved divider
// import CleanAuthPage from "./components/CleanAuthPage"; // Version 2: with wave cut

import Dashboard from "./components/Dashboard";
import AssetDashboard from "./components/AssetDashboard";
import TicketingSystem from "./components/TicketingSystem";
import MealForecastDashboard from "./components/MealForecastDashboard";

import InventoryDashboard from "./components/InventoryDashboard";
import InventoryStockUsage from "./components/InventoryStockUsage";
import InventoryAnalytics from "./components/InventoryAnalytics";
import ManageCategories from "./components/ManageCategories";
import ManageItems from "./components/ManageItems";
import PredictiveInserts from "./components/predictiveInserts";
import PredictiveAnalysis from "./components/predictiveInserts";
import ConsumptionInventory from './components/ConsumptionInventory';
import BudgetAnalysis from './components/BudgetAnalysis';

import "./App.css";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem("token"));

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("roles");
  };

  return (
    <Router>
      <Routes>
        {!isLoggedIn ? (
          <>
            {/* Simple Auth Page with left/right swap */}
            <Route path="/" element={<SimpleAuthPage onAuthSuccess={handleAuthSuccess} />} />
            
            {/* Alternative: Use CleanAuthPage for wave-cut design */}
            {/* <Route path="/" element={<CleanAuthPage onAuthSuccess={handleAuthSuccess} />} /> */}
            
            {/* Fallback → Auth Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* Root → Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Sidebar Routes */}
            <Route path="/" element={<SidebarLayout onLogout={handleLogout} />}>
              {/* Main Dashboards */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="asset-dashboard" element={<AssetDashboard />} />
              <Route path="ticketing" element={<TicketingSystem />} />

              {/* Meal Forecast */}
              <Route path="meal-forecast" element={<MealForecastDashboard />} />

              {/* Inventory Management */}
              <Route path="inventory/categories" element={<ManageCategories />} />
              <Route path="inventory/items" element={<ManageItems />} />
              <Route path="inventory" element={<InventoryDashboard />} />
              <Route path="inventory/stock-usage" element={<InventoryStockUsage />} />
              <Route path="inventory/analytics" element={<InventoryAnalytics />} />
              <Route path="inventory/predictive-inserts" element={<PredictiveInserts />} />
              <Route path="inventory/predictive-analysis" element={<PredictiveAnalysis />} />
              <Route path="/inventory/consumption-inventory" element={<ConsumptionInventory />} />
              <Route path="/inventory/budget-analysis" element={<BudgetAnalysis />} />
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