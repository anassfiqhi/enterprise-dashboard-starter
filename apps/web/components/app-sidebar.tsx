"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  CalendarCheck2,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useCollapsibleMode } from "@/hooks/use-collapsible-mode"
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
  const collapsibleMode = useCollapsibleMode()

  // Build navigation items based on permissions
  const navMain = React.useMemo(() => {
    const items: {
      title: string
      url: string
      icon: typeof LayoutDashboardIcon
      isActive: boolean
      items?: { title: string; url: string; isActive: boolean }[]
    }[] = [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboardIcon,
        isActive: pathname === "/",
      },
    ]

    // Bookings section - reservations, availability, analytics
    if (hasPermission("reservations", "read")) {
      items.push({
        title: "Bookings",
        url: "/bookings",
        icon: CalendarCheck2,
        isActive: pathname?.startsWith("/bookings") ?? false,
        items: [
          {
            title: "Reservations",
            url: "/bookings",
            isActive: pathname === "/bookings",
          },
          {
            title: "Availability",
            url: "/bookings/availability",
            isActive: pathname === "/bookings/availability",
          },
          {
            title: "Analytics",
            url: "/bookings/analytics",
            isActive: pathname === "/bookings/analytics",
          },
        ],
      })
    }

    return items
  }, [pathname, hasPermission])

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
    <Sidebar collapsible={collapsibleMode} {...props}>
      <SidebarHeader>
        <SidebarOrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
