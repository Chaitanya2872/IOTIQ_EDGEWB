import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Ticket,
  Radar,
  BatteryCharging,
  Layers,
  UtensilsCrossed,
  ChevronDown,
  ChevronRight,
  LogOut,
  HelpCircle,
  Settings as SettingsIcon,
  User,
  Users,          // For Vendors
  Wrench,         // For Maintenance
  ClipboardList,  // For Work Orders
  FileText,       // For Documents
  AlertCircle,
} from "lucide-react";
import classNames from "classnames";
import logo from '../assets/IOTIQEdge.png';

import styles from "./SidebarMenu.module.css";

interface SidebarMenuProps {
  setSidebarWidth: (width: number) => void;
  onLogout: () => void;
}

type MenuConfig = {
  key: string;
  label: string;
  shortLabel?: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuConfig[];
};

const MENU_ITEMS: MenuConfig[] = [
  {
    key: "inventory",
    label: "Inventory",
    shortLabel: "Inv",
    icon: <Package size={18} strokeWidth={2} />,
    children: [
      { key: "inventory-analytics", label: "Executive Overview", path: "/inventory/analytics" },
      { key: "inventory-dashboard", label: "Inventory Health", path: "/inventory" },
      { key: "inventory-consumption", label: "Consumption & Stock Usage", path: "/inventory/consumption-inventory" },
      { key: "inventory-budget", label: "Budget Analysis", path: "/inventory/budget-analysis" },
      { key: "inventory-categories", label: "Manage Categories", path: "/inventory/categories" },
      { key: "inventory-items", label: "Manage Items", path: "/inventory/items" },
    ],
  },
  {
    key: "assets",
    label: "Assets",
    shortLabel: "Ast",
    icon: <Boxes size={18} strokeWidth={2} />,
    children: [
      { key: "assets-dashboard", label: "Asset Management", path: "/asset-dashboard" },
      { key: "assets-inventory", label: "Asset Inventory", path: "/assets/inventory" },
      { key: "assets-tracking", label: "Asset Tracking", path: "/assets/tracking" },
      // NEW: Vendor Management Section
      { key: "assets-vendors", label: "Vendor Management", path: "/assets/vendors" },
      { key: "assets-maintenance", label: "Maintenance Schedule", path: "/assets/maintenance" },
      { key: "assets-work-orders", label: "Work Orders", path: "/assets/work-orders" },
      { key: "assets-documents", label: "Documents", path: "/assets/documents" },
    ],
  },
  {
    key: "ticketing",
    label: "Ticketing",
    icon: <Ticket size={18} strokeWidth={2} />,
    path: "/ticketing",
  },
  {
    key: "iot",
    label: "IoT Sensors",
    shortLabel: "IoT",
    icon: <Radar size={18} strokeWidth={2} />,
    children: [
      { key: "iot-dashboard", label: "IoT Overview", path: "/iot-sensors" },
      { key: "iot-cafeteria", label: "Cafeteria Queue", path: "/iot-sensors/cafeteria" },
      { key: "iot-iaq", label: "Indoor Air Quality", path: "/iot-sensors/iaq" },
      { key: "iot-restroom", label: "Smart Restroom", path: "/iot-sensors/restroom" },
      { key: "iot-sensors-hub", label: "Sensors Hub", path: "/iot-sensors/sensors-hub" },
    ],
  },
  {
    key: "energy",
    label: "Energy",
    icon: <BatteryCharging size={18} strokeWidth={2} />,
    path: "/energy-sustainability",
  },
  {
    key: "space",
    label: "Space",
    icon: <Layers size={18} strokeWidth={2} />,
    path: "/space-occupancy",
  },
  {
    key: "meals",
    label: "Meals",
    icon: <UtensilsCrossed size={18} strokeWidth={2} />,
    path: "/meal-forecast",
  },
];

