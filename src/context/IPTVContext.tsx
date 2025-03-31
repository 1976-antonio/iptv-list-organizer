
import React, { createContext, useContext, useEffect } from "react";
import { IPTVChannel, IPTVPlaylist } from "@/types/iptv";
import { usePlaylistManager } from "@/hooks/use-playlist-manager";
import { useChannelManager } from "@/hooks/use-channel-manager";
import { useChannelTester } from "@/hooks/use-channel-tester";

interface IPTVContextProps {
  playlists: IPTVPlaylist[];
  currentPlaylist: IPTVPlaylist | null;
  selectedChannel: IPTVChannel | null;
  isTestingChannel: boolean;
  addPlaylist: (name: string, content: string) => void;
  setCurrentPlaylist: (id: string) => void;
  setSelectedChannel: (channel: IPTVChannel | null) => void;
  testChannel: (channel: IPTVChannel) => Promise<boolean>;
  testAllChannels: () => Promise<void>;
  deleteChannel: (channelId: string) => void;
  exportPlaylist: (playlistId: string) => string;
  updateChannel: (channelId: string, updates: Partial<IPTVChannel>) => void;
  addChannel: (channel: Omit<IPTVChannel, "id">) => void;
}

const IPTVContext = createContext<IPTVContextProps | undefined>(undefined);

export const IPTVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    playlists,
    currentPlaylist,
    addPlaylist,
    setCurrentPlaylist,
    setPlaylists,
    exportPlaylist
  } = usePlaylistManager();

  const {
    selectedChannel,
    setSelectedChannel,
    isTestingChannel,
    setIsTestingChannel,
    updateChannel,
    deleteChannel,
    addChannel
  } = useChannelManager(currentPlaylist, playlists, setPlaylists);

  const {
    testChannel,
    testAllChannels
  } = useChannelTester(currentPlaylist, updateChannel, setIsTestingChannel);

  // Set the first playlist as current if available on mount or when playlists change
  useEffect(() => {
    if (playlists.length > 0 && !currentPlaylist) {
      setCurrentPlaylist(playlists[0].id);
    }
  }, [playlists, currentPlaylist]);

  return (
    <IPTVContext.Provider
      value={{
        playlists,
        currentPlaylist,
        selectedChannel,
        isTestingChannel,
        addPlaylist,
        setCurrentPlaylist,
        setSelectedChannel,
        testChannel,
        testAllChannels,
        deleteChannel,
        exportPlaylist,
        updateChannel,
        addChannel
      }}
    >
      {children}
    </IPTVContext.Provider>
  );
};

export const useIPTV = () => {
  const context = useContext(IPTVContext);
  if (context === undefined) {
    throw new Error("useIPTV must be used within an IPTVProvider");
  }
  return context;
};
