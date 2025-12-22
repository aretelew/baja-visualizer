import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import bajaData from '../../baja-data.json';
import { useChartAnimation } from '@/hooks/useChartAnimation';

interface HistogramData {
  range: string;
  count: number;
  min: number;
  max: number;
}

interface RawTeam {
  Overall: {
    School: string;
    team_key: string;
    'Overall (1000)': number;
  };
}

type CompetitionTeams = Record<string, RawTeam>;

const chartConfig = {
  count: {
    label: 'Teams',
    color: 'var(--chart-1)',
  },
};

export function ScoreDistribution({
  selectedCompetition,
  suppressInitialAnimation = false,
}: {
  selectedCompetition: string;
  suppressInitialAnimation?: boolean;
}) {
  const [data, setData] = useState<HistogramData[]>([]);

  const animationKey = selectedCompetition || "none";
  const shouldAnimate = useChartAnimation(animationKey, suppressInitialAnimation);

  useEffect(() => {
    if (selectedCompetition) {
      const competitionData =
        bajaData[selectedCompetition as keyof typeof bajaData] as CompetitionTeams | undefined;
      
      if (!competitionData) return;

      const teamEntries = Object.values(competitionData);

      // Create buckets 0-100, 100-200, ... 900-1000
      const buckets: Record<string, HistogramData> = {};
      const bucketSize = 100;

      for (let i = 0; i < 1000; i += bucketSize) {
        const label = `${i}-${i + bucketSize}`;
        buckets[label] = {
            range: label,
            count: 0,
            min: i,
            max: i + bucketSize
        };
      }
      
      teamEntries.forEach(team => {
        const score = team.Overall['Overall (1000)'];
        let bucketIndex = Math.floor(score / bucketSize) * bucketSize;
        if (bucketIndex >= 1000) bucketIndex = 900;
        if (bucketIndex < 0) bucketIndex = 0;

        const label = `${bucketIndex}-${bucketIndex + bucketSize}`;
        if (buckets[label]) {
            buckets[label].count++;
        }
      });

      setData(Object.values(buckets));
    }
  }, [selectedCompetition]);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
        <CardDescription>Overall scores distribution for {selectedCompetition}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[300px]">
          <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis 
                dataKey="range" 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
            />
            <YAxis 
                dataKey="count" 
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="count"
              fill="var(--chart-1)"
              fillOpacity={0.7}
              radius={[4, 4, 0, 0]}
              isAnimationActive={shouldAnimate}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
