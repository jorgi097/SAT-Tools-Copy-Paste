function getDomElement(query) {
  return new Promise((resolve, reject) => {
    const checkElementExist = () => {
      const element = document.querySelector(query);
      if (element) {
        resolve(element);
      } else {
        setTimeout(checkElementExist, 200);
      }
    };

    checkElementExist();

    // Timeout para evitar que la promesa quede pendiente indefinidamente (Logging para depuración)
    setTimeout(() => {
      const element = document.querySelector(query);
      if (!element) {
        reject(new Error('No se pudieron encontrar los elementos'));
      }
    }, 1000 * 60);
  });
}

class DomElement {
  constructor(query) {
    this.query = query;
    this.element = null;
    this.elementPromise = getDomElement(this.query).then(element => {
      this.element = element;
      return element;
    });
  }

  getDomElement() {
    return this.elementPromise;
  }

  setValue(value) {
    return this.getDomElement().then(element => {
      element.value = value;
      element.dispatchEvent(new Event('input'));
      element.dispatchEvent(new Event('blur'));
    });
  }

  toUpperCase() {
    return this.getDomElement().then(element => {
      element.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
      });
    });
  }
}

