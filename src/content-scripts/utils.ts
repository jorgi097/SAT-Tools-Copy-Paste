export { getDomElement, DomElement } from '../utils/dom';

// Para compatibilidad con ejecuciones globales si fuera necesario
import { getDomElement, DomElement } from '../utils/dom';

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).getDomElement = getDomElement;
  (window as unknown as Record<string, unknown>).DomElement = DomElement;
}
