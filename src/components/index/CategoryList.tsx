
import React from "react";
import { IPTVGroup } from "@/types/iptv";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryListProps {
  groups: IPTVGroup[];
  setActiveCategory: (category: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ groups, setActiveCategory }) => {
  return (
    <ScrollArea className="h-[60vh] pr-4">
      {groups && groups.length > 0 ? groups.map((group) => (
        <div key={group.id} className="mb-4">
          <div 
            className="font-medium p-2 cursor-pointer hover:bg-muted rounded-md"
            onClick={() => setActiveCategory(group.name)}
          >
            {group.name} ({group.channels.length})
          </div>
        </div>
      )) : (
        <div className="text-center py-4 text-muted-foreground">
          Nessuna categoria trovata
        </div>
      )}
    </ScrollArea>
  );
};

export default CategoryList;
