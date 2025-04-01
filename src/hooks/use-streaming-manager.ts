
import { useState, useEffect } from 'react';
import { IPTVChannel, StreamingServer } from '@/types/iptv';
import { getStreamingServers, getRedirectedStreamUrl } from '@/utils/storage';
import { toast } from 'sonner';

export const useStreamingManager = () => {
  const [servers, setServers] = useState<{ [country: string]: StreamingServer[] }>({});
  const [selectedServer, setSelectedServer] = useState<StreamingServer | null>(null);
  const [isRedirectActive, setIsRedirectActive] = useState(false);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);

  // Load available servers on mount
  useEffect(() => {
    const availableServers = getStreamingServers();
    setServers(availableServers);
    setAvailableCountries(Object.keys(availableServers));
    
    // Default to the first available server
    const firstCountry = Object.keys(availableServers)[0];
    if (firstCountry && availableServers[firstCountry].length > 0) {
      const firstOnlineServer = availableServers[firstCountry].find(s => s.status === 'online');
      if (firstOnlineServer) {
        setSelectedServer(firstOnlineServer);
      }
    }
  }, []);

  // Function to select a server
  const selectServer = (serverId: string) => {
    for (const country in servers) {
      const server = servers[country].find(s => s.id === serverId);
      if (server) {
        setSelectedServer(server);
        if (server.status === 'online') {
          toast.success(`Server ${server.name} selezionato`);
        } else {
          toast.warning(`Server ${server.name} non è online`);
        }
        return;
      }
    }
    toast.error('Server non trovato');
  };

  // Function to toggle redirection
  const toggleRedirect = () => {
    if (!selectedServer) {
      toast.error('Nessun server selezionato');
      return;
    }

    if (selectedServer.status !== 'online') {
      toast.error(`Il server ${selectedServer.name} non è online`);
      return;
    }

    setIsRedirectActive(prev => !prev);
    toast.success(isRedirectActive ? 'Redirezione disattivata' : `Redirezione attivata tramite ${selectedServer.name}`);
  };

  // Function to get redirected stream URL
  const getStreamUrl = (channel: IPTVChannel): string => {
    if (!isRedirectActive || !selectedServer || selectedServer.status !== 'online') {
      return channel.url;
    }
    return getRedirectedStreamUrl(channel.url, selectedServer);
  };

  return {
    servers,
    availableCountries,
    selectedServer,
    isRedirectActive,
    selectServer,
    toggleRedirect,
    getStreamUrl
  };
};

