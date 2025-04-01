
export interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  status?: 'online' | 'offline' | 'unknown' | 'testing';
  lastChecked?: Date;
}

export interface IPTVGroup {
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
}
