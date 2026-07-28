import { Show } from 'solid-js';
import { SignatureType } from '../types';

interface ActionButtonsProps {
  activeType: SignatureType;
  signatureHTML: string;
  isGenerating: boolean;
  onGenerateFull: () => void;
  onGenerateMedium: () => void;
  onGenerateShort: () => void;
  onGenerateMinimal: () => void;
  onCopyHTML: () => void;
  onReset: () => void;
}

export function ActionButtons(props: ActionButtonsProps) {
  const hasSignature = () => !!props.signatureHTML;
  const isBusy = () => props.isGenerating;

  return (
    <>
      <div class="form-row buttons">
        <button
          type="button"
          class={`button-40 ${props.activeType === 'full' ? 'active' : ''}`}
          onClick={props.onGenerateFull}
          disabled={isBusy()}
          title="Firma completa: incluye logo, datos de contacto, redes sociales, banner y eco-friendly badge"
        >
          <Show when={!isBusy()} fallback={<span class="btn-loading">Generando...</span>}>
            Firma Completa
          </Show>
        </button>
        <button
          type="button"
          class={`button-40 ${props.activeType === 'medium' ? 'active' : ''}`}
          onClick={props.onGenerateMedium}
          disabled={isBusy()}
          title="Firma mediana: incluye logo y datos de contacto, sin banner ni eco badge"
        >
          <Show when={!isBusy()} fallback={<span class="btn-loading">Generando...</span>}>
            Firma Media
          </Show>
        </button>
        <button
          type="button"
          class={`button-40 ${props.activeType === 'short' ? 'active' : ''}`}
          onClick={props.onGenerateShort}
          disabled={isBusy()}
          title="Firma corta: solo datos de contacto esenciales, ideal para respuestas rápidas"
        >
          <Show when={!isBusy()} fallback={<span class="btn-loading">Generando...</span>}>
            Firma Corta
          </Show>
        </button>
        <button
          type="button"
          class={`button-40 ${props.activeType === 'minimal' ? 'active' : ''}`}
          onClick={props.onGenerateMinimal}
          disabled={isBusy()}
          title="Firma mínima para Zimbra/Carbonio: sin logo ni redes sociales, solo contacto y eco badge. Copiar HTML y pegar en el editor."
        >
          <Show when={!isBusy()} fallback={<span class="btn-loading">Generando...</span>}>
            Firma Mínima
          </Show>
        </button>
      </div>
      <div class="form-row buttons">
        <button
          type="button"
          id="copy-html"
          class="button-40"
          onClick={props.onCopyHTML}
          disabled={!hasSignature() || isBusy()}
          title={!hasSignature() ? 'Primero genera una firma' : 'Copiar firma como HTML para pegar en tu correo'}
        >
          Copiar Firma (HTML)
        </button>
        <button type="button" id="reset-form" class="button-40" onClick={props.onReset} disabled={isBusy()}>Reiniciar</button>
      </div>
    </>
  );
}