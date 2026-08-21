const supabase = require('../config/supabase');

// ======== PAYROLL ========

const createSalaryStructure = async (req, res) => {
  try {
    const { employeeId, basicSalary, hra, allowances, bonus, deductions, taxDeductions, effectiveFrom } = req.body;
    if (!employeeId || !basicSalary) return res.status(400).json({ success: false, message: 'Employee and basic salary are required.' });

    const grossSalary = (basicSalary || 0) + (hra || 0) + (allowances || 0) + (bonus || 0);
    const netSalary = grossSalary - (deductions || 0) - (taxDeductions || 0);

    const { data, error } = await supabase.from('salary_structures').upsert({
      employee_id: employeeId,
      basic_salary: basicSalary,
      hra: hra || 0,
      allowances: allowances || 0,
      bonus: bonus || 0,
      deductions: deductions || 0,
      tax_deductions: taxDeductions || 0,
      gross_salary: grossSalary,
      net_salary: netSalary,
      effective_from: effectiveFrom || new Date().toISOString().split('T')[0],
    }, { onConflict: 'employee_id' }).select().single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: req.user.id, action: 'UPDATE', entity: 'salary_structure', entity_id: data.id,
      summary: `Updated salary structure for employee ${employeeId}. Net: ₹${netSalary}`,
    });

    res.json({ success: true, message: 'Salary structure saved.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to save salary structure.' });
  }
};

const getSalaryStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { role, employeeId: userId } = req.user;

    if (role === 'employee' && userId !== employeeId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { data, error } = await supabase.from('salary_structures').select('*').eq('employee_id', employeeId).single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json({ success: true, data: data || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to fetch salary structure.' });
  }
};

const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    if (!employeeId || !month || !year) return res.status(400).json({ success: false, message: 'Employee, month, and year are required.' });

    // Check if payroll already exists
    const { data: existing } = await supabase.from('payroll').select('id').eq('employee_id', employeeId).eq('month', month).eq('year', year).single();
    if (existing) return res.status(409).json({ success: false, message: 'Payroll for this month already exists.' });

    const { data: salary } = await supabase.from('salary_structures').select('*').eq('employee_id', employeeId).single();
    if (!salary) return res.status(400).json({ success: false, message: 'No salary structure found for this employee.' });

    const { data, error } = await supabase.from('payroll').insert({
      employee_id: employeeId,
      month,
      year,
      basic_salary: salary.basic_salary,
      hra: salary.hra,
      allowances: salary.allowances,
      bonus: salary.bonus,
      deductions: salary.deductions,
      tax_deductions: salary.tax_deductions,
      gross_salary: salary.gross_salary,
      net_salary: salary.net_salary,
      status: 'processed',
    }).select().single();

    if (error) throw error;

    // Notify employee
    await supabase.from('notifications').insert({
      recipient_id: employeeId,
      title: 'Payslip Generated',
      message: `Your payslip for ${month}/${year} has been generated. Net salary: ₹${salary.net_salary}`,
      type: 'payslip',
      related_id: data.id,
    });

    await supabase.from('audit_logs').insert({
      user_id: req.user.id, action: 'GENERATE', entity: 'payroll', entity_id: data.id,
      summary: `Generated payroll for employee ${employeeId} — ${month}/${year}, Net: ₹${salary.net_salary}`,
    });

    res.status(201).json({ success: true, message: 'Payroll generated successfully.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to generate payroll.' });
  }
};

const getPayroll = async (req, res) => {
  try {
    const { role, employeeId } = req.user;
    const { empId, month, year } = req.query;

    let query = supabase.from('payroll')
      .select('*, employees(id, first_name, last_name, employee_id, departments(name), designations(title))')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (role === 'employee') {
      query = query.eq('employee_id', employeeId);
    } else if (empId) {
      query = query.eq('employee_id', empId);
    }

    if (month) query = query.eq('month', month);
    if (year) query = query.eq('year', year);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load payroll records.' });
  }
};

const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'processed', 'paid'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });

    const { data, error } = await supabase.from('payroll').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, message: 'Payroll status updated.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update payroll status.' });
  }
};

module.exports = { createSalaryStructure, getSalaryStructure, generatePayroll, getPayroll, updatePayrollStatus };
