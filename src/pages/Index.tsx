
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useIPTV } from "@/context/IPTVContext";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, RefreshCw, CheckCircle, XCircle, Circle } from "lucide-react";

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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChannels, setFilteredChannels] = useState<typeof currentPlaylist.channels>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  useEffect(() => {
    if (!currentPlaylist) return;
    
    // Update filtered channels whenever the current playlist or search term changes
    let filtered = currentPlaylist.channels;
    
    if (searchTerm) {
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (activeCategory) {
      filtered = filtered.filter(channel => channel.group === activeCategory);
    }
    
    setFilteredChannels(filtered);
  }, [currentPlaylist, searchTerm, activeCategory]);

  // Handler for selecting a channel
  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
  };
  
  // Get status icon based on channel status
  const getStatusIcon = (status) => {
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

  // Show the file upload if no playlists are available
  if (playlists.length === 0) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-12">
          <h1 className="text-3xl font-bold mb-8 text-center">IPTV Lista Organizer</h1>
          <FileUpload />
        </div>
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
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca canali..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Tabs defaultValue="all">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="all" onClick={() => setActiveCategory(null)}>
                      Tutti
                    </TabsTrigger>
                    <TabsTrigger value="categories">Categorie</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <ScrollArea className="h-[60vh] pr-4">
                      {filteredChannels.map((channel) => (
                        <div 
                          key={channel.id} 
                          className={`flex items-center p-2 mb-1 rounded-md cursor-pointer ${
                            selectedChannel?.id === channel.id 
                              ? 'bg-primary/10' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => handleChannelSelect(channel)}
                        >
                          <div className="mr-2">
                            {getStatusIcon(channel.status)}
                          </div>
                          <div className="flex-1 truncate">
                            {channel.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {channel.group}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="categories">
                    <ScrollArea className="h-[60vh] pr-4">
                      {currentPlaylist?.groups.map((group) => (
                        <div key={group.id} className="mb-4">
                          <div 
                            className="font-medium p-2 cursor-pointer hover:bg-muted rounded-md"
                            onClick={() => setActiveCategory(group.name)}
                          >
                            {group.name} ({group.channels.length})
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:w-2/3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">
                  {selectedChannel ? selectedChannel.name : "Seleziona un canale"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedChannel ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Gruppo: {selectedChannel.group}
                        </div>
                        <div className="flex items-center mt-1">
                          {getStatusIcon(selectedChannel.status)}
                          <span className="ml-1 text-sm">
                            {selectedChannel.status === 'online' ? 'Online' : 
                             selectedChannel.status === 'offline' ? 'Offline' : 
                             selectedChannel.status === 'testing' ? 'Testing...' : 'Non testato'}
                          </span>
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
                        {selectedChannel.url}
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
                          src={selectedChannel.url}
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
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-muted-foreground">
                      Seleziona un canale dalla lista per visualizzarne i dettagli
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
