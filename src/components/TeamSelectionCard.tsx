import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"

interface TeamSelectionCardProps {
  schools: { value: string; label: string }[];
  selectedSchool: string;
  setSelectedSchool: (school: string) => void;
}

export function TeamSelectionCard({ 
  schools, 
  selectedSchool, 
  setSelectedSchool 
}: TeamSelectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Selection</CardTitle>
        <CardDescription>Select a team to view analytics.</CardDescription>
      </CardHeader>
      <CardContent>
        <Combobox
          options={schools}
          value={selectedSchool}
          onChange={setSelectedSchool}
          placeholder="Select School"
          searchPlaceholder="Search schools..."
          noResultsText="No schools found."
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}