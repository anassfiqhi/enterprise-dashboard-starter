import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc,
} from "better-auth/plugins/organization/access";

/**
 * Define custom resources and their actions, extending the default statements
 */
const statement = {
  ...defaultStatements,
  orders: ["read", "create", "update", "delete"],
  metrics: ["read"],
} as const;

/**
 * Create access control instance
 */
export const ac = createAccessControl(statement);

/**
 * Define roles with their permissions, extending default roles
 */
export const owner = ac.newRole({
  ...ownerAc.statements,
  orders: ["read", "create", "update", "delete"],
  metrics: ["read"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  orders: ["read", "create", "update", "delete"],
  metrics: ["read"],
});

export const member = ac.newRole({
  ...memberAc.statements,
  orders: ["read"],
  metrics: ["read"],
});
