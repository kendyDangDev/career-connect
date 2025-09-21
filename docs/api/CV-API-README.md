# CV Management API - Implementation Guide

## Overview

The CV Management API has been successfully implemented for the Career Connect platform. This API provides comprehensive functionality for managing user CVs and CV sections.

## Implementation Details

### Files Created

1. **Validation Schemas** (`src/lib/validations/cv.validation.ts`)
   - Input validation using Zod
   - Type-safe request/response handling
   - Query parameter validation

2. **API Utilities** (`src/lib/api-utils.ts`)
   - Response formatting helpers
   - Error handling
   - Authentication checks
   - Pagination utilities

3. **UserCV API Routes**
   - `src/app/api/cv/route.ts` - List and Create CVs
   - `src/app/api/cv/[id]/route.ts` - Get, Update, Delete single CV

4. **CVSection API Routes**
   - `src/app/api/cv/sections/route.ts` - List and Create sections
   - `src/app/api/cv/sections/[id]/route.ts` - Get, Update, Delete single section
   - `src/app/api/cv/sections/batch/route.ts` - Batch operations

5. **Documentation**
   - `docs/api/cv-api.md` - Complete API documentation
   - `test-cv-api.http` - API test file for testing endpoints

## Database Schema

The implementation uses three main models from Prisma schema:

### UserCv Model
```prisma
model UserCv {
  id         String       @id @default(cuid())
  userId     String?
  templateId String?      @default(cuid())
  cv_name    String
  cvData     Json?
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  template   Template?    @relation(fields: [templateId], references: [id])
  sections   CvSection[]
}
```

### CvSection Model
```prisma
model CvSection {
  id        String   @id @default(cuid())
  cvId      String
  title     String   @db.VarChar(100)
  content   Json?
  order     Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  cv        UserCv   @relation(fields: [cvId], references: [id], onDelete: Cascade)
}
```

## Key Features

### 1. Authentication & Authorization
- All endpoints require authentication via NextAuth
- Users can only access their own CVs
- Proper access control checks

### 2. CRUD Operations
- Complete CRUD for UserCV
- Complete CRUD for CVSection
- Batch operations for sections

### 3. Advanced Features
- Pagination with customizable limits
- Sorting and filtering options
- Batch update multiple sections
- Auto-reordering when deleting sections
- Cascading delete (deleting CV removes all sections)

### 4. Error Handling
- Comprehensive error messages
- Validation error details
- Proper HTTP status codes
- Prisma error handling

### 5. Data Validation
- Input validation using Zod
- UUID format validation
- Type-safe operations
- Query parameter validation

## API Endpoints Summary

### UserCV Endpoints
- `GET /api/cv` - List all CVs (paginated)
- `POST /api/cv` - Create new CV
- `GET /api/cv/{id}` - Get single CV
- `PUT /api/cv/{id}` - Update CV
- `DELETE /api/cv/{id}` - Delete CV

### CVSection Endpoints
- `GET /api/cv/sections` - List sections (paginated)
- `POST /api/cv/sections` - Create section
- `GET /api/cv/sections/{id}` - Get single section
- `PUT /api/cv/sections/{id}` - Update section
- `DELETE /api/cv/sections/{id}` - Delete section
- `PUT /api/cv/sections/batch` - Batch update sections
- `POST /api/cv/sections/batch` - Reorder sections

## Testing the API

### Prerequisites
1. Ensure the database is properly migrated
2. Ensure authentication is configured
3. Start the development server

### Using the Test File
The `test-cv-api.http` file can be used with:
- VS Code REST Client extension
- IntelliJ IDEA HTTP Client
- Any HTTP testing tool

### Manual Testing with cURL

Create a CV:
```bash
curl -X POST http://localhost:3000/api/cv \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"cv_name": "My Resume", "cvData": {}}'
```

Get all CVs:
```bash
curl http://localhost:3000/api/cv \
  -H "Cookie: your-auth-cookie"
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid session
2. **Access Control**: Users can only modify their own resources
3. **Input Validation**: All inputs are validated before processing
4. **SQL Injection Protection**: Using Prisma ORM with parameterized queries
5. **Rate Limiting**: Should be implemented in production

## Performance Optimizations

1. **Pagination**: All list endpoints support pagination
2. **Selective Includes**: Only necessary relations are loaded
3. **Indexed Fields**: Database indexes on frequently queried fields
4. **Transaction Support**: Batch operations use transactions

## Next Steps

### Required Setup
1. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Ensure environment variables are configured:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_URL` - Application URL
   - `NEXTAUTH_SECRET` - Secret for NextAuth

### Recommended Enhancements
1. Add rate limiting middleware
2. Implement caching for frequently accessed data
3. Add webhook support for CV changes
4. Implement CV versioning
5. Add export functionality (PDF, DOCX)
6. Add template management endpoints
7. Implement CV sharing features
8. Add analytics tracking

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Ensure you're logged in
   - Check session cookies

2. **"Access denied" error**
   - Verify you own the resource
   - Check user permissions

3. **Validation errors**
   - Check request body format
   - Verify required fields

4. **Database connection errors**
   - Check DATABASE_URL
   - Verify PostgreSQL is running

## Support

For issues or questions:
1. Check the API documentation at `docs/api/cv-api.md`
2. Review test examples in `test-cv-api.http`
3. Contact the development team

## License

This API is part of the Career Connect platform and follows the project's licensing terms.