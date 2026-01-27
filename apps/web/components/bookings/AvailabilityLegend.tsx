'use client';

export function AvailabilityLegend() {
    return (
        <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500 dark:bg-green-600" />
                <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500 dark:bg-yellow-600" />
                <span className="text-muted-foreground">Partially Booked</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500 dark:bg-red-600" />
                <span className="text-muted-foreground">Fully Booked</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-400 dark:bg-gray-600" />
                <span className="text-muted-foreground">Closed</span>
            </div>
        </div>
    );
}
