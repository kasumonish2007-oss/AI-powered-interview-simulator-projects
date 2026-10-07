import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, optionalAuth } from '../middleware/auth';
import { aiService } from '../aiService';

const router = Router();

// GET /api/items/:id/matches
router.get('/items/:id/matches', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = db.findItemById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    const counterType = item.type === 'lost' ? 'found' : 'lost';
    const counterItems = db.getAllItems().filter((i) => i.type === counterType && i.status !== 'closed');

    if (counterItems.length === 0) {
      res.json({
        success: true,
        data: {
          item,
          matches: [],
        },
      });
      return;
    }

    const candidates = counterItems.map((c) => ({
      id: c.id,
      itemName: c.itemName,
      category: c.category,
      description: c.description,
      color: c.color,
      brand: c.brand,
      location: c.location,
      date: c.date,
      identifiers: c.identifiers,
    }));

    const matchResults = await aiService.matchLostFoundItems(
      {
        itemName: item.itemName,
        category: item.category,
        description: item.description,
        color: item.color,
        brand: item.brand,
        location: item.location,
        date: item.date,
        identifiers: item.identifiers,
      },
      candidates
    );

    // Hydrate matched items with full details
    const hydratedMatches = matchResults.map((m) => {
      const fullItem = db.findItemById(m.foundItemId);
      return {
        ...m,
        item: fullItem,
      };
    });

    res.json({
      success: true,
      data: {
        item,
        matches: hydratedMatches,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error generating AI matches' });
  }
});

// POST /api/matches/analyze
router.post('/analyze', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lostItem } = req.body;
    if (!lostItem || !lostItem.itemName) {
      res.status(400).json({ success: false, message: 'Valid item details required for analysis' });
      return;
    }

    const foundItems = db.getAllItems().filter((i) => i.type === 'found' && i.status === 'active');
    const candidates = foundItems.map((c) => ({
      id: c.id,
      itemName: c.itemName,
      category: c.category,
      description: c.description,
      color: c.color,
      brand: c.brand,
      location: c.location,
      date: c.date,
      identifiers: c.identifiers,
    }));

    const results = await aiService.matchLostFoundItems(lostItem, candidates);
    const hydrated = results.map((r) => ({
      ...r,
      item: db.findItemById(r.foundItemId),
    }));

    res.json({
      success: true,
      data: hydrated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Analysis failed' });
  }
});

export default router;
