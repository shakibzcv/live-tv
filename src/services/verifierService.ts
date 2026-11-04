import http from 'http';
import https from 'https';
import { URL } from 'url';
import { Channel } from '../types';
import logger from '../logger/winston.logger';

export interface VerificationProgress {
  isRunning: boolean;
  total: number;
  checked: number;
  working: number;
  failed: number;
  percent: number;
  startedAt?: number;
  completedAt?: number;
}

export class VerifierService {
  private status: VerificationProgress = {
    isRunning: false,
    total: 0,
    checked: 0,
    working: 0,
    failed: 0,
    percent: 0,
  };

  /**
   * Verifies if an IPTV stream URL is reachable and delivering valid stream data.
   * Uses a fast HEAD request first, falling back to a partial GET sniff for HLS/MPEG-TS.
   */
  public async checkStreamUrl(rawUrl: string, timeoutMs = 6000): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (ok: boolean) => {
        if (!settled) {
          settled = true;
          resolve(ok);
        }
      };

      let parsed: URL;
      try {
        parsed = new URL(rawUrl);
      } catch {
        return finish(false);
      }

      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const baseOpts: https.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 LiveTV/1.0',
          'Accept': '*/*',
        },
      };

      // Fallback: Partial GET sniff to detect #EXTM3U or MPEG-TS sync byte 0x47
      const fallbackGet = () => {
        const getReq = client.request({ ...baseOpts, method: 'GET' }, (res) => {
          const code = res.statusCode ?? 0;
          if (code >= 200 && code < 400) {
            let buffer = Buffer.alloc(0);
            res.on('data', (chunk: Buffer) => {
              buffer = Buffer.concat([buffer, chunk]);
              if (buffer.length > 512) {
                res.destroy();
                const text = buffer.toString('utf8');
                const isHls = text.includes('#EXTM3U');
                const isTs = buffer.length > 0 && buffer[0] === 0x47;
                finish(isHls || isTs || code === 200);
              }
            });
            res.on('end', () => {
              const text = buffer.toString('utf8');
              finish(text.includes('#EXTM3U') || (buffer.length > 0 && buffer[0] === 0x47) || code === 200);
            });
          } else {
            res.destroy();
            finish(false);
          }
        });

        getReq.on('error', () => finish(false));
        getReq.on('timeout', () => { getReq.destroy(); finish(false); });
        getReq.setTimeout(timeoutMs);
        getReq.end();
      };

      // Primary: Fast HEAD request
      const headReq = client.request({ ...baseOpts, method: 'HEAD' }, (res) => {
        const code = res.statusCode ?? 0;
        headReq.destroy();
        if (code === 405 || code === 501 || code === 0) return fallbackGet();
        if (code >= 200 && code < 400) return finish(true);
        fallbackGet();
      });

      headReq.on('error', () => fallbackGet());
      headReq.on('timeout', () => { headReq.destroy(); finish(false); });
      headReq.setTimeout(timeoutMs);
      headReq.end();
    });
  }

  /**
   * Run concurrent verification across a set of channels.
   */
  public async verifyChannels(
    channels: Channel[],
    concurrency = 15,
    onProgress?: (progress: VerificationProgress) => void
  ): Promise<Map<string, boolean>> {
    if (this.status.isRunning) {
      logger.warn('[VerifierService] Verification already in progress.');
      return new Map();
    }

    this.status = {
      isRunning: true,
      total: channels.length,
      checked: 0,
      working: 0,
      failed: 0,
      percent: 0,
      startedAt: Date.now(),
    };

    const results = new Map<string, boolean>();
    let currentIndex = 0;

    const worker = async () => {
      while (currentIndex < channels.length) {
        const index = currentIndex++;
        const channel = channels[index];
        if (!channel) continue;

        try {
          const isAlive = await this.checkStreamUrl(channel.streamUrl, 5000);
          results.set(channel.id, isAlive);
          channel.isWorking = isAlive;
          channel.lastChecked = Date.now();

          if (isAlive) {
            this.status.working++;
          } else {
            this.status.failed++;
          }
        } catch {
          results.set(channel.id, false);
          channel.isWorking = false;
          channel.lastChecked = Date.now();
          this.status.failed++;
        }

        this.status.checked++;
        this.status.percent = Math.round((this.status.checked / this.status.total) * 100);

        if (onProgress && this.status.checked % 5 === 0) {
          onProgress(this.status);
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, channels.length) }, () => worker());
    await Promise.all(workers);

    this.status.isRunning = false;
    this.status.completedAt = Date.now();
    if (onProgress) onProgress(this.status);

    logger.info(`[VerifierService] Completed: ${this.status.working} working / ${this.status.failed} failed of ${this.status.total} total.`);
    return results;
  }

  public getStatus(): VerificationProgress {
    return { ...this.status };
  }
}

export const verifierService = new VerifierService();
