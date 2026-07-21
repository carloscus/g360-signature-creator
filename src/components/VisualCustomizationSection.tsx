import { FormData, LogoType } from '../types';

interface VisualCustomizationSectionProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | boolean | number) => void;
  svgPreview: string;
  uploadedLogoPreview: string | null;
  onLogoUpload: (file: File | null) => void;
  onRemoveLogo: () => void;
  onClearUploadedLogo: () => void;
}

export function VisualCustomizationSection(props: VisualCustomizationSectionProps) {
  const handleLogoTypeChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value as LogoType;
    props.onChange('logoType', value);
    if (value !== 'upload') {
      props.onClearUploadedLogo();
    }
  };

  return (
    <div class="form-section">
      <h3>
        Personalización Visual
        <span class="tooltip" tabindex="0" aria-describedby="tt-visual">
          <span class="tooltip-icon" aria-hidden="true">i</span>
          <span id="tt-visual" class="tooltip-text" role="tooltip">
            Configura logo, colores y línea; añade un banner si lo deseas.
          </span>
        </span>
      </h3>
      <div class="form-row">
        <label class="label-10" for="logo-upload">Subir imagen o logo:</label>
        <div class="input-group input-35">
          <input
            type="file"
            id="logo-upload"
            accept="image/*"
            aria-label="Seleccionar archivo de imagen para el logo"
            title="Sube una imagen para el logo"
            onChange={async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              await props.onLogoUpload(file || null);
            }}
          />
          {props.uploadedLogoPreview && (
            <button
              type="button"
              class="remove-logo-btn"
              onClick={props.onRemoveLogo}
              title="Quitar logo"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div class="form-row">
        <label class="label-10" for="logo-type">Tipo de Logo:</label>
        <select
          id="logo-type"
          class="input-35"
          aria-label="Seleccionar tipo de logo"
          title="Elige entre logo relleno, contorno o subir imagen"
          value={props.formData.logoType}
          onChange={handleLogoTypeChange}
        >
          <option value="logo1">Logo 1 (Relleno)</option>
          <option value="logo2">Logo 2 (Contorno)</option>
          <option value="none">Sin Logo</option>
          <option value="upload">Subir Imagen</option>
        </select>
        <label class="label-10" for="logo-color">Color Logo:</label>
        <input
          type="color"
          id="logo-color"
          class="input-35 color-picker"
          value={props.formData.logoColor}
          title="Selecciona el color del logo"
          aria-label="Selector de color para el logo"
          onInput={(e) => props.onChange('logoColor', e.currentTarget.value)}
        />
      </div>
      <div class="form-row">
        <label class="label-10" for="line-color">Color Línea:</label>
        <input
          type="color"
          id="line-color"
          class="input-35 color-picker"
          value={props.formData.lineColor}
          title="Selecciona el color de la línea vertical"
          onInput={(e) => props.onChange('lineColor', e.currentTarget.value)}
        />
        <label class="label-10" for="line-width">Ancho Línea:</label>
        <input
          type="range"
          id="line-width"
          class="input-35 slider"
          min="1"
          max="10"
          step="1"
          value={props.formData.lineWidth}
          title="Ancho de la línea vertical"
          onInput={(e) => props.onChange('lineWidth', parseInt(e.currentTarget.value))}
        />
        <span id="line-width-value" class="value-display">{props.formData.lineWidth}px</span>
      </div>
    </div>
  );
}