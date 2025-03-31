
import { IPTVChannel, IPTVGroup, IPTVPlaylist, IPTVCountry } from "@/types/iptv";
import { v4 as uuidv4 } from "uuid";

// Common country codes mapping for basic detection
const COUNTRY_CODES = {
  "it": "Italy",
  "uk": "United Kingdom",
  "us": "United States",
  "fr": "France",
  "de": "Germany",
  "es": "Spain",
  "pt": "Portugal",
  "nl": "Netherlands",
  "be": "Belgium",
  "ch": "Switzerland",
  "at": "Austria",
  "se": "Sweden",
  "no": "Norway",
  "dk": "Denmark",
  "fi": "Finland",
  "ru": "Russia",
  "br": "Brazil",
  "mx": "Mexico",
  "ar": "Argentina",
  "ca": "Canada",
  "au": "Australia",
  "jp": "Japan",
  "cn": "China",
  "in": "India"
};

// Detect country from channel name or group
const detectCountry = (text: string): { name: string, code: string } | null => {
  text = text.toLowerCase();
  
  for (const [code, name] of Object.entries(COUNTRY_CODES)) {
    if (text.includes(code) || text.includes(name.toLowerCase())) {
      return { name, code };
    }
  }
  
  return null;
};

export function parseM3U(content: string): IPTVPlaylist {
  const lines = content.split("\n");
  const channels: IPTVChannel[] = [];
  const groupNames = new Set<string>();
  const countryMap = new Map<string, { name: string, code: string, channels: string[] }>();
  
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
      
      // Extract or detect country if possible
      const countryMatch = line.match(/tvg-country="([^"]+)"/);
      if (countryMatch) {
        const countryCode = countryMatch[1].toLowerCase();
        currentChannel.country = COUNTRY_CODES[countryCode] || countryMatch[1];
      } else {
        // Try to detect country from name or group
        const detectedCountry = detectCountry(currentChannel.name) || 
                               (currentChannel.group ? detectCountry(currentChannel.group) : null);
        
        if (detectedCountry) {
          currentChannel.country = detectedCountry.name;
        }
      }
    } else if (line.startsWith("http") && currentChannel) {
      // This is the URL for the previous channel
      currentChannel.url = line;
      channels.push(currentChannel as IPTVChannel);
      
      // Add to country map if country is defined
      if (currentChannel.country) {
        const countryName = currentChannel.country;
        const countryCode = Object.entries(COUNTRY_CODES).find(
          ([, name]) => name === countryName
        )?.[0] || countryName.substring(0, 2).toLowerCase();
        
        if (!countryMap.has(countryName)) {
          countryMap.set(countryName, {
            name: countryName,
            code: countryCode,
            channels: []
          });
        }
        
        countryMap.get(countryName)?.channels.push(currentChannel.id);
      }
      
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
  
  // Create countries
  const countries: IPTVCountry[] = Array.from(countryMap.values()).map(country => ({
    id: uuidv4(),
    name: country.name,
    code: country.code,
    channels: country.channels
  }));
  
  // Add "Unknown" country if any channels don't have a country
  const unknownCountryChannels = channels.filter(channel => !channel.country);
  if (unknownCountryChannels.length > 0) {
    countries.push({
      id: uuidv4(),
      name: "Unknown",
      code: "unknown",
      channels: unknownCountryChannels.map(channel => channel.id)
    });
  }
  
  return {
    id: uuidv4(),
    name: "Imported Playlist",
    lastUpdated: new Date(),
    channels,
    groups,
    countries
  };
}

export function generateM3U(playlist: IPTVPlaylist): string {
  let content = "#EXTM3U\n";
  
  for (const channel of playlist.channels) {
    content += `#EXTINF:-1 tvg-id="${channel.id}" tvg-name="${channel.name}" group-title="${channel.group}"`;
    
    if (channel.logo) {
      content += ` tvg-logo="${channel.logo}"`;
    }
    
    if (channel.country) {
      // Find country code
      const countryCode = Object.entries(COUNTRY_CODES).find(
        ([, name]) => name === channel.country
      )?.[0] || channel.country.substring(0, 2).toLowerCase();
      
      content += ` tvg-country="${countryCode}"`;
    }
    
    content += `, "${channel.name}"\n${channel.url}\n`;
  }
  
  return content;
}
