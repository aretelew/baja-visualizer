import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LineChart, PieChart, TrendingUp } from "lucide-react"
import { MostConsistentPrograms } from "./MostConsistentPrograms"
import { CompetitionOverview } from "./CompetitionOverview"
import { TeamPerformance } from "./TeamPerformance"
import { TrendAnalysis } from "./TrendAnalysis"
import { ComparisonView } from "./ComparisonView"
import { ThemeToggle } from "./ThemeToggle"

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Baja SAE Analytics</h1>
                {/* <p className="text-sm text-muted-foreground">Competition Data 2013-2025</p> */}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto  px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <LineChart className="h-4 w-4" />
              Team Performance
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <PieChart className="h-4 w-4" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CompetitionOverview />
            <TrendAnalysis />
            <MostConsistentPrograms />
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <TeamPerformance />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <ComparisonView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
