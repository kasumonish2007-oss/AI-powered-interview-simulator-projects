import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const notifs = db.getNotificationsByUser(req.user.id);
  res.json({
    success: true,
    data: notifs,
    unreadCount: notifs.filter((n) => !n.read).length,
  });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const success = db.markNotificationRead(req.params.id, req.user.id);
  res.json({
    success,
    message: success ? 'Notification marked as read' : 'Notification not found',
  });
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  db.markAllNotificationsRead(req.user.id);
  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

export default router;
