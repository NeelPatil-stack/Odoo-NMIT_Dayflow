-- ============================================================
-- KaaryaSetu / Dayflow HRMS — Seed Data
-- Run AFTER schema.sql
-- Demo credentials documented in README.md
-- ============================================================
-- NOTE: Passwords are bcrypt hashes of the values shown in comments.
-- All demo user passwords: Dayflow@2026 (except employees: Dayflow@<EmployeeID>)
-- ============================================================

-- Clear existing data (run schema.sql first to ensure tables exist)
TRUNCATE TABLE audit_logs, notifications, announcements, holidays, payroll,
  salary_structures, leaves, leave_balances, attendance_regularization,
  attendance, assets, recruitment_applications, anonymous_feedback CASCADE;

-- ============================================================
-- DEPARTMENTS
-- ============================================================
INSERT INTO departments (id, name, code, description, status) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Engineering', 'ENG', 'Software development and technical operations', 'active'),
  ('d1000000-0000-0000-0000-000000000002', 'Human Resources', 'HR', 'People management and organizational culture', 'active'),
  ('d1000000-0000-0000-0000-000000000003', 'Finance', 'FIN', 'Financial planning and accounting', 'active'),
  ('d1000000-0000-0000-0000-000000000004', 'Marketing', 'MKT', 'Brand, growth, and communications', 'active'),
  ('d1000000-0000-0000-0000-000000000005', 'Sales', 'SLS', 'Revenue generation and client management', 'active');

-- ============================================================
-- DESIGNATIONS
-- ============================================================
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
  ('e1000000-0000-0000-0000-000000000010', 'DevOps Engineer', 'd1000000-0000-0000-0000-000000000001', 'active');

