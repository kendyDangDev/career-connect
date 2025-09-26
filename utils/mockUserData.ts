import { User } from '@/types/auth.types';

export const mockUser: User = {
  id: 'user-123',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  userType: 'CANDIDATE',
  emailVerified: true,
  phoneVerified: true,
  status: 'ACTIVE',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
};

export const mockUserWithoutAvatar: User = {
  id: 'user-456',
  email: 'jane.smith@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  userType: 'CANDIDATE',
  emailVerified: true,
  phoneVerified: false,
  status: 'ACTIVE',
  avatarUrl: null
};

export const mockUserSingleName: User = {
  id: 'user-789',
  email: 'alice@example.com',
  firstName: 'Alice',
  lastName: null,
  userType: 'CANDIDATE',
  emailVerified: true,
  phoneVerified: true,
  status: 'ACTIVE',
  avatarUrl: null
};
