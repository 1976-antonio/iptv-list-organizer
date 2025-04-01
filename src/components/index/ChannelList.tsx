
import React from "react";
import { IPTVChannel } from "@/types/iptv";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Circle, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface ChannelListProps {
  filteredChannels: IPTVChannel[];
  selectedChannel: IPTVChannel | null;
  handleChannelSelect: (channel: IPTVChannel) => void;
}

const getStatusIcon = (status: string | undefined) => {
  switch (status) {
    case 'online':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'offline':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'testing':
      return <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

const ChannelList: React.FC<ChannelListProps> = ({
  filteredChannels,
  selectedChannel,
  handleChannelSelect
}) => {
  return (
    <ScrollArea className="h-[60vh] pr-4">
      {filteredChannels && filteredChannels.length > 0 ? filteredChannels.map((channel) => (
        <div 
          key={channel.id} 
          className={`flex items-center p-2 mb-1 rounded-md cursor-pointer ${
            selectedChannel?.id === channel.id 
              ? 'bg-primary/10' 
              : 'hover:bg-muted'
          }`}
          onClick={() => handleChannelSelect(channel)}
        >
          <div className="mr-2">
            {getStatusIcon(channel.status)}
          </div>
          <div className="flex-1 truncate">
            {channel.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {channel.group}
          </div>
        </div>
      )) : (
        <div className="text-center py-4 text-muted-foreground">
          Nessun canale trovato
        </div>
      )}
    </ScrollArea>
  );
};

export default ChannelList;
