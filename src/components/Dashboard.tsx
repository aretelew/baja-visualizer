import { useState, useEffect } from "react"
import { MostConsistentPrograms } from "./MostConsistentPrograms"
import { CompetitionOverview } from "./CompetitionOverview"
import { TeamPerformance } from "./TeamPerformance"
import { ComparisonView } from "./ComparisonView"
import { Header } from "./Header"
import { FilterBar } from "./FilterBar"
import { Top10Endurance } from "./Top10Endurance"
import bajaData from "../../baja-data.json";
import type { ViewKey } from "@/types/views"

interface TeamData {
  Overall: {
    School: string;
    team_key: string;
  };
}

export function Dashboard() {
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [data, setData] = useState<Record<string, Record<string, TeamData>>>({});
  const [competitions, setCompetitions] = useState<string[]>([]);
  const [schools, setSchools] = useState<{ value: string; label: string }[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [visitedViews, setVisitedViews] = useState<Record<ViewKey, boolean>>({
    overview: false,
    teams: false,
    compare: false,
  });

  useEffect(() => {
    setData(bajaData as Record<string, Record<string, TeamData>>);
    const allTeams: TeamData[] = Object.values(bajaData).flatMap(comp => Object.values(comp)) as TeamData[];
    const uniqueSchools = [...new Set(allTeams.map((team) => team.Overall.School))];
    
    const schoolList = uniqueSchools.map(schoolName => {
      const teamForSchool = allTeams.find(team => team.Overall.School === schoolName);
      return {
        value: schoolName,
        label: teamForSchool ? teamForSchool.Overall.team_key : schoolName,
      };
    }).sort((a, b) => a.label.localeCompare(b.label));

    setSchools(schoolList);
    if (schoolList.length > 0) {
      const initialSchool = "Case Western Reserve University";
      setSelectedSchool(initialSchool);

      const competitionsForSchool = Object.keys(bajaData).filter(comp =>
        (Object.values(bajaData[comp as keyof typeof bajaData]) as TeamData[]).some(team => team.Overall.School === initialSchool)
      );
      setCompetitions(competitionsForSchool);
      if (competitionsForSchool.length > 0) {
        setSelectedCompetition(competitionsForSchool[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedSchool && data) {
      const competitionsForSchool = Object.keys(data).filter(comp =>
        (Object.values(data[comp as keyof typeof data]) as TeamData[]).some(team => team.Overall.School === selectedSchool)
      );
      setCompetitions(competitionsForSchool);

      if (!competitionsForSchool.includes(selectedCompetition)) {
        setSelectedCompetition(competitionsForSchool[0]);
      }
    }
  }, [selectedSchool, data, selectedCompetition]);

  useEffect(() => {
    setVisitedViews((prev) =>
      prev[activeView]
        ? prev
        : {
            ...prev,
            [activeView]: true,
          }
    );
  }, [activeView]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50">
        <Header activeView={activeView} setActiveView={setActiveView} />
        {activeView !== "compare" && (
          <FilterBar 
            schools={schools}
            selectedSchool={selectedSchool}
            setSelectedSchool={setSelectedSchool}
            competitions={competitions}
            selectedCompetition={selectedCompetition}
            setSelectedCompetition={setSelectedCompetition}
          />
        )}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-6">
        {activeView === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <CompetitionOverview
                selectedCompetition={selectedCompetition}
                selectedSchool={selectedSchool}
                suppressInitialAnimation={visitedViews.overview}
              />
              <Top10Endurance
                selectedCompetition={selectedCompetition}
                selectedSchool={selectedSchool}
                suppressInitialAnimation={visitedViews.overview}
              />
            </div>
            <MostConsistentPrograms />
          </div>
        )}

        {activeView === "teams" && (
          <div className="space-y-6">
            <TeamPerformance
              selectedSchool={selectedSchool}
              selectedCompetition={selectedCompetition}
              suppressInitialAnimation={visitedViews.teams}
            />
          </div>
        )}

        {activeView === "compare" && (
          <ComparisonView
            schools={schools}
            selectedCompetition={selectedCompetition}
            selectedSchool={selectedSchool}
            suppressInitialAnimation={visitedViews.compare}
          />
        )}
      </main>
    </div>
  )
}
