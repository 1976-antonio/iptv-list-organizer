
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useStreamingManager } from "@/hooks/use-streaming-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Server, Edit, Trash2, Plus, Globe } from "lucide-react";
import { StreamingServer } from "@/types/iptv";

const Servers = () => {
  const { 
    servers, 
    selectedServer, 
    addServer, 
    updateServer, 
    deleteServer, 
    setActiveServer 
  } = useStreamingManager();
  
  const [newServer, setNewServer] = useState<Omit<StreamingServer, 'id'>>({
    name: "",
    url: "",
    location: "",
    isActive: false
  });
  
  const [editServer, setEditServer] = useState<StreamingServer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const handleAddServer = () => {
    if (!newServer.name || !newServer.url || !newServer.location) return;
    
    addServer(newServer);
    setNewServer({
      name: "",
      url: "",
      location: "",
      isActive: false
    });
    setIsAddDialogOpen(false);
  };
  
  const handleUpdateServer = () => {
    if (!editServer) return;
    
    updateServer(editServer.id, editServer);
    setEditServer(null);
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteServer = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo server?")) {
      deleteServer(id);
    }
  };
  
  const openEditDialog = (server: StreamingServer) => {
    setEditServer(server);
    setIsEditDialogOpen(true);
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Server di Streaming
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Server
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aggiungi Nuovo Server</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input 
                      id="name" 
                      value={newServer.name} 
                      onChange={(e) => setNewServer({...newServer, name: e.target.value})}
                      placeholder="Es. Server USA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input 
                      id="url" 
                      value={newServer.url} 
                      onChange={(e) => setNewServer({...newServer, url: e.target.value})}
                      placeholder="Es. https://proxy.example.com/stream/"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Posizione</Label>
                    <Input 
                      id="location" 
                      value={newServer.location} 
                      onChange={(e) => setNewServer({...newServer, location: e.target.value})}
                      placeholder="Es. Stati Uniti"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">Annulla</Button>
                  </DialogClose>
                  <Button onClick={handleAddServer}>Aggiungi</Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifica Server</DialogTitle>
                </DialogHeader>
                {editServer && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Nome</Label>
                      <Input 
                        id="edit-name" 
                        value={editServer.name} 
                        onChange={(e) => setEditServer({...editServer, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-url">URL</Label>
                      <Input 
                        id="edit-url" 
                        value={editServer.url} 
                        onChange={(e) => setEditServer({...editServer, url: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Posizione</Label>
                      <Input 
                        id="edit-location" 
                        value={editServer.location} 
                        onChange={(e) => setEditServer({...editServer, location: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">Annulla</Button>
                  </DialogClose>
                  <Button onClick={handleUpdateServer}>Salva</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Posizione</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell className="font-medium">{server.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        {server.location}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{server.url}</TableCell>
                    <TableCell>
                      {server.isActive ? (
                        <span className="text-green-500">Attivo</span>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveServer(server.id)}
                        >
                          Attiva
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditDialog(server)}
                          disabled={servers.length <= 1}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteServer(server.id)}
                          disabled={servers.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {servers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Nessun server configurato
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Servers;
