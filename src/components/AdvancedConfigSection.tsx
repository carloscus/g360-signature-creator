import { FormData } from '../types';

interface AdvancedConfigSectionProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | boolean | number) => void;
  errors?: Record<string, string>;
}

export function AdvancedConfigSection(props: AdvancedConfigSectionProps) {
  return (
    <div class="form-section">
      <h3>
        Configuración Avanzada
        <span class="tooltip" tabindex="0" aria-describedby="tt-advanced">
          <span class="tooltip-icon" aria-hidden="true">i</span>
          <span id="tt-advanced" class="tooltip-text" role="tooltip">
            Activa la firma digital para añadir un enlace discreto detrás del logo.
          </span>
        </span>
      </h3>
      <div class="form-row data-fields">
        <label class="label-10" for="enable-digital-signature">Activar Firma Digital:</label>
        <input
          type="checkbox"
          id="enable-digital-signature"
          title="Activa el enlace detrás del logo en las firmas"
          checked={props.formData.enableDigitalSignature}
          onChange={(e) => props.onChange('enableDigitalSignature', e.currentTarget.checked)}
        />
      </div>
      <div class="form-row data-fields">
        <label class="label-10" for="digital-signature-url">URL Firma Digital:</label>
        <input
          type="url"
          id="digital-signature-url"
          class={`input-35 ${props.errors?.digitalSignatureUrl ? 'error' : ''}`}
          placeholder="https://www.cipsa.com.pe/"
          title="URL que se abre al hacer clic en el logo"
          aria-describedby={props.errors?.digitalSignatureUrl ? 'error-digitalSignatureUrl' : undefined}
          value={props.formData.digitalSignatureUrl}
          onInput={(e) => props.onChange('digitalSignatureUrl', e.currentTarget.value)}
        />
        {props.errors?.digitalSignatureUrl && <span id="error-digitalSignatureUrl" class="inline-error" role="alert">{props.errors.digitalSignatureUrl}</span>}
      </div>
    </div>
  );
}