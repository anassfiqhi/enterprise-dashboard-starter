"use client"

import * as React from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import {
  FolderIcon,
  PlusIcon,
  MoreVerticalIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface Project {
  id: string
  name: string
  description: string
  status: "active" | "completed" | "on-hold" | "planning"
  progress: number
  dueDate: string
  teamSize: number
  priority: "low" | "medium" | "high"
}

// Sample projects data
const projectsData: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform Redesign",
    description: "Complete overhaul of the customer-facing storefront with modern UI",
    status: "active",
    progress: 65,
    dueDate: "2024-03-15",
    teamSize: 8,
    priority: "high",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Native iOS and Android applications for better customer engagement",
    status: "active",
    progress: 40,
    dueDate: "2024-04-30",
    teamSize: 6,
    priority: "high",
  },
  {
    id: "3",
    name: "API Integration Suite",
    description: "Third-party API integrations for payment and shipping providers",
    status: "completed",
    progress: 100,
    dueDate: "2024-01-15",
    teamSize: 4,
    priority: "medium",
  },
  {
    id: "4",
    name: "Analytics Dashboard",
    description: "Real-time analytics and reporting dashboard for business insights",
    status: "active",
    progress: 80,
    dueDate: "2024-02-28",
    teamSize: 3,
    priority: "medium",
  },
  {
    id: "5",
    name: "Security Audit",
    description: "Comprehensive security review and penetration testing",
    status: "on-hold",
    progress: 25,
    dueDate: "2024-05-01",
    teamSize: 2,
    priority: "high",
  },
  {
    id: "6",
    name: "Documentation Overhaul",
    description: "Update and improve developer and user documentation",
    status: "planning",
    progress: 10,
    dueDate: "2024-06-15",
    teamSize: 2,
    priority: "low",
  },
]

function getStatusIcon(status: Project["status"]) {
  switch (status) {
    case "completed":
      return <CheckCircle2Icon className="h-4 w-4 text-green-500" />
    case "active":
      return <ClockIcon className="h-4 w-4 text-blue-500" />
    case "on-hold":
      return <AlertCircleIcon className="h-4 w-4 text-yellow-500" />
    case "planning":
      return <FolderIcon className="h-4 w-4 text-gray-500" />
  }
}

function getStatusBadgeVariant(status: Project["status"]) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    case "active":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    case "on-hold":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "planning":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
  }
}

function getPriorityBadgeVariant(priority: Project["priority"]) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    case "medium":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
    case "low":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
  }
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(project.status)}
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVerticalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>Manage Team</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="line-clamp-2 mt-1">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={getStatusBadgeVariant(project.status)}>
            {project.status.replace("-", " ")}
          </Badge>
          <Badge variant="outline" className={getPriorityBadgeVariant(project.priority)}>
            {project.priority} priority
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t text-sm text-muted-foreground">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-1">
            <UsersIcon className="h-3.5 w-3.5" />
            <span>{project.teamSize} members</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function ProjectsPage() {
  const { isLoading } = useSelector((state: RootState) => state.session)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filteredProjects = projectsData.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeCount = projectsData.filter((p) => p.status === "active").length
  const completedCount = projectsData.filter((p) => p.status === "completed").length
  const onHoldCount = projectsData.filter((p) => p.status === "on-hold").length

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
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
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track your team&apos;s projects
              </p>
            </div>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 px-4 lg:px-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Projects</CardDescription>
                <CardTitle className="text-3xl">{activeCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-3xl">{completedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>On Hold</CardDescription>
                <CardTitle className="text-3xl">{onHoldCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 px-4 lg:px-6">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="on-hold">On Hold</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <FolderIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No projects found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
