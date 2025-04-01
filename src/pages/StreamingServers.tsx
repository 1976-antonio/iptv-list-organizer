
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Wifi, WifiOff, Server, Globe, Network, Signal, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useStreamingManager } from "@/hooks/use-streaming-manager";
import { getStorageUsage } from "@/utils/storage";
import { Progress } from "@/components/ui/progress";

const StreamingServers = () => {
  const { 
    servers, 
    availableCountries, 
    selectedServer, 
    isRedirectActive, 
    selectServer, 
    toggleRedirect 
  } = useStreamingManager();
  
  const [activeTab, setActiveTab] = useState(availableCountries[0] || "USA");
  const storageUsage = getStorageUsage();
  const usagePercentage = (storageUsage.used / storageUsage.total) * 100;
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  Server di Streaming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Switch 
                      id="redirect-switch"
                      checked={isRedirectActive}
                      onCheckedChange={toggleRedirect}
                      className="mr-2"
                    />
                    <Label htmlFor="redirect-switch">
                      Redirezione Stream
                    </Label>
                  </div>
                  <div className="flex items-center">
                    {isRedirectActive ? (
                      <>
                        <Wifi className="h-5 w-5 text-green-500 mr-1" />
                        <span className="text-sm font-medium">Attiva via {selectedServer?.name}</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-5 w-5 text-gray-500 mr-1" />
                        <span className="text-sm font-medium">Disattivata</span>
                      </>
                    )}
                  </div>
                </div>
                
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    {availableCountries.map(country => (
                      <TabsTrigger key={country} value={country}>
                        {country}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {availableCountries.map(country => (
                    <TabsContent key={country} value={country} className="mt-4">
                      <RadioGroup 
                        value={selectedServer?.id} 
                        onValueChange={selectServer}
                      >
                        {servers[country]?.map(server => (
                          <div key={server.id} className="flex items-center justify-between p-3 border rounded-md mb-2">
                            <div className="flex items-center">
                              <RadioGroupItem value={server.id} id={server.id} className="mr-2" />
                              <Label htmlFor={server.id} className="flex items-center">
                                <span>{server.name}</span>
                                {server.status === 'online' && (
                                  <Signal className="h-4 w-4 text-green-500 ml-2" />
                                )}
                                {server.status === 'offline' && (
                                  <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                                )}
                                {server.status === 'busy' && (
                                  <Network className="h-4 w-4 text-amber-500 ml-2" />
                                )}
                              </Label>
                            </div>
                            {server.ping && (
                              <div className="text-sm text-muted-foreground">
                                Ping: {server.ping}ms
                              </div>
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                      
                      {servers[country]?.length === 0 && (
                        <div className="text-center py-4">
                          Nessun server disponibile per questo paese
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Storage & Connessione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spazio Utilizzato</span>
                      <span className="font-medium">
                        {(storageUsage.used / 1024 / 1024).toFixed(2)} MB / {(storageUsage.total / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Progress value={usagePercentage} />
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <h3 className="font-medium mb-2">Stato Connessione</h3>
                    <div className="flex items-center text-sm">
                      <div className={`h-3 w-3 rounded-full ${isRedirectActive ? "bg-green-500" : "bg-gray-400"} mr-2`}></div>
                      <span>{isRedirectActive ? "Connessione Protetta" : "Connessione Diretta"}</span>
                    </div>
                    {selectedServer && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Server: {selectedServer.name}
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" className="w-full" onClick={toggleRedirect}>
                    {isRedirectActive ? "Disattiva Redirezione" : "Attiva Redirezione"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StreamingServers;