-- ============================================================
-- EMPLOYEES (10 employees + 1 admin user)
-- ============================================================
INSERT INTO employees (id, employee_id, first_name, last_name, email, phone, date_of_birth, gender, address, department_id, designation_id, employment_type, joining_date, status) VALUES
  -- HR Manager (will also be admin user)
  ('a0000000-0000-0000-0000-000000000001', 'EMP001', 'Priya', 'Sharma', 'priya.sharma@kaaryasetu.com', '9876543210', '1988-03-15', 'female', 'Flat 201, Shivaji Nagar, Pune, Maharashtra 411005', 'd1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000005', 'full_time', '2020-01-15', 'active'),
  -- Employees
  ('a0000000-0000-0000-0000-000000000002', 'EMP002', 'Rahul', 'Patil', 'rahul.patil@kaaryasetu.com', '9876543211', '1995-07-22', 'male', '12 MG Road, Bengaluru, Karnataka 560001', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'full_time', '2022-03-01', 'active'),
  ('a0000000-0000-0000-0000-000000000003', 'EMP003', 'Ananya', 'Desai', 'ananya.desai@kaaryasetu.com', '9876543212', '1993-11-08', 'female', '45 Civil Lines, Nagpur, Maharashtra 440001', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', 'full_time', '2021-06-15', 'active'),
  ('a0000000-0000-0000-0000-000000000004', 'EMP004', 'Amit', 'Joshi', 'amit.joshi@kaaryasetu.com', '9876543213', '1990-02-14', 'male', '78 Sector 17, Chandigarh 160017', 'd1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000006', 'full_time', '2021-09-01', 'active'),
  ('a0000000-0000-0000-0000-000000000005', 'EMP005', 'Kavya', 'Reddy', 'kavya.reddy@kaaryasetu.com', '9876543214', '1997-05-30', 'female', '33 Banjara Hills, Hyderabad, Telangana 500034', 'd1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000008', 'full_time', '2023-01-10', 'active'),
  ('a0000000-0000-0000-0000-000000000006', 'EMP006', 'Ravi', 'Kumar', 'ravi.kumar@kaaryasetu.com', '9876543215', '1991-09-18', 'male', '56 Anna Nagar, Chennai, Tamil Nadu 600040', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000003', 'full_time', '2022-07-01', 'active'),
  ('a0000000-0000-0000-0000-000000000007', 'EMP007', 'Sneha', 'Mehta', 'sneha.mehta@kaaryasetu.com', '9876543216', '1996-12-03', 'female', '90 Prahlad Nagar, Ahmedabad, Gujarat 380015', 'd1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000004', 'full_time', '2023-04-15', 'active'),
  ('a0000000-0000-0000-0000-000000000008', 'EMP008', 'Vikram', 'Singh', 'vikram.singh@kaaryasetu.com', '9876543217', '1992-08-25', 'male', '120 Civil Lines, Jaipur, Rajasthan 302006', 'd1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000009', 'full_time', '2021-11-01', 'active'),
  ('a0000000-0000-0000-0000-000000000009', 'EMP009', 'Pooja', 'Nair', 'pooja.nair@kaaryasetu.com', '9876543218', '1994-04-12', 'female', '67 Panampilly Nagar, Kochi, Kerala 682036', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000010', 'full_time', '2022-10-01', 'active'),
  ('a0000000-0000-0000-0000-000000000010', 'EMP010', 'Arjun', 'Verma', 'arjun.verma@kaaryasetu.com', '9876543219', '1998-01-20', 'male', '23 Lajpat Nagar, New Delhi 110024', 'd1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000007', 'full_time', '2023-08-01', 'active');

-- Set department heads
UPDATE departments SET department_head_id = 'a0000000-0000-0000-0000-000000000003' WHERE id = 'd1000000-0000-0000-0000-000000000001';
UPDATE departments SET department_head_id = 'a0000000-0000-0000-0000-000000000001' WHERE id = 'd1000000-0000-0000-0000-000000000002';

-- ============================================================
-- USERS (Authentication accounts)
-- All passwords = Dayflow@2026 → bcrypt hash below
-- ============================================================
-- Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6
INSERT INTO users (id, email, password_hash, role, employee_id, is_active) VALUES
  -- ADMIN (not linked to an employee)
  ('u0000000-0000-0000-0000-000000000000', 'admin@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'admin', NULL, TRUE),
  -- HR (Priya Sharma)
  ('u0000000-0000-0000-0000-000000000001', 'priya.sharma@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'hr', 'a0000000-0000-0000-0000-000000000001', TRUE),
  -- Employees
  ('u0000000-0000-0000-0000-000000000002', 'rahul.patil@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000002', TRUE),
  ('u0000000-0000-0000-0000-000000000003', 'ananya.desai@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000003', TRUE),
  ('u0000000-0000-0000-0000-000000000004', 'amit.joshi@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000004', TRUE),
  ('u0000000-0000-0000-0000-000000000005', 'kavya.reddy@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000005', TRUE),
  ('u0000000-0000-0000-0000-000000000006', 'ravi.kumar@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000006', TRUE),
  ('u0000000-0000-0000-0000-000000000007', 'sneha.mehta@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000007', TRUE),
  ('u0000000-0000-0000-0000-000000000008', 'vikram.singh@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000008', TRUE),
  ('u0000000-0000-0000-0000-000000000009', 'pooja.nair@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000009', TRUE),
  ('u0000000-0000-0000-0000-000000000010', 'arjun.verma@kaaryasetu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniPkEKlINOlgqCeRT8BajPkW6', 'employee', 'a0000000-0000-0000-0000-000000000010', TRUE);

-- ============================================================
-- SALARY STRUCTURES
-- ============================================================
INSERT INTO salary_structures (employee_id, basic_salary, hra, allowances, bonus, deductions, tax_deductions, effective_from) VALUES
  ('a0000000-0000-0000-0000-000000000001', 80000, 32000, 10000, 5000, 2000, 8000, '2024-01-01'),
  ('a0000000-0000-0000-0000-000000000002', 55000, 22000, 7000, 2000, 1500, 5000, '2024-01-01'),
  ('a0000000-0000-0000-0000-000000000003', 75000, 30000, 9000, 4000, 2000, 7500, '2024-01-01'),
  ('a0000000-0000-0000-0000-000000000004', 60000, 24000, 8000, 2500, 1800, 6000, '2024-01-01'),
  ('a0000000-0000-0000-0000-000000000005', 45000, 18000, 6000, 1500, 1200, 4500, '2024-01-01'),
  ('a0000000-0000-0000-0000-000000000006', 52000, 20800, 7000, 2000, 1500, 5200, '2024-01-01'),
  ('a0000000-0000-0000-0000-000000000007', 48000, 19200, 6500, 1500, 1300, 4800, '2024-01-01'),
  ('a0000000-0000-0000-0000-000000000008', 50000, 20000, 7000, 2000, 1400, 5000, '2024-01-01'),
  ('a0000000-0000-0000-0000-000000000009', 68000, 27200, 9000, 3000, 1900, 6800, '2024-01-01'),
  ('a0000000-0000-0000-0000-000000000010', 70000, 28000, 10000, 4000, 2000, 7000, '2024-01-01');

-- ============================================================
-- LEAVE BALANCES (2026)
-- ============================================================
DO $$
DECLARE
  emp UUID;
  emp_ids UUID[] := ARRAY[
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000010'
  ];
BEGIN
  FOREACH emp IN ARRAY emp_ids LOOP
    INSERT INTO leave_balances (employee_id, leave_type, allocated, used, remaining, year)
    VALUES
      (emp, 'paid', 12, 2, 10, 2026),
      (emp, 'sick', 6, 1, 5, 2026),
      (emp, 'casual', 6, 0, 6, 2026),
      (emp, 'unpaid', 0, 0, 0, 2026)
    ON CONFLICT (employee_id, leave_type, year) DO NOTHING;
  END LOOP;
END;
$$;

-- ============================================================
-- ATTENDANCE (last 15 days sample)
-- ============================================================
INSERT INTO attendance (employee_id, date, check_in, check_out, working_hours, status) VALUES
  ('a0000000-0000-0000-0000-000000000002', CURRENT_DATE - 14, NOW() - INTERVAL '14 days 8 hours', NOW() - INTERVAL '14 days', 8.0, 'present'),
  ('a0000000-0000-0000-0000-000000000002', CURRENT_DATE - 13, NOW() - INTERVAL '13 days 8 hours', NOW() - INTERVAL '13 days', 8.5, 'present'),
  ('a0000000-0000-0000-0000-000000000002', CURRENT_DATE - 7, NOW() - INTERVAL '7 days 7.5 hours', NOW() - INTERVAL '7 days', 7.5, 'present'),
  ('a0000000-0000-0000-0000-000000000002', CURRENT_DATE - 1, NOW() - INTERVAL '1 day 9 hours', NOW() - INTERVAL '1 day', 9.0, 'late'),
  ('a0000000-0000-0000-0000-000000000003', CURRENT_DATE - 14, NOW() - INTERVAL '14 days 8 hours', NOW() - INTERVAL '14 days', 8.0, 'present'),
  ('a0000000-0000-0000-0000-000000000003', CURRENT_DATE - 1, NOW() - INTERVAL '1 day 8 hours', NOW() - INTERVAL '1 day', 8.0, 'present'),
  ('a0000000-0000-0000-0000-000000000004', CURRENT_DATE - 1, NOW() - INTERVAL '1 day 8 hours', NOW() - INTERVAL '1 day', 8.0, 'present');

-- ============================================================
-- LEAVES (sample)
-- ============================================================
INSERT INTO leaves (employee_id, leave_type, start_date, end_date, total_days, reason, status) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'paid', CURRENT_DATE + 5, CURRENT_DATE + 6, 2, 'Family event', 'pending'),
  ('a0000000-0000-0000-0000-000000000003', 'sick', CURRENT_DATE - 10, CURRENT_DATE - 9, 2, 'Fever and rest', 'approved'),
  ('a0000000-0000-0000-0000-000000000005', 'casual', CURRENT_DATE + 10, CURRENT_DATE + 10, 1, 'Personal work', 'pending'),
  ('a0000000-0000-0000-0000-000000000006', 'paid', CURRENT_DATE - 5, CURRENT_DATE - 4, 2, 'Wedding ceremony', 'approved');

-- ============================================================
-- PAYROLL (sample — last 2 months)
-- ============================================================
INSERT INTO payroll (employee_id, month, year, basic_salary, hra, allowances, bonus, deductions, tax_deductions, gross_salary, net_salary, status) VALUES
  ('a0000000-0000-0000-0000-000000000002', 7, 2026, 55000, 22000, 7000, 2000, 1500, 5000, 86000, 79500, 'paid'),
  ('a0000000-0000-0000-0000-000000000002', 8, 2026, 55000, 22000, 7000, 2000, 1500, 5000, 86000, 79500, 'processed'),
  ('a0000000-0000-0000-0000-000000000003', 7, 2026, 75000, 30000, 9000, 4000, 2000, 7500, 118000, 108500, 'paid'),
  ('a0000000-0000-0000-0000-000000000004', 7, 2026, 60000, 24000, 8000, 2500, 1800, 6000, 94500, 86700, 'paid');

-- ============================================================
-- HOLIDAYS
-- ============================================================
INSERT INTO holidays (name, date, type, description) VALUES
  ('Republic Day', '2026-01-26', 'national', 'National holiday celebrating the constitution of India'),
  ('Holi', '2026-03-03', 'national', 'Festival of colours'),
  ('Ram Navami', '2026-03-29', 'regional', 'Hindu festival'),
  ('Good Friday', '2026-04-03', 'national', 'Christian holiday'),
  ('Maharashtra Day', '2026-05-01', 'regional', 'Maharashtra state formation day'),
  ('Eid ul-Fitr', '2026-03-31', 'national', 'Islamic holiday'),
  ('Independence Day', '2026-08-15', 'national', 'India Independence Day'),
  ('Ganesh Chaturthi', '2026-08-22', 'regional', 'Hindu festival of Lord Ganesha'),
  ('Gandhi Jayanti', '2026-10-02', 'national', 'Birthday of Mahatma Gandhi'),
  ('Diwali', '2026-10-19', 'national', 'Festival of lights'),
  ('Christmas Day', '2026-12-25', 'national', 'Christian holiday');

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
INSERT INTO announcements (title, message, priority, publish_date, expiry_date, created_by) VALUES
  ('Welcome to KaaryaSetu HRMS!', 'We are excited to launch our new HRMS platform — KaaryaSetu. This system will centralize all your HR activities. Please complete your profile and explore the features.', 'important', CURRENT_DATE - 7, CURRENT_DATE + 30, 'u0000000-0000-0000-0000-000000000001'),
  ('Diwali Celebration — Office Event', 'We will be celebrating Diwali on October 18th (Saturday) at the office. Please join us for sweets, decorations, and team activities!', 'normal', CURRENT_DATE - 2, CURRENT_DATE + 60, 'u0000000-0000-0000-0000-000000000001'),
  ('Updated Leave Policy 2026', 'Please note that the leave encashment policy has been updated for 2026. Unused sick leaves can now be carried forward to the next year. Read full policy in HR documents.', 'important', CURRENT_DATE - 1, CURRENT_DATE + 90, 'u0000000-0000-0000-0000-000000000001'),
  ('Q3 Performance Reviews', 'Q3 performance reviews will begin from September 1st. Please complete your self-assessment forms before August 31st.', 'urgent', CURRENT_DATE, CURRENT_DATE + 14, 'u0000000-0000-0000-0000-000000000001');

-- ============================================================
-- NOTIFICATIONS (sample)
-- ============================================================
INSERT INTO notifications (recipient_id, title, message, type, is_read) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Welcome to KaaryaSetu!', 'Your account is ready. Please complete your profile and explore the dashboard.', 'welcome', FALSE),
  ('a0000000-0000-0000-0000-000000000002', 'Payslip Available', 'Your payslip for July 2026 is now available. Net salary: ₹79,500', 'payslip', FALSE),
  ('a0000000-0000-0000-0000-000000000003', 'Leave Approved', 'Your sick leave request from Aug 11-12 has been approved.', 'leave_update', TRUE),
  ('a0000000-0000-0000-0000-000000000004', 'Payslip Available', 'Your payslip for July 2026 is now available. Net salary: ₹86,700', 'payslip', FALSE);

-- ============================================================
-- ANONYMOUS FEEDBACK (sample)
-- ============================================================
INSERT INTO anonymous_feedback (category, message, sentiment, anonymous_hash, status) VALUES
  ('workplace', 'The new office has great infrastructure but the cafeteria menu could be improved with healthier options.', 'neutral', 'demo_hash_001', 'new'),
  ('management', 'Team meetings are productive and management is responsive to concerns. Good work culture!', 'positive', 'demo_hash_002', 'reviewed'),
  ('compensation', 'It would be great if the company introduced performance bonuses quarterly rather than annually.', 'neutral', 'demo_hash_003', 'new'),
  ('culture', 'The team is inclusive and diverse. Really happy with the work environment and the way everyone supports each other.', 'positive', 'demo_hash_004', 'new');

-- ============================================================
-- RECRUITMENT APPLICATIONS (sample)
-- ============================================================
INSERT INTO recruitment_applications (applicant_name, email, phone, position, experience_years, skills, cover_letter, score, status) VALUES
  ('Rohan Kapoor', 'rohan.kapoor@email.com', '9123456780', 'Senior Software Developer', 5, 'React, Node.js, PostgreSQL, Docker, AWS', 'I am passionate about building scalable web applications and have 5 years of experience in full-stack development.', 95, 'shortlisted'),
  ('Meera Pillai', 'meera.pillai@email.com', '9123456781', 'HR Executive', 3, 'Recruitment, HRMS, Payroll, Labour Law', 'I have 3 years of HR experience with a strong focus on employee engagement and talent acquisition.', 80, 'shortlisted'),
  ('Suresh Rao', 'suresh.rao@email.com', '9123456782', 'Software Developer', 1, 'JavaScript, React', 'Recent graduate with internship experience in frontend development.', 55, 'review'),
  ('Lakshmi Iyer', 'lakshmi.iyer@email.com', '9123456783', 'QA Engineer', 2, 'Selenium, JIRA, Manual Testing, Postman', 'Experienced QA engineer with expertise in both manual and automated testing.', 70, 'shortlisted'),
  ('Deepak Choudhary', 'deepak.c@email.com', '9123456784', 'Marketing Executive', 0, 'Social Media, Content Writing', 'Fresh graduate with strong marketing skills and internship experience.', 45, 'rejected');

-- Done!
SELECT 'Seed data inserted successfully! Demo credentials: admin@kaaryasetu.com / Dayflow@2026' AS message;
