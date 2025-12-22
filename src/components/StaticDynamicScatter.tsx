import { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid } from 'recharts';
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
} from '@/components/ui/chart';
import bajaData from '../../baja-data.json';
import { useChartAnimation } from '@/hooks/useChartAnimation';

interface ScatterDataPoint {
  x: number;
  y: number;
  team: string;
  school: string;
  fill: string;
}

interface RawTeam {
  Overall: {
    School: string;
    team_key: string;
    'Overall Static (300)': number;
    'Overall Dynamic (300)': number;
  };
}

const chartConfig = {
  static: {
    label: 'Static Score',
    color: 'hsl(var(--chart-1))',
  },
  dynamic: {
    label: 'Dynamic Score',
    color: 'hsl(var(--chart-2))',
  },
};

export function StaticDynamicScatter({
  selectedCompetition,
  suppressInitialAnimation = false,
}: {
  selectedCompetition: string;
  suppressInitialAnimation?: boolean;
}) {
  const [data, setData] = useState<ScatterDataPoint[]>([]);
  const animationKey = selectedCompetition || "none";
  const shouldAnimate = useChartAnimation(animationKey, suppressInitialAnimation);

  useEffect(() => {
    if (selectedCompetition) {
      const competitionData =
        bajaData[selectedCompetition as keyof typeof bajaData];
      
      const scatterPoints = (Object.values(competitionData ?? {}) as RawTeam[])
        .filter((team) => team && team.Overall)
        .map((team) => {
          const school = team.Overall.School;
          const team_key = team.Overall.team_key;
          const teamName = team_key.replace(school + ' - ', '');
          
          return {
            x: team.Overall['Overall Static (300)'],
            y: team.Overall['Overall Dynamic (300)'],
            team: teamName,
            school: school,
            fill: "var(--chart-1)" 
          };
        });
        
      setData(scatterPoints);
    }
  }, [selectedCompetition]);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Static vs. Dynamic Performance</CardTitle>
        <CardDescription>
          Comparing engineering design & cost (Static) against track performance (Dynamic)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[400px]">
          <ScatterChart
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Static Score" 
              domain={[0, 400]} 
              label={{ value: "Static Score", position: "bottom", offset: 0 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Dynamic Score" 
              domain={[0, 500]}
              label={{ value: "Dynamic Score", angle: -90, position: "left", offset: 0 }}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Team
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {data.team}
                          </span>
                        </div>
                         <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            School
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {data.school}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Static
                          </span>
                          <span className="font-bold">
                            {data.x}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Dynamic
                          </span>
                          <span className="font-bold">
                            {data.y}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter 
                name="Teams" 
                data={data} 
                fill="var(--chart-1)" 
                fillOpacity={0.7}
                stroke="var(--chart-1)"
                strokeWidth={1}
                line={false}
                shape="circle"
                size={100}
                isAnimationActive={shouldAnimate}
            />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
