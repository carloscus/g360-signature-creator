import { FormData } from '../types';

interface BannerSectionProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | boolean | number) => void;
  errors?: Record<string, string>;
}

export function BannerSection(props: BannerSectionProps) {
  return (
    <div class="form-section">
      <h3>Banner Institucional</h3>
      <div class="form-row data-fields">
        <label class="label-10" for="banner-link">Link Banner:</label>
        <input
          type="url"
          id="banner-link"
          class={`input-35 ${props.errors?.bannerLink ? 'error' : ''}`}
          placeholder="https://tu-destino.com"
          title="URL que se abrirá al hacer clic en el banner"
          aria-describedby={props.errors?.bannerLink ? 'error-bannerLink' : undefined}
          value={props.formData.bannerLink}
          onInput={(e) => props.onChange('bannerLink', e.currentTarget.value)}
        />
        <label class="label-10" for="banner-alt">Texto Alt Banner:</label>
        <input
          type="text"
          id="banner-alt"
          class="input-35"
          placeholder="Promoción / Campaña"
          title="Texto alternativo para accesibilidad (describe el banner)"
          value={props.formData.bannerAlt}
          onInput={(e) => props.onChange('bannerAlt', e.currentTarget.value)}
        />
      </div>
      {props.errors?.bannerLink && <span id="error-bannerLink" class="inline-error" role="alert">{props.errors.bannerLink}</span>}
    </div>
  );
}