import { IPTVPlaylist, StreamingServer } from "@/types/iptv";

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
