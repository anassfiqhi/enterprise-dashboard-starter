import { pgTable, text, boolean, timestamp, index, uniqueIndex, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';


export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    isSuperAdmin: boolean("is_super_admin").default(false),
});

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        activeOrganizationId: text("active_organization_id"),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organization = pgTable(
    "organization",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        slug: text("slug").notNull().unique(),
        logo: text("logo"),
        createdAt: timestamp("created_at").notNull(),
        metadata: text("metadata"),
        timezone: text("timezone").default("UTC"),
        checkInTime: text("check_in_time").default("15:00"),
        checkOutTime: text("check_out_time").default("11:00"),
        address: text("address"),
        phone: text("phone"),
        contactEmail: text("contact_email"),
        currency: text("currency").default("USD"),
    },
    (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);

export const member = pgTable(
    "member",
    {
        id: text("id").primaryKey(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        role: text("role").default("member").notNull(),
        createdAt: timestamp("created_at").notNull(),
    },
    (table) => [
        index("member_organizationId_idx").on(table.organizationId),
        index("member_userId_idx").on(table.userId),
    ],
);

export const invitation = pgTable(
    "invitation",
    {
        id: text("id").primaryKey(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        email: text("email").notNull(),
        role: text("role"),
        status: text("status").default("pending").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        inviterId: text("inviter_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [
        index("invitation_organizationId_idx").on(table.organizationId),
        index("invitation_email_idx").on(table.email),
    ],
);

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    members: many(member),
    invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
    members: many(member),
    invitations: many(invitation),
}));

