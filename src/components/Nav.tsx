import { NavLink } from "react-router-dom";
import { TooltipProvider } from "../components/ui/tooltip";
import { LucideIcon } from "lucide-react";
import Logo from "../assets/DCDC.png";

interface SidebarLink {
  title: string;
  icon: LucideIcon;
  href: string;
  label: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  links: SidebarLink[];
}

export function Nav({ isCollapsed, links }: SidebarProps) {
  return (
    <aside>
      <TooltipProvider>
        <div
          className={` h-screen  p-5 transition-all duration-300 ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="flex items-center justify-center">
            <img src={Logo} alt="Logo" className="lg:h-40 sm:h-20" />
          </div>
          <nav className="flex justify-center  flex-col gap-2">
            {links.map((link, index) => (
              <div key={index}>
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    `flex h-10 items-center rounded-md p-3 transition-colors ${
                      isActive
                        ? "bg-[#2776AB] text-white"
                        : "text-[#1e1e1e] hover:bg-gray-200"
                    } ${isCollapsed ? "justify-center" : "gap-3"}`
                  }
                >
                  <link.icon color="#1e1e1e" className="h-5 w-5" />
                  {!isCollapsed && (
                    <span className="text-black">{link.title}</span>
                  )}
                </NavLink>
              </div>
            ))}
          </nav>
        </div>
      </TooltipProvider>
    </aside>
  );
}
