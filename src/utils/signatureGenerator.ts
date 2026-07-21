import { FormData, SignatureType, AppConfig, SocialIconColor } from '../types';
import { sanitize } from './validation';

const S = {
  contactRow: `margin: 3px 0; color: #333333; font-size: 9pt; font-family: Arial, Helvetica, sans-serif;`,
  contactIcon: `width="16" height="16" style="margin-right: 5px; vertical-align: middle;"`,
  link: `color: #333333; text-decoration: none;`,
  socialIcon: `width="20" height="20" alt="{alt}" style="display: inline-block; vertical-align: middle;"`,
  socialWrap: `display: inline-block; margin-right: 4px; text-decoration: none; vertical-align: middle;`,
  socialRow: `margin: 0; padding: 0; font-size: 0; line-height: 0; white-space: nowrap;`,
  banner: `display: block; border: none; outline: none; text-decoration: none; width: 100%; max-width: 450px; height: auto; margin: 12px auto 0;`
};

// Bandera de Perú: SVG inline, funciona en Gmail, Apple Mail, Yahoo, web Outlook
const PERU_FLAG_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12" viewBox="0 0 18 12"><rect width="6" height="12" fill="#D91023"/><rect x="6" width="6" height="12" fill="#FFFFFF"/><rect x="12" width="6" height="12" fill="#D91023"/></svg>';
let peruFlagCache: string | null = null;

// Paleta de colores monocromáticos para iconos sociales
const ICON_COLORS: Record<Exclude<SocialIconColor, 'original' | 'outline'>, string> = {
  blue: '#0066cc',
  red: '#e22721',
  green: '#1e8e3e',
  mono: '#6b7280'
};

// Colores de marca para el modo "original"
const BRAND_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#000000',
  linkedin: '#0A66C2',
  whatsapp: '#25D366',
  telegram: '#229ED9'
};

// Aplica color a un SVG reemplazando fills, strokes y, si no tiene fill,
// inyectándolo en la etiqueta <svg> para que sea monocromático.
function applyColorToSVG(svgText: string, color: string): string {
  let result = svgText
    .replace(/(fill=")(#[0-9A-Fa-f]{3,6}|currentColor)(")/g, `$1${color}$3`)
    .replace(/(stroke=")(#[0-9A-Fa-f]{3,6}|currentColor)(")/g, `$1${color}$3`);

  if (!/fill=/.test(result)) {
    result = result.replace(/<svg(\s[^>]*)?>/, `<svg$1 fill="${color}">`);
  }

  return result;
}

export async function getIconBase64(
  iconName: string,
  colorMode: SocialIconColor,
  config: AppConfig,
  cache: Record<string, string>
): Promise<string> {
  const cacheKey = `${iconName}-${colorMode}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // Definir nombre de archivo SVG según modo
  let svgFileName = iconName;
  if (colorMode === 'outline') {
    // Para icons específicos que tienen versión outline
    const outlineSupported = ['facebook', 'instagram', 'youtube', 'tiktok', 'linkedin', 'whatsapp', 'telegram'];
    if (outlineSupported.includes(iconName)) {
      svgFileName = `${iconName}_outline`;
    }
    // Para icons como email_icon, phone_icon, mobile_icon usamos los originales
  }

  // Obtener SVG base desde cache o fetch
  let svgText: string;
  if (config.baseSvgCache && config.baseSvgCache[svgFileName]) {
    svgText = config.baseSvgCache[svgFileName];
  } else {
    try {
      const response = await fetch(`images/${svgFileName}.svg`);
      if (!response.ok) throw new Error(`Icon not found: ${svgFileName}.svg`);
      svgText = await response.text();
    } catch (err) {
      console.error(`[getIconBase64] Error loading base icon ${svgFileName}:`, err);
      // Fallback: usar icono original si existe
      if (config.base64Images[iconName]) {
        return config.base64Images[iconName];
      }
      return `images/${iconName}.svg`;
    }
  }

  // Determinar color a aplicar
  let targetColor: string | null = null;
  if (colorMode === 'original') {
    targetColor = BRAND_COLORS[iconName] || null;
  } else if (colorMode === 'outline') {
    // Iconos outline usan currentColor, aplicamos gris oscuro por defecto
    targetColor = '#374151';
  } else {
    targetColor = ICON_COLORS[colorMode];
  }

  // Aplicar color monocromático si corresponde
  if (targetColor) {
    svgText = applyColorToSVG(svgText, targetColor);
  }

  // Convertir a SVG data URI (más confiable que PNG canvas para email clients)
  // SVG se renderiza nativamente en la mayoría de clientes de email modernos
  const toSvgDataUri = (svg: string): string => {
    // Limpiar el SVG de declarations que puedan causar problemas
    let cleanSvg = svg
      .replace(/^<\?xml[^>]*\?>\s*/i, '')
      .replace(/<!DOCTYPE[^>]*>/i, '')
      .replace(/\s*<!--[\s\S]*?-->/g, '')
      .replace(/\s*<title>[\s\S]*?<\/title>/gi, '');
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg).replace(/'/g, '%27')}`;
  };

  try {
    const svgDataUri = toSvgDataUri(svgText);
    cache[cacheKey] = svgDataUri;
    return svgDataUri;
  } catch (err) {
    console.error(`[getIconBase64] Error creating SVG data URI for ${iconName}:`, err);
    // Último recurso: PNG canvas (puede fallar en algunos clientes)
    try {
      const base64 = await svgToPngBase64(svgText, 20, 20);
      return base64 || toSvgDataUri(svgText);
    } catch {
      return toSvgDataUri(svgText);
    }
  }
}

