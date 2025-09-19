import React, { useState } from "react";
import Header from "./Header";
import SidebarMenu from "./SidebarMenu";
import { Outlet } from "react-router-dom";

interface SidebarLayoutProps {
  onLogout: () => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ onLogout }) => {
  // track sidebar state (collapsed or expanded)
  const [sidebarWidth, setSidebarWidth] = useState(220); // default expanded

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ position: "fixed", top: 60, left: 0, bottom: 0 }}>
        <SidebarMenu setSidebarWidth={setSidebarWidth} />
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: "margin-left 0.3s ease" }}>
        {/* Fixed Header */}
        <div
          style={{
            width: "100%",
            height: "60px",
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#fff",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1000,
          }}
        >
          <Header onLogout={onLogout} />
        </div>

        {/* Page Content */}
        <div
          style={{
            marginTop: "60px", // push below header
            height: "calc(100vh - 60px)",
            overflowY: "auto",
            backgroundColor: "#fafafa",
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