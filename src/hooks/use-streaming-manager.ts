
import { useState, useEffect } from "react";
import { StreamingServer } from "@/types/iptv";
import { useStorage } from "@/hooks/use-storage";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export function useStreamingManager() {
  const { toast } = useToast();
  const [servers, setServers] = useStorage<StreamingServer[]>("iptv-streaming-servers", [
    {
      id: uuidv4(),
      name: "Server USA",
      url: "https://usa-proxy.example.com/stream/",
      location: "USA",
      isActive: true
    },
    {
      id: uuidv4(),
      name: "Server Europa",
      url: "https://eu-proxy.example.com/stream/",
      location: "Europa",
      isActive: false
    }
  ]);
  const [selectedServer, setSelectedServer] = useState<StreamingServer | null>(null);

  // Select the active server on initial load
  useEffect(() => {
    const activeServer = servers.find(server => server.isActive);
    if (activeServer) {
      setSelectedServer(activeServer);
    } else if (servers.length > 0) {
      // If no active server, set the first one as active
      const updatedServers = servers.map((server, index) => ({
        ...server,
        isActive: index === 0
      }));
      setServers(updatedServers);
      setSelectedServer(updatedServers[0]);
    }
  }, []);

  const addServer = (server: Omit<StreamingServer, 'id'>) => {
    const newServer = {
      ...server,
      id: uuidv4()
    };

    setServers(prev => [...prev, newServer]);
    
    toast({
      title: "Server Aggiunto",
      description: `Il server "${server.name}" è stato aggiunto con successo`
    });
    
    return newServer;
  };

  const updateServer = (id: string, updates: Partial<StreamingServer>) => {
    const updatedServers = servers.map(server => {
      if (server.id === id) {
        return { ...server, ...updates };
      }
      return server;
    });
    
    setServers(updatedServers);
    
    // Update selected server if it's the one being updated
    if (selectedServer && selectedServer.id === id) {
      setSelectedServer({ ...selectedServer, ...updates });
    }
    
    toast({
      title: "Server Aggiornato",
      description: `Il server è stato aggiornato con successo`
    });
  };

  const deleteServer = (id: string) => {
    const updatedServers = servers.filter(server => server.id !== id);
    setServers(updatedServers);
    
    // If the deleted server was selected, select the first available server
    if (selectedServer && selectedServer.id === id) {
      setSelectedServer(updatedServers.length > 0 ? updatedServers[0] : null);
    }
    
    toast({
      title: "Server Eliminato",
      description: `Il server è stato eliminato con successo`
    });
  };

  const setActiveServer = (id: string) => {
    const updatedServers = servers.map(server => ({
      ...server,
      isActive: server.id === id
    }));
    
    setServers(updatedServers);
    
    const newActiveServer = updatedServers.find(server => server.id === id);
    if (newActiveServer) {
      setSelectedServer(newActiveServer);
    }
    
    toast({
      title: "Server Attivato",
      description: `Il server "${newActiveServer?.name}" è ora attivo`
    });
  };

  const getStreamUrl = (originalUrl: string) => {
    if (!selectedServer) return originalUrl;
    
    // Replace the domain or add proxy prefix based on the server configuration
    // This is a simple example, in real scenarios you might need more complex URL manipulation
    try {
      const url = new URL(originalUrl);
      return `${selectedServer.url}${encodeURIComponent(originalUrl)}`;
    } catch (e) {
      console.error("Invalid URL", e);
      return originalUrl;
    }
  };

  return {
    servers,
    selectedServer,
    addServer,
    updateServer,
    deleteServer,
    setActiveServer,
    getStreamUrl
  };
}
