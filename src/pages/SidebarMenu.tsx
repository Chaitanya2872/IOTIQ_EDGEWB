import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  BankOutlined,
  QuestionCircleOutlined,
  RadarChartOutlined,
  ThunderboltOutlined,
  LayoutOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";

import "../styles/inventory.css";

interface SidebarMenuProps {
  setSidebarWidth: (width: number) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ setSidebarWidth }) => {
  const location = useLocation();
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{ show: boolean; text: string; x: number; y: number }>({
    show: false,
    text: '',
    x: 0,
    y: 0
  });

  const toggleInventory = () => setInventoryOpen(!inventoryOpen);
  const selectedKey = location.pathname;

  useEffect(() => {
    setSidebarWidth(sidebarOpen ? 220 : 70);
  }, [sidebarOpen, setSidebarWidth]);

  const showTooltip = (text: string, e: React.MouseEvent) => {
    if (!sidebarOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        show: true,
        text,
        x: rect.right + 10,
        y: rect.top + rect.height / 2
      });
    }
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

 const menuItemStyle = (path: string) => {
  const isActive = selectedKey === path || (path === "/inventory" && selectedKey.startsWith("/inventory"));
  const isHovered = hoveredItem === path;

  return {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    color: "#0f172a",
    fontWeight: isActive ? 700 : 600,
    textDecoration: "none",
    background: "transparent",
    border: "none",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    cursor: "pointer",
    margin: "4px 0",
    fontFamily: "Poppins, sans-serif",
    width: sidebarOpen ? "auto" : "56px",
    justifyContent: sidebarOpen ? "flex-start" : "center",
    overflow: "hidden",
  } as React.CSSProperties;
};


  const subMenuItemStyle = (path: string) => {
    const isActive = selectedKey === path;
    const isHovered = hoveredItem === path;

    return {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 16px",
      color: "#0f172a",
      fontWeight: isActive ? 600 : 500,
      textDecoration: "none",
      background: isActive ? "rgba(28, 198, 96, 0.15)" : isHovered ? "rgba(28, 198, 96, 0.08)" : "transparent",
      border: isActive ? "1px solid rgba(28, 198, 96, 0.25)" : "1px solid transparent",
      borderRadius: "8px",
      margin: "3px 8px",
      fontSize: "14px",
      transition: "all 0.2s ease",
      fontFamily: "Poppins, sans-serif",
    } as React.CSSProperties;
  };

  return (
    <>
      <div
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => {
          setSidebarOpen(false);
          setInventoryOpen(false);
          hideTooltip();
        }}
        style={{
          width: sidebarOpen ? 240 : 78,
          background: "linear-gradient(180deg, rgba(241, 245, 249, 0.35) 0%, rgba(241, 245, 249, 0.15) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderRight: "1px solid rgba(148, 163, 184, 0.35)",
          transition: "width 0.3s ease",
          overflowX: "hidden",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          padding: "10px 6px",
        }}
      >
        {/* === Sidebar Header === */}
        <div
          style={{
            padding: sidebarOpen ? "16px 16px 10px" : "16px 0",
            fontWeight: 700,
            fontSize: sidebarOpen ? "22px" : "20px",
            color: "#0f172a",
            textAlign: sidebarOpen ? "left" : "center",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {sidebarOpen ? "Menu" : "☰"}
        </div>

        {/* === Main Routes === */}
        <Link 
          to="/dashboard" 
          className="sidebar-item"
          style={menuItemStyle("/dashboard")}
          onMouseEnter={(e) => {
            setHoveredItem("/dashboard");
            showTooltip("Dashboard", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <DashboardOutlined style={{ fontSize: 24, minWidth: 24 }} />
          {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Dashboard</span>}
        </Link>

        {/* === Inventory Dropdown (Moved after Dashboard) === */}
        <div
          onClick={toggleInventory}
          onMouseEnter={(e) => {
            setHoveredItem("/inventory");
            showTooltip("Inventory Management", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
          style={{
            ...menuItemStyle("/inventory"),
            fontWeight: 700,
          }}
        >
          <AppstoreOutlined style={{ fontSize: 24, minWidth: 24 }} />
          {sidebarOpen && (
            <>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1 }} className="sidebar-item">
                Inventory Management
              </span>
              <span style={{ fontSize: 14, marginLeft: 4 }}>
                {inventoryOpen ? <DownOutlined /> : <RightOutlined />}
              </span>
            </>
          )}
        </div>

        {sidebarOpen && (
          <div
            style={{
              maxHeight: inventoryOpen ? "400px" : "0",
              overflow: "hidden",
              transition: "max-height 0.3s ease",
              marginLeft: "6px",
            }}
          >
            <Link 
              to="/inventory/categories"
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/categories")}
              onMouseEnter={() => setHoveredItem("/inventory/categories")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Manage Categories</span>
            </Link>

            <Link 
              to="/inventory/items" 
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/items")}
              onMouseEnter={() => setHoveredItem("/inventory/items")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Manage Items</span>
            </Link>

            <Link 
              to="/inventory" 
              className="sidebar-item"
              style={subMenuItemStyle("/inventory")}
              onMouseEnter={() => setHoveredItem("/inventory")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Inventory Report</span>
            </Link>
             <Link 
  to="/inventory/predictive-inserts"  // <-- corrected route
  className="sidebar-item"
  style={subMenuItemStyle("/inventory/predictive-inserts")}
  onMouseEnter={() => setHoveredItem("/inventory/predictive-inserts")}
  onMouseLeave={() => setHoveredItem(null)}
>
  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Predictive Insights</span>
</Link>

            <Link 
              to="/inventory/stock-usage" 
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/stock-usage")}
              onMouseEnter={() => setHoveredItem("/inventory/stock-usage")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Analytics and Insights</span>
            </Link>

            <Link 
              to="/inventory/analytics"
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/analytics")}
              onMouseEnter={() => setHoveredItem("/inventory/analytics")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Inventory Analytics</span>
            </Link>

            
            <Link 
              to="/inventory/consumption-inventory"
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/consumption-inventory")}
              onMouseEnter={() => setHoveredItem("/inventory/consumption-inventory")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Consumption Inventory</span>
            </Link>

            

            <Link 
              to="/inventory/budget-analysis"
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/budget-analysis")}
              onMouseEnter={() => setHoveredItem("/inventory/budget-analysis")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Budget Analysis</span>
            </Link>

          </div>
        )}

        <Link 
          to="/asset-dashboard"

          className="sidebar-item"
          style={menuItemStyle("/asset-dashboard")}
          onMouseEnter={(e) => {
            setHoveredItem("/asset-dashboard");
            showTooltip("Asset Dashboard", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <BankOutlined style={{ fontSize: 24, minWidth: 24 }} />
          {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Asset Dashboard</span>}
        </Link>

        <Link 
          to="/ticketing"
          className="sidebar-item"
          style={menuItemStyle("/ticketing")}
          onMouseEnter={(e) => {
            setHoveredItem("/ticketing");
            showTooltip("Ticketing System", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <QuestionCircleOutlined style={{ fontSize: 24, minWidth: 24 }} />
          {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Ticketing System</span>}
        </Link>

        <Link 
          to="/iot-sensors" 
          className="sidebar-item"
          style={menuItemStyle("/iot-sensors")}
          onMouseEnter={(e) => {
            setHoveredItem("/iot-sensors");
            showTooltip("IoT Sensors", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <RadarChartOutlined style={{ fontSize: 24, minWidth: 24 }} />
          {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>IoT Sensors</span>}
        </Link>

        <Link 
          to="/energy-sustainability"
          className="sidebar-item" 
          style={menuItemStyle("/energy-sustainability")}
          onMouseEnter={(e) => {
            setHoveredItem("/energy-sustainability");
            showTooltip("Energy & Sustainability", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <ThunderboltOutlined style={{ fontSize: 24, minWidth: 24 }} />
          {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Energy & Sustainability</span>}
        </Link>

        <Link 
          to="/space-occupancy" 
          className="sidebar-item"
          style={menuItemStyle("/space-occupancy")}
          onMouseEnter={(e) => {
            setHoveredItem("/space-occupancy");
            showTooltip("Space & Occupancy", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <LayoutOutlined style={{ fontSize: 24, minWidth: 24 }} />
          {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Space & Occupancy</span>}
        </Link>

        <Link 
          to="/meal-forecast"
          className="sidebar-item"
          style={menuItemStyle("/meal-forecast")}
          onMouseEnter={(e) => {
            setHoveredItem("/meal-forecast");
            showTooltip("Meal Forecast", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <CalendarOutlined style={{ fontSize: 24, minWidth: 24 }} />
          {sidebarOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Meal Forecast</span>}
        </Link>
      </div>

      {/* Tooltip */}
      {tooltip.show && !sidebarOpen && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateY(-50%)",
            background: "rgba(15, 23, 42, 0.95)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            zIndex: 1000,
            whiteSpace: "nowrap",
            fontFamily: "Poppins, sans-serif",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            pointerEvents: "none",
          }}
        >
          {tooltip.text}
          {/* Triangle pointer */}
          <div
            style={{
              position: "absolute",
              left: "-6px",
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderRight: "6px solid rgba(15, 23, 42, 0.95)",
            }}
          />
        </div>
      )}
    </>
  );
};

export default SidebarMenu;