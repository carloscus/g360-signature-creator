const S = {
  contactRow: `margin: 5px 0 3px; color: #333333; font-size: 9pt; background-color: transparent; display: flex; align-items: center;`,
  contactIcon: `width="14" height="14" style="margin-right: 5px; vertical-align: middle;"`,
  link: `color: #333333; text-decoration: none;`,
  socialIcon: `width="20" height="20" alt="{alt}" style="vertical-align: middle; border: none; outline: none; text-decoration: none;"`,
  socialWrap: `text-decoration: none; margin-right: 5px; display: inline-block;`,
  banner: `display: block; border: none; outline: none; text-decoration: none; max-width: 100%; height: auto; margin-top: 8px;`
};

export function getFormValues() {
  return {
    name: sanitize(document.getElementById("name").value.trim()),
    position: sanitize(document.getElementById("position").value.trim()),
    email: sanitize(document.getElementById("email").value.trim()),
    phone: sanitize(document.getElementById("phone").value.trim()),
    extension: sanitize(document.getElementById("extension").value.trim()),
    mobile: sanitize(document.getElementById("mobile").value.trim()),
    mobile2: sanitize(document.getElementById("mobile2").value.trim()),
    addWhatsapp: document.getElementById("add-whatsapp").checked,
    addWhatsapp2: document.getElementById("add-whatsapp2").checked,
    addTelegram: document.getElementById("add-telegram").checked,
    facebook: sanitize(document.getElementById("facebook").value.trim()),
    instagram: sanitize(document.getElementById("instagram").value.trim()),
    youtube: sanitize(document.getElementById("youtube").value.trim()),
    tiktok: sanitize(document.getElementById("tiktok").value.trim()),
    lineColor: document.getElementById("line-color").value,
    lineWidth: parseInt(document.getElementById("line-width").value),
    logoType: document.getElementById("logo-type").value,
    logoColor: document.getElementById("logo-color").value,
    socialIconColor: document.getElementById("social-icon-color").value,
    bannerLink: sanitize(document.getElementById("banner-link").value.trim()),
    bannerAlt: sanitize(document.getElementById("banner-alt").value.trim()),
    enableDigitalSignature: document.getElementById("enable-digital-signature").checked,
    digitalSignatureUrl: sanitize(document.getElementById("digital-signature-url").value.trim()),
    logo: "images/logo_cip.png"
  };
}

export async function generateLogoHTML(logo, config, fields) {
  const logoWidth = 90;
  const wrapIfNeeded = (inner) => {
    if (fields.enableDigitalSignature) {
      const href = fields.digitalSignatureUrl && fields.digitalSignatureUrl.trim() ? fields.digitalSignatureUrl.trim() : "https://www.cipsa.com.pe/";
      return `<a href="${href}" target="_blank" rel="noopener" aria-label="Abrir sitio" title="Abrir sitio">${inner}</a>`;
    }
    return inner;
  };

  if (logo && logo !== config.defaultLogo && fields.logoType === 'upload') {
    const inner = `<img src="${logo}" alt="Logo" width="${logoWidth}" height="auto" style="display: block; border: none; outline: none; text-decoration: none; max-width: ${logoWidth}px; width: ${logoWidth}px; height: auto; margin: 0 auto;">`;
    return `<td class="logo-cell" width="${logoWidth}" valign="middle" style="text-align: center; vertical-align: middle;">${wrapIfNeeded(inner)}</td>`;
  }

  if (fields.logoType === 'logo1' || fields.logoType === 'logo2') {
    const { svgToPngBase64 } = await import('./utils.js');
    const fileName = fields.logoType === 'logo1' ? 'logo1.svg' : 'logo2.svg';
    const resp = await fetch(`images/${fileName}`);
    let svgText = await resp.text();

    if (fields.logoType === 'logo1') {
      svgText = svgText.replace(/fill="[^"]*"/, `fill="${fields.logoColor}"`);
    } else {
      svgText = svgText.replace(/stroke="[^"]*"/g, `stroke="${fields.logoColor}"`);
    }

    const pngBase64 = await svgToPngBase64(svgText);
    const inner = `<img src="${pngBase64}" alt="Logo" width="${logoWidth}" height="auto" style="display: block; border: none; outline: none; text-decoration: none; max-width: ${logoWidth}px; width: ${logoWidth}px; height: auto; margin: 0 auto;">`;
    return `<td class="logo-cell" width="${logoWidth}" valign="middle" style="text-align: center; vertical-align: middle;">${wrapIfNeeded(inner)}</td>`;
  }

  if (fields.logoType === 'none') {
    return '';
  }

  const inner = `<img src="${config.base64Images.defaultLogo}" alt="Logo" width="${logoWidth}" height="auto" style="display: block; border: none; outline: none; text-decoration: none; max-width: ${logoWidth}px; width: ${logoWidth}px; height: auto; margin: 0 auto;">`;
  return `<td class="logo-cell" width="${logoWidth}" valign="middle" style="text-align: center; vertical-align: middle;">${wrapIfNeeded(inner)}</td>`;
}

