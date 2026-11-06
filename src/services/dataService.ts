import fs from 'fs';
import path from 'path';
import { Channel, Country } from '../types';
import { verifierService, VerificationProgress } from './verifierService';
import { epgService } from './epgService';
import logger from '../logger/winston.logger';

const DATA_DIR = path.resolve(__dirname, '../../data');
const CHANNELS_PATH = path.join(DATA_DIR, 'channels.json');
const COUNTRIES_PATH = path.join(DATA_DIR, 'countries.json');

export class DataService {
  private channels: Channel[] = [];
  private channelsById = new Map<string, Channel>();
  private channelsByCountry = new Map<string, Channel[]>();
  private countries = new Map<string, Country>();
  private isLoaded = false;

  public init(): void {
    if (this.isLoaded) return;
    const startTime = Date.now();
    logger.info('[DataService] Initializing IPTV & country data...');

    this._loadCountries();
    this._loadChannels();

    this.isLoaded = true;
    logger.info(
      `[DataService] Initialized in ${Date.now() - startTime}ms. Channels: ${this.channels.length}, Countries: ${this.countries.size}`
    );

    // Hot-reload channels.json when it changes on disk
    if (fs.existsSync(CHANNELS_PATH)) {
      fs.watchFile(CHANNELS_PATH, { interval: 2000 }, () => {
        logger.info('[DataService] channels.json updated on disk. Hot-reloading...');
        this.reload();
      });
    }
  }

  public reload(): void {
    this.channels = [];
    this.channelsById.clear();
    this.channelsByCountry.clear();
    this.countries.clear();
    this.isLoaded = false;
    this.init();
  }

  private _loadCountries(): void {
    if (!fs.existsSync(COUNTRIES_PATH)) {
      logger.warn(`[DataService] countries.json not found at ${COUNTRIES_PATH}`);
      return;
    }

    try {
      const raw = fs.readFileSync(COUNTRIES_PATH, 'utf-8');
      const list = JSON.parse(raw) as { name: string; code: string; flag: string }[];
      for (const entry of list) {
        const code = entry.code.toUpperCase();
        this.countries.set(code, {
          code,
          name: entry.name,
          flag: entry.flag,
          flagCode: code === 'UK' ? 'gb' : code.toLowerCase(),
          channelCount: 0,
          workingCount: 0,
          epgUrl: epgService.getTier1Url(code),
          m3uUrl: `/api/playlist/${code}.m3u`,
        });
      }
      logger.debug(`[DataService] Loaded ${this.countries.size} countries.`);
    } catch (err) {
      logger.error(`[DataService] Error parsing countries.json: ${(err as Error).message}`);
    }
  }

  private _loadChannels(): void {
    if (!fs.existsSync(CHANNELS_PATH)) {
      logger.warn(`[DataService] channels.json not found at ${CHANNELS_PATH}`);
      return;
    }

    try {
      const raw = fs.readFileSync(CHANNELS_PATH, 'utf-8');
      const list = JSON.parse(raw) as Channel[];
      this.channels = list;

      for (const ch of this.channels) {
        if (ch.isWorking === undefined) ch.isWorking = true;

        const countryCode = (ch.country || 'US').toUpperCase();
        ch.country = countryCode;

        this.channelsById.set(ch.id, ch);

        if (!this.channelsByCountry.has(countryCode)) {
          this.channelsByCountry.set(countryCode, []);
        }
        this.channelsByCountry.get(countryCode)!.push(ch);

        let countryObj = this.countries.get(countryCode);
        if (!countryObj) {
          countryObj = {
            code: countryCode,
            name: countryCode,
            flag: '🌐',
            flagCode: countryCode === 'UK' ? 'gb' : countryCode.toLowerCase(),
            channelCount: 0,
            workingCount: 0,
            epgUrl: epgService.getTier1Url(countryCode),
            m3uUrl: `/api/playlist/${countryCode}.m3u`,
          };
          this.countries.set(countryCode, countryObj);
        }
        countryObj.channelCount++;
        if (ch.isWorking) countryObj.workingCount++;
      }

      logger.debug(`[DataService] Loaded ${this.channels.length} channels.`);
    } catch (err) {
      logger.error(`[DataService] Error parsing channels.json: ${(err as Error).message}`);
    }
  }

