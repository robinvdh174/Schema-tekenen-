import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/globals.css';

// iOS Safari legt soms een blauwe selectie-waas over het HELE canvas zodra je
// tikt of even vasthoudt: het behandelt het <canvas> als een afbeelding en
// "selecteert" die volledig. `user-select: none` in de CSS belet dat op iOS niet
// betrouwbaar voor zo'n element. Daarom annuleren we hier elke selectie die
// buiten een invoerveld begint — daar blijft selecteren/bewerken wél werken.
document.addEventListener(
  'selectstart',
  (e) => {
    const el = e.target as HTMLElement | null;
    if (el?.closest('input, textarea, select, [contenteditable="true"]')) return;
    e.preventDefault();
  },
  { capture: true }
);

const container = document.getElementById('root');
if (!container) throw new Error('Root container niet gevonden');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
