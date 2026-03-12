import React from "react";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const SidebarLinks = [
    { name: "Dashboard", path: "/owner",           icon: assets.dashboardIcon },
    { name: "Add Room",  path: "/owner/add-room",  icon: assets.addIcon },
    { name: "List Room", path: "/owner/list-room", icon: assets.listIcon },
    { name: "Analytics", path: "/owner/analytics", icon: assets.totalRevenueIcon },
  ];

  return (
    <div className="md:w-64 w-16 border-r border-gray-200 dark:border-gray-700 min-h-screen text-base pt-6 flex flex-col transition-all duration-300 bg-white dark:bg-gray-900">
      {SidebarLinks.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          end={item.path === "/owner"}
          className={({ isActive }) =>
            `flex items-center py-3 px-3 md:px-8 gap-3 transition-colors duration-200 ${
              isActive
                ? "border-r-4 md:border-r-[6px] bg-blue-600/10 dark:bg-blue-500/10 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent text-gray-700 dark:text-gray-400"
            }`
          }
        >
          <img
            src={item.icon}
            alt={item.name}
            className="min-h-6 min-w-6 dark:invert dark:opacity-70"
          />
          <p className="md:block hidden text-sm font-medium">{item.name}</p>
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;