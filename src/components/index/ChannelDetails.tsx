
import React from "react";
import { IPTVChannel } from "@/types/iptv";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Flag } from "lucide-react";

interface ChannelDetailsProps {
  selectedChannel: IPTVChannel;
  testChannel: (channel: IPTVChannel) => Promise<boolean>;
  getStreamUrl: (url: string) => string;
  selectedServer: any;
}

const getStatusIcon = (status: string | undefined) => {
  switch (status) {
    case 'online':
      return <span className="text-green-500">Online</span>;
    case 'offline':
      return <span className="text-red-500">Offline</span>;
    case 'testing':
      return <span className="text-amber-500">Testing...</span>;
    default:
      return <span className="text-gray-400">Non testato</span>;
  }
};

const ChannelDetails: React.FC<ChannelDetailsProps> = ({
  selectedChannel,
  testChannel,
  getStreamUrl,
  selectedServer
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Gruppo: {selectedChannel.group}
          </div>
          {selectedChannel.country && (
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <Flag className="h-3 w-3 mr-1" />
              Paese: {selectedChannel.country}
            </div>
          )}
          <div className="flex items-center mt-1">
            {getStatusIcon(selectedChannel.status)}
          </div>
        </div>
        <Button 
          onClick={() => testChannel(selectedChannel)}
          variant="outline" 
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Test
        </Button>
      </div>
      
      <Separator />
      
      <div>
        <div className="text-sm font-medium mb-1">Stream URL:</div>
        <div className="p-2 bg-muted rounded-md text-xs break-all">
          {selectedServer ? (
            <>
              <div className="mb-1">Originale: {selectedChannel.url}</div>
              <div className="font-medium">Rediretta: {getStreamUrl(selectedChannel.url)}</div>
            </>
          ) : (
            selectedChannel.url
          )}
        </div>
      </div>
      
      {selectedChannel.logo && (
        <div className="mt-2">
          <div className="text-sm font-medium mb-1">Logo:</div>
          <img 
            src={selectedChannel.logo} 
            alt={`${selectedChannel.name} logo`} 
            className="h-16 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <Separator />
      
      <div>
        <div className="text-sm font-medium mb-2">Anteprima:</div>
        <div className="video-container bg-black rounded-md">
          <video 
            src={selectedServer ? getStreamUrl(selectedChannel.url) : selectedChannel.url}
            controls
            autoPlay
            className="w-full h-full"
            onError={(e) => {
              const video = e.currentTarget;
              video.poster = "/placeholder.svg";
            }}
          >
            Il tuo browser non supporta la riproduzione video.
          </video>
        </div>
      </div>
    </div>
  );
};

export default ChannelDetails;
