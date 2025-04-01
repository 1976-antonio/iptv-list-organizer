
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Home, 
  ListFilter, 
  Flag, 
  Settings, 
  Play, 
  Menu, 
  Server, 
  List
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

const AppSidebar = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, toggleSidebar } = useMobile();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const links = [
    { name: "Home", icon: <Home className="h-5 w-5" />, path: "/" },
    { name: "Sfoglia", icon: <List className="h-5 w-5" />, path: "/browse" },
    { name: "Categorie", icon: <ListFilter className="h-5 w-5" />, path: "/categories" },
    { name: "Paesi", icon: <Flag className="h-5 w-5" />, path: "/countries" },
    { name: "Test Stream", icon: <Play className="h-5 w-5" />, path: "/test" },
    { name: "Server", icon: <Server className="h-5 w-5" />, path: "/servers" },
    { name: "Impostazioni", icon: <Settings className="h-5 w-5" />, path: "/settings" },
  ];

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {!collapsed && <h1 className="text-xl font-semibold">IPTV Manager</h1>}
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {links.map((link) => (
            <Button
              key={link.path}
              variant={isActive(link.path) ? "secondary" : "ghost"}
              className={cn(
                "justify-start",
                collapsed ? "justify-center px-2" : ""
              )}
              onClick={() => navigate(link.path)}
            >
              {link.icon}
              {!collapsed && <span className="ml-2">{link.name}</span>}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AppSidebar;
