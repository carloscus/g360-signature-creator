export interface FormData {
  name: string;
  position: string;
  email: string;
  phone: string;
  extension: string;
  mobile: string;
  mobile2: string;
  enableWhatsApp: boolean;
  enableWhatsApp2: boolean;
  enableTelegram: boolean;
  address: string;
  addressMapUrl: string;
  facebook: string;
  showFacebook: boolean;
  instagram: string;
  showInstagram: boolean;
  youtube: string;
  showYoutube: boolean;
  tiktok: string;
  showTiktok: boolean;
  linkedin: string;
  showLinkedin: boolean;
  lineColor: string;
  lineWidth: number;
  logoType: LogoType;
  logoColor: string;
  socialIconColor: SocialIconColor;
  bannerLink: string;
  bannerAlt: string;
  enableDigitalSignature: boolean;
  digitalSignatureUrl: string;
  logo: string | null;
}

export type LogoType = 'logo1' | 'logo2' | 'none' | 'upload';
export type SocialIconColor = 'original' | 'mono' | 'blue' | 'red' | 'green' | 'outline';
export type SignatureType = 'full' | 'medium' | 'short' | 'minimal';
export type MessageType = 'success' | 'error' | 'info';

export interface AppConfig {
  bannerImage: string;
  defaultLineColor: string;
  base64Images: Record<string, string>;
  baseSvgCache: Record<string, string>;
}

export interface StatusMessage {
  text: string;
  type: MessageType;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const DEFAULT_FORM_DATA: FormData = {
  name: '',
  position: '',
  email: '',
  phone: '',
  extension: '',
  mobile: '',
  mobile2: '',
  enableWhatsApp: false,
  enableWhatsApp2: false,
  enableTelegram: false,
  address: 'Av. Los Frutales 419. Urb. El Artesano Ate. Lima – Perú',
  addressMapUrl: 'https://maps.app.goo.gl/5gHmxXAgRGwDr5jk6',
  facebook: 'https://es-la.facebook.com/vinifan/',
  showFacebook: true,
  instagram: 'https://www.instagram.com/vinifanperu/?hl=es-la',
  showInstagram: true,
  youtube: 'https://www.youtube.com/channel/UC1c_boc4GF8fVC0bHGFNqqQ',
  showYoutube: true,
  tiktok: 'https://www.tiktok.com/@vinifanperu',
  showTiktok: true,
  linkedin: 'https://www.linkedin.com/company/corporacion-de-industrias-plasticas-sa-cipsa-/',
  showLinkedin: true,
  lineColor: '#003366',
  lineWidth: 4,
  logoType: 'logo1',
  logoColor: '#e22721',
  socialIconColor: 'original',
  bannerLink: '',
  bannerAlt: '',
  enableDigitalSignature: false,
  digitalSignatureUrl: '',
  logo: null,
};