"use client"

import * as React from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  FilterIcon,
  MoreVerticalIcon,
  PlusIcon,
  RefreshCwIcon,
  XCircleIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface LifecycleStage {
  id: string
  name: string
  description: string
  status: "completed" | "current" | "upcoming" | "blocked"
  items: number
  completedItems: number
  dueDate?: string
}

interface LifecycleItem {
  id: string
  title: string
  stage: string
  priority: "low" | "medium" | "high" | "critical"
  assignee: string
  dueDate: string
  status: "pending" | "in-progress" | "review" | "completed" | "blocked"
}

// Lifecycle stages
const stagesData: LifecycleStage[] = [
  {
    id: "1",
    name: "Discovery",
    description: "Initial research and requirements gathering",
    status: "completed",
    items: 8,
    completedItems: 8,
    dueDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Planning",
    description: "Define scope, timeline, and resources",
    status: "completed",
    items: 12,
    completedItems: 12,
    dueDate: "2024-01-30",
  },
  {
    id: "3",
    name: "Development",
    description: "Build and implement features",
    status: "current",
    items: 24,
    completedItems: 18,
    dueDate: "2024-03-15",
  },
  {
    id: "4",
    name: "Testing",
    description: "Quality assurance and bug fixes",
    status: "upcoming",
    items: 16,
    completedItems: 0,
    dueDate: "2024-04-01",
  },
  {
    id: "5",
    name: "Deployment",
    description: "Launch and release to production",
    status: "upcoming",
    items: 6,
    completedItems: 0,
    dueDate: "2024-04-15",
  },
]

// Lifecycle items for current stage
const itemsData: LifecycleItem[] = [
  {
    id: "1",
    title: "Implement user authentication",
    stage: "Development",
    priority: "critical",
    assignee: "Alex Johnson",
    dueDate: "2024-02-10",
    status: "completed",
  },
  {
    id: "2",
    title: "Build dashboard components",
    stage: "Development",
    priority: "high",
    assignee: "Sarah Chen",
    dueDate: "2024-02-15",
    status: "completed",
  },
  {
    id: "3",
    title: "API integration for orders",
    stage: "Development",
    priority: "high",
    assignee: "Michael Brown",
    dueDate: "2024-02-20",
    status: "in-progress",
  },
  {
    id: "4",
    title: "Mobile responsive layouts",
    stage: "Development",
    priority: "medium",
    assignee: "Emily Davis",
    dueDate: "2024-02-25",
    status: "in-progress",
  },
  {
    id: "5",
    title: "Real-time notifications",
    stage: "Development",
    priority: "medium",
    assignee: "James Wilson",
    dueDate: "2024-03-01",
    status: "pending",
  },
  {
    id: "6",
    title: "Analytics dashboard",
    stage: "Development",
    priority: "low",
    assignee: "Lisa Anderson",
    dueDate: "2024-03-10",
    status: "pending",
  },
]

function getStatusIcon(status: LifecycleStage["status"]) {
  switch (status) {
    case "completed":
      return <CheckCircle2Icon className="h-5 w-5 text-green-500" />
    case "current":
      return <RefreshCwIcon className="h-5 w-5 text-blue-500 animate-spin" />
    case "upcoming":
      return <CircleIcon className="h-5 w-5 text-gray-400" />
    case "blocked":
      return <XCircleIcon className="h-5 w-5 text-red-500" />
  }
}

function getItemStatusBadge(status: LifecycleItem["status"]) {
  const variants: Record<string, string> = {
    "pending": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "review": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    "completed": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    "blocked": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }
  return variants[status] || variants["pending"]
}

function getPriorityBadge(priority: LifecycleItem["priority"]) {
  const variants: Record<string, string> = {
    "low": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    "medium": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "high": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    "critical": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }
  return variants[priority] || variants["medium"]
}

function StageCard({ stage, isLast }: { stage: LifecycleStage; isLast: boolean }) {
  const progress = (stage.completedItems / stage.items) * 100

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-muted bg-background">
          {getStatusIcon(stage.status)}
        </div>
        {!isLast && (
          <div className="w-0.5 h-full min-h-16 bg-muted" />
        )}
      </div>
      <Card className={`flex-1 ${stage.status === "current" ? "border-blue-500 border-2" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{stage.name}</CardTitle>
              <CardDescription>{stage.description}</CardDescription>
            </div>
            {stage.dueDate && (
              <Badge variant="outline" className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {new Date(stage.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {stage.completedItems} of {stage.items} items completed
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ItemCard({ item }: { item: LifecycleItem }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{item.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVerticalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Item</DropdownMenuItem>
              <DropdownMenuItem>Change Status</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className={getItemStatusBadge(item.status)}>
            {item.status.replace("-", " ")}
          </Badge>
          <Badge variant="outline" className={getPriorityBadge(item.priority)}>
            {item.priority}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{item.assignee}</span>
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LifecyclePage() {
  const { isLoading } = useSelector((state: RootState) => state.session)

  const currentStage = stagesData.find((s) => s.status === "current")
  const totalItems = stagesData.reduce((acc, s) => acc + s.items, 0)
  const completedItems = stagesData.reduce((acc, s) => acc + s.completedItems, 0)
  const overallProgress = (completedItems / totalItems) * 100

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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-bold">Lifecycle</h1>
              <p className="text-sm text-muted-foreground">
                Track project phases and deliverables
              </p>
            </div>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Overall Progress */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Overall Progress</CardTitle>
                    <CardDescription>
                      Currently in {currentStage?.name} phase
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {Math.round(overallProgress)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={overallProgress} className="h-3" />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{completedItems} items completed</span>
                  <span>{totalItems - completedItems} items remaining</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-6">
            {/* Stages Timeline */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Stages</h2>
              <div className="space-y-0">
                {stagesData.map((stage, index) => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    isLast={index === stagesData.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Current Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Current Items</h2>
                <Button variant="outline" size="sm">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="grid gap-4">
                {itemsData.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
