
import { useState } from "react";
import { IPTVChannel, IPTVPlaylist } from "@/types/iptv";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export function useChannelManager(
  currentPlaylist: IPTVPlaylist | null,
  playlists: IPTVPlaylist[],
  setPlaylists: (value: IPTVPlaylist[] | ((val: IPTVPlaylist[]) => IPTVPlaylist[])) => void
) {
  const { toast } = useToast();
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [isTestingChannel, setIsTestingChannel] = useState(false);

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
    
    // Update selected channel if it's the one being updated
    if (selectedChannel && selectedChannel.id === channelId) {
      const updatedChannel = { ...selectedChannel, ...updates };
      setSelectedChannel(updatedChannel);
    }
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
    
    // If the deleted channel was selected, deselect it
    if (selectedChannel && selectedChannel.id === channelId) {
      setSelectedChannel(null);
    }
    
    toast({
      title: "Canale Eliminato",
      description: "Il canale è stato eliminato dalla playlist"
    });
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
    
    toast({
      title: "Canale Aggiunto",
      description: `Il canale "${newChannel.name}" è stato aggiunto alla playlist`
    });
  };

  return {
    selectedChannel,
    setSelectedChannel,
    isTestingChannel,
    setIsTestingChannel,
    updateChannel,
    deleteChannel,
    addChannel
  };
}
