"use client"

import Link from "next/link"
import { ChevronRightIcon, PlusCircleIcon, type LucideIcon } from "lucide-react"
import * as Collapsible from "@radix-ui/react-collapsible"


import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
    isActive?: boolean
  }[]
}

export function NavSecondary({
  items,
  ...props
}: {
  items: NavItem[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            item.items && item.items.length > 0 ? (
              <Collapsible.Root
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <Collapsible.Trigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </Collapsible.Content>
                </SidebarMenuItem>
              </Collapsible.Root>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
