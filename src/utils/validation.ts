import { FormData, ValidationResult } from '../types';

export function sanitize(str: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  for (const proto of DANGEROUS_PROTOCOLS) {
    if (trimmed.startsWith(proto)) return false;
  }
  return true;
}

export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  return emailPattern.test(email);
}

export function validateFields(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  if (!formData.name?.trim()) {
    errors.name = 'El nombre es requerido';
    isValid = false;
  }

  if (!formData.position?.trim()) {
    errors.position = 'El cargo es requerido';
    isValid = false;
  }

  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = 'Formato de correo electrónico no válido';
    isValid = false;
  }

  if (formData.enableDigitalSignature && formData.digitalSignatureUrl) {
    if (!isSafeUrl(formData.digitalSignatureUrl)) {
      errors.digitalSignatureUrl = 'Protocolo de URL no permitido';
      isValid = false;
    } else {
      try {
        new URL(formData.digitalSignatureUrl);
      } catch {
        errors.digitalSignatureUrl = 'URL de firma digital no válida';
        isValid = false;
      }
    }
  }

  if (formData.bannerLink) {
    if (!isSafeUrl(formData.bannerLink)) {
      errors.bannerLink = 'Protocolo de URL no permitido';
      isValid = false;
    } else {
      try {
        new URL(formData.bannerLink);
      } catch {
        errors.bannerLink = 'URL del banner no válida';
        isValid = false;
      }
    }
  }

  return { isValid, errors };
}

export function validateField(
  field: keyof FormData,
  value: string | boolean | number
): string | null {
  switch (field) {
    case 'name':
      if (typeof value === 'string' && !value.trim()) {
        return 'El nombre es requerido';
      }
      break;
    case 'position':
      if (typeof value === 'string' && !value.trim()) {
        return 'El cargo es requerido';
      }
      break;
    case 'email':
      if (typeof value === 'string' && value && !isValidEmail(value)) {
        return 'Formato de correo electrónico no válido';
      }
      break;
    case 'digitalSignatureUrl':
      if (typeof value === 'string' && value) {
        if (!isSafeUrl(value)) return 'Protocolo de URL no permitido';
        try {
          new URL(value);
        } catch {
          return 'URL no válida';
        }
      }
      break;
    case 'bannerLink':
      if (typeof value === 'string' && value) {
        if (!isSafeUrl(value)) return 'Protocolo de URL no permitido';
        try {
          new URL(value);
        } catch {
          return 'URL no válida';
        }
      }
      break;
  }
  return null;
}