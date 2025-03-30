
import React, { createContext, useContext, useState, useEffect } from "react";
import { IPTVChannel, IPTVGroup, IPTVPlaylist } from "@/types/iptv";
import { parseM3U, generateM3U } from "@/utils/m3uParser";
import { useToast } from "@/hooks/use-toast";
import { useStorage } from "@/hooks/use-storage";
import { v4 as uuidv4 } from "uuid";

interface IPTVContextProps {
  playlists: IPTVPlaylist[];
  currentPlaylist: IPTVPlaylist | null;
  selectedChannel: IPTVChannel | null;
  isTestingChannel: boolean;
  addPlaylist: (name: string, content: string) => void;
  setCurrentPlaylist: (id: string) => void;
  setSelectedChannel: (channel: IPTVChannel | null) => void;
  testChannel: (channel: IPTVChannel) => Promise<boolean>;
  testAllChannels: () => Promise<void>;
  deleteChannel: (channelId: string) => void;
  exportPlaylist: (playlistId: string) => string;
  updateChannel: (channelId: string, updates: Partial<IPTVChannel>) => void;
  addChannel: (channel: Omit<IPTVChannel, "id">) => void;
}

const IPTVContext = createContext<IPTVContextProps | undefined>(undefined);

export const IPTVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  // Use our custom storage hook instead of direct localStorage
  const [playlists, setPlaylists] = useStorage<IPTVPlaylist[]>("iptv-playlists", []);
  const [currentPlaylist, setCurrentPlaylistState] = useState<IPTVPlaylist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [isTestingChannel, setIsTestingChannel] = useState(false);

  // Set the first playlist as current if available on mount or when playlists change
  useEffect(() => {
    if (playlists.length > 0 && !currentPlaylist) {
      setCurrentPlaylistState(playlists[0]);
    }
  }, [playlists, currentPlaylist]);

  const addPlaylist = (name: string, content: string) => {
    try {
      const parsedPlaylist = parseM3U(content);
      parsedPlaylist.name = name;
      
      // Limit size if needed to avoid quota issues
      if (parsedPlaylist.channels.length > 500) {
        toast({
          title: "Avviso",
          description: `La playlist contiene molti canali (${parsedPlaylist.channels.length}). Alcuni potrebbero non essere salvati per limiti di spazio.`
        });
      }
      
      setPlaylists(prev => [...prev, parsedPlaylist]);
      setCurrentPlaylistState(parsedPlaylist);
      
      toast({
        title: "Playlist Aggiunta",
        description: `La playlist "${name}" è stata aggiunta con successo`
      });
    } catch (e) {
      console.error("Failed to parse M3U content", e);
      toast({
        title: "Errore",
        description: "Impossibile analizzare il contenuto M3U",
        variant: "destructive"
      });
    }
  };

  const setCurrentPlaylist = (id: string) => {
    const playlist = playlists.find(p => p.id === id);
    if (playlist) {
      setCurrentPlaylistState(playlist);
    }
  };

  const testChannel = async (channel: IPTVChannel): Promise<boolean> => {
    setIsTestingChannel(true);
    
    // Create a simple test by trying to load the stream
    try {
      const response = await fetch(channel.url, { method: 'HEAD', mode: 'no-cors' });
      
      // Update the channel's status
      updateChannel(channel.id, {
        status: 'online',
        lastChecked: new Date()
      });
      
      setIsTestingChannel(false);
      return true;
    } catch (e) {
      // Update the channel's status
      updateChannel(channel.id, {
        status: 'offline',
        lastChecked: new Date()
      });
      
      setIsTestingChannel(false);
      return false;
    }
  };

  const testAllChannels = async () => {
    if (!currentPlaylist) return;
    
    toast({
      title: "Test Avviato",
      description: "Test di tutti i canali in corso..."
    });
    
    let successCount = 0;
    let failCount = 0;
    
    // Test only a reasonable number of channels to avoid browser limitations
    const channelsToTest = currentPlaylist.channels.slice(0, 100);
    if (currentPlaylist.channels.length > 100) {
      toast({
        title: "Avviso",
        description: `Verranno testati solo i primi 100 canali su ${currentPlaylist.channels.length}`
      });
    }
    
    for (const channel of channelsToTest) {
      try {
        const isOnline = await testChannel(channel);
        if (isOnline) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }
    
    toast({
      title: "Test Completato",
      description: `Online: ${successCount}, Offline: ${failCount}`
    });
  };

  const deleteChannel = (channelId: string) => {
    if (!currentPlaylist) return;
    
    // Create updated playlists with the channel removed
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === currentPlaylist.id) {
        // Remove the channel from the channels array
        const updatedChannels = playlist.channels.filter(c => c.id !== channelId);
        
        // Remove the channel from any groups
        const updatedGroups = playlist.groups.map(group => ({
          ...group,
          channels: group.channels.filter(id => id !== channelId)
        }));
        
        return {
          ...playlist,
          channels: updatedChannels,
          groups: updatedGroups
        };
      }
      return playlist;
    });
    
    setPlaylists(updatedPlaylists);
    
    // Update current playlist
    const updatedCurrentPlaylist = updatedPlaylists.find(p => p.id === currentPlaylist.id);
    if (updatedCurrentPlaylist) {
      setCurrentPlaylistState(updatedCurrentPlaylist);
    }
    
    // If the deleted channel was selected, deselect it
    if (selectedChannel && selectedChannel.id === channelId) {
      setSelectedChannel(null);
    }
    
    toast({
      title: "Canale Eliminato",
      description: "Il canale è stato eliminato dalla playlist"
    });
  };

  const exportPlaylist = (playlistId: string): string => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return "";
    
    return generateM3U(playlist);
  };

  const updateChannel = (channelId: string, updates: Partial<IPTVChannel>) => {
    if (!currentPlaylist) return;
    
    // Create updated playlists with the channel updated
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === currentPlaylist.id) {
        const updatedChannels = playlist.channels.map(channel => {
          if (channel.id === channelId) {
            return { ...channel, ...updates };
          }
          return channel;
        });
        
        return { ...playlist, channels: updatedChannels };
      }
      return playlist;
    });
    
    setPlaylists(updatedPlaylists);
    
    // Update current playlist
    const updatedCurrentPlaylist = updatedPlaylists.find(p => p.id === currentPlaylist.id);
    if (updatedCurrentPlaylist) {
      setCurrentPlaylistState(updatedCurrentPlaylist);
    }
    
    // Update selected channel if it's the one being updated
    if (selectedChannel && selectedChannel.id === channelId) {
      const updatedChannel = { ...selectedChannel, ...updates };
      setSelectedChannel(updatedChannel);
    }
  };

  const addChannel = (channel: Omit<IPTVChannel, "id">) => {
    if (!currentPlaylist) return;
    
    const newChannel: IPTVChannel = {
      ...channel,
      id: uuidv4(),
      status: 'unknown'
    };
    
    // Add the channel to the current playlist
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === currentPlaylist.id) {
        // Add the channel to the channels array
        const updatedChannels = [...playlist.channels, newChannel];
        
        // Add the channel to its group
        const updatedGroups = playlist.groups.map(group => {
          if (group.name === newChannel.group) {
            return {
              ...group,
              channels: [...group.channels, newChannel.id]
            };
          }
          return group;
        });
        
        // Create new group if it doesn't exist
        const groupExists = updatedGroups.some(g => g.name === newChannel.group);
        if (!groupExists) {
          updatedGroups.push({
            id: uuidv4(),
            name: newChannel.group,
            channels: [newChannel.id]
          });
        }
        
        return {
          ...playlist,
          channels: updatedChannels,
          groups: updatedGroups
        };
      }
      return playlist;
    });
    
    setPlaylists(updatedPlaylists);
    
    // Update current playlist
    const updatedCurrentPlaylist = updatedPlaylists.find(p => p.id === currentPlaylist.id);
    if (updatedCurrentPlaylist) {
      setCurrentPlaylistState(updatedCurrentPlaylist);
    }
    
    toast({
      title: "Canale Aggiunto",
      description: `Il canale "${newChannel.name}" è stato aggiunto alla playlist`
    });
  };

  return (
    <IPTVContext.Provider
      value={{
        playlists,
        currentPlaylist,
        selectedChannel,
        isTestingChannel,
        addPlaylist,
        setCurrentPlaylist,
        setSelectedChannel,
        testChannel,
        testAllChannels,
        deleteChannel,
        exportPlaylist,
        updateChannel,
        addChannel
      }}
    >
      {children}
    </IPTVContext.Provider>
  );
};

export const useIPTV = () => {
  const context = useContext(IPTVContext);
  if (context === undefined) {
    throw new Error("useIPTV must be used within an IPTVProvider");
  }
  return context;
};
