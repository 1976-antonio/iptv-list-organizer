
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useIPTV } from "@/context/IPTVContext";
import FileUpload from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the new components
import PlaylistHeader from "@/components/index/PlaylistHeader";
import ChannelSearch from "@/components/index/ChannelSearch";
import ChannelList from "@/components/index/ChannelList";
import CategoryList from "@/components/index/CategoryList";
import CountryList from "@/components/index/CountryList";
import ChannelDetails from "@/components/index/ChannelDetails";

const Index = () => {
  const { 
    currentPlaylist, 
    playlists, 
    setCurrentPlaylist, 
    setSelectedChannel, 
    testAllChannels,
    selectedChannel,
    testChannel,
    getStreamUrl,
    selectedServer
  } = useIPTV();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChannels, setFilteredChannels] = useState<any[]>([]); // Initialize as empty array
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  useEffect(() => {
    if (!currentPlaylist) return;
    
    let filtered = [...currentPlaylist.channels];
    
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

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
  };

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
                  <PlaylistHeader 
                    selectedServer={selectedServer}
                    testAllChannels={testAllChannels}
                    currentPlaylist={currentPlaylist}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChannelSearch 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
                
                <Tabs defaultValue="all">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="all" onClick={() => setActiveCategory(null)}>
                      Tutti
                    </TabsTrigger>
                    <TabsTrigger value="categories">Categorie</TabsTrigger>
                    <TabsTrigger value="countries">Paesi</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <ChannelList 
                      filteredChannels={filteredChannels}
                      selectedChannel={selectedChannel}
                      handleChannelSelect={handleChannelSelect}
                    />
                  </TabsContent>
                  
                  <TabsContent value="categories">
                    {currentPlaylist && (
                      <CategoryList 
                        groups={currentPlaylist.groups}
                        setActiveCategory={setActiveCategory}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="countries">
                    {currentPlaylist && (
                      <CountryList 
                        countries={currentPlaylist.countries}
                        setActiveCategory={setActiveCategory}
                      />
                    )}
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
                  <ChannelDetails 
                    selectedChannel={selectedChannel}
                    testChannel={testChannel}
                    getStreamUrl={getStreamUrl}
                    selectedServer={selectedServer}
                  />
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
