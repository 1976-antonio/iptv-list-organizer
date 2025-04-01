
import { IPTVPlaylist } from "@/types/iptv";

const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit for most browsers

// Function to estimate the size of data in bytes
export const estimateSize = (data: any): number => {
  const jsonString = JSON.stringify(data);
  // Each character in a string is approximately 2 bytes in JavaScript
  return jsonString.length * 2;
};

// Function to get current storage usage
export const getStorageUsage = (): { total: number, used: number, available: number } => {
  try {
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
    
    return {
      total: MAX_STORAGE_SIZE,
      used: currentUsage,
      available: MAX_STORAGE_SIZE - currentUsage
    };
  } catch (e) {
    console.error('Error calculating storage usage', e);
    return {
      total: MAX_STORAGE_SIZE,
      used: 0,
      available: MAX_STORAGE_SIZE
    };
  }
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
    // Add storage usage information to each playlist
    const enhancedPlaylists = playlists.map(playlist => {
      return {
        ...playlist,
        storageUsage: getStorageUsage()
      };
    });
    
    // Create optimized version of playlists for storage
    const optimizedPlaylists = enhancedPlaylists.map(playlist => {
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

// Function to create mock streaming servers for different countries
export const getStreamingServers = (): { [country: string]: StreamingServer[] } => {
  return {
    'USA': [
      { id: 'usa-1', country: 'USA', name: 'New York Server', url: 'https://usa-proxy1.iptv-org.com', status: 'online', ping: 120 },
      { id: 'usa-2', country: 'USA', name: 'Los Angeles Server', url: 'https://usa-proxy2.iptv-org.com', status: 'online', ping: 150 },
    ],
    'Italia': [
      { id: 'it-1', country: 'Italia', name: 'Milano Server', url: 'https://it-proxy1.iptv-org.com', status: 'online', ping: 45 },
      { id: 'it-2', country: 'Italia', name: 'Roma Server', url: 'https://it-proxy2.iptv-org.com', status: 'offline', ping: 60 },
    ],
    'UK': [
      { id: 'uk-1', country: 'UK', name: 'London Server', url: 'https://uk-proxy1.iptv-org.com', status: 'online', ping: 85 },
    ],
    'Germania': [
      { id: 'de-1', country: 'Germania', name: 'Berlin Server', url: 'https://de-proxy1.iptv-org.com', status: 'busy', ping: 90 },
    ],
    'Francia': [
      { id: 'fr-1', country: 'Francia', name: 'Paris Server', url: 'https://fr-proxy1.iptv-org.com', status: 'online', ping: 75 },
    ],
    'Spagna': [
      { id: 'es-1', country: 'Spagna', name: 'Madrid Server', url: 'https://es-proxy1.iptv-org.com', status: 'online', ping: 95 },
    ]
  };
};

// Function to redirect streaming through a proxy server
export const getRedirectedStreamUrl = (originalUrl: string, proxyServer: StreamingServer): string => {
  // In a real implementation, this would encode the URL and pass it through the proxy
  // For this demo, we'll simulate it by appending the server URL
  return `${proxyServer.url}/redirect?stream=${encodeURIComponent(originalUrl)}`;
};

