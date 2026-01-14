'use client';

import { useOrders } from '@/hooks/useOrders';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { setPage } from '@/lib/features/orders/ordersSlice';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import { useOrderStream } from '@/hooks/useOrderStream';

export default function OrdersPage() {
    useOrderStream();
    const { data, isLoading, isError } = useOrders();
    const dispatch = useDispatch();
    const { page } = useSelector((state: RootState) => state.orders);

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: data?.data.length || 0,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50, // Estimate row height
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading orders</div>;

    return (
        <div className="p-8 h-screen flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Orders</h1>

            {/* Toolbar Placeholder */}
            <div className="flex gap-2">
                <Button onClick={() => dispatch(setPage(page - 1))} disabled={page === 1}>Previous</Button>
                <span>Page {page}</span>
                <Button onClick={() => dispatch(setPage(page + 1))}>Next</Button>
            </div>

            {/* Virtualized Table Container */}
            <div ref={parentRef} className="border rounded-md h-[500px] overflow-auto relative">
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const order = data?.data[virtualRow.index];
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
                                    {order ? (
                                        <>
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{order.customer}</TableCell>
                                            <TableCell>{order.status}</TableCell>
                                            <TableCell>${order.amount}</TableCell>
                                        </>
                                    ) : <TableCell colSpan={4}>Loading...</TableCell>}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
