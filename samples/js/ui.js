/**
 * ui.js
 * Propósito: Gestión de la interfaz de usuario (UI) y eventos del DOM.
 * Este módulo maneja la persistencia de datos, la configuración de botones,
 * las previsualizaciones en vivo y la inicialización de la aplicación.
 */

import { showMessage } from './utils.js';
import { generateSignature } from './generator.js';
import { validateFields } from './validation.js';

/**
 * Configuración global de la aplicación.
 * Contiene rutas de imágenes, iconos sociales y valores por defecto.
 */
export const config = {
  defaultLogo: "images/logo_cip.png",
  socialIcons: {
    ubicacion: "images/ubicacion.svg",
    ubicacion_mono: "images/ubicacion_mono.svg",
    ubicacion_blue: "images/ubicacion_blue.svg",
    ubicacion_red: "images/ubicacion_red.svg",
    facebook: "images/facebook.svg",
    facebook_mono: "images/facebook_mono.svg",
    facebook_blue: "images/facebook_blue.svg",
    facebook_red: "images/facebook_red.svg",
    facebook_outline: "images/facebook_outline.svg",
    instagram: "images/instagram.svg",
    instagram_mono: "images/instagram_mono.svg",
    instagram_blue: "images/instagram_blue.svg",
    instagram_red: "images/instagram_red.svg",
    instagram_outline: "images/instagram_outline.svg",
    youtube: "images/youtube.svg",
    youtube_mono: "images/youtube_mono.svg",
    youtube_blue: "images/youtube_blue.svg",
    youtube_red: "images/youtube_red.svg",
    youtube_outline: "images/youtube_outline.svg",
    tiktok: "images/tiktok.svg",
    tiktok_mono: "images/tiktok_mono.svg",
    tiktok_blue: "images/tiktok_blue.svg",
    tiktok_red: "images/tiktok_red.svg",
    tiktok_outline: "images/tiktok_outline.svg",
    whatsapp: "images/whatsapp.svg",
    whatsapp_mono: "images/whatsapp_mono.svg",
    whatsapp_blue: "images/whatsapp_blue.svg",
    whatsapp_red: "images/whatsapp_red.svg",
    whatsapp_outline: "images/whatsapp_outline.svg",
    telegram: "images/telegram.svg",
    telegram_mono: "images/telegram_mono.svg",
    telegram_blue: "images/telegram_blue.svg",
    telegram_red: "images/telegram_red.svg",
    telegram_outline: "images/telegram_outline.svg",
    email: "images/email_icon.svg",
    email_mono: "images/email_icon_mono.svg",
    email_blue: "images/email_icon_blue.svg",
    email_red: "images/email_icon_red.svg",
    email_outline: "images/email_icon.svg",
    phone_icon: "images/phone_icon.svg",
    phone_icon_mono: "images/phone_icon_mono.svg",
    phone_icon_blue: "images/phone_icon_blue.svg",
    phone_icon_red: "images/phone_icon_red.svg",
    phone_icon_outline: "images/phone_icon.svg",
    mobile_icon: "images/mobile_icon.svg",
    mobile_icon_mono: "images/mobile_icon_mono.svg",
    mobile_icon_blue: "images/mobile_icon_blue.svg",
    mobile_icon_red: "images/mobile_icon_red.svg",
    mobile_icon_outline: "images/mobile_icon.svg",
    eco: "images/eco.png",
  },
  bannerImage: "images/baner_lineas.png",
  defaultLineColor: "#003366",
  base64Images: {},
};

/**
 * Carga todas las imágenes estáticas y las convierte a Base64 para su uso en la firma.
 * Esto evita problemas de carga de imágenes externas en clientes de correo.
 */
export async function loadStaticImagesToBase64() {
  const { getFileAsBase64 } = await import('./utils.js');
  config.base64Images.defaultLogo = await getFileAsBase64(config.defaultLogo);
  config.base64Images.bannerImage = await getFileAsBase64(config.bannerImage);
  config.base64Images.eco = await getFileAsBase64(config.socialIcons.eco);

  for (const key in config.socialIcons) {
    if (key !== 'eco') {
      try {
        config.base64Images[key] = await getFileAsBase64(config.socialIcons[key]);
      } catch (error) {
        console.warn(`No se pudo cargar la imagen: ${config.socialIcons[key]}`, error);
      }
    }
  }
}

/**
 * Configura los botones de generación de firma (Completa, Media, Corta).
 */
export function setupSignatureGeneration() {
  document.querySelectorAll(".button-40[data-type]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!validateFields()) {
        showMessage("Por favor, completa el campo obligatorio (Nombre).", "error");
        return;
      }

      document.querySelectorAll(".button-40[data-type]").forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      if (!config.base64Images.defaultLogo) {
        await loadStaticImagesToBase64();
      }

      await generateSignature(button.dataset.type, config);
    });
  });
}

