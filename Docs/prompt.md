LDCE Hackathon 



Use your cloud and agents. All the skills.md files that you have to make the project and make the project the best. It should not look generated. It must be fully authenticated with proper, professional, production-ready UI and all production-ready things. 

# MASTER PROMPT — DAYFLOW HRMS

Build a complete, modern, responsive, full-stack **Human Resource Management System (HRMS)** named:



PROJECT NAME — KaaryaSetu — design logo in Marathi 
# Dayflow

### “Every workday, perfectly aligned.”

The application should look and behave like a real professional HR management platform used by a company.

Do NOT create only a static UI or dummy dashboard. Build a functional full-stack application with authentication, database integration, CRUD operations, role-based authorization, validations, workflows, notifications, analytics, and proper error handling.

---

# 1. PROJECT OBJECTIVE

Dayflow should digitize and centralize everyday HR activities including:

* Employee onboarding
* Employee profile management
* Attendance
* Check-in / Check-out
* Leave management
* Leave approval
* Leave balance
* Payroll visibility
* Payslips
* Departments
* Designations
* Holiday calendar
* Announcements
* Notifications
* Reports and analytics

The system should primarily support:

1. Employee
2. HR/Admin

Design the architecture so a **Manager role can be added or enabled later**.

---

# 2. RECOMMENDED TECH STACK

Use:

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts or Chart.js
* Lucide React icons

### Backend

* Node.js
* Express.js
* REST API

### Database

Supabase 

### Authentication

* JWT authentication
* bcrypt password hashing
* Role-based authorization

### Additional

* Multer for document/profile image uploads
* Nodemailer for email notifications if required
* PDF generation library for payslips

Use environment variables for:

* Database URL
* JWT secret
* Email credentials
* Application configuration

Never expose secrets in frontend code.

---

# 3. USER ROLES

## Employee

Employee can:

* Login
* View dashboard
* View/edit permitted profile information
* Upload profile picture
* View employment information
* View department/designation
* Check in
* Check out
* View attendance
* View working hours
* Request attendance correction
* Apply for leave
* View leave balance
* View leave history
* Cancel pending leave where appropriate
* View payroll
* View/download payslips
* View holidays
* View announcements
* View notifications
* View company employee directory
* Change password
* Logout

Employees must NEVER be able to access another employee's confidential HR, attendance, leave or payroll information.

## HR/Admin

Admin/HR can:

* Login
* Access Admin Dashboard
* Add employees
* Edit employees
* Deactivate employees
* View employee details
* Manage departments
* Manage designations
* Manage attendance
* Correct attendance
* Review attendance regularization requests
* View leave requests
* Approve/reject leave
* Manage leave balances
* Manage salary structures
* Generate payslips
* Manage holidays
* Create announcements
* Send notifications
* View reports
* View analytics
* Search/filter employees
* Manage basic system settings

---

# 4. AUTHENTICATION

Create secure authentication.

Pages:

* Sign In
* Employee account activation/registration where applicable
* Forgot Password
* Reset Password
* Change Password

Login fields:

* Email
* Password

The backend must validate credentials.

After successful login, redirect according to role.

Employee:

/employee/dashboard

Admin:

/admin/dashboard

Protect private routes.

An employee must not access:

