//@ts-ignore
import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import { TextInput, PasswordInput, Select } from '@inkjs/ui';
import { auth } from '../src/auth';
import { db } from '../src/db/index';
import { user, organization, member, guest, roomType, room, reservation, activityType } from '../src/db/schema';
import { eq } from 'drizzle-orm';

type UserType = 'super_admin' | 'hotel_admin' | 'staff';
type SeedOption = 'user_only' | 'user_and_hotel' | 'full_sample';

function SeedApp() {
    const [step, setStep] = useState<
        | 'user_type'
        | 'seed_option'
        | 'email'
        | 'password'
        | 'name'
        | 'hotel_name'
        | 'submitting'
        | 'done'
    >('user_type');
    const [userType, setUserType] = useState<UserType>('super_admin');
    const [seedOption, setSeedOption] = useState<SeedOption>('user_only');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [hotelName, setHotelName] = useState('');
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleUserTypeSelect = (value: UserType) => {
        setUserType(value);
        setStep('seed_option');
    };

    const handleSeedOptionSelect = (value: SeedOption) => {
        setSeedOption(value);
        setStep('email');
    };

    const handleEmailSubmit = (value: string) => {
        setEmail(value);
        setStep('password');
    };

    const handlePasswordSubmit = (value: string) => {
        setPassword(value);
        setStep('name');
    };

    const handleNameSubmit = (value: string) => {
        setName(value || 'Test User');

        if (seedOption !== 'user_only' && userType !== 'staff') {
            setStep('hotel_name');
        } else {
            handleSubmit(value || 'Test User', '');
        }
    };

    const handleHotelNameSubmit = (value: string) => {
        setHotelName(value || 'Sample Hotel');
        handleSubmit(name, value || 'Sample Hotel');
    };

    const handleSubmit = async (userName: string, hotelNameInput: string) => {
        setStep('submitting');
        const messages: string[] = [];

        try {
            // 1. Create user with Better Auth
            const signUpResult = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: userName,
                },
            });

            if (!signUpResult?.user?.id) {
                throw new Error('Failed to create user');
            }

            const userId = signUpResult.user.id;
            messages.push(`✅ User created: ${email}`);

            // 2. Set super admin flag if needed
            if (userType === 'super_admin') {
                await db.update(user).set({ isSuperAdmin: true }).where(eq(user.id, userId));
                messages.push(`✅ Super Admin privileges granted`);
            }

            // 3. Create hotel if needed
            let hotelId: string | null = null;
            if (seedOption !== 'user_only' && hotelNameInput) {
                const hotelSlug = hotelNameInput.toLowerCase().replace(/\s+/g, '-');
                const [newHotel] = await db
                    .insert(organization)
                    .values({
                        id: `org_${Date.now()}`,
                        name: hotelNameInput,
                        slug: hotelSlug,
                        createdAt: new Date(),
                        timezone: 'America/New_York',
                        checkInTime: '15:00',
                        checkOutTime: '11:00',
                        address: '123 Main St, New York, NY 10001',
                        phone: '+1 (555) 123-4567',
                        contactEmail: `contact@${hotelSlug}.com`,
                        currency: 'USD',
                    })
                    .returning();

                hotelId = newHotel.id;
                messages.push(`✅ Hotel created: ${hotelNameInput}`);

                // 4. Add user as member with appropriate role
                await db.insert(member).values({
                    id: `mem_${Date.now()}`,
                    organizationId: hotelId,
                    userId,
                    role: userType === 'staff' ? 'staff' : 'admin',
                    createdAt: new Date(),
                });
                messages.push(`✅ User added as ${userType === 'staff' ? 'staff' : 'admin'}`);
            }

            // 5. Seed sample data if full sample selected
            if (seedOption === 'full_sample' && hotelId) {
                // Create room types
                const roomTypes = [
                    { name: 'Standard Room', basePrice: 150, maxOccupancy: 2 },
                    { name: 'Deluxe Room', basePrice: 250, maxOccupancy: 3 },
                    { name: 'Suite', basePrice: 400, maxOccupancy: 4 },
                ];

                const createdRoomTypes = await Promise.all(
                    roomTypes.map(async (rt) => {
                        const [newRoomType] = await db
                            .insert(roomType)
                            .values({
                                id: `rt_${rt.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
                                hotelId,
                                name: rt.name,
                                description: `Comfortable ${rt.name.toLowerCase()} with modern amenities`,
                                basePrice: rt.basePrice.toString(),
                                maxOccupancy: rt.maxOccupancy,
                                amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning']),
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            })
                            .returning();
                        return newRoomType;
                    })
                );
                messages.push(`✅ Created ${roomTypes.length} room types`);

                // Create rooms
                const rooms = [];
                for (let floor = 1; floor <= 3; floor++) {
                    for (let i = 1; i <= 5; i++) {
                        const roomNumber = `${floor}0${i}`;
                        const typeIndex = (i - 1) % 3;
                        rooms.push({
                            id: `room_${roomNumber}_${Date.now()}`,
                            hotelId,
                            roomTypeId: createdRoomTypes[typeIndex].id,
                            roomNumber,
                            floor: floor.toString(),
                            status: 'available' as const,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        });
                    }
                }
                await db.insert(room).values(rooms);
                messages.push(`✅ Created ${rooms.length} rooms`);

                // Create sample guests
                const guests = [
                    { firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', phone: '+1-555-0101' },
                    { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', phone: '+1-555-0102' },
                    { firstName: 'Bob', lastName: 'Johnson', email: 'bob.j@example.com', phone: '+1-555-0103' },
                    { firstName: 'Alice', lastName: 'Williams', email: 'alice.w@example.com', phone: '+1-555-0104' },
                    { firstName: 'Charlie', lastName: 'Brown', email: 'charlie.b@example.com', phone: '+1-555-0105' },
                ];

                const createdGuests = await Promise.all(
                    guests.map(async (g) => {
                        const [newGuest] = await db
                            .insert(guest)
                            .values({
                                id: `guest_${g.firstName.toLowerCase()}_${Date.now()}`,
                                hotelId,
                                firstName: g.firstName,
                                lastName: g.lastName,
                                email: g.email,
                                phone: g.phone,
                                nationality: 'US',
                                createdBy: userId,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            })
                            .returning();
                        return newGuest;
                    })
                );
                messages.push(`✅ Created ${guests.length} sample guests`);

                // Create sample reservations
                const today = new Date();
                const reservations = [
                    {
                        guestId: createdGuests[0].id,
                        roomId: rooms[0].id,
                        checkIn: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
                        checkOut: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
                        status: 'confirmed' as const,
                    },
                    {
                        guestId: createdGuests[1].id,
                        roomId: rooms[5].id,
                        checkIn: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
                        checkOut: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
                        status: 'confirmed' as const,
                    },
                    {
                        guestId: createdGuests[2].id,
                        roomId: rooms[10].id,
                        checkIn: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
                        checkOut: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
                        status: 'checked_in' as const,
                    },
                ];

                for (let i = 0; i < reservations.length; i++) {
                    const r = reservations[i];
                    await db.insert(reservation).values({
                        id: `res_${Date.now()}_${i}`,
                        hotelId,
                        guestId: r.guestId,
                        roomId: r.roomId,
                        checkInDate: r.checkIn.toISOString().split('T')[0],
                        checkOutDate: r.checkOut.toISOString().split('T')[0],
                        status: r.status,
                        guestCount: 2,
                        totalPrice: '450.00',
                        createdBy: userId,
                    });
                }
                messages.push(`✅ Created ${reservations.length} sample reservations`);

                // Create activity types
                const activities = [
                    { name: 'Spa Treatment', durationMinutes: 60, basePrice: '100' },
                    { name: 'City Tour', durationMinutes: 180, basePrice: '75' },
                    { name: 'Airport Transfer', durationMinutes: 45, basePrice: '50' },
                ];

                await Promise.all(
                    activities.map((a) =>
                        db.insert(activityType).values({
                            id: `act_${a.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
                            hotelId,
                            name: a.name,
                            description: `Professional ${a.name.toLowerCase()} service`,
                            durationMinutes: a.durationMinutes,
                            basePrice: a.basePrice,
                            maxParticipants: 4,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        })
                    )
                );
                messages.push(`✅ Created ${activities.length} activity types`);
            }

            setResult({
                success: true,
                message: messages.join('\n'),
            });
        } catch (e: any) {
            setResult({
                success: false,
                message: `❌ Error: ${e.message || 'Unknown error occurred'}`,
            });
        } finally {
            setStep('done');
            setTimeout(() => process.exit(0), 3000);
        }
    };

    if (step === 'done' && result) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text color={result.success ? 'green' : 'red'}>{result.message}</Text>
            </Box>
        );
    }

    if (step === 'submitting') {
        return (
            <Box flexDirection="column" padding={1}>
                <Text color="yellow">Creating your seed data...</Text>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">
                🌱 Hotel Management System Seeder
            </Text>
            <Box marginTop={1} flexDirection="column">
                {step === 'user_type' && (
                    <Box flexDirection="column">
                        <Text dimColor>Select user type:</Text>
                        <Select
                            options={[
                                { label: '👑 Super Admin (can create hotels)', value: 'super_admin' },
                                { label: '🏨 Hotel Admin (manages one hotel)', value: 'hotel_admin' },
                                { label: '👤 Staff (front desk)', value: 'staff' },
                            ]}
                            onChange={(value) => handleUserTypeSelect(value as UserType)}
                        />
                    </Box>
                )}
                {step === 'seed_option' && (
                    <Box flexDirection="column">
                        <Text dimColor>User type: {userType.replace('_', ' ')}</Text>
                        <Text dimColor>What to seed:</Text>
                        <Select
                            options={[
                                { label: '👤 User only', value: 'user_only' },
                                { label: '🏨 User + Hotel', value: 'user_and_hotel' },
                                { label: '🎲 Full sample data (hotel + rooms + guests + reservations)', value: 'full_sample' },
                            ]}
                            onChange={(value) => handleSeedOptionSelect(value as SeedOption)}
                        />
                    </Box>
                )}
                {step === 'email' && (
                    <Box flexDirection="column">
                        <Text dimColor>User: {userType.replace('_', ' ')}</Text>
                        <Text dimColor>Seed: {seedOption.replace('_', ' ')}</Text>
                        <Box marginTop={1}>
                            <Text dimColor>Enter email:</Text>
                        </Box>
                        <TextInput placeholder="admin@example.com" onSubmit={handleEmailSubmit} />
                    </Box>
                )}
                {step === 'password' && (
                    <Box flexDirection="column">
                        <Text dimColor>Email: {email}</Text>
                        <Text dimColor>Enter password:</Text>
                        <PasswordInput onSubmit={handlePasswordSubmit} />
                    </Box>
                )}
                {step === 'name' && (
                    <Box flexDirection="column">
                        <Text dimColor>Email: {email}</Text>
                        <Text dimColor>Enter name (optional):</Text>
                        <TextInput placeholder="Admin User" onSubmit={handleNameSubmit} />
                    </Box>
                )}
                {step === 'hotel_name' && (
                    <Box flexDirection="column">
                        <Text dimColor>Email: {email}</Text>
                        <Text dimColor>Name: {name}</Text>
                        <Text dimColor>Enter hotel name:</Text>
                        <TextInput placeholder="Grand Hotel" onSubmit={handleHotelNameSubmit} />
                    </Box>
                )}
            </Box>
        </Box>
    );
}

render(<SeedApp />);
