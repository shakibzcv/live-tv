export interface Channel {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
  resolution: string;
  country: string;
  streamUrl: string;
  isWorking?: boolean;
  lastChecked?: number;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  flagCode?: string;
  channelCount: number;
  workingCount: number;
  epgUrl: string;
  m3uUrl: string;
}

export interface EpgProgramme {
  channelId: string;
  title: string;
  desc?: string;
  start: Date;
  stop: Date;
  progressPercent: number;
}

export interface ChannelEpgData {
  hasEpg: boolean;
  source: string;
  nowPlaying?: {
    title: string;
    desc: string;
    startTimeStr: string;
    stopTimeStr: string;
    progress: number;
    remainingMins: number;
    category?: string;
  };
  nextUp?: EpgProgramme;
  upcoming?: Array<{
    title: string;
    desc: string;
    startTimeStr: string;
    stopTimeStr: string;
  }>;
  schedules?: EpgProgramme[];
}