function getIconKey(baseKey, color) {
  if (color === "original") return baseKey;
  return `${baseKey}_${color}`;
}

export function generatePhoneHTML(phone, extension, fields, config) {
  if (!phone) return "";
  const formattedPhoneDisplay = `(01)${phone}`;
  let linkValue = `01${phone}`;
  let displayText = formattedPhoneDisplay;

  if (extension) {
    linkValue += `;${extension}`;
    displayText += ` ext. ${extension}`;
  }

  const iconKey = getIconKey("phone_icon", fields.socialIconColor);
  const iconSrc = config.base64Images[iconKey] || config.base64Images.phone_icon;

  return `
    <p style="${S.contactRow}">
      <img src="${iconSrc}" ${S.contactIcon}>
      <a href="tel:${linkValue}" style="${S.link}">${displayText}</a>
    </p>`;
}

export function generateMobileHTML(mobile, addWhatsapp, addTelegram, name, config, fields) {
  if (!mobile) return "";

  const cleanMobile = mobile.replace(/\D/g, "");
  const waLink = `https://api.whatsapp.com/send?phone=+51${cleanMobile}&text=Hola,%20soy%20${encodeURIComponent(name)}.%20Me%20gustaría%20solicitar%20informes%20sobre%20sus%20productos%20y%20servicios.`;
  const tgLink = `https://t.me/+51${cleanMobile}?text=Hola,%20soy%20${encodeURIComponent(name)}.%20Me%20gustaría%20solicitar%20informes%20sobre%20sus%20productos%20y%20servicios.`;
  const telLink = `tel:+51${cleanMobile}`;

  let mainIconKey, mainIconSrc, mainLink, extraIcons;

  if (addWhatsapp && addTelegram) {
    mainIconKey = getIconKey("whatsapp", fields.socialIconColor);
    mainIconSrc = config.base64Images[mainIconKey] || config.base64Images.whatsapp;
    mainLink = waLink;

    const tgIconKey = getIconKey("telegram", fields.socialIconColor);
    const tgIconSrc = config.base64Images[tgIconKey] || config.base64Images.telegram;
    extraIcons = `<a href="${tgLink}" target="_blank" rel="noopener" style="text-decoration: none; margin-left: 5px;"><img src="${tgIconSrc}" ${S.contactIcon.replace('14', '14').replace('margin-right', 'margin-left')} alt="Telegram"></a>`;
  } else if (addWhatsapp) {
    mainIconKey = getIconKey("whatsapp", fields.socialIconColor);
    mainIconSrc = config.base64Images[mainIconKey] || config.base64Images.whatsapp;
    mainLink = waLink;
    extraIcons = "";
  } else if (addTelegram) {
    mainIconKey = getIconKey("telegram", fields.socialIconColor);
    mainIconSrc = config.base64Images[mainIconKey] || config.base64Images.telegram;
    mainLink = tgLink;
    extraIcons = "";
  } else {
    mainIconKey = getIconKey("mobile_icon", fields.socialIconColor);
    mainIconSrc = config.base64Images[mainIconKey] || config.base64Images.mobile_icon;
    mainLink = telLink;
    extraIcons = "";
  }

  return `
    <p style="${S.contactRow}">
      <img src="${mainIconSrc}" ${S.contactIcon}>
      <a href="${mainLink}" target="_blank" style="${S.link}">${mobile}</a>
      ${extraIcons}
    </p>`;
}

export function generateSocialHTML(fields, type, config) {
  if (type !== "full" && type !== "medium") return "";
  const socialLinks = [
    { href: "https://maps.app.goo.gl/5gHmxXAgRGwDr5jk6", imgKey: "ubicacion", alt: "Ubicación" },
    { href: fields.facebook, imgKey: "facebook", alt: "Facebook" },
    { href: fields.instagram, imgKey: "instagram", alt: "Instagram" },
    { href: fields.youtube, imgKey: "youtube", alt: "YouTube" },
    { href: fields.tiktok, imgKey: "tiktok", alt: "TikTok" }
  ];

  const socialIcons = socialLinks
    .filter(link => link.href)
    .map(link => {
      let imgKey = link.imgKey;
      if (fields.socialIconColor !== "original") {
        imgKey = `${link.imgKey}_${fields.socialIconColor}`;
      }
      const iconSrc = config.base64Images[imgKey] || config.base64Images[link.imgKey];
      return `<a href="${link.href}" target="_blank" rel="noopener" style="${S.socialWrap}"><img src="${iconSrc}" ${S.socialIcon.replace('{alt}', link.alt)}></a>`;
    })
    .join("");

  return `
        <tr>
            <td colspan="${fields.logo ? 2 : 1}" style="padding: 6px 0; background-color: transparent;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: transparent;">
                    <tr>
                        <td style="text-align: left; background-color: transparent;">
                            ${socialIcons}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    `;
}

