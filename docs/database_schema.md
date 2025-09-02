# Database Schema - Website Tuyển Dụng & Tìm Việc

## 1. Bảng Người Dùng (Users)

### users

```sql
- id (PK)
- email (UNIQUE)
- password_hash
- user_type (ENUM: 'candidate', 'employer', 'admin')
- first_name
- last_name
- phone
- avatar_url
- email_verified (BOOLEAN)
- status (ENUM: 'active', 'inactive', 'suspended')
- created_at
- updated_at
```

### user_profiles

```sql
- id (PK)
- user_id (FK -> users.id)
- date_of_birth
- gender
- address
- city
- province
- country
- bio
- website_url
- linkedin_url
- github_url
- portfolio_url
- created_at
- updated_at
```

## 2. Bảng Ứng Viên (Candidates)

### candidates

```sql
- id (PK)
- user_id (FK -> users.id)
- current_position
- experience_years
- expected_salary_min
- expected_salary_max
- currency
- availability_status (ENUM: 'available', 'not_available', 'passive')
- preferred_work_type (ENUM: 'full_time', 'part_time', 'contract', 'freelance')
- preferred_location_type (ENUM: 'onsite', 'remote', 'hybrid')
- cv_file_url
- cover_letter
- created_at
- updated_at
```

### candidate_skills

```sql
- id (PK)
- candidate_id (FK -> candidates.id)
- skill_id (FK -> skills.id)
- proficiency_level (ENUM: 'beginner', 'intermediate', 'advanced', 'expert')
- years_experience
- created_at
```

### candidate_education

```sql
- id (PK)
- candidate_id (FK -> candidates.id)
- institution_name
- degree_type (ENUM: 'bachelor', 'master', 'phd', 'diploma', 'certificate')
- field_of_study
- start_date
- end_date
- gpa
- description
- created_at
```

### candidate_experience

```sql
- id (PK)
- candidate_id (FK -> candidates.id)
- company_name
- position_title
- employment_type (ENUM: 'full_time', 'part_time', 'contract', 'internship')
- start_date
- end_date
- is_current (BOOLEAN)
- description
- achievements
- created_at
```

### candidate_certifications

```sql
- id (PK)
- candidate_id (FK -> candidates.id)
- certification_name
- issuing_organization
- issue_date
- expiry_date
- credential_id
- credential_url
- created_at
```

## 3. Bảng Nhà Tuyển Dụng (Employers)

### companies

```sql
- id (PK)
- company_name
- company_slug (UNIQUE)
- industry_id (FK -> industries.id)
- company_size (ENUM: '1-10', '11-50', '51-200', '201-500', '500+')
- website_url
- description
- logo_url
- cover_image_url
- address
- city
- province
- country
- phone
- email
- founded_year
- verification_status (ENUM: 'pending', 'verified', 'rejected')
- created_at
- updated_at
```

### company_users

```sql
- id (PK)
- company_id (FK -> companies.id)
- user_id (FK -> users.id)
- role (ENUM: 'admin', 'recruiter', 'hr_manager')
- permissions (JSON)
- is_primary_contact (BOOLEAN)
- created_at
```

## 4. Bảng Công Việc (Jobs)

### jobs

```sql
- id (PK)
- company_id (FK -> companies.id)
- recruiter_id (FK -> users.id)
- title
- slug (UNIQUE)
- description
- requirements
- benefits
- job_type (ENUM: 'full_time', 'part_time', 'contract', 'internship')
- work_location_type (ENUM: 'onsite', 'remote', 'hybrid')
- experience_level (ENUM: 'entry', 'mid', 'senior', 'lead', 'executive')
- salary_min
- salary_max
- currency
- salary_negotiable (BOOLEAN)
- location_city
- location_province
- location_country
- application_deadline
- status (ENUM: 'draft', 'active', 'paused', 'closed', 'expired')
- view_count
- application_count
- featured (BOOLEAN)
- urgent (BOOLEAN)
- created_at
- updated_at
- published_at
```

### job_skills

```sql
- id (PK)
- job_id (FK -> jobs.id)
- skill_id (FK -> skills.id)
- required_level (ENUM: 'nice_to_have', 'preferred', 'required')
- min_years_experience
- created_at
```

### job_categories

```sql
- id (PK)
- job_id (FK -> jobs.id)
- category_id (FK -> categories.id)
- created_at
```

## 5. Bảng Ứng Tuyển (Applications)

### applications

```sql
- id (PK)
- job_id (FK -> jobs.id)
- candidate_id (FK -> candidates.id)
- cover_letter
- cv_file_url
- status (ENUM: 'applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn')
- applied_at
- status_updated_at
- recruiter_notes
- rating (1-5)
- interview_scheduled_at
- created_at
- updated_at
```

