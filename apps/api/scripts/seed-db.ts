import { auth } from '../src/auth';
import { db, user, member, organization } from '../src/db/index';
import { eq, sql } from 'drizzle-orm';

/**
 * Test User Credentials
 * These are also saved to TEST_CREDENTIALS.md
 */
const TEST_USERS = {
    superAdmin: {
        email: 'superadmin@example.com',
        password: 'SuperAdmin123!',
        name: 'Super Admin',
    },
    admin: {
        email: 'admin@example.com',
        password: 'Admin123!',
        name: 'Hotel Admin',
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
    name: string
): Promise<string> {
    try {
        const signUpResult = await auth.api.signUpEmail({
            body: { email, password, name },
        });
        console.log(`  ✅ Created user: ${email}`);
        return signUpResult.user.id;
    } catch (e: any) {
        if (e.message?.includes('already exists') || e.message?.includes('User with email')) {
            console.log(`  ℹ️  User already exists: ${email}`);
            // Get existing user ID
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
): Promise<string> {
    try {
        const orgResult = await auth.api.createOrganization({
            body: { name, slug, userId: creatorUserId },
        });
        console.log(`  ✅ Created hotel: ${name} (${slug})`);
        return orgResult.id;
    } catch (e: any) {
        if (e.message?.includes('already exists') || e.message?.includes('Organization with slug')) {
            console.log(`  ℹ️  Hotel already exists: ${slug}`);
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
    role: 'admin' | 'staff'
): Promise<void> {
    // Check if member already exists
    const existingMember = await db.query.member.findFirst({
        where: (m, { and, eq }) => and(eq(m.userId, userId), eq(m.organizationId, organizationId)),
    });

    if (existingMember) {
        // Update role if different
        if (existingMember.role !== role) {
            await db
                .update(member)
                .set({ role })
                .where(eq(member.id, existingMember.id));
            console.log(`  ✅ Updated member role to: ${role}`);
        } else {
            console.log(`  ℹ️  Member already exists with role: ${role}`);
        }
        return;
    }

    // Add new member
    const memberId = `mem_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await db.insert(member).values({
        id: memberId,
        userId,
        organizationId,
        role,
        createdAt: new Date(),
    });
    console.log(`  ✅ Added member with role: ${role}`);
}

async function seed() {
    try {
        console.log('🌱 Seeding database with test users...\n');

        // Step 1: Create Super Admin
        console.log('1. Creating Super Admin user...');
        const superAdminId = await createUserIfNotExists(
            TEST_USERS.superAdmin.email,
            TEST_USERS.superAdmin.password,
            TEST_USERS.superAdmin.name
        );

        // Set isSuperAdmin flag directly in DB (not available via API)
        await db.execute(
            sql`UPDATE "user" SET "isSuperAdmin" = true WHERE id = ${superAdminId}`
        );
        console.log('  ✅ Set isSuperAdmin = true');

        // Step 2: Create Admin user
        console.log('\n2. Creating Admin user...');
        const adminId = await createUserIfNotExists(
            TEST_USERS.admin.email,
            TEST_USERS.admin.password,
            TEST_USERS.admin.name
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
            // Super admin creates the organizations
            const hotelId = await createOrganizationIfNotExists(
                hotel.name,
                hotel.slug,
                superAdminId
            );
            hotelIds.push(hotelId);
        }

        // Step 5: Add Admin to first hotel with admin role
        console.log('\n5. Adding Admin to Grand Plaza Hotel...');
        await addMemberToOrganization(adminId, hotelIds[0], 'admin');

        // Step 6: Add Staff to first hotel with staff role
        console.log('\n6. Adding Staff to Grand Plaza Hotel...');
        await addMemberToOrganization(staffId, hotelIds[0], 'staff');

        // Step 7: Add Admin to second hotel too (to test multi-hotel)
        console.log('\n7. Adding Admin to Seaside Resort...');
        await addMemberToOrganization(adminId, hotelIds[1], 'admin');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ Database seeding completed!');
        console.log('='.repeat(60));
        console.log('\n📋 Test Credentials:\n');
        console.log('SUPER ADMIN (System-wide access, bypasses all permissions)');
        console.log(`  Email:    ${TEST_USERS.superAdmin.email}`);
        console.log(`  Password: ${TEST_USERS.superAdmin.password}`);
        console.log(`  Hotels:   All hotels (can create/manage any hotel)`);
        console.log('');
        console.log('ADMIN (Full hotel access - Hotel Manager)');
        console.log(`  Email:    ${TEST_USERS.admin.email}`);
        console.log(`  Password: ${TEST_USERS.admin.password}`);
        console.log(`  Hotels:   ${TEST_HOTELS.map((h) => h.name).join(', ')}`);
        console.log(`  Role:     admin (can manage everything in assigned hotels)`);
        console.log('');
        console.log('STAFF (Limited access - Front Desk)');
        console.log(`  Email:    ${TEST_USERS.staff.email}`);
        console.log(`  Password: ${TEST_USERS.staff.password}`);
        console.log(`  Hotels:   ${TEST_HOTELS[0].name}`);
        console.log(`  Role:     staff (can read + create reservations/guests, check-in/out)`);
        console.log('');
        console.log('='.repeat(60) + '\n');

        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Seeding failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seed();
