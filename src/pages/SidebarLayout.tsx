import React, { useState } from "react";
import Header from "./Header";
import SidebarMenu from "./SidebarMenu";
import { Outlet } from "react-router-dom";

interface SidebarLayoutProps {
  onLogout: () => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ onLogout }) => {
  const [sidebarWidth, setSidebarWidth] = useState(200); // Compact default width

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ position: "fixed", top: 64, left: 0, bottom: 0, zIndex: 900 }}>
        <SidebarMenu setSidebarWidth={setSidebarWidth} />
      </div>

      {/* Main Area */}
      <div 
        style={{ 
          flex: 1, 
          marginLeft: sidebarWidth, 
          transition: "margin-left 0.25s ease" 
        }}
      >
        {/* Fixed Header */}
        <div
          style={{
            width: "100%",
            height: "64px",
            backgroundColor: "transparent",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1000,
          }}
        >
          <Header onLogout={onLogout} />
        </div>

        {/* Page Content - Minimal padding */}
        <div
          style={{
            marginTop: "64px",
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            background: "linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)",
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;