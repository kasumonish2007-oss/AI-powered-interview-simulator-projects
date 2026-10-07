import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

const router = Router();

// GET /api/users/profile
router.get('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const { passwordHash: _, ...userSafe } = req.user;
  res.json({
    success: true,
    data: userSafe,
  });
});

// PUT /api/users/profile
router.put('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { name, phone, department, year, college, targetRole, skills, bio, avatarUrl } = req.body;
  const updated = db.updateUser(req.user.id, {
    ...(name && { name: name.trim() }),
    ...(phone !== undefined && { phone }),
    ...(department !== undefined && { department }),
    ...(year !== undefined && { year }),
    ...(college !== undefined && { college }),
    ...(targetRole !== undefined && { targetRole }),
    ...(skills !== undefined && { skills }),
    ...(bio !== undefined && { bio }),
    ...(avatarUrl !== undefined && { avatarUrl }),
  });

  if (!updated) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const { passwordHash: _, ...userSafe } = updated;
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: userSafe,
  });
});

export default router;
