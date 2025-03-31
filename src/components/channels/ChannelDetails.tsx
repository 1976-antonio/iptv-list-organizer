
import React from "react";
import { IPTVChannel, VPNState } from "@/types/iptv";
import { RefreshCw, CheckCircle, XCircle, Circle, Flag, Film, Tv, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ChannelDetailsProps {
  channel: IPTVChannel | null;
  vpnState: VPNState;
  onTestChannel: (channel: IPTVChannel) => void;
}

const ChannelDetails: React.FC<ChannelDetailsProps> = ({
  channel,
  vpnState,
  onTestChannel
}) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  // Function to get stream URL with VPN if enabled
  const getStreamUrl = (url: string): string => {
    if (!vpnState.enabled || vpnState.status !== 'connected') {
      return url;
    }
    
    // In a real app, this would route through an actual proxy
    // For demo purposes, we'll just add a parameter to indicate VPN is in use
    return url + (url.includes('?') ? '&' : '?') + 'vpn=true';
  };

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">
          Seleziona un canale dalla lista per visualizzarne i dettagli
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Gruppo: {channel.group}
          </div>
          {channel.country && (
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <Flag className="h-3 w-3 mr-1" />
              Paese: {channel.country}
            </div>
          )}
          {channel.genre && (
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <Film className="h-3 w-3 mr-1" />
              Genere: {channel.genre}
            </div>
          )}
          {channel.broadcaster && (
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <Tv className="h-3 w-3 mr-1" />
              Emittente: {channel.broadcaster}
            </div>
          )}
          <div className="flex items-center mt-1">
            {getStatusIcon(channel.status)}
            <span className="ml-1 text-sm">
              {channel.status === 'online' ? 'Online' : 
               channel.status === 'offline' ? 'Offline' : 
               channel.status === 'testing' ? 'Testing...' : 'Non testato'}
            </span>
          </div>
        </div>
        <Button 
          onClick={() => onTestChannel(channel)}
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
          {channel.url}
          {vpnState.enabled && vpnState.status === 'connected' && (
            <span className="inline-flex items-center ml-2 text-green-600">
              <Shield className="h-3 w-3 mr-1" /> VPN Protected
            </span>
          )}
        </div>
      </div>
      
      {channel.logo && (
        <div className="mt-2">
          <div className="text-sm font-medium mb-1">Logo:</div>
          <img 
            src={channel.logo} 
            alt={`${channel.name} logo`} 
            className="h-16 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <Separator />
      
      <div>
        <div className="text-sm font-medium mb-2 flex items-center">
          Anteprima:
          {vpnState.enabled && vpnState.status === 'connected' && (
            <span className="inline-flex items-center ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <Shield className="h-3 w-3 mr-1" /> VPN attivo
            </span>
          )}
        </div>
        <div className="video-container bg-black rounded-md">
          <video 
            src={getStreamUrl(channel.url)}
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
