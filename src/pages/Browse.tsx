
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useIPTV } from "@/context/IPTVContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";

const Browse = () => {
  const { currentPlaylist, setSelectedChannel } = useIPTV();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChannels, setFilteredChannels] = useState<typeof currentPlaylist?.channels | []>([]);
  
  useEffect(() => {
    if (!currentPlaylist) return;
    
    let filtered = [...currentPlaylist.channels];
    
    if (searchTerm) {
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort channels by name
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    setFilteredChannels(filtered);
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
              Tutti i canali
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
            
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome canale</TableHead>
                    <TableHead>Gruppo</TableHead>
                    <TableHead className="hidden md:table-cell">Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChannels && filteredChannels.length > 0 ? filteredChannels.map((channel) => (
                    <TableRow 
                      key={channel.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleChannelSelect(channel.id)}
                    >
                      <TableCell className="font-medium">{channel.name}</TableCell>
                      <TableCell>{channel.group}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {channel.status === 'online' && <span className="text-green-500">Online</span>}
                        {channel.status === 'offline' && <span className="text-red-500">Offline</span>}
                        {(channel.status === 'unknown' || !channel.status) && <span className="text-gray-500">Sconosciuto</span>}
                        {channel.status === 'testing' && <span className="text-yellow-500">In test</span>}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">Nessun canale trovato</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Browse;
