"use client"

import * as React from "react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { ChevronsUpDown, Plus, Building2 } from "lucide-react"

import { RootState } from "@/lib/store"
import { authClient } from "@/lib/auth-client"
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

interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null
}

export function SidebarOrgSwitcher() {
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()
  const activeHotel = useSelector((state: RootState) => state.session.activeHotel)
  const hotels = useSelector((state: RootState) => state.session.hotels)
  const [isLoading, setIsLoading] = useState(false)

  const handleHotelChange = async (hotel: Organization) => {
    if (hotel.id === activeHotel?.id) return

    setIsLoading(true)
    try {
      await authClient.organization.setActive({
        organizationId: hotel.id,
      })
      toast.success(`Switched to ${hotel.name}`)
      if (isMobile) {
        setOpenMobile(false)
      }
      router.refresh()
    } catch (error) {
      console.error("Failed to switch hotel:", error)
      toast.error("Failed to switch hotel")
    } finally {
      setIsLoading(false)
    }
  }

  if (!activeHotel) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Enterprise</span>
              <span className="truncate text-xs text-muted-foreground">Dashboard</span>
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
              disabled={isLoading}
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
            {hotels.map((hotel) => (
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
                  <span className="ml-auto text-xs text-muted-foreground">Active</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 cursor-pointer">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <span className="text-muted-foreground">Add hotel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
