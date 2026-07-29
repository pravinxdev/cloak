import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * On route change, scroll to top. If the location has a hash, smooth-scroll
 * to that element after the paint settles.
 */
export function useScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
}
