import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-utils';
import { loginSchema } from '@/lib/validations';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Credentials Provider for email/password login
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email và mật khẩu là bắt buộc');
        }

        // Validate credentials format
        console.log('Login attempt:', { email: credentials.email });
        const { error } = loginSchema.validate(credentials);
        if (error) {
          console.log('Validation error:', error.details[0].message);
          throw new Error(error.details[0].message);
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: {
              profile: true,
              candidate: true,
            },
          });

          if (!user) {
            throw new Error('Tài khoản không tồn tại');
          }

          // Check if user has a password (not social login only)
          if (!user.passwordHash) {
            throw new Error('Tài khoản này chỉ hỗ trợ đăng nhập bằng mạng xã hội');
          }

          // Verify password
          const isValidPassword = await verifyPassword(credentials.password, user.passwordHash);

          if (!isValidPassword) {
            throw new Error('Mật khẩu không chính xác');
          }

          // Check if account is suspended
          if (user.status === 'SUSPENDED') {
            throw new Error('Tài khoản của bạn đã bị tạm khóa');
          }

          if (user.status === 'INACTIVE') {
            throw new Error('Tài khoản của bạn chưa được kích hoạt');
          }

          // Return user object for session
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            status: user.status,
            avatarUrl: user.avatarUrl,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Handle social login
        if (account?.provider === 'google') {
          const email = user.email?.toLowerCase();
          if (!email) {
            return false;
          }

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            // User exists, allow sign in
            return true;
          } else {
            // Create new user for social login
            const newUser = await prisma.$transaction(async (tx) => {
              const createdUser = await tx.user.create({
                data: {
                  email,
                  firstName: (profile as any)?.given_name || user.name?.split(' ')[0] || '',
                  lastName:
                    (profile as any)?.family_name || user.name?.split(' ').slice(1).join(' ') || '',
                  avatarUrl: user.image,
                  emailVerified: true, // Social login emails are pre-verified
                  userType: 'CANDIDATE',
                },
              });

              // Create profile
              await tx.userProfile.create({
                data: {
                  userId: createdUser.id,
                },
              });

              // Create candidate record
              await tx.candidate.create({
                data: {
                  userId: createdUser.id,
                },
              });

              return createdUser;
            });

            return true;
          }
        }

        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        token.userType = user.userType;
        token.emailVerified = !!user.emailVerified;
        token.phoneVerified = user.phoneVerified;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.avatarUrl = user.avatarUrl;
      }

      // Return previous token if the access token has not expired yet
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.userType = token.userType as any;
        session.user.emailVerified = token.emailVerified as true;
        session.user.phoneVerified = token.phoneVerified as boolean;
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
        session.user.avatarUrl = token.avatarUrl as string | null;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account, profile }) {
      // Log successful sign in
      console.log(`User ${user.email} signed in with ${account?.provider}`);
    },
    async signOut({ session }) {
      // Log sign out
      console.log(`User signed out`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
