
import { useState, useEffect } from "react";
import { Shield, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { VPNState } from "@/types/iptv";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

// Free VPN proxy servers
const FREE_VPN_PROVIDERS = [
  { id: '1', name: 'GlobalWeb VPN', country: 'Netherlands', speed: 'Fast' },
  { id: '2', name: 'FreeSurf', country: 'Germany', speed: 'Medium' },
  { id: '3', name: 'ProxyStream', country: 'USA', speed: 'Fast' },
  { id: '4', name: 'StreamShield', country: 'Singapore', speed: 'Medium' }
];

interface VPNToggleProps {
  onVPNChange: (vpn: VPNState) => void;
}

const VPNToggle: React.FC<VPNToggleProps> = ({ onVPNChange }) => {
  const [vpnState, setVpnState] = useState<VPNState>({
    enabled: false,
    status: 'disconnected'
  });
  const [selectedProvider, setSelectedProvider] = useState(FREE_VPN_PROVIDERS[0]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Simulate VPN connection
  const toggleVPN = async () => {
    if (!vpnState.enabled) {
      // Connect to VPN
      setVpnState({
        ...vpnState,
        enabled: true,
        status: 'connecting'
      });
      
      // Simulate connection delay
      setTimeout(() => {
        const newState = {
          enabled: true,
          country: selectedProvider.country,
          status: 'connected' as const,
          lastConnected: new Date()
        };
        setVpnState(newState);
        onVPNChange(newState);
        
        toast({
          title: "VPN Connesso",
          description: `Connesso tramite ${selectedProvider.name} (${selectedProvider.country})`,
        });
      }, 1500);
    } else {
      // Disconnect from VPN
      const newState = {
        enabled: false,
        status: 'disconnected' as const
      };
      setVpnState(newState);
      onVPNChange(newState);
      
      toast({
        title: "VPN Disconnesso",
        description: "La connessione VPN è stata disattivata"
      });
    }
  };

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    
    if (vpnState.enabled) {
      // If VPN is already enabled, reconnect with new provider
      toggleVPN();
      setTimeout(() => toggleVPN(), 100);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Shield className={`h-5 w-5 mr-2 ${vpnState.enabled ? 'text-green-500' : 'text-gray-400'}`} />
              <Label htmlFor="vpn-toggle" className="font-medium">VPN Streaming</Label>
              {vpnState.status === 'connected' && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" /> Attiva
                </Badge>
              )}
            </div>
            <div className="flex items-center">
              <Switch
                id="vpn-toggle"
                checked={vpnState.enabled}
                onCheckedChange={toggleVPN}
                disabled={vpnState.status === 'connecting'}
              />
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2">
                  {isOpen ? "Meno dettagli" : "Più dettagli"}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          
          <CollapsibleContent>
            <div className="mt-4 space-y-4">
              <div className="text-sm text-muted-foreground">
                VPN gratuita per lo streaming. Protegge la tua privacy durante la visione dei canali IPTV.
              </div>
              
              {vpnState.status === 'connecting' && (
                <div className="flex items-center text-amber-600">
                  <Shield className="h-4 w-4 mr-2 animate-pulse" />
                  <span>Connessione in corso...</span>
                </div>
              )}
              
              {vpnState.status === 'connected' && (
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="text-sm text-green-700">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>Connesso a: {selectedProvider.name} ({selectedProvider.country})</span>
                    </div>
                    <div className="mt-1 text-xs text-green-600">
                      Connesso {vpnState.lastConnected ? `da ${Math.floor((new Date().getTime() - vpnState.lastConnected.getTime()) / 60000)} minuti` : ''}
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-sm mb-2 block">Seleziona provider VPN:</Label>
                <div className="space-y-2">
                  {FREE_VPN_PROVIDERS.map(provider => (
                    <div 
                      key={provider.id} 
                      className={`p-2 border rounded-md cursor-pointer ${selectedProvider.id === provider.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                      onClick={() => handleProviderChange(provider)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-xs text-muted-foreground">{provider.country}</div>
                        </div>
                        <Badge variant={provider.speed === 'Fast' ? 'default' : 'secondary'}>
                          {provider.speed}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-xs text-muted-foreground">
                  Questo è un servizio dimostrativo. In un'applicazione reale, verrebbero utilizzati veri server proxy.
                </Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default VPNToggle;
