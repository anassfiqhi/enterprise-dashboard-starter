"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  BarChartIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { usePermissions } from "@/hooks/usePermissions"
import { SidebarOrgSwitcher } from "@/components/sidebar-org-switcher"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { hasPermission } = usePermissions()
  const session = useSelector((state: RootState) => state.session)

  // Build navigation items based on permissions
  const navMain = React.useMemo(() => {
    const items = [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboardIcon,
        isActive: pathname === "/",
      },
    ]

    // Only show Orders if user has read permission
    if (hasPermission("orders", "read")) {
      items.push({
        title: "Orders",
        url: "/orders",
        icon: PackageIcon,
        isActive: pathname === "/orders",
      })
    }

    // Additional navigation items to match dashboard-01
    items.push(
      {
        title: "Lifecycle",
        url: "/lifecycle",
        icon: ListIcon,
        isActive: pathname === "/lifecycle",
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChartIcon,
        isActive: pathname === "/analytics",
      },
      {
        title: "Projects",
        url: "/projects",
        icon: FolderIcon,
        isActive: pathname === "/projects",
      },
      {
        title: "Team",
        url: "/team",
        icon: UsersIcon,
        isActive: pathname === "/team",
      }
    )

    return items
  }, [pathname, hasPermission])

  const navDocuments = [
    {
      name: "Data Library",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileIcon,
    },
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "/settings/members",
      icon: SettingsIcon,
      isActive: pathname?.startsWith("/settings") ?? false,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
      isActive: false,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
      isActive: false,
    },
  ]

  // User data from session
  const user = {
    name: session.user?.name || "User",
    email: session.user?.email || "",
    avatar: session.user?.id ? `/avatars/${session.user.id}.jpg` : "/avatars/default.jpg",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarOrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={navDocuments} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