const SidebarMenu: React.FC<SidebarMenuProps> = ({ setSidebarWidth, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [openGroups, setOpenGroups] = useState(() => new Set<string>());
  const [demoNotification, setDemoNotification] = useState<string | null>(null);

  const selectedKey = location.pathname;
  const isDemoUser = user?.email === "iotiqedgedemo@gmail.com";

  // Show demo notification
  useEffect(() => {
    if (demoNotification) {
      const timer = setTimeout(() => setDemoNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [demoNotification]);

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  useEffect(() => {
    setSidebarWidth(280);
  }, [setSidebarWidth]);

  useEffect(() => {
    const match = MENU_ITEMS.find((item) =>
      item.children?.some((child) => child.path && selectedKey.startsWith(child.path))
    );
    if (match?.key) {
      setOpenGroups((prev) => {
        const next = new Set(prev);
        next.add(match.key);
        return next;
      });
    }
  }, [selectedKey]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const isRouteActive = (item: MenuConfig) => {
    if (item.path) return selectedKey === item.path;
    if (item.children) {
      return item.children.some((child) => child.path && selectedKey.startsWith(child.path));
    }
    return false;
  };

  const renderMenuItem = (item: MenuConfig) => {
    const active = isRouteActive(item);
    const opened = item.children ? openGroups.has(item.key) : undefined;
    
    const containerProps = {
      className: classNames(
        styles.menuItemBase,
        active && styles.menuItemActive,
      ),
    } as const;

    const iconClass = classNames(styles.iconWrap, active && styles.iconWrapActive);

    // Check if this is a restricted route for demo user (only allow Cafeteria Queue)
    const isCafeteriaQueueRoute = item.key === "iot-cafeteria" || item.path === "/iot-sensors/cafeteria";
    const isDemoRestricted = isDemoUser && !isCafeteriaQueueRoute;

    if (item.children) {
      const maxHeight = opened ? `${item.children.length * 38}px` : "0";

      return (
        <li key={item.key}>
          <button
            type="button"
            {...containerProps}
            className={classNames(containerProps.className, styles.buttonReset)}
            onClick={(e) => {
              if (isDemoRestricted) {
                e.preventDefault();
                setDemoNotification("This feature is for demo purposes. Please contact admin for full access.");
              } else {
                toggleGroup(item.key);
              }
            }}
          >
            {item.icon && <span className={iconClass}>{item.icon}</span>}
            <span className={styles.label}>{item.label}</span>
            {!isDemoRestricted && (
              <span
                className={classNames(
                  styles.chevron,
                  opened ? styles.chevronOpen : styles.chevronClosed
                )}
              >
                {opened ? <ChevronDown size={14} strokeWidth={2} /> : <ChevronRight size={14} strokeWidth={2} />}
              </span>
            )}
          </button>

          {!isDemoRestricted && (
            <div
              className={styles.submenuWrapper}
              style={{ maxHeight }}
            >
              <ul className={styles.submenuList}>
                {item.children.map((child) => {
                  const childActive = child.path ? selectedKey === child.path : false;
                  const isChildCafeteria = child.path === "/iot-sensors/cafeteria" || child.key === "iot-cafeteria";
                  const isChildRestricted = isDemoUser && !isChildCafeteria;
                  
                  return (
                    <li key={child.key}>
                      <Link
                        to={isChildRestricted ? "#" : (child.path || "#")}
                        className={classNames(
                          styles.submenuItem,
                          childActive && styles.submenuItemActive
                        )}
                        onClick={(e) => {
                          if (isChildRestricted) {
                            e.preventDefault();
                            setDemoNotification("This feature is for demo purposes. Please contact admin for full access.");
                          }
                        }}
                      >
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </li>
      );
    }

    if (!item.path) {
      return null;
    }

    return (
      <li key={item.key}>
        <Link
          to={isDemoRestricted ? "#" : item.path}
          {...containerProps}
          onClick={(e) => {
            if (isDemoRestricted) {
              e.preventDefault();
              setDemoNotification("This feature is for demo purposes. Please contact admin for full access.");
            }
          }}
        >
          {item.icon && <span className={iconClass}>{item.icon}</span>}
          <span className={styles.label}>{item.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className={styles.sidebarShell}>
      <div className={styles.accentBar} />

      {/* Demo Notification Toast */}
      {demoNotification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          borderRadius: 8,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          maxWidth: 350,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <AlertCircle size={20} color="#DC2626" strokeWidth={2} />
          <span style={{
            color: '#7F1D1D',
            fontSize: 13,
            fontWeight: 500
          }}>
            {demoNotification}
          </span>
        </div>
      )}

      {/* Bristol Myers Logo at TOP - Increased Size */}
      <div className={styles.bristolLogoContainer} style={{ padding: '20px 10px' }}>
        <img 
          src={logo}
          alt="Bristol Myers"
          className={styles.bristolLogo}
          style={{ width: '100%', height: 'auto', maxWidth: 200 }}
        />
      </div>

      {/* Menu Items */}
      <nav aria-label="Primary Sidebar" className={styles.navContainer}>
        <ul className={styles.menuList}>{MENU_ITEMS.map(renderMenuItem)}</ul>
      </nav>

      {/* Bottom Section - Support, Settings, Logout */}
      <div className={styles.sidebarFooter}>

        <button
          onClick={handleLogout}
          className={styles.footerMenuItem}
        >
          <span className={styles.iconWrap}>
            <LogOut size={18} strokeWidth={2} />
          </span>
          <span className={styles.label}>Logout</span>
        </button>

        {/* User Profile Section */}
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name || "User"} />
            ) : (
              <span className={styles.userInitials}>
                {getUserInitials(user?.name || "User")}
              </span>
            )}
            <span className={styles.statusIndicator}></span>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name || "User Name"}</div>
            <div className={styles.userEmail}>{user?.email || "user@email.com"}</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SidebarMenu;