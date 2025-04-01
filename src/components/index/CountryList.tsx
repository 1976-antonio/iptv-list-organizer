
import React from "react";
import { IPTVCountry } from "@/types/iptv";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flag } from "lucide-react";

interface CountryListProps {
  countries: IPTVCountry[];
  setActiveCategory: (category: string) => void;
}

const CountryList: React.FC<CountryListProps> = ({ countries, setActiveCategory }) => {
  return (
    <ScrollArea className="h-[60vh] pr-4">
      {countries && countries.length > 0 ? countries.map((country) => (
        <div key={country.id} className="mb-4">
          <div 
            className="font-medium p-2 cursor-pointer hover:bg-muted rounded-md flex items-center"
            onClick={() => setActiveCategory(country.name)}
          >
            <Flag className="h-4 w-4 mr-2" />
            {country.name} ({country.channels.length})
          </div>
        </div>
      )) : (
        <div className="text-center py-4 text-muted-foreground">
          Nessun paese trovato
        </div>
      )}
    </ScrollArea>
  );
};

export default CountryList;
