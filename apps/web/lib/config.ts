/**
 * Application configuration
 * Centralizes environment variables and runtime config
 */

export const config = {
  /**
   * Base URL for the backend API
   * @default http://localhost:3001
   */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',

  /**
   * Auth endpoints base URL (defaults to apiUrl/api/auth)
   */
  authUrl: process.env.NEXT_PUBLIC_AUTH_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth`,

  /**
   * SSE streaming endpoint
   */
  sseUrl: process.env.NEXT_PUBLIC_SSE_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/stream/events`,
} as const;
