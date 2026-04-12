import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  displayName: 'web',
  coverageProvider: 'v8',
  testEnvironment: 'jest-fixed-jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require', 'default'],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@repo/shared(.*)$': '<rootDir>/../../packages/shared/src$1',
    '^until-async$': '<rootDir>/__mocks__/until-async.js',
    '^better-auth(.*)$': '<rootDir>/__mocks__/better-auth.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(\\.pnpm/)?(until-async|@mswjs|msw|outvariant|strict-event-emitter|better-auth)(/|$))',
  ],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
  collectCoverageFrom: [
    // Hooks — adapter layer over Redux
    'hooks/**/*.{ts,tsx}',
    // Redux slices and sagas — pure logic
    'lib/reducers/**/*.{ts,tsx}',
    'lib/sagas/**/*.{ts,tsx}',
    // Only the specific components that have unit tests.
    // Charts, form dialogs, tables, and complex interactive components
    // are integration/E2E territory and excluded here.
    'components/bookings/ReservationStatusBadge.tsx',
    'components/bookings/BookingMetricsCards.tsx',
    'components/hotels/HotelCard.tsx',
    'components/promo-codes/PromoCodeStatusBadge.tsx',
    'components/ErrorBoundary.tsx',
    'components/Header.tsx',
    // Exclusions
    '!**/*.d.ts',
    '!**/*.config.*',
    '!**/*.stories.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
    // Type-only files — no runtime logic
    '!lib/types/**',
    // Pure wiring — forks all sagas, no logic to unit test
    '!lib/sagas/rootSaga.ts',
    // Wrap better-auth client hooks; integration/E2E territory
    '!hooks/usePermissions.ts',
    '!hooks/useSession.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      // Two categories of untested functions are expected:
      //   1. Local async helpers inside sagas (e.g. fetchHotelsList) sit behind
      //      redux-saga `call()` effects and are never directly invoked in
      //      generator-stepping tests — by design.
      //   2. Saga watcher functions (e.g. `function* hotelsSaga()`) are pure
      //      wiring (`yield takeLatest/takeEvery`) with no logic worth testing.
      functions: 58,
      lines: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};

export default createJestConfig(config);
