
import { IPTVPlaylist, StreamingServer } from "@/types/iptv";
import { useState, useEffect } from "react";

// Function to get data from local storage
export function getStorage<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error);
    return initialValue;
  }
}

// Function to set data to local storage
export function setStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item ${key} to localStorage:`, error);
  }
}

// Define the storage keys for IPTVPlaylist
export const PLAYLISTS_KEY = "iptv-playlists";

// Define the storage keys for StreamingServer
export const STREAMING_SERVERS_KEY = "iptv-streaming-servers";

// Function to safely store playlists handling quota limits
export function safelyStorePlaylist(playlists: IPTVPlaylist[]) {
  try {
    // Try to save all playlists
    setStorage(PLAYLISTS_KEY, playlists);
    return { success: true };
  } catch (error) {
    console.error("Error storing playlists:", error);
    
    // If we encounter a quota error, try to reduce the size
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Try to save a smaller version by limiting channels per playlist
      try {
        const reducedPlaylists = playlists.map(playlist => {
          if (playlist.channels.length > 200) {
            return {
              ...playlist,
              channels: playlist.channels.slice(0, 200)
            };
          }
          return playlist;
        });
        
        setStorage(PLAYLISTS_KEY, reducedPlaylists);
        return { 
          success: true, 
          message: "Alcune playlist sono state ridotte a causa dei limiti di spazio." 
        };
      } catch (innerError) {
        return { 
          success: false, 
          message: "Impossibile salvare le playlist. Spazio di archiviazione insufficiente." 
        };
      }
    }
    
    return { success: false, message: "Errore nel salvare le playlist." };
  }
}

// Custom hook for using local storage
export function useStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] =
    useState<T>(() => {
      return getStorage(key, initialValue);
    });

  // Update local storage when the value changes
  useEffect(() => {
    setStorage(key, storedValue);
  }, [key, storedValue]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: (value: T | ((val: T) => T)) => void = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      setStorage(key, valueToStore);
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
