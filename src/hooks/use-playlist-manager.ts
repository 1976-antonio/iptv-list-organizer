
import { useState } from "react";
import { IPTVPlaylist, IPTVChannel } from "@/types/iptv";
import { parseM3U, generateM3U } from "@/utils/m3uParser";
import { useToast } from "@/hooks/use-toast";
import { useStorage } from "@/hooks/use-storage";
import { v4 as uuidv4 } from "uuid";

export function usePlaylistManager() {
  const { toast } = useToast();
  // Use our custom storage hook instead of direct localStorage
  const [playlists, setPlaylists] = useStorage<IPTVPlaylist[]>("iptv-playlists", []);
  const [currentPlaylist, setCurrentPlaylistState] = useState<IPTVPlaylist | null>(null);

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
