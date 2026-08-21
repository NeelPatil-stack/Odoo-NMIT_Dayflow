const supabase = require('../config/supabase');

/**
 * POST /api/leaves — Employee applies for leave
 */
const applyLeave = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Leave type, dates, and reason are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return res.status(400).json({ success: false, message: 'End date must be after start date.' });

    // Calculate working days (exclude weekends)
    let totalDays = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) totalDays++;
      cur.setDate(cur.getDate() + 1);
    }

    if (totalDays === 0) return res.status(400).json({ success: false, message: 'Leave period contains no working days.' });

    // Check leave balance (except unpaid)
    if (leaveType !== 'unpaid') {
      const { data: balance } = await supabase
        .from('leave_balances')
        .select('remaining')
        .eq('employee_id', employeeId)
        .eq('leave_type', leaveType)
        .eq('year', new Date().getFullYear())
        .single();

      if (!balance || balance.remaining < totalDays) {
        return res.status(400).json({ success: false, message: `Insufficient ${leaveType} leave balance. You have ${balance?.remaining || 0} days remaining.` });
      }
    }

    // Check for overlapping requests
    const { data: overlap } = await supabase
      .from('leaves')
      .select('id')
      .eq('employee_id', employeeId)
      .in('status', ['pending', 'approved'])
      .lte('start_date', endDate)
      .gte('end_date', startDate);

    if (overlap && overlap.length > 0) {
      return res.status(400).json({ success: false, message: 'A leave request already exists for these dates.' });
    }

    const { data, error } = await supabase
      .from('leaves')
      .insert({
        employee_id: employeeId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        reason,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Notify HR
    await supabase.from('notifications').insert({
      recipient_role: 'hr',
      title: 'New Leave Request',
      message: `A new ${leaveType} leave request has been submitted for ${startDate} to ${endDate} (${totalDays} days).`,
      type: 'leave_request',
      related_id: data.id,
    });

    res.status(201).json({ success: true, message: 'Leave request submitted successfully.', data });
  } catch (err) {
    console.error('applyLeave error:', err);
    res.status(500).json({ success: false, message: 'Unable to submit leave request. Please try again.' });
  }
};

/**
 * GET /api/leaves
 */
const getLeaves = async (req, res) => {
  try {
    const { role, employeeId } = req.user;
    const { status, empId, startDate, endDate } = req.query;

    let query = supabase
      .from('leaves')
      .select('*, employees(id, first_name, last_name, employee_id, departments(name))')
      .order('created_at', { ascending: false });

    if (role === 'employee') {
      query = query.eq('employee_id', employeeId);
    } else if (empId) {
      query = query.eq('employee_id', empId);
    }

    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('start_date', startDate);
    if (endDate) query = query.lte('end_date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load leave requests.' });
  }
};

/**
 * PATCH /api/leaves/:id/review — Admin approves/rejects
 */
const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const { data: leave } = await supabase
      .from('leaves')
      .select('*, employees(first_name, last_name)')
      .eq('id', id)
      .single();

    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found.' });
    if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'This leave request has already been reviewed.' });

    const { data, error } = await supabase
      .from('leaves')
      .update({ status, admin_comment: adminComment, reviewed_by: req.user.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update leave balance if approved
    if (status === 'approved' && leave.leave_type !== 'unpaid') {
      const year = new Date(leave.start_date).getFullYear();
      const { data: balance } = await supabase
        .from('leave_balances')
        .select('id, used, remaining')
        .eq('employee_id', leave.employee_id)
        .eq('leave_type', leave.leave_type)
        .eq('year', year)
        .single();

      if (balance) {
        await supabase.from('leave_balances').update({
          used: balance.used + leave.total_days,
          remaining: balance.remaining - leave.total_days,
        }).eq('id', balance.id);
      }
    }

    // Notify employee
    await supabase.from('notifications').insert({
      recipient_id: leave.employee_id,
      title: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your ${leave.leave_type} leave from ${leave.start_date} to ${leave.end_date} has been ${status}.${adminComment ? ` Reason: ${adminComment}` : ''}`,
      type: 'leave_update',
      related_id: id,
    });

    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: status.toUpperCase(),
      entity: 'leave',
      entity_id: id,
      summary: `${status} leave request for ${leave.employees?.first_name} ${leave.employees?.last_name} (${leave.leave_type}, ${leave.total_days} days)`,
    });

    res.json({ success: true, message: `Leave request ${status}.`, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to process leave review.' });
  }
};

/**
 * PATCH /api/leaves/:id/cancel — Employee cancels pending leave
 */
const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.user;

    const { data: leave } = await supabase.from('leaves').select('*').eq('id', id).eq('employee_id', employeeId).single();
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found.' });
    if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending leave requests can be cancelled.' });

    await supabase.from('leaves').update({ status: 'cancelled' }).eq('id', id);
    res.json({ success: true, message: 'Leave request cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to cancel leave request.' });
  }
};

/**
 * GET /api/leave-balances
 */
const getLeaveBalances = async (req, res) => {
  try {
    const { employeeId, role } = req.user;
    const { empId, year = new Date().getFullYear() } = req.query;

    const targetId = (role !== 'employee' && empId) ? empId : employeeId;

    const { data, error } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', targetId)
      .eq('year', year);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load leave balances.' });
  }
};

/**
 * PUT /api/leave-balances/:employeeId — Admin adjusts balance
 */
const updateLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { leaveType, allocated, year = new Date().getFullYear() } = req.body;

    const { data: balance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('leave_type', leaveType)
      .eq('year', year)
      .single();

    const remaining = allocated - (balance?.used || 0);
    const { data, error } = await supabase.from('leave_balances').upsert({
      employee_id: employeeId, leave_type: leaveType, allocated, used: balance?.used || 0, remaining, year,
    }, { onConflict: 'employee_id,leave_type,year' }).select().single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: req.user.id, action: 'UPDATE', entity: 'leave_balance', entity_id: data.id,
      summary: `Updated ${leaveType} leave balance for employee ${employeeId} to ${allocated} days`,
    });

    res.json({ success: true, message: 'Leave balance updated.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update leave balance.' });
  }
};

module.exports = { applyLeave, getLeaves, reviewLeave, cancelLeave, getLeaveBalances, updateLeaveBalance };
