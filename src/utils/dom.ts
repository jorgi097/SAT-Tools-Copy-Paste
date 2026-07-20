export function getDomElement<T extends HTMLElement = HTMLElement>(query: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const checkElementExist = () => {
      const element = document.querySelector(query) as T | null;
      if (element) {
        resolve(element);
      } else {
        setTimeout(checkElementExist, 200);
      }
    };

    checkElementExist();

    // Timeout para evitar que la promesa quede pendiente indefinidamente
    setTimeout(() => {
      const element = document.querySelector(query) as T | null;
      if (!element) {
        reject(new Error(`No se pudo encontrar el elemento: ${query}`));
      }
    }, 1000 * 60);
  });
}

export class DomElement {
  query: string;
  element: HTMLElement | null = null;
  elementPromise: Promise<HTMLElement>;

  constructor(query: string) {
    this.query = query;
    this.elementPromise = getDomElement(this.query).then(element => {
      this.element = element;
      return element;
    });
  }

  getDomElement(): Promise<HTMLElement> {
    return this.elementPromise;
  }

  setValue(value: string): Promise<void> {
    return this.getDomElement().then(element => {
      (element as HTMLInputElement).value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
    });
  }

  toUpperCase(): Promise<void> {
    return this.getDomElement().then(element => {
      element.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target) {
          target.value = target.value.toUpperCase();
        }
      });
    });
  }
}
