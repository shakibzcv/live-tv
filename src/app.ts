import express, { Express, type Request, type Response, type NextFunction } from 'express';
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import { dataService } from './services/dataService';
import { epgService } from './services/epgService';
import morganMiddleware from './logger/morgan.logger';
import { errorHandler } from './middlewares/error.middlewares';
import apiRouter from './routes/api.routes';

const app: Express = express();

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

// ─── EJS Template Engine ──────────────────────────────────────────────────────
const viewsPath = path.resolve(__dirname, '../views');
app.set('views', viewsPath);
app.set('view engine', 'ejs');

// ─── Static Assets ────────────────────────────────────────────────────────────
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  setHeaders: (res) => {
    if (process.env.NODE_ENV !== 'production') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  },
}));

// ─── Data Init ────────────────────────────────────────────────────────────────
dataService.init();

// ─── Supported Languages ───────────────────────────────────────────────────────
const SUPPORTED_LANGS = ['en', 'bn', 'es', 'de', 'fr', 'hi', 'ar'] as const;

// ─── SSR Web UI Helper ────────────────────────────────────────────────────────
const renderApp = (req: Request, res: Response, initialView = 'overview') => {
  const langParam = typeof req.params.lang === 'string' ? req.params.lang.toLowerCase() : '';
  const currentLang = SUPPORTED_LANGS.includes(langParam as any) ? langParam : 'en';
  const stats      = dataService.getStats();
  const countries  = dataService.getCountries();
  const categories = dataService.getCategories();

  const queryCountry    = typeof req.query.country === 'string' ? req.query.country.toUpperCase() : null;
  const matchedCountry  = queryCountry ? countries.find((c) => c.code === queryCountry) : null;

  const defaultCountry = matchedCountry || countries[0] || {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    channelCount: 0,
    workingCount: 0,
    epgUrl: '',
    m3uUrl: '',
  };

  const queryCategory = typeof req.query.cat === 'string' ? req.query.cat : undefined;

  const initialChannelsData = dataService.getChannels({
    country: defaultCountry.code,
    category: queryCategory,
    page: 1,
    limit: 100,
  });

  const effectiveView = req.query.country ? 'player' : initialView;

  res.render('index', {
    stats,
    countries,
    categories,
    defaultCountry,
    initialChannels: initialChannelsData.channels,
    initialTotal: initialChannelsData.total,
    initialView: effectiveView,
    initialQueryCountry: defaultCountry.code,
    initialQueryCategory: queryCategory || 'all',
    currentLang,
  });
};

// ─── SSR Page Routes ──────────────────────────────────────────────────────────
const handleLangView = (view: string) => (req: Request, res: Response, next: NextFunction) => {
  const lang = typeof req.params.lang === 'string' ? req.params.lang.toLowerCase() : '';
  if (SUPPORTED_LANGS.includes(lang as any)) {
    return renderApp(req, res, view);
  }
  return next();
};

// Base routes (default language)
app.get('/',          (req, res) => renderApp(req, res, 'overview'));
app.get('/countries', (req, res) => renderApp(req, res, 'countries'));
app.get('/player',    (req, res) => renderApp(req, res, 'player'));
app.get('/channels',  (req, res) => renderApp(req, res, 'channels'));

// Language-prefixed routes (e.g. /bn, /bn/player, /es/countries, /de/channels)
app.get('/:lang',           handleLangView('overview'));
app.get('/:lang/countries', handleLangView('countries'));
app.get('/:lang/player',    handleLangView('player'));
app.get('/:lang/channels',  handleLangView('channels'));

// ─── REST API ─────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
