const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const crypto = require('crypto');

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Fetch user with employee info
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, role, is_active, employee_id, employees(id, first_name, last_name, profile_picture, department_id)')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact HR.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee_id,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token hash in DB
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await supabase
      .from('users')
      .update({
        refresh_token_hash: refreshTokenHash,
        last_login: new Date().toISOString(),
      })
      .eq('id', user.id);

    const employee = user.employees;
    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employee_id,
          firstName: employee?.first_name || '',
          lastName: employee?.last_name || '',
          profilePicture: employee?.profile_picture || null,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' });
  }
};

/**
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Refresh token required.' });

    const decoded = verifyRefreshToken(token);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { data: user } = await supabase
      .from('users')
      .select('id, email, role, employee_id, is_active, refresh_token_hash')
      .eq('id', decoded.id)
      .single();

    if (!user || user.refresh_token_hash !== tokenHash || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role, employeeId: user.employee_id };
    const newAccessToken = generateAccessToken(tokenPayload);

    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    await supabase.from('users').update({ refresh_token_hash: null }).eq('id', req.user.id);
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Logout failed.' });
  }
};

/**
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const { data: user } = await supabase.from('users').select('password_hash').eq('id', req.user.id).single();
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await supabase.from('users').update({ password_hash: hash }).eq('id', req.user.id);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to change password. Please try again.' });
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const { data: user } = await supabase.from('users').select('id, email').eq('email', email.toLowerCase().trim()).single();

    // Always respond the same to prevent email enumeration
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      await supabase.from('users').update({
        reset_token_hash: resetTokenHash,
        reset_token_expires: expiresAt,
      }).eq('id', user.id);

      // TODO: Send email with reset link
      // The link would be: ${FRONTEND_URL}/reset-password?token=${resetToken}
      console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
    }

    res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to process request. Please try again.' });
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { data: user } = await supabase
      .from('users')
      .select('id, reset_token_expires')
      .eq('reset_token_hash', tokenHash)
      .single();

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset token has expired. Please request a new one.' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await supabase.from('users').update({
      password_hash: hash,
      reset_token_hash: null,
      reset_token_expires: null,
    }).eq('id', user.id);

    res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to reset password. Please try again.' });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, email, role, employee_id, is_active, employees(id, first_name, last_name, profile_picture, department_id, designation_id)')
      .eq('id', req.user.id)
      .single();

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const emp = user.employees;
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id,
        firstName: emp?.first_name,
        lastName: emp?.last_name,
        profilePicture: emp?.profile_picture,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to fetch user data.' });
  }
};

module.exports = { login, refreshToken, logout, changePassword, forgotPassword, resetPassword, getMe };
