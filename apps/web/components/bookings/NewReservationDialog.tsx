'use client';

import { useState, useMemo } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { Guest, Hotel, RoomType, ActivityType } from '@repo/shared';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHotels } from '@/hooks/useHotels';
import { useHotel } from '@/hooks/useHotel';
import { useGuests, type GuestWithStats } from '@/hooks/useGuests';
import { useReservationMutations } from '@/hooks/useReservationMutations';
import { cn } from '@/lib/utils';
import {
    CalendarIcon,
    User,
    Hotel as HotelIcon,
    Bed,
    Activity,
    ChevronRight,
    ChevronLeft,
    Search,
    Check,
} from 'lucide-react';

interface NewReservationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type BookingType = 'room' | 'activity';
type WizardStep = 'guest' | 'selection' | 'dates' | 'review';

interface ReservationForm {
    guestId: string;
    guest: GuestWithStats | null;
    hotelId: string;
    hotel: Hotel | null;
    bookingType: BookingType;
    roomTypeId: string;
    roomType: RoomType | null;
    activityTypeId: string;
    activityType: ActivityType | null;
    checkInDate: Date | undefined;
    checkOutDate: Date | undefined;
    guestCount: number;
    specialRequests: string;
}

const STEPS: WizardStep[] = ['guest', 'selection', 'dates', 'review'];