/**
 * Configura el botón para copiar el HTML de la firma al portapapeles.
 */
export async function setupCopyHTML() {
  document.getElementById("copy-html").addEventListener("click", async () => {
    const signatureOutput = document.getElementById("signatureOutput");
    const signatureHTML = signatureOutput.innerHTML;
    if (!signatureHTML) {
      showMessage("Por favor, genera una firma antes de copiar.", "error");
      return;
    }

    try {
      const range = document.createRange();
      range.selectNodeContents(signatureOutput);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      const success = document.execCommand('copy');
      selection.removeAllRanges();

      if (success) {
        showMessage("Firma copiada al portapapeles.", "success");
      } else {
        throw new Error("execCommand falló");
      }
    } catch (error) {
      console.error("Error al copiar:", error);
      showMessage("Error al copiar la firma.", "error");
    }
  });
}

/**
 * Configura el botón para copiar la información de la firma como texto plano.
 */
export function setupCopyText() {
  document.getElementById("copy-text").addEventListener("click", () => {
    const fields = {
      name: document.getElementById("name").value.trim(),
      position: document.getElementById("position").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      extension: document.getElementById("extension").value.trim(),
      mobile: document.getElementById("mobile").value.trim(),
      mobile2: document.getElementById("mobile2").value.trim(),
      facebook: document.getElementById("facebook").value.trim(),
      instagram: document.getElementById("instagram").value.trim(),
      youtube: document.getElementById("youtube").value.trim(),
      tiktok: document.getElementById("tiktok").value.trim(),
    };

    if (!fields.name && !fields.position) {
      showMessage("No hay información para copiar", "error");
      return;
    }

    let textToCopy = `${fields.name}\n${fields.position}\n`;
    if (fields.email) textToCopy += `Correo: ${fields.email}\n`;

    if (fields.phone) {
      textToCopy += `Teléfono: ${fields.phone}`;
      if (fields.extension) {
        textToCopy += ` ext. ${fields.extension}`;
      }
      textToCopy += "\n";
    }

    if (fields.mobile) {
      textToCopy += `Celular: ${fields.mobile}\n`;
    }

    if (fields.mobile2) {
      textToCopy += `Celular 2: ${fields.mobile2}\n`;
    }

    const socialLinks = [];
    if (fields.facebook) socialLinks.push(`Facebook: ${fields.facebook}`);
    if (fields.instagram) socialLinks.push(`Instagram: ${fields.instagram}`);
    if (fields.youtube) socialLinks.push(`YouTube: ${fields.youtube}`);
    if (fields.tiktok) socialLinks.push(`TikTok: ${fields.tiktok}`);

    if (socialLinks.length > 0) {
      textToCopy += "\nRedes Sociales:\n" + socialLinks.join("\n");
    }

    navigator.clipboard.writeText(textToCopy.trim())
      .then(() => {
        showMessage("Información copiada como texto", "success");
      })
      .catch(err => {
        console.error("Error al copiar texto:", err);
        showMessage("Error al copiar la información", "error");
      });
  });
}

/**
 * Configura el botón para eliminar el logo subido.
 */
export function setupRemoveLogo() {
  const removeButton = document.getElementById("remove-logo");
  if (removeButton) {
    removeButton.addEventListener("click", async () => {
      const logoInput = document.getElementById("logo-upload");
      logoInput.value = "";
      logoInput.dataset.removed = "true";
      document.getElementById("logo-preview").style.display = "none";
      const activeButton = document.querySelector('.button-40[data-type].active');
      if (activeButton) {
        await generateSignature(activeButton.dataset.type, config);
      }
    });
  }
}

/**
 * Guarda los datos del formulario en localStorage para persistencia.
 */
export function saveFormData() {
  const formData = {
    name: document.getElementById("name").value,
    position: document.getElementById("position").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    extension: document.getElementById("extension").value,
    mobile: document.getElementById("mobile").value,
    mobile2: document.getElementById("mobile2").value,
    "add-whatsapp": document.getElementById("add-whatsapp").checked,
    "add-whatsapp2": document.getElementById("add-whatsapp2").checked,
    "add-telegram": document.getElementById("add-telegram").checked,
    facebook: document.getElementById("facebook").value,
    instagram: document.getElementById("instagram").value,
    youtube: document.getElementById("youtube").value,
    tiktok: document.getElementById("tiktok").value,
    "line-color": document.getElementById("line-color").value,
    "line-width": document.getElementById("line-width").value,
    "logo-type": document.getElementById("logo-type").value,
    "logo-color": document.getElementById("logo-color").value,
    "social-icon-color": document.getElementById("social-icon-color").value,
    "banner-link": document.getElementById("banner-link").value,
    "banner-alt": document.getElementById("banner-alt").value,
  };

  localStorage.setItem('signatureFormData', JSON.stringify(formData));
}

/**
 * Carga los datos del formulario desde localStorage.
 */
