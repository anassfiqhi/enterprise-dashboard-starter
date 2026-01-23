import { auth } from '../src/auth';
import { db, orders } from '../src/db/index';

async function seed() {
    try {
        console.log('🌱 Seeding database...\n');

        // Create admin user
        console.log('Creating admin user...');
        const email = 'admin@example.com';
        const password = 'admin123';
        const name = 'Admin User';

        let userId: string;
        try {
            const signUpResult = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name,
                },
            });
            userId = signUpResult.user.id;
            console.log(`✅ Admin user created: ${email}`);
        } catch (e: any) {
            if (e.message?.includes('already exists') || e.message?.includes('User with email')) {
                console.log(`ℹ️  Admin user already exists: ${email}`);
                // Try to sign in to get the user ID
                const sessionResult = await auth.api.signInEmail({
                    body: {
                        email,
                        password,
                    },
                });
                userId = sessionResult.user.id;
            } else {
                throw e;
            }
        }

        // Create organization
        console.log('\nCreating organization...');
        try {
            const orgResult = await auth.api.createOrganization({
                body: {
                    name: 'First Organization',
                    slug: 'first-org',
                    userId,
                },
            });
            if (orgResult) {
                console.log(`✅ Organization created: ${orgResult.name} (${orgResult.slug})`);
                console.log(`✅ User automatically added as owner to organization`);
            }
        } catch (e: any) {
            if (e.message?.includes('already exists') || e.message?.includes('Organization with slug')) {
                console.log(`ℹ️  Organization already exists`);
            } else {
                throw e;
            }
        }

        // Seed orders
        console.log('\nSeeding orders...');
        const sampleOrders = Array.from({ length: 50 }).map((_, i) => ({
            id: `ord_${String(i + 1).padStart(5, '0')}`,
            status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][i % 5] as any,
            customer: `Customer ${i + 1}`,
            amount: (Math.floor(Math.random() * 1000) + 100).toString(),
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        }));

        await db.insert(orders).values(sampleOrders).onConflictDoNothing();
        console.log(`✅ Seeded ${sampleOrders.length} orders`);

        console.log('\n✅ Database seeding completed!\n');
        console.log('Login credentials:');
        console.log(`  Email: ${email}`);
        console.log(`  Password: ${password}`);
        console.log(`  Organization: Demo Organization (demo-org)\n`);

        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Seeding failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seed();
