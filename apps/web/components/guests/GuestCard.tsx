'use client';

import type { GuestWithStats } from '@/hooks/useGuests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, DollarSign, MoreVertical, Pencil, Trash2, Eye, Globe, CreditCard } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface GuestCardProps {
    guest: GuestWithStats;
    onEdit?: (guest: GuestWithStats) => void;
    onDelete?: (guest: GuestWithStats) => void;
}

const ID_TYPE_LABELS: Record<string, string> = {
    passport: 'Passport',
    drivers_license: "Driver's License",
    national_id: 'National ID',
};

export function GuestCard({ guest, onEdit, onDelete }: GuestCardProps) {
    const fullName = `${guest.firstName} ${guest.lastName}`;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getIdTypeLabel = (idType: string | undefined) => {
        if (!idType) return null;
        return ID_TYPE_LABELS[idType] || idType;
    };

    return (
        <Card className="group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        {fullName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {guest.email}
                    </CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/guests/${guest.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(guest)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Guest
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete?.(guest)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Guest
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                {/* Contact & Document Info */}
                <div className="space-y-2 mb-3">
                    {guest.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{guest.phone}</span>
                        </div>
                    )}
                    {guest.nationality && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="h-3.5 w-3.5" />
                            <span>{guest.nationality}</span>
                        </div>
                    )}
                    {guest.idType && (
                        <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                            <Badge variant="secondary" className="text-xs">
                                {getIdTypeLabel(guest.idType)}
                            </Badge>
                            {guest.idNumber && (
                                <span className="text-muted-foreground">{guest.idNumber}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-muted-foreground">Reservations</p>
                            <p className="font-medium">{guest.reservationCount}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-muted-foreground">Total Spent</p>
                            <p className="font-medium">{formatCurrency(guest.totalSpent)}</p>
                        </div>
                    </div>
                </div>
                {guest.lastStay && (
                    <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                        Last stay: {formatDate(guest.lastStay)}
                    </div>
                )}
                <div className="mt-4 pt-4 border-t">
                    <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/guests/${guest.id}`}>
                            View Profile
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
