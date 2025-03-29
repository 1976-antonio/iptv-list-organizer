
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ListVideo } from "lucide-react";
import { useIPTV } from "@/context/IPTVContext";

const FileUpload: React.FC = () => {
  const { addPlaylist } = useIPTV();
  const [isDragging, setIsDragging] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith(".m3u") && !file.name.endsWith(".m3u8")) {
      alert("Per favore carica un file M3U valido");
      return;
    }
    
    // Default playlist name from file name
    setPlaylistName(file.name.replace(/\.(m3u|m3u8)$/, ""));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        addPlaylist(playlistName || file.name.replace(/\.(m3u|m3u8)$/, ""), e.target.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <Input
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
        placeholder="Nome della playlist"
        className="mb-2"
      />
      
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ListVideo className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Carica la tua playlist M3U</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Trascina qui il tuo file o fai clic per selezionarlo
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".m3u,.m3u8"
            className="hidden"
          />
          <Button onClick={handleButtonClick} variant="outline">
            Seleziona il file
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
