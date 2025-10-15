import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Card,
  CardContent,
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
  'team_key': string;
  'school': string;
}

interface RawTeam {
  Overall: {
    School: string;
    team_key: string;
    'Overall (1000)': number;
  };
}

const chartConfig = {
  Overall: {
    label: 'Overall Score',
    color: 'var(--chart-1)',
  },
};

export function CompetitionOverview() {
  const [allData, setAllData] = useState<{[key: string]: {[key: string]: RawTeam}} | null>(null);
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
      const top10 = Object.values(competitionData)
        .filter((team: RawTeam) => team && team.Overall)
        .map((team: RawTeam) => {
          const school = team.Overall.School;
          const team_key = team.Overall.team_key;
          const teamName = team_key.replace(school + ' - ', '');
          return {
            'Canonical_Team': teamName,
            'Overall (1000)': team.Overall['Overall (1000)'],
            'team_key': team_key,
            'school': school,
          }
        })
        .sort((a, b) => b['Overall (1000)'] - a['Overall (1000)'])
        .slice(0, 10);
      setChartData(top10 as TeamData[]);
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
            <XAxis dataKey="Overall (1000)" type="number" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                indicator="line"
                labelFormatter={(value, payload) => {
                  if (payload && payload.length > 0) {
                    return (
                      <div className="flex flex-col gap-1 p-1">
                        <span className="font-bold">{value}</span>
                        <span className="text-muted-foreground">{payload[0].payload.school}</span>
                      </div>
                    )
                  }
                  return value;
                }}
              />}
            />
            <Bar dataKey="Overall (1000)" radius={4} fill="var(--color-Overall)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}