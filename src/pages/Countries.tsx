
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useIPTV } from "@/context/IPTVContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Flag } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";

const Countries = () => {
  const { currentPlaylist, setSelectedChannel } = useIPTV();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCountries, setFilteredCountries] = useState<any[]>([]); // Initialize as empty array
  
  useEffect(() => {
    if (!currentPlaylist) return;
    
    let filtered = [...currentPlaylist.countries];
    
    if (searchTerm) {
      filtered = filtered.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort countries by name
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    setFilteredCountries(filtered);
  }, [currentPlaylist, searchTerm]);

  const handleChannelSelect = (channelId: string) => {
    if (!currentPlaylist) return;
    const channel = currentPlaylist.channels.find(c => c.id === channelId);
    if (channel) {
      setSelectedChannel(channel);
    }
  };

  if (!currentPlaylist) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-12">
          <h1 className="text-3xl font-bold mb-8 text-center">Nessuna playlist selezionata</h1>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Flag className="h-5 w-5 mr-2" />
              Paesi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca paesi..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paese</TableHead>
                    <TableHead className="text-right">Canali</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCountries.map((country) => (
                    <TableRow key={country.id}>
                      <TableCell className="font-medium">{country.name}</TableCell>
                      <TableCell className="text-right">{country.channels.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredCountries.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">
                  Canali per {filteredCountries[0].name}
                </h3>
                <ScrollArea className="h-[40vh]">
                  {filteredCountries[0].channels.map((channelId) => {
                    const channel = currentPlaylist.channels.find(c => c.id === channelId);
                    if (!channel) return null;
                    
                    return (
                      <div 
                        key={channelId}
                        className="p-2 cursor-pointer hover:bg-muted rounded-md mb-1"
                        onClick={() => handleChannelSelect(channelId)}
                      >
                        {channel.name}
                      </div>
                    );
                  })}
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Countries;
