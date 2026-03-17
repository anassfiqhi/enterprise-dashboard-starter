"use client"

import { useRouter } from "next/navigation"
import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { RoleBadge } from "@/components/ui/role-badge"
import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { Skeleton } from "@/components/ui/skeleton"
import { User } from "@/lib/auth-client"

export function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className={cn("pointer-events-none", "border border-gray-500/20 bg-gradient-to-r from-gray-500/5 to-transparent")}>
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-10 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="ml-auto h-4 w-4" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function NavUser({
  user,
}: {
  user: User
}) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { data: activeMember, isPending: isMemberPending } = authClient.useActiveMember();
  const isAdmin = user.role === 'admin'

  // Get initials from name
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const getRoleBorderClasses = () => {
    if (isAdmin) return 'border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent'
    if (activeMember?.role === 'owner' || activeMember?.role === 'manager')
      return 'border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-transparent'
    if (activeMember?.role === 'staff')
      return 'border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent'
    return 'border border-gray-500/20 bg-gradient-to-r from-gray-500/5 to-transparent'
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
                getRoleBorderClasses()
              )}
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.image ? user.image : undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{user.name}</span>
                  {isAdmin && <RoleBadge role="Admin" size="sm" showTooltip={false} />}
                  {!isAdmin && isMemberPending && <Skeleton className="h-4 w-10 rounded-full" />}
                  {!isAdmin && !isMemberPending && activeMember?.role && (
                    <RoleBadge role={activeMember.role} size="sm" showTooltip={false} />
                  )}
                </div>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image ? user.image : undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{user.name}</span>
                    {isAdmin && <RoleBadge role="Admin" size="sm" showTooltip={false} />}
                    {!isAdmin && isMemberPending && <Skeleton className="h-4 w-10 rounded-full" />}
                    {!isAdmin && !isMemberPending && activeMember?.role && (
                      <RoleBadge role={activeMember.role} size="sm" showTooltip={false} />
                    )}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                  {isAdmin && (
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      System Administrator
                    </span>
                  )}
                  {!isAdmin && activeMember?.role && (
                    <span className={cn(
                      "text-xs font-medium capitalize",
                      activeMember.role.toLowerCase() === 'owner' || activeMember.role.toLowerCase() === 'manager'
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-amber-700 dark:text-amber-300"
                    )}>
                      System {activeMember.role}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCircleIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
