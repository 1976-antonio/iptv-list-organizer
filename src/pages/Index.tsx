
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useIPTV } from "@/context/IPTVContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VPNToggle from "@/components/VPNToggle";
import { VPNState } from "@/types/iptv";
import { Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaylistSelection from "@/components/playlist/PlaylistSelection";
import ChannelList from "@/components/channels/ChannelList";
import ChannelDetails from "@/components/channels/ChannelDetails";

const Index = () => {
  const { 
    currentPlaylist, 
    playlists, 
    setCurrentPlaylist, 
    setSelectedChannel, 
    testAllChannels,
    selectedChannel,
    testChannel
  } = useIPTV();
  
  const [vpnState, setVpnState] = useState<VPNState>({
    enabled: false,
    status: 'disconnected'
  });
  
  const handleVPNChange = (newVpnState: VPNState) => {
    setVpnState(newVpnState);
  };

  if (playlists.length === 0) {
    return (
      <AppLayout>
        <PlaylistSelection 
          playlists={playlists}
          onSelectPlaylist={setCurrentPlaylist}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex justify-between items-center">
                  <span>Playlist</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={testAllChannels} 
                    disabled={!currentPlaylist}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentPlaylist && (
                  <ChannelList 
                    channels={currentPlaylist.channels}
                    groups={currentPlaylist.groups}
                    countries={currentPlaylist.countries}
                    genres={currentPlaylist.genres}
                    broadcasters={currentPlaylist.broadcasters}
                    selectedChannel={selectedChannel}
                    onChannelSelect={setSelectedChannel}
                    onTestAllChannels={testAllChannels}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:w-2/3">
            <VPNToggle onVPNChange={handleVPNChange} />
            
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>{selectedChannel ? selectedChannel.name : "Seleziona un canale"}</span>
                  {vpnState.enabled && vpnState.status === 'connected' && (
                    <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <Shield className="h-3 w-3 mr-1" />
                      VPN {vpnState.country}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChannelDetails 
                  channel={selectedChannel}
                  vpnState={vpnState}
                  onTestChannel={testChannel}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
