export interface CustomParameter {
  id: string;
  key: string;
  value: string;
}

export interface CampaignPreset {
  id: string;
  name: string;
  baseUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  utmId: string;
  customParams: CustomParameter[];
  createdAt: string;
}

export interface UTMTemplate {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  utmId?: string;
  customParams?: { key: string; value: string }[];
}

export interface HistoryLog {
  id: string;
  campaignName: string;
  baseUrl: string;
  fullUrl: string;
  shortUrl: string;
  shortenerService: "none" | "bitly" | "rebrandly" | "tinyurl" | "dub";
  createdAt: string;
}

export interface ShortenerSettings {
  bitlyToken: string;
  rebrandlyKey: string;
  tinyurlToken: string;
  dubToken: string;
  bitlyDomain: string;
  rebrandlyDomain: string;
  tinyurlDomain: string;
  dubDomain: string;
}
