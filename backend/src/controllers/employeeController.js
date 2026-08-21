const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/employees
 * Admin: all employees | Employee: own data only
 */
const getEmployees = async (req, res) => {
  try {
    const { role } = req.user;
    const { search, department, status, page = 1, limit = 10 } = req.query;

    if (role === 'employee') {
      // Employee can only see directory (non-sensitive)
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, profile_picture, department_id, designation_id, departments(name), designations(title), email')
        .eq('status', 'active');
      if (error) throw error;
      return res.json({ success: true, data });
    }

    // Admin/HR: full list with filters
    let query = supabase
      .from('employees')
      .select(`
        id, employee_id, first_name, last_name, email, phone,
        joining_date, status, employment_type, profile_picture,
        department_id, designation_id,
        departments(id, name),
        designations(id, title)
      `, { count: 'exact' });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`);
    }
    if (department) query = query.eq('department_id', department);
    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    query = query.range(from, from + Number(limit) - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error('getEmployees error:', err);
    res.status(500).json({ success: false, message: 'Unable to load employees. Please try again.' });
  }
};

/**
 * GET /api/employees/:id
 */
const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, employeeId } = req.user;

    // Employee can only view own profile
    if (role === 'employee' && employeeId !== id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this profile.' });
    }

    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        departments(id, name, code),
        designations(id, title),
        reporting_manager:employees!reporting_manager_id(id, first_name, last_name, employee_id)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Employee not found.' });

    // Hide sensitive fields from non-admin
    if (role === 'employee') {
      delete data.salary_structure_id;
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load employee profile.' });
  }
};

/**
 * POST /api/employees — Admin only
 */
const createEmployee = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, dateOfBirth, gender,
      address, emergencyContact, departmentId, designationId,
      reportingManagerId, employmentType, joiningDate, employeeId: empIdInput,
    } = req.body;

    if (!firstName || !lastName || !email || !departmentId || !designationId) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, department, and designation are required.' });
    }

    // Check duplicate email
    const { data: existing } = await supabase.from('employees').select('id').eq('email', email.toLowerCase()).single();
    if (existing) return res.status(409).json({ success: false, message: 'An employee with this email already exists.' });

    // Generate employee ID if not provided
    const employeeId = empIdInput || `EMP${Date.now().toString().slice(-6)}`;

    // Check duplicate employee ID
    const { data: existingEmpId } = await supabase.from('employees').select('id').eq('employee_id', employeeId).single();
    if (existingEmpId) return res.status(409).json({ success: false, message: 'Employee ID already exists.' });

    // Create employee record
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .insert({
        employee_id: employeeId,
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        phone,
        date_of_birth: dateOfBirth,
        gender,
        address,
        emergency_contact: emergencyContact,
        department_id: departmentId,
        designation_id: designationId,
        reporting_manager_id: reportingManagerId || null,
        employment_type: employmentType || 'full_time',
        joining_date: joiningDate,
        status: 'active',
      })
      .select()
      .single();

    if (empError) throw empError;

    // Create user account with temp password
    const tempPassword = `Dayflow@${employeeId}`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const { error: userError } = await supabase.from('users').insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'employee',
      employee_id: employee.id,
      is_active: true,
    });

    if (userError) {
      // Rollback employee creation
      await supabase.from('employees').delete().eq('id', employee.id);
      throw userError;
    }

    // Initialize leave balances
    const leaveTypes = [
      { type: 'paid', allocated: 12 },
      { type: 'sick', allocated: 6 },
      { type: 'casual', allocated: 6 },
      { type: 'unpaid', allocated: 0 },
    ];
    const year = new Date().getFullYear();
    await supabase.from('leave_balances').insert(
      leaveTypes.map((lt) => ({
        employee_id: employee.id,
        leave_type: lt.type,
        allocated: lt.allocated,
        used: 0,
        remaining: lt.allocated,
        year,
      }))
    );

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'CREATE',
      entity: 'employee',
      entity_id: employee.id,
      summary: `Created employee ${firstName} ${lastName} (${employeeId})`,
    });

    res.status(201).json({
      success: true,
      message: `Employee created successfully. Temporary password: ${tempPassword}`,
      data: employee,
    });
  } catch (err) {
    console.error('createEmployee error:', err);
    res.status(500).json({ success: false, message: 'Unable to create employee. Please try again.' });
  }
};

/**
 * PUT /api/employees/:id — Admin: all fields | Employee: limited fields
 */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, employeeId } = req.user;

    if (role === 'employee' && employeeId !== id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this profile.' });
    }

    let updates = {};

    if (role === 'employee') {
      // Employees can only update limited fields
      const allowed = ['phone', 'address', 'emergency_contact', 'profile_picture'];
      for (const field of allowed) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      }
    } else {
      // Admin/HR can update most fields
      const {
        firstName, lastName, phone, dateOfBirth, gender, address,
        emergencyContact, departmentId, designationId, reportingManagerId,
        employmentType, joiningDate, status,
      } = req.body;

      if (firstName) updates.first_name = firstName;
      if (lastName) updates.last_name = lastName;
      if (phone) updates.phone = phone;
      if (dateOfBirth) updates.date_of_birth = dateOfBirth;
      if (gender) updates.gender = gender;
      if (address) updates.address = address;
      if (emergencyContact) updates.emergency_contact = emergencyContact;
      if (departmentId) updates.department_id = departmentId;
      if (designationId) updates.designation_id = designationId;
      if (reportingManagerId !== undefined) updates.reporting_manager_id = reportingManagerId;
      if (employmentType) updates.employment_type = employmentType;
      if (joiningDate) updates.joining_date = joiningDate;
      if (status) updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'UPDATE',
      entity: 'employee',
      entity_id: id,
      summary: `Updated employee profile: ${Object.keys(updates).join(', ')}`,
    });

    res.json({ success: true, message: 'Employee updated successfully.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update employee. Please try again.' });
  }
};

/**
 * PATCH /api/employees/:id/status — Admin only
 */
const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['active', 'inactive', 'on_leave', 'resigned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const { data, error } = await supabase
      .from('employees')
      .update({ status })
      .eq('id', id)
      .select('id, first_name, last_name, employee_id, status')
      .single();

    if (error) throw error;

    // Also deactivate user account if inactive/resigned
    if (status === 'inactive' || status === 'resigned') {
      await supabase.from('users').update({ is_active: false }).eq('employee_id', id);
    } else if (status === 'active') {
      await supabase.from('users').update({ is_active: true }).eq('employee_id', id);
    }

    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'STATUS_CHANGE',
      entity: 'employee',
      entity_id: id,
      summary: `Employee ${data.first_name} ${data.last_name} status changed to ${status}`,
    });

    res.json({ success: true, message: 'Employee status updated.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update status. Please try again.' });
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, updateEmployeeStatus };
