
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useIPTV } from "@/context/IPTVContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Settings, CheckCircle, XCircle, Circle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const Browse = () => {
  const { currentPlaylist, setSelectedChannel, selectedChannel } = useIPTV();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChannels, setFilteredChannels] = useState<typeof currentPlaylist?.channels>([]);
  
  const [browseType, setBrowseType] = useState("category");
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedBroadcasters, setSelectedBroadcasters] = useState<string[]>([]);
  
  // Extract unique values from channels
  const uniqueCategories = currentPlaylist?.groups.map(g => g.name) || [];
  const uniqueCountries = [...new Set(currentPlaylist?.channels.map(c => c.country).filter(Boolean))] || [];
  const uniqueGenres = [...new Set(currentPlaylist?.channels.map(c => c.genre).filter(Boolean))] || [];
  const uniqueBroadcasters = [...new Set(currentPlaylist?.channels.map(c => c.broadcaster).filter(Boolean))] || [];
  
  useEffect(() => {
    if (!currentPlaylist) return;
    
    // Filter channels based on search term and selected filters
    let filtered = [...currentPlaylist.channels];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(channel => selectedCategories.includes(channel.group));
    }
    
    // Apply country filters
    if (selectedCountries.length > 0) {
      filtered = filtered.filter(channel => channel.country && selectedCountries.includes(channel.country));
    }
    
    // Apply genre filters
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(channel => channel.genre && selectedGenres.includes(channel.genre));
    }
    
    // Apply broadcaster filters
    if (selectedBroadcasters.length > 0) {
      filtered = filtered.filter(channel => channel.broadcaster && selectedBroadcasters.includes(channel.broadcaster));
    }
    
    setFilteredChannels(filtered);
  }, [currentPlaylist, searchTerm, selectedCategories, selectedCountries, selectedGenres, selectedBroadcasters]);
  
  // Toggle selection handlers
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country) 
        : [...prev, country]
    );
  };
  
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };
  
  const toggleBroadcaster = (broadcaster: string) => {
    setSelectedBroadcasters(prev => 
      prev.includes(broadcaster) 
        ? prev.filter(b => b !== broadcaster) 
        : [...prev, broadcaster]
    );
  };
  
  // Function to clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setSelectedGenres([]);
    setSelectedBroadcasters([]);
    setSearchTerm("");
  };
  
  // Status icon helper
  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Circle className="h-4 w-4 text-amber-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };
  
  if (!currentPlaylist) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Nessuna playlist selezionata</h2>
          <p className="text-muted-foreground">
            Per favore carica o seleziona una playlist prima di sfogliare i canali.
          </p>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Sfoglia Canali
              </div>
              <ToggleGroup type="single" value={browseType} onValueChange={(value) => value && setBrowseType(value)}>
                <ToggleGroupItem value="category">Categorie</ToggleGroupItem>
                <ToggleGroupItem value="country">Paesi</ToggleGroupItem>
                <ToggleGroupItem value="genre">Generi</ToggleGroupItem>
                <ToggleGroupItem value="broadcaster">Emittenti</ToggleGroupItem>
              </ToggleGroup>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca canali..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Filtri</CardTitle>
                    {(selectedCategories.length > 0 || selectedCountries.length > 0 || 
                      selectedGenres.length > 0 || selectedBroadcasters.length > 0) && (
                      <button 
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Cancella tutti
                      </button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue={browseType}>
                      <TabsList className="grid grid-cols-4">
                        <TabsTrigger value="category">Categorie</TabsTrigger>
                        <TabsTrigger value="country">Paesi</TabsTrigger>
                        <TabsTrigger value="genre">Generi</TabsTrigger>
                        <TabsTrigger value="broadcaster">Emittenti</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="category" className="mt-4">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-2">
                            {uniqueCategories.map(category => (
                              <div key={category} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`category-${category}`} 
                                  checked={selectedCategories.includes(category)} 
                                  onCheckedChange={() => toggleCategory(category)}
                                />
                                <label 
                                  htmlFor={`category-${category}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {category}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="country" className="mt-4">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-2">
                            {uniqueCountries.map(country => (
                              <div key={country} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`country-${country}`} 
                                  checked={selectedCountries.includes(country)} 
                                  onCheckedChange={() => toggleCountry(country)}
                                />
                                <label 
                                  htmlFor={`country-${country}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {country}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="genre" className="mt-4">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-2">
                            {uniqueGenres.map(genre => (
                              <div key={genre} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`genre-${genre}`} 
                                  checked={selectedGenres.includes(genre)} 
                                  onCheckedChange={() => toggleGenre(genre)}
                                />
                                <label 
                                  htmlFor={`genre-${genre}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {genre}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="broadcaster" className="mt-4">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-2">
                            {uniqueBroadcasters.map(broadcaster => (
                              <div key={broadcaster} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`broadcaster-${broadcaster}`} 
                                  checked={selectedBroadcasters.includes(broadcaster)} 
                                  onCheckedChange={() => toggleBroadcaster(broadcaster)}
                                />
                                <label 
                                  htmlFor={`broadcaster-${broadcaster}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {broadcaster}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedCategories.map(category => (
                        <Badge key={`selected-${category}`} variant="secondary" className="flex gap-1 items-center">
                          {category}
                          <button onClick={() => toggleCategory(category)} className="ml-1 text-xs">&times;</button>
                        </Badge>
                      ))}
                      {selectedCountries.map(country => (
                        <Badge key={`selected-${country}`} variant="secondary" className="flex gap-1 items-center">
                          {country}
                          <button onClick={() => toggleCountry(country)} className="ml-1 text-xs">&times;</button>
                        </Badge>
                      ))}
                      {selectedGenres.map(genre => (
                        <Badge key={`selected-${genre}`} variant="secondary" className="flex gap-1 items-center">
                          {genre}
                          <button onClick={() => toggleGenre(genre)} className="ml-1 text-xs">&times;</button>
                        </Badge>
                      ))}
                      {selectedBroadcasters.map(broadcaster => (
                        <Badge key={`selected-${broadcaster}`} variant="secondary" className="flex gap-1 items-center">
                          {broadcaster}
                          <button onClick={() => toggleBroadcaster(broadcaster)} className="ml-1 text-xs">&times;</button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <div className="bg-background">
                  <div className="text-sm text-muted-foreground mb-2">
                    {filteredChannels.length} canali trovati
                  </div>
                  <ScrollArea className="h-[70vh]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredChannels.map((channel) => (
                        <div 
                          key={channel.id} 
                          className={`flex items-center p-2 rounded-md cursor-pointer border ${
                            selectedChannel?.id === channel.id 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:bg-muted'
                          }`}
                          onClick={() => setSelectedChannel(channel)}
                        >
                          <div className="mr-2">
                            {getStatusIcon(channel.status)}
                          </div>
                          <div className="flex-1 truncate">
                            <div className="font-medium truncate">{channel.name}</div>
                            <div className="text-xs text-muted-foreground flex gap-2 flex-wrap">
                              {channel.group && <span>{channel.group}</span>}
                              {channel.country && <span>• {channel.country}</span>}
                              {channel.genre && <span>• {channel.genre}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filteredChannels.length === 0 && (
                      <div className="text-center p-4 text-muted-foreground">
                        Nessun canale trovato con i filtri selezionati
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Browse;

