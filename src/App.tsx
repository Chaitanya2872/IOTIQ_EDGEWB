import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import SidebarLayout from "./pages/SidebarLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SimpleAuthPage from "./components/AuthPage";
import { VendorManagement } from "./components/VendorManagement";
import { MaintenanceManagement } from "./components/MaintenanceManagement";
import { WorkOrderManagement } from "./components/WorkOrderManagement";
import { DocumentManagement } from "./components/DocumentManagement";
import "./App.css";

// ✅ Lazy-load heavy components
const Dashboard = lazy(() => import("./components/Dashboard"));
const AssetDashboard = lazy(() => import("./components/AssetDashboard"));
const AssetTracking = lazy(() => import("./components/AssetTracking"));
const AssetInventoryList = lazy(
  () => import("./components/AssetTInventorylist"),
);
const TicketingSystem = lazy(() => import("./components/TicketingSystem"));
const MealForecastDashboard = lazy(
  () => import("./components/MealForecastDashboard"),
);
const InventoryHealthDashboard = lazy(
  () => import("./components/InventoryDashboard"),
);
const InventoryStockUsage = lazy(
  () => import("./components/InventoryStockUsage"),
);
const InventoryAnalytics = lazy(
  () => import("./components/InventoryAnalytics"),
);
const ManageCategories = lazy(() => import("./components/ManageCategories"));
const ManageItems = lazy(() => import("./components/ManageItems"));
const PredictiveInserts = lazy(() => import("./components/predictiveInserts"));
const ConsumptionInventory = lazy(
  () => import("./components/ConsumptionInventory"),
);
const BudgetAnalysis = lazy(() => import("./components/BudgetAnalysis"));

// 🆕 IoT Dashboards
const IoTDashboard = lazy(() => import("./components/IoTDashboard"));
const CafeteriaScreen = lazy(() => import("./components/CafeteriaScreen"));
const IAQScreen = lazy(() => import("./components/IAQScreen"));
const SmartRestroomScreen = lazy(
  () => import("./components/SmartRestroomScreen"),
);
const SensorsHub = lazy(() => import("./components/SensorsHub"));

// 🆕 Device Management Components
const DeviceManagementDashboard = lazy(
  () => import("./components/DeviceManagementDashboard"),
);
const DeviceDetailsScreen = lazy(
  () => import("./components/DeviceDetailsScreen"),
);
const LocationManagementScreen = lazy(
  () => import("./components/LocationManagementScreen"),
);
const SegmentManagementScreen = lazy(
  () => import("./components/SegmentManagementScreen"),
);
const CounterManagementScreen = lazy(
  () => import("./components/CounterManagementScreen"),
);
const DeviceAnalyticsDashboard = lazy(
  () => import("./components/DeviceAnalyticsDashboard"),
);

// ✅ Inner content separated for readability
const AppContent: React.FC = () => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const navigate = useNavigate();

  const isDemoUser = user?.email === "iotiqedgedemo@gmail.com";

  // Redirect demo user to Ticketing (Cafeteria Analytics) on successful login
  React.useEffect(() => {
    if (isAuthenticated && isDemoUser) {
      console.log("Demo user detected, redirecting to cafeteria-demo");
      navigate("/Cafeteria", { replace: true });
    }
  }, [isAuthenticated, isDemoUser, navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #1890ff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px auto",
            }}
          />
          <div style={{ fontSize: "16px", color: "#666" }}>
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", marginTop: "40px" }}>Loading...</div>
      }
    >
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route
              path="/"
              element={<SimpleAuthPage onAuthSuccess={() => {}} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* Default redirect based on user type */}
            <Route
              path="/"
              element={
                <Navigate
                  to={isDemoUser ? "/Cafeteria" : "/inventory/analytics"}
                  replace
                />
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SidebarLayout onLogout={logout} />
                </ProtectedRoute>
              }
            >
              {/* ============================================ */}
              {/* TICKETING - Different content based on user */}
              {/* ============================================ */}
              <Route path="Cafeteria" element={<TicketingSystem />} />

              {/* ============================================ */}
              {/* REGULAR USER ROUTES */}
              {/* Demo user can see sidebar but can't access these */}
              {/* ============================================ */}
              <Route path="dashboard" element={<Dashboard />} />

              {/* ✅ Asset Management Routes */}
              <Route path="asset-dashboard" element={<AssetDashboard />} />
              <Route path="assets/inventory" element={<AssetInventoryList />} />
              <Route path="assets/tracking" element={<AssetTracking />} />
              <Route path="assets/vendors" element={<VendorManagement />} />
              <Route
                path="assets/maintenance"
                element={<MaintenanceManagement />}
              />
              <Route
                path="assets/work-orders"
                element={<WorkOrderManagement />}
              />
              <Route path="assets/documents" element={<DocumentManagement />} />

              {/* ✅ Meals */}
              <Route path="meal-forecast" element={<MealForecastDashboard />} />

              {/* 🆕 IoT Sensors Routes */}
              <Route path="iot-sensors" element={<IoTDashboard />} />
              <Route
                path="iot-sensors/cafeteria"
                element={<CafeteriaScreen />}
              />
              <Route path="iot-sensors/iaq" element={<IAQScreen />} />
              <Route
                path="iot-sensors/restroom"
                element={<SmartRestroomScreen />}
              />
              <Route path="iot-sensors/sensors-hub" element={<SensorsHub />} />

              {/* ✅ Inventory Routes - SPECIFIC ROUTES FIRST */}
              <Route
                path="inventory/categories"
                element={<ManageCategories />}
              />
              <Route path="inventory/items" element={<ManageItems />} />
              <Route
                path="inventory/stock-usage"
                element={<InventoryStockUsage />}
              />
              <Route
                path="inventory/analytics"
                element={<InventoryAnalytics />}
              />
              <Route
                path="inventory/predictive-inserts"
                element={<PredictiveInserts />}
              />
              <Route
                path="inventory/consumption-inventory"
                element={<ConsumptionInventory />}
              />
              <Route
                path="inventory/budget-analysis"
                element={<BudgetAnalysis />}
              />
              <Route path="inventory" element={<InventoryHealthDashboard />} />

              {/* 🆕 Device Management Routes - SPECIFIC ROUTES FIRST, GENERIC LAST */}
              <Route
                path="devices/analytics"
                element={<DeviceAnalyticsDashboard />}
              />
              <Route
                path="devices/details/:deviceId"
                element={<DeviceDetailsScreen />}
              />
              <Route
                path="devices/locations"
                element={<LocationManagementScreen />}
              />
              <Route
                path="devices/segments"
                element={<SegmentManagementScreen />}
              />
              <Route
                path="devices/counters"
                element={<CounterManagementScreen />}
              />
              <Route path="devices" element={<DeviceManagementDashboard />} />
            </Route>

            {/* Fallback redirect */}
            <Route
              path="*"
              element={
                <Navigate
                  to={isDemoUser ? "/Cafeteria" : "/inventory/analytics"}
                  replace
                />
              }
            />
          </>
        )}
      </Routes>
    </Suspense>
  );
};

// ✅ Main App wrapper
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </AuthProvider>
    </Router>
  );
};

export default App;
