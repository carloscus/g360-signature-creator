import { SignatureType } from '../types';

interface ActionButtonsProps {
  activeType: SignatureType;
  signatureHTML: string;
  onGenerateFull: () => void;
  onGenerateMedium: () => void;
  onGenerateShort: () => void;
  onGenerateMinimal: () => void;
  onCopyHTML: () => void;
  onReset: () => void;
}

export function ActionButtons(props: ActionButtonsProps) {
  const hasSignature = () => !!props.signatureHTML;

  return (
    <>
      <div class="form-row buttons">
        <button
          type="button"
          class={`button-40 ${props.activeType === 'full' ? 'active' : ''}`}
          onClick={props.onGenerateFull}
          title="Firma completa: incluye logo, datos de contacto, redes sociales, banner y eco-friendly badge"
        >
          Firma Completa
        </button>
        <button
          type="button"
          class={`button-40 ${props.activeType === 'medium' ? 'active' : ''}`}
          onClick={props.onGenerateMedium}
          title="Firma mediana: incluye logo y datos de contacto, sin banner ni eco badge"
        >
          Firma Media
        </button>
        <button
          type="button"
          class={`button-40 ${props.activeType === 'short' ? 'active' : ''}`}
          onClick={props.onGenerateShort}
          title="Firma corta: solo datos de contacto esenciales, ideal para respuestas rápidas"
        >
          Firma Corta
        </button>
        <button
          type="button"
          class={`button-40 ${props.activeType === 'minimal' ? 'active' : ''}`}
          onClick={props.onGenerateMinimal}
          title="Firma mínima para Zimbra/Carbonio: sin logo ni redes sociales, solo contacto y eco badge. Copiar HTML y pegar en el editor."
        >
          Firma Mínima
        </button>
      </div>
      <div class="form-row buttons">
        <button
          type="button"
          id="copy-html"
          class="button-40"
          onClick={props.onCopyHTML}
          disabled={!hasSignature()}
          title={!hasSignature() ? 'Primero genera una firma' : 'Copiar firma como HTML para pegar en tu correo'}
        >
          Copiar Firma (HTML)
        </button>
        <button type="button" id="reset-form" class="button-40" onClick={props.onReset}>Reiniciar</button>
      </div>
    </>
  );
}