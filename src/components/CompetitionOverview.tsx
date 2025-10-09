import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Combobox } from '@/components/ui/combobox';

interface TeamData {
  'Canonical_Team': string;
  'Overall (1000)': number;
}

const chartConfig = {
  Overall: {
    label: 'Overall Score',
    color: 'var(--chart-1)',
  },
};

export function CompetitionOverview() {
  const [allData, setAllData] = useState<any>(null);
  const [competitions, setCompetitions] = useState<{ value: string; label: string }[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [chartData, setChartData] = useState<TeamData[]>([]);

  useEffect(() => {
    fetch('/baja-data.json')
      .then(response => response.json())
      .then(jsonData => {
        setAllData(jsonData);
        const competitionNames = Object.keys(jsonData);
        setCompetitions(competitionNames.map(name => ({ value: name, label: name })));
        setSelectedCompetition(competitionNames[0]);
      });
  }, []);

  useEffect(() => {
    if (allData && selectedCompetition) {
      const competitionData = allData[selectedCompetition];
      const top10 = competitionData
        .sort((a: TeamData, b: TeamData) => b['Overall (1000)'] - a['Overall (1000)'])
        .slice(0, 10);
      setChartData(top10);
    }
  }, [allData, selectedCompetition]);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle>Top 10 Teams</CardTitle>
          {/* <CardDescription>Select a competition to see the top 10 finishers.</CardDescription> */}
        </div>
        <Combobox
          options={competitions}
          value={selectedCompetition}
          onChange={setSelectedCompetition}
          className="w-[250px]"
        />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[400px]">
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="Canonical_Team"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <XAxis dataKey="Overall (1000)" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="Overall (1000)" layout="vertical" radius={4} fill="var(--color-Overall)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}