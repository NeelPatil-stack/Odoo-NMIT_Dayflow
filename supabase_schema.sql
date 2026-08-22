-- ============================================================
-- KaaryaSetu / Dayflow HRMS — Complete Supabase PostgreSQL Schema & Seed Data
-- Paste and execute this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  department_head_id UUID,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. DESIGNATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address TEXT,
  emergency_contact JSONB,
  profile_picture TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  designation_id UUID REFERENCES designations(id) ON DELETE SET NULL,
  reporting_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employment_type VARCHAR(20) DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'intern', 'contract')),
  joining_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive', 'resigned')),
  salary_structure_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign key for department head
ALTER TABLE departments
  DROP CONSTRAINT IF EXISTS fk_dept_head,
  ADD CONSTRAINT fk_dept_head FOREIGN KEY (department_head_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ============================================================
-- 4. USERS (Authentication & Role Authorization)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('employee', 'hr', 'admin', 'manager')),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  refresh_token_hash VARCHAR(255),
  reset_token_hash VARCHAR(255),
  reset_token_expires TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  working_hours DECIMAL(4,2),
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'leave', 'late', 'holiday')),
  original_check_in TIMESTAMPTZ,
  original_check_out TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- ============================================================
-- 6. ATTENDANCE REGULARIZATION
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance_regularization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES attendance(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  requested_check_in TIMESTAMPTZ,
  requested_check_out TIMESTAMPTZ,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. LEAVE BALANCES
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('paid', 'sick', 'casual', 'unpaid')),
  allocated INTEGER DEFAULT 0,
  used INTEGER DEFAULT 0,
  remaining INTEGER DEFAULT 0,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type, year)
);

-- ============================================================
-- 8. LEAVES
-- ============================================================
CREATE TABLE IF NOT EXISTS leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('paid', 'sick', 'casual', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  attachment_path TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  admin_comment TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. SALARY STRUCTURES
-- ============================================================
CREATE TABLE IF NOT EXISTS salary_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
  basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  hra DECIMAL(12,2) DEFAULT 0,
  allowances DECIMAL(12,2) DEFAULT 0,
  bonus DECIMAL(12,2) DEFAULT 0,
  deductions DECIMAL(12,2) DEFAULT 0,
  tax_deductions DECIMAL(12,2) DEFAULT 0,
  gross_salary DECIMAL(12,2) GENERATED ALWAYS AS (basic_salary + hra + allowances + bonus) STORED,
  net_salary DECIMAL(12,2) GENERATED ALWAYS AS (basic_salary + hra + allowances + bonus - deductions - tax_deductions) STORED,
  effective_from DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. PAYROLL
-- ============================================================
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL,
  hra DECIMAL(12,2) DEFAULT 0,
  allowances DECIMAL(12,2) DEFAULT 0,
  bonus DECIMAL(12,2) DEFAULT 0,
  deductions DECIMAL(12,2) DEFAULT 0,
  tax_deductions DECIMAL(12,2) DEFAULT 0,
  gross_salary DECIMAL(12,2) NOT NULL,
  net_salary DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- ============================================================
-- 11. HOLIDAYS
-- ============================================================
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(30) DEFAULT 'national' CHECK (type IN ('national', 'regional', 'company', 'optional')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  publish_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  recipient_role VARCHAR(20),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id UUID,
  summary TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. ANONYMOUS FEEDBACK
-- ============================================================
CREATE TABLE IF NOT EXISTS anonymous_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'management', 'workplace', 'compensation', 'culture', 'other')),
  message TEXT NOT NULL,
  sentiment VARCHAR(20) DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  anonymous_hash VARCHAR(64),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'actioned', 'closed')),
  hr_note TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 16. RECRUITMENT APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS recruitment_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  position VARCHAR(100) NOT NULL,
  experience_years INTEGER DEFAULT 0,
  skills TEXT,
  cover_letter TEXT,
  resume_path TEXT,
  score INTEGER DEFAULT 50 CHECK (score BETWEEN 0 AND 100),
  status VARCHAR(30) DEFAULT 'review' CHECK (status IN ('review', 'shortlisted', 'rejected', 'hired', 'withdrawn')),
  hr_notes TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS on all tables so client applications can query directly using Supabase client
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'departments','designations','employees','users','attendance',
    'attendance_regularization','leave_balances','leaves','salary_structures',
    'payroll','holidays','announcements','notifications','audit_logs',
    'anonymous_feedback','recruitment_applications'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END;
