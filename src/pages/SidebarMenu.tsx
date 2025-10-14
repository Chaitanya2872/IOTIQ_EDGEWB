import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardFilled,
  BankFilled,
  QuestionCircleFilled,
  RadarChartOutlined,
  ThunderboltFilled,
  LayoutFilled,
  AppstoreFilled,
  CalendarFilled,
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
    setSidebarWidth(sidebarOpen ? 200 : 60);
  }, [sidebarOpen, setSidebarWidth]);

  const showTooltip = (text: string, e: React.MouseEvent) => {
    if (!sidebarOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        show: true,
        text,
        x: rect.right + 8,
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
      padding: sidebarOpen ? "10px 14px" : "10px 0",
      color: isActive ? "#06b6d4" : isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
      fontWeight: isActive ? 600 : 500,
      textDecoration: "none",
      background: isActive
        ? "rgba(6, 182, 212, 0.12)"
        : isHovered
        ? "rgba(255, 255, 255, 0.06)"
        : "transparent",
      transition: "all 0.25s ease",
      whiteSpace: "nowrap",
      cursor: "pointer",
      margin: "1px 0",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      justifyContent: sidebarOpen ? "flex-start" : "center",
      overflow: "hidden",
      borderLeft: isActive ? "3px solid #06b6d4" : "3px solid transparent",
      fontSize: "13px",
    } as React.CSSProperties;
  };

  const iconContainerStyle = (path: string) => {
    const isActive = selectedKey === path || (path === "/inventory" && selectedKey.startsWith("/inventory"));
    const isHovered = hoveredItem === path;

    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      background: isActive
        ? "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
        : isHovered
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(255, 255, 255, 0.06)",
      color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.85)",
      transition: "all 0.25s ease",
      boxShadow: isActive
        ? "0 2px 8px rgba(6, 182, 212, 0.25)"
        : "none",
      transform: isActive 
        ? "scale(1.03)" 
        : "scale(1)",
    } as React.CSSProperties;
  };

  const subMenuItemStyle = (path: string) => {
    const isActive = selectedKey === path;
    const isHovered = hoveredItem === path;

    return {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 14px 8px 20px",
      color: isActive ? "#06b6d4" : isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
      fontWeight: isActive ? 600 : 500,
      textDecoration: "none",
      background: isActive
        ? "rgba(6, 182, 212, 0.08)"
        : isHovered
        ? "rgba(255, 255, 255, 0.04)"
        : "transparent",
      borderLeft: isActive ? "3px solid #06b6d4" : "3px solid transparent",
      margin: "1px 0",
      fontSize: "12.5px",
      transition: "all 0.25s ease",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
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
          width: sidebarOpen ? 200 : 70,
          background: "#0f172a",
          borderRight: "1px solid rgba(6, 182, 212, 0.08)",
          transition: "all 0.25s ease",
          overflowX: "hidden",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          position: "relative",
        }}
      >
        {/* Yellow accent strip */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "3px",
            background: "linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)",
            boxShadow: "0 0 8px rgba(6, 182, 212, 0.4)",
          }}
        />

        {/* Sidebar Header - More compact */}
        <div
          style={{
            padding: sidebarOpen ? "16px 14px 12px 18px" : "16px 0",
            fontWeight: 700,
            fontSize: sidebarOpen ? "16px" : "16px",
            color: "#ffffff",
            textAlign: sidebarOpen ? "left" : "center",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            gap: 8,
            letterSpacing: "0.03em",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "8px",
          }}
        >
          {sidebarOpen ? "MENU" : "☰"}
        </div>

        {/* Dashboard */}
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
          <span style={iconContainerStyle("/dashboard")}>
            <DashboardFilled style={{ fontSize: 18 }} />
          </span>
          <span style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: sidebarOpen ? "13px" : "10px",
            opacity: sidebarOpen ? 1 : 0.8
          }}>
            {sidebarOpen ? "Dashboard" : "Dash"}
          </span>
        </Link>

        {/* Inventory Dropdown */}
        <div
          onClick={toggleInventory}
          onMouseEnter={(e) => {
            setHoveredItem("/inventory");
            showTooltip("Inventory", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
          style={menuItemStyle("/inventory")}
        >
          <span style={iconContainerStyle("/inventory")}>
            <AppstoreFilled style={{ fontSize: 18 }} />
          </span>
          {sidebarOpen && (
            <>
              <span style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
                fontSize: sidebarOpen ? "13px" : "10px",
                opacity: sidebarOpen ? 1 : 0.8
              }}>
                {sidebarOpen ? "Inventory" : "Inv"}
              </span>
              <span 
                style={{ 
                  fontSize: 11, 
                  marginLeft: 4,
                  transition: "transform 0.25s ease",
                  transform: inventoryOpen ? "rotate(0deg)" : "rotate(-90deg)"
                }}
              >
                {inventoryOpen ? <DownOutlined /> : <RightOutlined />}
              </span>
            </>
          )}
        </div>

        {/* Inventory Submenu */}
        {sidebarOpen && (
          <div
            style={{
              maxHeight: inventoryOpen ? "400px" : "0",
              overflow: "hidden",
              transition: "max-height 0.25s ease",
            }}
          >
            <Link 
              to="/inventory/categories"
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/categories")}
              onMouseEnter={() => setHoveredItem("/inventory/categories")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Categories</span>
            </Link>

            <Link 
              to="/inventory/items" 
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/items")}
              onMouseEnter={() => setHoveredItem("/inventory/items")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Items</span>
            </Link>

            <Link
              to="/inventory/analytics"
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/analytics")}
              onMouseEnter={() => setHoveredItem("/inventory/analytics")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Analytics</span>
            </Link>

            <Link
              to="/inventory/consumption-inventory"
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/consumption-inventory")}
              onMouseEnter={() => setHoveredItem("/inventory/consumption-inventory")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Consumption</span>
            </Link>

            <Link 
              to="/inventory/budget-analysis"
              className="sidebar-item"
              style={subMenuItemStyle("/inventory/budget-analysis")}
              onMouseEnter={() => setHoveredItem("/inventory/budget-analysis")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Budget</span>
            </Link>
          </div>
        )}

        {/* Asset Dashboard */}
        <Link 
          to="/asset-dashboard"
          className="sidebar-item"
          style={menuItemStyle("/asset-dashboard")}
          onMouseEnter={(e) => {
            setHoveredItem("/asset-dashboard");
            showTooltip("Assets", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <span style={iconContainerStyle("/asset-dashboard")}>
            <BankFilled style={{ fontSize: 18 }} />
          </span>
          <span style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: sidebarOpen ? "13px" : "10px",
            opacity: sidebarOpen ? 1 : 0.8
          }}>
            {sidebarOpen ? "Assets" : "Ast"}
          </span>
        </Link>

        {/* Ticketing System */}
        <Link 
          to="/ticketing"
          className="sidebar-item"
          style={menuItemStyle("/ticketing")}
          onMouseEnter={(e) => {
            setHoveredItem("/ticketing");
            showTooltip("Ticketing", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <span style={iconContainerStyle("/ticketing")}>
            <QuestionCircleFilled style={{ fontSize: 18 }} />
          </span>
          {sidebarOpen && (
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              Ticketing
            </span>
          )}
        </Link>

        {/* IoT Sensors */}
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
          <span style={iconContainerStyle("/iot-sensors")}>
            <RadarChartOutlined style={{ fontSize: 18 }} />
          </span>
          {sidebarOpen && (
            <span style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: sidebarOpen ? "13px" : "10px",
              opacity: sidebarOpen ? 1 : 0.8
            }}>
              IoT Sensors
            </span>
          )}
        </Link>

        {/* Energy & Sustainability */}
        <Link 
          to="/energy-sustainability"
          className="sidebar-item" 
          style={menuItemStyle("/energy-sustainability")}
          onMouseEnter={(e) => {
            setHoveredItem("/energy-sustainability");
            showTooltip("Energy", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <span style={iconContainerStyle("/energy-sustainability")}>
            <ThunderboltFilled style={{ fontSize: 18 }} />
          </span>
          {sidebarOpen && (
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              Energy
            </span>
          )}
        </Link>

        {/* Space & Occupancy */}
        <Link 
          to="/space-occupancy" 
          className="sidebar-item"
          style={menuItemStyle("/space-occupancy")}
          onMouseEnter={(e) => {
            setHoveredItem("/space-occupancy");
            showTooltip("Space", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <span style={iconContainerStyle("/space-occupancy")}>
            <LayoutFilled style={{ fontSize: 18 }} />
          </span>
          {sidebarOpen && (
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              Space
            </span>
          )}
        </Link>

        {/* Meal Forecast */}
        <Link 
          to="/meal-forecast"
          className="sidebar-item"
          style={menuItemStyle("/meal-forecast")}
          onMouseEnter={(e) => {
            setHoveredItem("/meal-forecast");
            showTooltip("Meals", e);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            hideTooltip();
          }}
        >
          <span style={iconContainerStyle("/meal-forecast")}>
            <CalendarFilled style={{ fontSize: 18 }} />
          </span>
          {sidebarOpen && (
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              Meals
            </span>
          )}
        </Link>
      </div>

      {/* Compact Tooltip */}
      {tooltip.show && !sidebarOpen && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateY(-50%)",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#06b6d4",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            zIndex: 10000,
            whiteSpace: "nowrap",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            pointerEvents: "none",
          }}
        >
          {tooltip.text}
          <div
            style={{
              position: "absolute",
              left: "-5px",
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: "5px solid #0f172a",
            }}
          />
        </div>
      )}
    </>
  );
};

export default SidebarMenu;