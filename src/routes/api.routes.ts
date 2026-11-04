import express, { Request, Response, Router } from 'express';
import { dataService } from '../services/dataService';
import { epgService } from '../services/epgService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

const router: Router = express.Router();

// ─── STATS ────────────────────────────────────────────────────────────────────
router.get('/stats', (_req: Request, res: Response) => {
  res.json(new ApiResponse(200, dataService.getStats(), 'Stats retrieved'));
});

// ─── COUNTRIES ────────────────────────────────────────────────────────────────
router.get('/countries', (req: Request, res: Response) => {
  const sortBy = req.query.sort === 'name' ? 'name' : 'count';
  const countries = dataService.getCountries(sortBy);
  res.json(new ApiResponse(200, { count: countries.length, countries }, 'Countries retrieved'));
});

// ─── ANDROID TV FEED ──────────────────────────────────────────────────────────
router.get('/tv/feed', (req: Request, res: Response) => {
  const limitPerCountry = Math.min(100, parseInt(req.query.limit as string, 10) || 50);
  const maxCountries    = Math.min(100, parseInt(req.query.maxCountries as string, 10) || 50);
  const feed = dataService.getTvFeed(limitPerCountry, maxCountries);
  res.json(new ApiResponse(200, { count: feed.length, countries: feed }, 'TV feed retrieved'));
});

// ─── CHANNELS (paginated & filtered) ──────────────────────────────────────────
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
    categories: [ch.category || 'General'],
    category: ch.category || 'General',
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

// ─── SINGLE CHANNEL ───────────────────────────────────────────────────────────
router.get('/channel/:id', (req: Request, res: Response) => {
  const channel = dataService.getChannelById(String(req.params.id));
  if (!channel) throw new ApiError(404, 'Channel not found');
  const country = dataService.getCountry(channel.country);
  res.json(new ApiResponse(200, { channel, country }, 'Channel retrieved'));
});

// ─── EPG (channel-level) ──────────────────────────────────────────────────────
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

// ─── EPG DEEP (same, kept for compatibility) ──────────────────────────────────
router.get('/epg/deep/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const channel = dataService.getChannelById(id);
  if (!channel) throw new ApiError(404, 'Channel not found');

  const epgData = await epgService.getEpgForChannel(channel.id, channel.country);
  res.json(
    new ApiResponse(200, {
      channelId: channel.id,
      channelName: channel.name,
      ...epgData,
    }, 'EPG (deep) retrieved')
  );
}));

// ─── M3U PLAYLIST EXPORT ──────────────────────────────────────────────────────
router.get('/playlist/:code.m3u', (req: Request, res: Response) => {
  const code = String(req.params.code);
  const isAll = ['all', 'world'].includes(code.toLowerCase());
  const countryCode = isAll ? undefined : code;

  const m3uContent = dataService.generateM3U(countryCode, false);
  res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="${code}.m3u"`);
  res.send(m3uContent);
});

// ─── XMLTV EPG ────────────────────────────────────────────────────────────────
router.get('/epg/:code.xml', asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.params.code).toLowerCase();
  const xml = await epgService.getCountryXml(code);
  if (!xml) throw new ApiError(404, `EPG XML not available for ${code}`);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="${code}.xml"`);
  res.send(xml);
}));

// ─── RYTEC SOURCES XML (Enigma2) ──────────────────────────────────────────────
router.get('/epg/rytec/sources.xml', (_req: Request, res: Response) => {
  const host = _req.get('host') || 'localhost:3000';
  const protocol = _req.protocol;
  const baseUrl = `${protocol}://${host}/api/epg/rytec/`;
  const xml = `<?xml version="1.0" encoding="utf-8"?>\n<sources>\n  <source type="gen_xmltv" channels="channels.xml">\n    <description>LiveTV Rytec Worldwide Sources</description>\n    <url>${baseUrl}</url>\n  </source>\n</sources>`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="sources.xml"');
  res.send(xml);
});

// ─── XMLTV GZIP / RYTEC ───────────────────────────────────────────────────────
router.get(['/epg/:code.xml.gz', '/epg/rytec/:code.xml.gz'], asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.params.code).toLowerCase();
  const gz = await epgService.getCountryGzip(code);
  if (!gz) throw new ApiError(404, `EPG Gzip not available for ${code}`);
  res.setHeader('Content-Type', 'application/gzip');
  res.setHeader('Content-Disposition', `attachment; filename="${code}.xml.gz"`);
  res.send(gz);
}));

// ─── VERIFICATION (admin trigger) ─────────────────────────────────────────────
router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const concurrency = Math.min(50, parseInt(req.body?.concurrency as string, 10) || 15);
  const limit       = parseInt(req.body?.limit as string, 10) || 0;
  const progress    = await dataService.runVerification(concurrency, limit);
  res.json(new ApiResponse(200, progress, 'Verification complete'));
}));

export default router;
