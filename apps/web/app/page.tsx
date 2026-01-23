'use client';

import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { useOrders } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data, isLoading } = useOrders();
  const orders = data?.data || [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          {isLoading ? (
            <div className="px-4 lg:px-6">
              <div className="rounded-lg border p-4">
                <Skeleton className="h-8 w-full mb-4" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <DataTable data={orders} />
          )}
        </div>
      </div>
    </div>
  );
}
