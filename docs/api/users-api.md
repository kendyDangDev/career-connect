# User & UserProfile API Documentation

## Overview

This documentation covers the REST API endpoints for managing users and user profiles in the Career Connect job portal application. All endpoints require authentication unless otherwise specified.

## Base URL

```
/api/users
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Data Models

### User Model

```typescript
interface User {
  id: string;                    // CUID
  email: string;                 // Unique email address
  firstName?: string;            // User's first name
  lastName?: string;             // User's last name
  phone?: string;                // Vietnamese phone number format
  avatarUrl?: string;            // Profile picture URL
  userType: UserType;            // CANDIDATE | EMPLOYER | ADMIN
  status: UserStatus;            // ACTIVE | INACTIVE | SUSPENDED
  emailVerified: boolean;        // Email verification status
  phoneVerified: boolean;        // Phone verification status
  createdAt: DateTime;           // Account creation timestamp
  updatedAt: DateTime;           // Last update timestamp
  profile?: UserProfile;         // Associated user profile (optional)
}
```

### UserProfile Model

```typescript
interface UserProfile {
  id: string;                    // CUID
  userId: string;                // Reference to User
  dateOfBirth?: DateTime;        // Birth date
  gender?: Gender;               // MALE | FEMALE | OTHER | PREFER_NOT_TO_SAY
  address?: string;              // Street address
  city?: string;                 // City
  province?: string;             // Province
  country?: string;              // Default: "Vietnam"
  bio?: string;                  // Biography/description
  websiteUrl?: string;           // Personal website
  linkedinUrl?: string;          // LinkedIn profile
  githubUrl?: string;            // GitHub profile
  portfolioUrl?: string;         // Portfolio website
  createdAt: DateTime;           // Profile creation timestamp
  updatedAt: DateTime;           // Last update timestamp
  user: User;                    // Associated user data
}
```

### Enums

```typescript
enum UserType {
  CANDIDATE = "CANDIDATE"
  EMPLOYER = "EMPLOYER"
  ADMIN = "ADMIN"
}

enum UserStatus {
  ACTIVE = "ACTIVE"
  INACTIVE = "INACTIVE"
  SUSPENDED = "SUSPENDED"
}

