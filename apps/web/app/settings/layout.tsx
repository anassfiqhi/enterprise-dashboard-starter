"use client";

import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, organization, isLoading } = useSelector(
        (state: RootState) => state.session
    );

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isLoading && !user) {
            router.push("/login?redirect=/settings/members");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        // Redirect to home if no organization selected
        if (!isLoading && user && !organization) {
            router.push("/");
        }
    }, [user, organization, isLoading, router]);

    if (isLoading || !user || !organization) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 items-center justify-center">
                    <div className="animate-pulse">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-1 gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                    <SettingsSidebar />
                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
}
