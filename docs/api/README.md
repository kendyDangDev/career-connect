# Career Connect API Documentation

Welcome to the Career Connect API documentation. This directory contains comprehensive documentation for all available API endpoints organized by functionality.

## API Documentation Categories

### 🔐 Authentication APIs

#### [Employer Authentication](./employer-registration.md)
- Employer registration with company verification
- Email verification for employers
- Phone verification with OTP
- Registration status tracking
- Multi-step verification process

**Additional Resources:**
- [OpenAPI Specification](./employer-auth-api.yaml)
- [Postman Collection](./employer-auth.postman_collection.json)

#### General Authentication *(Coming Soon)*
- Candidate registration
- Login/Logout for all users
- Session management
- Password reset

### 🏢 [Company Management APIs](./company-management.md)
- Company profile management
- Media upload and management
- Company information updates

### 👔 [Employer APIs](./employer-job-management.md)
- Job posting management
- Job statistics and analytics
- Duplicate job creation
- Job status updates

### 📋 [Employer Application Management APIs](./employer-application-management.md)
- View job applications
- Filter applications with AI scoring
- Update application status
- Bulk application updates
- Application statistics and analytics
- Add notes to applications

### 👨‍💼 [Admin APIs](./admin-company-management.md)
- Company verification management
- Bulk company operations
- Company statistics
- System-wide company administration

### 🏷️ Admin System Categories APIs *(Coming Soon)*
- Industry management
- Location management
- Skills management
- Categories management

### 👥 Admin User Management APIs *(Coming Soon)*
- User administration
- User role management
- User statistics

## API Overview

### Base URL
```
https://api.careerconnect.com
```

### Authentication
Most API endpoints require authentication. The APIs use session-based authentication with NextAuth.js.

### Common Headers
```http
Content-Type: application/json
Accept: application/json
```

### Response Format
All API responses follow a consistent format:

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": ["Additional error details"]
}
```

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `500 Internal Server Error`: Server error

### Pagination
List endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10-20, max: 100)

Pagination response format:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Filtering and Sorting
Many list endpoints support filtering and sorting:
- `search`: Text search
- `sortBy`: Field to sort by
- `sortOrder`: Sort direction (`asc` or `desc`)
- `filter`: JSON string with filter criteria

### Rate Limiting
API rate limiting is enforced to ensure fair usage:
- Standard endpoints: 100 requests per minute
- Authentication endpoints: 10 requests per minute
- Bulk operations: 10 requests per minute

### Best Practices

1. **Error Handling**: Always handle both success and error responses
2. **Pagination**: Use pagination for large data sets
3. **Caching**: Implement appropriate caching strategies
4. **Security**: Never expose sensitive data in URLs
5. **Validation**: Validate input data before sending requests

### API Versioning
The API currently uses URL-based versioning. Future versions will be available at:
- Current: `/api/...`
- Future: `/api/v2/...`

### Support
For API support and questions:
- Email: api-support@careerconnect.com
- Documentation Issues: Create an issue in the GitHub repository

## Quick Links

- [Postman Collection](./postman-collection.json) *(Coming Soon)*
- [OpenAPI Specification](./openapi.yaml) *(Coming Soon)*
- [Changelog](./CHANGELOG.md) *(Coming Soon)*
- [Migration Guide](./MIGRATION.md) *(Coming Soon)*

---

Last Updated: January 2025
