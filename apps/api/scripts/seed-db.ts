import { auth } from '../src/auth';
import { db, user, member, organization } from '../src/db/index';
import { eq } from 'drizzle-orm';

/**
 * Test User Credentials
 */
const TEST_USERS = {
    admin: {
        email: 'admin@example.com',
        password: 'admin123!',
        name: 'Admin',
    },
    manager: {
        email: 'manager@example.com',
        password: 'Manager123!',
        name: 'Hotel Manager',
    },
    staff: {
        email: 'staff@example.com',
        password: 'Staff123!',
        name: 'Front Desk Staff',
    },
};

const TEST_HOTELS = [
    {
        name: 'Grand Plaza Hotel',
        slug: 'grand-plaza',
    },
    {
        name: 'Seaside Resort',
        slug: 'seaside-resort',
    },
];

async function createUserIfNotExists(
    email: string,
    password: string,
    name: string,
    role: "user" | "admin" | ("user" | "admin")[] = "user"
): Promise<string> {
    try {
        const creationResult = await auth.api.createUser({
            body: { email, password, name, role },
        });
        console.log(`  Created user: ${creationResult.user.email} with role: ${creationResult.user.role}`);
        return creationResult.user.id;
    } catch (e: any) {
        if (e.message?.includes('already exists') || e.message?.includes('User with email')) {
            console.log(`  User already exists: ${email}`);
            const existingUser = await db.query.user.findFirst({
                where: eq(user.email, email),
            });
            if (existingUser) {
                return existingUser.id;
            }
            throw new Error(`User exists but could not be found: ${email}`);
        }
        throw e;
    }
}

async function createOrganizationIfNotExists(
    name: string,
    slug: string,
    creatorUserId: string
): Promise<string | undefined> {
    try {
        const orgResult = await auth.api.createOrganization({
            body: {
                name,
                slug,
                userId: creatorUserId,
                timezone: 'UTC',
                checkInTime: '15:00',
                checkOutTime: '11:00',
                address: '123 Test St',
                phone: '+1234567890',
                contactEmail: 'contact@example.com',
                currency: 'USD',
            },
        });
        console.log(`  Created hotel: ${name} (${slug})`);
        return orgResult?.id;
    } catch (e: any) {
        if (e.message?.includes('already exists') || e.message?.includes('Organization with slug')) {
            console.log(`  Hotel already exists: ${slug}`);
            const existingOrg = await db.query.organization.findFirst({
                where: eq(organization.slug, slug),
            });
            if (existingOrg) {
                return existingOrg.id;
            }
            throw new Error(`Organization exists but could not be found: ${slug}`);
        }
        throw e;
    }
}

async function addMemberToOrganization(
    userId: string,
    organizationId: string,
    role: 'manager' | 'staff'
): Promise<void> {
    const existingMember = await db.query.member.findFirst({
        where: (m, { and, eq }) => and(eq(m.userId, userId), eq(m.organizationId, organizationId)),
    });

    if (existingMember) {
        if (existingMember.role !== role) {
            await db
                .update(member)
                .set({ role })
                .where(eq(member.id, existingMember.id));
            console.log(`  Updated member role to: ${role}`);
        } else {
            console.log(`  Member already exists with role: ${role}`);
        }
        return;
    }

    await auth.api.addMember({
        body: {
            userId,
            role: [role],
            organizationId
        },
    });
    console.log(`  Added member with role: ${role}`);
}

async function seed() {
    try {
        console.log('Seeding database with test users...\n');

        // Step 1: Create Super Admin
        console.log('1. Creating Super Admin user...');
        const adminId = await createUserIfNotExists(
            TEST_USERS.admin.email,
            TEST_USERS.admin.password,
            TEST_USERS.admin.name,
            "admin"
        );

        // Step 2: Create Manager user
        console.log('\n2. Creating Manager user...');
        const managerId = await createUserIfNotExists(
            TEST_USERS.manager.email,
            TEST_USERS.manager.password,
            TEST_USERS.manager.name
        );

        // Step 3: Create Staff user
        console.log('\n3. Creating Staff user...');
        const staffId = await createUserIfNotExists(
            TEST_USERS.staff.email,
            TEST_USERS.staff.password,
            TEST_USERS.staff.name
        );

        // Step 4: Create hotels (organizations)
        console.log('\n4. Creating test hotels...');
        const hotelIds: string[] = [];
        for (const hotel of TEST_HOTELS) {
            const hotelId = await createOrganizationIfNotExists(
                hotel.name,
                hotel.slug,
                adminId
            );
            if (!hotelId) {
                throw new Error(`Failed to create or find hotel: ${hotel.slug}`);
            }
            hotelIds.push(hotelId);
        }

        // Step 5: Add Manager to first hotel
        console.log('\n5. Adding Manager to Grand Plaza Hotel...');
        await addMemberToOrganization(managerId, hotelIds[0], 'manager');

        // Step 6: Add Staff to first hotel
        console.log('\n6. Adding Staff to Grand Plaza Hotel...');
        await addMemberToOrganization(staffId, hotelIds[0], 'staff');

        // Step 7: Add Manager to second hotel (to test multi-hotel)
        console.log('\n7. Adding Manager to Seaside Resort...');
        await addMemberToOrganization(managerId, hotelIds[1], 'manager');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('Database seeding completed!');
        console.log('='.repeat(60));
        console.log('\nTest Credentials:\n');
        console.log('ADMIN (user.role = "admin", system-wide access)');
        console.log(`  Email:    ${TEST_USERS.admin.email}`);
        console.log(`  Password: ${TEST_USERS.admin.password}`);
        console.log(`  Hotels:   All hotels (can create/manage any hotel)`);
        console.log('');
        console.log('MANAGER (organization role = "manager")');
        console.log(`  Email:    ${TEST_USERS.manager.email}`);
        console.log(`  Password: ${TEST_USERS.manager.password}`);
        console.log(`  Hotels:   ${TEST_HOTELS.map((h) => h.name).join(', ')}`);
        console.log(`  Role:     manager (full hotel management access)`);
        console.log('');
        console.log('STAFF (organization role = "staff")');
        console.log(`  Email:    ${TEST_USERS.staff.email}`);
        console.log(`  Password: ${TEST_USERS.staff.password}`);
        console.log(`  Hotels:   ${TEST_HOTELS[0].name}`);
        console.log(`  Role:     staff (read + create reservations/guests, check-in/out)`);
        console.log('');
        console.log('='.repeat(60) + '\n');

        process.exit(0);
    } catch (error: any) {
        console.error('\nSeeding failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seed();
