
import React from "react";
import { IPTVPlaylist } from "@/types/iptv";
import FileUpload from "@/components/FileUpload";

interface PlaylistSelectionProps {
  playlists: IPTVPlaylist[];
  onSelectPlaylist: (id: string) => void;
}

const PlaylistSelection: React.FC<PlaylistSelectionProps> = ({
  playlists,
  onSelectPlaylist
}) => {
  if (!playlists || playlists.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">IPTV Lista Organizer</h1>
        <FileUpload />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <select 
        className="w-full p-2 border rounded-md"
        onChange={(e) => onSelectPlaylist(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Seleziona una playlist</option>
        {playlists.map(playlist => (
          <option key={playlist.id} value={playlist.id}>
            {playlist.name} ({playlist.channels && playlist.channels.length || 0} canali)
          </option>
        ))}
      </select>
    </div>
  );
};

export default PlaylistSelection;
