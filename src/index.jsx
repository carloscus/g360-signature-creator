import { render } from 'solid-js/web';
import { ErrorBoundary } from 'solid-js';
import { App } from './components/App';
import './index.css';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => (
  <ErrorBoundary fallback={<div>¡Ups! Algo salió mal.</div>}>
    <App />
  </ErrorBoundary>
), root);
