"use client";

import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SystemLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isPending && !session?.user?.isAdmin) {
            router.replace("/");
        }
    }, [isPending, session, router]);

    if (isPending) {
        return null;
    }

    if (!session?.user?.isAdmin) {
        return null;
    }

    return <>{children}</>;
}
