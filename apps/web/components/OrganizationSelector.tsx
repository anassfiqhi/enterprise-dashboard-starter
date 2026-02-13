'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function OrganizationSelector() {
    const router = useRouter();
    const activeHotel = useSelector((state: RootState) => state.session.activeHotel);
    const hotels = useSelector((state: RootState) => state.session.hotels);
    const [isLoading, setIsLoading] = useState(false);

    const handleHotelChange = async (hotelId: string) => {
        if (hotelId === activeHotel?.id) return;

        setIsLoading(true);
        try {
            await authClient.organization.setActive({
                organizationId: hotelId,
            });

            toast.success('Hotel switched successfully');
            router.refresh();
        } catch (error) {
            console.error('Failed to switch hotel:', error);
            toast.error('Failed to switch hotel');
        } finally {
            setIsLoading(false);
        }
    };

    if (!activeHotel || hotels.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-[200px] justify-between"
                    disabled={isLoading}
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="truncate">{activeHotel.name}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]" align="start">
                <DropdownMenuLabel>Switch Hotel</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hotels.map((hotel) => (
                    <DropdownMenuItem
                        key={hotel.id}
                        onClick={() => handleHotelChange(hotel.id)}
                        className="cursor-pointer"
                    >
                        <div className="flex items-center justify-between w-full">
                            <span className="truncate">{hotel.name}</span>
                            {hotel.id === activeHotel.id && (
                                <Check className="h-4 w-4" />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
