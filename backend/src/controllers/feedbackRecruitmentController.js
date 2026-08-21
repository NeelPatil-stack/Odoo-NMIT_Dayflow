const supabase = require('../config/supabase');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ======== ANONYMOUS FEEDBACK ========

const submitFeedback = async (req, res) => {
  try {
    const { category, message, sentiment } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Feedback message is required.' });

    // Anonymize: store only a hashed version of user ID, so HR cannot trace to person
    const anonymousHash = req.user
      ? crypto.createHash('sha256').update(req.user.id + process.env.JWT_SECRET).digest('hex').slice(0, 16)
      : 'anonymous';

    const { data, error } = await supabase.from('anonymous_feedback').insert({
      category: category || 'general',
      message,
      sentiment: sentiment || 'neutral',
      anonymous_hash: anonymousHash,
      status: 'new',
    }).select().single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Feedback submitted anonymously. Thank you!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to submit feedback. Please try again.' });
  }
};

const getFeedback = async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = supabase.from('anonymous_feedback').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load feedback.' });
  }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, hrNote } = req.body;
    const { data, error } = await supabase.from('anonymous_feedback').update({ status, hr_note: hrNote }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, message: 'Feedback status updated.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update feedback.' });
  }
};

// ======== RECRUITMENT ========

// Multer setup for resume uploads
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const resumeStorage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, DOC, and DOCX files are allowed.'));
  },
});

// Simple scoring based on keywords in the application
const scoreApplication = (experience, skills, position) => {
  let score = 50; // Base score
  if (experience >= 5) score += 30;
  else if (experience >= 3) score += 20;
  else if (experience >= 1) score += 10;
  const skillCount = (skills || '').split(',').filter(s => s.trim()).length;
  score += Math.min(skillCount * 5, 20);
  return Math.min(score, 100);
};

const createApplication = async (req, res) => {
  try {
    const { applicantName, email, phone, position, experience, skills, coverLetter } = req.body;
    if (!applicantName || !email || !position) return res.status(400).json({ success: false, message: 'Name, email, and position are required.' });

    const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : null;
    const score = scoreApplication(parseInt(experience) || 0, skills, position);
    const status = score >= 70 ? 'shortlisted' : score >= 50 ? 'review' : 'rejected';

    const { data, error } = await supabase.from('recruitment_applications').insert({
      applicant_name: applicantName,
      email: email.toLowerCase(),
      phone,
      position,
      experience_years: parseInt(experience) || 0,
      skills,
      cover_letter: coverLetter,
      resume_path: resumePath,
      score,
      status,
      created_by: req.user?.id || null,
    }).select().single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Application submitted successfully.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to submit application.' });
  }
};

const getApplications = async (req, res) => {
  try {
    const { position, status } = req.query;
    let query = supabase.from('recruitment_applications').select('*').order('score', { ascending: false }).order('created_at', { ascending: false });
    if (position) query = query.ilike('position', `%${position}%`);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to load applications.' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, hrNotes } = req.body;
    const { data, error } = await supabase.from('recruitment_applications').update({ status, hr_notes: hrNotes, reviewed_by: req.user.id }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, message: 'Application status updated.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update application.' });
  }
};

module.exports = {
  submitFeedback, getFeedback, updateFeedbackStatus,
  createApplication, getApplications, updateApplicationStatus, resumeUpload,
};
