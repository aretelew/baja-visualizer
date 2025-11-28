import { Combobox } from "@/components/ui/combobox"

interface FilterBarProps {
  schools: { value: string; label: string }[];
  selectedSchool: string;
  setSelectedSchool: (school: string) => void;
  competitions: string[];
  selectedCompetition: string;
  setSelectedCompetition: (competition: string) => void;
}

export function FilterBar({
  schools,
  selectedSchool,
  setSelectedSchool,
  competitions,
  selectedCompetition,
  setSelectedCompetition,
}: FilterBarProps) {
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
               Team
             </label>
             <Combobox
              options={schools}
              value={selectedSchool}
              onChange={(value) => setSelectedSchool(typeof value === 'string' ? value : value?.[0] || "")}
              placeholder="Select School"
              searchPlaceholder="Search schools..."
              noResultsText="No schools found."
              className="w-full"
              maxSelections={1}
            />
           </div>

           <div className="space-y-2">
             <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
               Competition
             </label>
             <Combobox
              options={competitions.map(comp => ({ value: comp, label: comp }))}
              value={selectedCompetition}
              onChange={(value) => setSelectedCompetition(typeof value === 'string' ? value : value?.[0] || "")}
              placeholder="Select Competition"
              searchPlaceholder="Search competitions..."
              noResultsText="No competitions found."
              className="w-full"
              maxSelections={1}
            />
           </div>
        </div>
      </div>
    </div>
  )
}
