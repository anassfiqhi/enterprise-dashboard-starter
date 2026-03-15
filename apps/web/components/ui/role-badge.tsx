'use client';

import { ShieldCheck, UserCog, User, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export type DisplayRole = 'Admin' | 'Manager' | 'Staff';

interface RoleBadgeProps {
    role: string | DisplayRole;
    className?: string;
    showTooltip?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Maps internal roles to the three display roles
 */
export function getDisplayRole(role: string): DisplayRole {
    const r = role.toLowerCase();
    if (r === 'super-admin' || r === 'admin') return 'Admin';
    if (r === 'owner' || r === 'manager') return 'Manager';
    return 'Staff'; // Default to staff for member or any other role
}

const roleConfigs: Record<DisplayRole, {
    label: string;
    description: string;
    icon: LucideIcon;
    colors: string;
    iconBg: string;
}> = {
    Admin: {
        label: 'Admin',
        description: 'Full system access and management.',
        icon: ShieldCheck,
        colors: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
        iconBg: 'fill-blue-500/20',
    },
    Manager: {
        label: 'Manager',
        description: 'Organization management and oversight.',
        icon: UserCog,
        colors: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
        iconBg: 'fill-emerald-500/20',
    },
    Staff: {
        label: 'Staff',
        description: 'Regular organization access.',
        icon: User,
        colors: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
        iconBg: 'fill-amber-500/20',
    },
};

export function RoleBadge({
    role,
    className = '',
    showTooltip = true,
    size = 'sm'
}: RoleBadgeProps) {
    const displayRole = getDisplayRole(role);
    const config = roleConfigs[displayRole];

    const sizeClasses = {
        sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
        md: 'text-xs px-2 py-1 gap-1',
        lg: 'text-sm px-2.5 py-1 gap-1.5',
    };

    const iconSizes = {
        sm: 'h-2.5 w-2.5',
        md: 'h-3 w-3',
        lg: 'h-3.5 w-3.5',
    };

    const Icon = config.icon;

    const badge = (
        <Badge
            variant="outline"
            className={cn(
                "font-semibold inline-flex items-center",
                config.colors,
                sizeClasses[size],
                className
            )}
        >
            <Icon className={cn(iconSizes[size], config.iconBg)} />
            <span>{config.label}</span>
        </Badge>
    );

    if (!showTooltip) {
        return badge;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-semibold">{config.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {config.description}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
