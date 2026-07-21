import { Show, createEffect, onCleanup } from 'solid-js';
import { StatusMessage } from '../types';

interface ModalProps {
  message: StatusMessage | null;
  onClose: () => void;
}

const ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export function Modal(props: ModalProps) {
  let modalContent: HTMLDivElement | undefined;
  let previousFocus: HTMLElement | null = null;
  let autoCloseTimer: ReturnType<typeof setTimeout> | undefined;

  createEffect(() => {
    if (!props.message) return;

    previousFocus = document.activeElement as HTMLElement;

    queueMicrotask(() => {
      const closeBtn = modalContent?.querySelector('.modal-close') as HTMLButtonElement;
      closeBtn?.focus();
    });

    if (props.message.type === 'success' || props.message.type === 'info') {
      autoCloseTimer = setTimeout(() => {
        props.onClose();
      }, 3000);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.onClose();
        return;
      }
      if (e.key === 'Tab' && modalContent) {
        const focusable = modalContent.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    onCleanup(() => {
      clearTimeout(autoCloseTimer);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
      previousFocus = null;
    });
  });

  const icon = () => props.message ? ICONS[props.message.type] || 'ℹ' : 'ℹ';

  return (
    <Show when={props.message}>
      <div class="modal-overlay" onClick={props.onClose} role="dialog" aria-modal="true" aria-label="Mensaje">
        <div class={`modal-content modal-${props.message!.type}`} onClick={(e) => e.stopPropagation()} ref={modalContent}>
          <div class={`modal-icon modal-icon-${props.message!.type}`}>
            {icon()}
          </div>
          <p id="modal-message">{props.message!.text}</p>
          <button type="button" class="modal-close" onClick={props.onClose} aria-label="Cerrar">
            Entendido
          </button>
        </div>
      </div>
    </Show>
  );
}
