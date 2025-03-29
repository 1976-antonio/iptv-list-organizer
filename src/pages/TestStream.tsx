
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Play, XCircle } from "lucide-react";

const TestStream = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  const handleTestStream = () => {
    if (!streamUrl.trim()) return;
    
    setIsPlaying(true);
    setError(false);
  };

  const handleVideoError = () => {
    setError(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Test Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Inserisci l'URL dello stream da testare"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleTestStream} disabled={!streamUrl.trim()}>
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>

              {isPlaying && (
                <div className="mt-4">
                  <div className="video-container bg-black rounded-md">
                    {error ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <XCircle className="h-12 w-12 text-red-500 mb-2" />
                        <p className="text-muted-foreground text-center">
                          Impossibile riprodurre lo stream.<br />
                          Verifica che l'URL sia corretto e che lo stream sia attivo.
                        </p>
                      </div>
                    ) : (
                      <video
                        key={streamUrl} // Force reload on url change
                        src={streamUrl}
                        controls
                        autoPlay
                        className="w-full h-full"
                        onError={handleVideoError}
                      >
                        Il tuo browser non supporta la riproduzione video.
                      </video>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TestStream;
