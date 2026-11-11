import express, { Request, Response, Router } from 'express';
import { dataService } from '../services/dataService';
import { epgService } from '../services/epgService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

const router: Router = express.Router();

// ─── CHANNELS (Internal: used by TV Player for filtering & search) ───────────
router.get('/channels', (req: Request, res: Response) => {
  const { country, category, search, page = '1', limit = '50', onlyWorking = 'false' } = req.query;

  const result = dataService.getChannels({
    country: country as string,
    category: category as string,
    search: search as string,
    page: parseInt(page as string, 10) || 1,
    limit: Math.min(500, parseInt(limit as string, 10) || 50),
    onlyWorking: onlyWorking === 'true',
  });

  const formatted = result.channels.map((ch) => ({
    id: ch.id,
    name: ch.name,
    url: ch.streamUrl,
    streamUrl: ch.streamUrl,
    logo: ch.logoUrl,
    logoUrl: ch.logoUrl,
    quality: ch.resolution || 'HD',
    resolution: ch.resolution || 'HD',
    country: ch.country,
    categories: [(!ch.category || ch.category.toLowerCase() === 'undefined') ? 'General' : ch.category],
    category: (!ch.category || ch.category.toLowerCase() === 'undefined') ? 'General' : ch.category,
    tvgId: ch.id,
    isWorking: ch.isWorking !== false,
  }));

  res.json(
    new ApiResponse(200, {
      channels: formatted,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    }, 'Channels retrieved')
  );
});

// ─── CATEGORIES (Internal: used by TV Player for dynamic category filtering) ──
router.get('/categories', (req: Request, res: Response) => {
  const { country } = req.query;
  const categories = dataService.getCategories(country as string);
  res.json(
    new ApiResponse(200, {
      categories,
    }, 'Categories retrieved')
  );
});

// ─── EPG SCHEDULE (Internal: used by TV Player for current/upcoming guide) ───
router.get('/epg/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const channel = dataService.getChannelById(id);
  if (!channel) throw new ApiError(404, 'Channel not found');

  const epgData = await epgService.getEpgForChannel(channel.id, channel.country);
  res.json(
    new ApiResponse(200, {
      channelId: channel.id,
      channelName: channel.name,
      country: channel.country,
      ...epgData,
    }, 'EPG retrieved')
  );
}));

// ─── PLAYLIST EXPORT (Internal: used by UI for M3U download/copy) ────────────
router.get('/playlist/:code.m3u', (req: Request, res: Response) => {
  const code = String(req.params.code);
  const isAll = ['all', 'world'].includes(code.toLowerCase());
  const countryCode = isAll ? undefined : code;

  const m3uContent = dataService.generateM3U(countryCode, false);
  res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="${code}.m3u"`);
  res.send(m3uContent);
});

export default router;