### application_timeline

```sql
- id (PK)
- application_id (FK -> applications.id)
- status
- note
- changed_by (FK -> users.id)
- created_at
```

## 6. Bảng Tham Chiếu (Reference Tables)

### skills

```sql
- id (PK)
- name
- slug
- category (ENUM: 'technical', 'soft', 'language', 'tool')
- description
- icon_url
- is_active (BOOLEAN)
- created_at
```

### categories

```sql
- id (PK)
- name
- slug
- parent_id (FK -> categories.id) -- For hierarchical categories
- description
- icon_url
- is_active (BOOLEAN)
- sort_order
- created_at
```

### industries

```sql
- id (PK)
- name
- slug
- description
- icon_url
- is_active (BOOLEAN)
- sort_order
- created_at
```

### locations

```sql
- id (PK)
- name
- type (ENUM: 'country', 'province', 'city', 'district')
- parent_id (FK -> locations.id)
- latitude
- longitude
- is_active (BOOLEAN)
- created_at
```

## 7. Bảng Tương Tác (Interactions)

### saved_jobs

```sql
- id (PK)
- candidate_id (FK -> candidates.id)
- job_id (FK -> jobs.id)
- created_at
```

### job_views

```sql
- id (PK)
- job_id (FK -> jobs.id)
- user_id (FK -> users.id) -- NULL for anonymous
- ip_address
- user_agent
- viewed_at
```

### company_followers

```sql
- id (PK)
- company_id (FK -> companies.id)
- candidate_id (FK -> candidates.id)
- created_at
```

### job_alerts

```sql
- id (PK)
- candidate_id (FK -> candidates.id)
- alert_name
- keywords
- location_ids (JSON array)
- category_ids (JSON array)
- job_type
- salary_min
- experience_level
- frequency (ENUM: 'daily', 'weekly', 'instant')
- is_active (BOOLEAN)
- last_sent_at
- created_at
```

## 8. Bảng Đánh Giá & Reviews

### company_reviews

```sql
- id (PK)
- company_id (FK -> companies.id)
- reviewer_id (FK -> users.id)
- rating (1-5)
- title
- review_text
- pros
- cons
- work_life_balance_rating (1-5)
- salary_benefit_rating (1-5)
- management_rating (1-5)
- culture_rating (1-5)
- is_anonymous (BOOLEAN)
- employment_status (ENUM: 'current', 'former')
- position_title
- employment_length
- is_approved (BOOLEAN)
- created_at
```

### interview_reviews

```sql
- id (PK)
- company_id (FK -> companies.id)
- job_id (FK -> jobs.id)
- reviewer_id (FK -> users.id)
- overall_rating (1-5)
- difficulty_rating (1-5)
- experience_description
- interview_questions
- process_description
- outcome (ENUM: 'offer', 'rejection', 'pending')
- recommendation (BOOLEAN)
- is_anonymous (BOOLEAN)
- created_at
```

## 9. Bảng Thông Báo (Notifications)

### notifications

```sql
- id (PK)
- user_id (FK -> users.id)
- type (ENUM: 'application_status', 'new_job_match', 'message', 'system')
- title
- message
- data (JSON) -- Additional data
- is_read (BOOLEAN)
- created_at
```

### messages

```sql
- id (PK)
- sender_id (FK -> users.id)
- recipient_id (FK -> users.id)
- subject
- content
- message_type (ENUM: 'application_message', 'inquiry', 'system')
- related_application_id (FK -> applications.id)
- is_read (BOOLEAN)
- created_at
```

## 10. Bảng Hệ Thống

### system_settings

```sql
- id (PK)
- key (UNIQUE)
- value
- description
- data_type (ENUM: 'string', 'number', 'boolean', 'json')
- updated_by (FK -> users.id)
- updated_at
```

### audit_logs

```sql
- id (PK)
- user_id (FK -> users.id)
- action
- table_name
- record_id
- old_values (JSON)
- new_values (JSON)
- ip_address
- user_agent
- created_at
```

## Quan Hệ Chính:

- **One-to-Many**: Company → Jobs, Candidate → Applications
- **Many-to-Many**: Jobs ↔ Skills, Jobs ↔ Categories
- **Self-referencing**: Categories (parent-child), Locations (hierarchical)

## Indexes Quan Trọng:

```sql
-- Performance optimization
INDEX idx_jobs_status_published ON jobs(status, published_at)
INDEX idx_jobs_location ON jobs(location_city, location_province)
INDEX idx_jobs_salary ON jobs(salary_min, salary_max)
INDEX idx_applications_status ON applications(status, applied_at)
INDEX idx_job_skills_lookup ON job_skills(job_id, skill_id)
```

Bạn có muốn tôi detail hóa thêm bảng nào hoặc tạo script migration cho database không?
