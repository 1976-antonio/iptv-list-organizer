
import { IPTVPlaylist, StreamingServer } from "@/types/iptv";

const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit for most browsers

// Function to estimate the size of data in bytes
export const estimateSize = (data: any): number => {
  const jsonString = JSON.stringify(data);
  // Each character in a string is approximately 2 bytes in JavaScript
  return jsonString.length * 2;
};

// Function to check if adding data would exceed storage limits
export const wouldExceedQuota = (key: string, data: any): boolean => {
  try {
    const dataSize = estimateSize(data);
    
    // Check current usage
    let currentUsage = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const itemKey = localStorage.key(i);
      if (itemKey) {
        const item = localStorage.getItem(itemKey);
        if (item) {
          currentUsage += item.length * 2;
        }
      }
    }
    
    // Check if the new data (minus the size of existing data with the same key) would exceed the limit
    const existingItemSize = localStorage.getItem(key)?.length * 2 || 0;
    return (currentUsage - existingItemSize + dataSize) > MAX_STORAGE_SIZE;
  } catch (e) {
    console.error('Error checking storage quota', e);
    return true; // Assume it would exceed if we can't check
  }
};

// Function to safely store playlists with size limits
export const safelyStorePlaylist = (playlists: IPTVPlaylist[]): { success: boolean, message?: string } => {
  try {
    // Create optimized version of playlists for storage
    const optimizedPlaylists = playlists.map(playlist => {
      // Start with a reasonable channel limit
      let channelLimit = 500;
      let optimizedPlaylist = { ...playlist };
      
      // Progressively reduce channels until it fits
      while (channelLimit > 0) {
        // If we need to limit channels
        if (playlist.channels.length > channelLimit) {
          optimizedPlaylist = {
            ...playlist,
            channels: playlist.channels.slice(0, channelLimit)
          };
        }
        
        // Check if it would fit
        if (!wouldExceedQuota("iptv-playlists", [optimizedPlaylist])) {
          break;
        }
        
        // Reduce the limit and try again
        channelLimit = Math.floor(channelLimit * 0.7);
      }
      
      return optimizedPlaylist;
    });
    
    // Try to store the optimized playlists
    localStorage.setItem("iptv-playlists", JSON.stringify(optimizedPlaylists));
    
    // Check if we had to reduce channels
    const totalOriginalChannels = playlists.reduce((sum, p) => sum + p.channels.length, 0);
    const totalStoredChannels = optimizedPlaylists.reduce((sum, p) => sum + p.channels.length, 0);
    
    if (totalStoredChannels < totalOriginalChannels) {
      return { 
        success: true, 
        message: `Alcune playlist sono state ottimizzate per lo spazio (${totalStoredChannels}/${totalOriginalChannels} canali)` 
      };
    }
    
    return { success: true };
  } catch (e) {
    console.error('Failed to save playlists', e);
    return { 
      success: false, 
      message: 'Impossibile salvare le playlist. Spazio di archiviazione insufficiente.' 
    };
  }
};

// Function to safely store streaming servers with size limits
export const safelyStoreServers = (servers: StreamingServer[]): { success: boolean, message?: string } => {
  try {
    // Check if it would exceed quota
    if (wouldExceedQuota("streaming-servers", servers)) {
      // If too large, limit the number of servers
      let serverLimit = servers.length;
      while (serverLimit > 0 && wouldExceedQuota("streaming-servers", servers.slice(0, serverLimit))) {
        serverLimit = Math.floor(serverLimit * 0.7);
      }
      
      if (serverLimit === 0) {
        return {
          success: false,
          message: 'Impossibile salvare i server. Spazio di archiviazione insufficiente.'
        };
      }
      
      // Store the limited servers
      localStorage.setItem("streaming-servers", JSON.stringify(servers.slice(0, serverLimit)));
      
      return {
        success: true,
        message: `Solo ${serverLimit} server sono stati salvati a causa di limiti di spazio.`
      };
    }
    
    // Store all servers if within quota
    localStorage.setItem("streaming-servers", JSON.stringify(servers));
    return { success: true };
  } catch (e) {
    console.error('Failed to save streaming servers', e);
    return {
      success: false,
      message: 'Impossibile salvare i server. Errore durante il salvataggio.'
    };
  }
};

// Add a route to App.tsx
<lov-write file_path="src/App.tsx">
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IPTVProvider } from "./context/IPTVContext";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Countries from "./pages/Countries"; 
import Browse from "./pages/Browse";
import TestStream from "./pages/TestStream";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <IPTVProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/test" element={<TestStream />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </IPTVProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
