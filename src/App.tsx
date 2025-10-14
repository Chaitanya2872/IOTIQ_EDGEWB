import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./pages/SidebarLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

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

// Inner App component that uses the auth context
const AppContent: React.FC = () => {
  const { isAuthenticated, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f0f2f5'
      }}>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }} />
          <div style={{ fontSize: '16px', color: '#666' }}>
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          {/* Simple Auth Page with left/right swap */}
          <Route path="/" element={<SimpleAuthPage onAuthSuccess={() => {}} />} />
          
          {/* Alternative: Use CleanAuthPage for wave-cut design */}
          {/* <Route path="/" element={<CleanAuthPage onAuthSuccess={() => {}} />} /> */}
          
          {/* Fallback → Auth Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          {/* Root → Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* All protected routes wrapped with ProtectedRoute */}
          <Route path="/" element={
            <ProtectedRoute>
              <SidebarLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }>
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
  );
};

// Main App component wrapped with AuthProvider
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </AuthProvider>
    </Router>
  );
};

export default App;