$$;

-- ============================================================
-- SEED DEMO DATA
-- ============================================================

-- Clear old records
TRUNCATE TABLE audit_logs, notifications, announcements, holidays, payroll,
  salary_structures, leaves, leave_balances, attendance_regularization,
  attendance, recruitment_applications, anonymous_feedback CASCADE;

-- Insert Departments
INSERT INTO departments (id, name, code, description, status) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Engineering', 'ENG', 'Software development and technical operations', 'active'),
  ('d1000000-0000-0000-0000-000000000002', 'Human Resources', 'HR', 'People management and organizational culture', 'active'),
  ('d1000000-0000-0000-0000-000000000003', 'Finance', 'FIN', 'Financial planning and accounting', 'active'),
  ('d1000000-0000-0000-0000-000000000004', 'Marketing', 'MKT', 'Brand, growth, and communications', 'active'),
  ('d1000000-0000-0000-0000-000000000005', 'Sales', 'SLS', 'Revenue generation and client management', 'active')
ON CONFLICT (code) DO NOTHING;

-- Insert Designations
INSERT INTO designations (id, title, department_id, status) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Software Developer', 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('e1000000-0000-0000-0000-000000000002', 'Senior Software Developer', 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('e1000000-0000-0000-0000-000000000003', 'QA Engineer', 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('e1000000-0000-0000-0000-000000000004', 'HR Executive', 'd1000000-0000-0000-0000-000000000002', 'active'),
  ('e1000000-0000-0000-0000-000000000005', 'HR Manager', 'd1000000-0000-0000-0000-000000000002', 'active'),
  ('e1000000-0000-0000-0000-000000000006', 'Accountant', 'd1000000-0000-0000-0000-000000000003', 'active'),
  ('e1000000-0000-0000-0000-000000000007', 'Finance Manager', 'd1000000-0000-0000-0000-000000000003', 'active'),
  ('e1000000-0000-0000-0000-000000000008', 'Marketing Executive', 'd1000000-0000-0000-0000-000000000004', 'active'),
  ('e1000000-0000-0000-0000-000000000009', 'Sales Executive', 'd1000000-0000-0000-0000-000000000005', 'active'),
  ('e1000000-0000-0000-0000-000000000010', 'DevOps Engineer', 'd1000000-0000-0000-0000-000000000001', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Employees
INSERT INTO employees (id, employee_id, first_name, last_name, email, phone, date_of_birth, gender, address, department_id, designation_id, employment_type, joining_date, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'EMP001', 'Priya', 'Sharma', 'priya.sharma@kaaryasetu.com', '9876543210', '1988-03-15', 'female', 'Flat 201, Shivaji Nagar, Pune, Maharashtra 411005', 'd1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000005', 'full_time', '2020-01-15', 'active'),
  ('a0000000-0000-0000-0000-000000000002', 'EMP002', 'Rahul', 'Patil', 'rahul.patil@kaaryasetu.com', '9876543211', '1995-07-22', 'male', '12 MG Road, Bengaluru, Karnataka 560001', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'full_time', '2022-03-01', 'active'),
  ('a0000000-0000-0000-0000-000000000003', 'EMP003', 'Ananya', 'Desai', 'ananya.desai@kaaryasetu.com', '9876543212', '1993-11-08', 'female', '45 Civil Lines, Nagpur, Maharashtra 440001', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', 'full_time', '2021-06-15', 'active'),
  ('a0000000-0000-0000-0000-000000000004', 'EMP004', 'Amit', 'Joshi', 'amit.joshi@kaaryasetu.com', '9876543213', '1990-02-14', 'male', '78 Sector 17, Chandigarh 160017', 'd1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000006', 'full_time', '2021-09-01', 'active'),
  ('a0000000-0000-0000-0000-000000000005', 'EMP005', 'Kavya', 'Reddy', 'kavya.reddy@kaaryasetu.com', '9876543214', '1997-05-30', 'female', '33 Banjara Hills, Hyderabad, Telangana 500034', 'd1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000008', 'full_time', '2023-01-10', 'active'),
  ('a0000000-0000-0000-0000-000000000006', 'EMP006', 'Ravi', 'Kumar', 'ravi.kumar@kaaryasetu.com', '9876543215', '1991-09-18', 'male', '56 Anna Nagar, Chennai, Tamil Nadu 600040', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000003', 'full_time', '2022-07-01', 'active'),
  ('a0000000-0000-0000-0000-000000000007', 'EMP007', 'Sneha', 'Mehta', 'sneha.mehta@kaaryasetu.com', '9876543216', '1996-12-03', 'female', '90 Prahlad Nagar, Ahmedabad, Gujarat 380015', 'd1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000004', 'full_time', '2023-04-15', 'active'),
  ('a0000000-0000-0000-0000-000000000008', 'EMP008', 'Vikram', 'Singh', 'vikram.singh@kaaryasetu.com', '9876543217', '1992-08-25', 'male', '120 Civil Lines, Jaipur, Rajasthan 302006', 'd1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000009', 'full_time', '2021-11-01', 'active'),
  ('a0000000-0000-0000-0000-000000000009', 'EMP009', 'Pooja', 'Nair', 'pooja.nair@kaaryasetu.com', '9876543218', '1994-04-12', 'female', '67 Panampilly Nagar, Kochi, Kerala 682036', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000010', 'full_time', '2022-10-01', 'active'),
  ('a0000000-0000-0000-0000-000000000010', 'EMP010', 'Arjun', 'Verma', 'arjun.verma@kaaryasetu.com', '9876543219', '1998-01-20', 'male', '23 Lajpat Nagar, New Delhi 110024', 'd1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000007', 'full_time', '2023-08-01', 'active')
ON CONFLICT (employee_id) DO NOTHING;

-- Insert Users (Password hash for Dayflow@2026: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6)
INSERT INTO users (id, email, password_hash, role, employee_id, is_active) VALUES
  ('b0000000-0000-0000-0000-000000000000', 'admin@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'admin', NULL, TRUE),
  ('b0000000-0000-0000-0000-000000000001', 'priya.sharma@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'hr', 'a0000000-0000-0000-0000-000000000001', TRUE),
  ('b0000000-0000-0000-0000-000000000002', 'rahul.patil@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000002', TRUE),
  ('b0000000-0000-0000-0000-000000000003', 'ananya.desai@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000003', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert Holidays
INSERT INTO holidays (name, date, type, description) VALUES
  ('Republic Day', '2026-01-26', 'national', 'National holiday celebrating the constitution of India'),
  ('Holi', '2026-03-03', 'national', 'Festival of colours'),
  ('Good Friday', '2026-04-03', 'national', 'Christian holiday'),
  ('Independence Day', '2026-08-15', 'national', 'India Independence Day'),
  ('Gandhi Jayanti', '2026-10-02', 'national', 'Birthday of Mahatma Gandhi'),
  ('Diwali', '2026-10-19', 'national', 'Festival of lights'),
  ('Christmas Day', '2026-12-25', 'national', 'Christian holiday');

-- Insert Announcements
INSERT INTO announcements (title, message, priority, publish_date, expiry_date) VALUES
  ('Welcome to KaaryaSetu HRMS!', 'We are excited to launch our new HRMS platform — KaaryaSetu. This system will centralize all everyday HR activities.', 'important', CURRENT_DATE - 7, CURRENT_DATE + 30),
  ('Q3 Performance Reviews', 'Q3 performance reviews will begin shortly. Please complete your self-assessment forms.', 'urgent', CURRENT_DATE, CURRENT_DATE + 14);

-- Done!
