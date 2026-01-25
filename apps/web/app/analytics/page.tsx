"use client"

import * as React from "react"
import { useMetrics } from "@/hooks/useMetrics"
import { TrendingUpIcon, TrendingDownIcon, BarChart3Icon, PieChartIcon, LineChartIcon, ActivityIcon } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"

// Sample analytics data
const revenueData = [
  { month: "Jan", revenue: 18600, orders: 234 },
  { month: "Feb", revenue: 30500, orders: 312 },
  { month: "Mar", revenue: 23700, orders: 287 },
  { month: "Apr", revenue: 27300, orders: 298 },
  { month: "May", revenue: 35900, orders: 421 },
  { month: "Jun", revenue: 42100, orders: 489 },
]

const trafficData = [
  { date: "2024-01", desktop: 4800, mobile: 2300, tablet: 800 },
  { date: "2024-02", desktop: 5200, mobile: 2800, tablet: 920 },
  { date: "2024-03", desktop: 4900, mobile: 3100, tablet: 870 },
  { date: "2024-04", desktop: 6100, mobile: 3600, tablet: 1050 },
  { date: "2024-05", desktop: 7300, mobile: 4200, tablet: 1180 },
  { date: "2024-06", desktop: 8100, mobile: 4800, tablet: 1320 },
]

const conversionData = [
  { name: "Landing", value: 4500 },
  { name: "Sign Up", value: 3200 },
  { name: "Cart", value: 2100 },
  { name: "Checkout", value: 1800 },
  { name: "Purchase", value: 1200 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
  tablet: {
    label: "Tablet",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const { data: metrics, isLoading } = useMetrics()
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("6m")

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format(value)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Track your business performance and growth metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={setTimeRange}
                variant="outline"
                className="hidden md:flex"
              >
                <ToggleGroupItem value="7d" className="h-8 px-2.5">
                  7 days
                </ToggleGroupItem>
                <ToggleGroupItem value="30d" className="h-8 px-2.5">
                  30 days
                </ToggleGroupItem>
                <ToggleGroupItem value="6m" className="h-8 px-2.5">
                  6 months
                </ToggleGroupItem>
              </ToggleGroup>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="md:hidden w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="6m">6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Total Revenue</CardDescription>
                <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics?.totalRevenue || 0)}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUpIcon className="h-3 w-3" />
                  +12.5% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Active Users</CardDescription>
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(metrics?.activeNow || 0).toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUpIcon className="h-3 w-3" />
                  +8.2% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Conversion Rate</CardDescription>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <TrendingDownIcon className="h-3 w-3" />
                  -0.4% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Avg Order Value</CardDescription>
                <LineChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$142.50</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUpIcon className="h-3 w-3" />
                  +5.3% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="revenue" className="px-4 lg:px-6">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="traffic">Traffic</TabsTrigger>
              <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue and order trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        fill="url(#fillRevenue)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  <TrendingUpIcon className="mr-1 h-4 w-4 text-green-500" />
                  Revenue is up 23% compared to last period
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="traffic" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic by Device</CardTitle>
                  <CardDescription>Breakdown of visitors by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <BarChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="desktop" fill="var(--color-desktop)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="mobile" fill="var(--color-mobile)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tablet" fill="var(--color-tablet)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Mobile traffic increased by 18% this quarter
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="funnel" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                  <CardDescription>User journey from landing to purchase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conversionData.map((step, index) => {
                      const percentage = (step.value / conversionData[0].value) * 100
                      const dropoff = index > 0
                        ? ((conversionData[index - 1].value - step.value) / conversionData[index - 1].value * 100).toFixed(1)
                        : null
                      return (
                        <div key={step.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{step.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {step.value.toLocaleString()}
                              </span>
                              {dropoff && (
                                <Badge variant="outline" className="text-xs text-red-600">
                                  -{dropoff}%
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Overall conversion rate: 26.7% from landing to purchase
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
