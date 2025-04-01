
import { useState, useEffect } from 'react';
import { safelyStorePlaylist, getStorage, setStorage } from '@/utils/storage';
import { IPTVPlaylist } from '@/types/iptv';
import { useToast } from './use-toast';

// Hook to safely use localStorage with quota handling
export const useStorage = <T>(key: string, initialValue: T) => {
  const { toast } = useToast();
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error loading from localStorage', error);
      return initialValue;
    }
  });

  // Function to safely update storage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for previous state updates
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Special case for playlists to handle quota safely
      if (key === "iptv-playlists" && Array.isArray(valueToStore)) {
        const result = safelyStorePlaylist(valueToStore as IPTVPlaylist[]);
        
        if (!result.success) {
          toast({
            title: "Errore",
            description: result.message || "Impossibile salvare le playlist",
            variant: "destructive"
          });
        } else if (result.message) {
          toast({
            title: "Avviso",
            description: result.message,
            variant: "default"
          });
        }
      } else {
        // For other types of data, try storing directly
        try {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error('Error saving to localStorage', error);
          toast({
            title: "Errore",
            description: "Impossibile salvare i dati. Spazio di archiviazione insufficiente.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error setting localStorage value', error);
    }
  };

  return [storedValue, setValue] as const;
};
