# Testing Candidate Skills & Education APIs

## Overview

This guide provides instructions for testing the Candidate Skills and Education APIs.

## Prerequisites

1. **Database Setup**: Ensure PostgreSQL is running and database is migrated
2. **Environment Variables**: Ensure `.env` file is configured with database connection
3. **Development Server**: Start the server with `npm run dev`
4. **Authentication**: You need to be authenticated as a CANDIDATE user

## Test Data Setup

Before testing, you may need to:
1. Create a test user with CANDIDATE role
2. Ensure the user has a candidate profile
3. Add some test skills to the skills table

## Testing with Postman

### Import Collection
1. Import the file `docs/api/candidate/skills-education.postman_collection.json` into Postman
2. Set the `baseUrl` variable to your server URL (default: `http://localhost:3000/api`)
3. Set up authentication token

### Running Tests
1. **Skills API**:
   - First, get all skills to check current state
   - Add a new skill (you'll need valid skill IDs from the database)
   - Update the skill's proficiency level
   - Delete the skill when done testing

2. **Education API**:
   - Get all education records to check current state
   - Add a new education record
   - Update the education record (e.g., GPA or end date)
   - Delete the education record when done testing

## Testing with cURL

### Skills API Examples

```bash
# Get all skills
curl -X GET http://localhost:3000/api/candidate/skills \
  -H "Cookie: [your-session-cookie]"

# Add a new skill
curl -X POST http://localhost:3000/api/candidate/skills \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{
    "skillId": "skill-id-here",
    "proficiencyLevel": "INTERMEDIATE",
    "yearsExperience": 3
  }'

# Update a skill
curl -X PUT http://localhost:3000/api/candidate/skills/[skill-id] \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{
    "proficiencyLevel": "ADVANCED",
    "yearsExperience": 5
  }'

# Delete a skill
curl -X DELETE http://localhost:3000/api/candidate/skills/[skill-id] \
  -H "Cookie: [your-session-cookie]"
```

### Education API Examples

```bash
# Get all education records
curl -X GET http://localhost:3000/api/candidate/education \
  -H "Cookie: [your-session-cookie]"

# Add education record
curl -X POST http://localhost:3000/api/candidate/education \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{
    "institutionName": "University of Technology",
    "degreeType": "BACHELOR",
    "fieldOfStudy": "Computer Science",
    "startDate": "2018-09-01",
    "endDate": "2022-06-30",
    "gpa": 3.75
  }'

# Update education record
curl -X PUT http://localhost:3000/api/candidate/education/[education-id] \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{
    "gpa": 3.85
  }'

# Delete education record
curl -X DELETE http://localhost:3000/api/candidate/education/[education-id] \
  -H "Cookie: [your-session-cookie]"
```

## Common Issues and Solutions

### 1. Authentication Error
- **Error**: 401 Unauthorized
- **Solution**: Ensure you're logged in as a CANDIDATE user and include the session cookie

### 2. Candidate Profile Not Found
- **Error**: 404 "Candidate profile not found"
- **Solution**: Ensure the user has a candidate profile in the database

### 3. Invalid Skill ID
- **Error**: 404 "Skill not found"
- **Solution**: Use valid skill IDs from the skills table in the database

### 4. Duplicate Skill
- **Error**: 409 "You already have this skill"
- **Solution**: Cannot add the same skill twice. Delete the existing skill first or update it

### 5. Invalid Dates
- **Error**: Validation error on dates
- **Solution**: Use ISO 8601 date format (YYYY-MM-DD)

## Database Queries for Testing

```sql
-- Check if user has candidate profile
SELECT * FROM candidates WHERE user_id = 'your-user-id';

-- List available skills
SELECT id, name, category FROM skills WHERE is_active = true;

-- Check candidate's current skills
SELECT cs.*, s.name 
FROM candidate_skills cs
JOIN skills s ON cs.skill_id = s.id
WHERE cs.candidate_id = 'your-candidate-id';

-- Check candidate's education records
SELECT * FROM candidate_education 
WHERE candidate_id = 'your-candidate-id'
ORDER BY start_date DESC;
```

## Next Steps

After testing:
1. Check the database to verify data was saved correctly
2. Test edge cases (invalid data, missing fields, etc.)
3. Test bulk operations with multiple records
4. Test filtering and sorting parameters
5. Monitor server logs for any errors
