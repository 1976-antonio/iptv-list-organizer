
import { IPTVChannel, IPTVPlaylist } from "@/types/iptv";
import { useToast } from "@/hooks/use-toast";

export function useChannelTester(
  currentPlaylist: IPTVPlaylist | null,
  updateChannel: (channelId: string, updates: Partial<IPTVChannel>) => void,
  setIsTestingChannel: (value: boolean) => void
) {
  const { toast } = useToast();

  const testChannel = async (channel: IPTVChannel): Promise<boolean> => {
    setIsTestingChannel(true);
    
    // Create a simple test by trying to load the stream
    try {
      const response = await fetch(channel.url, { method: 'HEAD', mode: 'no-cors' });
      
      // Update the channel's status
      updateChannel(channel.id, {
        status: 'online',
        lastChecked: new Date()
      });
      
      setIsTestingChannel(false);
      return true;
    } catch (e) {
      // Update the channel's status
      updateChannel(channel.id, {
        status: 'offline',
        lastChecked: new Date()
      });
      
      setIsTestingChannel(false);
      return false;
    }
  };

  const testAllChannels = async () => {
    if (!currentPlaylist) return;
    
    toast({
      title: "Test Avviato",
      description: "Test di tutti i canali in corso..."
    });
    
    let successCount = 0;
    let failCount = 0;
    
    // Test only a reasonable number of channels to avoid browser limitations
    const channelsToTest = currentPlaylist.channels.slice(0, 100);
    if (currentPlaylist.channels.length > 100) {
      toast({
        title: "Avviso",
        description: `Verranno testati solo i primi 100 canali su ${currentPlaylist.channels.length}`
      });
    }
    
    for (const channel of channelsToTest) {
      try {
        const isOnline = await testChannel(channel);
        if (isOnline) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }
    
    toast({
      title: "Test Completato",
      description: `Online: ${successCount}, Offline: ${failCount}`
    });
  };

  return {
    testChannel,
    testAllChannels
  };
}
