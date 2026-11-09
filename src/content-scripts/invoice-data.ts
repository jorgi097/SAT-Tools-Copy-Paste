import { getDomElement } from '../utils/dom';

getDomElement<HTMLInputElement>('#\\31 35textboxautocomplete113').then(element => {
  element.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target) {
      target.value = target.value.toUpperCase();
    }
  });
});
