# Test Credentials

Use these credentials to test different user roles in the hotel management system.

## Users

### Super Admin

**System-wide access - bypasses all permission checks**

| Field    | Value                     |
| -------- | ------------------------- |
| Email    | superadmin@example.com    |
| Password | SuperAdmin123!            |
| Hotels   | All hotels (system-wide)  |

**Capabilities:**
- Can access ALL hotels
- Can create and manage hotels
- Can manage all users across the system
- Bypasses all permission checks (isSuperAdmin = true)

---

### Admin (Hotel Manager)

**Full access to assigned hotels**

| Field    | Value                                   |
| -------- | --------------------------------------- |
| Email    | admin@example.com                       |
| Password | Admin123!                               |
| Hotels   | Grand Plaza Hotel, Seaside Resort       |
| Role     | admin                                   |

**Capabilities:**
- Full CRUD on all hotel resources
- Manage reservations (create, update, cancel, check-in/out)
- Manage guests (create, update, delete)
- Manage rooms, activities, inventory
- Manage pricing rules and promo codes
- Manage team members and send invitations
- View analytics and audit logs
- Update hotel settings

---

### Staff (Front Desk)

**Limited operational access**

| Field    | Value                   |
| -------- | ----------------------- |
| Email    | staff@example.com       |
| Password | Staff123!               |
| Hotels   | Grand Plaza Hotel       |
| Role     | staff                   |

**Capabilities:**
- **Read** most resources (rooms, activities, inventory, promo codes)
- **Create** guests and reservations
- **Check-in/Check-out** guests
- View team members

**Restrictions:**
- Cannot edit or delete resources
- Cannot access pricing rules
- Cannot view analytics or audit logs
- Cannot manage team or send invitations
- Cannot change hotel settings

---

## Hotels

| Name               | Slug           | Members                    |
| ------------------ | -------------- | -------------------------- |
| Grand Plaza Hotel  | grand-plaza    | Super Admin, Admin, Staff  |
| Seaside Resort     | seaside-resort | Super Admin, Admin         |

---

## Running the Seed Script

```bash
cd apps/api
pnpm run db:seed
```

This will create all users, hotels, and assign appropriate memberships.

---

## Permission Matrix

| Resource       | Super Admin | Admin | Staff              |
| -------------- | ----------- | ----- | ------------------ |
| Hotels (all)   | CRUD        | -     | -                  |
| Hotel Settings | Update      | Update| Read               |
| Reservations   | CRUD        | CRUD  | Read, Create, CI/CO|
| Guests         | CRUD        | CRUD  | Read, Create       |
| Rooms          | CRUD        | CRUD  | Read               |
| Activities     | CRUD        | CRUD  | Read               |
| Inventory      | RU          | RU    | Read               |
| Pricing Rules  | CRUD        | CRUD  | -                  |
| Promo Codes    | CRUD        | CRUD  | Read               |
| Team/Members   | CRUD        | CRUD  | Read               |
| Invitations    | CRD         | CRD   | -                  |
| Analytics      | Read        | Read  | -                  |
| Audit Logs     | Read        | Read  | -                  |

Legend: C=Create, R=Read, U=Update, D=Delete, CI/CO=Check-in/Check-out