/admin/*

even by manually entering the URL.

Use both frontend route protection AND backend authorization middleware.

---

# 5. EMPLOYEE ONBOARDING

HR/Admin should be able to create a new employee.

Collect:

### Personal Information

* Employee ID
* First Name
* Last Name
* Email
* Phone
* Date of Birth
* Gender
* Address
* Emergency Contact
* Profile Picture

### Employment Information

* Department
* Designation
* Reporting Manager
* Employment Type
* Joining Date
* Employee Status

Employment types:

* Full Time
* Part Time
* Intern
* Contract

Employee status:

* Active
* On Leave
* Inactive
* Resigned

### Documents

Allow relevant employee documents such as:

* Resume
* ID proof
* Offer letter
* Certificates

Sensitive demo information should be handled carefully.

After employee creation:

Generate/assign Employee ID → Create account → Allow employee to activate/access account.

---

# 6. EMPLOYEE DASHBOARD

Create a modern dashboard.

Header:

Welcome back, [Employee Name]

Display cards:

* Today's Attendance
* Check-In Time
* Check-Out Time
* Working Hours
* Attendance Percentage
* Remaining Leave
* Pending Leave Requests
* Current Payroll Status

Add:

### Quick Actions

* Check In
* Check Out
* Apply Leave
* View Attendance
* View Payslip

### Additional sections

* Upcoming Holidays
* Recent Notifications
* Company Announcements
* Recent Activity

---

# 7. HR/ADMIN DASHBOARD

Create a professional analytics dashboard.

Display cards:

* Total Employees
* Present Today
* Absent Today
* Employees on Leave
* Late Employees
* Pending Leave Requests
* Pending Attendance Corrections

Include charts:

### Attendance Overview

Present vs Absent vs Leave

### Employees by Department

Show department-wise employee distribution.

### Monthly Attendance Trend

Show attendance statistics over time.

Also display:

* Pending Approvals
* Recently Added Employees
* Recent Activities
* Upcoming Holidays

---

# 8. EMPLOYEE MANAGEMENT

Admin page:

/admin/employees

Display employees in a professional table.

Columns:

* Employee
* Employee ID
* Department
* Designation
* Email
* Joining Date
* Status
* Actions

Features:

* Search
* Filter by department
* Filter by status
* Sort
* Pagination

Actions:

* View
* Edit
* Deactivate

Provide:

* Add Employee

Clicking an employee opens their detailed profile.

---

# 9. EMPLOYEE PROFILE

Profile should contain tabs:

### Personal

* Name
* Email
* Phone
* DOB
* Address
* Emergency contact

### Job

* Employee ID
* Department
* Designation
* Manager
* Joining Date
* Employment Type

### Documents

Uploaded employee documents.

### Salary

Employee salary information.

Employee can modify only allowed fields such as:

* Phone
* Address
* Profile picture

Admin can modify administrative information.

---

# 10. DEPARTMENT MANAGEMENT

Create:

/admin/departments

Admin can:

* Add department
* Edit department
* View employees in department
* Deactivate/delete department when safe

Fields:

* Department Name
* Department Code
* Description
* Department Head
* Status

Examples:

Engineering
Human Resources
Finance
Marketing
Sales

---

# 11. DESIGNATION MANAGEMENT

Create designations such as:

* Software Developer
* QA Engineer
* HR Executive
* HR Manager
* Accountant
* Marketing Executive

Each designation should belong to an appropriate department where applicable.

---

# 12. ATTENDANCE SYSTEM

Employee attendance page:

/employee/attendance

Show:

Today's Date

Current Status

Check In button

Check Out button

When employee clicks Check In:

Save:

* Employee ID
* Date
* Check-In Time

Prevent duplicate check-ins.

When employee checks out:

Save:

* Check-Out Time
* Total Working Hours

Automatically calculate working duration.

Attendance statuses:

* Present
* Absent
* Half Day
* Leave
* Late

Make working-hour thresholds configurable rather than hard-coding business rules throughout the application.

Display:

* Daily view
* Weekly view
* Monthly view

Add calendar visualization where appropriate.

---

# 13. ATTENDANCE REGULARIZATION

Add an attendance correction workflow.

Example:

Employee forgot to check out.

Employee selects:

Attendance → Request Correction

Fields:

* Date
* Requested Check-In
* Requested Check-Out
* Reason

Status:

Pending

Admin can:

* View request
* Approve
* Reject
* Add comment

If approved, update attendance while retaining an audit trail of the original and corrected values.

---

# 14. LEAVE MANAGEMENT

Employee page:

/employee/leave

Display leave balance cards:

* Paid Leave
* Sick Leave
* Casual Leave
* Unpaid Leave

Provide:

* Apply Leave

Form:

* Leave Type
* From Date
* To Date
* Number of Days
* Reason
* Optional attachment

Validate:

* Dates
* Leave balance
* Overlapping requests
* Company holidays/weekends according to configured policy

After submission:

Status = Pending

Display leave history:

| Type | Dates | Days | Status |

Statuses:

* Pending
* Approved
* Rejected
* Cancelled

---

# 15. LEAVE APPROVAL

Admin page:

/admin/leave-requests

Display:

* Employee
* Department
* Leave Type
* From
* To
* Days
* Reason
* Current Leave Balance
* Status

Admin can:

Approve

or

Reject

Allow admin comment.

After decision:

Update leave request.

Update leave balance where applicable.

Update relevant attendance records.

Create notification for employee.

Keep approval history for auditing.

---

# 16. HOLIDAY CALENDAR

Admin can manage company holidays.

Fields:

* Holiday Name
* Date
* Type
* Description

Employee can view:

* Calendar
* Upcoming Holidays

Holidays should be considered when calculating leave duration if company policy excludes them.

---

# 17. PAYROLL

Create payroll management without unnecessarily implementing an entire national taxation platform.

Admin defines employee salary structure.

Fields:

* Basic Salary
* HRA
* Allowances
* Bonus
* Deductions
* Tax/Other Deductions

Calculate:

Gross Salary =
Basic + HRA + Allowances + Bonus

Net Salary =
Gross Salary - Deductions

Admin can generate monthly payroll.

Store:

* Employee
* Month
* Year
* Earnings
* Deductions
* Gross Salary
* Net Salary
* Payment Status

Payment status:

* Pending
* Processed
* Paid

---

# 18. PAYSLIP

Employee page:

/employee/payroll

Display payroll history.

Example:

August 2026

Gross Salary
Deductions
Net Salary

Provide:

View Payslip

Download PDF

Payslip should contain:

* Company Name
* Employee Name
* Employee ID
* Department
* Designation
* Month
* Basic Salary
* Allowances
* Deductions
* Gross Salary
* Net Salary

---

# 19. ANNOUNCEMENTS

Admin can create company announcements.

Fields:

* Title
* Message
* Priority
* Publish Date
* Expiry Date

Priority:

* Normal
* Important
* Urgent

Show active announcements on employee dashboard.

---

# 20. NOTIFICATION SYSTEM

Implement in-app notifications.

Create notifications when:

* Leave submitted
* Leave approved
* Leave rejected
* Attendance correction submitted
* Attendance correction approved/rejected
* Payslip generated
* New announcement published

Notification should contain:

* Title
* Message
* Timestamp
* Read/Unread status
* Related resource where applicable

Provide notification bell in navbar.

Allow:

Mark as Read

Mark All as Read

---

# 21. EMPLOYEE DIRECTORY

Create:

/employees/directory

Employees can search colleagues.

Display only non-sensitive information:

* Profile photo
* Name
* Department
* Designation
* Work email

Do NOT expose:

* Salary
* Home address
* Personal documents
* Leave history
* Private payroll information

---

# 22. REPORTS AND ANALYTICS

Admin reports page:

/admin/reports

Reports:

* Attendance Report
* Leave Report
* Employee Report
* Department Report
* Payroll Report

Filters:

* Date Range
* Employee
* Department
* Status

Allow export where practical:

* CSV
* PDF

Charts should be generated from actual database data, not hardcoded numbers.

---

# 23. SEARCH

Provide global or contextual search where useful.

Admin should be able to search:

* Employee Name
* Employee ID
* Department
* Designation

Use debouncing for frontend search where appropriate.

---

# 24. MANAGER ROLE — EXTENSION

Design database and authorization architecture so a Manager role can later be enabled.

Possible workflow:

Employee

↓

Manager

↓

HR/Admin

For example:

Employee applies for leave.

↓

Manager approves.

↓

HR gives final approval.

Do NOT make this unnecessarily complicated in the first working version.

---

# 25. RESIGNATION — ADVANCED FEATURE

Optional advanced module.

Employee can submit resignation.

Fields:

* Proposed Last Working Date
* Reason
* Comments

Workflow:

Submitted

↓

Manager/HR Review

↓

Approved/Rejected

↓

Notice Period

↓

Exit Process

↓

Employee status updated

---

# 26. ASSET MANAGEMENT — OPTIONAL

Admin can assign assets.

Examples:

* Laptop
* Monitor
* Mouse
* ID Card
* Mobile Device

Store:

* Asset ID
* Asset Name
* Category
* Employee
* Assigned Date
* Return Date
* Status

Statuses:

Available
Assigned
Returned
Damaged

---

# 27. DATABASE DESIGN

Create proper MongoDB/Mongoose models.

At minimum:

### User

* _id
* email
* passwordHash
* role
* employee
* isActive
* createdAt
* updatedAt

### Employee

* employeeId
* firstName
* lastName
* email
* phone
* DOB
* address
* emergencyContact
* profilePicture
* department
* designation
* reportingManager
* joiningDate
* employmentType
* status
* documents

### Department

* name
* code
* description
* departmentHead
* status

### Designation

* title
* department
* description
* status

### Attendance

* employee
* date
* checkIn
* checkOut
* workingHours
* status

### AttendanceRegularization

* employee
* attendance
* requestedCheckIn
* requestedCheckOut
* reason
* status
* reviewedBy
* adminComment
* originalValues

### Leave

* employee
* leaveType
* startDate
* endDate
* totalDays
* reason
* status
* adminComment
* reviewedBy

### LeaveBalance

* employee
* leaveType
* allocated
* used
* remaining
* year

### Payroll

* employee
* month
* year
* basicSalary
* hra
* allowances
* bonus
* deductions
* grossSalary
* netSalary
* status

### Holiday

* name
* date
* type
* description

### Announcement

* title
* message
* priority
* publishDate
* expiryDate
* createdBy

### Notification

* recipient
* title
* message
* type
* isRead
* relatedResource
* createdAt

Create indexes and relationships/references where appropriate.

Prevent unnecessary duplicated data.

---

# 28. BACKEND API

Organize APIs properly.

Example:

/api/auth

/api/employees

/api/departments

/api/designations

/api/attendance

/api/attendance-regularization

/api/leaves

/api/leave-balances

/api/payroll

/api/holidays

/api/announcements

/api/notifications

/api/reports

Use REST conventions.

Examples:

GET /api/employees

GET /api/employees/:id

POST /api/employees

PUT /api/employees/:id

DELETE or PATCH /api/employees/:id/status

Use authorization middleware.

Example:

authenticateUser

authorizeRoles("admin", "hr")

Never rely solely on frontend authorization.

---

# 29. VALIDATION

Implement frontend AND backend validation.

Validate:

* Required fields
* Email format
* Password strength
* Duplicate email
* Duplicate Employee ID
* Valid dates
* Check-in state
* Check-out state
* Leave balance
* Overlapping leave
* Salary numbers
* File types
* File sizes
* User permissions

Never trust frontend input.

---

# 30. ERROR HANDLING

Show user-friendly messages.

Examples:

"Invalid email or password."

"You have already checked in today."

"Please check in before checking out."

"Insufficient leave balance."

"A leave request already exists for these dates."

"You are not authorized to perform this action."

"Unable to load data. Please try again."

Do not expose database errors or stack traces to users.

---

# 31. AUDIT LOG

Add a basic audit/activity log for important administrative operations.

Record:

* User
* Action
* Entity
* Entity ID
* Timestamp
* Relevant change summary

Examples:

HR approved Rahul's leave.

Admin updated Priya's salary structure.

HR corrected Amit's attendance.

This is especially important for attendance, leave and payroll modifications.

---

# 32. UI/UX DESIGN

Design should be:

* Modern
* Professional
* Minimal
* Clean
* Responsive
* Easy to navigate

Avoid making it look like a basic college Bootstrap CRUD project.

Use:

* Sidebar
* Top navbar
* Cards
* Tables
* Charts
* Modals
* Dropdowns
* Toast notifications
* Loading skeletons
* Empty states
* Confirmation dialogs

Desktop sidebar:

Dashboard

Employees

Attendance

Leave

Payroll

Departments

Holidays

Announcements

Reports

Settings

Employee sidebar should display only modules available to employees.

---

# 33. RESPONSIVE DESIGN

Support:

* Desktop
* Laptop
* Tablet
* Mobile

On mobile:

Sidebar → Hamburger menu

Tables → Responsive/scrollable

Dashboard cards → Stack appropriately

---

# 34. SECURITY

Implement:

* bcrypt password hashing
* JWT authentication
* Protected APIs
* Role authorization
* Secure environment variables
* Input validation
* Safe file uploads
* Appropriate CORS configuration
* Rate limiting for sensitive authentication endpoints where practical

Do not store plain-text passwords.

Do not expose sensitive employee information through APIs to unauthorized users.

---

# 35. SEED / DEMO DATA

Create database seed data so the project can be demonstrated immediately.

Create:

1 Admin account

1 HR account

At least 8–10 employees distributed across:

* Engineering
* HR
* Finance
* Marketing

Add sample:

* Attendance
* Leave requests
* Leave balances
* Payroll
* Holidays
* Announcements
* Notifications

Clearly document demo credentials in the README for local development only.

---

# 36. EXPECTED PROJECT STRUCTURE

Use clean separation.

Frontend:

src/
├── components/
├── pages/
├── layouts/
├── services/
├── hooks/
├── context/
├── utils/
└── assets/

Backend:

server/
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
├── utils/
├── config/
└── seed/

Keep business logic organized rather than placing everything inside route files.

---

# 37. DEVELOPMENT ORDER

Build the application incrementally.

### Phase 1

Project setup

Database connection

Authentication

JWT

Role authorization

Employee/Admin layouts

### Phase 2

Employee CRUD

Profile

Departments

Designations

### Phase 3

Attendance

Check-In

Check-Out

Attendance history

Attendance regularization

### Phase 4

Leave management

Leave balance

Admin approvals

### Phase 5

Payroll

Payslip

### Phase 6

Holidays

Announcements

Notifications

### Phase 7

Reports

Analytics

Search/filtering

### Phase 8

Testing

Validation

Security

Responsive design

Bug fixing

Optional advanced modules

Do not move to later modules while fundamental authentication/database functionality is broken.

---

# 38. IMPORTANT DEVELOPMENT RULES

1. Do not generate only frontend mockups.
2. Connect every important module to the database.
3. Avoid hardcoded dashboard statistics.
4. Use reusable React components.
5. Use proper REST APIs.
6. Keep frontend and backend separated logically.
7. Add loading states.
8. Add empty states.
9. Add validation.
10. Add error handling.
11. Protect admin routes.
12. Protect sensitive APIs.
13. Use meaningful naming conventions.
14. Add comments only where useful.
15. Avoid unnecessary complexity.
16. Do not remove already-working features when implementing another module.
17. Maintain consistent UI throughout the application.
18. Test Employee and Admin flows separately.

---

# 39. MAIN END-TO-END WORKFLOW

The final application should support:

HR creates Employee

↓

Employee account becomes available

↓

Employee logs in

↓

Employee completes/views profile

↓

Employee checks in

↓

Attendance stored

↓

Employee checks out

↓

Working hours calculated

↓

Employee applies for leave

↓

Leave balance validated

↓

HR receives request

↓

HR approves/rejects

↓

Employee receives notification

↓

Attendance/leave records update

↓

HR manages salary structure

↓

Monthly payroll generated

↓

Employee views/downloads payslip

↓

HR views reports and analytics

↓

Employee continues using Dayflow for everyday HR activities.

---

#40 yeah, I also need something like anonymous feedback on any problem you're facing in the company and related to debt, so I need this section also in my project. I also need to see HR work, which is hiring, right? Anyone can upload the resume on the company's website. We don't have a company website, so we will directly upload from the admin panel. The resume will be shortlisted, with the top applicants and rejected resumes ranked, something like that. I also want that.

I also want a feedback system. The feedback system means how the office is actually doing, and all things that are in the project must be automated. There must be no data duplication, and the backend must be designed in such a way. You may use.SQL so that I can directly run it into my super base. 


Also add option to download xlr sheet 


IN admin controls add option to take backup of db and restore db 

# 41. FINAL EXPECTATION

The finished Dayflow application should feel like a small but realistic company HRMS rather than a collection of unrelated CRUD pages.

The core workflow should be:

Employee
↕
Dayflow HRMS
↕
HR/Admin

The system must centralize:

People + Attendance + Leave + Payroll + Communication + Reporting.

Prioritize a fully working core system over adding many incomplete features.

After completing each major module, verify:

* UI works
* API works
* Database updates correctly
* Permissions work
* Validation works
* Error handling works
* Employee/Admin workflows work

Finally provide:

* Complete source code
* Database schema/models
* Seed script
* `.env.example`
* Setup instructions
* README
* API overview
* Demo credentials
* List of implemented features
* List of optional/future features

The project must run locally using clear commands such as:

Frontend:
npm install
npm run dev

Backend:
npm install
npm run dev

Ensure a new developer can clone the project, configure `.env`, seed the database, and run the complete application without manually repairing missing code.
Also see that git ignore is properly configured 


Read ai memory md files 

Read ai memory and don’t don’t scan unrelated files 
Update AI memory with changes 


If you already have README and MD files, then read that and continue making it. If you don't have README files in the repository, then make those files. 
Ai memory contains all stricture and file info and full project info