export function generateBannerHTML(type, logo, config, fields) {
  if (type !== "full") return "";
  const bannerSrc = fields.banner || config.base64Images.bannerImage;
  const altText = fields.bannerAlt && fields.bannerAlt.trim() ? fields.bannerAlt.trim() : 'Banner';

  const imgTag = `<img src="${bannerSrc}" alt="${altText}" width="300" style="${S.banner}">`;

  const content = fields.bannerLink && fields.bannerLink.trim()
    ? `<a href="${fields.bannerLink.trim()}" target="_blank" rel="noopener">${imgTag}</a>`
    : imgTag;

  return `<tr><td colspan="${logo ? 2 : 1}" style="background-color: transparent;">${content}</td></tr>`;
}

export function generateEcoHTML(type, logo, config) {
  const paddingTop = type === "short" ? "8px" : "4px";
  const cols = logo ? 2 : 1;
  const ecoSrc = config.base64Images.eco || 'images/eco.png';

  return `
  <tr>
      <td colspan="${cols}" style="background-color: transparent; padding-top: ${paddingTop};">
          <p style="margin: 0; font-size: 8pt; font-style: italic; color: #0b7935; background-color: transparent; text-align: left; line-height: 1.2;">
              Think of the environment before printing this email.
              <img src="${ecoSrc}" alt="Eco icon" width="16" height="16" style="vertical-align: middle; margin-left: 4px; border: none; outline: none; text-decoration: none;">
          </p>
      </td>
  </tr>
 `;
}

export async function generateSignature(type, config) {
  const fields = getFormValues();

  const logoInput = document.getElementById("logo-upload");
  if (logoInput.files && logoInput.files[0]) {
    try {
      const { fileToBase64 } = await import('./utils.js');
      fields.logo = await fileToBase64(logoInput.files[0]);
    } catch (error) {
      console.error("Error al convertir el logo:", error);
      fields.logo = config.defaultLogo;
    }
  } else if (logoInput.dataset.removed === "true") {
    fields.logo = null;
  }

  const phoneHTML = generatePhoneHTML(fields.phone, fields.extension, fields, config);
  const mobileHTML = generateMobileHTML(fields.mobile, fields.addWhatsapp, fields.addTelegram, fields.name, config, fields);
  const mobile2HTML = generateMobileHTML(fields.mobile2, fields.addWhatsapp2, false, fields.name, config, fields);
  const socialHTML = generateSocialHTML(fields, type, config);
  const bannerHTML = generateBannerHTML(type, fields.logo, config, fields);
  const ecoHTML = generateEcoHTML(type, fields.logo, config);
  const logoHTML = await generateLogoHTML(fields.logo, config, fields);

  const emailIconKey = getIconKey("email", fields.socialIconColor);
  const emailIconSrc = config.base64Images[emailIconKey] || config.base64Images.email;
  const emailHTML = fields.email ? `
    <p style="${S.contactRow}">
      <img src="${emailIconSrc}" ${S.contactIcon}>
      <a href="mailto:${fields.email}" style="${S.link}">${fields.email}</a>
    </p>` : "";

  const signatureHTML = `
       <div class="signature-wrapper">
           <table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background-color: transparent;">
               <tr class="signature-main-row">
                   ${logoHTML}
                   <td class="signature-info-cell" style="border-left: ${fields.lineWidth}px solid ${fields.lineColor};">
                        <p style="margin: 0 0 4px; color: #333333; font-size: 12pt; font-weight: bold; background-color: transparent;">${fields.name}</p>
                        <p style="margin: 0 0 8px; color: #666666; font-size: 10pt; background-color: transparent;">${fields.position}</p>
                        ${phoneHTML}
                        ${mobileHTML}
                        ${mobile2HTML}
                        ${emailHTML}
                   </td>
               </tr>
               ${socialHTML}
               ${bannerHTML}
               ${ecoHTML}
           </table>
       </div>
   `;

  document.getElementById("signatureOutput").innerHTML = signatureHTML;
}
