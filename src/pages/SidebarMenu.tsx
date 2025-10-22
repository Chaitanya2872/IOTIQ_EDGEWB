import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Orbit,
} from "lucide-react";
import classNames from "classnames";

import styles from "../styles/SidebarMenu.module.css";

interface SidebarMenuProps {
  setSidebarWidth: (width: number) => void;
}

type TooltipState = {
  show: boolean;
  text: string;
  x: number;
  y: number;
};

type MenuConfig = {
  key: string;
  label: string;
  shortLabel?: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuConfig[];
};

const useIsBrowser = () => typeof window !== "undefined";

const useIsDesktop = () => {
  const isBrowser = useIsBrowser();
  const [isDesktop, setIsDesktop] = React.useState(() => (isBrowser ? window.innerWidth >= 1024 : true));

  React.useEffect(() => {
    if (!isBrowser) return;
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isBrowser]);

  return isDesktop;
};

const MENU_ITEMS: MenuConfig[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Dash",
    icon: <LayoutDashboard size={20} strokeWidth={2} />,
    path: "/dashboard",
  },
  {
    key: "inventory",
    label: "Inventory",
    shortLabel: "Inv",
    icon: <Package size={20} strokeWidth={2} />,
    children: [
      { key: "inventory-dashboard", label: "Dashboard", path: "/inventory" },
      { key: "inventory-stock-usage", label: "Stock Usage", path: "/inventory/stock-usage" },
      { key: "inventory-analytics", label: "Analytics", path: "/inventory/analytics" },
      { key: "inventory-predictive-inserts", label: "Predictive Inserts", path: "/inventory/predictive-inserts" },
      { key: "inventory-predictive-analysis", label: "Predictive Analysis", path: "/inventory/predictive-analysis" },
      { key: "inventory-consumption", label: "Consumption", path: "/inventory/consumption-inventory" },
      { key: "inventory-budget", label: "Budget", path: "/inventory/budget-analysis" },
      { key: "inventory-categories", label: "Categories", path: "/inventory/categories" },
      { key: "inventory-items", label: "Items", path: "/inventory/items" },
    ],
  },
  {
    key: "assets",
    label: "Assets",
    shortLabel: "Ast",
    icon: <Boxes size={20} strokeWidth={2} />,
    path: "/asset-dashboard",
  },
  {
    key: "ticketing",
    label: "Ticketing",
    icon: <Ticket size={20} strokeWidth={2} />,
    path: "/ticketing",
  },
  {
    key: "iot",
    label: "IoT Sensors",
    icon: <Radar size={20} strokeWidth={2} />,
    path: "/iot-sensors",
  },
  {
    key: "energy",
    label: "Energy",
    icon: <BatteryCharging size={20} strokeWidth={2} />,
    path: "/energy-sustainability",
  },
  {
    key: "space",
    label: "Space",
    icon: <Layers size={20} strokeWidth={2} />,
    path: "/space-occupancy",
  },
  {
    key: "meals",
    label: "Meals",
    icon: <UtensilsCrossed size={20} strokeWidth={2} />,
    path: "/meal-forecast",
  },
];

const SidebarMenu: React.FC<SidebarMenuProps> = ({ setSidebarWidth }) => {
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const isBrowser = useIsBrowser();
  const [openGroups, setOpenGroups] = useState(() => new Set<string>());

  const [isExpanded, setIsExpanded] = useState(() => (isBrowser ? window.innerWidth >= 1024 : true));
  const [tooltip, setTooltip] = useState<TooltipState>({ show: false, text: "", x: 0, y: 0 });
  const selectedKey = location.pathname;

  useEffect(() => {
    setSidebarWidth(isExpanded ? 240 : 72);
  }, [isExpanded, setSidebarWidth]);

  useEffect(() => {
    setIsExpanded(isDesktop);
  }, [isDesktop]);

  // Close all expanded groups when sidebar collapses
  useEffect(() => {
    if (!isExpanded) {
      setOpenGroups(new Set());
    }
  }, [isExpanded]);

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

  const handleMouseEnter = (
    item: MenuConfig,
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => {
    if (!isExpanded && isBrowser) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip({
        show: true,
        text: item.label,
        x: rect.right + 12,
        y: rect.top + rect.height / 2,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, show: false }));
  };

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

  const isRouteActive = (item: MenuConfig) => {
    if (item.path) return selectedKey === item.path;
    if (item.children) {
      return item.children.some((child) => child.path && selectedKey.startsWith(child.path));
    }
    return false;
  };

  const renderMenuItem = (item: MenuConfig) => {
    const active = isRouteActive(item);
    const collapsed = !isExpanded;
    const opened = item.children ? openGroups.has(item.key) : undefined;

    const containerProps = {
      onMouseEnter: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) =>
        handleMouseEnter(item, event),
      onMouseLeave: handleMouseLeave,
      className: classNames(
        styles.menuItemBase,
        collapsed && styles.menuItemCollapsed,
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
            {isExpanded && (
              <span className={styles.label}>{item.label}</span>
            )}
            {isExpanded && (
              <span
                className={classNames(
                  styles.chevron,
                  opened ? styles.chevronOpen : styles.chevronClosed
                )}
              >
                {opened ? <ChevronDown size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
              </span>
            )}
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
                      onMouseEnter={(event) => handleMouseEnter(child, event)}
                      onMouseLeave={handleMouseLeave}
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
          {isExpanded && (
            <span className={styles.label}>{item.label}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      <div
        className={classNames(
          styles.sidebarShell,
          isExpanded ? styles.expanded : styles.collapsed
        )}
        onMouseEnter={() => isDesktop && setIsExpanded(true)}
        onMouseLeave={() => isDesktop && setIsExpanded(false)}
      >
        <div className={styles.accentBar} />

        <div
          className={classNames(
            styles.header,
            !isExpanded && styles.headerCollapsed
          )}
        >
          <div className={styles.logoContainer}>
            <Orbit 
              size={isExpanded ? 26 : 30} 
              strokeWidth={2.2} 
              className={styles.logoIcon}
            />
            {isExpanded && (
              <span className={styles.logoText}>Menu</span>
            )}
          </div>
        </div>

        <nav aria-label="Primary Sidebar">
          <ul className={styles.menuList}>{MENU_ITEMS.map(renderMenuItem)}</ul>
        </nav>

        {isDesktop && (
          <button
            type="button"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className={classNames(styles.toggleButton, !isDesktop && styles.mobileToggle)}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? <ChevronRight size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
          </button>
        )}
      </div>

      {!isExpanded && tooltip.show && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateY(-50%)",
          }}
        >
          {tooltip.text}
        </div>
      )}

      {!isDesktop && isExpanded && (
        <div
          className={styles.backdrop}
          role="presentation"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default SidebarMenu;