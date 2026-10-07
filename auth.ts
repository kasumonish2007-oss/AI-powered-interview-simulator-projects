import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, User } from '../db';
import { generateToken, AuthenticatedRequest, authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      college,
      studentId,
      department,
      year,
      phone,
      role = 'student',
    } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match' });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      college: college || 'State Institute of Science & Technology',
      studentId: studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      department: department || 'Computer Science',
      year: year || '3rd Year',
      phone: phone || '',
      role: role === 'admin' || role === 'moderator' ? role : 'student',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      skills: ['JavaScript', 'Communication', 'Problem Solving'],
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    const { passwordHash: _, ...userSafe } = newUser;
    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: userSafe,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);
    const { passwordHash: _, ...userSafe } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userSafe,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const { passwordHash: _, ...userSafe } = req.user;
  res.json({
    success: true,
    data: {
      user: userSafe,
    },
  });
});

// POST /api/auth/logout
router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// POST /api/auth/switch-demo (allows instant 1-click test login as Student, Admin, or Moderator)
router.post('/switch-demo', (req: AuthenticatedRequest, res: Response) => {
  const { role = 'student' } = req.body;
  let targetUser: User | undefined;

  if (role === 'admin') {
    targetUser = db.findUserById('usr_admin_1');
  } else if (role === 'moderator') {
    targetUser = db.findUserById('usr_mod_1');
  } else {
    targetUser = db.findUserById('usr_student_1');
  }

  if (!targetUser) {
    targetUser = db.users[0];
  }

  const token = generateToken(targetUser);
  const { passwordHash: _, ...userSafe } = targetUser;

  res.json({
    success: true,
    message: `Switched session to ${targetUser.name} (${targetUser.role})`,
    data: {
      token,
      user: userSafe,
    },
  });
});

export default router;
