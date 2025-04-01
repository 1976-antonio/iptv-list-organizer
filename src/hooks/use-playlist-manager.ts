
import { useState } from "react";
import { IPTVPlaylist, IPTVChannel } from "@/types/iptv";
import { parseM3U, generateM3U } from "@/utils/m3uParser";
import { useToast } from "@/hooks/use-toast";
import { useStorage } from "@/hooks/use-storage";
import { v4 as uuidv4 } from "uuid";
import { getStorageUsage } from "@/utils/storage";

export function usePlaylistManager() {
  const { toast } = useToast();
  // Use our custom storage hook instead of direct localStorage
  const [playlists, setPlaylists] = useStorage<IPTVPlaylist[]>("iptv-playlists", []);
  const [currentPlaylist, setCurrentPlaylistState] = useState<IPTVPlaylist | null>(null);

  // Helper function to extract and organize countries from channels
  const extractCountries = (channels: IPTVChannel[]) => {
    const countriesMap = new Map();
    
    channels.forEach(channel => {
      if (channel.country) {
        const countryId = channel.country.toLowerCase().replace(/\s+/g, '-');
        
        if (!countriesMap.has(countryId)) {
          countriesMap.set(countryId, {
            id: countryId,
            name: channel.country,
            code: countryId.substring(0, 2), // Simple 2-letter code
            channels: []
          });
        }
        
        countriesMap.get(countryId).channels.push(channel.id);
      }
    });
    
    return Array.from(countriesMap.values());
  };
  
  // Helper function to extract and organize genres from channels
  const extractGenres = (channels: IPTVChannel[]) => {
    const genresMap = new Map();
    
    channels.forEach(channel => {
      if (channel.genre) {
        const genreId = channel.genre.toLowerCase().replace(/\s+/g, '-');
        
        if (!genresMap.has(genreId)) {
          genresMap.set(genreId, {
            id: genreId,
            name: channel.genre,
            channels: []
          });
        }
        
        genresMap.get(genreId).channels.push(channel.id);
      }
    });
    
    return Array.from(genresMap.values());
  };
  
  // Helper function to extract and organize broadcasters from channels
  const extractBroadcasters = (channels: IPTVChannel[]) => {
    const broadcastersMap = new Map();
    
    channels.forEach(channel => {
      if (channel.broadcaster) {
        const broadcasterId = channel.broadcaster.toLowerCase().replace(/\s+/g, '-');
        
        if (!broadcastersMap.has(broadcasterId)) {
          broadcastersMap.set(broadcasterId, {
            id: broadcasterId,
            name: channel.broadcaster,
            channels: []
          });
        }
        
        broadcastersMap.get(broadcasterId).channels.push(channel.id);
      }
    });
    
    return Array.from(broadcastersMap.values());
  };

  const addPlaylist = (name: string, content: string) => {
    try {
      const parsedPlaylist = parseM3U(content);
      parsedPlaylist.name = name;
      
      // Extract additional metadata
      parsedPlaylist.countries = extractCountries(parsedPlaylist.channels);
      parsedPlaylist.genres = extractGenres(parsedPlaylist.channels);
      parsedPlaylist.broadcasters = extractBroadcasters(parsedPlaylist.channels);
      
      // Add storage usage information
      parsedPlaylist.storageUsage = getStorageUsage();
      
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

  const exportPlaylist = (playlistId: string): string => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return "";
    
    return generateM3U(playlist);
  };

  return {
    playlists,
    currentPlaylist,
    addPlaylist,
    setCurrentPlaylist,
    setPlaylists,
    exportPlaylist
  };
}

