import { useEffect, useState } from 'react';
import bajaData from '../../baja-data.json';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TeamStats {
  teamName: string;
  averageScore: number;
  bestScore: number;
  competitionCount: number;
}

export function MostConsistentPrograms() {
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);

  useEffect(() => {
    const jsonData = bajaData;
    const stats: { [key: string]: { scores: number[]; count: number; best: number } } = {};

    for (const competition in jsonData) {
      for (const team of jsonData[competition]) {
        const teamName = team['Canonical_Team'];
        const score = team['Overall (1000)'];

        if (!stats[teamName]) {
          stats[teamName] = { scores: [], count: 0, best: 0 };
        }

        stats[teamName].scores.push(score);
        stats[teamName].count++;
        if (score > stats[teamName].best) {
          stats[teamName].best = score;
        }
      }
    }

    const calculatedStats: TeamStats[] = Object.keys(stats).map(teamName => {
      const teamData = stats[teamName];
      const averageScore = teamData.scores.reduce((a, b) => a + b, 0) / teamData.count;
      return {
        teamName,
        averageScore: parseFloat(averageScore.toFixed(2)),
        bestScore: teamData.best,
        competitionCount: teamData.count,
      };
    });

    const top20 = calculatedStats
      .filter(team => team.competitionCount >= 3)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 20);

    setTeamStats(top20);
  }, []);

  return (
    <Card>
      <CardHeader className="flex items-center">
        <CardTitle>Most Consistent Programs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left font-bold">Team</TableHead>
              <TableHead className="text-left font-bold">Average Score</TableHead>
              <TableHead className="text-left font-bold">Best Score</TableHead>
              <TableHead className="text-left font-bold">Competitions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamStats.map(team => (
              <TableRow key={team.teamName}>
                <TableCell className="text-left">{team.teamName}</TableCell>
                <TableCell className="text-left">{team.averageScore}</TableCell>
                <TableCell className="text-left">{team.bestScore}</TableCell>
                <TableCell className="text-left">{team.competitionCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
