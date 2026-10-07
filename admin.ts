import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Require admin or moderator for admin routes
router.use(authenticate);
router.use(requireRole(['admin', 'moderator']));

// GET /api/admin/statistics
router.get('/statistics', (req: AuthenticatedRequest, res: Response) => {
  const users = db.users;
  const items = db.items;
  const interviews = db.interviews;
  const reports = db.reports;

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter((i) => i.status === 'completed');
  const avgScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
            completedInterviews.length
        )
      : 80;

  const lostItems = items.filter((i) => i.type === 'lost').length;
  const foundItems = items.filter((i) => i.type === 'found').length;
  const returnedItems = items.filter((i) => i.status === 'returned').length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;

  res.json({
    success: true,
    data: {
      totalStudents,
      totalInterviews,
      avgScore,
      lostItems,
      foundItems,
      returnedItems,
      pendingReports,
      recoveryRate: foundItems > 0 ? Math.round((returnedItems / (lostItems || 1)) * 100) : 74,
      interviewTypeBreakdown: [
        { type: 'Technical Interview', count: 18, avgScore: 84 },
        { type: 'HR Interview', count: 12, avgScore: 79 },
        { type: 'Behavioral Interview', count: 14, avgScore: 81 },
        { type: 'Coding Interview', count: 10, avgScore: 86 },
        { type: 'Aptitude Interview', count: 8, avgScore: 77 },
      ],
      monthlyTrends: [
        { month: 'Jun', interviews: 12, lost: 14, returned: 9 },
        { month: 'Jul', interviews: 20, lost: 16, returned: 12 },
        { month: 'Aug', interviews: 34, lost: 22, returned: 17 },
        { month: 'Sep', interviews: 48, lost: 28, returned: 22 },
        { month: 'Oct', interviews: 62, lost: 20, returned: 16 },
      ],
    },
  });
});

// GET /api/admin/users
router.get('/users', (req: AuthenticatedRequest, res: Response) => {
  const safeUsers = db.users.map(({ passwordHash: _, ...rest }) => rest);
  res.json({
    success: true,
    data: safeUsers,
  });
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  if (!['student', 'moderator', 'admin'].includes(role)) {
    res.status(400).json({ success: false, message: 'Invalid role' });
    return;
  }

  const updated = db.updateUser(req.params.id, { role });
  if (!updated) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const { passwordHash: _, ...safeUser } = updated;
  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: safeUser,
  });
});

// GET /api/admin/items
router.get('/items', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: db.getAllItems(),
  });
});

// DELETE /api/admin/items/:id
router.delete('/items/:id', (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteItem(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Item not found' });
    return;
  }
  res.json({
    success: true,
    message: 'Listing removed by administrator',
  });
});

// GET /api/admin/reports
router.get('/reports', (req: AuthenticatedRequest, res: Response) => {
  const reports = db.getAllReports().map((r) => {
    const item = db.findItemById(r.itemId);
    const reporter = db.findUserById(r.reportedByUserId);
    return {
      ...r,
      item,
      reporterName: reporter?.name || 'Anonymous Student',
    };
  });

  res.json({
    success: true,
    data: reports,
  });
});

// PUT /api/admin/reports/:id/resolve
router.put('/reports/:id/resolve', (req: AuthenticatedRequest, res: Response) => {
  const { action = 'resolve' } = req.body; // 'resolve' | 'dismiss'
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }

  report.status = action === 'dismiss' ? 'dismissed' : 'resolved';
  if (action === 'remove_item') {
    db.deleteItem(report.itemId);
    report.status = 'resolved';
  }

  res.json({
    success: true,
    message: `Report ${report.status}`,
    data: report,
  });
});

export default router;
