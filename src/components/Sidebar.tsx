"use client";

import { Activity, LayoutDashboard, UsersRound } from "lucide-react";
import { useWindowWidth } from "@react-hook/window-size";
import { Nav } from "./Nav";

import React, { useEffect, useState } from "react";

const Sidebar: React.FC = () => {
  const mobileWidth = useWindowWidth();
  const [isMobile, setIsMobile] = useState(false);

  const [isCollapsed] = useState(false);

  useEffect(() => {
    setIsMobile(mobileWidth < 1200);
  }, [mobileWidth]);

  return (
    <div className="flex flex-col">
      {/* Navigation Buttons */}
      <Nav
        isCollapsed={isMobile ? true : isCollapsed}
        links={[
          {
            title: "Dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
            href: "/",
          },
          {
            title: "Patient Profile",
            icon: UsersRound,
            label: "Patient Profile",
            href: "/patient-profile",
          },
          {
            title: "Activity",
            icon: Activity,
            label: "Activity",
            href: "/activity",
          },
        ]}
      />
    </div>
  );
};

export default Sidebar;
