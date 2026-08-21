const supabase = require('../config/supabase');

/**
 * GET /api/reports/attendance
 */
const attendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, department, employeeId: empId } = req.query;
    let query = supabase.from('attendance')
      .select('*, employees(id, first_name, last_name, employee_id, departments(name))')
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    if (empId) query = query.eq('employee_id', empId);

    const { data, error } = await query;
    if (error) throw error;

    // Filter by department if provided
    let filtered = data;
    if (department) {
      filtered = data.filter(r => r.employees?.departments?.name === department);
    }

    res.json({ success: true, data: filtered, count: filtered.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to generate attendance report.' });
  }
};

/**
 * GET /api/reports/leave
 */
const leaveReport = async (req, res) => {
  try {
    const { startDate, endDate, department, status } = req.query;
    let query = supabase.from('leaves')
      .select('*, employees(id, first_name, last_name, employee_id, departments(name))')
      .order('created_at', { ascending: false });

    if (startDate) query = query.gte('start_date', startDate);
    if (endDate) query = query.lte('end_date', endDate);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    let filtered = data;
    if (department) filtered = data.filter(r => r.employees?.departments?.name === department);

    res.json({ success: true, data: filtered, count: filtered.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to generate leave report.' });
  }
};

/**
 * GET /api/reports/employees
 */
const employeeReport = async (req, res) => {
  try {
    const { department, status, employmentType } = req.query;
    let query = supabase.from('employees').select('*, departments(name), designations(title)').order('first_name');
    if (department) query = query.eq('department_id', department);
    if (status) query = query.eq('status', status);
    if (employmentType) query = query.eq('employment_type', employmentType);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to generate employee report.' });
  }
};

/**
 * GET /api/reports/payroll
 */
const payrollReport = async (req, res) => {
  try {
    const { month, year, department, status } = req.query;
    let query = supabase.from('payroll')
      .select('*, employees(id, first_name, last_name, employee_id, departments(name))')
      .order('year', { ascending: false }).order('month', { ascending: false });
    if (month) query = query.eq('month', month);
    if (year) query = query.eq('year', year);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    let filtered = data;
    if (department) filtered = data.filter(r => r.employees?.departments?.name === department);
    const totals = filtered.reduce((acc, r) => ({
      grossSalary: acc.grossSalary + (r.gross_salary || 0),
      netSalary: acc.netSalary + (r.net_salary || 0),
    }), { grossSalary: 0, netSalary: 0 });

    res.json({ success: true, data: filtered, count: filtered.length, totals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to generate payroll report.' });
  }
};

/**
 * GET /api/reports/dashboard — Admin analytics
 */
const dashboardAnalytics = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      { count: totalEmployees },
      { count: presentToday },
      { count: absentToday },
      { count: onLeaveToday },
      { count: pendingLeaves },
      { count: pendingCorrections },
      { data: recentEmployees },
      { data: deptDist },
    ] = await Promise.all([
      supabase.from('employees').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).in('status', ['present', 'late']),
      supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'absent'),
      supabase.from('leaves').select('id', { count: 'exact', head: true }).eq('status', 'approved').lte('start_date', today).gte('end_date', today),
      supabase.from('leaves').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('attendance_regularization').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('employees').select('id, first_name, last_name, employee_id, joining_date, departments(name)').eq('status', 'active').order('joining_date', { ascending: false }).limit(5),
      supabase.from('employees').select('department_id, departments(name)', { count: 'exact' }).eq('status', 'active'),
    ]);

    // Group by department
    const deptMap = {};
    (deptDist || []).forEach(e => {
      const name = e.departments?.name || 'Unassigned';
      deptMap[name] = (deptMap[name] || 0) + 1;
    });
    const departmentDistribution = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        onLeaveToday,
        pendingLeaves,
        pendingCorrections,
        recentEmployees,
        departmentDistribution,
      },
    });
  } catch (err) {
    console.error('dashboardAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Unable to load dashboard data.' });
  }
};

/**
 * GET /api/reports/monthly-attendance — Chart data
 */
const monthlyAttendanceTrend = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const { data, error } = await supabase.from('attendance').select('date, status').gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
    if (error) throw error;

    const monthlyData = {};
    (data || []).forEach(record => {
      const month = record.date.slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { present: 0, absent: 0, leave: 0, late: 0 };
      const status = record.status;
      if (status === 'present') monthlyData[month].present++;
      else if (status === 'absent') monthlyData[month].absent++;
      else if (status === 'leave') monthlyData[month].leave++;
      else if (status === 'late') monthlyData[month].late++;
    });

    const result = Object.entries(monthlyData).map(([month, stats]) => ({ month, ...stats })).sort((a, b) => a.month.localeCompare(b.month));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load attendance trend.' });
  }
};

module.exports = { attendanceReport, leaveReport, employeeReport, payrollReport, dashboardAnalytics, monthlyAttendanceTrend };
