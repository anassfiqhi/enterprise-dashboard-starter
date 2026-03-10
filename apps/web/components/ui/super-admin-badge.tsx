'use client';

import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface SuperAdminBadgeProps {
    className?: string;
    showTooltip?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function SuperAdminBadge({
    className = '',
    showTooltip = true,
    size = 'sm'
}: SuperAdminBadgeProps) {
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

    const badge = (
        <Badge
            variant="outline"
            className={`
        bg-gradient-to-r from-blue-500/10 to-blue-300/10 
        border-blue-500/30 
        text-blue-700 dark:text-blue-300
        font-semibold
        inline-flex items-center
        ${sizeClasses[size]}
        ${className}
      `}
        >
            <Crown className={`${iconSizes[size]} fill-blue-500/20`} />
            <span>Super Admin</span>
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
                    <p className="font-semibold">System Administrator</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Full access to all hotels and system-wide settings. Bypasses all permission checks.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
