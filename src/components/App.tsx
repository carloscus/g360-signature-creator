import { createSignal, createEffect, Show, onCleanup } from 'solid-js';
import { FormData, SignatureType, StatusMessage as StatusMessageType, ValidationResult, DEFAULT_FORM_DATA, AppConfig } from '../types';
import { useSignatureFormData } from '../hooks/useLocalStorage';
import { generateSignature, getFileAsBase64, fileToBase64, svgToPngBase64 } from '../utils/signatureGenerator';
import { copyHTMLToClipboard } from '../utils/clipboard';
import { validateFields, validateField } from '../utils/validation';

import { Modal } from './Modal';
import { PreviewPanel } from './PreviewPanel';
import { ActionButtons } from './ActionButtons';
import { PersonalDataSection } from './PersonalDataSection';
import { ContactSection } from './ContactSection';
import { VisualCustomizationSection } from './VisualCustomizationSection';
import { BannerSection } from './BannerSection';
import { SocialSection } from './SocialSection';
import { AdvancedConfigSection } from './AdvancedConfigSection';

import '../index.css';

const DEFAULT_CONFIG: AppConfig = {
  bannerImage: 'images/baner_lineas.png',
  defaultLineColor: '#003366',
  base64Images: {},
  baseSvgCache: {},
};

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('g360-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function App() {
  const [formData, setFormData, clearFormData] = useSignatureFormData<FormData>(DEFAULT_FORM_DATA);
  const [signatureHTML, setSignatureHTML] = createSignal<string>('');
  const [activeType, setActiveType] = createSignal<SignatureType>('full');
  const [statusMessage, setStatusMessage] = createSignal<StatusMessageType | null>(null);
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [svgPreview, setSvgPreview] = createSignal<string>('');
  const [iconCache, setIconCache] = createSignal<Record<string, string>>({});
  const [config, setConfig] = createSignal(DEFAULT_CONFIG);
  const [uploadedLogoPreview, setUploadedLogoPreview] = createSignal<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);
  const [theme, setTheme] = createSignal<'light' | 'dark'>(getInitialTheme());
  const [sidebarLogo, setSidebarLogo] = createSignal<string>('');
  const [confirmState, setConfirmState] = createSignal<{ message: string; onConfirm: () => void } | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = createSignal(false);
  const [isGenerating, setIsGenerating] = createSignal(false);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transition');
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 300);
  };

  createEffect(() => {
    const current = theme();
    document.documentElement.setAttribute('data-theme', current);
    localStorage.setItem('g360-theme', current);
  });

  let savedTimer: ReturnType<typeof setTimeout> | undefined;
  let savedHideTimer: ReturnType<typeof setTimeout> | undefined;
  createEffect(() => {
    const data = formData();
    clearTimeout(savedTimer);
    clearTimeout(savedHideTimer);
    savedTimer = setTimeout(() => {
      setShowSavedIndicator(true);
      savedHideTimer = setTimeout(() => setShowSavedIndicator(false), 1500);
    }, 600);
    onCleanup(() => {
      clearTimeout(savedTimer);
      clearTimeout(savedHideTimer);
    });
  });

  const loadStaticImages = async () => {
    const images: Record<string, string> = {};
    const svgCache: Record<string, string> = {};
    const iconBaseNames = [
      'ubicacion', 'facebook', 'instagram', 'youtube', 'tiktok', 'linkedin',
      'whatsapp', 'telegram', 'phone_icon', 'mobile_icon', 'email_icon'
    ];

    try {
      // Pre-cargar SVGs base en paralelo
      const iconResults = await Promise.allSettled(
        iconBaseNames.map(async (icon) => {
          const response = await fetch(`images/${icon}.svg`);
          if (!response.ok) throw new Error(`Icon not found: ${icon}.svg`);
          const svgText = await response.text();
          const originalPng = await svgToPngBase64(svgText, 20, 20);
          return { icon, svgText, originalPng };
        })
      );

      iconResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          svgCache[result.value.icon] = result.value.svgText;
          images[result.value.icon] = result.value.originalPng;
        }
      });

      const bannerBase64 = await getFileAsBase64(config().bannerImage);
      if (bannerBase64) images.bannerImage = bannerBase64;

      const ecoBase64 = await getFileAsBase64('images/eco.png');
      if (ecoBase64) images.eco = ecoBase64;

      // Logo sidebar como SVG inline (evita problemas de conversión PNG con transforms complejos)
      try {
        const logoSvgResp = await fetch('images/logo1.svg');
        if (logoSvgResp.ok) {
          let logoSvgText = await logoSvgResp.text();
          if (!/width=/.test(logoSvgText)) {
            logoSvgText = logoSvgText.replace(/<svg/, '<svg width="48" height="48"');
          }
          const encoded = encodeURIComponent(logoSvgText)
            .replace(/'/g, '%27')
            .replace(/"/g, '%22');
          setSidebarLogo(`data:image/svg+xml,${encoded}`);
        }
      } catch (e) {
        console.warn('No se pudo cargar logo sidebar:', e);
      }

      setConfig(prev => ({ 
        ...prev, 
        base64Images: images,
        baseSvgCache: svgCache
      }));
    } catch (err) {
      console.error('Error loading images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Real-time field validation for critical fields
    if (field === 'name' || field === 'position' || field === 'email' || field === 'digitalSignatureUrl' || field === 'bannerLink') {
      const error = validateField(field, value);
      setErrors(prev => {
        if (error) {
          return { ...prev, [field]: error };
        } else {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        }
      });
    } else {
      // Clear any existing error for this field if it's not one we validate inline
      if (errors()[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
  const MAX_LOGO_SIZE_MB = 2;

  const handleLogoUpload = async (file: File | null) => {
    if (!file) {
      handleRemoveLogo();
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setStatusMessage({ text: 'Formato no soportado. Usa PNG, JPG, GIF, WebP o SVG.', type: 'error' });
      return;
    }

    if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      setStatusMessage({ text: `El archivo supera ${MAX_LOGO_SIZE_MB}MB. Usa una imagen más pequeña.`, type: 'error' });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setFormData(prev => ({ ...prev, logo: base64, logoType: 'upload' }));
      setUploadedLogoPreview(base64);
    } catch (err) {
      console.error('Error al procesar logo:', err);
    }
  };

  const resetLogoInput = () => {
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleClearUploadedLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    setUploadedLogoPreview(null);
    resetLogoInput();
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: null, logoType: 'none' }));
    setUploadedLogoPreview(null);
    resetLogoInput();
  };

  const updateSignaturePreview = async (type: SignatureType) => {
    try {
      const html = await generateSignature(type, formData(), config(), iconCache());
      setSignatureHTML(html);
    } catch (err) {
      console.error('Error generating preview:', err);
    }
  };

  const handleGenerate = async (type: SignatureType) => {
    const validation: ValidationResult = validateFields(formData());

    if (!validation.isValid) {
      setErrors(validation.errors);
      setStatusMessage({
        text: 'Por favor, corrige los errores en el formulario',
        type: 'error',
      });
      return;
    }

    setErrors({});
    setIsGenerating(true);
    setActiveType(type);
    await updateSignaturePreview(type);
    setIsGenerating(false);

    setStatusMessage({
      text: `Modo: Firma ${type === 'full' ? 'Completa' : type === 'medium' ? 'Media' : type === 'short' ? 'Corta' : 'Mínima (Zimbra/Carbonio)'}`,
      type: 'info',
    });

    setIsSidebarOpen(false);
  };

  const handleCopyHTML = async () => {
    if (!signatureHTML()) {
      setStatusMessage({ text: 'No hay firma para copiar', type: 'error' });
      return;
    }

    const success = await copyHTMLToClipboard(signatureHTML());
    if (success) {
      setStatusMessage({
        text: '¡Firma HTML copiada! Puedes pegarla en tu correo.',
        type: 'success',
      });
    } else {
      setStatusMessage({
        text: 'Error al copiar al portapapeles',
        type: 'error',
      });
    }
  };

  const handleReset = () => {
    setConfirmState({
      message: '¿Estás seguro de que deseas limpiar todos los campos?',
      onConfirm: () => {
        clearFormData();
        setSignatureHTML('');
        setErrors({});
        setSvgPreview('');
        setUploadedLogoPreview(null);
        setActiveType('full');
        setStatusMessage({ text: 'Formulario reiniciado', type: 'info' });
        setConfirmState(null);
      },
    });
  };

  const handleConfirmAccept = () => {
    confirmState()?.onConfirm();
  };

  const handleConfirmCancel = () => {
    setConfirmState(null);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  let imagesLoaded = false;
  createEffect(() => {
    if (!imagesLoaded && Object.keys(config().base64Images).length === 0 && isLoading()) {
      imagesLoaded = true;
      loadStaticImages();
    }
  });

  createEffect(() => {
    if (isLoading()) return;
    const data = formData();
    const currentType = activeType();
    const debounceTimer = setTimeout(() => {
      if (data.name && data.position) {
        updateSignaturePreview(currentType);
      } else {
        setSignatureHTML('');
      }
    }, 400);
    onCleanup(() => clearTimeout(debounceTimer));
  });

  createEffect(() => {
    const logoType = formData().logoType;
    const logoColor = formData().logoColor;
    const logoUrl = formData().logo;

    if (logoType === 'upload' && logoUrl) {
      setSvgPreview('');
      return;
    }

    if (logoType !== 'logo1' && logoType !== 'logo2') {
      setSvgPreview('');
      return;
    }

    let aborted = false;
    fetch(`images/${logoType}.svg`)
      .then(resp => resp.text())
      .then(svgText => {
        if (aborted) return;
        if (logoType === 'logo1') {
          svgText = svgText.replace(/fill="[^"]*"/g, `fill="${logoColor}"`);
        } else {
          svgText = svgText.replace(/stroke="[^"]*"/g, `stroke="${logoColor}"`);
        }
        setSvgPreview(svgText);
      })
      .catch(err => {
        if (aborted) return;
        console.error('Error loading SVG:', err);
        setSvgPreview('');
      });

    onCleanup(() => {
      aborted = true;
    });
  });

  return (
    <div class="app-container">
      <button
        type="button"
        class="hamburger-btn"
        onClick={() => setIsSidebarOpen(prev => !prev)}
        aria-label={isSidebarOpen() ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isSidebarOpen()}
        aria-controls="sidebar"
      >
        {isSidebarOpen() ? '✕' : '☰'}
      </button>

      <div
        class={`sidebar-overlay ${isSidebarOpen() ? 'visible' : ''}`}
        onClick={closeSidebar}
      />

      <aside id="sidebar" class={`sidebar ${isSidebarOpen() ? 'open' : ''}`}>
        <header class="sidebar-header">
          <div class="sidebar-title-row">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <Show when={sidebarLogo()}>
                <img src={sidebarLogo()} alt="CIPSA" class="sidebar-logo" width="48" height="48" />
              </Show>
              <div>
                <h1>CIPSA Signature</h1>
                <p>Generador de firmas corporativas v3.1</p>
              </div>
            </div>
            <button
              type="button"
              class="theme-toggle"
              onClick={toggleTheme}
              title={theme() === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              aria-label={theme() === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
            >
              {theme() === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
          <Show when={showSavedIndicator()}>
            <span class="auto-save-indicator">Borrador guardado</span>
          </Show>
        </header>

        <form onSubmit={(e) => e.preventDefault()}>
          <PersonalDataSection
            formData={formData()}
            onChange={handleFieldChange}
            errors={errors()}
          />

          <ContactSection
            formData={formData()}
            onChange={handleFieldChange}
          />

          <VisualCustomizationSection
            formData={formData()}
            onChange={handleFieldChange}
            svgPreview={svgPreview()}
            uploadedLogoPreview={uploadedLogoPreview()}
            onLogoUpload={handleLogoUpload}
            onRemoveLogo={handleRemoveLogo}
            onClearUploadedLogo={handleClearUploadedLogo}
          />

          <BannerSection
            formData={formData()}
            onChange={handleFieldChange}
            errors={errors()}
          />

          <SocialSection
            formData={formData()}
            onChange={handleFieldChange}
          />

          <AdvancedConfigSection
            formData={formData()}
            onChange={handleFieldChange}
            errors={errors()}
          />
        </form>
      </aside>

      <div class="main-column">
        <PreviewPanel
          signatureHTML={signatureHTML()}
          isLoading={isLoading()}
        />
        <ActionButtons
          activeType={activeType()}
          signatureHTML={signatureHTML()}
          isGenerating={isGenerating()}
          onGenerateFull={() => handleGenerate('full')}
          onGenerateMedium={() => handleGenerate('medium')}
          onGenerateShort={() => handleGenerate('short')}
          onGenerateMinimal={() => handleGenerate('minimal')}
          onCopyHTML={handleCopyHTML}
          onReset={handleReset}
        />
      </div>

      <Modal
        message={statusMessage()}
        onClose={() => setStatusMessage(null)}
      />

      {confirmState() && (
        <div class="modal-overlay" onClick={handleConfirmCancel} role="dialog" aria-modal="true" aria-label="Confirmar">
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div class="modal-icon modal-icon-info">?</div>
            <p id="modal-message">{confirmState()!.message}</p>
            <div class="confirm-actions">
              <button type="button" class="modal-close" onClick={handleConfirmAccept}>Confirmar</button>
              <button type="button" class="modal-close secondary" onClick={handleConfirmCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}