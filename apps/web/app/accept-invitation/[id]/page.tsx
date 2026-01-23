"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, XCircle, Mail } from "lucide-react";

type Status = "loading" | "success" | "error" | "login-required";

export default function AcceptInvitationPage() {
    const params = useParams();
    const router = useRouter();
    const invitationId = params.id as string;

    const [status, setStatus] = useState<Status>("loading");
    const [error, setError] = useState<string | null>(null);
    const [organizationName, setOrganizationName] = useState<string>("");

    useEffect(() => {
        acceptInvitation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitationId]);

    const acceptInvitation = async () => {
        try {
            // First check if user is logged in
            const session = await authClient.getSession();

            if (!session.data?.user) {
                setStatus("login-required");
                return;
            }

            // Accept the invitation
            const result = await authClient.organization.acceptInvitation({
                invitationId,
            });

            if (result.error) {
                throw new Error(result.error.message || "Failed to accept invitation");
            }

            if (result.data) {
                // Get organization ID from the invitation data
                const orgId = result.data.invitation.organizationId;

                // Set as active organization and get its details
                if (orgId) {
                    await authClient.organization.setActive({
                        organizationId: orgId,
                    });

                    // Fetch the organization details to get the name
                    const orgResponse = await authClient.organization.getFullOrganization({
                        query: { organizationId: orgId },
                    });

                    const orgName = orgResponse.data?.name || "the organization";
                    setOrganizationName(orgName);
                } else {
                    setOrganizationName("the organization");
                }

                setStatus("success");
            } else {
                throw new Error("Failed to accept invitation");
            }
        } catch (err) {
            setStatus("error");
            setError(
                err instanceof Error ? err.message : "Invalid or expired invitation"
            );
        }
    };

    const handleLoginRedirect = () => {
        router.push(`/login?redirect=/accept-invitation/${invitationId}`);
    };

    const handleGoToDashboard = () => {
        router.push("/");
        router.refresh();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <CardTitle>Organization Invitation</CardTitle>
                </CardHeader>
                <CardContent>
                    {status === "loading" && (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <Spinner className="h-8 w-8" />
                            <p className="text-muted-foreground">
                                Processing your invitation...
                            </p>
                        </div>
                    )}

                    {status === "login-required" && (
                        <div className="space-y-4 text-center">
                            <p className="text-muted-foreground">
                                Please sign in to accept this invitation.
                            </p>
                            <Button onClick={handleLoginRedirect} className="w-full">
                                Sign In to Continue
                            </Button>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="space-y-4 text-center">
                            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                            <div>
                                <p className="text-lg font-medium">Welcome!</p>
                                <p className="text-muted-foreground">
                                    You&apos;ve successfully joined{" "}
                                    <strong>{organizationName}</strong>
                                </p>
                            </div>
                            <Button onClick={handleGoToDashboard} className="w-full">
                                Go to Dashboard
                            </Button>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-4 text-center">
                            <XCircle className="h-16 w-16 text-destructive mx-auto" />
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/")}
                                    className="flex-1"
                                >
                                    Go Home
                                </Button>
                                <Button
                                    onClick={() => {
                                        setStatus("loading");
                                        setError(null);
                                        acceptInvitation();
                                    }}
                                    className="flex-1"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
