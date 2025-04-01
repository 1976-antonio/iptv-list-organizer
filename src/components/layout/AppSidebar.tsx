
import React from "react";
import { ListVideo, FolderOpen, Settings, Search, Globe, Server, LibraryBig } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Playlist",
    url: "/",
    icon: ListVideo,
  },
  {
    title: "Categorie",
    url: "/categories",
    icon: FolderOpen,
  },
  {
    title: "Sfoglia",
    url: "/browse",
    icon: LibraryBig,
  },
  {
    title: "Test Stream",
    url: "/test",
    icon: Search,
  },
  {
    title: "Server Streaming",
    url: "/streaming",
    icon: Server,
  },
  {
    title: "Impostazioni",
    url: "/settings",
    icon: Settings,
  },
];

const AppSidebar = () => {
  const location = useLocation();
  
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-6">
        <SidebarTrigger className="flex lg:hidden mb-4" />
        <Link to="/" className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-iptv-primary" />
          <span className="text-xl font-bold">IPTV Organizer</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.url} 
                        className={`flex items-center space-x-2 ${isActive ? 'text-primary font-medium' : ''}`}
                      >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;

