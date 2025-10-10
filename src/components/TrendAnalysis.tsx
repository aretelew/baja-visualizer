import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function TrendAnalysis() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [topTeams, setTopTeams] = useState<string[]>([]);
  const [chartConfig, setChartConfig] = useState<any>({});

  useEffect(() => {
    fetch('/baja-data.json')
      .then(response => response.json())
      .then(jsonData => {
        const stats: { [key: string]: { scores: number[]; count: number } } = {};

        for (const competition in jsonData) {
          for (const team of jsonData[competition]) {
            const teamName = team['Canonical_Team'];
            const score = team['Overall (1000)'];

            if (!stats[teamName]) {
              stats[teamName] = { scores: [], count: 0 };
            }

            stats[teamName].scores.push(score);
            stats[teamName].count++;
          }
        }

        const calculatedStats = Object.keys(stats).map(teamName => {
          const teamData = stats[teamName];
          const averageScore = teamData.scores.reduce((a, b) => a + b, 0) / teamData.count;
          return { teamName, averageScore };
        });

        const top10Teams = calculatedStats
          .sort((a, b) => b.averageScore - a.averageScore)
          .slice(0, 10)
          .map(t => t.teamName);

        setTopTeams(top10Teams);

        const competitionNames = Object.keys(jsonData).reverse(); // chronological order

        const newChartData = competitionNames.map(competition => {
          const competitionData: any = { competition };
          for (const teamName of top10Teams) {
            const teamData = jsonData[competition].find((t: any) => t['Canonical_Team'] === teamName);
            competitionData[teamName] = teamData ? teamData['Overall (1000)'] : null;
          }
          return competitionData;
        });

        setChartData(newChartData);

        const newChartConfig: any = {};
        top10Teams.forEach((teamName, index) => {
          newChartConfig[teamName] = {
            label: teamName,
            color: chartColors[index],
          };
        });
        setChartConfig(newChartConfig);
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-year Score Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[400px]">
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="competition"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {topTeams.map((teamName, index) => (
              <Line
                key={teamName}
                dataKey={teamName}
                stroke={chartColors[index]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}