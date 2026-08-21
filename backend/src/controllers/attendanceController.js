const supabase = require('../config/supabase');

// ======== ATTENDANCE CHECK-IN/OUT ========

/**
 * POST /api/attendance/checkin
 */
const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const today = new Date().toISOString().split('T')[0];

    // Check for existing check-in today
    const { data: existing } = await supabase
      .from('attendance')
      .select('id, check_in, check_out')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single();

    if (existing) {
      if (existing.check_in) return res.status(400).json({ success: false, message: 'You have already checked in today.' });
    }

    const now = new Date().toISOString();
    const checkInTime = new Date().toTimeString().slice(0, 8);
    const lateThreshold = process.env.LATE_CHECK_IN_THRESHOLD || '09:30';
    const isLate = checkInTime > lateThreshold;

    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        employee_id: employeeId,
        date: today,
        check_in: now,
        status: isLate ? 'late' : 'present',
      }, { onConflict: 'employee_id,date' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: `Checked in successfully at ${checkInTime}${isLate ? ' (Late)' : ''}.`, data });
  } catch (err) {
    console.error('checkIn error:', err);
    res.status(500).json({ success: false, message: 'Unable to process check-in. Please try again.' });
  }
};

/**
 * POST /api/attendance/checkout
 */
const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const today = new Date().toISOString().split('T')[0];

    const { data: attendance } = await supabase
      .from('attendance')
      .select('id, check_in, check_out')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single();

    if (!attendance || !attendance.check_in) {
      return res.status(400).json({ success: false, message: 'Please check in before checking out.' });
    }
    if (attendance.check_out) {
      return res.status(400).json({ success: false, message: 'You have already checked out today.' });
    }

    const now = new Date();
    const checkIn = new Date(attendance.check_in);
    const workingHours = parseFloat(((now - checkIn) / (1000 * 60 * 60)).toFixed(2));
    const fullDayThreshold = parseFloat(process.env.WORKING_HOURS_FULL_DAY || 8);
    const halfDayThreshold = parseFloat(process.env.WORKING_HOURS_HALF_DAY || 4);

    let status = attendance.status;
    if (workingHours >= fullDayThreshold) {
      status = status === 'late' ? 'late' : 'present';
    } else if (workingHours >= halfDayThreshold) {
      status = 'half_day';
    }

    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out: now.toISOString(), working_hours: workingHours, status })
      .eq('id', attendance.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: `Checked out. Working hours today: ${workingHours}h`, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to process check-out. Please try again.' });
  }
};

/**
 * GET /api/attendance — Employee: own | Admin: all or by employee
 */
const getAttendance = async (req, res) => {
  try {
    const { role, employeeId } = req.user;
    const { empId, month, year, startDate, endDate } = req.query;

    let query = supabase
      .from('attendance')
      .select('*, employees(id, first_name, last_name, employee_id, departments(name))')
      .order('date', { ascending: false });

    if (role === 'employee') {
      query = query.eq('employee_id', employeeId);
    } else if (empId) {
      query = query.eq('employee_id', empId);
    }

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    if (month && year) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = new Date(year, month, 0).toISOString().split('T')[0];
      query = query.gte('date', start).lte('date', end);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load attendance records.' });
  }
};

/**
 * GET /api/attendance/today-status
 */
const getTodayStatus = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single();

    res.json({ success: true, data: data || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to fetch attendance status.' });
  }
};

// ======== ATTENDANCE REGULARIZATION ========

const requestCorrection = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const { date, requestedCheckIn, requestedCheckOut, reason } = req.body;

    if (!date || !reason) return res.status(400).json({ success: false, message: 'Date and reason are required.' });

    // Find existing attendance record
    const { data: attendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('date', date)
      .single();

    const { data, error } = await supabase
      .from('attendance_regularization')
      .insert({
        employee_id: employeeId,
        attendance_id: attendance?.id || null,
        date,
        requested_check_in: requestedCheckIn || null,
        requested_check_out: requestedCheckOut || null,
        reason,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Notify HR
    await supabase.from('notifications').insert({
      recipient_role: 'hr',
      title: 'Attendance Correction Request',
      message: `An employee has requested attendance correction for ${date}.`,
      type: 'attendance_correction',
      related_id: data.id,
    });

    res.status(201).json({ success: true, message: 'Correction request submitted successfully.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to submit correction request.' });
  }
};

const getRegularizationRequests = async (req, res) => {
  try {
    const { role, employeeId } = req.user;
    let query = supabase
      .from('attendance_regularization')
      .select('*, employees(id, first_name, last_name, employee_id, departments(name))')
      .order('created_at', { ascending: false });

    if (role === 'employee') query = query.eq('employee_id', employeeId);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load regularization requests.' });
  }
};

const reviewRegularization = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });

    const { data: request } = await supabase
      .from('attendance_regularization')
      .select('*, attendance(id, check_in, check_out)')
      .eq('id', id)
      .single();

    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'This request has already been reviewed.' });

    const { data, error } = await supabase
      .from('attendance_regularization')
      .update({ status, admin_comment: adminComment, reviewed_by: req.user.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If approved, update the attendance record
    if (status === 'approved' && request.attendance_id) {
      const updates = {};
      if (request.requested_check_in) updates.check_in = request.requested_check_in;
      if (request.requested_check_out) updates.check_out = request.requested_check_out;
      // Recalculate hours
      if (updates.check_in && updates.check_out) {
        const diff = (new Date(updates.check_out) - new Date(updates.check_in)) / (1000 * 60 * 60);
        updates.working_hours = parseFloat(diff.toFixed(2));
        updates.original_check_in = request.attendance?.check_in;
        updates.original_check_out = request.attendance?.check_out;
      }
      await supabase.from('attendance').update(updates).eq('id', request.attendance_id);
    }

    // Notify employee
    await supabase.from('notifications').insert({
      recipient_id: request.employee_id,
      title: `Attendance Correction ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your attendance correction request for ${request.date} has been ${status}.${adminComment ? ` Comment: ${adminComment}` : ''}`,
      type: 'attendance_correction',
      related_id: id,
    });

    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: status.toUpperCase(),
      entity: 'attendance_regularization',
      entity_id: id,
      summary: `${status} attendance correction request for date ${request.date}`,
    });

    res.json({ success: true, message: `Correction request ${status}.`, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to review request.' });
  }
};

module.exports = { checkIn, checkOut, getAttendance, getTodayStatus, requestCorrection, getRegularizationRequests, reviewRegularization };
