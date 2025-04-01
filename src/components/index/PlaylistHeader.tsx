
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Server } from "lucide-react";

interface PlaylistHeaderProps {
  selectedServer: any;
  testAllChannels: () => Promise<void>;
  currentPlaylist: any;
}

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({ 
  selectedServer, 
  testAllChannels,
  currentPlaylist
}) => {
  return (
    <div className="flex justify-between items-center">
      <span>Playlist</span>
      <div className="flex space-x-2">
        {selectedServer && (
          <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-md">
            <Server className="h-3 w-3 mr-1" />
            {selectedServer.name}
          </div>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={testAllChannels} 
          disabled={!currentPlaylist}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Test All
        </Button>
      </div>
    </div>
  );
};

export default PlaylistHeader;
