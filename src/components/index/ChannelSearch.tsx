
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ChannelSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ChannelSearch: React.FC<ChannelSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Cerca canali..."
        className="pl-8"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default ChannelSearch;
