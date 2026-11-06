import https from 'https';
import http from 'http';
import zlib from 'zlib';
import { URL } from 'url';
import { ChannelEpgData, EpgProgramme } from '../types';
import logger from '../logger/winston.logger';

interface CachedCountryFeed {
  timestamp: number;
  programmesByChannel: Map<string, EpgProgramme[]>;
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export class EpgService {
  private feedCache = new Map<string, CachedCountryFeed>();
  private inFlight = new Map<string, Promise<CachedCountryFeed | null>>();

  /**
   * Returns the Tier 1 XMLTV gzip feed URL for a given country code.
   */
  public getTier1Url(countryCode: string): string {
    const code = (countryCode || 'us').toLowerCase();
    return `https://epg.kanya.io/${code}/guide.xml.gz`;
  }

  /**
   * Loads a country's EPG feed from cache or network (deduplicating in-flight requests).
   */
  public async loadCountryFeed(countryCode: string): Promise<CachedCountryFeed | null> {
    const code = (countryCode || 'us').toLowerCase();
    const cached = this.feedCache.get(code);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached;
    }

    if (this.inFlight.has(code)) {
      return this.inFlight.get(code)!;
    }

    const fetchPromise = this._fetchAndParseCountry(code);
    this.inFlight.set(code, fetchPromise);

    try {
      const result = await fetchPromise;
      if (result) {
        this.feedCache.set(code, result);
      }
      return result;
    } finally {
      this.inFlight.delete(code);
    }
  }

  private async _fetchAndParseCountry(code: string): Promise<CachedCountryFeed | null> {
    const feedUrl = this.getTier1Url(code);
    try {
      const gzipBuffer = await this._downloadBuffer(feedUrl);
      if (!gzipBuffer || gzipBuffer.length === 0) return null;

      const xmlText = await this._gunzip(gzipBuffer);
      const programmesByChannel = this._parseXmltv(xmlText);

      return {
        timestamp: Date.now(),
        programmesByChannel,
      };
    } catch (err) {
      logger.warn(`[EpgService] Tier 1 EPG unavailable for [${code}]: ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Returns "Now Playing" + upcoming schedule for a channel.
   */
  public async getEpgForChannel(channelId: string, countryCode = 'us'): Promise<ChannelEpgData> {
    const feed = await this.loadCountryFeed(countryCode);
    if (!feed || !feed.programmesByChannel) {
      return { hasEpg: false, source: 'Tier 1 (epg.kanya.io)' };
    }

    const normalizedTarget = channelId.toLowerCase();
    let progs: EpgProgramme[] | undefined = feed.programmesByChannel.get(channelId);

    if (!progs) {
      for (const [key, list] of feed.programmesByChannel.entries()) {
        if (
          key.toLowerCase() === normalizedTarget ||
          key.toLowerCase().includes(normalizedTarget) ||
          normalizedTarget.includes(key.toLowerCase())
        ) {
          progs = list;
          break;
        }
      }
    }

    if (!progs || progs.length === 0) {
      return { hasEpg: false, source: 'Tier 1 (epg.kanya.io)' };
    }

    const now = Date.now();

    for (let i = 0; i < progs.length; i++) {
      const prog = progs[i];
      const startMs = prog.start.getTime();
      const stopMs = prog.stop.getTime();

      if (now >= startMs && now < stopMs) {
        const total = Math.max(1, stopMs - startMs);
        const elapsed = now - startMs;
        prog.progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));

        const upcomingList = progs.slice(i + 1, i + 8).map((p) => ({
          title: p.title,
          desc: p.desc || '',
          startTimeStr: p.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          stopTimeStr: p.stop.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));

        const remainingMins = Math.max(0, Math.round((stopMs - now) / 60000));
        const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          hasEpg: true,
          source: 'Tier 1 (epg.kanya.io)',
          nowPlaying: {
            title: prog.title,
            desc: prog.desc || 'No program description provided.',
            startTimeStr: fmt(prog.start),
            stopTimeStr: fmt(prog.stop),
            progress: prog.progressPercent,
            remainingMins,
            category: 'General',
          },
          upcoming: upcomingList,
        };
      }
    }

    // No current program: return future schedule
    const future = progs.filter((p) => p.start.getTime() > now).slice(0, 7);
    return {
      hasEpg: future.length > 0,
      source: 'Tier 1 (epg.kanya.io)',
      upcoming: future.map((p) => ({
        title: p.title,
        desc: p.desc || '',
        startTimeStr: p.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stopTimeStr: p.stop.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })),
    };
  }

  private _downloadBuffer(urlStr: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let parsed: URL;
      try {
        parsed = new URL(urlStr);
      } catch (e) {
        return reject(e);
      }

      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(urlStr, { timeout: 10000 }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return this._downloadBuffer(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          res.destroy();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  private _gunzip(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      zlib.gunzip(buffer, (err, decompressed) => {
        if (err) return reject(err);
        resolve(decompressed.toString('utf-8'));
      });
    });
  }

  private _parseXmltv(xml: string): Map<string, EpgProgramme[]> {
    const map = new Map<string, EpgProgramme[]>();
    const progRegex = /<programme\s+([^>]+)>([\s\S]*?)<\/programme>/gi;
    let match: RegExpExecArray | null;

    while ((match = progRegex.exec(xml)) !== null) {
      const attrs = match[1];
      const body = match[2];

      const chMatch = attrs.match(/channel="([^"]+)"/i);
      const startMatch = attrs.match(/start="([^"]+)"/i);
      const stopMatch = attrs.match(/stop="([^"]+)"/i);

      if (!chMatch || !startMatch || !stopMatch) continue;

      const channelId = chMatch[1];
      const start = this._parseXmltvTime(startMatch[1]);
      const stop = this._parseXmltvTime(stopMatch[1]);

      const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = body.match(/<desc[^>]*>([^<]+)<\/desc>/i);

      const title = titleMatch ? titleMatch[1].trim() : 'Scheduled Broadcast';
      const desc = descMatch ? descMatch[1].trim() : undefined;

      const prog: EpgProgramme = { channelId, title, desc, start, stop, progressPercent: 0 };

      if (!map.has(channelId)) map.set(channelId, []);
      map.get(channelId)!.push(prog);
    }

    return map;
  }

  private _parseXmltvTime(timeStr: string): Date {
    // Format: YYYYMMDDHHmmss +0000
    const clean = timeStr.trim();
    const year  = parseInt(clean.substring(0, 4), 10);
    const month = parseInt(clean.substring(4, 6), 10) - 1;
    const day   = parseInt(clean.substring(6, 8), 10);
    const hour  = parseInt(clean.substring(8, 10), 10);
    const min   = parseInt(clean.substring(10, 12), 10);
    const sec   = parseInt(clean.substring(12, 14), 10) || 0;
    return new Date(Date.UTC(year, month, day, hour, min, sec));
  }
}

export const epgService = new EpgService();
