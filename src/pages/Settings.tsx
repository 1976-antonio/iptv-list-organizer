
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useIPTV } from "@/context/IPTVContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Save, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { playlists, currentPlaylist, exportPlaylist } = useIPTV();
  const { toast } = useToast();
  
  const [autoTestChannels, setAutoTestChannels] = useState(false);

  const handleExport = () => {
    if (!currentPlaylist) return;
    
    const m3uContent = exportPlaylist(currentPlaylist.id);
    const blob = new Blob([m3uContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentPlaylist.name}.m3u`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Playlist Esportata",
      description: `La playlist "${currentPlaylist.name}" è stata esportata con successo`
    });
  };

  const handleClearLocalStorage = () => {
    if (confirm("Sei sicuro di voler cancellare tutte le playlist? Questa azione non può essere annullata.")) {
      localStorage.removeItem("iptv-playlists");
      
      toast({
        title: "Dati Cancellati",
        description: "Tutte le playlist sono state eliminate. Ricarica la pagina per vedere le modifiche.",
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              Impostazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Playlist</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Playlist Attuale</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentPlaylist ? currentPlaylist.name : "Nessuna playlist selezionata"}
                    </p>
                  </div>
                  <Button onClick={handleExport} disabled={!currentPlaylist}>
                    <Download className="h-4 w-4 mr-2" />
                    Esporta
                  </Button>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Playlist Salvate</h4>
                  <div className="text-sm text-muted-foreground">
                    {playlists.length > 0 ? `${playlists.length} playlist salvate` : "Nessuna playlist salvata"}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoTest">Test automatico dei canali</Label>
                    <p className="text-sm text-muted-foreground">
                      Testa automaticamente i canali quando carichi una playlist
                    </p>
                  </div>
                  <Switch
                    id="autoTest"
                    checked={autoTestChannels}
                    onCheckedChange={setAutoTestChannels}
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-destructive">Zona Pericolo</h3>
                <Button 
                  variant="destructive" 
                  onClick={handleClearLocalStorage}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancella tutti i dati
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Questa azione eliminerà definitivamente tutte le playlist e le impostazioni salvate.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
