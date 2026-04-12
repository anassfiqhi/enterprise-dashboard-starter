module.exports = {
  createAuthClient: () => ({
    useActiveOrganization: () => ({ data: { id: 'org_1' } }),
    useSession: () => ({ data: { user: { id: 'user_1' } } }),
    organization: { list: () => ({ data: [] }) },
  }),
  betterAuth: () => ({}),
  adminClient: () => ({}),
  createAccessControl: () => ({
    newRole: () => ({}),
  }),
  inferOrgAdditionalFields: () => ({}),
  organizationClient: () => ({}),
  jwtClient: () => ({}),
  defaultStatements: {},
  adminAc: { statements: {} },
  memberAc: { statements: {} },
  userAc: { statements: {} },
};