export async function svgToPngBase64(svgString: string, width = 90, height = 90): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/png', 0.8);
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };

    img.src = url;
  });
}

export async function getFileAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const compressedBase64 = canvas.toDataURL('image/png', 0.8);
        resolve(compressedBase64);
      };
      img.onerror = () => resolve(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function fileToBase64(file: File, maxWidth = 90, maxHeight = 90): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const quality = file.type === 'image/jpeg' || file.type === 'image/jpg' ? 0.7 : 0.8;
        resolve(canvas.toDataURL(file.type, quality));
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getFormData(formData: FormData): FormData {
  return {
    name: sanitize(formData.name?.trim() || ''),
    position: sanitize(formData.position?.trim() || ''),
    email: sanitize(formData.email?.trim() || ''),
    phone: sanitize(formData.phone?.trim() || ''),
    extension: sanitize(formData.extension?.trim() || ''),
    mobile: sanitize(formData.mobile?.trim() || ''),
    mobile2: sanitize(formData.mobile2?.trim() || ''),
    addWhatsapp: !!formData.addWhatsapp,
    addWhatsapp2: !!formData.addWhatsapp2,
    addTelegram: !!formData.addTelegram,
    address: sanitize(formData.address?.trim() || ''),
    addressMapUrl: sanitize(formData.addressMapUrl?.trim() || ''),
    facebook: sanitize(formData.facebook?.trim() || ''),
    showFacebook: !!formData.showFacebook,
    instagram: sanitize(formData.instagram?.trim() || ''),
    showInstagram: !!formData.showInstagram,
    youtube: sanitize(formData.youtube?.trim() || ''),
    showYoutube: !!formData.showYoutube,
    tiktok: sanitize(formData.tiktok?.trim() || ''),
    showTiktok: !!formData.showTiktok,
    linkedin: sanitize(formData.linkedin?.trim() || ''),
    showLinkedin: !!formData.showLinkedin,
    lineColor: formData.lineColor || '#003366',
    lineWidth: formData.lineWidth || 4,
    logoType: formData.logoType || 'logo1',
    logoColor: formData.logoColor || '#e22721',
    socialIconColor: formData.socialIconColor || 'original',
    bannerLink: sanitize(formData.bannerLink?.trim() || ''),
    bannerAlt: sanitize(formData.bannerAlt?.trim() || ''),
    enableDigitalSignature: !!formData.enableDigitalSignature,
    digitalSignatureUrl: sanitize(formData.digitalSignatureUrl?.trim() || ''),
    logo: formData.logo || null,
  };
}

const getIconBaseName = (name: string): string => {
  switch (name) {
    case 'email': return 'email_icon';
    case 'phone': return 'phone_icon';
    case 'mobile': return 'mobile_icon';
    default: return name;
  }
};

async function generatePhoneHTML(
  phone: string,
  extension: string,
  fields: FormData,
  config: AppConfig,
  iconCache: Record<string, string>
): Promise<string> {
  if (!phone) return '';

  const iconSrc = await getIconBase64('phone_icon', fields.socialIconColor, config, iconCache);
  const cleanPhone = phone.replace(/\D/g, '');
  const cleanExt = extension.replace(/\D/g, '');
  const telHref = `tel:+51${cleanPhone}${cleanExt ? `,,${cleanExt}` : ''}`;
  const extPart = extension ? ` <span style="color: #666666; font-size: 9pt;">ext. ${extension}</span>` : '';

  return `
    <p style="${S.contactRow}">
      <img src="${iconSrc}" ${S.contactIcon}>
      <a href="${telHref}" style="${S.link}" title="Llamar a ${phone}" aria-label="Llamar al teléfono ${phone}">${phone}</a>${extPart}
    </p>`;
}

async function generateMobileHTML(
  mobile: string,
  addWhatsapp: boolean,
  addTelegram: boolean,
  name: string,
  config: AppConfig,
  fields: FormData,
  iconCache: Record<string, string>
): Promise<string> {
  if (!mobile) return '';

  let digits = mobile.replace(/\D/g, '');
  if (digits.startsWith('51') && digits.length >= 11) digits = digits.slice(2);
  const intl = `51${digits}`;

  const telLink = `tel:+${intl}`;
  const waLink = `https://wa.me/${intl}?text=${encodeURIComponent('Hola, soy ' + name)}`;
  const tgLink = `https://t.me/+${intl}`;

  let sideIcons = '';
  if (addWhatsapp) {
    const waIcon = await getIconBase64('whatsapp', fields.socialIconColor, config, iconCache);
    sideIcons += `<a href="${waLink}" target="_blank" rel="noopener noreferrer" title="WhatsApp" style="text-decoration: none; margin-left: 6px;"><img src="${waIcon}" width="14" height="14" alt="WhatsApp" style="vertical-align: middle;"></a>`;
  }
  if (addTelegram) {
    const tgIcon = await getIconBase64('telegram', fields.socialIconColor, config, iconCache);
    sideIcons += `<a href="${tgLink}" target="_blank" rel="noopener noreferrer" title="Telegram" style="text-decoration: none; margin-left: 6px;"><img src="${tgIcon}" width="14" height="14" alt="Telegram" style="vertical-align: middle;"></a>`;
  }

  const mobileIconSrc = await getIconBase64('mobile_icon', fields.socialIconColor, config, iconCache);

  return `
    <p style="${S.contactRow}">
      <img src="${mobileIconSrc}" ${S.contactIcon}>
      <a href="${telLink}" style="${S.link}" title="Llamar a ${mobile}" aria-label="Llamar al móvil ${mobile}">${mobile}</a>${sideIcons}
    </p>`;
}
async function generateSocialHTML(
  fields: FormData,
  type: SignatureType,
  config: AppConfig,
  iconCache: Record<string, string>
): Promise<string> {
  const socials: string[] = [];

  const socialConfigs = [
    { key: 'facebook', url: fields.facebook, show: fields.showFacebook },
    { key: 'instagram', url: fields.instagram, show: fields.showInstagram },
    { key: 'youtube', url: fields.youtube, show: fields.showYoutube },
    { key: 'tiktok', url: fields.tiktok, show: fields.showTiktok },
    { key: 'linkedin', url: fields.linkedin, show: fields.showLinkedin }
  ];

  for (const sc of socialConfigs) {
    let url = sc.url;
    if (url && sc.show) {
      url = sc.key === 'instagram' || sc.key === 'facebook'
        ? `https://${sc.key}.com/${url.replace(/^@/, '')}`
        : url.startsWith('http') ? url : `https://${url}`;
    } else {
      continue;
    }

    const iconSrc = await getIconBase64(sc.key, fields.socialIconColor, config, iconCache);

    socials.push(`
      <a href="${url}" style="${S.socialWrap}">
        <img src="${iconSrc}" ${S.socialIcon.replace('{alt}', sc.key)}>
      </a>`);
  }

  if (socials.length === 0 || type === 'short' || type === 'minimal') return '';

  return `
    <tr>
       <td colspan="2" style="padding-top: 8px; white-space: nowrap; width: 100%;">
         <div style="margin: 0; padding: 0; font-size: 0; line-height: 0; white-space: nowrap; display: inline-block;">
           ${socials.join('')}
         </div>
       </td>
    </tr>`;
}

function generateBannerHTML(type: SignatureType, hasLogo: boolean, config: AppConfig, fields: FormData): string {
  if (type !== 'full') return '';

  const bannerSrc = fields.bannerLink && fields.bannerLink.trim()
    ? `<a href="${fields.bannerLink.trim()}" target="_blank" rel="noopener noreferrer"><img src="${config.base64Images.bannerImage || 'images/baner_lineas.png'}" alt="${fields.bannerAlt || 'Banner'}" style="${S.banner}"></a>`
    : `<img src="${config.base64Images.bannerImage || 'images/baner_lineas.png'}" alt="${fields.bannerAlt || 'Banner'}" style="${S.banner}">`;

  const cols = hasLogo ? 2 : 1;

  return `
    <tr>
      <td colspan="${cols}" style="background-color: transparent; max-width: 420px; width: 100%;">
        ${bannerSrc}
      </td>
    </tr>`;
}

async function generateEcoHTML(type: SignatureType, hasLogo: boolean, config: AppConfig): Promise<string> {
  const paddingTop = type === 'short' ? '8px' : '4px';
  const cols = hasLogo ? 2 : 1;
  const ecoSrc = config.base64Images.eco || 'images/eco.png';
  if (!peruFlagCache) {
    peruFlagCache = await svgToPngBase64(PERU_FLAG_SVG, 18, 12);
  }
  const peruFlag = peruFlagCache;

  return `
  <tr>
      <td colspan="${cols}" style="background-color: transparent; padding-top: ${paddingTop};">
          <p style="margin: 0; font-size: 8pt; font-style: italic; color: #0b7935; background-color: transparent; text-align: left; line-height: 1.2;">
              <img src="${peruFlag}" alt="Perú" width="18" height="12" style="vertical-align: middle; border: none; outline: none; text-decoration: none;">
              &nbsp;Antes de imprimir, piensa en el medio ambiente&nbsp;
              <img src="${ecoSrc}" alt="Eco" width="16" height="16" style="vertical-align: middle; border: none; outline: none; text-decoration: none;">
          </p>
      </td>
  </tr>
  `;
}

export async function generateSignature(
  type: SignatureType,
  formData: FormData,
  config: AppConfig,
  iconCache: Record<string, string>
): Promise<string> {
  const fields = getFormData(formData);

  const wrapIfNeeded = (inner: string) => {
    if (fields.enableDigitalSignature) {
      const href = fields.digitalSignatureUrl && fields.digitalSignatureUrl.trim()
        ? fields.digitalSignatureUrl.trim()
        : 'https://www.cipsa.com.pe/';
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="Abrir sitio" title="Abrir sitio">${inner}</a>`;
    }
    return inner;
  };

  let logoHTML = '';
  const logoWidth = 120;
  const isMinimal = type === 'minimal';

  if (!isMinimal) {
    // Solo generar logo si no es modo minimal
    if (fields.logoType === 'logo1' || fields.logoType === 'logo2') {
      const cacheKey = `${fields.logoType}-${fields.logoColor}`;
      let logoBase64 = iconCache[cacheKey];

      if (!logoBase64) {
        try {
          const fileName = fields.logoType === 'logo1' ? 'logo1.svg' : 'logo2.svg';
          const resp = await fetch(`images/${fileName}`);
          let svgText = await resp.text();

          if (fields.logoType === 'logo1') {
            svgText = svgText.replace(/fill="[^"]*"/g, `fill="${fields.logoColor}"`);
          } else {
            svgText = svgText.replace(/stroke="[^"]*"/g, `stroke="${fields.logoColor}"`);
          }

          if (!/width=/.test(svgText)) {
            svgText = svgText.replace(/<svg/, `<svg width="${logoWidth}" height="${logoWidth}"`);
          }

          logoBase64 = await svgToPngBase64(svgText, logoWidth, logoWidth);
          iconCache[cacheKey] = logoBase64;
        } catch (err) {
          console.error('[SignatureGenerator] Error al cargar SVG:', err);
        }
      }

      if (logoBase64) {
        const inner = `<img src="${logoBase64}" alt="Logo" width="${logoWidth}" height="${logoWidth}" style="display: block; border: none; outline: none; text-decoration: none; max-width: ${logoWidth}px; width: ${logoWidth}px; height: ${logoWidth}px; margin: 0 auto;">`;
        logoHTML = `<td class="logo-cell" width="${logoWidth}" valign="middle" style="text-align: center; vertical-align: middle;">${wrapIfNeeded(inner)}</td>`;
      }
    } else if (fields.logoType === 'upload' && fields.logo) {
      const inner = `<img src="${fields.logo}" alt="Logo" width="${logoWidth}" height="${logoWidth}" style="display: block; border: none; outline: none; text-decoration: none; max-width: ${logoWidth}px; width: ${logoWidth}px; height: ${logoWidth}px; margin: 0 auto;">`;
      logoHTML = `<td class="logo-cell" width="${logoWidth}" valign="middle" style="text-align: center; vertical-align: middle;">${wrapIfNeeded(inner)}</td>`;
    }
  }

  // Generar contenido de forma paralela
  const [phoneHTML, mobileHTML, mobile2HTML, socialHTML] = await Promise.all([
    generatePhoneHTML(fields.phone, fields.extension, fields, config, iconCache),
    generateMobileHTML(fields.mobile, fields.addWhatsapp, fields.addTelegram, fields.name, config, fields, iconCache),
    generateMobileHTML(fields.mobile2, fields.addWhatsapp2, false, fields.name, config, fields, iconCache),
    generateSocialHTML(fields, type, config, iconCache)
  ]);

  const bannerHTML = generateBannerHTML(type, !!logoHTML, config, fields);
  const ecoHTML = await generateEcoHTML(type, !!logoHTML, config);

  // Email icon
  const emailIconSrc = await getIconBase64('email_icon', fields.socialIconColor, config, iconCache);
  const emailHTML = fields.email
    ? `
    <p style="${S.contactRow}">
      <img src="${emailIconSrc}" ${S.contactIcon}>
      <a href="mailto:${fields.email}" style="${S.link}">${fields.email}</a>
    </p>`
    : '';

  // Línea de dirección/ubicación (dato de contacto, no red social)
  const locationIconSrc = await getIconBase64('ubicacion', fields.socialIconColor, config, iconCache);
  const locationHTML = fields.address
    ? `
    <p style="${S.contactRow}">
      <img src="${locationIconSrc}" ${S.contactIcon}>
      <a href="${fields.addressMapUrl || 'https://maps.app.goo.gl/5gHmxXAgRGwDr5jk6'}" target="_blank" rel="noopener noreferrer" style="${S.link}">${fields.address.replace(/\n/g, '<br>')}</a>
    </p>`
    : '';

const cols = logoHTML ? 2 : 1;
  const infoCellStyle = logoHTML
    ? `border-left: ${fields.lineWidth}px solid ${fields.lineColor}; padding-left: 15px; vertical-align: middle;`
    : `padding-left: 0; vertical-align: middle;`;

  return `
    <div class="signature-wrapper">
      <table width="auto" cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background-color: transparent; font-family: Arial, Helvetica, sans-serif; max-width: ${isMinimal ? '320' : '450'}px; width: auto;">
        <tr class="signature-main-row">
          ${logoHTML}
          <td class="signature-info-cell" style="${infoCellStyle}">
             <p style="margin: 0 0 4px; color: #333333; font-size: 12pt; font-weight: bold; background-color: transparent;">${fields.name}</p>
             <p style="margin: 0 0 8px; color: #666666; font-size: 10pt; background-color: transparent;">${fields.position}</p>
               ${phoneHTML}
               ${emailHTML}
               ${mobileHTML}
               ${mobile2HTML}
               ${locationHTML}
           </td>
        </tr>
        ${socialHTML}
        ${bannerHTML}
        ${ecoHTML}
      </table>
    </div>
  `;
}