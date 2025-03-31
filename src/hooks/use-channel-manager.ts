
import { useState } from "react";
import { IPTVChannel, IPTVPlaylist, IPTVCountry, IPTVGenre, IPTVBroadcaster } from "@/types/iptv";
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
        
        let updatedCountries = [...playlist.countries];
        let updatedGenres = [...playlist.genres];
        let updatedBroadcasters = [...playlist.broadcasters];
        
        // If the country changed, update the countries list
        if (updates.country && currentPlaylist.channels.find(c => c.id === channelId)?.country !== updates.country) {
          const originalChannel = currentPlaylist.channels.find(c => c.id === channelId);
          
          // Remove from old country
          if (originalChannel?.country) {
            updatedCountries = updatedCountries.map(country => {
              if (country.name === originalChannel.country) {
                return {
                  ...country,
                  channels: country.channels.filter(id => id !== channelId)
                };
              }
              return country;
            });
          }
          
          // Add to new country
          const existingCountry = updatedCountries.find(c => c.name === updates.country);
          if (existingCountry) {
            updatedCountries = updatedCountries.map(country => {
              if (country.name === updates.country) {
                return {
                  ...country,
                  channels: [...country.channels, channelId]
                };
              }
              return country;
            });
          } else {
            // Create new country
            updatedCountries.push({
              id: uuidv4(),
              name: updates.country,
              code: updates.country.substring(0, 2).toLowerCase(),
              channels: [channelId]
            });
          }
        }
        
        // If the genre changed, update the genres list
        if (updates.genre && currentPlaylist.channels.find(c => c.id === channelId)?.genre !== updates.genre) {
          const originalChannel = currentPlaylist.channels.find(c => c.id === channelId);
          
          // Remove from old genre
          if (originalChannel?.genre) {
            updatedGenres = updatedGenres.map(genre => {
              if (genre.name === originalChannel.genre) {
                return {
                  ...genre,
                  channels: genre.channels.filter(id => id !== channelId)
                };
              }
              return genre;
            });
          }
          
          // Add to new genre
          const existingGenre = updatedGenres.find(g => g.name === updates.genre);
          if (existingGenre) {
            updatedGenres = updatedGenres.map(genre => {
              if (genre.name === updates.genre) {
                return {
                  ...genre,
                  channels: [...genre.channels, channelId]
                };
              }
              return genre;
            });
          } else {
            // Create new genre
            updatedGenres.push({
              id: uuidv4(),
              name: updates.genre,
              channels: [channelId]
            });
          }
        }
        
        // If the broadcaster changed, update the broadcasters list
        if (updates.broadcaster && currentPlaylist.channels.find(c => c.id === channelId)?.broadcaster !== updates.broadcaster) {
          const originalChannel = currentPlaylist.channels.find(c => c.id === channelId);
          
          // Remove from old broadcaster
          if (originalChannel?.broadcaster) {
            updatedBroadcasters = updatedBroadcasters.map(broadcaster => {
              if (broadcaster.name === originalChannel.broadcaster) {
                return {
                  ...broadcaster,
                  channels: broadcaster.channels.filter(id => id !== channelId)
                };
              }
              return broadcaster;
            });
          }
          
          // Add to new broadcaster
          const existingBroadcaster = updatedBroadcasters.find(b => b.name === updates.broadcaster);
          if (existingBroadcaster) {
            updatedBroadcasters = updatedBroadcasters.map(broadcaster => {
              if (broadcaster.name === updates.broadcaster) {
                return {
                  ...broadcaster,
                  channels: [...broadcaster.channels, channelId]
                };
              }
              return broadcaster;
            });
          } else {
            // Create new broadcaster
            updatedBroadcasters.push({
              id: uuidv4(),
              name: updates.broadcaster,
              channels: [channelId]
            });
          }
        }
        
        return { 
          ...playlist, 
          channels: updatedChannels,
          countries: updatedCountries,
          genres: updatedGenres,
          broadcasters: updatedBroadcasters
        };
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
        
        // Remove the channel from any countries
        const updatedCountries = playlist.countries.map(country => ({
          ...country,
          channels: country.channels.filter(id => id !== channelId)
        }));
        
        // Remove the channel from any genres
        const updatedGenres = playlist.genres.map(genre => ({
          ...genre,
          channels: genre.channels.filter(id => id !== channelId)
        }));
        
        // Remove the channel from any broadcasters
        const updatedBroadcasters = playlist.broadcasters.map(broadcaster => ({
          ...broadcaster,
          channels: broadcaster.channels.filter(id => id !== channelId)
        }));
        
        return {
          ...playlist,
          channels: updatedChannels,
          groups: updatedGroups,
          countries: updatedCountries,
          genres: updatedGenres,
          broadcasters: updatedBroadcasters
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
        
        // Add the channel to its country
        let updatedCountries = [...playlist.countries];
        if (newChannel.country) {
          const existingCountry = updatedCountries.find(c => c.name === newChannel.country);
          if (existingCountry) {
            updatedCountries = updatedCountries.map(country => {
              if (country.name === newChannel.country) {
                return {
                  ...country,
                  channels: [...country.channels, newChannel.id]
                };
              }
              return country;
            });
          } else {
            // Create new country
            updatedCountries.push({
              id: uuidv4(),
              name: newChannel.country,
              code: newChannel.country.substring(0, 2).toLowerCase(),
              channels: [newChannel.id]
            });
          }
        } else {
          // Add to Unknown country
          const unknownCountry = updatedCountries.find(c => c.name === "Unknown");
          if (unknownCountry) {
            updatedCountries = updatedCountries.map(country => {
              if (country.name === "Unknown") {
                return {
                  ...country,
                  channels: [...country.channels, newChannel.id]
                };
              }
              return country;
            });
          } else {
            updatedCountries.push({
              id: uuidv4(),
              name: "Unknown",
              code: "unknown",
              channels: [newChannel.id]
            });
          }
        }
        
        // Add the channel to its genre
        let updatedGenres = [...playlist.genres];
        if (newChannel.genre) {
          const existingGenre = updatedGenres.find(g => g.name === newChannel.genre);
          if (existingGenre) {
            updatedGenres = updatedGenres.map(genre => {
              if (genre.name === newChannel.genre) {
                return {
                  ...genre,
                  channels: [...genre.channels, newChannel.id]
                };
              }
              return genre;
            });
          } else {
            // Create new genre
            updatedGenres.push({
              id: uuidv4(),
              name: newChannel.genre,
              channels: [newChannel.id]
            });
          }
        } else {
          // Add to Unknown genre
          const unknownGenre = updatedGenres.find(g => g.name === "Unknown");
          if (unknownGenre) {
            updatedGenres = updatedGenres.map(genre => {
              if (genre.name === "Unknown") {
                return {
                  ...genre,
                  channels: [...genre.channels, newChannel.id]
                };
              }
              return genre;
            });
          } else {
            updatedGenres.push({
              id: uuidv4(),
              name: "Unknown",
              channels: [newChannel.id]
            });
          }
        }
        
        // Add the channel to its broadcaster
        let updatedBroadcasters = [...playlist.broadcasters];
        if (newChannel.broadcaster) {
          const existingBroadcaster = updatedBroadcasters.find(b => b.name === newChannel.broadcaster);
          if (existingBroadcaster) {
            updatedBroadcasters = updatedBroadcasters.map(broadcaster => {
              if (broadcaster.name === newChannel.broadcaster) {
                return {
                  ...broadcaster,
                  channels: [...broadcaster.channels, newChannel.id]
                };
              }
              return broadcaster;
            });
          } else {
            // Create new broadcaster
            updatedBroadcasters.push({
              id: uuidv4(),
              name: newChannel.broadcaster,
              channels: [newChannel.id]
            });
          }
        } else {
          // Add to Unknown broadcaster
          const unknownBroadcaster = updatedBroadcasters.find(b => b.name === "Unknown");
          if (unknownBroadcaster) {
            updatedBroadcasters = updatedBroadcasters.map(broadcaster => {
              if (broadcaster.name === "Unknown") {
                return {
                  ...broadcaster,
                  channels: [...broadcaster.channels, newChannel.id]
                };
              }
              return broadcaster;
            });
          } else {
            updatedBroadcasters.push({
              id: uuidv4(),
              name: "Unknown",
              channels: [newChannel.id]
            });
          }
        }
        
        return {
          ...playlist,
          channels: updatedChannels,
          groups: updatedGroups,
          countries: updatedCountries,
          genres: updatedGenres,
          broadcasters: updatedBroadcasters
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
