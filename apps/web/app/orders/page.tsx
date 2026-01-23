'use client';

import { useOrders } from '@/hooks/useOrders';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { setPage } from '@/lib/features/ui/ordersFiltersSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { OrdersToolbar } from '@/components/orders/OrdersToolbar';
import { useOrderStream } from '@/hooks/useSSE';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function OrdersPage() {
    const { isConnected } = useOrderStream();
    const { data, isLoading, isError, error } = useOrders();
    const dispatch = useDispatch();
    const { page } = useSelector((state: RootState) => state.ordersFilters);

    const parentRef = useRef<HTMLDivElement>(null);

    const rows = data?.data || [];
    const totalPages = data?.meta?.totalPages || 1;

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50,
    });

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                        <div>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="border rounded-md p-4">
                            <Skeleton className="h-10 w-full mb-4" />
                            <div className="space-y-3">
                                {[...Array(10)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 items-center justify-center">
                    <div className="text-lg text-red-500">Error: {error?.message}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div>
                            <h1 className="text-2xl font-bold">Orders</h1>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                {data?.meta?.total} orders total
                                {isConnected && (
                                    <Badge variant="default" className="ml-2 bg-green-600">
                                        <Activity className="h-3 w-3 mr-1" />
                                        Live
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Toolbar with filters */}
                    <div className="px-4 lg:px-6">
                        <OrdersToolbar />
                    </div>

                    {/* Virtualized Table */}
                    <div className="px-4 lg:px-6">
                        <div ref={parentRef} className="border rounded-md min-h-[400px] overflow-auto relative flex-1">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                        const order = rows[virtualRow.index];
                                        return (
                                            <TableRow
                                                key={virtualRow.index}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: `${virtualRow.size}px`,
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                }}
                                            >
                                                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                                                <TableCell>{order.customer}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            order.status === 'delivered'
                                                                ? 'default'
                                                                : order.status === 'cancelled'
                                                                    ? 'destructive'
                                                                    : order.status === 'shipped'
                                                                        ? 'secondary'
                                                                        : 'outline'
                                                        }
                                                        className={
                                                            order.status === 'delivered'
                                                                ? 'bg-green-600'
                                                                : order.status === 'shipped'
                                                                    ? 'bg-blue-600'
                                                                    : ''
                                                        }
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">${order.amount.toFixed(2)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => dispatch(setPage(page - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => dispatch(setPage(page + 1))}
                                disabled={page >= totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
