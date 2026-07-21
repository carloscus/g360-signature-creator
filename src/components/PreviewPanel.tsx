import { Show } from 'solid-js';

interface PreviewPanelProps {
  signatureHTML: string;
  isLoading: boolean;
}

export function PreviewPanel(props: PreviewPanelProps) {
  return (
    <main class="main-area">
      <header class="main-area-header">
        <h2>Vista Previa</h2>
        <p>Los cambios se reflejan automáticamente mientras editas tu información</p>
      </header>

      <section class={`preview-container ${!props.signatureHTML ? 'empty' : ''} ${props.isLoading ? 'loading' : ''}`}>
        <Show when={props.isLoading} fallback={
          <Show when={props.signatureHTML} fallback={
            <div class="preview-placeholder">
              <div class="preview-placeholder-icon">✉️</div>
              <p>Ingresa tu <strong>Nombre</strong> y <strong>Cargo</strong> para visualizar tu firma</p>
            </div>
          }>
            <div class="preview-signature-wrapper">
              <div class="signature-container" innerHTML={props.signatureHTML} />
            </div>
          </Show>
        }>
          <div class="spinner" aria-label="Cargando recursos..."></div>
        </Show>
      </section>
    </main>
  );
}