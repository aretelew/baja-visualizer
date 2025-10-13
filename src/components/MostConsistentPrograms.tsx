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
  schoolName: string;
  teamName: string;
  averageScore: number;
  bestScore: number;
  competitionCount: number;
}

export function MostConsistentPrograms() {
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);

  useEffect(() => {
    const jsonData = bajaData;
    const stats: { [key: string]: { scores: number[]; count: number; best: number; recentTeamName: string; recentCompetitionYear: number; } } = {};

    const competitionKeys = Object.keys(jsonData).sort();

    for (const competition of competitionKeys) {
      const competitionYearMatch = competition.match(/\d{4}/);
      const competitionYear = competitionYearMatch ? parseInt(competitionYearMatch[0]) : 0;

      const competitionData = jsonData[competition as keyof typeof jsonData];
      for (const team of Object.values(competitionData)) {
        if (team && team.Overall && team.Overall.School && team.Overall.team_key) {
          const schoolName = team.Overall.School;
          const teamName = team.Overall.team_key;
          const score = team.Overall['Overall (1000)'];

          if (typeof score === 'number') {
            if (!stats[schoolName]) {
              stats[schoolName] = { scores: [], count: 0, best: 0, recentTeamName: '', recentCompetitionYear: 0 };
            }

            stats[schoolName].scores.push(score);
            stats[schoolName].count++;
            if (score > stats[schoolName].best) {
              stats[schoolName].best = score;
            }

            if (competitionYear >= stats[schoolName].recentCompetitionYear) {
              stats[schoolName].recentCompetitionYear = competitionYear;
              stats[schoolName].recentTeamName = teamName;
            }
          }
        }
      }
    }

    const calculatedStats: TeamStats[] = Object.keys(stats).map(schoolName => {
      const schoolData = stats[schoolName];
      const averageScore = schoolData.scores.reduce((a, b) => a + b, 0) / schoolData.count;
      return {
        schoolName: schoolName,
        teamName: schoolData.recentTeamName,
        averageScore: parseFloat(averageScore.toFixed(2)),
        bestScore: schoolData.best,
        competitionCount: schoolData.count,
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
              <TableRow key={team.schoolName}>
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