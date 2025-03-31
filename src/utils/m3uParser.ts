import { IPTVChannel, IPTVGroup, IPTVPlaylist, IPTVCountry, IPTVGenre, IPTVBroadcaster } from "@/types/iptv";
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

// Common genres for detection
const COMMON_GENRES = [
  "news", "sport", "movie", "documentary", "entertainment", "music", "kids", "education",
  "notizie", "sport", "film", "documentari", "intrattenimento", "musica", "bambini", "educazione"
];

// Common Italian broadcasters
const COMMON_BROADCASTERS = [
  "rai", "mediaset", "sky", "dazn", "discovery", "la7", "tvsat", "tv8", "nove", "paramount",
  "disney", "netflix", "amazon", "hbo"
];

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

// Detect genre from channel name or group
const detectGenre = (text: string): string | null => {
  text = text.toLowerCase();
  
  for (const genre of COMMON_GENRES) {
    if (text.includes(genre)) {
      return genre.charAt(0).toUpperCase() + genre.slice(1);
    }
  }
  
  return null;
};

// Detect broadcaster from channel name
const detectBroadcaster = (text: string): string | null => {
  text = text.toLowerCase();
  
  for (const broadcaster of COMMON_BROADCASTERS) {
    if (text.includes(broadcaster)) {
      return broadcaster.toUpperCase();
    }
  }
  
  return null;
};

export function parseM3U(content: string): IPTVPlaylist {
  const lines = content.split("\n");
  const channels: IPTVChannel[] = [];
  const groupNames = new Set<string>();
  const countryMap = new Map<string, { name: string, code: string, channels: string[] }>();
  const genreMap = new Map<string, { name: string, channels: string[] }>();
  const broadcasterMap = new Map<string, { name: string, channels: string[] }>();
  
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
      
      // Extract or detect genre
      const genreMatch = line.match(/tvg-genre="([^"]+)"/);
      if (genreMatch) {
        currentChannel.genre = genreMatch[1];
      } else {
        // Try to detect genre from name or group
        const detectedGenre = detectGenre(currentChannel.name) || 
                             (currentChannel.group ? detectGenre(currentChannel.group) : null);
        
        if (detectedGenre) {
          currentChannel.genre = detectedGenre;
        }
      }
      
      // Extract or detect broadcaster
      const broadcasterMatch = line.match(/tvg-broadcaster="([^"]+)"/);
      if (broadcasterMatch) {
        currentChannel.broadcaster = broadcasterMatch[1];
      } else {
        // Try to detect broadcaster from name
        const detectedBroadcaster = detectBroadcaster(currentChannel.name);
        
        if (detectedBroadcaster) {
          currentChannel.broadcaster = detectedBroadcaster;
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
      
      // Add to genre map if genre is defined
      if (currentChannel.genre) {
        const genreName = currentChannel.genre;
        
        if (!genreMap.has(genreName)) {
          genreMap.set(genreName, {
            name: genreName,
            channels: []
          });
        }
        
        genreMap.get(genreName)?.channels.push(currentChannel.id);
      }
      
      // Add to broadcaster map if broadcaster is defined
      if (currentChannel.broadcaster) {
        const broadcasterName = currentChannel.broadcaster;
        
        if (!broadcasterMap.has(broadcasterName)) {
          broadcasterMap.set(broadcasterName, {
            name: broadcasterName,
            channels: []
          });
        }
        
        broadcasterMap.get(broadcasterName)?.channels.push(currentChannel.id);
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
  
  // Create genres
  const genres: IPTVGenre[] = Array.from(genreMap.values()).map(genre => ({
    id: uuidv4(),
    name: genre.name,
    channels: genre.channels
  }));
  
  // Add "Unknown" genre if any channels don't have a genre
  const unknownGenreChannels = channels.filter(channel => !channel.genre);
  if (unknownGenreChannels.length > 0) {
    genres.push({
      id: uuidv4(),
      name: "Unknown",
      channels: unknownGenreChannels.map(channel => channel.id)
    });
  }
  
  // Create broadcasters
  const broadcasters: IPTVBroadcaster[] = Array.from(broadcasterMap.values()).map(broadcaster => ({
    id: uuidv4(),
    name: broadcaster.name,
    channels: broadcaster.channels
  }));
  
  // Add "Unknown" broadcaster if any channels don't have a broadcaster
  const unknownBroadcasterChannels = channels.filter(channel => !channel.broadcaster);
  if (unknownBroadcasterChannels.length > 0) {
    broadcasters.push({
      id: uuidv4(),
      name: "Unknown",
      channels: unknownBroadcasterChannels.map(channel => channel.id)
    });
  }
  
  return {
    id: uuidv4(),
    name: "Imported Playlist",
    lastUpdated: new Date(),
    channels,
    groups,
    countries,
    genres,
    broadcasters
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
    
    if (channel.genre) {
      content += ` tvg-genre="${channel.genre}"`;
    }
    
    if (channel.broadcaster) {
      content += ` tvg-broadcaster="${channel.broadcaster}"`;
    }
    
    content += `, "${channel.name}"\n${channel.url}\n`;
  }
  
  return content;
}
