import React, { useState, useEffect } from "react";
import { IPTVChannel } from "@/types/iptv";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, RefreshCw, CheckCircle, XCircle, Circle, Flag, Film, Tv } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface ChannelListProps {
  channels: IPTVChannel[];
  groups: any[];
  countries: any[];
  genres: any[];
  broadcasters: any[];
  selectedChannel: IPTVChannel | null;
  onChannelSelect: (channel: IPTVChannel) => void;
  onTestAllChannels: () => void;
}

const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  groups,
  countries,
  genres,
  broadcasters,
  selectedChannel,
  onChannelSelect,
  onTestAllChannels
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChannels, setFilteredChannels] = useState<IPTVChannel[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryType, setActiveCategoryType] = useState<"group" | "country" | "genre" | "broadcaster" | null>(null);

  useEffect(() => {
    if (!channels) return;
    
    let filtered = channels;
    
    if (searchTerm) {
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (activeCategory && activeCategoryType) {
      switch (activeCategoryType) {
        case "group":
          filtered = filtered.filter(channel => channel.group === activeCategory);
          break;
        case "country":
          filtered = filtered.filter(channel => channel.country === activeCategory);
          break;
        case "genre":
          filtered = filtered.filter(channel => channel.genre === activeCategory);
          break;
        case "broadcaster":
          filtered = filtered.filter(channel => channel.broadcaster === activeCategory);
          break;
      }
    }
    
    setFilteredChannels(filtered);
  }, [channels, searchTerm, activeCategory, activeCategoryType]);

  const handleCategorySelect = (category: string, type: "group" | "country" | "genre" | "broadcaster") => {
    setActiveCategory(category);
    setActiveCategoryType(type);
  };

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

  return (
    <>
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
        <TabsList className="w-full mb-4 flex overflow-x-auto">
          <TabsTrigger value="all" onClick={() => {setActiveCategory(null); setActiveCategoryType(null);}}>
            Tutti
          </TabsTrigger>
          <TabsTrigger value="categories">Categorie</TabsTrigger>
          <TabsTrigger value="countries">Paesi</TabsTrigger>
          <TabsTrigger value="genres">Generi</TabsTrigger>
          <TabsTrigger value="broadcasters">Emittenti</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ScrollArea className="h-[60vh] pr-4">
            {filteredChannels && filteredChannels.length > 0 ? (
              filteredChannels.map((channel) => (
                <div 
                  key={channel.id} 
                  className={`flex items-center p-2 mb-1 rounded-md cursor-pointer ${
                    selectedChannel?.id === channel.id 
                      ? 'bg-primary/10' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => onChannelSelect(channel)}
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
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="text-muted-foreground">
                  Nessun canale trovato
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="categories">
          <ScrollArea className="h-[60vh] pr-4">
            {groups && groups.length > 0 ? (
              groups.map((group) => (
                <div key={group.id} className="mb-4">
                  <div 
                    className="font-medium p-2 cursor-pointer hover:bg-muted rounded-md"
                    onClick={() => handleCategorySelect(group.name, "group")}
                  >
                    {group.name} ({group.channels.length})
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="text-muted-foreground">
                  Nessuna categoria trovata
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="countries">
          <ScrollArea className="h-[60vh] pr-4">
            {countries && countries.length > 0 ? (
              countries.map((country) => (
                <div key={country.id} className="mb-4">
                  <div 
                    className="font-medium p-2 cursor-pointer hover:bg-muted rounded-md flex items-center"
                    onClick={() => handleCategorySelect(country.name, "country")}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {country.name} ({country.channels.length})
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="text-muted-foreground">
                  Nessun paese trovato
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="genres">
          <ScrollArea className="h-[60vh] pr-4">
            {genres && genres.length > 0 ? (
              genres.map((genre) => (
                <div key={genre.id} className="mb-4">
                  <div 
                    className="font-medium p-2 cursor-pointer hover:bg-muted rounded-md flex items-center"
                    onClick={() => handleCategorySelect(genre.name, "genre")}
                  >
                    <Film className="h-4 w-4 mr-2" />
                    {genre.name} ({genre.channels.length})
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="text-muted-foreground">
                  Nessun genere trovato
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="broadcasters">
          <ScrollArea className="h-[60vh] pr-4">
            {broadcasters && broadcasters.length > 0 ? (
              broadcasters.map((broadcaster) => (
                <div key={broadcaster.id} className="mb-4">
                  <div 
                    className="font-medium p-2 cursor-pointer hover:bg-muted rounded-md flex items-center"
                    onClick={() => handleCategorySelect(broadcaster.name, "broadcaster")}
                  >
                    <Tv className="h-4 w-4 mr-2" />
                    {broadcaster.name} ({broadcaster.channels.length})
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="text-muted-foreground">
                  Nessuna emittente trovata
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ChannelList;