export function NewReservationDialog({ open, onOpenChange }: NewReservationDialogProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>('guest');
    const [guestSearch, setGuestSearch] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const [form, setForm] = useState<ReservationForm>({
        guestId: '',
        guest: null,
        hotelId: '',
        hotel: null,
        bookingType: 'room',
        roomTypeId: '',
        roomType: null,
        activityTypeId: '',
        activityType: null,
        checkInDate: undefined,
        checkOutDate: undefined,
        guestCount: 1,
        specialRequests: '',
    });

    const { data: hotelsData } = useHotels();
    const { data: hotelDetail } = useHotel(form.hotelId || undefined);
    const { data: guestsData } = useGuests({ search: guestSearch, pageSize: 10 });
    const { createReservation } = useReservationMutations();

    const hotels = hotelsData || [];
    const guests = guestsData?.data || [];
    const roomTypes = hotelDetail?.roomTypes || [];
    const activityTypes = hotelDetail?.activityTypes || [];

    const currentStepIndex = STEPS.indexOf(currentStep);

    const handleGuestSelect = (guest: GuestWithStats) => {
        setForm({ ...form, guestId: guest.id, guest });
    };

    const handleHotelSelect = (hotelId: string) => {
        const hotel = hotels.find((h) => h.id === hotelId) || null;
        setForm({
            ...form,
            hotelId,
            hotel,
            roomTypeId: '',
            roomType: null,
            activityTypeId: '',
            activityType: null,
        });
    };

    const handleRoomTypeSelect = (roomTypeId: string) => {
        const roomType = roomTypes.find((rt) => rt.id === roomTypeId) || null;
        setForm({
            ...form,
            roomTypeId,
            roomType,
            activityTypeId: '',
            activityType: null,
            bookingType: 'room',
        });
    };

    const handleActivityTypeSelect = (activityTypeId: string) => {
        const activityType = activityTypes.find((at) => at.id === activityTypeId) || null;
        setForm({
            ...form,
            activityTypeId,
            activityType,
            roomTypeId: '',
            roomType: null,
            bookingType: 'activity',
        });
    };

    const handleDateRangeSelect = (range: DateRange | undefined) => {
        setDateRange(range);
        setForm({
            ...form,
            checkInDate: range?.from,
            checkOutDate: range?.to,
        });
    };

    const canProceed = useMemo(() => {
        switch (currentStep) {
            case 'guest':
                return !!form.guestId;
            case 'selection':
                return !!form.hotelId && (!!form.roomTypeId || !!form.activityTypeId);
            case 'dates':
                if (form.bookingType === 'room') {
                    return !!form.checkInDate && !!form.checkOutDate;
                }
                return !!form.checkInDate;
            case 'review':
                return true;
            default:
                return false;
        }
    }, [currentStep, form]);

    const nights = useMemo(() => {
        if (form.checkInDate && form.checkOutDate) {
            return differenceInDays(form.checkOutDate, form.checkInDate);
        }
        return 0;
    }, [form.checkInDate, form.checkOutDate]);

    const estimatedTotal = useMemo(() => {
        if (form.bookingType === 'room' && form.roomType && nights > 0) {
            return form.roomType.basePrice * nights;
        }
        if (form.bookingType === 'activity' && form.activityType) {
            return form.activityType.basePrice * form.guestCount;
        }
        return 0;
    }, [form.bookingType, form.roomType, form.activityType, nights, form.guestCount]);

    const handleNext = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < STEPS.length) {
            setCurrentStep(STEPS[nextIndex]);
        }
    };

    const handleBack = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(STEPS[prevIndex]);
        }
    };

    const handleSubmit = async () => {
        await createReservation.mutateAsync({
            guestId: form.guestId,
            hotelId: form.hotelId,
            roomTypeId: form.bookingType === 'room' ? form.roomTypeId : undefined,
            activityTypeId: form.bookingType === 'activity' ? form.activityTypeId : undefined,
            checkInDate: form.checkInDate ? format(form.checkInDate, 'yyyy-MM-dd') : undefined,
            checkOutDate: form.checkOutDate ? format(form.checkOutDate, 'yyyy-MM-dd') : undefined,
            guests: form.guestCount,
            specialRequests: form.specialRequests || undefined,
        });

        // Reset form and close
        setForm({
            guestId: '',
            guest: null,
            hotelId: '',
            hotel: null,
            bookingType: 'room',
            roomTypeId: '',
            roomType: null,
            activityTypeId: '',
            activityType: null,
            checkInDate: undefined,
            checkOutDate: undefined,
            guestCount: 1,
            specialRequests: '',
        });
        setDateRange(undefined);
        setCurrentStep('guest');
        onOpenChange(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>New Reservation</DialogTitle>
                    <DialogDescription>
                        Create a new booking by following the steps below
                    </DialogDescription>
                </DialogHeader>

                {/* Progress indicator */}
                <div className="flex items-center justify-between mb-6">
                    {STEPS.map((step, index) => (
                        <div key={step} className="flex items-center">
                            <div
                                className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                                    index < currentStepIndex
                                        ? 'bg-primary text-primary-foreground'
                                        : index === currentStepIndex
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                )}
                            >
                                {index < currentStepIndex ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span
                                className={cn(
                                    'ml-2 text-sm capitalize hidden sm:inline',
                                    index === currentStepIndex
                                        ? 'font-medium'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {step}
                            </span>
                            {index < STEPS.length - 1 && (
                                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step: Select Guest */}
                {currentStep === 'guest' && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search guests by name or email..."
                                value={guestSearch}
                                onChange={(e) => setGuestSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                            {guests.map((guest) => (
                                <Card
                                    key={guest.id}
                                    className={cn(
                                        'cursor-pointer transition-colors hover:bg-accent',
                                        form.guestId === guest.id && 'border-primary bg-accent'
                                    )}
                                    onClick={() => handleGuestSelect(guest)}
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {guest.firstName} {guest.lastName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {guest.email}
                                                </p>
                                            </div>
                                        </div>
                                        {form.guestId === guest.id && (
                                            <Check className="h-5 w-5 text-primary" />
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {guests.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    No guests found. Try a different search.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step: Select Hotel and Room/Activity */}
                {currentStep === 'selection' && (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Select Hotel</Label>
                            <Select value={form.hotelId} onValueChange={handleHotelSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a hotel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hotels.map((hotel) => (
                                        <SelectItem key={hotel.id} value={hotel.id}>
                                            <div className="flex items-center gap-2">
                                                <HotelIcon className="h-4 w-4" />
                                                {hotel.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {form.hotelId && (
                            <Tabs
                                value={form.bookingType}
                                onValueChange={(v) =>
                                    setForm({ ...form, bookingType: v as BookingType })
                                }
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="room">
                                        <Bed className="h-4 w-4 mr-2" />
                                        Room
                                    </TabsTrigger>
                                    <TabsTrigger value="activity">
                                        <Activity className="h-4 w-4 mr-2" />
                                        Activity
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="room" className="mt-4">
                                    <div className="grid gap-2">
                                        {roomTypes.length > 0 ? (
                                            roomTypes.map((rt) => (
                                                <Card
                                                    key={rt.id}
                                                    className={cn(
                                                        'cursor-pointer transition-colors hover:bg-accent',
                                                        form.roomTypeId === rt.id &&
                                                            'border-primary bg-accent'
                                                    )}
                                                    onClick={() => handleRoomTypeSelect(rt.id)}
                                                >
                                                    <CardContent className="p-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{rt.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Up to {rt.capacity} guests
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary">
                                                                {formatCurrency(rt.basePrice)}/night
                                                            </Badge>
                                                            {form.roomTypeId === rt.id && (
                                                                <Check className="h-5 w-5 text-primary" />
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <p className="text-center text-muted-foreground py-4">
                                                No room types available
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="activity" className="mt-4">
                                    <div className="grid gap-2">
                                        {activityTypes.length > 0 ? (
                                            activityTypes.map((at) => (
                                                <Card
                                                    key={at.id}
                                                    className={cn(
                                                        'cursor-pointer transition-colors hover:bg-accent',
                                                        form.activityTypeId === at.id &&
                                                            'border-primary bg-accent'
                                                    )}
                                                    onClick={() => handleActivityTypeSelect(at.id)}
                                                >
                                                    <CardContent className="p-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{at.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {at.duration} minutes
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary">
                                                                {formatCurrency(at.basePrice)}
                                                            </Badge>
                                                            {form.activityTypeId === at.id && (
                                                                <Check className="h-5 w-5 text-primary" />
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <p className="text-center text-muted-foreground py-4">
                                                No activities available
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                )}

                {/* Step: Select Dates */}
                {currentStep === 'dates' && (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>
                                {form.bookingType === 'room'
                                    ? 'Select Check-in and Check-out Dates'
                                    : 'Select Activity Date'}
                            </Label>
                            <div className="flex justify-center">
                                {form.bookingType === 'room' ? (
                                    <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={handleDateRangeSelect}
                                        numberOfMonths={2}
                                        disabled={(date) => date < new Date()}
                                        className="rounded-md border"
                                    />
                                ) : (
                                    <Calendar
                                        mode="single"
                                        selected={form.checkInDate}
                                        onSelect={(date) => {
                                            setForm({
                                                ...form,
                                                checkInDate: date,
                                                checkOutDate: date,
                                            });
                                        }}
                                        numberOfMonths={2}
                                        disabled={(date) => date < new Date()}
                                        className="rounded-md border"
                                    />
                                )}
                            </div>
                            {form.bookingType === 'room' && dateRange?.from && dateRange?.to && (
                                <p className="text-center text-sm text-muted-foreground">
                                    {nights} night{nights !== 1 ? 's' : ''} selected
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="guestCount">Number of Guests</Label>
                                <Input
                                    id="guestCount"
                                    type="number"
                                    min={1}
                                    max={
                                        form.roomType?.capacity ||
                                        form.activityType?.capacityPerSlot ||
                                        10
                                    }
                                    value={form.guestCount}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            guestCount: parseInt(e.target.value) || 1,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="specialRequests">Special Requests (optional)</Label>
                            <Textarea
                                id="specialRequests"
                                placeholder="Any special requirements or requests..."
                                value={form.specialRequests}
                                onChange={(e) =>
                                    setForm({ ...form, specialRequests: e.target.value })
                                }
                            />
                        </div>
                    </div>
                )}

                {/* Step: Review */}
                {currentStep === 'review' && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Guest</p>
                                        <p className="font-medium">
                                            {form.guest?.firstName} {form.guest?.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {form.guest?.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Hotel</p>
                                        <p className="font-medium">{form.hotel?.name}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {form.bookingType === 'room'
                                                    ? 'Room Type'
                                                    : 'Activity'}
                                            </p>
                                            <p className="font-medium">
                                                {form.roomType?.name || form.activityType?.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Guests</p>
                                            <p className="font-medium">{form.guestCount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {form.bookingType === 'room'
                                                    ? 'Check-in'
                                                    : 'Date'}
                                            </p>
                                            <p className="font-medium">
                                                {form.checkInDate
                                                    ? format(form.checkInDate, 'PPP')
                                                    : '-'}
                                            </p>
                                        </div>
                                        {form.bookingType === 'room' && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Check-out
                                                </p>
                                                <p className="font-medium">
                                                    {form.checkOutDate
                                                        ? format(form.checkOutDate, 'PPP')
                                                        : '-'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {form.bookingType === 'room' && nights > 0 && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {nights} night{nights !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>

                                {form.specialRequests && (
                                    <div className="border-t pt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Special Requests
                                        </p>
                                        <p className="text-sm">{form.specialRequests}</p>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg font-medium">Estimated Total</p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(estimatedTotal)}
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Final price may vary based on availability and promotions
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {currentStepIndex > 0 && (
                        <Button type="button" variant="outline" onClick={handleBack}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    )}
                    {currentStep !== 'review' ? (
                        <Button onClick={handleNext} disabled={!canProceed}>
                            Next
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={createReservation.isPending}>
                            {createReservation.isPending ? 'Creating...' : 'Create Reservation'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
