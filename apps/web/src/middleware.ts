// Import the enhanced middleware from the new consolidated middleware
export { middleware, config } from './lib/middleware/global';

/**
 * This is the main middleware file that Next.js automatically picks up
 * It delegates to the enhanced middleware which supports
 * both JWT (React Native) and NextAuth (Web) authentication
 */
