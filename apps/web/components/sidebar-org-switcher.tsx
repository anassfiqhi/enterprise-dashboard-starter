"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { ChevronsUpDown, Plus, Building2 } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { resetFilters as resetReservationsFilters } from "@/lib/reducers/filters/reservationsSlice"
import { resetFilters as resetAvailabilityFilters } from "@/lib/reducers/filters/availabilitySlice"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/hooks/usePermissions"

interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null
}

export function SidebarOrgSwitcher() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isMobile, setOpenMobile } = useSidebar()
  const { data: activeOrg, isPending: isPendingActiveOrg } = authClient.useActiveOrganization()
  const { data: organizations, isPending: isPendingOrganizations } = authClient.useListOrganizations()
  const { isAdmin } = usePermissions()

  const activeHotel = activeOrg ? {
    id: activeOrg.id,
    name: activeOrg.name,
    slug: activeOrg.slug,
    logo: activeOrg.logo
  } : null

  const hotels = organizations?.map(org => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo
  })) ?? []

  const [switchingToId, setSwitchingToId] = useState<string | null>(null)

  // Derived: switching is done when activeOrg catches up to the target
  const isSwitching = switchingToId !== null && activeOrg?.id !== switchingToId

  const handleHotelChange = async (hotel: Organization) => {
    if (hotel.id === activeHotel?.id) return

    try {
      await authClient.organization.setActive({
        organizationId: hotel.id,
      })
      setSwitchingToId(hotel.id)
      toast.success(`Switched to ${hotel.name}`)
      dispatch(resetReservationsFilters())
      dispatch(resetAvailabilityFilters())
      if (isMobile) {
        setOpenMobile(false)
      }
      router.refresh()
    } catch (error) {
      console.error("Failed to switch hotel:", error)
      toast.error("Failed to switch hotel")
      setSwitchingToId(null)
    }
  }

  if (!activeHotel || isSwitching || isPendingActiveOrg) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={isSwitching}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeHotel.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {hotels.length > 1
                    ? `${hotels.length} hotels`
                    : "Hotel"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Hotels
            </DropdownMenuLabel>
            {isPendingOrganizations ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <Skeleton className="size-6 rounded-sm" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))
            ) : (
              hotels.map((hotel) => (
                <DropdownMenuItem
                  key={hotel.id}
                  onClick={() => handleHotelChange(hotel)}
                  className="gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  <span className="truncate">{hotel.name}</span>
                  {hotel.id === activeHotel.id && (
                    <Badge variant="secondary" className="ml-auto">Active</Badge>
                  )}
                </DropdownMenuItem>
              )))}
            {isAdmin && <DropdownMenuSeparator />}
            {isAdmin && <DropdownMenuItem className="gap-2 p-2 cursor-pointer">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <span className="text-muted-foreground">Add hotel</span>
            </DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
