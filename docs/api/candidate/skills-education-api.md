# Candidate Skills & Education API Documentation

## Overview

This document describes the REST API endpoints for managing candidate skills and education records in the Career Connect platform.

## Authentication

All endpoints require authentication with a `CANDIDATE` role. The authentication is handled via session tokens.

---

## Candidate Skills API

### 1. Get Candidate Skills

Retrieves all skills for the authenticated candidate.

**Endpoint:** `GET /api/candidate/skills`

**Query Parameters:**
- `includeSkillDetails` (optional, boolean): Whether to include full skill details. Default: true

**Response:**
```json
{
  "success": true,
  "message": "Skills retrieved successfully",
  "data": {
    "skills": [
      {
        "id": "skill_id",
        "candidateId": "candidate_id",
        "skillId": "skill_id",
        "proficiencyLevel": "INTERMEDIATE",
        "yearsExperience": 3,
        "createdAt": "2024-01-01T00:00:00Z",
        "skill": {
          "id": "skill_id",
          "name": "React",
          "category": "TECHNICAL",
          "description": "React JavaScript library"
        }
      }
    ],
    "groupedSkills": {
      "TECHNICAL": [...],
      "SOFT": [...],
      "LANGUAGE": [...]
    },
    "total": 10
  }
}
```

### 2. Add Candidate Skill

Adds a new skill to the candidate's profile.

**Endpoint:** `POST /api/candidate/skills`

**Request Body (Single Skill):**
```json
{
  "skillId": "skill_id",
  "proficiencyLevel": "INTERMEDIATE",
  "yearsExperience": 3
}
```

**Request Body (Bulk Add):**
```json
{
  "skills": [
    {
      "skillId": "skill_id_1",
      "proficiencyLevel": "EXPERT",
      "yearsExperience": 5
    },
    {
      "skillId": "skill_id_2",
      "proficiencyLevel": "BEGINNER",
      "yearsExperience": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skill(s) added successfully",
  "data": {...}
}
```

### 3. Get Single Skill

Retrieves a specific skill for the candidate.

**Endpoint:** `GET /api/candidate/skills/{id}`

**Response:**
```json
{
  "success": true,
  "message": "Skill retrieved successfully",
  "data": {
    "skill": {
      "id": "skill_id",
      "candidateId": "candidate_id",
      "skillId": "skill_id",
      "proficiencyLevel": "ADVANCED",
      "yearsExperience": 4
    }
  }
}
```

### 4. Update Skill

Updates a candidate's skill proficiency level or years of experience.

**Endpoint:** `PUT /api/candidate/skills/{id}`

**Request Body:**
```json
{
  "proficiencyLevel": "EXPERT",
  "yearsExperience": 5
}
```

### 5. Delete Skill

Removes a skill from the candidate's profile.

**Endpoint:** `DELETE /api/candidate/skills/{id}`

---

## Candidate Education API

### 1. Get Candidate Education

Retrieves all education records for the authenticated candidate.

**Endpoint:** `GET /api/candidate/education`

**Query Parameters:**
- `sortBy` (optional): Field to sort by. Options: startDate, endDate, createdAt, gpa. Default: startDate
- `sortOrder` (optional): Sort direction. Options: asc, desc. Default: desc
- `includeDescription` (optional, boolean): Whether to include description field. Default: true

**Response:**
```json
{
  "success": true,
  "message": "Education records retrieved successfully",
  "data": {
    "education": [
      {
        "id": "education_id",
        "candidateId": "candidate_id",
        "institutionName": "University of Technology",
        "degreeType": "BACHELOR",
        "fieldOfStudy": "Computer Science",
        "startDate": "2018-09-01T00:00:00Z",
        "endDate": "2022-06-30T00:00:00Z",
        "gpa": 3.75,
        "description": "Focused on software engineering and AI",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 2,
    "statistics": {
      "totalEducation": 2,
      "byDegreeType": {
        "BACHELOR": 1,
        "MASTER": 1
      },
      "averageGPA": 3.65,
      "currentlyStudying": 0,
      "completed": 2
    }
  }
}
```

### 2. Add Education Record

Adds a new education record to the candidate's profile.

**Endpoint:** `POST /api/candidate/education`

**Request Body (Single Record):**
```json
{
  "institutionName": "University of Technology",
  "degreeType": "BACHELOR",
  "fieldOfStudy": "Computer Science",
  "startDate": "2018-09-01",
  "endDate": "2022-06-30",
  "gpa": 3.75,
  "description": "Focused on software engineering"
}
```

**Request Body (Bulk Add):**
```json
{
  "education": [
    {
      "institutionName": "University A",
      "degreeType": "BACHELOR",
      "fieldOfStudy": "Computer Science",
      "startDate": "2018-09-01",
      "endDate": "2022-06-30",
      "gpa": 3.75
    },
    {
      "institutionName": "University B",
      "degreeType": "MASTER",
      "fieldOfStudy": "Data Science",
      "startDate": "2022-09-01",
      "endDate": null,
      "gpa": null
    }
  ]
}
```

### 3. Get Single Education Record

Retrieves a specific education record.

**Endpoint:** `GET /api/candidate/education/{id}`

### 4. Update Education Record

Updates an existing education record.

**Endpoint:** `PUT /api/candidate/education/{id}`

**Request Body:**
```json
{
  "institutionName": "Updated University Name",
  "gpa": 3.85,
  "endDate": "2022-07-15"
}
```

### 5. Delete Education Record

Removes an education record from the candidate's profile.

**Endpoint:** `DELETE /api/candidate/education/{id}`

---

## Data Types

### Proficiency Levels
- `BEGINNER`
- `INTERMEDIATE`
- `ADVANCED`
- `EXPERT`

### Degree Types
- `CERTIFICATE`
- `DIPLOMA`
- `BACHELOR`
- `MASTER`
- `PHD`

### Skill Categories
- `TECHNICAL`
- `SOFT`
- `LANGUAGE`
- `TOOL`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": ["Error message"]
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An unexpected error occurred"
}
```