enum Gender {
  MALE = "MALE"
  FEMALE = "FEMALE"
  OTHER = "OTHER"
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}
```

---

## Endpoints

### 1. List Users

Get a paginated list of users with optional filters.

**Endpoint:** `GET /api/users`

**Authentication:** Required (any authenticated user)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number (positive integer) |
| limit | number | No | 10 | Items per page (max: 100) |
| search | string | No | - | Search by email, name, or phone |
| userType | UserType | No | - | Filter by user type |
| status | UserStatus | No | - | Filter by user status |
| sortBy | string | No | createdAt | Sort field: createdAt, updatedAt, email, firstName, lastName |
| sortOrder | string | No | desc | Sort direction: asc, desc |

**Success Response:**

```json
{
  "data": [
    {
      "id": "clx1234567890",
      "email": "user@example.com",
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "phone": "0912345678",
      "avatarUrl": "https://example.com/avatar.jpg",
      "userType": "CANDIDATE",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid query parameters
- `401 Unauthorized` - Authentication required
- `500 Internal Server Error` - Server error

**Example Request:**

```bash
curl -X GET "https://api.career-connect.vn/api/users?page=1&limit=20&search=nguyen&userType=CANDIDATE" \
  -H "Authorization: Bearer <token>"
```

---

### 2. Get User by ID

Retrieve detailed information about a specific user.

**Endpoint:** `GET /api/users/{id}`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID (CUID) |

**Success Response:**

```json
{
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "phone": "0912345678",
    "avatarUrl": "https://example.com/avatar.jpg",
    "userType": "CANDIDATE",
    "status": "ACTIVE",
    "emailVerified": true,
    "phoneVerified": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "profile": {
      "id": "clx0987654321",
      "dateOfBirth": "1990-05-15T00:00:00Z",
      "gender": "MALE",
      "city": "Hồ Chí Minh",
      "province": "Hồ Chí Minh",
      "country": "Vietnam"
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Authentication required
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 3. Update User

Update user information. Users can update their own profile, admins can update any user.

**Endpoint:** `PUT /api/users/{id}`

**Authentication:** Required (owner or admin)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID (CUID) |

**Request Body:**

```json
{
  "firstName": "Nguyễn",
  "lastName": "Văn B",
  "phone": "0912345678",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "userType": "EMPLOYER"
}
```

**Validation Rules:**

- `firstName`: 2-50 characters
- `lastName`: 2-50 characters  
- `phone`: Vietnamese phone format (regex: `/^(\+84|84|0)[35789][0-9]{8}$/`)
- `avatarUrl`: Valid URL
- `userType`: Valid enum value (admin only)

**Success Response:**

```json
{
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "firstName": "Nguyễn",
    "lastName": "Văn B",
    "phone": "0912345678",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "userType": "EMPLOYER",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 4. Change Password

Change user password. Users can only change their own password.

**Endpoint:** `PUT /api/users/{id}`

**Authentication:** Required (owner only)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID (CUID) |

**Request Body:**

```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Validation Rules:**

- `currentPassword`: Required, must match current password
- `newPassword`: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `confirmPassword`: Must match newPassword

**Success Response:**

```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid password format or current password incorrect
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Cannot change other user's password
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 5. Update User Status (Admin Only)

Update user account status.

**Endpoint:** `PUT /api/users/{id}`

**Authentication:** Required (admin only)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID (CUID) |

**Request Body:**

```json
{
  "status": "SUSPENDED"
}
```

**Success Response:**

```json
{
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "status": "SUSPENDED",
    // ... other user fields
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid status value
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin access required
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 6. Delete User (Admin Only)

Delete a user account permanently.

**Endpoint:** `DELETE /api/users/{id}`

**Authentication:** Required (admin only)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID (CUID) |

**Success Response:**

```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Cannot delete your own account
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin access required
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

## UserProfile Endpoints

### 7. Get User Profile

Retrieve a user's profile information.

**Endpoint:** `GET /api/users/{id}/profile`

**Authentication:** Not required (public endpoint)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID (CUID) |

**Success Response:**

```json
{
  "data": {
    "id": "clx0987654321",
    "userId": "clx1234567890",
    "dateOfBirth": "1990-05-15T00:00:00Z",
    "gender": "MALE",
    "address": "123 Nguyễn Huệ",
    "city": "Hồ Chí Minh",
    "province": "Hồ Chí Minh",
    "country": "Vietnam",
    "bio": "Experienced software developer with 5+ years in web development",
    "websiteUrl": "https://myportfolio.com",
    "linkedinUrl": "https://linkedin.com/in/username",
    "githubUrl": "https://github.com/username",
    "portfolioUrl": "https://portfolio.dev",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z",
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "phone": "0912345678",
      "avatarUrl": "https://example.com/avatar.jpg",
      "userType": "CANDIDATE",
      "status": "ACTIVE"
    }
  }
}
```

**Error Responses:**

- `404 Not Found` - Profile not found
- `500 Internal Server Error` - Server error

---

### 8. Create or Update User Profile

Create a new profile or update existing profile. Uses upsert operation.

**Endpoint:** `PUT /api/users/{id}/profile`

**Authentication:** Required (owner or admin)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID (CUID) |

**Request Body:**

```json
{
  "dateOfBirth": "1990-05-15T00:00:00Z",
  "gender": "MALE",
  "address": "123 Nguyễn Huệ",
  "city": "Hồ Chí Minh",
  "province": "Hồ Chí Minh",
  "country": "Vietnam",
  "bio": "Experienced software developer with 5+ years in web development",
  "websiteUrl": "https://myportfolio.com",
  "linkedinUrl": "https://linkedin.com/in/username",
  "githubUrl": "https://github.com/username",
  "portfolioUrl": "https://portfolio.dev"
}
```

**Validation Rules:**

- `dateOfBirth`: Valid ISO 8601 datetime (optional)
- `gender`: Valid enum value (optional)
- `address`: Maximum 200 characters (optional)
- `city`: Maximum 100 characters (optional)
- `province`: Maximum 100 characters (optional)
- `country`: Maximum 100 characters, default "Vietnam" (optional)
- `bio`: Maximum 1000 characters (optional)
- `websiteUrl`: Valid URL (optional)
- `linkedinUrl`: Valid URL (optional)
- `githubUrl`: Valid URL (optional)
- `portfolioUrl`: Valid URL (optional)

**Success Response:**

```json
{
  "data": {
    "id": "clx0987654321",
    "userId": "clx1234567890",
    "dateOfBirth": "1990-05-15T00:00:00Z",
    "gender": "MALE",
    "address": "123 Nguyễn Huệ",
    "city": "Hồ Chí Minh",
    "province": "Hồ Chí Minh",
    "country": "Vietnam",
    "bio": "Experienced software developer with 5+ years in web development",
    "websiteUrl": "https://myportfolio.com",
    "linkedinUrl": "https://linkedin.com/in/username",
    "githubUrl": "https://github.com/username",
    "portfolioUrl": "https://portfolio.dev",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z",
    "user": {
      // User details
    }
  },
  "message": "Profile updated successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid profile data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Can only update own profile (unless admin)
- `404 Not Found` - User not found
- `409 Conflict` - Profile already exists (rare edge case)
- `500 Internal Server Error` - Server error

---

### 9. Delete User Profile (Admin Only)

Delete a user's profile data.

**Endpoint:** `DELETE /api/users/{id}/profile`

**Authentication:** Required (admin only)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID (CUID) |

**Success Response:**

```json
{
  "message": "Profile deleted successfully"
}
```

**Error Responses:**

- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin access required
- `404 Not Found` - Profile not found
- `500 Internal Server Error` - Server error

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description",
  "details": {
    // Optional: Additional error details or validation errors
    "fieldErrors": {
      "fieldName": ["Error message 1", "Error message 2"]
    },
    "formErrors": ["General form error"]
  }
}
```

---

## Rate Limiting

- **Default rate limit:** 100 requests per minute per IP
- **Authenticated users:** 200 requests per minute per user
- **Admin users:** 500 requests per minute per user

---

## Vietnamese Localization Notes

1. **Phone Numbers:** Use Vietnamese format validation
   - Valid prefixes: 03, 05, 07, 08, 09
   - Format: `0912345678` or `+84912345678`

2. **Date Format:** DD/MM/YYYY for display (API uses ISO 8601)

3. **Currency:** All salary fields use VND by default

4. **Provinces:** Support all 63 Vietnamese provinces

5. **Address Format:** 
   - Street address → District → City/Province
   - Example: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"

---

## Security Considerations

1. **Authentication:** All endpoints except public profile viewing require JWT authentication
2. **Authorization:** Users can only modify their own data unless they have admin privileges
3. **Password Security:** Passwords are hashed using bcrypt with salt rounds
4. **Input Validation:** All inputs are validated using Zod schemas
5. **SQL Injection Protection:** Using Prisma ORM with parameterized queries
6. **XSS Protection:** All user inputs are sanitized before display
7. **CORS:** Configured for specific allowed origins only

---

## Examples

### Example: Complete User Registration and Profile Setup Flow

```typescript
// 1. Register new user (separate auth endpoint)
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    userType: 'CANDIDATE'
  })
});

const { token, user } = await registerResponse.json();

// 2. Create/Update user profile
const profileResponse = await fetch(`/api/users/${user.id}/profile`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    dateOfBirth: '1990-05-15T00:00:00Z',
    gender: 'MALE',
    city: 'Hà Nội',
    province: 'Hà Nội',
    bio: 'Software developer looking for new opportunities'
  })
});

const { data: profile } = await profileResponse.json();
```

### Example: Search and Filter Users (Admin)

```typescript
// Search for active candidates in Ho Chi Minh City
const response = await fetch('/api/users?' + new URLSearchParams({
  search: 'Hồ Chí Minh',
  userType: 'CANDIDATE',
  status: 'ACTIVE',
  page: '1',
  limit: '20',
  sortBy: 'createdAt',
  sortOrder: 'desc'
}), {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const { data: users, meta } = await response.json();
console.log(`Found ${meta.total} users in ${meta.totalPages} pages`);
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial API documentation |
| 1.0.1 | 2024-01-16 | Added profile endpoints |
| 1.0.2 | 2024-01-17 | Added Vietnamese localization notes |

---

## Support

For API support or questions, please contact:
- Email: api-support@career-connect.vn
- Documentation: https://docs.career-connect.vn
- API Status: https://status.career-connect.vn