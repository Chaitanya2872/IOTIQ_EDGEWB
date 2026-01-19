import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Coffee,
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
  Users,
  Wrench,
  ClipboardList,
  FileText,
  AlertCircle,
  Lock,
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

// ALL MENU ITEMS - Visible to everyone
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
      { key: "assets-vendors", label: "Vendor Management", path: "/assets/vendors" },
      { key: "assets-maintenance", label: "Maintenance Schedule", path: "/assets/maintenance" },
      { key: "assets-work-orders", label: "Work Orders", path: "/assets/work-orders" },
      { key: "assets-documents", label: "Documents", path: "/assets/documents" },
    ],
  },
  {
    key: "ticketing",
    label: "Cafeteria",
    icon: <Coffee size={18} strokeWidth={2} />,
    path: "/Cafeteria",
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

  // Check if item is allowed for demo user
  const isAllowedForDemo = (itemKey: string, itemPath?: string) => {
    return itemKey === "ticketing" || itemPath === "/Cafeteria";
  };

  // Show toast notification for demo user
  const showDemoNotification = () => {
    setDemoNotification("🔒 This feature is not available in demo mode. Contact admin@iotiq.co.in for full access.");
  };

  const renderMenuItem = (item: MenuConfig) => {
    const active = isRouteActive(item);
    const opened = item.children ? openGroups.has(item.key) : undefined;
    const isRestricted = isDemoUser && !isAllowedForDemo(item.key, item.path);
    
    const containerProps = {
      className: classNames(
        styles.menuItemBase,
        active && styles.menuItemActive,
        isRestricted && styles.menuItemRestricted, // Add visual indication
      ),
    } as const;

    const iconClass = classNames(
      styles.iconWrap, 
      active && styles.iconWrapActive,
      isRestricted && styles.iconWrapRestricted
    );

    if (item.children) {
      const maxHeight = opened ? `${item.children.length * 38}px` : "0";

      return (
        <li key={item.key}>
          <button
            type="button"
            {...containerProps}
            className={classNames(containerProps.className, styles.buttonReset)}
            onClick={(e) => {
              if (isRestricted) {
                e.preventDefault();
                showDemoNotification();
              } else {
                toggleGroup(item.key);
              }
            }}
          >
            {item.icon && <span className={iconClass}>{item.icon}</span>}
            <span className={styles.label}>
              {item.label}
              {isRestricted && <Lock size={12} style={{ marginLeft: 6, opacity: 0.5 }} />}
            </span>
            {!isRestricted && (
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

          <div
            className={styles.submenuWrapper}
            style={{ maxHeight: isRestricted ? "0" : maxHeight }}
          >
            <ul className={styles.submenuList}>
              {item.children.map((child) => {
                const childActive = child.path ? selectedKey === child.path : false;
                const isChildRestricted = isDemoUser && !isAllowedForDemo(child.key, child.path);
                
                return (
                  <li key={child.key}>
                    <Link
                      to={isChildRestricted ? "#" : (child.path || "#")}
                      className={classNames(
                        styles.submenuItem,
                        childActive && styles.submenuItemActive,
                        isChildRestricted && styles.submenuItemRestricted
                      )}
                      onClick={(e) => {
                        if (isChildRestricted) {
                          e.preventDefault();
                          showDemoNotification();
                        }
                      }}
                    >
                      {child.label}
                      {isChildRestricted && <Lock size={10} style={{ marginLeft: 6, opacity: 0.5 }} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </li>
      );
    }

    if (!item.path) {
      return null;
    }

    return (
      <li key={item.key}>
        <Link
          to={isRestricted ? "#" : item.path}
          {...containerProps}
          onClick={(e) => {
            if (isRestricted) {
              e.preventDefault();
              showDemoNotification();
            }
          }}
        >
          {item.icon && <span className={iconClass}>{item.icon}</span>}
          <span className={styles.label}>
            {item.label}
            {isRestricted && <Lock size={12} style={{ marginLeft: 6, opacity: 0.5 }} />}
          </span>
        </Link>
      </li>
    );
  };

  return (
    <div className={styles.sidebarShell}>
      <div className={styles.accentBar} />

      {/* Demo Notification Toast - Updated Colors */}
      {demoNotification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', // Yellow gradient
          border: '2px solid #F59E0B',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 9999,
          boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
          maxWidth: 400,
          animation: 'slideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}>
          <div style={{
            background: '#F59E0B',
            borderRadius: '50%',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lock size={18} color="white" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              color: '#92400E',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 4
            }}>
              Demo Mode
            </div>
            <div style={{
              color: '#78350F',
              fontSize: 13,
              lineHeight: 1.4
            }}>
              {demoNotification}
            </div>
          </div>
        </div>
      )}

      {/* Logo */}
      <div className={styles.bristolLogoContainer} style={{ padding: '20px 10px' }}>
        <img 
          src={logo}
          alt="Bristol Myers"
          className={styles.bristolLogo}
          style={{ width: '100%', height: 'auto', maxWidth: 200 }}
        />
      </div>

      {/* Demo User Badge */}
      {isDemoUser && (
        <div style={{
          margin: '0 16px 16px 16px',
          padding: '10px 14px',
          background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
          borderRadius: 8,
          textAlign: 'center',
          color: '#78350F',
          fontSize: 12,
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}>
          <Lock size={14} />
          DEMO MODE - LIMITED ACCESS
        </div>
      )}

      {/* Menu Items */}
      <nav aria-label="Primary Sidebar" className={styles.navContainer}>
        <ul className={styles.menuList}>{MENU_ITEMS.map(renderMenuItem)}</ul>
      </nav>

      {/* Bottom Section */}
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
        @keyframes slideInBounce {
          0% {
            opacity: 0;
            transform: translateX(100px) scale(0.8);
          }
          50% {
            transform: translateX(-10px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .${styles.menuItemRestricted} {
          opacity: 0.6;
          cursor: not-allowed !important;
        }
        
        .${styles.menuItemRestricted}:hover {
          opacity: 0.8;
        }
        
        .${styles.iconWrapRestricted} {
          opacity: 0.5;
        }
        
        .${styles.submenuItemRestricted} {
          opacity: 0.6;
          cursor: not-allowed !important;
        }
      `}</style>
    </div>
  );
};

export default SidebarMenu;