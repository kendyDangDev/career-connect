import 'next-auth';
import { UserType, UserStatus } from '../generated/prisma';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    userType: UserType;
    emailVerified: boolean;
    phoneVerified: boolean;
    status: UserStatus;
    avatarUrl?: string | null;
    companyId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      userType: UserType;
      emailVerified: boolean;
      phoneVerified: boolean;
      status: UserStatus;
      avatarUrl?: string | null;
      companyId?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userType: UserType;
    emailVerified: boolean;
    phoneVerified: boolean;
    status: UserStatus;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    companyId?: string | null;
  }
}
