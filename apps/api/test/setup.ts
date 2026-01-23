import { vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.BETTER_AUTH_URL = 'http://localhost:3001';
process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-testing-only';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.PORT = '3001';

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
