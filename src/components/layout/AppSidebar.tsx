
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
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

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, toggleSidebar, state } = useSidebar();
  const collapsed = state === "collapsed";
  
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
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center border-b px-4">
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
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="flex-1">
          <SidebarMenu className="flex flex-col gap-1 p-2">
            {links.map((link) => (
              <SidebarMenuItem key={link.path}>
                <SidebarMenuButton
                  variant={isActive(link.path) ? "default" : "outline"}
                  className={cn(
                    "justify-start",
                    collapsed ? "justify-center px-2" : ""
                  )}
                  onClick={() => navigate(link.path)}
                  tooltip={collapsed ? link.name : undefined}
                >
                  {link.icon}
                  {!collapsed && <span className="ml-2">{link.name}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
