import { FormData, SocialIconColor } from '../types';

interface SocialSectionProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | boolean | number) => void;
}

function ToggleIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function SocialSection(props: SocialSectionProps) {
  return (
    <div class="form-section">
      <h3>
        Redes Sociales
        <span class="tooltip" tabindex="0" aria-describedby="tt-social">
          <span class="tooltip-icon" aria-hidden="true">i</span>
          <span id="tt-social" class="tooltip-text" role="tooltip">
            Agrega enlaces a tus perfiles y elige el color de los íconos.
          </span>
        </span>
      </h3>

      <div class="social-field">
        <label class="label-10" for="facebook">Facebook:</label>
        <div class="social-input-row">
          <input
            type="text"
            id="facebook"
            class="input-35"
            placeholder="URL de tu perfil"
            title="URL de tu perfil de Facebook"
            value={props.formData.facebook}
            onInput={(e) => props.onChange('facebook', e.currentTarget.value)}
          />
          <label class="toggle-label" title={props.formData.showFacebook ? 'Ocultar en la firma' : 'Mostrar en la firma'}>
            <input
              type="checkbox"
              checked={props.formData.showFacebook}
              onChange={(e) => props.onChange('showFacebook', e.currentTarget.checked)}
            />
            <ToggleIcon visible={props.formData.showFacebook} />
          </label>
        </div>
      </div>

      <div class="social-field">
        <label class="label-10" for="instagram">Instagram:</label>
        <div class="social-input-row">
          <input
            type="text"
            id="instagram"
            class="input-35"
            placeholder="URL de tu perfil"
            title="URL de tu perfil de Instagram"
            value={props.formData.instagram}
            onInput={(e) => props.onChange('instagram', e.currentTarget.value)}
          />
          <label class="toggle-label" title={props.formData.showInstagram ? 'Ocultar en la firma' : 'Mostrar en la firma'}>
            <input
              type="checkbox"
              checked={props.formData.showInstagram}
              onChange={(e) => props.onChange('showInstagram', e.currentTarget.checked)}
            />
            <ToggleIcon visible={props.formData.showInstagram} />
          </label>
        </div>
      </div>

      <div class="social-field">
        <label class="label-10" for="youtube">YouTube:</label>
        <div class="social-input-row">
          <input
            type="text"
            id="youtube"
            class="input-35"
            placeholder="URL de tu canal"
            title="URL de tu canal de YouTube"
            value={props.formData.youtube}
            onInput={(e) => props.onChange('youtube', e.currentTarget.value)}
          />
          <label class="toggle-label" title={props.formData.showYoutube ? 'Ocultar en la firma' : 'Mostrar en la firma'}>
            <input
              type="checkbox"
              checked={props.formData.showYoutube}
              onChange={(e) => props.onChange('showYoutube', e.currentTarget.checked)}
            />
            <ToggleIcon visible={props.formData.showYoutube} />
          </label>
        </div>
      </div>

      <div class="social-field">
        <label class="label-10" for="tiktok">TikTok:</label>
        <div class="social-input-row">
          <input
            type="text"
            id="tiktok"
            class="input-35"
            placeholder="URL de tu perfil"
            title="URL de tu perfil de TikTok"
            value={props.formData.tiktok}
            onInput={(e) => props.onChange('tiktok', e.currentTarget.value)}
          />
          <label class="toggle-label" title={props.formData.showTiktok ? 'Ocultar en la firma' : 'Mostrar en la firma'}>
            <input
              type="checkbox"
              checked={props.formData.showTiktok}
              onChange={(e) => props.onChange('showTiktok', e.currentTarget.checked)}
            />
            <ToggleIcon visible={props.formData.showTiktok} />
          </label>
        </div>
      </div>

      <div class="social-field">
        <label class="label-10" for="linkedin">LinkedIn:</label>
        <div class="social-input-row">
          <input
            type="text"
            id="linkedin"
            class="input-35"
            placeholder="URL de tu perfil"
            title="URL de tu perfil de LinkedIn"
            value={props.formData.linkedin}
            onInput={(e) => props.onChange('linkedin', e.currentTarget.value)}
          />
          <label class="toggle-label" title={props.formData.showLinkedin ? 'Ocultar en la firma' : 'Mostrar en la firma'}>
            <input
              type="checkbox"
              checked={props.formData.showLinkedin}
              onChange={(e) => props.onChange('showLinkedin', e.currentTarget.checked)}
            />
            <ToggleIcon visible={props.formData.showLinkedin} />
          </label>
        </div>
      </div>

      <div class="form-row">
        <label class="label-10" for="social-icon-color">Color de Íconos:</label>
        <select
          id="social-icon-color"
          class="input-35"
          aria-label="Paleta de íconos sociales"
          title="Cambia la paleta de íconos"
          value={props.formData.socialIconColor}
          onChange={(e) => props.onChange('socialIconColor', e.currentTarget.value as SocialIconColor)}
        >
          <option value="original">Original</option>
          <option value="mono">Mono</option>
          <option value="blue">Azul</option>
          <option value="red">Rojo</option>
          <option value="green">Verde</option>
          <option value="outline">Outline</option>
        </select>
      </div>
    </div>
  );
}
