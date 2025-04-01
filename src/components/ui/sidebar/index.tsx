
// Exporting all sidebar components from a single entry point
import { useSidebar, SidebarProvider } from "./sidebar-context"
import { Sidebar, SidebarRail } from "./sidebar"
import { SidebarTrigger } from "./sidebar-trigger"
import { 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarInput, 
  SidebarInset,
  SidebarSeparator 
} from "./sidebar-elements"
import { 
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel 
} from "./sidebar-group"
import { 
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem 
} from "./sidebar-menu"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
