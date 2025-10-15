import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"

interface CompetitionSelectionCardProps {
  competitions: string[];
  selectedCompetition: string;
  setSelectedCompetition: (competition: string) => void;
}

export function CompetitionSelectionCard({ 
  competitions, 
  selectedCompetition, 
  setSelectedCompetition 
}: CompetitionSelectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competition Selection</CardTitle>
        <CardDescription>Select a competition to view analytics.</CardDescription>
      </CardHeader>
      <CardContent>
        <Combobox
          options={competitions.map(comp => ({ value: comp, label: comp }))}
          value={selectedCompetition}
          onChange={setSelectedCompetition}
          placeholder="Select Competition"
          searchPlaceholder="Search competitions..."
          noResultsText="No competitions found."
        />
      </CardContent>
    </Card>
  )
}