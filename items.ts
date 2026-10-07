import { Router, Response } from 'express';
import { db, LostFoundItem } from '../db';
import { AuthenticatedRequest, authenticate, optionalAuth } from '../middleware/auth';
import { aiService } from '../aiService';

const router = Router();

// GET /api/items (Search and filter)
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { search, category, location, type, status, limit = 50 } = req.query;
  let items = db.getAllItems();

  if (type) {
    items = items.filter((i) => i.type.toLowerCase() === String(type).toLowerCase());
  }

  if (category && category !== 'All') {
    items = items.filter((i) => i.category.toLowerCase() === String(category).toLowerCase());
  }

  if (location && location !== 'All') {
    items = items.filter((i) => i.location.toLowerCase().includes(String(location).toLowerCase()));
  }

  if (status && status !== 'All') {
    items = items.filter((i) => i.status.toLowerCase() === String(status).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter(
      (i) =>
        i.itemName.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.color.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.identifiers.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    data: items.slice(0, Number(limit)),
  });
});

// GET /api/items/:id
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const item = db.findItemById(req.params.id);
  if (!item) {
    res.status(404).json({ success: false, message: 'Item listing not found' });
    return;
  }
  res.json({
    success: true,
    data: item,
  });
});

// POST /api/items/lost (Report lost item)
router.post('/lost', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      itemName,
      category = 'Other',
      description,
      image,
      location,
      date,
      time = '12:00',
      color = '',
      brand = '',
      identifiers = '',
      contactPreference = 'in_app',
    } = req.body;

    if (!itemName || !description || !location || !date) {
      res.status(400).json({ success: false, message: 'Item name, description, location, and date are required' });
      return;
    }

    const newItem: LostFoundItem = {
      id: `item_lost_${Date.now()}`,
      userId: req.user.id,
      reporterName: req.user.name,
      reporterEmail: req.user.email,
      reporterPhone: req.user.phone,
      type: 'lost',
      itemName: itemName.trim(),
      category,
      description: description.trim(),
      image: image || 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80',
      color,
      brand,
      location,
      date,
      time,
      identifiers,
      contactPreference,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createItem(newItem);

    // Run AI matching against active found items asynchronously to notify user of immediate matches!
    const activeFoundItems = db.getAllItems().filter((i) => i.type === 'found' && i.status === 'active');
    let topMatches: any[] = [];
    if (activeFoundItems.length > 0) {
      topMatches = await aiService.matchLostFoundItems(newItem, activeFoundItems);
      if (topMatches.length > 0 && topMatches[0].matchScore >= 80) {
        db.createNotification({
          id: `notif_match_${Date.now()}`,
          userId: req.user.id,
          title: `High Match Alert (${topMatches[0].matchScore}%)`,
          message: `AI found a strong match for your lost "${newItem.itemName}"! Check match details now.`,
          type: 'match',
          read: false,
          relatedItemId: topMatches[0].foundItemId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Lost item report submitted successfully',
      data: newItem,
      matches: topMatches.slice(0, 3),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to submit report' });
  }
});

// POST /api/items/found (Report found item)
router.post('/found', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      itemName,
      category = 'Other',
      description,
      image,
      location,
      date,
      time = '12:00',
      color = '',
      brand = '',
      identifiers = '',
      contactPreference = 'in_app',
    } = req.body;

    if (!itemName || !description || !location || !date) {
      res.status(400).json({ success: false, message: 'Item name, description, location, and date are required' });
      return;
    }

    const newItem: LostFoundItem = {
      id: `item_found_${Date.now()}`,
      userId: req.user.id,
      reporterName: req.user.name,
      reporterEmail: req.user.email,
      reporterPhone: req.user.phone,
      type: 'found',
      itemName: itemName.trim(),
      category,
      description: description.trim(),
      image: image || 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80',
      color,
      brand,
      location,
      date,
      time,
      identifiers,
      contactPreference,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createItem(newItem);

    // Match against active lost items
    const activeLostItems = db.getAllItems().filter((i) => i.type === 'lost' && i.status === 'active');
    if (activeLostItems.length > 0) {
      const matchCandidates = activeLostItems.map((lost) => ({
        id: lost.id,
        itemName: lost.itemName,
        category: lost.category,
        description: lost.description,
        color: lost.color,
        brand: lost.brand,
        location: lost.location,
        date: lost.date,
        identifiers: lost.identifiers,
      }));

      const results = await aiService.matchLostFoundItems(newItem, matchCandidates);
      if (results.length > 0 && results[0].matchScore >= 80) {
        const matchedLostItem = db.findItemById(results[0].foundItemId);
        if (matchedLostItem) {
          db.createNotification({
            id: `notif_match_${Date.now()}`,
            userId: matchedLostItem.userId,
            title: `Possible Match Found (${results[0].matchScore}%)`,
            message: `Someone just reported a found "${newItem.itemName}" near ${newItem.location} that matches your lost item!`,
            type: 'match',
            read: false,
            relatedItemId: newItem.id,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Found item report submitted successfully. Thank you for helping fellow students!',
      data: newItem,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to submit report' });
  }
});

// PUT /api/items/:id/returned (Mark as returned)
router.put('/:id/returned', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const item = db.findItemById(req.params.id);
  if (!item) {
    res.status(404).json({ success: false, message: 'Item not found' });
    return;
  }

  // Allow owner, admin, or moderator
  const isOwner = req.user?.id === item.userId;
  const isStaff = req.user?.role === 'admin' || req.user?.role === 'moderator';

  if (!isOwner && !isStaff) {
    res.status(403).json({ success: false, message: 'You do not have permission to mark this item as returned' });
    return;
  }

  const updated = db.updateItem(req.params.id, {
    status: 'returned',
  });

  // Notify the reporter
  db.createNotification({
    id: `notif_${Date.now()}`,
    userId: item.userId,
    title: 'Item Marked as Returned 🎉',
    message: `Your report for "${item.itemName}" has been marked as returned and resolved.`,
    type: 'return',
    read: false,
    relatedItemId: item.id,
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Item successfully marked as returned and resolved',
    data: updated,
  });
});

// POST /api/items/:id/report (Report listing for abuse/spam)
router.post('/:id/report', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const item = db.findItemById(req.params.id);
  if (!item) {
    res.status(404).json({ success: false, message: 'Item not found' });
    return;
  }

  const { reason = 'Suspicious or duplicate listing' } = req.body;
  const dispute = db.createReport({
    id: `rep_${Date.now()}`,
    itemId: item.id,
    reportedByUserId: req.user.id,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  db.updateItem(item.id, {
    reportCount: (item.reportCount || 0) + 1,
  });

  res.json({
    success: true,
    message: 'Listing reported to campus moderation team for review',
    data: dispute,
  });
});

// POST /api/items/:id/contact (Send safe message to reporter)
router.post('/:id/contact', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const item = db.findItemById(req.params.id);
  if (!item) {
    res.status(404).json({ success: false, message: 'Item not found' });
    return;
  }

  const { message, contactInfo } = req.body;
  if (!message) {
    res.status(400).json({ success: false, message: 'Message content is required' });
    return;
  }

  // Create notification for the reporter without exposing reporter private details
  db.createNotification({
    id: `notif_${Date.now()}`,
    userId: item.userId,
    title: `Inquiry regarding "${item.itemName}"`,
    message: `${req.user.name} (${req.user.department}): "${message.slice(0, 140)}..." Contact: ${contactInfo || req.user.email}`,
    type: 'message',
    read: false,
    relatedItemId: item.id,
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Message sent to ${item.reporterName} securely via CampusConnect.`,
  });
});

// DELETE /api/items/:id (Remove listing)
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const item = db.findItemById(req.params.id);
  if (!item) {
    res.status(404).json({ success: false, message: 'Item not found' });
    return;
  }

  const isOwner = req.user?.id === item.userId;
  const isStaff = req.user?.role === 'admin' || req.user?.role === 'moderator';

  if (!isOwner && !isStaff) {
    res.status(403).json({ success: false, message: 'Permission denied to delete this item' });
    return;
  }

  db.deleteItem(req.params.id);
  res.json({
    success: true,
    message: 'Listing removed successfully',
  });
});

export default router;