export const memberRelations = relations(member, ({ one }) => ({
    organization: one(organization, {
        fields: [member.organizationId],
        references: [organization.id],
    }),
    user: one(user, {
        fields: [member.userId],
        references: [user.id],
    }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
    organization: one(organization, {
        fields: [invitation.organizationId],
        references: [organization.id],
    }),
    user: one(user, {
        fields: [invitation.inviterId],
        references: [user.id],
    }),
}));


// ============================================================================
// Hotel Domain Tables (Application-specific, not managed by Better Auth)
// ============================================================================

/**
 * Hotel guests (separate from users/staff)
 */
export const guest = pgTable(
    'guest',
    {
        id: text('id').primaryKey(),
        hotelId: text('hotel_id')
            .notNull()
            .references(() => organization.id, { onDelete: 'cascade' }),
        firstName: text('first_name').notNull(),
        lastName: text('last_name').notNull(),
        email: text('email'),
        phone: text('phone'),
        nationality: text('nationality'),
        idType: text('id_type'), // passport, drivers_license, national_id
        idNumber: text('id_number'),
        notes: text('notes'),
        createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index('guest_hotelId_idx').on(table.hotelId),
        index('guest_email_idx').on(table.email),
    ]
);

/**
 * Room categories (Deluxe, Standard, Suite, etc.)
 */
export const roomType = pgTable(
    'room_type',
    {
        id: text('id').primaryKey(),
        hotelId: text('hotel_id')
            .notNull()
            .references(() => organization.id, { onDelete: 'cascade' }),
        name: text('name').notNull(),
        description: text('description'),
        basePrice: text('base_price').notNull(), // Stored as text to avoid precision issues
        maxOccupancy: integer('max_occupancy').default(2).notNull(),
        amenities: text('amenities'), // JSON array
        images: text('images'), // JSON array of URLs
        isActive: boolean('is_active').default(true).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index('roomType_hotelId_idx').on(table.hotelId),
    ]
);

/**
 * Physical rooms (101, 102, Penthouse A, etc.)
 */
export const room = pgTable(
    'room',
    {
        id: text('id').primaryKey(),
        hotelId: text('hotel_id')
            .notNull()
            .references(() => organization.id, { onDelete: 'cascade' }),
        roomTypeId: text('room_type_id')
            .notNull()
            .references(() => roomType.id, { onDelete: 'restrict' }),
        roomNumber: text('room_number').notNull(),
        floor: text('floor'),
        status: text('status', {
            enum: ['available', 'occupied', 'maintenance', 'out_of_order'],
        }).default('available').notNull(),
        notes: text('notes'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index('room_hotelId_idx').on(table.hotelId),
        index('room_roomTypeId_idx').on(table.roomTypeId),
        uniqueIndex('room_hotelId_roomNumber_uidx').on(table.hotelId, table.roomNumber),
    ]
);

/**
 * Activity definitions (Spa, Tours, Restaurant, etc.)
 */
export const activityType = pgTable(
    'activity_type',
    {
        id: text('id').primaryKey(),
        hotelId: text('hotel_id')
            .notNull()
            .references(() => organization.id, { onDelete: 'cascade' }),
        name: text('name').notNull(),
        description: text('description'),
        basePrice: text('base_price').notNull(),
        durationMinutes: integer('duration_minutes').default(60).notNull(),
        maxParticipants: integer('max_participants').default(1).notNull(),
        images: text('images'), // JSON array
        isActive: boolean('is_active').default(true).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index('activityType_hotelId_idx').on(table.hotelId),
    ]
);

/**
 * Scheduled activity time slots
 */
export const activitySlot = pgTable(
    'activity_slot',
    {
        id: text('id').primaryKey(),
        hotelId: text('hotel_id')
            .notNull()
            .references(() => organization.id, { onDelete: 'cascade' }),
        activityTypeId: text('activity_type_id')
            .notNull()
            .references(() => activityType.id, { onDelete: 'cascade' }),
        startTime: timestamp('start_time').notNull(),
        endTime: timestamp('end_time').notNull(),
        availableSpots: integer('available_spots').notNull(),
        bookedSpots: integer('booked_spots').default(0).notNull(),
        price: text('price'), // Override price if different from base
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index('activitySlot_hotelId_idx').on(table.hotelId),
        index('activitySlot_activityTypeId_idx').on(table.activityTypeId),
        index('activitySlot_startTime_idx').on(table.startTime),
    ]
);

/**
 * Daily room availability per type
 */
export const roomInventory = pgTable(
    'room_inventory',
    {
        id: text('id').primaryKey(),
        hotelId: text('hotel_id')
            .notNull()
            .references(() => organization.id, { onDelete: 'cascade' }),
        roomTypeId: text('room_type_id')
            .notNull()
            .references(() => roomType.id, { onDelete: 'cascade' }),
        date: date('date').notNull(),
        totalRooms: integer('total_rooms').notNull(),
        availableRooms: integer('available_rooms').notNull(),
        price: text('price'), // Override price for this date
        minStay: integer('min_stay').default(1),
        maxStay: integer('max_stay'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index('roomInventory_hotelId_idx').on(table.hotelId),
        index('roomInventory_roomTypeId_idx').on(table.roomTypeId),
        index('roomInventory_date_idx').on(table.date),
        uniqueIndex('roomInventory_roomTypeId_date_uidx').on(table.roomTypeId, table.date),
    ]
);

/**
 * Dynamic pricing rules
 */
export const pricingRule = pgTable(
    'pricing_rule',
    {
        id: text('id').primaryKey(),
        hotelId: text('hotel_id')
            .notNull()
            .references(() => organization.id, { onDelete: 'cascade' }),
        name: text('name').notNull(),
        type: text('type', {
            enum: ['percentage', 'fixed', 'override'],
        }).notNull(),
        value: text('value').notNull(), // Amount or percentage
        roomTypeId: text('room_type_id').references(() => roomType.id, { onDelete: 'cascade' }), // null = all rooms
        startDate: date('start_date'),
        endDate: date('end_date'),
        daysOfWeek: text('days_of_week'), // JSON array of day numbers (0-6)
        priority: integer('priority').default(0).notNull(),
        isActive: boolean('is_active').default(true).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index('pricingRule_hotelId_idx').on(table.hotelId),
        index('pricingRule_roomTypeId_idx').on(table.roomTypeId),
    ]
);

/**
 * Room and activity bookings
 */
export const reservation = pgTable(
    'reservation',
    {
        id: text('id').primaryKey(),
        hotelId: text('hotel_id')
            .notNull()
            .references(() => organization.id, { onDelete: 'cascade' }),
        guestId: text('guest_id')
            .notNull()
            .references(() => guest.id, { onDelete: 'restrict' }),
        // Room booking
        roomTypeId: text('room_type_id').references(() => roomType.id),
        roomId: text('room_id').references(() => room.id),
        checkInDate: date('check_in_date'),
        checkOutDate: date('check_out_date'),
        // Activity booking
        activityTypeId: text('activity_type_id').references(() => activityType.id),
        activitySlotId: text('activity_slot_id').references(() => activitySlot.id),
        // Details
        guestCount: integer('guest_count').default(1),
        specialRequests: text('special_requests'),
        priceDetails: text('price_details'), // JSON breakdown
        totalPrice: text('total_price'),
        currency: text('currency').default('USD'),
        status: text('status', {
            enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
        }).default('pending').notNull(),
        channel: text('channel', {
            enum: ['direct', 'ota', 'corporate', 'walk_in'],
        }).default('direct'),
        // Tracking
        createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
        confirmedBy: text('confirmed_by').references(() => user.id, { onDelete: 'set null' }),
        cancelledBy: text('cancelled_by').references(() => user.id, { onDelete: 'set null' }),
        cancelReason: text('cancel_reason'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index('reservation_hotelId_idx').on(table.hotelId),
        index('reservation_guestId_idx').on(table.guestId),
        index('reservation_status_idx').on(table.status),
        index('reservation_checkInDate_idx').on(table.checkInDate),
        index('reservation_roomTypeId_idx').on(table.roomTypeId),
    ]
);

/**
 * User action tracking
 */
export const auditLog = pgTable(
    'audit_log',
    {
        id: text('id').primaryKey(),
        hotelId: text('hotel_id').references(() => organization.id, { onDelete: 'cascade' }),
        userId: text('user_id').notNull(),
        userEmail: text('user_email').notNull(),
        userRole: text('user_role'),
        action: text('action').notNull(), // CREATE, UPDATE, DELETE, CANCEL, CHECK_IN, etc.
        resource: text('resource').notNull(), // reservation, guest, room, etc.
        resourceId: text('resource_id'),
        previousValue: text('previous_value'), // JSON
        newValue: text('new_value'), // JSON
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [
        index('auditLog_hotelId_idx').on(table.hotelId),
        index('auditLog_userId_idx').on(table.userId),
        index('auditLog_resource_idx').on(table.resource),
        index('auditLog_createdAt_idx').on(table.createdAt),
    ]
);

// ============================================================================
// Relations
// ============================================================================

export const guestRelations = relations(guest, ({ one, many }) => ({
    hotel: one(organization, {
        fields: [guest.hotelId],
        references: [organization.id],
    }),
    createdByUser: one(user, {
        fields: [guest.createdBy],
        references: [user.id],
    }),
    reservations: many(reservation),
}));

export const roomTypeRelations = relations(roomType, ({ one, many }) => ({
    hotel: one(organization, {
        fields: [roomType.hotelId],
        references: [organization.id],
    }),
    rooms: many(room),
    inventory: many(roomInventory),
    pricingRules: many(pricingRule),
    reservations: many(reservation),
}));

export const roomRelations = relations(room, ({ one, many }) => ({
    hotel: one(organization, {
        fields: [room.hotelId],
        references: [organization.id],
    }),
    roomType: one(roomType, {
        fields: [room.roomTypeId],
        references: [roomType.id],
    }),
    reservations: many(reservation),
}));

export const activityTypeRelations = relations(activityType, ({ one, many }) => ({
    hotel: one(organization, {
        fields: [activityType.hotelId],
        references: [organization.id],
    }),
    slots: many(activitySlot),
    reservations: many(reservation),
}));

export const activitySlotRelations = relations(activitySlot, ({ one, many }) => ({
    hotel: one(organization, {
        fields: [activitySlot.hotelId],
        references: [organization.id],
    }),
    activityType: one(activityType, {
        fields: [activitySlot.activityTypeId],
        references: [activityType.id],
    }),
    reservations: many(reservation),
}));

export const roomInventoryRelations = relations(roomInventory, ({ one }) => ({
    hotel: one(organization, {
        fields: [roomInventory.hotelId],
        references: [organization.id],
    }),
    roomType: one(roomType, {
        fields: [roomInventory.roomTypeId],
        references: [roomType.id],
    }),
}));

export const pricingRuleRelations = relations(pricingRule, ({ one }) => ({
    hotel: one(organization, {
        fields: [pricingRule.hotelId],
        references: [organization.id],
    }),
    roomType: one(roomType, {
        fields: [pricingRule.roomTypeId],
        references: [roomType.id],
    }),
}));

export const reservationRelations = relations(reservation, ({ one }) => ({
    hotel: one(organization, {
        fields: [reservation.hotelId],
        references: [organization.id],
    }),
    guest: one(guest, {
        fields: [reservation.guestId],
        references: [guest.id],
    }),
    roomType: one(roomType, {
        fields: [reservation.roomTypeId],
        references: [roomType.id],
    }),
    room: one(room, {
        fields: [reservation.roomId],
        references: [room.id],
    }),
    activityType: one(activityType, {
        fields: [reservation.activityTypeId],
        references: [activityType.id],
    }),
    activitySlot: one(activitySlot, {
        fields: [reservation.activitySlotId],
        references: [activitySlot.id],
    }),
    createdByUser: one(user, {
        fields: [reservation.createdBy],
        references: [user.id],
    }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
    hotel: one(organization, {
        fields: [auditLog.hotelId],
        references: [organization.id],
    }),
}));
