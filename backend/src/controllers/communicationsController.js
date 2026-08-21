const supabase = require('../config/supabase');

// ======== HOLIDAYS ========
const getHolidays = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const { data, error } = await supabase.from('holidays').select('*').gte('date', `${year}-01-01`).lte('date', `${year}-12-31`).order('date');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load holidays.' });
  }
};

const createHoliday = async (req, res) => {
  try {
    const { name, date, type, description } = req.body;
    if (!name || !date) return res.status(400).json({ success: false, message: 'Holiday name and date are required.' });
    const { data, error } = await supabase.from('holidays').insert({ name, date, type: type || 'national', description }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, message: 'Holiday added.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to add holiday.' });
  }
};

const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, type, description } = req.body;
    const { data, error } = await supabase.from('holidays').update({ name, date, type, description }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, message: 'Holiday updated.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update holiday.' });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    await supabase.from('holidays').delete().eq('id', req.params.id);
    res.json({ success: true, message: 'Holiday deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to delete holiday.' });
  }
};

// ======== ANNOUNCEMENTS ========
const getAnnouncements = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let query = supabase.from('announcements').select('*, users(employees(first_name, last_name))').order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load announcements.' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, publishDate, expiryDate } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message are required.' });
    const { data, error } = await supabase.from('announcements').insert({
      title, message, priority: priority || 'normal',
      publish_date: publishDate || new Date().toISOString().split('T')[0],
      expiry_date: expiryDate || null,
      created_by: req.user.id,
    }).select().single();
    if (error) throw error;

    // Notify all employees
    await supabase.from('notifications').insert({
      recipient_role: 'all',
      title: `📢 ${title}`,
      message: message.slice(0, 200),
      type: 'announcement',
      related_id: data.id,
    });

    res.status(201).json({ success: true, message: 'Announcement published.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to publish announcement.' });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, priority, publishDate, expiryDate } = req.body;
    const { data, error } = await supabase.from('announcements').update({ title, message, priority, publish_date: publishDate, expiry_date: expiryDate }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, message: 'Announcement updated.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update announcement.' });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await supabase.from('announcements').delete().eq('id', req.params.id);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to delete announcement.' });
  }
};

// ======== NOTIFICATIONS ========
const getNotifications = async (req, res) => {
  try {
    const { employeeId, role } = req.user;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`recipient_id.eq.${employeeId},recipient_role.eq.${role},recipient_role.eq.all`)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load notifications.' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update notification.' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const { employeeId, role } = req.user;
    await supabase.from('notifications')
      .update({ is_read: true })
      .or(`recipient_id.eq.${employeeId},recipient_role.eq.${role},recipient_role.eq.all`);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update notifications.' });
  }
};

module.exports = {
  getHolidays, createHoliday, updateHoliday, deleteHoliday,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getNotifications, markNotificationRead, markAllNotificationsRead,
};
