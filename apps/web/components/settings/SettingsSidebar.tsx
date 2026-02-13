"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        href: "/settings/members",
        label: "Team",
        icon: Users,
        permissions: [
            { resource: "member" as const, actions: ["update", "delete"] },
            { resource: "invitation" as const, actions: ["create", "cancel"] },
        ],
    },
    {
        href: "/settings/organization",
        label: "Organization",
        icon: Building2,
        permissions: [{ resource: "organization" as const, actions: ["update"] }],
    },
];

export function SettingsSidebar() {
    const pathname = usePathname();
    const { canAny } = usePermissions();

    return (
        <aside className="w-64 border-r bg-muted/10 p-4">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <nav className="space-y-1">
                {navItems.map((item) => {
                    // Check if user has any of the required permissions
                    const hasAccess = item.permissions.some((perm) =>
                        perm.actions.some((action) =>
                            canAny([{ resource: perm.resource, action }])
                        )
                    );

                    if (!hasAccess) {
                        return null;
                    }

                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
