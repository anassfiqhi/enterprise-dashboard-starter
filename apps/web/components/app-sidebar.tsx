"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  BedDouble,
  Building2,
  CalendarCheck2,
  ClipboardList,
  DollarSign,
  FileText,
  HelpCircleIcon,
  LayoutDashboardIcon,
  Package,
  SearchIcon,
  SettingsIcon,
  Shield,
  Sparkles,
  Tag,
  Users,
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
  const { can, isSuperAdmin, canViewAuditLogs, canViewAnalytics } = usePermissions()
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

    // Bookings section (Reservations)
    if (can("reservations", "read")) {
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

    // Guests section
    if (can("guests", "read")) {
      items.push({
        title: "Guests",
        url: "/guests",
        icon: Users,
        isActive: pathname?.startsWith("/guests") ?? false,
      })
    }

    // Rooms section - room types and physical rooms
    if (can("roomTypes", "read")) {
      items.push({
        title: "Rooms",
        url: "/rooms",
        icon: BedDouble,
        isActive: pathname?.startsWith("/rooms") ?? false,
        items: [
          {
            title: "Room Types",
            url: "/rooms/types",
            isActive: pathname === "/rooms/types",
          },
          {
            title: "Physical Rooms",
            url: "/rooms/list",
            isActive: pathname === "/rooms/list",
          },
        ],
      })
    }

    // Activities section
    if (can("activityTypes", "read")) {
      items.push({
        title: "Activities",
        url: "/activities",
        icon: Sparkles,
        isActive: pathname?.startsWith("/activities") ?? false,
        items: [
          {
            title: "Activity Types",
            url: "/activities/types",
            isActive: pathname === "/activities/types",
          },
          {
            title: "Scheduled Slots",
            url: "/activities/slots",
            isActive: pathname === "/activities/slots",
          },
        ],
      })
    }

    // Inventory section
    if (can("inventory", "read")) {
      items.push({
        title: "Inventory",
        url: "/inventory",
        icon: Package,
        isActive: pathname?.startsWith("/inventory") ?? false,
      })
    }

    // Pricing section
    if (can("pricingRules", "read")) {
      items.push({
        title: "Pricing",
        url: "/pricing",
        icon: DollarSign,
        isActive: pathname?.startsWith("/pricing") ?? false,
      })
    }

    // Promo Codes
    if (can("promoCodes", "read")) {
      items.push({
        title: "Promo Codes",
        url: "/promo-codes",
        icon: Tag,
        isActive: pathname?.startsWith("/promo-codes") ?? false,
      })
    }

    // Analytics
    if (canViewAnalytics) {
      items.push({
        title: "Analytics",
        url: "/analytics",
        icon: ClipboardList,
        isActive: pathname?.startsWith("/analytics") ?? false,
      })
    }

    // Audit Logs
    if (canViewAuditLogs) {
      items.push({
        title: "Audit Logs",
        url: "/audit-logs",
        icon: FileText,
        isActive: pathname?.startsWith("/audit-logs") ?? false,
      })
    }

    // System (Super Admin only) - manage all hotels
    if (isSuperAdmin) {
      items.push({
        title: "System",
        url: "/system",
        icon: Shield,
        isActive: pathname?.startsWith("/system") ?? false,
        items: [
          {
            title: "All Hotels",
            url: "/system/hotels",
            isActive: pathname === "/system/hotels",
          },
          {
            title: "All Users",
            url: "/system/users",
            isActive: pathname === "/system/users",
          },
        ],
      })
    }

    return items
  }, [pathname, can, isSuperAdmin, canViewAnalytics, canViewAuditLogs])

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
