'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Hotel, RoomType, ActivityType } from '@repo/shared';
import { useHotel } from '@/hooks/useHotel';
import { useHotelMutations } from '@/hooks/useHotelMutations';
import {
    HotelFormDialog,
    RoomTypeCard,
    RoomTypeFormDialog,
    ActivityTypeCard,
    ActivityTypeFormDialog,
    DeleteConfirmDialog,
} from '@/components/hotels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Building2,
    MapPin,
    Globe,
    Pencil,
    Plus,
    BedDouble,
    Activity,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';

type DeleteTarget =
    | { type: 'hotel'; hotel: Hotel }
    | { type: 'roomType'; roomType: RoomType }
    | { type: 'activityType'; activityType: ActivityType };

export default function HotelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const hotelId = params.id as string;

    const { data: hotel, isLoading } = useHotel(hotelId);
    const { deleteHotel, deleteRoomType, deleteActivityType } = useHotelMutations();

    // Hotel edit state
    const [hotelFormOpen, setHotelFormOpen] = useState(false);

    // Room type state
    const [roomTypeFormOpen, setRoomTypeFormOpen] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);

    // Activity type state
    const [activityFormOpen, setActivityFormOpen] = useState(false);
    const [editingActivityType, setEditingActivityType] = useState<ActivityType | null>(null);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

    const handleEditRoomType = (roomType: RoomType) => {
        setEditingRoomType(roomType);
        setRoomTypeFormOpen(true);
    };

    const handleDeleteRoomType = (roomType: RoomType) => {
        setDeleteTarget({ type: 'roomType', roomType });
        setDeleteDialogOpen(true);
    };

    const handleEditActivityType = (activityType: ActivityType) => {
        setEditingActivityType(activityType);
        setActivityFormOpen(true);
    };

    const handleDeleteActivityType = (activityType: ActivityType) => {
        setDeleteTarget({ type: 'activityType', activityType });
        setDeleteDialogOpen(true);
    };

    const handleDeleteHotel = () => {
        if (hotel) {
            setDeleteTarget({ type: 'hotel', hotel: hotel as Hotel });
            setDeleteDialogOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'hotel') {
            await deleteHotel.mutateAsync(deleteTarget.hotel.id);
            router.push('/hotels');
        } else if (deleteTarget.type === 'roomType') {
            await deleteRoomType.mutateAsync({
                id: deleteTarget.roomType.id,
                hotelId,
            });
        } else if (deleteTarget.type === 'activityType') {
            await deleteActivityType.mutateAsync({
                id: deleteTarget.activityType.id,
                hotelId,
            });
        }

        setDeleteDialogOpen(false);
        setDeleteTarget(null);
    };

    const getDeleteDialogProps = () => {
        if (!deleteTarget) return { title: '', description: '' };

        switch (deleteTarget.type) {
            case 'hotel':
                return {
                    title: 'Delete Hotel',
                    description: `Are you sure you want to delete "${deleteTarget.hotel.name}"? This will also delete all associated room types and activities. This action cannot be undone.`,
                };
            case 'roomType':
                return {
                    title: 'Delete Room Type',
                    description: `Are you sure you want to delete "${deleteTarget.roomType.name}"? This action cannot be undone.`,
                };
            case 'activityType':
                return {
                    title: 'Delete Activity',
                    description: `Are you sure you want to delete "${deleteTarget.activityType.name}"? This action cannot be undone.`,
                };
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="flex flex-col gap-4 py-4 px-4 lg:px-6 md:gap-6 md:py-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-[200px]" />
                    <Skeleton className="h-[300px]" />
                </div>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Hotel not found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    The hotel you're looking for doesn't exist.
                </p>
                <Button asChild>
                    <Link href="/hotels">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Hotels
                    </Link>
                </Button>
            </div>
        );
    }

    const address = hotel.address;
    const locationString = address
        ? [address.street, address.city, address.state, address.country, address.postalCode]
              .filter(Boolean)
              .join(', ')
        : 'No address';

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Back Button */}
                    <div className="px-4 lg:px-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/hotels">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Hotels
                            </Link>
                        </Button>
                    </div>

                    {/* Hotel Info Card */}
                    <div className="px-4 lg:px-6">
                        <Card>
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <Building2 className="h-6 w-6 text-muted-foreground" />
                                        {hotel.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" />
                                        {locationString}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setHotelFormOpen(true)}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDeleteHotel}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Globe className="h-4 w-4" />
                                        <span>{hotel.timezone}</span>
                                    </div>
                                    <Badge variant="secondary">
                                        {hotel.roomTypes?.length || 0} Room Types
                                    </Badge>
                                    <Badge variant="outline">
                                        {hotel.activityTypes?.length || 0} Activities
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Room Types & Activities Tabs */}
                    <div className="px-4 lg:px-6">
                        <Tabs defaultValue="rooms" className="w-full">
                            <TabsList>
                                <TabsTrigger value="rooms" className="flex items-center gap-2">
                                    <BedDouble className="h-4 w-4" />
                                    Room Types
                                </TabsTrigger>
                                <TabsTrigger value="activities" className="flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Activities
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="rooms" className="mt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium">Room Types</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Manage room categories and pricing
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setEditingRoomType(null);
                                            setRoomTypeFormOpen(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Room Type
                                    </Button>
                                </div>

                                {!hotel.roomTypes || hotel.roomTypes.length === 0 ? (
                                    <Card className="p-8 text-center">
                                        <BedDouble className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                        <h4 className="font-medium mb-1">No room types yet</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Add room types to start accepting bookings
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setEditingRoomType(null);
                                                setRoomTypeFormOpen(true);
                                            }}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Room Type
                                        </Button>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {hotel.roomTypes.map((roomType) => (
                                            <RoomTypeCard
                                                key={roomType.id}
                                                roomType={roomType}
                                                onEdit={handleEditRoomType}
                                                onDelete={handleDeleteRoomType}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="activities" className="mt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium">Activities</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Manage activities and experiences
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setEditingActivityType(null);
                                            setActivityFormOpen(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Activity
                                    </Button>
                                </div>

                                {!hotel.activityTypes || hotel.activityTypes.length === 0 ? (
                                    <Card className="p-8 text-center">
                                        <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                        <h4 className="font-medium mb-1">No activities yet</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Add activities guests can book
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setEditingActivityType(null);
                                                setActivityFormOpen(true);
                                            }}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Activity
                                        </Button>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {hotel.activityTypes.map((activityType) => (
                                            <ActivityTypeCard
                                                key={activityType.id}
                                                activityType={activityType}
                                                onEdit={handleEditActivityType}
                                                onDelete={handleDeleteActivityType}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <HotelFormDialog
                open={hotelFormOpen}
                onOpenChange={setHotelFormOpen}
                hotel={hotel}
            />

            <RoomTypeFormDialog
                open={roomTypeFormOpen}
                onOpenChange={(open) => {
                    setRoomTypeFormOpen(open);
                    if (!open) setEditingRoomType(null);
                }}
                hotelId={hotelId}
                roomType={editingRoomType}
            />

            <ActivityTypeFormDialog
                open={activityFormOpen}
                onOpenChange={(open) => {
                    setActivityFormOpen(open);
                    if (!open) setEditingActivityType(null);
                }}
                hotelId={hotelId}
                activityType={editingActivityType}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                {...getDeleteDialogProps()}
                onConfirm={confirmDelete}
                isPending={
                    deleteHotel.isPending ||
                    deleteRoomType.isPending ||
                    deleteActivityType.isPending
                }
            />
        </div>
    );
}
