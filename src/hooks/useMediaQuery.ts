import { useEffect, useState } from 'react';

/**
 * Reageert op een CSS media query. Wordt gebruikt om de lay-out responsief
 * te maken: op brede schermen staan de panelen vast naast het canvas, op
 * smalle schermen (iPad portret / telefoon) schuiven ze als lade over het
 * canvas zodat alles binnen het scherm past.
 */
export const useMediaQuery = (query: string): boolean => {
  const get = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(get);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};
