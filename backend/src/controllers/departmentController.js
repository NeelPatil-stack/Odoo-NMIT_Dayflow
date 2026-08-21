const supabase = require('../config/supabase');

// ======== DEPARTMENTS ========

const getDepartments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*, employees(count)')
      .order('name');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load departments.' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, code, description, departmentHeadId } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Department name and code are required.' });

    const { data: existing } = await supabase.from('departments').select('id').eq('code', code.toUpperCase()).single();
    if (existing) return res.status(409).json({ success: false, message: 'Department code already exists.' });

    const { data, error } = await supabase
      .from('departments')
      .insert({ name, code: code.toUpperCase(), description, department_head_id: departmentHeadId || null, status: 'active' })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({ user_id: req.user.id, action: 'CREATE', entity: 'department', entity_id: data.id, summary: `Created department ${name}` });
    res.status(201).json({ success: true, message: 'Department created.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to create department.' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, departmentHeadId, status } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (departmentHeadId !== undefined) updates.department_head_id = departmentHeadId;
    if (status) updates.status = status;

    const { data, error } = await supabase.from('departments').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({ user_id: req.user.id, action: 'UPDATE', entity: 'department', entity_id: id, summary: `Updated department ${data.name}` });
    res.json({ success: true, message: 'Department updated.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update department.' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    // Check for employees
    const { count } = await supabase.from('employees').select('id', { count: 'exact', head: true }).eq('department_id', id).eq('status', 'active');
    if (count > 0) return res.status(400).json({ success: false, message: `Cannot delete department — ${count} active employee(s) belong to it.` });

    await supabase.from('departments').update({ status: 'inactive' }).eq('id', id);
    res.json({ success: true, message: 'Department deactivated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to delete department.' });
  }
};

// ======== DESIGNATIONS ========

const getDesignations = async (req, res) => {
  try {
    const { departmentId } = req.query;
    let query = supabase.from('designations').select('*, departments(id, name)').order('title');
    if (departmentId) query = query.eq('department_id', departmentId);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load designations.' });
  }
};

const createDesignation = async (req, res) => {
  try {
    const { title, departmentId, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Designation title is required.' });
    const { data, error } = await supabase.from('designations').insert({ title, department_id: departmentId || null, description, status: 'active' }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, message: 'Designation created.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to create designation.' });
  }
};

const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, departmentId, description, status } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (departmentId !== undefined) updates.department_id = departmentId;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;
    const { data, error } = await supabase.from('designations').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, message: 'Designation updated.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update designation.' });
  }
};

module.exports = {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getDesignations, createDesignation, updateDesignation,
};
