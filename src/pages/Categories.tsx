
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useIPTV } from "@/context/IPTVContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FolderOpen, ChevronDown, ChevronRight, Edit2, Save, X } from "lucide-react";

const Categories = () => {
  const { currentPlaylist, updateChannel } = useIPTV();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  const toggleGroup = (groupId: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const startEditChannel = (channelId: string, currentName: string) => {
    setEditingChannel(channelId);
    setEditedName(currentName);
  };

  const saveChannelEdit = (channelId: string) => {
    if (editedName.trim()) {
      updateChannel(channelId, { name: editedName });
    }
    setEditingChannel(null);
  };

  const cancelEdit = () => {
    setEditingChannel(null);
  };

  if (!currentPlaylist) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Nessuna playlist selezionata</h2>
          <p className="text-muted-foreground">
            Per favore carica o seleziona una playlist prima di visualizzare le categorie.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              Categorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[75vh] pr-4">
              {currentPlaylist.groups.map((group) => (
                <div key={group.id} className="mb-4">
                  <div
                    className="flex items-center p-2 bg-muted rounded-md cursor-pointer"
                    onClick={() => toggleGroup(group.id)}
                  >
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    <span className="font-medium">{group.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({group.channels.length})
                    </span>
                  </div>

                  {expandedGroups.has(group.id) && (
                    <div className="ml-6 mt-2 space-y-1">
                      {group.channels.map((channelId) => {
                        const channel = currentPlaylist.channels.find(
                          (c) => c.id === channelId
                        );
                        if (!channel) return null;

                        return (
                          <div
                            key={channel.id}
                            className="flex items-center p-2 hover:bg-muted/50 rounded-md"
                          >
                            {editingChannel === channel.id ? (
                              <div className="flex items-center flex-1">
                                <Input
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                  autoFocus
                                  className="flex-1 h-8"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => saveChannelEdit(channel.id)}
                                  className="h-8 w-8 ml-1"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={cancelEdit}
                                  className="h-8 w-8"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1 truncate">{channel.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditChannel(channel.id, channel.name)}
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Categories;
