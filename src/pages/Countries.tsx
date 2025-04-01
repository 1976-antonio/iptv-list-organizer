
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useIPTV } from "@/context/IPTVContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Flag, Shield } from "lucide-react";
import { VPNState } from "@/types/iptv";
import VPNToggle from "@/components/VPNToggle";
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
  const [filteredCountries, setFilteredCountries] = useState<Array<any>>([]);
  const [selectedCountryIndex, setSelectedCountryIndex] = useState<number | null>(null);
  const [vpnState, setVpnState] = useState<VPNState>({
    enabled: false,
    status: 'disconnected'
  });
  
  useEffect(() => {
    if (!currentPlaylist || !currentPlaylist.countries) {
      setFilteredCountries([]);
      return;
    }
    
    let filtered = [...currentPlaylist.countries];
    
    if (searchTerm) {
      filtered = filtered.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort countries by name
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    setFilteredCountries(filtered);
    
    // Reset selected country when filter changes
    setSelectedCountryIndex(filtered.length > 0 ? 0 : null);
  }, [currentPlaylist, searchTerm]);

  const handleChannelSelect = (channelId: string) => {
    if (!currentPlaylist) return;
    const channel = currentPlaylist.channels.find(c => c.id === channelId);
    if (channel) {
      setSelectedChannel(channel);
    }
  };

  const handleCountrySelect = (index: number) => {
    setSelectedCountryIndex(index);
  };

  const handleVPNChange = (newVpnState: VPNState) => {
    setVpnState(newVpnState);
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

  // Get the selected country safely
  const selectedCountry = selectedCountryIndex !== null && filteredCountries && filteredCountries.length > selectedCountryIndex
    ? filteredCountries[selectedCountryIndex]
    : null;

  // If a country is selected and VPN is enabled, suggest using VPN for that country
  const isVPNRecommendedForCountry = selectedCountry && vpnState.country !== selectedCountry.name;

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6">
        <VPNToggle onVPNChange={handleVPNChange} />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Flag className="h-5 w-5 mr-2" />
              Paesi
              {vpnState.enabled && vpnState.status === 'connected' && (
                <div className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  VPN attivo: {vpnState.country}
                </div>
              )}
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
                  {filteredCountries && filteredCountries.length > 0 ? (
                    filteredCountries.map((country, index) => (
                      <TableRow 
                        key={country.id}
                        className={selectedCountryIndex === index ? "bg-muted cursor-pointer" : "cursor-pointer hover:bg-muted"}
                        onClick={() => handleCountrySelect(index)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {country.name}
                            {vpnState.enabled && vpnState.status === 'connected' && vpnState.country === country.name && (
                              <Shield className="h-3 w-3 ml-2 text-green-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{country.channels ? country.channels.length : 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">Nessun paese trovato</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {selectedCountry ? (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  Canali per {selectedCountry.name}
                  {isVPNRecommendedForCountry && vpnState.enabled && vpnState.status === 'connected' && (
                    <span className="ml-2 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      Il tuo VPN è impostato per {vpnState.country}, non per {selectedCountry.name}
                    </span>
                  )}
                </h3>
                <ScrollArea className="h-[40vh]">
                  {selectedCountry.channels && selectedCountry.channels.length > 0 ? (
                    selectedCountry.channels.map((channelId: string) => {
                      const channel = currentPlaylist.channels.find(c => c.id === channelId);
                      if (!channel) return null;
                      
                      return (
                        <div 
                          key={channelId}
                          className="p-2 cursor-pointer hover:bg-muted rounded-md mb-1"
                          onClick={() => handleChannelSelect(channelId)}
                        >
                          {channel.name}
                          {channel.genre && <span className="ml-2 text-xs text-muted-foreground">({channel.genre})</span>}
                          {channel.broadcaster && <span className="ml-2 text-xs text-muted-foreground">[{channel.broadcaster}]</span>}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Nessun canale trovato per questo paese
                    </div>
                  )}
                </ScrollArea>
              </div>
            ) : (
              filteredCountries && filteredCountries.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Seleziona un paese per vedere i canali
                  </h3>
                </div>
              ) : null
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Countries;
