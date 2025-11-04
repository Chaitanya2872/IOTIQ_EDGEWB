import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import classNames from "classnames";
import logo from '../assets/comp.svg';  // Updated this line

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
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Dash",
    icon: <LayoutDashboard size={18} strokeWidth={2} />,
    path: "/dashboard",
  },
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
    path: "/asset-dashboard",
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
    icon: <Radar size={18} strokeWidth={2} />,
    path: "/iot-sensors",
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
  const { logout, user } = useAuth(); // Assuming useAuth provides user data
  const [openGroups, setOpenGroups] = useState(() => new Set<string>());

  const selectedKey = location.pathname;

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

    if (item.children) {
      const maxHeight = opened ? `${item.children.length * 38}px` : "0";

      return (
        <li key={item.key}>
          <button
            type="button"
            {...containerProps}
            className={classNames(containerProps.className, styles.buttonReset)}
            onClick={() => toggleGroup(item.key)}
          >
            {item.icon && <span className={iconClass}>{item.icon}</span>}
            <span className={styles.label}>{item.label}</span>
            <span
              className={classNames(
                styles.chevron,
                opened ? styles.chevronOpen : styles.chevronClosed
              )}
            >
              {opened ? <ChevronDown size={14} strokeWidth={2} /> : <ChevronRight size={14} strokeWidth={2} />}
            </span>
          </button>

          <div
            className={styles.submenuWrapper}
            style={{ maxHeight }}
          >
            <ul className={styles.submenuList}>
              {item.children.map((child) => {
                const childActive = child.path ? selectedKey === child.path : false;
                return (
                  <li key={child.key}>
                    <Link
                      to={child.path || "#"}
                      className={classNames(
                        styles.submenuItem,
                        childActive && styles.submenuItemActive
                      )}
                    >
                      {child.label}
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
          to={item.path}
          {...containerProps}
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

      {/* Bristol Myers Logo at TOP */}
      <div className={styles.bristolLogoContainer}>
        <img 
          src={logo}
          alt="Bristol Myers"
          className={styles.bristolLogo}
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
    </div>
  );
};

export default SidebarMenu;