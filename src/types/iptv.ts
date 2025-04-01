
export interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  country?: string;
  genre?: string;
  broadcaster?: string;
  status?: 'online' | 'offline' | 'unknown' | 'testing';
  lastChecked?: Date;
}

export interface IPTVGroup {
  id: string;
  name: string;
  channels: string[]; // channel ids
}

export interface IPTVCountry {
  id: string;
  name: string;
  code: string;
  channels: string[]; // channel ids
}

export interface IPTVGenre {
  id: string;
  name: string;
  channels: string[]; // channel ids
}

export interface IPTVBroadcaster {
  id: string;
  name: string;
  channels: string[]; // channel ids
}

export interface IPTVPlaylist {
  id: string;
  name: string;
  lastUpdated: Date;
  channels: IPTVChannel[];
  groups: IPTVGroup[];
  countries?: IPTVCountry[];
  genres?: IPTVGenre[];
  broadcasters?: IPTVBroadcaster[];
  storageUsage?: {
    total: number;
    used: number;
    available: number;
  };
}

export interface StreamingServer {
  id: string;
  country: string;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'busy';
  ping?: number; // in ms
}