  public getStats() {
    let working = 0;
    for (const ch of this.channels) {
      if (ch.isWorking) working++;
    }
    const streamingCountries = Array.from(this.countries.values()).filter((c) => c.channelCount > 0).length;
    return {
      totalChannels: this.channels.length,
      workingChannels: working,
      totalCountries: this.countries.size,
      streamingCountries: streamingCountries || 202,
      totalGenres: 27,
    };
  }

  public getCountries(sortBy: 'count' | 'name' = 'count'): Country[] {
    const list = Array.from(this.countries.values()).filter((c) => c.channelCount > 0);
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => b.channelCount - a.channelCount);
    }
    return list;
  }

  public getCountry(code: string): Country | undefined {
    let norm = (code || '').toUpperCase().trim();
    if (norm === 'GB' && !this.countries.has('GB') && this.countries.has('UK')) norm = 'UK';
    else if (norm === 'UK' && !this.countries.has('UK') && this.countries.has('GB')) norm = 'GB';
    return this.countries.get(norm);
  }

  public getChannels(params: {
    country?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    onlyWorking?: boolean;
  }): { channels: Channel[]; total: number; page: number; limit: number; totalPages: number } {
    const { country, category, search, page = 1, limit = 50, onlyWorking = true } = params;

    let normCountry = country ? country.toUpperCase().trim() : '';
    if (normCountry === 'GB' && !this.channelsByCountry.has('GB') && this.channelsByCountry.has('UK')) normCountry = 'UK';
    else if (normCountry === 'UK' && !this.channelsByCountry.has('UK') && this.channelsByCountry.has('GB')) normCountry = 'GB';

    let pool = normCountry
      ? (this.channelsByCountry.get(normCountry) || [])
      : this.channels;

    if (onlyWorking) pool = pool.filter((c) => c.isWorking !== false);

    if (category && category !== 'All' && category !== 'all') {
      const catLower = category.toLowerCase();
      pool = pool.filter((c) => c.category && c.category.toLowerCase().includes(catLower));
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      pool = pool.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.category && c.category.toLowerCase().includes(q)) ||
          (c.resolution && c.resolution.toLowerCase().includes(q))
      );
    }

    const total = pool.length;
    const startIndex = (page - 1) * limit;
    const paginated = pool.slice(startIndex, startIndex + limit);

    return { channels: paginated, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  public getChannelById(id: string): Channel | undefined {
    return this.channelsById.get(id);
  }

  public getCategories(): string[] {
    const set = new Set<string>();
    for (const ch of this.channels) {
      if (ch.category) {
        const parts = ch.category.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
        for (const p of parts) set.add(p);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  public generateM3U(countryCode?: string, onlyWorking = false): string {
    const code = countryCode ? countryCode.toUpperCase() : undefined;
    let list = code ? (this.channelsByCountry.get(code) || []) : this.channels;
    if (onlyWorking) list = list.filter((c) => c.isWorking !== false);

    const epgUrl = code ? epgService.getTier1Url(code) : 'https://epg.kanya.io/us.xml.gz';
    let m3u = `#EXTM3U url-tvg="${epgUrl}"\n\n`;

    for (const ch of list) {
      const logo = ch.logoUrl ? ` tvg-logo="${ch.logoUrl}"` : '';
      const group = ch.category ? ` group-title="${ch.category}"` : '';
      const country = ch.country ? ` tvg-country="${ch.country}"` : '';
      m3u += `#EXTINF:-1 tvg-id="${ch.id}" tvg-name="${ch.name}"${logo}${country}${group},${ch.name}\n`;
      m3u += `${ch.streamUrl}\n\n`;
    }

    return m3u;
  }

  public saveChannels(): void {
    try {
      fs.writeFileSync(CHANNELS_PATH, JSON.stringify(this.channels, null, 2), 'utf-8');
      logger.info('[DataService] Persisted updated channels to channels.json');
    } catch (err) {
      logger.error(`[DataService] Failed to save channels.json: ${(err as Error).message}`);
    }
  }

  public async runVerification(concurrency = 15, limit = 0): Promise<VerificationProgress> {
    const targetChannels = limit > 0 ? this.channels.slice(0, limit) : this.channels;
    logger.info(`[DataService] Starting verification of ${targetChannels.length} channels...`);

    await verifierService.verifyChannels(targetChannels, concurrency, (prog) => {
      for (const country of this.countries.values()) {
        const countryChans = this.channelsByCountry.get(country.code) || [];
        country.workingCount = countryChans.filter((c) => c.isWorking).length;
      }
    });

    this.saveChannels();
    return verifierService.getStatus();
  }
}

export const dataService = new DataService();
