/**
 * utils.js
 * Propósito: Funciones de utilidad para manipulación de archivos, 
 * conversión de imágenes y notificaciones de la interfaz.
 */

/**
 * Genera un enlace HTML dinámico con validación básica.
 * @param {string} type - Tipo de enlace ('tel', 'email', etc.).
 * @param {string} value - Valor del enlace (número, correo).
 * @param {string} text - Texto a mostrar.
 * @param {string} urlTemplate - Plantilla de la URL con marcadores {value} y {text}.
 * @returns {string} HTML del enlace generado.
 */
export function generateLink(type, value, text, urlTemplate) {
  if (!value) return "";
  let cleanValue = value;
  if (type === "tel") {
    cleanValue = value.replace(/[^0-9;]/g, "");
  } else {
    cleanValue = value.replace(/\D/g, "");
  }

  try {
    const formattedUrl = urlTemplate
      .replace("{value}", cleanValue)
      .replace("{text}", encodeURIComponent(text));
    return `<a href="${formattedUrl}" class="signature-link">${value}</a>`;
  } catch (error) {
    console.error("Error al formatear el enlace:", error);
    return "";
  }
}

/**
 * Convierte un archivo de imagen a una cadena Base64, 
 * redimensionándola y comprimiéndola para optimizar el tamaño.
 * @param {File} file - El archivo de imagen.
 * @param {number} maxWidth - Ancho máximo permitido.
 * @param {number} maxHeight - Alto máximo permitido.
 * @returns {Promise<string>} Promesa que resuelve con la cadena Base64.
 */
export async function fileToBase64(file, maxWidth = 90, maxHeight = 90) {
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
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.7;
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          quality = 0.7;
        } else if (file.type === 'image/png') {
          quality = 0.8;
        }
        resolve(canvas.toDataURL(file.type, quality));
      };
      img.onerror = (error) => reject(error);
      img.src = event.target.result;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Obtiene el contenido de una URL y lo convierte a Base64.
 * Útil para incrustar imágenes locales en el HTML de la firma.
 * @param {string} url - La URL de la imagen.
 * @returns {Promise<string|null>} Base64 de la imagen o null si falla.
 */
export async function getFileAsBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const compressedBase64 = canvas.toDataURL('image/png', 0.8);
        resolve(compressedBase64);
      };
      img.onerror = reject;

      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return null;
  }
}

/**
 * Convierte una cadena SVG a una imagen PNG en formato Base64.
 * Mejora la compatibilidad en clientes de correo que no soportan SVG.
 * @param {string} svgString - El contenido del SVG.
 * @param {number} width - Ancho deseado.
 * @param {number} height - Alto deseado.
 * @returns {Promise<string>} Base64 del PNG generado.
 */
export function svgToPngBase64(svgString, width = 90, height = 90) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/png', 0.8);
      URL.revokeObjectURL(img.src);
      resolve(dataUrl);
    };

    img.onerror = reject;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  });
}

/**
 * Muestra un mensaje temporal en la interfaz de usuario.
 * @param {string} message - El texto del mensaje.
 * @param {string} type - Tipo de mensaje ('success', 'error', 'info').
 */
export function showMessage(message, type) {
  const statusMessageElement = document.getElementById("status-message");
  if (!statusMessageElement) return;

  statusMessageElement.textContent = message;
  statusMessageElement.className = "status-message show";
  statusMessageElement.classList.add(type);

  setTimeout(() => {
    statusMessageElement.classList.remove("show");
    statusMessageElement.classList.add("auto-hide");
    setTimeout(() => {
      statusMessageElement.className = "status-message";
      statusMessageElement.textContent = "";
    }, 500);
  }, 5000);
}
