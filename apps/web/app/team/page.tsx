"use client"

import * as React from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import {
  MailIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  UserPlusIcon,
  ShieldIcon,
  UserIcon,
  CrownIcon,
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
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  department: string
  status: "active" | "away" | "offline"
  avatar?: string
  joinedAt: string
}

// Sample team data
const teamData: TeamMember[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    role: "owner",
    department: "Engineering",
    status: "active",
    joinedAt: "2023-01-15",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    role: "admin",
    department: "Design",
    status: "active",
    joinedAt: "2023-03-22",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "member",
    department: "Engineering",
    status: "away",
    joinedAt: "2023-06-10",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "member",
    department: "Marketing",
    status: "active",
    joinedAt: "2023-07-05",
  },
  {
    id: "5",
    name: "James Wilson",
    email: "james.wilson@example.com",
    role: "admin",
    department: "Engineering",
    status: "active",
    joinedAt: "2023-02-28",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    role: "member",
    department: "Sales",
    status: "offline",
    joinedAt: "2023-08-15",
  },
  {
    id: "7",
    name: "David Martinez",
    email: "david.martinez@example.com",
    role: "member",
    department: "Support",
    status: "active",
    joinedAt: "2023-09-01",
  },
  {
    id: "8",
    name: "Jennifer Taylor",
    email: "jennifer.taylor@example.com",
    role: "member",
    department: "Design",
    status: "away",
    joinedAt: "2023-10-12",
  },
]

function getRoleIcon(role: TeamMember["role"]) {
  switch (role) {
    case "owner":
      return <CrownIcon className="h-4 w-4 text-yellow-500" />
    case "admin":
      return <ShieldIcon className="h-4 w-4 text-blue-500" />
    case "member":
      return <UserIcon className="h-4 w-4 text-gray-500" />
  }
}

function getRoleBadgeVariant(role: TeamMember["role"]) {
  switch (role) {
    case "owner":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "admin":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    case "member":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
  }
}

function getStatusBadgeVariant(status: TeamMember["status"]) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    case "away":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "offline":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {member.name}
                {getRoleIcon(member.role)}
              </CardTitle>
              <CardDescription className="text-sm">{member.email}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVerticalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Send Message</DropdownMenuItem>
              <DropdownMenuItem>Change Role</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Remove from Team</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getRoleBadgeVariant(member.role)}>
            {member.role}
          </Badge>
          <Badge variant="outline" className={getStatusBadgeVariant(member.status)}>
            {member.status}
          </Badge>
          <Badge variant="secondary">{member.department}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TeamPage() {
  const { isLoading } = useSelector((state: RootState) => state.session)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [departmentFilter, setDepartmentFilter] = React.useState("all")

  const departments = Array.from(new Set(teamData.map((m) => m.department)))

  const filteredMembers = teamData.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment =
      departmentFilter === "all" || member.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const activeCount = teamData.filter((m) => m.status === "active").length
  const adminCount = teamData.filter((m) => m.role === "admin" || m.role === "owner").length

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </CardHeader>
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
              <h1 className="text-2xl font-bold">Team</h1>
              <p className="text-sm text-muted-foreground">
                Manage your team members and their roles
              </p>
            </div>
            <Button>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 px-4 lg:px-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Members</CardDescription>
                <CardTitle className="text-3xl">{teamData.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Now</CardDescription>
                <CardTitle className="text-3xl">{activeCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Admins</CardDescription>
                <CardTitle className="text-3xl">{adminCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 px-4 lg:px-6">
            <div className="relative max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={departmentFilter} onValueChange={setDepartmentFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                {departments.map((dept) => (
                  <TabsTrigger key={dept} value={dept}>
                    {dept}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 lg:px-6">
            {filteredMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
            {filteredMembers.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No team members found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