export function loadFormData() {
  const savedData = localStorage.getItem('signatureFormData');
  if (savedData) {
    const formData = JSON.parse(savedData);
    Object.keys(formData).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = formData[key];
        } else {
          element.value = formData[key];
        }
      }
    });
  }
}

/**
 * Actualiza la previsualización del SVG en vivo según el tipo y color seleccionado.
 */
export async function updateSvgPreview() {
  const logoType = document.getElementById("logo-type").value;
  const logoColor = document.getElementById("logo-color").value;

  let svgText = '';
  if (logoType === 'logo1') {
    const resp = await fetch('images/logo1.svg');
    svgText = await resp.text();
    svgText = svgText.replace(/fill="#[0-9A-Fa-f]{3,6}"/, `fill="${logoColor}"`);
  } else if (logoType === 'logo2') {
    const resp = await fetch('images/logo2.svg');
    svgText = await resp.text();
    svgText = svgText.replace(/stroke="#[0-9A-Fa-f]{3,6}"/g, `stroke="${logoColor}"`);
  }

  const previewElement = document.getElementById("svg-preview");
  if (previewElement) {
    if (svgText) {
      previewElement.innerHTML = svgText;
      previewElement.classList.add("show");
    } else {
      previewElement.innerHTML = '';
      previewElement.classList.remove("show");
    }
  }
}

/**
 * Actualiza el texto que muestra el ancho de la línea vertical.
 */
export function updateLineWidthDisplay() {
  const slider = document.getElementById("line-width");
  const display = document.getElementById("line-width-value");
  if (slider && display) {
    display.textContent = slider.value + "px";
  }
}

/**
 * Configura el botón de reinicio del formulario.
 */
export function setupResetForm() {
  document.getElementById("reset-form").addEventListener("click", () => {
    document.querySelector(".form-content").closest('form').reset();
    const lineColorPicker = document.getElementById("line-color");
    if (lineColorPicker) lineColorPicker.value = config.defaultLineColor;

    const lineWidthSlider = document.getElementById("line-width");
    if (lineWidthSlider) lineWidthSlider.value = "4";

    const logoTypeSelect = document.getElementById("logo-type");
    if (logoTypeSelect) logoTypeSelect.value = "logo1";

    const logoColorPicker = document.getElementById("logo-color");
    if (logoColorPicker) logoColorPicker.value = "#e22721";

    const logoInput = document.getElementById("logo-upload");
    if (logoInput) logoInput.dataset.removed = "false";

    const logoPreview = document.getElementById("logo-preview");
    if (logoPreview) {
      logoPreview.style.display = "none";
      logoPreview.style.backgroundImage = "";
    }

    const signatureOutput = document.getElementById("signatureOutput");
    if (signatureOutput) signatureOutput.innerHTML = "";

    localStorage.removeItem('signatureFormData');
  });
}

/**
 * Inicialización de la aplicación al cargar el DOM.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await loadStaticImagesToBase64();
  loadFormData();
  setupSignatureGeneration();
  setupCopyHTML();
  setupCopyText();
  setupRemoveLogo();
  setupResetForm();

  // Configurar previsualización del SVG
  const logoTypeSelect = document.getElementById("logo-type");
  const logoColorPicker = document.getElementById("logo-color");
  if (logoTypeSelect && logoColorPicker) {
    await updateSvgPreview();
    logoTypeSelect.addEventListener('change', updateSvgPreview);
    logoColorPicker.addEventListener('input', updateSvgPreview);
  }

  // Configurar previsualización del logo subido
  const logoUpload = document.getElementById("logo-upload");
  const logoPreview = document.getElementById("logo-preview");
  if (logoUpload && logoPreview) {
    logoUpload.addEventListener('change', async () => {
      if (logoUpload.files && logoUpload.files[0]) {
        const { fileToBase64 } = await import('./utils.js');
        const base64 = await fileToBase64(logoUpload.files[0]);
        logoPreview.style.backgroundImage = `url(${base64})`;
        logoPreview.classList.add("show");
      } else {
        logoPreview.style.backgroundImage = '';
        logoPreview.classList.remove("show");
      }
    });
  }

  // Configurar slider de línea
  const lineWidthSlider = document.getElementById("line-width");
  if (lineWidthSlider) {
    updateLineWidthDisplay();
    lineWidthSlider.addEventListener('input', () => {
      updateLineWidthDisplay();
      const activeButton = document.querySelector('.button-40[data-type].active');
      if (activeButton) generateSignature(activeButton.dataset.type, config);
    });
  }

  // Guardar datos en cada cambio y regenerar firma si es necesario
  document.querySelectorAll('input, select').forEach(input => {
    const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventType, () => {
      saveFormData();
      if (input.id === 'social-icon-color' || input.id === 'line-color') {
        const activeButton = document.querySelector('.button-40[data-type].active');
        if (activeButton) generateSignature(activeButton.dataset.type, config);
      }
    });
  });
});
