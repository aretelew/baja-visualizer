"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

export interface TestGraphProps {
  data: {
    token?: string
    school: string
    score: number
    label: string
    fill: string
  }[]
  config?: ChartConfig
}

export function Component({ data, config }: TestGraphProps) {
  const chartConfig = config || {
    score: {
      label: "Score",
      color: "#2563eb",
    },
  }

  // Construct legend payload for ChartLegend
  // We use item.token as the 'value' which ChartLegendContent uses to lookup in chartConfig
  const legendPayload = data
    .filter((item) => item.token && chartConfig[item.token])
    .map((item) => ({
      value: item.token!,
      type: "square" as const,
      color: item.fill,
      id: item.token!,
    }))

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={false}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="score" radius={4}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
        {legendPayload.length > 0 && (
          <ChartLegend content={() => <ChartLegendContent payload={legendPayload} />} />
        )}
      </BarChart>
    </ChartContainer>
  )
}
