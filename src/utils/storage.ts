
import { IPTVPlaylist } from "@/types/iptv";

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
