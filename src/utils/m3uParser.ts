
import { IPTVChannel, IPTVGroup, IPTVPlaylist } from "@/types/iptv";
import { v4 as uuidv4 } from "uuid";

export function parseM3U(content: string): IPTVPlaylist {
  const lines = content.split("\n");
  const channels: IPTVChannel[] = [];
  const groupNames = new Set<string>();
  
  let currentChannel: Partial<IPTVChannel> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === "#EXTM3U" || line === "") {
      continue;
    }
    
    if (line.startsWith("#EXTINF:")) {
      // Parse channel metadata
      currentChannel = {
        id: uuidv4(),
        name: "",
        url: "",
        group: "Ungrouped"
      };
      
      // Extract name and other metadata
      const metadataStr = line.substring(line.indexOf(',') + 1);
      
      // Extract metadata in quotes if present
      const nameMatch = metadataStr.match(/"([^"]+)"/);
      currentChannel.name = nameMatch ? nameMatch[1] : metadataStr;
      
      // Extract group if present
      const groupMatch = line.match(/group-title="([^"]+)"/);
      if (groupMatch) {
        currentChannel.group = groupMatch[1];
        groupNames.add(groupMatch[1]);
      }
      
      // Extract logo if present
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      if (logoMatch) {
        currentChannel.logo = logoMatch[1];
      }
    } else if (line.startsWith("http") && currentChannel) {
      // This is the URL for the previous channel
      currentChannel.url = line;
      channels.push(currentChannel as IPTVChannel);
      currentChannel = null;
    }
  }
  
  // Create groups
  const groups: IPTVGroup[] = Array.from(groupNames).map(name => ({
    id: uuidv4(),
    name,
    channels: channels
      .filter(channel => channel.group === name)
      .map(channel => channel.id)
  }));
  
  // Create an "Ungrouped" category if any channels are ungrouped
  const ungroupedChannels = channels.filter(channel => channel.group === "Ungrouped");
  if (ungroupedChannels.length > 0) {
    groups.push({
      id: uuidv4(),
      name: "Ungrouped",
      channels: ungroupedChannels.map(channel => channel.id)
    });
  }
  
  return {
    id: uuidv4(),
    name: "Imported Playlist",
    lastUpdated: new Date(),
    channels,
    groups
  };
}

export function generateM3U(playlist: IPTVPlaylist): string {
  let content = "#EXTM3U\n";
  
  for (const channel of playlist.channels) {
    content += `#EXTINF:-1 tvg-id="${channel.id}" tvg-name="${channel.name}" group-title="${channel.group}"`;
    
    if (channel.logo) {
      content += ` tvg-logo="${channel.logo}"`;
    }
    
    content += `, "${channel.name}"\n${channel.url}\n`;
  }
  
  return content;
}
